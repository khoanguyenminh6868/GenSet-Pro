// Saves a source page as text: node suppliers/fetch-source.mjs <supplierId> <n> <url>
// The file starts with the URL and the date it was read; quotes in cn/<id>.json must be found in it (verify.mjs).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [id, n, url] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(id || "") || !/^\d+$/.test(n || "") || !/^https?:\/\//.test(url || "")) {
  console.error("usage: fetch-source.mjs <supplierId> <n> <url>");
  process.exit(2);
}
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "sources", id);
fs.mkdirSync(dir, { recursive: true });

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", deg: "°", times: "×", plusmn: "±", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", reg: "®", trade: "™", copy: "©" };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : entities[e.toLowerCase()] ?? m);
function htmlToText(html) {
  return decode(html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|table|section|article|dd|dt)>/gi, "\n")
    .replace(/<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " "))
    .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).filter(Boolean).join("\n");
}

const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", "Accept-Language": "en,zh-CN;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
if (!res.ok) { console.error(`HTTP ${res.status}`); process.exit(1); }
const buf = Buffer.from(await res.arrayBuffer());
const type = res.headers.get("content-type") || "";
let text;
if (type.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
  const tmp = path.join(dir, `${n}.pdf`);
  fs.writeFileSync(tmp, buf);
  text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20 }).toString("utf8");
  fs.unlinkSync(tmp);
} else {
  const head = buf.subarray(0, 4000).toString("latin1");
  const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
  let html;
  try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
  text = htmlToText(html);
}
const date = new Date().toISOString().slice(0, 10);
const file = path.join(dir, `${n}.md`);
fs.writeFileSync(file, `URL: ${res.url || url}\nAccessed: ${date}\n\n${text}\n`, "utf8");
console.log(`${file} ${text.length} chars`);
