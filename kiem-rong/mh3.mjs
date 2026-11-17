import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";
const N = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-mins-head/suppliers/config-bot.mjs").href + "?n");
const C = L.corpus();
for (const key of process.argv.slice(2)) {
  const e = C.get(key), { found } = L.sizesOfEntry(e), tp = N.technicalPart(e.text);
  console.log("=====", key, "sizes:", found.map((s) => s.cap.value + s.cap.unit).join(", "));
  const a = L.B.sizeBlocks(L.B.technicalPart(e.text), found), b = N.sizeBlocks(tp, found);
  const f = (x) => x.runs.map((r) => `[${r.size >= 0 ? found[r.size].cap.value : "?"}:${r.start + 1}-${r.to}]`).join(" ");
  console.log("old", f(a)); console.log("new", f(b));
  b.L.forEach((l, i) => { if (/xi\s?lanh|xy\s?lanh|xylanh|dung t[íi]ch|ti[êe]u hao|l[íi]t\s?\/\s?gi|l\/h|c[ôo]ng su[ấa]t (li[êe]n|d[ựu]|đ[ịi]nh)|y[êe]u c[ầa]u k[ỹy] thu[ậa]t/i.test(l) && l.length < 220) console.log(i + 1, l.trim().slice(0, 130)); });
}
process.exit(0);
