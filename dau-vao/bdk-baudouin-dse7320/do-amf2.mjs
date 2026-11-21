// bdk-loai VIỆC B: luật ATS cũ (mọi ATS / mất lưới trong phần kỹ thuật) ↔ mới (CM.amfWhy: gắn với bộ điều khiển máy phát,
// AMF nêu thẳng, bỏ gói bảo trì) trên MỌI HSMT genbid-work\specs\<TBMT>\text.txt. node do-amf2.mjs <gốc repo> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(root, "suppliers", "ctl-module.mjs")).href);
const dir = "C:/Projects/GenSet Pro/genbid-work/specs";
const old = (t) => CM.AMF_RE.test(t) || CM.AMF_ABBR.test(t);
const name = (text) => (text.slice(0, 3000).match(/g[óo]i\s+th[ầa]u[^\n]{0,160}/i)?.[0] || "").replace(/\s+/g, " ");
const rows = [], n = { all: 0, ctl: 0, old: 0, neu: 0, oldCtl: 0, newCtl: 0, kept: 0, dropped: 0, added: 0, why: {} };
for (const k of fs.readdirSync(dir).sort()) {
  const f = path.join(dir, k, "text.txt");
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8"), tech = CB.technicalPart(text) || text;
  const ctl = /b[ộo]\s+đi[ềe]u\s+khi[ểe]n|controller/i.test(tech), o = old(tech), w = CM.amfWhy(tech, { head: text.slice(0, 3000) });
  n.all++; if (ctl) n.ctl++; if (o) { n.old++; if (ctl) n.oldCtl++; } if (w) { n.neu++; if (ctl) n.newCtl++; n.why[w.why] = (n.why[w.why] || 0) + 1; }
  const st = o && w ? "giữ" : o ? "bỏ" : w ? "thêm" : "";
  if (st === "giữ") n.kept++; else if (st === "bỏ") n.dropped++; else if (st === "thêm") n.added++;
  if (!st) continue;
  const first = o ? tech.split("\n").find((l) => old(l)) || "" : "";
  rows.push([k, ctl ? 1 : 0, st, w?.why || "", (w?.line || first).replace(/\s+/g, " ").slice(0, 200), name(text).slice(0, 160)].join("\t"));
}
fs.writeFileSync(out, ["TBMT\tco_bdk\ttrang_thai\tvi_sao\tdong\tten_goi", ...rows].join("\n"), "utf8");
console.log(JSON.stringify(n));
