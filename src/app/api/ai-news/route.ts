import { NextResponse } from 'next/server';

export const revalidate = 86400; // Refresh every 24 hours

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  created_at: string;
  author: string;
  num_comments: number;
  _tags: string[];
}

const AI_KEYWORDS = [
  'artificial intelligence',
  'machine learning',
  'GPT',
  'LLM',
  'OpenAI',
  'Anthropic',
  'Gemini',
  'Claude',
  'ChatGPT',
  'deep learning',
  'neural network',
  'AI model',
];

// Assign a topic label from the title â maps to the 4 NeuralPulse tabs
function getCategory(title: string): string {
  const t = title.toLowerCase();
  // LLMs: foundation models, AI assistants, model releases
  if (
    t.includes('gpt') || t.includes('openai') || t.includes('chatgpt') ||
    t.includes('claude') || t.includes('anthropic') ||
    t.includes('gemini') || t.includes('google ai') || t.includes('deepmind') ||
    t.includes('llama') || t.includes('meta ai') ||
    t.includes('llm') || t.includes('language model') ||
    t.includes('mistral') || t.includes('hugging face') ||
    t.includes('open source model') || t.includes('fine-tun') ||
    t.includes('transformer') || t.includes('foundation model')
  ) return 'LLMs';
  // Startups: funding, acquisitions, new companies
  if (
    t.includes('startup') || t.includes('funding') || t.includes('raises') ||
    t.includes('raised') || t.includes('series a') || t.includes('series b') ||
    t.includes('series c') || t.includes('seed round') || t.includes('ipo') ||
    t.includes('acqui') || t.includes('invest') || t.includes('valuation') ||
    t.includes('venture') || t.includes('y combinator') || t.includes(' vc ')
  ) return 'Startups';
  // Products: launches, tools, apps, APIs, hardware
  if (
    t.includes('launch') || t.includes('release') || t.includes('new feature') ||
    t.includes('plugin') || t.includes('api ') || t.includes(' api') ||
    t.includes('app ') || t.includes('tool') || t.includes('product') ||
    t.includes('image generation') || t.includes('diffusion') || t.includes('midjourney') ||
    t.includes('gpu') || t.includes('nvidia') || t.includes('hardware') ||
    t.includes('chip') || t.includes('update') || t.includes('version')
  ) return 'Products';
  // Research: papers, benchmarks, breakthroughs, policy
  if (
    t.includes('research') || t.includes('paper') || t.includes('study') ||
    t.includes('arxiv') || t.includes('benchmark') || t.includes('breakthrough') ||
    t.includes('alignment') || t.includes('safety') || t.includes('bias') ||
    t.includes('regulation') || t.includes('law') || t.includes('policy') ||
    t.includes('science') || t.includes('experiment') || t.includes('finding')
  ) return 'Research';
  return 'General AI';
}

export async function GET() {
  try {
    const query = encodeURIComponent('AI artificial intelligence LLM machine learning');
    const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=40&numericFilters=points>5`;

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error('HN fetch failed');

    const data = await res.json();
    const hits: HNHit[] = data.hits || [];

    // Filter for AI-relevant articles and deduplicate
    const seen = new Set<string>();
    const items = hits
      .filter((hit) => {
        if (!hit.title || !hit.url) return false;
        const titleLower = hit.title.toLowerCase();
        return AI_KEYWORDS.some((kw) => titleLower.includes(kw.toLowerCase()));
      })
      .filter((hit) => {
        const key = hit.url || hit.objectID;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20)
      .map((hit) => ({
        id: hit.objectID,
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source: extractDomain(hit.url),
        category: getCategory(hit.title),
        points: hit.points,
        comments: hit.num_comments,
        time: formatTime(hit.created_at),
        rawTime: hit.created_at,
      }));

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('AI news fetch error:', err);
    // Return fallback static items so the sidebar is never empty
    return NextResponse.json(FALLBACK_NEWS, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }
}

function extractDomain(url: string | null): string {
  if (!url) return 'HN';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return 'web';
  }
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

const FALLBACK_NEWS = [
  { id: '1', title: 'OpenAI releases new model with improved reasoning capabilities', url: 'https://openai.com', source: 'openai.com', category: 'OpenAI', points: 450, comments: 312, time: '2h ago' },
  { id: '2', title: 'Google DeepMind achieves breakthrough in protein structure prediction', url: 'https://deepmind.google', source: 'deepmind.google', category: 'Google AI', points: 380, comments: 190, time: '4h ago' },
  { id: '3', title: 'Meta releases Llama 3 with 400B parameter version', url: 'https://ai.meta.com', source: 'ai.meta.com', category: 'Meta AI', points: 520, comments: 405, time: '6h ago' },
  { id: '4', title: 'Anthropic Claude 3.5 Sonnet tops MMLU benchmark scores', url: 'https://anthropic.com', source: 'anthropic.com', category: 'Anthropic', points: 290, comments: 175, time: '8h ago' },
  { id: '5', title: 'EU AI Act enforcement guidelines published â what it means for developers', url: 'https://europa.eu', source: 'europa.eu', category: 'Policy', points: 310, comments: 220, time: '10h ago' },
  { id: '6', title: 'NVIDIA H200 availability increases, prices drop 12% in spot markets', url: 'https://nvidia.com', source: 'nvidia.com', category: 'Hardware', points: 260, comments: 145, time: '12h ago' },
  { id: '7', title: 'Mistral releases new open-source model beating GPT-3.5', url: 'https://mistral.ai', source: 'mistral.ai', category: 'Open Source', points: 430, comments: 360, time: '14h ago' },
  { id: '8', title: 'AI coding assistants now handle 40% of commits at major tech firms', url: 'https://github.com', source: 'github.com', category: 'General AI', points: 198, comments: 142, time: '16h ago' },
];
