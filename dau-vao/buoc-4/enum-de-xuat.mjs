// Buoc 4 kiem ke, phan 3b: de xuat quy cach viet ve gia tri chuan (chi khi cung nghia ro rang; con lai "can Khoa xem").
// Doc enum-cach-viet.tsv. Chay: node enum-de-xuat.mjs → enum-de-xuat.tsv + tom tat so lan
import fs from "node:fs";
import path from "node:path";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const rows = fs.readFileSync(path.join(OUT, "enum-cach-viet.tsv"), "utf8").split("\n").slice(1).map((l) => l.split("\t"));
const X = "XEM";
// moi ham: (raw) → [gia tri chuan | "XEM", ly do]
const F = {
  "engine.aspiration": (s) => {
    const t = s.toLowerCase();
    const cut = /(\band|&|,|\bair)\s*$/.test(t.trim()) && !/air-to-air|air to air/.test(t);
    const turbo = /turbo|增压|涡轮|\blta\b|supercharg/.test(t), nat = /natural|自然/.test(t);
    const cool = /inter\s*-?cool|after\s*-?\s*cool|air[\s-]*to[\s-]*air|air[\s-]air|中冷|charge air cool|\blta\b|low-temperature|water\/air|air\/water|air\/air|air cooling|charge cooled|air cooled/.test(t);
    if (/non-?intercool|no-?intercool/.test(t)) return ["turbo", "ghi rõ không làm mát khí nạp"];
    if (/supercharg/.test(t)) return [X, "supercharged không chắc là turbo"];
    if (nat && !turbo) return ["natural", "tự nhiên / hút khí tự nhiên"];
    if (nat && turbo) return [X, "ghi cả natural và turbo"];
    if (turbo && cut) return [X, "chuỗi bị cắt ở 'and' / '&' / ',' (có thể mất 'Aftercooled'): lỗi đọc cắt ô, không đoán"];
    if (turbo && /valves|in-line|stroke/.test(t)) return [X, "ô dính nhiều thông số (xi lanh, van, làm mát); chọn theo chữ turbo / aftercooler: " + (cool ? "turbo_aftercooled" : "turbo")];
    if (turbo && cool) return ["turbo_aftercooled", "tăng áp + làm mát khí nạp (cùng nghĩa với same đã có: Turbocharged, Intercooled)"];
    if (turbo) return ["turbo", "tăng áp, không ghi làm mát khí nạp"];
    if (/after\s*-?cool/.test(t)) return [X, "chỉ ghi 'Aftercooled': không ghi tăng áp"];
    return [X, "không nhận ra"];
  },
  "engine.governor": (s) => {
    const t = s.toLowerCase();
    if (/common rail|unit pump|electronically-?\s*control|electronically controlled|electric unit pump/.test(t)) return [X, "là mô tả hệ thống phun (common rail / bơm) lọt vào cột điều tốc, không phải điều tốc"];
    if (/mechanical\s*\/\s*electr|electr\w*\s*\/\s*m(echanic)?|electronic\s*\/\s*mechanical|mechanical\/ electrical|electric\/mechanical|electronic\/m$|电子\/机械/.test(t)) return [X, "ghi cả hai (tuỳ chọn hoặc ô dính): không chọn"];
    if (/ems2|ecu|ecm/.test(t) && !/electronic ecm|ecm electronic/.test(t)) return ["ecu", "ECU / ECM / EMS"];
    if (/electronic ecm|ecm electronic/.test(t)) return [X, "'Electronic ECM': vừa electronic vừa ECM"];
    if (/g-drive governor|byc p7100/.test(t)) return [X, "không nêu loại điều tốc rõ"];
    if (/mechanic|机械/.test(t)) return ["mechanical", "cơ khí (Mechanic / Mechanically / 机械调速)"];
    if (/electr|电子|efc|gac|lcs|quantum|woodward/.test(t)) return ["electronic", "điện tử / điện (Electric = Electrical đã có trong same)"];
    return [X, "không nhận ra"];
  },
  "alternator.insulation": (s) => {
    const t = s.trim();
    if (/ip\d\d.*\bor\b|\bor\b.*ip\d\d/i.test(t)) return [X, "ô ghi hai tổ hợp cách điện / IP (H /IP22 or F/IP21): không chọn"];
    if (/^\|/.test(t) || /excitation system/i.test(t)) { const m = t.match(/\|\s*(?:insulation (?:class|system)\s*\|\s*)?(?:class\s*)?([FH])\b/i); return m ? [m[1].toUpperCase(), "ô dính cả dòng bảng ('| Insulation class | H | ...'): lỗi đọc gộp ô, giá trị lấy theo chữ cạnh nhãn"] : [X, "ô dính"]; }
    if (/^h\s*\/\s*h$/i.test(t)) return ["H", "'H/H' = cấp cách điện / cấp nhiệt cùng H (nhãn 'Insulation class/temperature rise class')"];
    const m = t.match(/^(?:class\s*)?([FH])(?:\s*class)?$/i);
    return m ? [m[1].toUpperCase(), "Class H / H class"] : [X, "không nhận ra"];
  },
  "alternator.excitation": (s) => {
    const t = s.toLowerCase();
    if (/bearing/.test(t)) return [X, "ô dính 'Single bearing' (ổ đỡ) với kiểu kích từ: lỗi đọc gộp ô"];
    if (/pmg|permanent/.test(t)) return ["pmg", "PMG"];
    if (/arep/.test(t)) return ["arep", "AREP"];
    if (/shunt/.test(t)) return ["shunt", "shunt (kể cả 'Brushless, shunt-excited')"];
    if (/brushless|self|自励|无刷/.test(t)) return [X, "'Brushless / self-excited' chỉ kiểu không chổi than tự kích, KHÔNG chọn được shunt / AREP / PMG: cần Khoa quyết (thêm giá trị self_excited hay bỏ)"];
    return [X, "không nhận ra"];
  },
};
const t = ["truong\tcach_viet_nguon\tlan\tmodel\tncc\tgia_tri_hien_tai\tde_xuat\tly_do"];
const sum = {};
for (const r of rows) {
  const [k, raw, lan, model, ncc, cur, eo] = r;
  if (!F[k]) continue;
  const std = eo !== "(ngoai danh sach)";
  const [v, why] = std ? [eo, "đã khớp values / same"] : F[k](raw);
  const s = (sum[k] = sum[k] || { std: 0, auto: 0, xem: 0, total: 0, autoVals: {} });
  s.total += +lan;
  if (std) s.std += +lan; else if (v === X) s.xem += +lan; else { s.auto += +lan; s.autoVals[v] = (s.autoVals[v] || 0) + +lan; }
  t.push([k, raw, lan, model, ncc, cur, std ? "(giữ)" : v === X ? "cần Khoa xem" : v, why].join("\t"));
}
fs.writeFileSync(path.join(OUT, "enum-de-xuat.tsv"), t.join("\n"));
console.log(JSON.stringify(sum, null, 1));
