// Tổng hợp ung-vien.json (+ check.json) → bảng theo nhóm thông số cho nghiệm thu, 10 ca ngẫu nhiên (hạt giống cố định)
// kèm dòng nguồn nguyên văn + dòng chữ HSMT của ngưỡng. In markdown ra stdout.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const U = JSON.parse(fs.readFileSync(path.join(HERE, "ung-vien.json"), "utf8"));
const K = JSON.parse(fs.readFileSync(path.join(HERE, "check.json"), "utf8"));
const hist = Object.fromEntries(Object.values(JSON.parse(fs.readFileSync(`${SNAP}/bidhist.json`, "utf8")).docs).map((x) => x.d).filter(Boolean).map((d) => [d.notifyNo, d]));
const sum = (a, f) => a.reduce((s, x) => s + (f(x) || 0), 0);
const add = (o, p) => { for (const [k, v] of Object.entries(p || {})) o[k] = (o[k] || 0) + v; return o; };
const R = U.runs, keys = new Set(R.map((r) => r.key));
const NAME = { "1": "Tất cả", fuel: "Tiêu hao (fuel)", disp: "Dung tích + đường kính×hành trình (disp)", other: "Còn lại: số xi lanh (other)" };
const NEED = { "1": ["minDisp", "maxDisp", "minCyl", "maxFuel", "maxFuel75", "maxFuel50"], fuel: ["maxFuel", "maxFuel75", "maxFuel50"], disp: ["minDisp", "maxDisp"], other: ["minCyl"] };
const L = [];
L.push(`Gói trong bộ lọc: ${U.packages}; lượt (gói × cỡ) chạy được: ${R.length} (${keys.size} gói); không đọc được công suất: ${U.noCap.length} lượt; lỗi: ${U.errors.length}.`, "");
L.push("| Nhóm bật | Lượt có ngưỡng của nhóm | Dòng bị loại (tắt → bật) | Được giữ lại | Mới bị loại | Dòng tiêu hao vượt (trừ điểm / loại, tắt → bật) | Lượt đổi tập 30 ứng viên | Dòng vào / ra 30 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
for (const v of U.vars) {
  const has = R.filter((r) => NEED[v].some((k) => r.limits[k] != null)), x = R.map((r) => r.v[v]);
  L.push(`| ${NAME[v]} | ${has.length} | ${sum(R, (r) => r.droppedA)} → ${sum(x, (y) => y.dropped)} | ${sum(x, (y) => y.kept)} ${JSON.stringify(x.reduce((o, y) => add(o, y.keptByRule), {}))} | ${sum(x, (y) => y.newly)} ${JSON.stringify(x.reduce((o, y) => add(o, y.newlyByRule), {}))} | ${sum(R, (r) => r.fuelOverA)} → ${sum(x, (y) => y.fuelOver)} | ${x.filter((y) => y.top30SetChanged).length} | ${sum(x, (y) => y.topIn)} / ${sum(x, (y) => y.topOut)} |`);
}
L.push("");
const bands = ["≤30 kVA", "31–100", "101–300", "301–700", "701–1500", ">1500"];
L.push("Theo dải công suất (lượt đổi tập 30 ứng viên; giữ lại / mới loại) từng nhóm:", "", `| Dải | Lượt | ${U.vars.map((v) => NAME[v]).join(" | ")} |`, `|---|---:|${U.vars.map(() => "---:").join("|")}|`);
for (const b of bands) { const x = R.filter((r) => r.band === b); L.push(`| ${b} | ${x.length} | ${U.vars.map((v) => `${x.filter((r) => r.v[v].top30SetChanged).length} (${sum(x, (r) => r.v[v].kept)} / ${sum(x, (r) => r.v[v].newly)})`).join(" | ")} |`); }
L.push("");
const why = {};
for (const s of U.samples) for (const k of s.skip || []) for (const w of k.why) why[`${k.key}: ${w}`] = (why[`${k.key}: ${w}`] || 0) + 1;
L.push(`Lý do không so (trên ${U.samples.length} mẫu ghi lại ở cờ "Tất cả", tối đa 2 dòng giữ lại + 2 dòng mới loại mỗi lượt): ${Object.entries(why).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("; ")}.`, "");
const cc = K.cases;
L.push(`Bước check: ${cc.length} lượt (${cc.filter((c) => c.src === "web").length} web như lưu, ${cc.filter((c) => c.src === "web-go-code").length} web đã gỡ check của code, ${cc.filter((c) => c.src === "fixture").length} đóng băng); tiêu chí đổi ${K.changes.length}; lượt đổi thứ hạng ${cc.filter((c) => c.rankChanged).length}; lượt đổi hạng 1 ${cc.filter((c) => c.top1Changed).length}; không chạy được ${K.skipped.length}: ${K.skipped.map((s) => `${s.tender}${s.size ? " " + s.size : ""} (${s.why})`).join("; ")}.`, "");
let seed = 20261114; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pool = U.samples.slice(), pick = [];
while (pool.length && pick.length < 10) pick.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
const RE = { disp: /dung\s*t[íi]ch\s*(xi|xy|đ[ộo]ng)/i, maxDisp: /dung\s*t[íi]ch\s*(xi|xy|đ[ộo]ng)/i, cyl: /s[ốo]\s*(xi|xy)\s*lanh|xilanh|xylanh/i, fuel: /ti[êe]u\s*hao/i, fuel75: /ti[êe]u\s*hao.*75\s*%|75\s*%.*ti[êe]u\s*hao/i, fuel50: /ti[êe]u\s*hao.*50\s*%|50\s*%.*ti[êe]u\s*hao/i };
pick.forEach((s, i) => {
  const rules = s.ruledBefore || s.ruledAfter || [];
  const text = hist[s.key]?.config?.text || "";
  const hl = [...new Set(rules.flatMap((r) => text.split("\n").filter((l) => RE[r]?.test(l) && /\d/.test(l)).slice(0, 2)))];
  L.push(`${i + 1}. **${s.kind}** — ${s.key} (${s.cap}; ngưỡng ${JSON.stringify(s.limits)}), luật ${rules.join(", ")}: ${s.supplierId} [${s.n}], động cơ ${s.engine}`);
  L.push(`   - Dòng nguồn: \`${String(s.line).slice(0, 300)}\``);
  if (s.header) L.push(`   - Tiêu đề: \`${String(s.header).slice(0, 300)}\``);
  if (s.title) L.push(`   - Tên bảng: \`${String(s.title).slice(0, 120)}\``);
  const seen = new Set();
  for (const k of (s.skip || []).filter((k) => rules.some((r) => (r === "maxDisp" ? "disp" : r) === k.key))) { const t = `${k.key}|${k.value}|${k.supplierId}`; if (seen.has(t) || seen.size >= 3) continue; seen.add(t); L.push(`   - Lớp chuẩn hoá: ${k.key} "${k.label}" = "${k.value}" (${k.supplierId}) → không so: ${k.why.join(", ")}${k.line && k.line !== s.line ? ` — dòng: \`${String(k.line).slice(0, 200)}\`` : ""}`); }
  for (const l of hl) L.push(`   - Chữ HSMT: "${l.slice(0, 250)}"`);
});
console.log(L.join("\n"));
