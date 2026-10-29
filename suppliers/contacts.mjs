// Fills `contacts` (e-mail, phone, WhatsApp, WeChat) of supplier records from their saved sources, no AI:
//   node suppliers/contacts.mjs [id ...] [--all] [--dry]
// Default: every distributor. Each contact keeps the source line it was read from as a quote of that source, so
// verify.mjs checks it word for word. On a list page (Stamford / Perkins distributor lists) only the lines of this
// company's entry are read; on any other page, lines with a label (Tel, Email, WhatsApp, 微信...) or a link.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm } from "./verify.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), DRY = args.includes("--dry"), ALL = args.includes("--all");
const ids = args.filter((a) => !a.startsWith("--"));

// List pages: where an entry starts (this company's name) and where the next one begins.
const LISTS = [
  { url: /stamford-avk\.com\/contact\/authorised-distributors/, end: /^Authorised (Distributor|Service Dealer)$/ },
  { url: /distributorlocator\.perkins\.com/, end: /^\d+\.\s/ },
];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const BAD_EMAIL = /\.(png|jpe?g|gif|svg|webp)$|@(example|sentry|wixpress|domain)\./i;
const PHONE = /\+?\(?\d[\d\s().-]{6,}\d/g;
const PHONE_LABEL = /(phone|tel\b|tel:|telephone|mobile|mob\b|cell|hotline|call us|电话|手机|热线|座机|联系方式)/i;
const FAX = /(fax|传真)/i;
const WA = /whats\s?app|wa\.me\//i, WC = /we\s?chat|微信|weixin/i;
const digits = (s) => s.replace(/\D/g, "");
// At least 9 digits: a local number without its area code ("、22218692") cannot be dialled from abroad.
const goodPhone = (p) => { const d = digits(p); return d.length >= 9 && d.length <= 16; };
// Same number with or without the country code (+86 / 0086).
const phoneKey = (v) => digits(v).replace(/^(00)?86(?=\d{10,})/, "");

function block(lines, rec, url) {
  const list = LISTS.find((l) => l.url.test(url));
  if (!list) return { lines, list: false };
  const names = [rec.names?.en, rec.names?.zh].filter(Boolean).map(norm);
  const i = lines.findIndex((l) => names.some((n) => norm(l).includes(n)));
  if (i < 0) return { lines: [], list: true };
  let j = i + 1;
  while (j < lines.length && !list.end.test(lines[j])) j++;
  return { lines: lines.slice(i, j), list: true };
}

// Each hit: { type, value, quote }: quote is the source line that holds the value and says what it is (a label alone on
// its line is quoted with the next line: verify.mjs reads the file with line breaks as spaces).
// A table cell flattened to one line ("电话：… 传真：… 电子邮箱：…") is cut before each label, so a fax number is not
// read as a phone; each piece is still a substring of the line, so it can be quoted.
const LABEL = /(?<![(\w])(?=(?:联系电话|电话|传真|电子邮箱|邮箱|手机|微信|whats\s?app|we\s?chat|tel|fax|phone|mobile|e-?mail)\s*[:：])/i;
function extract(rawLines, list, host) {
  const out = [], lines = rawLines.flatMap((l) => l.split(LABEL).map((x) => x.trim()).filter(Boolean));
  lines.forEach((l, i) => {
    const next = lines[i + 1] || "";
    const labelOnly = (re) => re.test(l) && l.replace(re, "").replace(/[\s:：|]/g, "").length === 0;
    for (const e of l.match(EMAIL) || []) if (!BAD_EMAIL.test(e) && !/^Web:/i.test(l) && !(host && e.toLowerCase().endsWith("@" + host))) out.push({ type: "email", value: e, quote: [l] });
    // WhatsApp / WeChat: value on the same line after the label, or alone on the next line.
    for (const [type, re] of [["whatsapp", WA], ["wechat", WC]]) {
      if (!re.test(l)) continue;
      const wa = type === "whatsapp" && l.match(/wa\.me\/(\d{7,})/);
      if (wa) { out.push({ type, value: wa[1], quote: [l] }); continue; }
      if (labelOnly(re) && next) { const v = next.match(PHONE)?.[0] || (type === "wechat" && /^[A-Za-z][\w-]{5,19}$/.test(next.trim()) ? next.trim() : null); if (v) out.push({ type, value: v.trim(), quote: [l + " " + next] }); continue; }
      const after = l.split(re).slice(1).join(" ");
      const v = after.match(PHONE)?.[0] || (type === "wechat" && (after.match(/[:：]\s*([A-Za-z][\w-]{5,19})\b/) || [])[1]);
      if (v && (type === "wechat" || goodPhone(v))) out.push({ type, value: v.trim(), quote: [l] });
    }
    if (WA.test(l) || WC.test(l) || FAX.test(l) && !PHONE_LABEL.test(l.replace(FAX, ""))) return;
    const tel = [...l.matchAll(/tel:([+\d][\d\s-]{6,})/gi)].map((m) => m[1].trim());
    const labelled = PHONE_LABEL.test(l), bare = list && /^[+\d\s().-]+$/.test(l.trim());
    if (labelled && labelOnly(PHONE_LABEL) && /^[+\d\s().-]+$/.test(next.trim()) && goodPhone(next)) { out.push({ type: "phone", value: next.trim(), quote: [l + " " + next] }); return; }
    if (!labelled && !bare && !tel.length) return;
    const text = l.replace(/\(tel:[^)]*\)/gi, " ").replace(/tel:[+\d][\d\s-]*/gi, " ");
    for (const p of text.match(PHONE) || []) if (goodPhone(p)) out.push({ type: "phone", value: p.trim().replace(/[).\s-]+$/, ""), quote: [l] });
  });
  return out;
}

