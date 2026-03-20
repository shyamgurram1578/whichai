import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This route serves news already stored in supabase by refresh-news.
// Keep it stable so the widget isn't constantly fluctuating during the day.
export const revalidate = 600; // 10 minutes

type Category = 'All' | 'LLMs' | 'Research' | 'Products' | 'Safety' | 'Startups';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getCategory(title: string): Category {
  const text = title.toLowerCase();

  if (
    ['gpt', 'llm', 'language model', 'claude', 'gemini', 'mistral', 'llama', 'chatgpt', 'openai', 'anthropic'].some(
      (k) => text.includes(k)
    )
  )
    return 'LLMs';
  if (['research', 'paper', 'arxiv', 'study', 'dataset', 'benchmark', 'training'].some((k) => text.includes(k))) return 'Research';
  if (
    ['launch', 'release', 'product', 'app', 'api', 'tool', 'platform', 'service', 'feature', 'update'].some((k) =>
      text.includes(k)
    )
  )
    return 'Products';
  if (['safety', 'alignment', 'risk', 'regulation', 'ethics', 'bias', 'harm', 'policy'].some((k) => text.includes(k)))
    return 'Safety';
  if (['startup', 'funding', 'raise', 'series', 'venture', 'acquired', 'million', 'billion', 'invest'].some((k) => text.includes(k)))
    return 'Startups';

  return 'All';
}

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('ai_news')
    .select('id,title,url,source,image_url,published_at')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    articles: (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source,
      image_url: row.image_url,
      published_at: row.published_at,
      category: getCategory(row.title),
    })),
    cached: true,
    lastFetched: new Date().toISOString(),
  });
}
