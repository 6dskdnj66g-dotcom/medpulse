import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/core/database/supabase';
import { ALL_MEDICAL_SOURCES } from '@/features/library/services/medicalSources';

// ── Auth guard helper ─────────────────────────────────────────────────────────
async function verifyAdmin(req: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  const adminClient = createSupabaseAdmin();

  // Extract access token from cookie or Authorization header
  const accessToken =
    req.cookies.get('sb-access-token')?.value ??
    req.cookies.getAll().find(c => c.name.includes('auth-token'))?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return { authorized: false, error: 'Authentication required' };
  }

  const { data: { user }, error } = await adminClient.auth.getUser(accessToken);
  if (error || !user) {
    return { authorized: false, error: 'Invalid or expired session' };
  }

  // Check profile role
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}

// POST /api/admin/seed-sources
// Seeds all medical sources into Supabase database
export async function POST(req: NextRequest) {
  try {
    // ── Verify admin access ─────────────────────────────────────────────────
    const auth = await verifyAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const adminClient = createSupabaseAdmin();

    // Clear existing sources first
    await adminClient.from('medical_sources').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Prepare sources for insertion
    const sourcesToInsert = ALL_MEDICAL_SOURCES.map(source => ({
      name: source.name,
      abbreviation: source.abbreviation || null,
      url: source.url || null,
      type: source.type,
      specialty: source.specialty || null,
      impact_factor: source.impactFactor || null,
      region: source.region || 'global',
      language: source.language || 'english',
      open_access: source.openAccess || false,
      is_verified: true,
      is_active: true,
    }));

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < sourcesToInsert.length; i += batchSize) {
      const batch = sourcesToInsert.slice(i, i + batchSize);
      const { error } = await adminClient.from('medical_sources').insert(batch);
      if (error) throw error;
      inserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted} medical sources`,
      total: inserted,
    });
  } catch (_error) {
    console.error('Seed error:', _error);
    return NextResponse.json({ error: 'Failed to seed sources' }, { status: 500 });
  }
}

// GET /api/admin/seed-sources
// Get stats about seeded data
export async function GET() {
  try {
    const adminClient = createSupabaseAdmin();
    const { data: stats } = await adminClient.from('platform_stats').select('*').single();
    const { count } = await adminClient.from('medical_sources').select('*', { count: 'exact', head: true });

    return NextResponse.json({ stats, sourcesInDB: count });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}

