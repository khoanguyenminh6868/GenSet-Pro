// Spec tables that a supplier only shows as a picture: node suppliers/ocr-specs.mjs <id> <page url> <image url> [...]
// (pairs of the product page and the table image on it). Khoa, 2026-11-04: read them with the Tesseract already
// installed for the HSMT (ocr-pdf.js), but OCR misreads digits (6 ↔ 8 ↔ B, 5 ↔ S), so a line is kept only when code
// can check it:
// - it starts with a genset model (letters and digits),
// - it has two kW / kVA pairs whose kW is 0.8 × kVA (±1, the sheets round): the smaller is prime, the larger standby,
// - it names an engine model that the catalog already has from another supplier's text page (exact key),
// - an alternator code is kept only when the catalog knows it too.
// Every other figure of the line (fuel, size, weight...) is left out. Each image is saved as sources/<id>/<n>.md
// (n from 4001, "Via: OCR", with the whole OCR text below the kept lines), and its kept lines go to specTables of
// cn/<id>.json; merge-specs.mjs keeps them (n >= 2000) and verify.mjs checks each line against the saved file.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const TESSERACT = ["C:\\Program Files\\Tesseract-OCR\\tesseract.exe", path.join(process.env.LOCALAPPDATA || "", "Programs", "Tesseract-OCR", "tesseract.exe")].find((p) => fs.existsSync(p));
const TESSDATA = path.join(ROOT, "..", "..", ".genbid-tessdata-best");
const FIRST = 4001;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const HEADER = "| Genset model | Prime kW | Prime kVA | Standby kW | Standby kVA | Engine model | Alternator";

const [id, ...pairs] = process.argv.slice(2);
if (!id || !pairs.length || pairs.length % 2) { console.error("node suppliers/ocr-specs.mjs <id> <page url> <image url> [...]"); process.exit(2); }
if (!TESSERACT) { console.error("Không có Tesseract (C:\\Program Files\\Tesseract-OCR)."); process.exit(2); }
const recFile = path.join(ROOT, "cn", `${id}.json`);
const rec = JSON.parse(fs.readFileSync(recFile, "utf8"));

// Engine and alternator models the catalog knows from the other suppliers' text pages.
const others = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f !== `${id}.json`).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const cat = C.build(others);
const engines = new Map(cat.engines.map((e) => [e.key, e.model])), alternators = new Map(cat.alternators.map((a) => [a.key, a.model]));

