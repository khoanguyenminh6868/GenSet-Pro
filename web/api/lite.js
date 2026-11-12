// Light copies of large documents for the list (shim.js reads these instead of the whole collection): the page needs
// an analysis's status, key facts and highlights for every tender, but its technical specs (most of the 12 MB) only
// for the tender that is open, which it then reads whole. Read as the signed-in member, so the docs table's
// row-level security still decides who may read. GET ?coll=analysis[&from=N | &ids=a,b,...] -> up to 300 rows [{ id, updated_at, data }].
import { SB_URL } from "./_supabase.js";

// Spec rows that name the power: capacityOf in index.html reads the tender's power from them.
const POWER = /công suất|capacity|power|kva|kw/i, POWER_N = /\d\s*(kva|kw)\b/i;
const LITE = {
  analysis(d) {
    // Marked _lite even with nothing left out, so the page keeps it on the device like the others.
    const specs = d?.result?.technicalSpecs;
    if (!Array.isArray(specs)) return { ...d, _lite: true };
    const keep = specs.filter((x) => POWER.test(`${x?.item || ""} ${x?.requirement || ""}`) && POWER_N.test(String(x?.requirement || ""))).slice(0, 3);
    return { ...d, _lite: true, result: { ...d.result, technicalSpecs: keep } };
  },
};
// The same cut done inside Postgres (web/supabase/analysis-lite.sql, run once in the SQL editor): Vercel then reads only the
// light copy instead of every whole row (~17 MB of analysis, 82% of it technical specs) from Supabase. security_invoker, so
// row-level security still applies to the member's token. Until the view exists (PostgREST answers 404), or when it fails
// or answers something else than light rows (no right, an error, a network failure), the rows are read whole and cut here
// as before, and the view is left alone for 10 minutes so a request stays one fetch.
const VIEW = { analysis: "analysis_lite" };
let viewSkipUntil = 0;
// The view's keys come in Postgres's order; the cut above puts _lite last, so move it there and the JSON text is the same.
const lastLite = (d) => { const { _lite, ...rest } = d; return { ...rest, _lite: true }; };
const PAGE = 300;
const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const coll = String(req.query.coll || ""), lite = LITE[coll];
  if (!lite) return res.status(400).json({ error: "coll" });
  const ids = req.query.ids ? String(req.query.ids).split(",") : null;
  if (ids && (ids.length > PAGE || !ids.every((id) => ID_RE.test(id)))) return res.status(400).json({ error: "ids" });
  const headers = { apikey: process.env.SUPABASE_ANON_KEY, Authorization: req.headers.authorization || "" };
  const base = `${SB_URL}/rest/v1/docs?coll=eq.${coll}&select=id,updated_at,data&order=id${ids ? `&id=in.(${encodeURIComponent(ids.map((id) => `"${id}"`).join(","))})` : ""}`;
  // One page of PAGE rows in a fixed order (see readAll in shim.js), well under Vercel's 4.5 MB response limit.
  const from = Math.max(0, parseInt(req.query.from, 10) || 0);
  const range = `${from}-${from + PAGE - 1}`;
  if (VIEW[coll] && Date.now() >= viewSkipUntil) {
    let why;
    try {
      const url = `${SB_URL}/rest/v1/${VIEW[coll]}?select=id,updated_at,data&order=id${ids ? `&id=in.(${encodeURIComponent(ids.map((id) => `"${id}"`).join(","))})` : ""}`;
      const r = await fetch(url, { headers: { ...headers, Range: range } });
      if (r.status === 401) return res.status(401).json({ error: "read 401" });
      const rows = r.ok ? await r.json() : null;
      if (Array.isArray(rows) && rows.every((x) => x && typeof x.id === "string" && x.data && x.data._lite === true)) {
        res.setHeader("Cache-Control", "no-store");
        return res.json(rows.map((x) => ({ id: x.id, updated_at: x.updated_at, data: lastLite(x.data) })));
      }
      why = r.ok ? "not light rows" : `HTTP ${r.status}`;
    } catch (e) { why = e.message; }
    viewSkipUntil = Date.now() + 10 * 60e3;
    console.warn(`${VIEW[coll]}: ${why}; reading whole rows for 10 minutes`);
  }
  let page;
  try {
    const r = await fetch(base, { headers: { ...headers, Range: range } });
    if (!r.ok) return res.status(r.status === 401 ? 401 : 502).json({ error: `read ${r.status}` });
    page = await r.json();
  } catch (e) { return res.status(502).json({ error: e.message }); }
  res.setHeader("Cache-Control", "no-store");
  res.json(page.map((row) => ({ id: row.id, updated_at: row.updated_at, data: lite(row.data) })));
}
