// Hiện trạng dữ liệu hãng bộ điều khiển: mỗi bảng specTables (tiêu đề, số dòng) và các dòng nhắc mô-đun / phụ kiện
// truyền thông (DSE8xx, WebNet, Gateway, 4G, GSM, Ethernet, Modbus TCP, SNMP, WiFi, CM-xxx ComAp, SG-Gateway...).
// Chạy: node hang-bdk.mjs <thư mục repo> > hang-bdk.txt
import fs from "node:fs";
import path from "node:path";
const repo = process.argv[2] || ".";
const ids = ["deep-sea-electronics", "comap", "smartgen", "deif", "woodward", "datakom", "sices"];
const COMM = /webnet|gateway|\b4G\b|\bLTE\b|\bGSM\b|GPRS|ethernet|modbus\s*TCP|\bTCP\/IP\b|\bSNMP\b|wi-?fi|\bIoT\b|internet|cloud|remote\s*(monitor|communic)|web\s*server|\bDSE8[0-9]{2}\b|\bDSE85[0-9]\b|\bDSE89[0-9]\b|\bCM-?(4G|ethernet|GPRS|RS232)|InteliMains|WebSupervisor|AirGate|\bSG(485|232|UE|WIFI|4G)|\bGM-?\d|\bAWU\b|\bRMA\b/i;
for (const id of ids) {
  const f = path.join(repo, "suppliers/cn", id + ".json");
  if (!fs.existsSync(f)) { console.log(`# ${id}: không có hồ sơ`); continue; }
  const s = JSON.parse(fs.readFileSync(f, "utf8"));
  const tabs = s.specTables || [];
  console.log(`\n# ${id} (role ${s.role}) — ${tabs.length} bảng, ${(s.sources || []).length} nguồn`);
  for (const t of tabs) {
    const hits = t.rows.filter((l) => COMM.test(l));
    console.log(`## n${t.n} "${t.title}" — ${t.rows.length} dòng, ${hits.length} dòng truyền thông`);
    for (const l of hits.slice(0, 40)) console.log(`   ${l.slice(0, 200)}`);
  }
  const ctl = s.controllers || [];
  if (ctl.length) console.log(`  controllers[]: ${ctl.map((c) => c.model || c.text).join("; ").slice(0, 600)}`);
}
