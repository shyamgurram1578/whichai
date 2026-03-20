import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
];

// ---- Minimal RSS/Atom parser (no external deps) ----
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\[CDATA\[)?([\\s\\S]*?)(?:\\]\]>)?<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractAtomHref(block: string): string | null {
  const match = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>(?:\s*<\/link>)?/i);
  return match ? match[1] : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function firstImageUrlFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function firstEnclosureOrMediaUrl(block: string): string | null {
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (media?.[1]) return media[1];

  const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\//i);
  if (enclosure?.[1]) return enclosure[1];

  return null;
}

interface RawItem {
  title: string;
  url: string;
  publishedAt: Date;
  summary?: string;
  imageUrl?: string | null;
}

function parseItems(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const blockRegex = /<(?:item|entry)[\\s>](.*?)<\/(?:item|entry)>/gis;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xml)) !== null) {
    const rawBlock = match[1];
    const block = decodeEntities(rawBlock);

    const rawTitle = extractTag(block, 'title') || '';
    const rawLink = extractAtomHref(block) || extractTag(block, 'link') || '';
    const rawDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || '';

    const rawDescription =
      extractTag(block, 'description') ||
      extractTag(block, 'content:encoded') ||
      extractTag(block, 'content') ||
      '';

    const title = stripTags(rawTitle);
    const url = rawLink.trim();
    const publishedAt = rawDate ? new Date(rawDate) : new Date();

    const descriptionHtml = decodeEntities(rawDescription);
    const descriptionText = stripTags(descriptionHtml);
    const summary = descriptionText ? descriptionText.slice(0, 220) : undefined;

    const imageFromHtml = firstImageUrlFromHtml(descriptionHtml);
    const imageFromBlock = firstEnclosureOrMediaUrl(block);
    const imageUrl = imageFromHtml || imageFromBlock || null;

    if (title && url) {
      items.push({ title, url, publishedAt, summary, imageUrl });
    }
  }

  return items;
}

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return authHeader === `Bearer ${secret}`;
}

// "exactly" at 8pm local TX time (Chicago timezone). We'll schedule the cron twice a day
// (1-2 UTC) and only execute when the local hour is 20.
function shouldRunAt8pmChicago(date = new Date()): boolean {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    hour12: false,
  }).format(date);
  return Number(hourStr) === 20;
}

async function runRefresh() {
  if (!shouldRunAt8pmChicago()) {
    return { skipped: true as const };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalInserted = 0;
  const errors: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'whichai-news-bot/1.0' },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        errors.push(`${feed.source}: HTTP ${res.status}`);
        continue;
      }

      const xml = await res.text();
      const items = parseItems(xml);
      if (items.length === 0) continue;

      const rows = items.map((item) => ({
        title: item.title.slice(0, 500),
        url: item.url,
        source: feed.source,
        summary: item.summary ?? '',
        image_url: item.imageUrl ?? null,
        published_at: item.publishedAt.toISOString(),
      }));

      const { error, data } = await supabase
        .from('ai_news')
        .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
        .select('id');

      if (error) errors.push(`${feed.source}: ${error.message}`);
      else totalInserted += data?.length ?? 0;
    } catch (err) {
      errors.push(`${feed.source}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { skipped: false as const, totalInserted, errors };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { skipped, totalInserted, errors } = await runRefresh();

  return NextResponse.json({
    success: true,
    skipped,
    inserted: skipped ? 0 : totalInserted,
    errors: !skipped && errors?.length ? errors : undefined,
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { skipped, totalInserted, errors } = await runRefresh();

  return NextResponse.json({
    success: true,
    skipped,
    inserted: skipped ? 0 : totalInserted,
    errors: !skipped && errors?.length ? errors : undefined,
  });
}
