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
  let page;
  try {
    const r = await fetch(base, { headers: { ...headers, Range: `${from}-${from + PAGE - 1}` } });
    if (!r.ok) return res.status(r.status === 401 ? 401 : 502).json({ error: `read ${r.status}` });
    page = await r.json();
  } catch (e) { return res.status(502).json({ error: e.message }); }
  res.setHeader("Cache-Control", "no-store");
  res.json(page.map((row) => ({ id: row.id, updated_at: row.updated_at, data: lite(row.data) })));
}
