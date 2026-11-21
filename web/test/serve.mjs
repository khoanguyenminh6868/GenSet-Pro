// Server thử cho giao diện web: phục vụ web/ như Vercel (cleanUrls), thay /shim.js (Supabase) bằng DB giả trong bộ nhớ
// (web/test/fake-shim.js) nạp web/test/fixtures/seed.json. Không mạng, không token.
//   node web/test/serve.mjs [port]        (mặc định 4317; biến môi trường PORT cũng được)
// index.html phục vụ nguyên văn, chỉ bỏ thẻ <script> tải supabase-js từ CDN (shim giả không cần, và test không gọi mạng).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url)), WEB = path.resolve(HERE, "..");
const PORT = +(process.argv[2] || process.env.PORT || 4317);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".css": "text/css; charset=utf-8" };
export const SUPABASE_TAG = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/[^"]*"[^>]*><\/script>/;

export function indexHtml() {
  const s = fs.readFileSync(path.join(WEB, "index.html"), "utf8");
  if (!SUPABASE_TAG.test(s)) throw new Error("index.html: không thấy thẻ script supabase-js để bỏ");
  return s.replace(SUPABASE_TAG, "");
}

export function start(port = PORT) {
  const server = http.createServer((q, r) => {
    let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
    const send = (code, type, body) => { r.writeHead(code, { "content-type": type, "cache-control": "no-store" }); r.end(body); };
    try {
      if (p === "/" || p === "/index.html" || p === "/index") return send(200, TYPES[".html"], indexHtml());
      if (p === "/shim.js") return send(200, TYPES[".js"], fs.readFileSync(path.join(HERE, "fake-shim.js")));
      if (p === "/__test/seed.json") return send(200, TYPES[".json"], fs.readFileSync(path.join(HERE, "fixtures", "seed.json")));
      // Không phục vụ api/, test/, cấu hình: chỉ tệp tĩnh của trang.
      if (/^\/(api|test|supabase|node_modules)\//.test(p) || p.includes("..")) return send(404, "text/plain", "not found");
      const f = path.join(WEB, p);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return send(404, "text/plain", "not found");
      return send(200, TYPES[path.extname(f)] || "application/octet-stream", fs.readFileSync(f));
    } catch (e) { return send(500, "text/plain", String(e?.message || e)); }
  });
  return new Promise((res) => server.listen(port, "127.0.0.1", () => res(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().then(() => console.log(`GenBid server thử: http://127.0.0.1:${PORT}/`));
}
