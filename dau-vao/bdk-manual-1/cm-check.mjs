// IB2600603983 (configmatch đã chụp): (1) chạy check với / không bảng manual 1016, so check bộ điều khiển của cấu hình DSE7320 MKII;
// (2) mỗi phần → dòng manual đề xuất, kiểm dòng có nguyên văn trong facts của DSE7320 MKII. node cm-check.mjs <worktree> <cm.json> <out.md>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, cmFile, out] = process.argv.slice(2);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const snap = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/dau-phat-hang-b";
const key = "IB2600603983", data = JSON.parse(fs.readFileSync(cmFile, "utf8"));
const cn = path.join(root, "suppliers", "cn");
const after = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const before = after.map((s) => (s.id === "deep-sea-electronics" ? { ...s, specTables: s.specTables.filter((t) => t.n !== 1016), sources: s.sources.filter((x) => x.n !== 1016) } : s));
const text = fs.readFileSync(path.join(snap, "hsmt", `${key}.txt`), "utf8");
const a = JSON.parse(fs.readFileSync(path.join(snap, "snap", "analysis.json"), "utf8"))[key]?.result;
const cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
const run = (sups) => {
  const result = JSON.parse(JSON.stringify(data.result || data));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap });
  CB.rankConfigs(o.result);
  return o.result.configs.map((c) => ({ m: `${c.engine?.model} + ${c.controller?.model}`, score: CB.scoreOf(c, o.result.requirements || []), ctl: (c.checks || []).filter((x) => x.part === "controller").map((x) => `${x.item}|${x.status}|${(x.parts || []).filter((p) => p.status === "met").length}/${(x.parts || []).length}`) }));
};
const b = run(before), c = run(after);
const lines = ["# So check đã lưu (không chạy lại agent)", `Giống hệt: ${JSON.stringify(b) === JSON.stringify(c)}`, ""];
for (const x of c) if (/7320 MKII/.test(x.m)) lines.push(`- ${x.m} (điểm ${x.score}): ${x.ctl.filter((s) => /Đo lường|Cảnh báo|Bảo vệ|Khởi động/.test(s)).join(" ; ")}`);
const facts = CB.modelFacts({ engines: [], alternators: [] }, after.filter((s) => s.role === "controller_maker")).get("controller:DSE7320MKII").filter((f) => f.n === 1016).map((f) => f.line);
const has = (q) => facts.find((l) => l === q) || facts.find((l) => l.startsWith(q)) || null;
const MAP = [
  ["Đo lường", "Số giờ vận hành máy", "dat", ["Engine Run Time"]], ["Đo lường", "Số lần khởi động máy", "dat", ["Number of Starts"]],
  ["Đo lường", "Công suất tác dụng, công suất biểu kiến", "dat", ["Generator Total Load (kW)", "Generator Total Load (kVA)"]], ["Đo lường", "Hệ số công suất", "dat", ["Generator Power Factor Average"]],
  ["Đo lường", "Tốc độ động cơ", "dat", ["Engine Speed"]], ["Đo lường", "Nhiệt độ nước làm mát", "dat", ["Coolant Temperature"]], ["Đo lường", "Điện áp acquy", "dat", ["Engine Battery Volts"]],
  ["Đo lường", "Mức nhiên liệu trong thùng chứa", "dat", ["Engine Fuel Level", "Flexible: Configured for Fuel Level Sensor"]],
  ["Đo lường", "Nhiệt độ, áp suất bôi trơn", "xac nhan: áp suất có sẵn; Oil Temperature* có dấu * (ECU)", ["Oil Pressure"]],
  ["Cảnh báo", "Nhật ký lỗi", "dat", ["The module maintains a log of past alarms"]], ["Cảnh báo", "Nhiệt độ nước làm mát cao", "dat", ["Coolant Temp High | The module detected"]],
  ["Cảnh báo", "Áp lực dầu nhớt thấp", "dat", ["Oil Pressure Low | the Low Oil Pressure Pre-Alarm"]], ["Cảnh báo", "Sự cố cảm biến áp suất nhớt", "dat", ["Oil Press Sender Fault"]],
  ["Cảnh báo", "Sự cố cảm biến nhiệt độ", "dat", ["Coolant Sender O/C"]], ["Cảnh báo", "Ắc quy yếu / điện áp DC cao/thấp", "dat", ["DC Battery High Voltage", "DC Battery Low Voltage"]],
  ["Cảnh báo", "Quá dòng / cắt tải khi quá tải", "dat", ["Gen Over Current", "kW Overload"]],
  ["Cảnh báo", "Mức nhiên liệu thấp / hết nhiên liệu", "xac nhan: có Fuel Level Low, manual không ghi hết nhiên liệu", ["Fuel Level Low"]],
  ["Bảo vệ", "Nhiệt độ nước làm mát cao", "dat", ["Coolant Temp High | The module detected"]], ["Bảo vệ", "Áp lực dầu nhớt thấp", "dat", ["Oil Pressure Low | the Low Oil Pressure Shutdown"]],
  ["Bảo vệ", "Vượt tốc", "dat", ["Engine Over Speed"]], ["Bảo vệ", "Tần số quá cao/quá thấp", "dat", ["Gen Over Frequency", "Gen Under Frequency"]], ["Bảo vệ", "Điện áp AC quá cao/quá thấp", "dat", ["Gen Over Voltage", "Gen Under Voltage"]],
  ["Bảo vệ", "Quá dòng", "dat", ["Gen Over Current"]], ["Bảo vệ", "Vượt công suất", "dat", ["kW Overload"]], ["Bảo vệ", "Phát ngược công suất", "dat", ["Gen Reverse Power"]], ["Bảo vệ", "Ngắn mạch", "dat", ["Gen Short Circuit"]],
  ["Bảo vệ", "Mức nước làm mát thấp", "giu chua ro: Low Coolant Warning là nhiệt độ thấp; Engine Coolant Level* qua ECU", []],
  ["Bảo vệ", "Sai lệch điện áp AC giữa các pha", "giu chua ro: manual chỉ nêu mất cân bằng DÒNG (Negative Phase Sequence)", []],
  ["Bảo vệ", "Lệch pha", "giu chua ro: có Gen Phase Seq Wrong (thứ tự pha), Negative Phase Sequence (dòng); cần chốt nghĩa", []],
  ["AMF", "Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc", "xac nhan: Frequency Adjust ở Running Editor, manual ghi có thể không có tuỳ cấu hình", []],
];
lines.push("", "# Phần → dòng manual [1016] (dự kiến khi agent chạy lại)", "", "| Mục | Phần | Kết luận | Dòng |", "|---|---|---|---|");
let miss = 0;
for (const [g, item, st, qs] of MAP) {
  const got = qs.map((q) => { const l = has(q); if (!l) miss++; return l ? `\`${l.replace(/\|/g, "\\|")}\`` : `THIẾU: ${q}`; });
  lines.push(`| ${g} | ${item} | ${st} | ${got.join("<br>")} |`);
}
lines.push("", `Dòng không tìm thấy: ${miss}`);
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log(lines.slice(0, 12).join("\n")); console.log("Dòng không tìm thấy:", miss);
