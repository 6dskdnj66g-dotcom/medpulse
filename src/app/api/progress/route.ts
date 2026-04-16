import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

// POST /api/progress — Save a learning session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, module, score, total, xp_earned, duration_seconds, specialty, difficulty, metadata } = body;

    if (!user_id || !module) {
      return NextResponse.json({ error: 'user_id and module are required' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const { data, error } = await admin.from('user_progress').insert({
      user_id,
      module,
      score: score || 0,
      total: total || 0,
      xp_earned: xp_earned || 0,
      duration_seconds: duration_seconds || 0,
      specialty: specialty || null,
      difficulty: difficulty || null,
      metadata: metadata || {},
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Progress save error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

// GET /api/progress?user_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');

  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  try {
    const admin = createSupabaseAdmin();

    const { data: sessions } = await admin
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: profile } = await admin
      .from('profiles')
      .select('xp, level, streak_days, last_active')
      .eq('id', user_id)
      .single();

    const totalAnswered = sessions?.reduce((a, s) => a + (s.total || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((a, s) => a + (s.score || 0), 0) || 0;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return NextResponse.json({
      profile,
      sessions: sessions || [],
      stats: { totalAnswered, totalCorrect, accuracy, sessionsCount: sessions?.length || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
