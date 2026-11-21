// Đếm 82 bảng R1-G theo nhãn soát tay (xem tiêu đề + dòng mẫu từng bảng): T = tổ máy không mã động cơ,
// X = có mã động cơ trong ô nhưng bộ đọc bỏ sót, O = không phải tổ máy thường (đèn chiếu sáng, máy phát + bơm),
// A = đầu phát rời, E = động cơ rời. Khoá = ncc|chỉ số bảng (ti).
import fs from "node:fs";
const { hits, recs, status } = JSON.parse(fs.readFileSync("hits.json", "utf8"));
const L = {};
const set = (cls, sup, tis, why) => tis.forEach((ti) => (L[`${sup}|${ti}`] = { cls, why }));
set("T", "acepow-fuan", [6, 8, 9, 10, 14, 24, 47, 50, 51, 53, 57, 59, 61], "diesel, Prime | Standby kVA/kW");
set("T", "frs-shenyang", [6], "máy khí (NG), có xi lanh / dung tích / kích thước / khối lượng");
set("T", "frs-shenyang", [7, 8], "máy xăng nhỏ 2–5 kW");
set("T", "googol", [0, 2], "máy khí, Continuous Power (không là prime / standby)");
set("T", "googol", [8, 9, 10, 11, 12, 13, 14], "mã gộp động cơ + tổ máy (QTA20V-EG2950D), có xi lanh / dung tích");
set("T", "green-power-generators", [31], "PRP / LTP kVA, ô động cơ chỉ ghi hãng (KOHLER…)");
set("X", "green-power-generators", [16, 18, 27], "ô MOTORE có mã động cơ (12V 1600 G10F, KDW 702 (M), OC16 071A 02 81 (E)) nhưng không thành bản ghi");
set("O", "green-power-generators", [33, 34], "tháp đèn chiếu sáng");
set("T", "interpower-international", [1], "Prime / Standby kVA; tên trang ghi Baudouin");
set("T", "kangwo-xiamen", [3], "功率 KW KVA không ghi mức");
set("X", "lees-power", [31], "ô có mã động cơ MTU 8V4000 GS/L32 (máy khí)");
set("T", "superwatt-swt", [1, 23], "Prime / Standby kW/kVA, tần số, điện áp; tên trang ghi Kubota / Cummins");
set("T", "teksan", [0, 1, 3, 5], "Standby / Prime kVA+kW, pha, Hz, điện áp, cột Engine chỉ ghi hãng");
set("O", "vantek-jiangsu", [13], "máy phát + bơm chìm");
set("T", "vpower-hk", [0, 1], "máy khí / biogas, kWe (không mức)");
set("T", "westinpower", [19], "máy khí, kW + kVA, ô động cơ 'Liyu Engine' (chỉ hãng), xi lanh / dung tích");
set("T", "yingtai-jiangsu", [0, 7, 9, 13, 17, 22, 29], "主用 / 备用 kW+kVA, dòng điện, khối lượng, kích thước; hãng ở cột 品牌 hoặc tên trang");
set("T", "zc-power", [11, 12], "máy xăng xách tay 2–7,5 kW");
set("A", "eastern-lion-fuan", [58]); set("A", "gordon-power", [17]); set("A", "jet-power", [16]); set("A", "keliang-fuan", [4, 6]);
set("A", "landtop-fuzhou", [2, 3]); set("A", "lanzhou-electric", [0]); set("A", "longkai-power", [3]); set("A", "nenjo-generator", [0, 6]);
set("A", "shengfeng-fuan", [2, 4, 7]); set("A", "xinhengxin-fujian", [7, 9, 17]); set("A", "yihua-fujian", [4]); set("A", "yingtai-jiangsu", [27, 28]);
set("E", "kangjin-power", [0, 1]); set("E", "penlucky", [7, 8, 9]); set("E", "rise-power", [34]); set("E", "yingtai-jiangsu", [1, 34]); set("E", "zhengdian-zhengzhou", [2]);
console.log("bảng gắn nhãn:", Object.keys(L).length);
const inG = hits.filter((h) => L[`${h.sup}|${h.ti}`]);
const miss = Object.keys(L).filter((k) => !inG.some((h) => `${h.sup}|${h.ti}` === k));
if (miss.length) console.log("NHÃN KHÔNG CÓ DÒNG:", miss);
const by = {};
for (const h of inG) { const c = L[`${h.sup}|${h.ti}`].cls; (by[c] ||= []).push(h); }
const lv = (p) => Object.keys(p || {}).sort().join("+") || "(không)";
for (const [c, v] of Object.entries(by).sort()) {
  const sups = [...new Set(v.map((h) => h.sup))];
  console.log(`\n== ${c}: bảng ${new Set(v.map((h) => h.sup + "|" + h.ti)).size}, dòng ${v.length}, NCC ${sups.length}: ${sups.join(", ")}`);
  if (c !== "T") continue;
  const cnt = (f) => v.filter(f).length;
  const mức = {}; for (const h of v) mức[lv(h.power)] = (mức[lv(h.power)] || 0) + 1;
  console.log("  mức công suất:", JSON.stringify(mức));
  console.log("  có kVA:", cnt((h) => Object.values(h.power || {}).some((p) => p.kVA)), " có kW:", cnt((h) => Object.values(h.power || {}).some((p) => p.kW)), " có prime:", cnt((h) => h.power?.prime), " có tần số:", cnt((h) => h.freq), " có hãng động cơ (makesFor):", cnt((h) => h.makes?.length));
  const keys = {}; for (const h of v) for (const k of new Set(h.specs.map((x) => x.key))) keys[k] = (keys[k] || 0) + 1;
  console.log("  thông số (số dòng có):", JSON.stringify(Object.fromEntries(Object.entries(keys).sort((a, b) => b[1] - a[1]))));
  const mk = {}; for (const h of v) for (const m of h.makes || []) mk[`${m.name} (${m.via})`] = (mk[`${m.name} (${m.via})`] || 0) + 1;
  console.log("  hãng:", JSON.stringify(Object.fromEntries(Object.entries(mk).sort((a, b) => b[1] - a[1]))));
  for (const s of sups) {
    const r = recs[s] || {}, w = v.filter((h) => h.sup === s);
    const keyset = new Set(w.map((h) => h.genset.toUpperCase().replace(/\s+/g, "")));
    console.log(`  ${s.padEnd(26)} dòng ${String(w.length).padStart(4)} model khác ${String(keyset.size).padStart(4)} có công suất ${String(w.filter((h) => h.power && Object.keys(h.power).length).length).padStart(4)} | bản ghi động cơ khác của NCC: ${r.engine || 0}, đầu phát: ${r.alternator || 0} | ${status[s]?.status}`);
  }
}
// Mẫu dòng T không có công suất và dòng acepow 2–3 của bảng (bảng kích thước dính).
const T = by.T || [];
console.log("\nT không công suất, theo NCC:", JSON.stringify(T.filter((h) => !h.power || !Object.keys(h.power).length).reduce((a, h) => ((a[h.sup] = (a[h.sup] || 0) + 1), a), {})));
for (const h of T.filter((h) => h.sup === "acepow-fuan").slice(0, 6)) console.log("  acepow", h.ti, h.ri, h.line, "→", JSON.stringify(h.power), JSON.stringify(h.specs));
// Model tổ máy trùng giữa các NCC (khoá theo model không đủ, phải kèm NCC).
const own = new Map(); for (const h of T) { const k = h.genset.toUpperCase().replace(/[\s*]+/g, ""); if (!own.has(k)) own.set(k, new Set()); own.get(k).add(h.sup); }
const shared = [...own].filter(([, s]) => s.size > 1);
console.log("\nmodel tổ máy trùng chữ giữa ≥2 NCC (trong T):", shared.length, shared.slice(0, 10).map(([k, s]) => `${k}:${[...s].join("/")}`).join("; "));
fs.writeFileSync("t-rows.json", JSON.stringify(T));