const dir = path.join(ROOT, "cn");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
let changed = 0;
for (const f of files) {
  const file = path.join(dir, f), rec = JSON.parse(fs.readFileSync(file, "utf8"));
  if (ids.length ? !ids.includes(rec.id) : !ALL && rec.role !== "distributor") continue;
  const contacts = [], seen = new Map();
  // Pages saved for contacts (fetch-source.mjs <id> <n> <url>, n < 100) but not yet listed: added as sources when they
  // give a contact. The company's own site is tier C (self-description); a brand's distributor list is tier A.
  const sdir = path.join(ROOT, "sources", rec.id), listed = new Set((rec.sources || []).map((s) => s.file));
  const extra = (fs.existsSync(sdir) ? fs.readdirSync(sdir) : []).filter((f) => /^\d+\.md$/.test(f) && parseInt(f) < 100 && !listed.has(`sources/${rec.id}/${f}`)).map((f) => {
    const [u, a] = fs.readFileSync(path.join(sdir, f), "utf8").split("\n");
    const url = u.replace(/^URL:\s*/, "").trim();
    return { n: parseInt(f), url, accessedAt: a.replace(/^Accessed:\s*/, "").trim(), tier: LISTS.some((l) => l.url.test(url)) ? "A" : "C", quote: [], file: `sources/${rec.id}/${f}`, extra: true };
  });
  for (const s of [...(rec.sources || []), ...extra]) {
    if (s.n > 100) continue; // spec pages and datasheets: not contact pages
    const p = path.join(ROOT, s.file || "");
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n").slice(3).map((l) => l.trim()).filter(Boolean);
    const b = block(lines, rec, s.url);
    // A page on another company's site (cummins.com location page): its own address in the footer is not this company's.
    const host = (u) => (u || "").replace(/^https?:\/\/(www\.)?/i, "").split(/[/:]/)[0].toLowerCase();
    const own = rec.website && host(rec.website) === host(s.url);
    for (const c of extract(b.lines, b.list, b.list || own ? null : host(s.url))) {
      const key = c.type + ":" + (c.type === "email" ? c.value.toLowerCase() : phoneKey(c.value) || c.value);
      if (seen.has(key)) { const x = seen.get(key); if (!x.src.includes(s.n)) { x.src.push(s.n); addQuote(s, c.quote); } continue; }
      const x = { type: c.type, value: c.value, src: [s.n] };
      seen.set(key, x); contacts.push(x); addQuote(s, c.quote);
    }
  }
  rec.contacts = contacts;
  for (const s of extra) if (s.quote.length) { delete s.extra; rec.sources.push(s); }
  rec.sources.sort((a, b) => a.n - b.n);
  if (extra.some((s) => s.quote.length) && rec.sources.every((s) => s.tier === "C")) rec.confidence = "low";
  const order = { email: 0, phone: 1, whatsapp: 2, wechat: 3 };
  rec.contacts.sort((a, b) => order[a.type] - order[b.type]);
  console.log(`${rec.id}: ${rec.contacts.map((c) => `${c.type}=${c.value} [${c.src}]`).join(", ") || "—"}`);
  if (!DRY) { fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n", "utf8"); changed++; }
}
function addQuote(s, quote) {
  const qs = Array.isArray(s.quote) ? s.quote : [s.quote];
  for (const q of quote) if (!qs.some((x) => norm(x).includes(norm(q)))) qs.push(q);
  s.quote = qs;
}
if (!DRY) console.log(`\n${changed} bản ghi đã ghi`);
