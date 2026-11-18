import fs from "node:fs";
const R = JSON.parse(fs.readFileSync("cmp30.json", "utf8"));
const sup = (k) => k.split("|")[0];
const tally = (name, f) => { const m = new Map(); for (const r of R) for (const x of f(r)) { const s = sup(Array.isArray(x) ? x[0] : x); m.set(s, (m.get(s) || 0) + 1); } console.log("\n" + name, [...m.values()].reduce((a, b) => a + b, 0)); console.log([...m].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([s, n]) => `${s}:${n}`).join("  ")); };
tally("top RA", (r) => r.out || []); tally("top VÀO", (r) => r.inn || []);
tally("all VÀO", (r) => r.allIn || []); tally("all RA", (r) => r.allOut || []); tally("all ĐỔI ĐIỂM", (r) => r.allScore || []);
tally("rowflag gốc", (r) => (r.rfA || []).filter((x) => !(r.rfB || []).includes(x))); tally("rowflag mới", (r) => (r.rfB || []).filter((x) => !(r.rfA || []).includes(x)));
const dr = R.filter((r) => r.dA !== r.dB).length; console.log("\nlượt đổi dropped:", dr);
console.log("lượt chỉ đổi all:", R.filter((r) => !(r.out?.length || r.inn?.length) && !r.orderDiff).length);
