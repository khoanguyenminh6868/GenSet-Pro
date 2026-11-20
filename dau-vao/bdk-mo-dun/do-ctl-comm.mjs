// Đo yêu cầu truyền thông bộ điều khiển (mã ctl_comm) trên mọi gói:
//  (A) Phân tích đã lưu (doc-cache\analysis.json, technicalSpecs): dòng nào codesIn ra ctl_comm; tách chức năng con.
//  (B) Chữ HSMT (genbid-work\specs\<KEY>\text.txt): dòng có từ của chức năng con VÀ ở gần chữ "bộ điều khiển"/cổng.
//  (C) configmatch đã lưu: check ctl_comm của từng cấu hình, chức năng con nào "chưa rõ" / "không đạt".
// Chạy: node do-ctl-comm.mjs <thư mục repo> > do-ctl-comm.txt
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const repo = process.argv[2] || "C:/Projects/GenSet Pro/wt-bdk-mo-dun";
const W = "C:/Projects/GenSet Pro/genbid-work";
const RC = await import(pathToFileURL(path.join(repo, "suppliers/reqcodes.mjs")).href);
// Chức năng con (thứ tự = thứ tự in). Một dòng có thể thuộc nhiều chức năng.
const SUB = [
  ["4G/GSM/GPRS/SMS", /\b[345]G\b|\bLTE\b|\bGSM\b|GPRS|\bSMS\b|di\s*động|sim\b|cellular/i],
  ["Internet/web/IoT/cloud", /internet|\bweb\b|\bIoT\b|cloud|đám mây|mạng\s*(toàn cầu|wan)|qua\s*mạng|điện thoại thông minh|smartphone|app\b/i],
  ["Ethernet/LAN/TCP", /ethernet|\bLAN\b|\bTCP|RJ-?45/i],
  ["RS485", /RS-?485/i],
  ["RS232", /RS-?232/i],
  ["USB", /\bUSB\b/i],
  ["Modbus", /modbus/i],
  ["SNMP", /\bSNMP\b/i],
  ["BMS/SCADA", /\bBMS\b|SCADA|\bEMS\b/i],
  ["CAN/J1939", /\bCAN\b|J1939/i],
  ["Giám sát / điều khiển từ xa (chung)", /t[ừu]\s*xa|remote/i],
];
const COMM_RE = RC.CODE_BY.get("ctl_comm").words;
const subsOf = (t) => SUB.filter(([, re]) => re.test(t)).map(([n]) => n);
const out = [];
// (A)
const A = JSON.parse(fs.readFileSync(path.join(W, "doc-cache/analysis.json"), "utf8")).docs;
const cntA = new Map(), keysA = new Map();
let withComm = 0, total = 0;
for (const [k, doc] of Object.entries(A)) {
  const ts = (doc?.d || doc?.data || doc)?.result?.technicalSpecs || [];
  if (!ts.length) continue;
  total++;
  const lines = ts.filter((t) => COMM_RE.test(`${t.item || ""}: ${t.requirement || ""} ${t.quote || ""}`) && RC.codesIn(`${t.item || ""}: ${t.requirement || ""} ${t.quote || ""}`).some((c) => c.code === "ctl_comm"));
  if (!lines.length) continue;
  withComm++;
  const subs = new Set(lines.flatMap((t) => subsOf(`${t.item || ""} ${t.requirement || ""} ${t.quote || ""}`)));
  for (const s of subs) { cntA.set(s, (cntA.get(s) || 0) + 1); keysA.set(s, [...(keysA.get(s) || []), k]); }
}
out.push(`# (A) Phân tích đã lưu: ${total} gói có technicalSpecs, ${withComm} gói có dòng mã ctl_comm`);
for (const [n] of SUB) out.push(`- ${n}: ${cntA.get(n) || 0} gói`);
const net = new Set([...(keysA.get("4G/GSM/GPRS/SMS") || []), ...(keysA.get("Internet/web/IoT/cloud") || [])]);
const netEth = new Set([...net, ...(keysA.get("Ethernet/LAN/TCP") || [])]);
out.push(`- 4G hoặc Internet: ${net.size} gói; 4G / Internet / Ethernet (một trong ba): ${netEth.size} gói`);
out.push(`- ví dụ 4G: ${(keysA.get("4G/GSM/GPRS/SMS") || []).slice(0, 15).join(", ")}`);
out.push(`- ví dụ Internet: ${(keysA.get("Internet/web/IoT/cloud") || []).slice(0, 15).join(", ")}`);
// (B)
const S = path.join(W, "specs");
let nB = 0; const cntB = new Map();
for (const k of fs.readdirSync(S)) {
  const f = path.join(S, k, "text.txt");
  if (!fs.existsSync(f)) continue;
  nB++;
  // Lọc nhanh bằng chính regex của mã ctl_comm (codesIn chạy mọi mã trên mọi dòng: hàng giờ cho 1.507 HSMT).
  const lines = String(fs.readFileSync(f, "utf8")).split("\n").filter((l) => l.length < 400 && COMM_RE.test(l));
  const subs = new Set(lines.flatMap(subsOf));
  for (const s of subs) cntB.set(s, (cntB.get(s) || 0) + 1);
}
out.push("", `# (B) Chữ HSMT genbid-work\\specs: ${nB} gói (dòng < 400 ký tự có từ của ctl_comm; HSMT cả bộ nên có dòng ngoài bộ điều khiển)`);
for (const [n] of SUB) out.push(`- ${n}: ${cntB.get(n) || 0} gói`);
// (C)
const C = JSON.parse(fs.readFileSync(path.join(W, "doc-cache/configmatch.json"), "utf8")).docs;
out.push("", `# (C) configmatch đã lưu (bản chụp doc-cache, ${Object.keys(C).length} gói)`);
const cntC = new Map(); let cfgN = 0, cfgComm = 0;
for (const [k, doc] of Object.entries(C)) {
  const res = (doc?.d || doc)?.result || {};
  const req = (res.requirements || []).find((q) => q.code === "ctl_comm");
  if (!req) { out.push(`- ${k}: không có yêu cầu ctl_comm`); continue; }
  out.push(`- ${k}: yêu cầu ctl_comm, phần: ${(req.parts || []).map((p) => p.item).join("; ") || "(một khối)"}`);
  for (const cf of res.configs || []) {
    cfgN++;
    const ch = (cf.checks || []).find((c) => c.item === req.item || RC.codeOf(c) === "ctl_comm");
    if (!ch) { out.push(`    ${cf.engine?.model} | ${cf.controller?.model || "(không BĐK)"}: không có check`); continue; }
    cfgComm++;
    const bad = (ch.parts || []).filter((p) => p.status !== "met");
    for (const p of bad) { const s = subsOf(p.item).join(",") || p.item; cntC.set(`${p.status} ${s}`, (cntC.get(`${p.status} ${s}`) || 0) + 1); }
    out.push(`    ${cf.engine?.model} | ${cf.controller?.model || "(không BĐK)"}: ${ch.status} ${ch.offered || ""}${bad.length ? " | chưa đạt: " + bad.map((p) => `${p.item}=${p.status}`).join(", ") : ""}`);
  }
}
out.push("", `## Tổng (C): ${cfgN} cấu hình, ${cfgComm} có check ctl_comm. Phần chưa đạt theo chức năng con:`);
for (const [s, n] of [...cntC].sort((a, b) => b[1] - a[1])) out.push(`- ${s}: ${n}`);
console.log(out.join("\n"));
