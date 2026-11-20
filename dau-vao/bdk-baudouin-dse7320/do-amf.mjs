// bdk-amf (2): đo CM.needsAmf (ATS / mất lưới) trên MỌI HSMT ở genbid-work\specs\<TBMT>\text.txt, phần kỹ thuật (technicalPart).
// node do-amf.mjs <gốc repo> <out.tsv>: mỗi gói một dòng: TBMT, có chữ "bộ điều khiển", khớp, kiểu khớp, chữ quanh chỗ khớp,
// cờ gói bảo trì / vật tư (tên gói hoặc chữ quanh chỗ khớp) để soát tay.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(root, "suppliers", "ctl-module.mjs")).href);
const dir = "C:/Projects/GenSet Pro/genbid-work/specs";
const KIND = [["ATS", /\bATS\b/], ["chuyển nguồn tự động", /chuy[ểe]n\s+(?:đổi\s+)?ngu[ồo]n\s+t[ựu]\s+đ[ộo]ng/i], ["mất lưới", /m[ấa]t\s+(?:đi[ệe]n\s+)?l[ưu][ớo]i/i], ["AMF", /\bAMF\b/], ["mains failure", /mains\s+failure/i]];
const MAINT = /bảo\s+(?:dưỡng|trì)|sửa\s+chữa|thay\s+thế|vật\s+tư|phụ\s+tùng|đại\s+tu|cải\s+tạo|lắp\s+đặt\s+tủ/i;
const rows = [], count = { all: 0, ctl: 0, hit: 0, hitCtl: 0, kinds: {}, maint: 0 };
for (const k of fs.readdirSync(dir).sort()) {
  const f = path.join(dir, k, "text.txt");
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8"), tech = CB.technicalPart(text) || text;
  const ctl = /b[ộo]\s+đi[ềe]u\s+khi[ểe]n|controller/i.test(tech), hit = CM.needsAmf(tech);
  count.all++; if (ctl) count.ctl++;
  if (!hit) { rows.push([k, ctl ? 1 : 0, 0, "", "", ""].join("\t")); continue; }
  count.hit++; if (ctl) count.hitCtl++;
  const kinds = KIND.filter(([, re]) => re.test(tech)).map(([n]) => n);
  for (const n of kinds) count.kinds[n] = (count.kinds[n] || 0) + 1;
  const first = KIND.map(([, re]) => tech.match(re)).filter(Boolean).sort((a, b) => a.index - b.index)[0];
  const ctx = tech.slice(Math.max(0, first.index - 120), first.index + 120).replace(/\s+/g, " ");
  const head = text.slice(0, 3000).replace(/\s+/g, " ");
  const maint = MAINT.test(ctx) || /gói thầu[^.]{0,200}(bảo dưỡng|bảo trì|sửa chữa|vật tư|thay thế)/i.test(head);
  if (maint) count.maint++;
  rows.push([k, ctl ? 1 : 0, 1, kinds.join(","), ctx, maint ? "bảo trì/vật tư?" : ""].join("\t"));
}
fs.writeFileSync(out, ["TBMT\tco_bdk\tkhop\tkieu\tngu_canh\tco", ...rows].join("\n"), "utf8");
console.log(JSON.stringify(count));
