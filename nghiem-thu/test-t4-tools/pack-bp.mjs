// Pack the rebuilt bidprice run folders (build-bp.mjs) into the repo fixtures.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const R = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/fixtures/runs";
const { writeBundle } = await import(pathToFileURL(R + "/regress.mjs").href);
const snap = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap");
for (const key of process.argv.slice(2)) {
  const dir = path.join(snap, "bprun", key), at = JSON.parse(fs.readFileSync(path.join(snap, "bp", `${key}.json`), "utf8")).bidprice.at;
  const samples = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8")), result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  const f = path.join(R, key, "bidprice.input.json.gz");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  writeBundle(f, { from: { tender: key, bidpriceAt: at, samples: "bidprice-bot prep, bidhist doc-cache 2026-11-12 22:46", result: "mức agent xếp, lấy từ bidprice đã lưu" }, samples, result });
  console.log(key, fs.statSync(f).size);
}
