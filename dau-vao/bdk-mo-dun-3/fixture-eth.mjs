// Hồi quy IB2600603983 (fixture đóng băng): phần truyền thông + điểm của từng cấu hình, chạy check bằng code của <worktree>.
// node fixture-eth.mjs <worktree>
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { pathToFileURL } from "node:url";
const wt = path.resolve(process.argv[2]);
const CB = await import(pathToFileURL(path.join(wt, "suppliers", "config-bot.mjs")).href);
const t = fs.readFileSync(path.join(wt, "suppliers", "regress-config.test.mjs"), "utf8");
const d = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(wt, "suppliers/fixtures/runs/IB2600603983/config.input.json.gz"))));
// Same call as regress-config.test.mjs is not exported: approximate with the stored inputs.
const o = CB.check(d.result, { hsmtText: d.hsmtText, suppliers: d.suppliers, readWeb: () => null, origin: d.result.origin, basis: d.result.originBasis, sized: false, cap: d.meta?.cap });
CB.rankConfigs(o.result);
for (const c of o.result.configs) {
  const g = (c.checks || []).find((x) => (x.parts || []).length && /truyền thông|kết nối/i.test(x.item));
  console.log(`#${c.rank} ${c.engine?.model} | ${c.controller?.model}${c.controller?.modules ? " + " + c.controller.modules.map((m) => m.model).join("+") : ""} điểm ${JSON.stringify(CB.scoreOf(c, o.result.requirements))}`);
  if (g) console.log("   " + g.parts.map((p) => `${p.item}:${p.status}`).join(", "));
}
void t;
