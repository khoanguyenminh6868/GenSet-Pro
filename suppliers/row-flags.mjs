// Cổng kiểm chất lượng theo DÒNG (việc "Chất lượng 1", Khoa chốt 18/11/2026): dòng lệnh + đưa cờ lên web. Luật gắn cờ ở
// row-flags-lib.mjs (config-bot.mjs import tệp đó để loại dòng khỏi candidates; tệp này import config-bot, nên KHÔNG
// được để config-bot import tệp này: import hai chiều có top-level await làm node thoát 13).
//   node suppliers/row-flags.mjs                     tóm tắt: theo lý do, theo NCC, NCC quá nửa bảng nghi
//   node suppliers/row-flags.mjs --list <lý do> [--id <NCC>]   liệt kê từng dòng bị gắn cờ (để soát hết, không lấy mẫu)
//   node suppliers/row-flags.mjs --json <tệp>        ghi toàn bộ danh sách
//   node suppliers/row-flags.mjs --post [--dry] [--out <tệp>]   đưa cờ lên web (rowflags/current), xem post() bên dưới
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import "./config-bot.mjs"; // nạp catalog.js / spec-norm.js và gọi useBot của row-flags-lib.mjs
import { flagRows, rowKey, overHalf, dropped, LEVEL, REASONS, webRows } from "./row-flags-lib.mjs";
export * from "./row-flags-lib.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const webDoc = (all) => ({ at: new Date().toISOString(), commit: process.env.GITHUB_SHA || "", rows: webRows(all) });
// node suppliers/row-flags.mjs --post [--dry] [--out <tệp>]: workflow supplier-publish.yml (SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY) ghi rowflags/current CHỈ khi danh sách dòng khác bản trên web (đổi updated_at làm mọi trang
// đang mở tải lại doc). --dry: không ghi; --out: ghi doc ra tệp để xem / thử màn hình.
export async function post(doc, dry, out) {
  if (out) fs.writeFileSync(out, JSON.stringify(doc, null, 1) + "\n", "utf8");
  console.log(`rowflags/current: ${doc.rows.length} dòng (${doc.rows.filter((r) => r.drop).length} bị loại), ${JSON.stringify(doc).length} byte${out ? `, đã ghi ${out}` : ""}`);
  const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (dry) return;
  if (!SB || !KEY) { console.log("Chưa đặt SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: không ghi."); return; }
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
  const r0 = await fetch(`${SB}/rest/v1/docs?coll=eq.rowflags&id=eq.current&select=data`, { headers: H });
  if (!r0.ok) { console.error(`Đọc rowflags/current: HTTP ${r0.status}: ${(await r0.text()).slice(0, 300)}`); process.exit(1); }
  const cur = (await r0.json())[0]?.data;
  if (cur && JSON.stringify(cur.rows) === JSON.stringify(doc.rows)) { console.log("Không đổi so với bản trên web: không ghi."); return; }
  const r = await fetch(`${SB}/rest/v1/docs`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ coll: "rowflags", id: "current", data: doc, updated_at: doc.at }]) });
  if (!r.ok) { console.error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`); process.exit(1); }
  console.log("đã ghi rowflags/current");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dir = path.join(ROOT, "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const { recs, flags, bySup } = flagRows(S);
  const argv = process.argv.slice(2), opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  const all = [...flags.entries()];
  if (argv.includes("--post")) await post(webDoc(all), argv.includes("--dry"), opt("--out"));
  else if (opt("--json")) {
    fs.writeFileSync(opt("--json"), JSON.stringify(all.map(([k, f]) => ({ key: k, supplierId: f.o.supplierId, n: f.o.n, table: f.o.table, row: f.o.row ?? null, kind: f.o.kind, model: f.o.model, line: f.o.line ?? null, drop: dropped(f), reasons: f.reasons })), null, 1) + "\n", "utf8");
    console.log(`đã ghi ${opt("--json")}: ${all.length} dòng`);
  } else if (opt("--list")) {
    const code = opt("--list"), id = opt("--id");
    for (const [, { o, reasons }] of all) for (const r of reasons) if (r.code === code && (!id || o.supplierId === id))
      console.log(`${o.supplierId} n${o.n} b${o.table} dòng ${o.row ?? "L"} ${o.kind} ${o.model} | ${r.detail} | P ${JSON.stringify(o.power)} | ${String(o.line ?? "(bảng nhãn)").slice(0, 220)}`);
  } else {
    const keys = new Set(recs.map(rowKey));
    console.log(`bản ghi ${recs.length} (khoá khác nhau ${keys.size}), bị gắn cờ ${flags.size}, trong đó bị loại (mức drop) ${all.filter(([, f]) => dropped(f)).length}`);
    const cnt = {};
    for (const [, { reasons }] of all) for (const c of new Set(reasons.map((r) => r.code))) cnt[c] = (cnt[c] || 0) + 1;
    for (const [c, n] of Object.entries(cnt)) console.log(`${String(n).padStart(6)}  ${c} (${LEVEL[c]})  ${REASONS[c]}`);
    console.log("\nTheo NCC (dòng bị cờ / bản ghi; bị loại; bảng nghi / bảng):");
    for (const [id, s] of [...bySup].filter(([, s]) => s.rows).sort((a, b) => b[1].rows - a[1].rows))
      console.log(`  ${id}: ${s.rows}/${s.recs}; loại ${s.drop}; ${s.flagged.size}/${s.tables.size} bảng; ${JSON.stringify(s.by)}`);
    console.log("\nNCC quá nửa số bảng bị nghi:");
    for (const x of overHalf(bySup)) console.log(`  ${x.id}: ${x.flagged}/${x.tables}`);
  }
}
