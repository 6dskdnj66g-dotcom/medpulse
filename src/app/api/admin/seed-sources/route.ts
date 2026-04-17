import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { ALL_MEDICAL_SOURCES } from '@/lib/medicalSources';

// POST /api/admin/seed-sources
// Seeds all medical sources into Supabase database
export async function POST(_req: NextRequest) {
  try {
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
