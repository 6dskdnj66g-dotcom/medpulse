import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

// POST /api/visitors/log — Track a page visit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, page, referrer, user_id } = body;

    // Detect device type from user-agent
    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = /mobile/i.test(userAgent) ? 'mobile'
      : /tablet|ipad/i.test(userAgent) ? 'tablet'
      : 'desktop';

    // Get browser
    const browser = /chrome/i.test(userAgent) ? 'Chrome'
      : /safari/i.test(userAgent) ? 'Safari'
      : /firefox/i.test(userAgent) ? 'Firefox'
      : /edge/i.test(userAgent) ? 'Edge'
      : 'Other';

    // Get geo from Vercel headers
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    const admin = createSupabaseAdmin();
    await admin.from('visitor_logs').insert({
      session_id: session_id || crypto.randomUUID(),
      page: page || '/',
      referrer: referrer || null,
      country,
      city,
      device_type: deviceType,
      browser,
      is_registered: !!user_id,
      user_id: user_id || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    // Fail silently — visitor tracking should never break the app
    return NextResponse.json({ success: false });
  }
}

// GET /api/visitors/log — Admin stats
export async function GET(_req: NextRequest) {
  try {
    const admin = createSupabaseAdmin();
    const { data: stats } = await admin.from('platform_stats').select('*').single();

    const { data: recentVisits } = await admin
      .from('visitor_logs')
      .select('page, country, device_type, browser, is_registered, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // Pages breakdown
    const pageBreakdown = recentVisits?.reduce((acc: Record<string, number>, v) => {
      acc[v.page] = (acc[v.page] || 0) + 1;
      return acc;
    }, {}) || {};

    // Country breakdown
    const countryBreakdown = recentVisits?.reduce((acc: Record<string, number>, v) => {
      if (v.country) acc[v.country] = (acc[v.country] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({ stats, recentVisits, pageBreakdown, countryBreakdown });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get visitor stats' }, { status: 500 });
  }
}
