import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient from @supabase/ssr so that sessions are stored in
// cookies (not localStorage). This makes the session visible to Next.js
// middleware and server components, fixing the post-login redirect loop.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
