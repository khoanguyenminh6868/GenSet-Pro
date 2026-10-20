// Public Supabase settings for the browser (the anon key is meant to be public; access is enforced by RLS).
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-cache");
  res.json({ url: process.env.SUPABASE_URL || "", anonKey: process.env.SUPABASE_ANON_KEY || "", ai: !!process.env.ANTHROPIC_API_KEY });
}
