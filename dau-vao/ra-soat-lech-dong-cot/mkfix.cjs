// node mkfix.cjs <repo> <tệp ra>: xuất dòng thật (tiêu đề + dòng + công suất đọc được) cho test power-titles
const fs = require("fs");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, out] = process.argv.slice(2);
const { C, S } = load(repo);
const want = [
  ["elitech-power", "EPS20BNA-3B", "prime and standby in one unit written in the cells are no kVA / kW pair"],
  ["victory-generator", "| V70SC |", "the frequency and the first output are no pair"],
  ["mecca-power", "| MC22C |", "one sub-title naming both units under each rating"],
  ["weiman-fujian", "| GF-20 |", "a title naming both units over a line of ratings: two cells each"],
  ["sunkings", "SHX-1250-3", "a title followed by a blank title spans two cells"],
  ["yingtai-group", "| 250GF | 250 | 313 |", "titles that call a kVA a kW lose to two pairs at power factor 0.8"],
  ["bdadl-shanghai", "BDA-50GF", "kW and kVA under prime / standby sub-titles: the titles are not trusted"],
  ["kachai-hangzhou", "| SFW24D |", "kVA columns then kW columns, each prime and standby"],
  ["stone-power", "SM675E5", "a rating spelled wrong (STNADBY)"],
  ["zhengdian-zhengzhou", "| 24GF | 26.4 |", "Chinese rating words written with spaces"],
  ["xingguang-jiangsu", "XG-275GF", "a pair under a kW/kVA title that is prime and standby kW is left out"],
  ["tecnogen", "PK17MSX", "50 Hz columns before the 60 Hz ones"],
  ["huadong-yangzhou", "| HDC25 |", "rated is not prime"],
  ["acepow-fuan", "| APW-300 |", "the line of full titles under a line of ratings"],
  ["excel-power-ningde", "EP-VM250", "continuous is neither prime nor standby"],
  ["comappower", "| COM35B |", "kVA and kW written the wrong way round"],
  ["ettes-power", "EC-280N5", "electric output next to heat output"],
  ["legapower", "LG20.6IS5", "the consumption title is no output title"],
  ["honny-dongguan", "| HGM550E |", "four titled columns"],
  ["cgm-italia", "| 10P | | 10 |", "a blank first title"],
  ["huipu-power", "HP-C520", "prime and standby in a unit nobody wrote"],
  ["gordon-power", "GD-DS188", "a pair below power factor 0.7 is left out"],
  ["frs-shenyang", "| FRS-10P |", "264 g/kWh on a 10 kW set"],
];
const res = [];
for (const [sup, needle, why] of want) {
  const s = S.find((x) => x.id === sup); let hit = null;
  for (const o of C.fromSupplier(s)) if (o.row != null && String(o.line).includes(needle) && o.kind === "engine") { hit = o; break; }
  if (!hit) { console.log("KHÔNG THẤY", sup, needle); continue; }
  const t = s.specTables[hit.table];
  const fuel = (hit.specs.find((x) => x.key === "fuel") || {}).value ?? null;
  res.push({ supplier: sup, n: hit.n, why, title: t.title || "", header: t.header || [], row: hit.line, engine: hit.model, power: hit.power, ...(sup === "frs-shenyang" ? { fuel } : {}) });
  console.log(sup.padEnd(22), String(hit.line).slice(0, 70).padEnd(72), JSON.stringify(hit.power), sup === "frs-shenyang" ? "fuel " + fuel : "");
}
fs.writeFileSync(out, JSON.stringify(res, null, 1) + "\n", "utf8");
