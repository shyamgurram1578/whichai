import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  // Optional: protect with a simple secret
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // This endpoint can be extended to fetch real news from RSS feeds or APIs
  // For now it returns the current news count as a health check
  const { count, error } = await supabase
    .from('ai_news')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'News refresh endpoint ready',
    current_articles: count,
    next_refresh: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/refresh-news',
    method: 'POST',
    description: 'Call via cron every 8 hours to refresh AI news',
  });
}
