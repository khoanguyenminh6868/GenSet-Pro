// Dựng lại bảng của specs/<id>.json bằng tablesOf hiện tại: node suppliers/rebuild-specs.mjs <id ...> [--cache <thư mục>] [--dry]
// Từng trang (n < 1000) của specs/: có tệp sources/<id>/<n>.md thì đọc tệp; không có thì tải lại URL của trang bằng get +
// htmlToText (đường cào sẵn có, tải trực tiếp, nghỉ 700 ms giữa hai trang) và lưu tệp vào sources/<id>/ (merge-specs xoá lại
// tệp của trang không được dùng) + --cache nếu có. Bảng của trang khác `tablesOf` của chữ trang thì thay tại chỗ (giữ vị trí,
// url, title). Lỗi tải một trang thì không ghi gì cho NCC đó. Sau đó chạy `node suppliers/merge-specs.mjs <id>`.
// Vì sao (mecca-specs, specs-dung-lai 24/11/2026): merge-specs xoá tệp nguồn của trang không được dùng, nên trang đó không bao giờ
// được dựng lại khi tablesOf đổi (#1105, #1110) và specs/ giữ bảng cũ → merge-specs đòi tệp đã xoá và chết ENOENT.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { get, htmlToText, tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const cacheAt = argv.indexOf("--cache");
const cache = cacheAt >= 0 ? argv[cacheAt + 1] : null;
const dry = argv.includes("--dry");
const ids = argv.filter((a, i) => !a.startsWith("--") && i !== cacheAt + 1);
const flat = (ts) => ts.flatMap((t) => [...t.header, ...t.rows]).join("\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function rebuild(id, { cache = null, dry = false, fetchPage = get } = {}) {
  const file = path.join(ROOT, "specs", `${id}.json`);
  const specs = JSON.parse(fs.readFileSync(file, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const pages = [...new Set(specs.filter((t) => t.n < 1000).map((t) => t.n))];
  const rebuilt = new Map(), fetched = [], failed = [];
  for (const n of pages) {
    const src = path.join(ROOT, "sources", id, `${n}.md`), c = cache && path.join(cache, id, `${n}.md`);
    const url = specs.find((t) => t.n === n).url;
    let raw = null;
    if (fs.existsSync(src)) raw = fs.readFileSync(src, "utf8");
    else if (c && fs.existsSync(c)) raw = fs.readFileSync(c, "utf8");
    else {
      try {
        const page = await fetchPage(url);
        raw = `URL: ${page.url}\nAccessed: ${today}\n\n${htmlToText(page.html)}\n`;
        fetched.push(n);
        await sleep(700);
      } catch (e) { failed.push(`${n}: ${e.message}`); continue; }
      if (c) { fs.mkdirSync(path.dirname(c), { recursive: true }); fs.writeFileSync(c, raw, "utf8"); }
    }
    const tables = tablesOf(raw.split("\n").slice(3).join("\n").replace(/\n$/, ""));
    const old = specs.filter((t) => t.n === n);
    if (flat(tables) !== flat(old)) rebuilt.set(n, tables);
  }
  const result = { id, pages: pages.length, fetched: fetched.length, changed: rebuilt.size, failed };
  if (failed.length || dry) return result;
  const out = [], done = new Set();
  for (const t of specs) {
    if (!rebuilt.has(t.n)) { out.push(t); continue; }
    if (done.has(t.n)) continue;
    done.add(t.n);
    for (const x of rebuilt.get(t.n)) { delete x.sheet; out.push({ n: t.n, url: t.url, title: t.title, ...x }); }
  }
  for (const n of fetched) {
    const body = cache ? fs.readFileSync(path.join(cache, id, `${n}.md`), "utf8") : null;
    if (body) { fs.mkdirSync(path.join(ROOT, "sources", id), { recursive: true }); fs.writeFileSync(path.join(ROOT, "sources", id, `${n}.md`), body, "utf8"); }
  }
  if (rebuilt.size) fs.writeFileSync(file, JSON.stringify(out, null, 1) + "\n", "utf8");
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const id of ids) console.log(JSON.stringify(await rebuild(id, { cache, dry })));
}
