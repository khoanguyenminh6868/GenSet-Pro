// (d) Mọi check chưa rõ / cần xác nhận (và mọi phần chưa rõ của check gộp BĐK) trên configmatch.json: nguồn đã lưu của CHÍNH
// cấu hình (bảng của dòng đã chọn + tờ hãng có fact của model) có DÒNG ỨNG VIÊN theo từ khoá không. Chỉ đọc.
// "Có dòng" = có dòng chứa từ khoá, CHƯA phải là dòng đó trả lời đúng yêu cầu. node dem-nguon.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog, cn = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8")));
const live = sups.filter((s) => s.status !== "incomplete"), cat = C.build(live), F = CB.modelFacts(cat, live), byId = new Map(sups.map((s) => [s.id, s]));
const list = JSON.parse(fs.readFileSync(new URL("./configmatch.json", import.meta.url), "utf8"));
const T = [ // tên, nguồn, từ khoá mục, từ khoá dòng
  ["Tiêu hao", "engine", /tiêu hao/i, /fuel consumption|consumption|油耗|L\/h|g\/kwh/i],
  ["Tốc độ quay", "engine", /tốc độ|vòng quay/i, /\b1[58]00\b.*(rpm|r\.?p\.?m|r\/min)|(rpm|r\.?p\.?m|r\/min|speed|转速).*\b1[58]00\b/i],
  ["Tần số", "engine+alternator", /tần số/i, /\b[56]0\s?hz\b|frequency.*\b[56]0\b/i],
  ["Công suất động cơ", "engine", /công suất.*động cơ/i, /\b(prp|esp|prime|stand-?by|gross|rated power)\b/i],
  ["Kiểu động cơ", "engine", /kiểu động cơ|loại động cơ/i, /4[- ]?stroke|four[- ]stroke|四冲程|四行程/i],
  ["Hệ thống phun / nhiên liệu", "engine", /phun|hệ thống nhiên liệu/i, /injection|common rail|喷射|电喷|高压共轨/i],
  ["Nhiên liệu", "engine", /nhiên liệu/i, /diesel|柴油/i],
  ["Làm mát", "engine", /làm mát/i, /cooling|liquid|水冷/i],
  ["Khí thải", "engine", /khí thải|phát thải/i, /emission|\btier\b|euro|stage [ivx0-9]|排放/i],
  ["Điều tốc", "engine", /điều tốc/i, /governor|调速/i],
  ["AVR / ổn áp", "alternator", /avr|ổn áp|điều chỉnh điện áp|điều áp/i, /\bavr\b|voltage regulation|稳压|调压/i],
  ["Tiêu chuẩn đầu phát", "alternator", /tiêu chuẩn/i, /iec ?60034|iso ?8528|nema|bs ?5000|bs ?5514/i],
  ["Cấp bảo vệ IP", "alternator", /\bip\b|cấp bảo vệ/i, /\bip ?[2-5]\d\b/i],
  ["Cách điện", "alternator", /cách điện/i, /insulation|class ?[hf]\b|绝缘/i],
  ["Công suất đầu phát", "alternator", /công suất.*đầu phát/i, /\bkva\b/i],
  ["Nhận tải", "engine+alternator", /nhận tải|bước tải|bước đóng tải/i, /load (step|acceptance)|step load|突加/i],
];
const CT = [ // phần của check gộp BĐK
  ["BĐK: quá / thấp tốc", /tốc độ|tốc/i, /over ?speed|under ?speed|\bspeed\b|\brpm\b/i],
  ["BĐK: áp suất dầu", /áp suất|dầu/i, /oil/i],
  ["BĐK: nhiệt độ", /nhiệt độ/i, /temperature|coolant/i],
  ["BĐK: ắc quy", /ắc ?quy|bình/i, /batter/i],
  ["BĐK: hệ số công suất", /hệ số công suất|cos/i, /power factor|\bpf\b/i],
  ["BĐK: quá dòng / ngắn mạch", /quá dòng|ngắn mạch|quá tải/i, /over ?current|short ?circuit|overload/i],
  ["BĐK: công suất ngược", /ngược/i, /reverse/i],
  ["BĐK: điện áp / tần số", /điện áp|tần số/i, /voltage|frequency|\bhz\b/i],
  ["BĐK: giờ chạy / nhật ký", /giờ|nhật ký|sự kiện|lưu/i, /hours|event log|data log|logging/i],
  ["BĐK: điều tốc", /điều tốc/i, /governor|speed control|droop/i],
];
const memo = new Map();
function linesOf(c, part) {
  const p = c[part]; if (!p?.model && !p?.src) return [];
  const k = `${part}|${p.model}|${p.src?.supplierId}|${p.src?.n}|${p.src?.kind}`;
  if (memo.has(k)) return memo.get(k);
  const refs = new Set(); if (p.src?.supplierId && p.src?.n != null) refs.add(`${p.src.supplierId}|${p.src.n}`);
  for (const f of F.get(`${part}:${C.keyOf(p.model)}`) || []) if (f.sheet || part === "controller") refs.add(`${f.supplierId}|${f.n}`);
  const out = [...(p.src?.quote ? String(p.src.quote).split(/\n/) : []), ...(p.src?.lines || []), ...(p.options || []).map((x) => (typeof x === "string" ? x : JSON.stringify(x)))];
  for (const r of refs) { const [id, n] = r.split("|"); for (const t of byId.get(id)?.specTables || []) if (String(t.n) === n) out.push(String(t.title || ""), ...(t.header || []), ...(t.rows || [])); }
  memo.set(k, out); return out;
}
const R = {}, add = (name, st, hit, l) => { const e = (R[name] = R[name] || { unclear: 0, confirm: 0, uHit: 0, cHit: 0, ex: new Set() }); e[st]++; if (hit) { e[st === "unclear" ? "uHit" : "cHit"]++; if (e.ex.size < 3) e.ex.add(String(l).replace(/\s+/g, " ").slice(0, 80)); } };
let total = 0, cfg = 0;
for (const d of list) for (const c of ((d.data || d).result || d.data || {}).configs || []) {
  cfg++;
  for (const x of c.checks || []) {
    if (x.status !== "unclear" && x.status !== "confirm") continue;
    total++;
    const parts = (x.parts || []).filter((y) => y.status === "unclear");
    if (x.part === "controller" && parts.length) {
      const L = linesOf(c, "controller");
      for (const y of parts) { const t = CT.find(([, a]) => a.test(y.item)); const name = t?.[0] || "BĐK: phần khác"; const l = t ? L.find((s) => t[2].test(s)) : null; add(name, "unclear", !!l, l); }
      continue;
    }
    const t = T.find(([, , a]) => a.test(x.item));
    if (!t) { add(`(khác, ${x.part})`, x.status, false); continue; }
    const L = t[1].split("+").flatMap((p) => linesOf(c, p)), l = L.find((s) => t[3].test(s));
    add(t[0], x.status, !!l, l);
  }
}
console.log(`cấu hình ${cfg}, check chưa rõ + xác nhận ${total}`);
for (const [k, e] of Object.entries(R).sort((a, b) => b[1].unclear + b[1].confirm - a[1].unclear - a[1].confirm)) console.log(`${k}\tchưa rõ ${e.unclear} (có dòng ${e.uHit})\txác nhận ${e.confirm} (có dòng ${e.cHit})\t${[...e.ex].join(" ¦ ")}`);
