// Rebuild the bidprice run folder of a stored bidprice/<key> (read-only on the web): prep (real code) with the bidhist
// snapshot of 12/11, then the agent's levels taken from the stored result as result.json. Check it and compare stats.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
process.env.GENBID_DOC_CACHE = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4cache");
const BB = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-test-t4/suppliers/bidprice-bot.mjs").href);
const snap = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap");
const hist = Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(path.join(snap, "bidhist.json"), "utf8")).docs).map(([id, v]) => [id, v.d]));
for (const key of process.argv.slice(2)) {
  const { bidprice, req } = JSON.parse(fs.readFileSync(path.join(snap, "bp", `${key}.json`), "utf8"));
  const stored = bidprice.result, dir = path.join(snap, "bprun", key);
  fs.rmSync(dir, { recursive: true, force: true });
  const info = await BB.prep({ ...req, key, notifyNo: key }, dir, hist, null, null);
  const sj = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8"));
  const ids = (l) => l.map((s) => `${s.key}|${s.lotNo || ""}`).join(",");
  console.log(key, "list same as stored:", ids(sj.list) === ids(stored.samples), sj.list.length, stored.samples.length, "prior", sj.prior.length, "fc", JSON.stringify(sj.fc));
  // The agent's answer, as it was: level, same, diff, quote per lot (unverified ones as the agent gave them).
  const result = { tender: stored.tender, notes: (stored.notes || []).filter((n) => !/^Phần kỹ thuật HSMT dài hơn/.test(n)),
    samples: stored.samples.map((s) => ({ id: sj.list.find((x) => `${x.key}|${x.lotNo || ""}` === `${s.key}|${s.lotNo || ""}`)?.id || s.id, level: s.unverified === "agent không xếp mức" ? undefined : s.level, same: s.same, diff: s.diff, quote: s.quote })) };
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(result, null, 1));
  const { result: out, problems } = BB.check(dir);
  const st = (s) => JSON.stringify({ basis: s.basis, levels: (s.levels || []).map((l) => [l.id, l.price]), n: s.n, same: s.same, close: s.close });
  console.log("  stats equal:", st(out.stats) === st(stored.stats), "\n   now ", st(out.stats), "\n   then", st(stored.stats), "\n  problems", problems.length, "byConfig", JSON.stringify(out.byConfig?.map((b) => [b.group, b.stats?.levels?.map((l) => l.price)])), "then", JSON.stringify(stored.byConfig?.map((b) => [b.group, b.stats?.levels?.map((l) => l.price)])));
}
