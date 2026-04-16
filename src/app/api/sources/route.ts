import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

// GET /api/sources?type=journal&region=arab&specialty=Cardiology&q=search
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const region = searchParams.get('region');
  const specialty = searchParams.get('specialty');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const admin = createSupabaseAdmin();
    let query = admin.from('medical_sources').select('*', { count: 'exact' }).eq('is_active', true);

    if (type) query = query.eq('type', type);
    if (region) query = query.eq('region', region);
    if (specialty) query = query.ilike('specialty', `%${specialty}%`);
    if (q) query = query.or(`name.ilike.%${q}%,abbreviation.ilike.%${q}%`);

    query = query
      .order('impact_factor', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ data, total: count, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}
