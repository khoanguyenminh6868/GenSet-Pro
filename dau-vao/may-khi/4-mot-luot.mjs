// Chạy candidates cho MỘT lượt (như suppliers/do-gop.mjs) và in điểm + lý do của các dòng khớp chuỗi khoá.
//   node 4-mot-luot.mjs <thư mục code> <thông báo#ri> <chuỗi khoá> [--bidhist <tệp>]
// bidhist mặc định = genbid-work\doc-cache\bidhist.json (chữ HSMT, ngoài repo, không commit).
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [WT, LUOT, SUB] = process.argv.slice(2, 5);
const bh = process.argv.includes("--bidhist") ? process.argv[process.argv.indexOf("--bidhist") + 1] : "C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const [notify, ri0] = LUOT.split("#"), ri = Number(ri0 || 0);
const d = Object.values(J(bh).docs).map((x) => x.d).find((x) => x && x.notifyNo === notify);
const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
const found = B.sizesOf([kvaText, d.bidName], d.bidName);
const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
const rn = runs[ri];
const full = CAT.build(sups), cn = B.cnSuppliers(sups);
const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
const blocked = RF.blockedRows(sups, {});
const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
console.log("fuelHint", hints0.fuel, "cap", JSON.stringify(rn.cap), "all", R.all.length, "top", R.top.length);
for (const r of R.all) { const k = rowKey(r); if (k.includes(SUB)) console.log(r.score, k.slice(0, 80), "|", (r.why || []).join(" ; ").slice(0, 400)); }
