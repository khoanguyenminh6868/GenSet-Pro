// node do-19.mjs <worktree code> <thư mục cn dữ liệu> <analysis.json> <out.json>
// Ứng viên (candidates) cho riêng 19 gói có từ đặc thù (quet-tu-dac-thu.txt), như lech-cot-11\do-gop-rf.mjs (blocked =
// blockedRows(sups, {}), GENBID_SPEC_NORM=1), với hai chữ cho mỗi gói:
//   "hist": Chương V của lô lịch sử (bidhist config.text) — đúng chữ do-gop dùng (gói không có trong bidhist thì không có);
//   "hsmt": chữ HSMT cả bộ (genbid-work\specs\<k>\text.txt), không có thì dòng Phân tích (technicalSpecs) — gần chữ bot thật.
// Một tiến trình, chạy lần lượt gốc rồi nhánh (máy chỉ chịu 2 tiến trình đo cùng lúc).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, AN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa", SPECS = "C:/Projects/GenSet Pro/genbid-work/specs";
const KEYS = "IB2300023194 IB2300114016 IB2300230061 IB2400073077 IB2400100405 IB2400166974 IB2400216498 IB2400216847 IB2400285076 IB2400333932 IB2500039578 IB2500102600 IB2500189935 IB2500197652 IB2500340280 IB2500416364 IB2600362632 IB2600570346 IB2600612866".split(" ");
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {});
const hist = new Map(Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d?.config?.text && KEYS.includes(d.notifyNo)).map((d) => [d.notifyNo, d]));
const an = {};
for (const [id, d] of Object.entries(J(AN).docs)) an[id] = d.d?.result || d.d || d;
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
function catFor(origin, sync, partsOnly, brand) {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) {
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    cache.set(k, { cat, facts });
  }
  return cache.get(k);
}
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const out = {};
for (const key of KEYS) {
  const d = hist.get(key), a = an[key];
  const f = path.join(SPECS, key, "text.txt");
  const hsmt = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : (a?.technicalSpecs || []).map((r) => [r.item, r.quote || r.requirement].filter(Boolean).join(" | ")).join("\n");
  const name = d?.bidName || a?.keyInfo?.bidName || a?.keyInfo?.name || "";
  const kvaText = d ? (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ") : "";
  const found = B.sizesOf([kvaText, name], name);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([name, kvaText, a?.keyInfo?.generatorCapacity]), sizing: null }];
  for (const [kind, text] of [["hist", d?.config.text], ["hsmt", hsmt]]) {
    if (!text) continue;
    runs.forEach((rn, ri) => {
      const id = `${key}#${ri}|${kind}`;
      if (!rn.cap) { out[id] = { error: "không đọc được công suất" }; return; }
      try {
        const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
        const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
        const { cat, facts } = catFor(origin, sync, partsOnly, brand);
        const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
        out[id] = {
          cap: rn.cap, trait: hints0.trait ? { make: hints0.trait.engineMake, ctl: hints0.trait.controllers.map((c) => c.term) } : null,
          top: R.top.map(rowKey), topScore: R.top.map((r) => r.score), topMake: R.top.map((r) => r.e.make || ""), topWhy: R.top.map((r) => r.why.join("; ")),
          all: R.all.length, dropped: R.dropped.length, trait_dropped: R.dropped.filter((x) => x.ruled.includes("trait")).length,
        };
      } catch (e) { out[id] = { error: String(e.stack || e) }; }
    });
  }
  console.error(key, Object.keys(out).filter((k) => k.startsWith(key)).length);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length);
