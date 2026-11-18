// Mỗi dòng RỜI all (nhánh trước freqIn → sau): freq của chính dòng ≠ freq HSMT yêu cầu? (candidates bỏ dòng có u.freq khác hints.freq)
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-lech-cot-11"; process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href); const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(WT + "/suppliers/cn").filter((f) => f.endsWith(".json")).sort().map((f) => J(WT + "/suppliers/cn/" + f)).filter((d) => d.status !== "incomplete");
const recFreq = new Map(); for (const s of sups) for (const u of CAT.fromSupplier(s, [])) { const k = s.id + "|" + CAT.keyOf(u.line || (u.lines?.rows || []).join(" ")); const set = recFreq.get(k) || new Set(); set.add(u.freq ?? null); recFreq.set(k, set); }
const hist = Object.values(J("C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/bidhist.json").docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const byNo = new Map(hist.map((d) => [d.notifyNo, d]));
const R = J("cmp30-b-vs-a.json"); const res = { ok: 0, bad: [], noRec: 0 }; const bySup = new Map();
for (const r of R) { const no = r.k.split("#")[0], ri = +r.k.split("#")[1]; const d = byNo.get(no); const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "); const found = B.sizesOf([kvaText, d.bidName], d.bidName); const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }]; const hf = B.hintsOf(d.config.text, "", runs[ri].sizing).freq;
  for (const x of r.allOut) { const p = x.split("|"); const k = p[0] + "|" + p.slice(3).join("|"); const set = recFreq.get(k); if (!set) { res.noRec++; continue; } const fs_ = [...set].filter((v) => v != null); if (hf && fs_.length && fs_.every((v) => v !== hf)) { res.ok++; bySup.set(p[0], (bySup.get(p[0]) || 0) + 1); } else res.bad.push(`${r.k} ${x.slice(0, 80)} bid=${hf} rec=${[...set]}`); } }
console.log("dòng rời all:", res.ok + res.bad.length + res.noRec, "| freq dòng ≠ freq HSMT (đúng luật):", res.ok, "| không khớp:", res.bad.length, "| không tra được bản ghi:", res.noRec);
console.log("theo NCC (đúng luật):", [...bySup].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s}:${n}`).join(" "));
console.log(res.bad.slice(0, 40).join("\n"));
