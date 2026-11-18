// node row1.mjs <WT> <CN> <notifyNo> <runIdx> <regex rowKey>  — in các trường của dòng ứng viên khớp (điểm + lý do)
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [WT, CN, NO, RI, RX] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const lib = path.join(WT, "suppliers", "row-flags-lib.mjs"); const RF = fs.existsSync(lib) ? await import(pathToFileURL(lib).href) : null;
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF ? RF.blockedRows(sups, {}) : null;
const d = Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).find((d) => d && d.notifyNo === NO);
const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
const found = B.sizesOf([kvaText, d.bidName], d.bidName);
const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
const rn = runs[+RI];
const full = CAT.build(sups), cn = B.cnSuppliers(sups);
const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, ...(blocked ? { blocked } : {}) });
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const rx = new RegExp(RX);
for (const r of R.all) if (rx.test(rowKey(r))) { const { u, e, a, ...rest } = r; console.log(JSON.stringify({ score: r.score, ...rest }, (k, v) => (typeof v === "string" && v.length > 160 ? v.slice(0, 160) + "…" : v)).slice(0, 1500)); console.log("  u.power", JSON.stringify(u.power), "e.key", e.key, "e.specs", e.specs?.length); break; }