const tess = (png) => execFileSync(TESSERACT, [png, "stdout", "-l", "eng", "--oem", "1", "--psm", "6", "--tessdata-dir", TESSDATA], { maxBuffer: 16 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
// Upscaled 2× (System.Drawing) before OCR: small table digits read better. A scanned PDF (datasheets/_scans.json)
// is drawn at 300 dpi in grey by pdftoppm (poppler), at most 8 pages.
function ocr(img) {
  if (/\.pdf$/i.test(img)) {
    execFileSync("pdftoppm", ["-r", "300", "-gray", "-png", "-l", "8", img, img.slice(0, -4)]);
    const dir = path.dirname(img), base = path.basename(img, ".pdf");
    return fs.readdirSync(dir).filter((f) => f.startsWith(base + "-") && f.endsWith(".png")).sort().map((f) => tess(path.join(dir, f))).join("\n");
  }
  // System.Drawing cannot open WebP (Made-in-China pictures): Tesseract reads it as it is.
  if (/\.webp$/i.test(img)) return tess(img);
  const big = img.replace(/\.\w+$/, "-x2.png");
  execFileSync("powershell", ["-NoProfile", "-Command", `Add-Type -AssemblyName System.Drawing; $s=[System.Drawing.Image]::FromFile('${img}'); $b=New-Object System.Drawing.Bitmap ($s.Width*2),($s.Height*2); $g=[System.Drawing.Graphics]::FromImage($b); $g.InterpolationMode='HighQualityBicubic'; $g.DrawImage($s,0,0,$b.Width,$b.Height); $b.Save('${big}',[System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose(); $s.Dispose()`]);
  return tess(big);
}

const num = (s) => (/^\d+(\.\d+)?$/.test(s) ? Number(s) : null);
// kW = 0.8 × kVA: a whole kW is rounded (188 kVA → 150 kW), a kW with decimals is exact (22 kVA → 17.6 kW).
// 2026-11-04: ±1 let "17.8" (OCR of 17.6) and a pair of other columns (1.131 / 2.6) through.
const isPair = (kw, kva) => kw != null && kva != null && kva > kw && Math.abs(kva * 0.8 - kw) <= (Number.isInteger(kw) ? 0.5 : 0.05);
export function keptLine(line) {
  // Cell rules ("|") and the bits of a page edge before the model (Koten: "£ KC30D5 | 24 | 30 ...") are not words.
  const all = line.replace(/\|/g, " ").trim().split(/\s+/).filter(Boolean);
  // Capitals, then digits (and a suffix such as D5): "M-w8s0" (OCR of M-W880) is dropped, not guessed.
  const MODEL = /^[A-Z]+(-[A-Z]+)?\d+([A-Z]+\d*)?(\([A-Z]\))?$/; // Sutong "ST-P9(S)": the silent type
  const at = all.findIndex((x, i) => i <= 2 && MODEL.test(x));
  if (at < 0) return null;
  const t = all.slice(at);
  if (t.length < 6) return null;
  // The model, then two kW / kVA pairs (either order within a pair), then the engine: a word or figure missing or
  // added by the OCR shifts the columns and the line is dropped.
  const found = [];
  for (const i of [1, 3]) {
    const a = num(t[i]), b = num(t[i + 1]);
    if (isPair(a, b)) found.push({ kW: a, kVA: b }); else if (isPair(b, a)) found.push({ kW: b, kVA: a }); else return null;
  }
  const [prime, standby] = found[0].kVA <= found[1].kVA ? found : [found[1], found[0]];
  if (prime.kVA === standby.kVA) return null;
  // The model names its kVA (Runda M-C660: 660 kVA standby; Koten KC30D5: 30 kVA prime): "M-CB60" (OCR of M-C660)
  // names neither.
  const named = Number(t[0].match(/\d+/)[0]);
  if (![prime.kVA, standby.kVA].some((v) => Math.abs(v - named) <= 1)) return null;
  // Written as the catalog writes the model: the OCR often drops the dot ("4B39-G11" for 4B3.9-G11), which the
  // catalog key leaves out anyway.
  const engine = engines.get(C.keyOf(t[5]));
  if (!engine) return null;
  const alt = alternators.get(C.keyOf(t.slice(6).find((x) => alternators.has(C.keyOf(x))) || "")) || "";
  return `| ${t[0]} | ${prime.kW} | ${prime.kVA} | ${standby.kW} | ${standby.kVA} | ${engine} | ${alt}`.replace(/ \| $/, " |");
}

const today = new Date().toISOString().slice(0, 10);
const dir = path.join(ROOT, "sources", id);
fs.mkdirSync(dir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ocr-specs-"));
// A run replaces the OCR sources of this record.
rec.sources = rec.sources.filter((s) => s.n < FIRST || s.n >= 5000);
rec.specTables = (rec.specTables || []).filter((t) => t.n < FIRST || t.n >= 5000);
for (const p of fs.readdirSync(dir)) if (/^4\d{3}\.md$/.test(p)) fs.rmSync(path.join(dir, p));
let n = FIRST, total = 0;
for (let i = 0; i < pairs.length; i += 2) {
  const page = pairs[i], url = pairs[i + 1];
  // A dropped connection is tried again twice (large PDFs on img.35cloud.cn).
  let buf = null;
  for (let k = 0; k < 3 && !buf; k++) {
    try { const r = await fetch(url, { headers: { "User-Agent": UA, Referer: page }, signal: AbortSignal.timeout(120000) }); if (!r.ok) { console.log(`${url}: HTTP ${r.status}`); break; } buf = Buffer.from(await r.arrayBuffer()); }
    catch (e) { if (k === 2) console.log(`${url}: ${e.message}`); }
  }
  if (!buf) continue;
  const img = path.join(tmp, `${n}${path.extname(new URL(url).pathname) || ".png"}`);
  fs.writeFileSync(img, buf);
  const text = ocr(img);
  const rows = [...new Set(text.split(/\r?\n/).map(keptLine).filter(Boolean))];
  const title = (text.split(/\r?\n/).find((l) => /powered\s+by|generator\s+set|genset|series/i.test(l)) || path.basename(url)).trim().slice(0, 120);
  console.log(`${path.basename(url)}: ${rows.length} dòng giữ / ${text.split(/\r?\n/).filter((l) => /\d/.test(l)).length} dòng có số`);
  // The same table under another file name (Koten: "Kofo Series(1).pdf" ... "(11).pdf") is kept once.
  if (!rows.length || rec.specTables.some((t) => t.n >= FIRST && t.n < 5000 && t.rows.join("\n") === rows.join("\n"))) continue;
  fs.writeFileSync(path.join(dir, `${n}.md`), [`URL: ${url}`, `Accessed: ${today}`, `Via: OCR (Tesseract 5, eng, ảnh trên trang ${page}); chỉ giữ dòng kiểm được bằng code (ocr-specs.mjs)`, "", title, HEADER, ...rows, "", "--- Toàn bộ chữ OCR (chưa kiểm) ---", text].join("\n"), "utf8");
  rec.sources.push({ n, url, accessedAt: today, tier: "A", quote: [rows[0]], file: `sources/${id}/${n}.md` });
  rec.specTables.push({ n, title, header: [HEADER], rows });
  total += rows.length; n++;
}
if (!rec.specTables.length) delete rec.specTables;
fs.writeFileSync(recFile, JSON.stringify(rec, null, 2) + "\n", "utf8");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${id}: ${n - FIRST} ảnh có dòng dùng được, ${total} dòng`);
