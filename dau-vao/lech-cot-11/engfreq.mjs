// node engfreq.mjs — trạng thái tần số của từng động cơ (luật `freq` của candidates: ≥ 2 dòng có tần số và mọi dòng cùng một tần số) ở 3 bản catalog
import fs from "node:fs"; import path from "node:path";
const SP = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ""));
const load = (f) => { const win = {}; new Function("window", "module", fs.readFileSync(f, "utf8"))(win, undefined); return win.GenbidCatalog; };
const dir = path.join(process.cwd(), "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const state = (C) => { const full = C.build(sups); const m = new Map(); for (const e of full.engines) { const known = e.uses.map((u) => u.freq).filter(Boolean); const st = known.length >= 2 && known.every((f) => f === known[0]) ? "only" + known[0] : "ok"; const nof = e.uses.filter((u) => !u.freq); m.set(e.key, { st, nof: nof.map((u) => u.supplierId) , known: known.length }); } return m; };
const A = state(load(path.join(SP, "main-catalog.js"))), B = state(load(path.join(SP, "branch-before-freq.js"))), N = state(load(path.join(process.cwd(), "web", "catalog.js")));
const rep = (name, X, Y) => { const rows = []; for (const [k, y] of Y) { const x = X.get(k); if (y.st !== "ok" && (!x || x.st !== y.st)) rows.push([k, y.st, y.nof]); } console.log(`\n${name}: động cơ đổi sang "chỉ một tần số": ${rows.length}`); const by = new Map(); for (const [k, st, nof] of rows) for (const s of nof) { const kk = `${s}`; by.set(kk, (by.get(kk) || 0) + 1); } console.log(rows.map(([k, st, nof]) => `${k}:${st}(${nof.length} dòng không ghi tần số)`).join(" ")); console.log("dòng không ghi tần số theo NCC:", [...by].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s}:${n}`).join(" ")); };
rep("main → nhánh TRƯỚC sửa freqIn", A, B); rep("main → nhánh SAU sửa freqIn", A, N);
const solved = [...B].filter(([k, y]) => y.st !== "ok" && N.get(k)?.st === "ok" && A.get(k)?.st !== y.st).map(([k]) => k); console.log("\nđộng cơ HẾT bị luật freq nhờ sửa freqIn:", solved.join(" "));
