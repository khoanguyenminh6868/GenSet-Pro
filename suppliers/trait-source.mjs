// Saves an official manufacturer page for engine-traits.json: node suppliers/trait-source.mjs <n> <url>
// -> suppliers/sources/engine-traits/<n>.md ("URL:" and "Accessed:" lines, then the page text); engine-traits.test.mjs finds each quote in it.
// Reads the page directly like fetch-source.mjs; HTTP 401 / 403 / 429 / 5xx, a network error or an almost empty page (built with
// JavaScript) -> Firecrawl (firecrawl.mjs, Khoa 17/11/2026: the fallback for a blocked public page, never a login or CAPTCHA page).
// Numbers: one block of 100 per make, see MAKE_BLOCK in engine-traits.test.mjs.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { htmlToText } from "./crawl-specs.mjs";
import * as FC from "./firecrawl.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const [n, url] = process.argv.slice(2);
if (!/^\d+$/.test(n || "") || !/^https?:\/\//.test(url || "")) { console.error("usage: trait-source.mjs <n> <url>"); process.exit(2); }
const dir = path.join(DIR, "sources", "engine-traits");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${n}.md`);
const date = new Date().toISOString().slice(0, 10);

let text = "", via = "", final = url, status = null, error = "";
try {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", "Accept-Language": "en,zh-CN;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  status = res.status; final = res.url || url;
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get("content-type") || "";
    if (type.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
      const tmp = path.join(dir, `${n}.pdf`);
      fs.writeFileSync(tmp, buf);
      try { text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8"); } catch (e) { error = String(e.message); }
      fs.unlinkSync(tmp);
    } else {
      const head = buf.subarray(0, 4000).toString("latin1");
      const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
      let html;
      try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
      text = htmlToText(html);
    }
  }
} catch (e) { error = String(e.message || e); }

if (FC.shouldRetry({ status, error, textLength: text ? text.length : null }) && FC.hasKey()) {
  try { const f = await FC.scrape(url); text = f.markdown; final = f.url; via = "firecrawl"; } catch (e) { console.error(`firecrawl: ${e.message}`); }
}
if (!text || text.length < 200) { console.error(`không lưu được ${url} (HTTP ${status ?? "-"} ${error})`); process.exit(1); }
fs.writeFileSync(file, `URL: ${final}\nAccessed: ${date}\n${via ? `Via: ${via}\n` : ""}\n${text}\n`, "utf8");
console.log(`${file} ${text.length} chars${via ? " (firecrawl)" : ""}`);
