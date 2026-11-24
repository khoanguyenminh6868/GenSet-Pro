// Thời gian CPU của CAT.build, đo xen kẽ gốc / sau, lấy trung vị; cỡ cn thô và gzip: node --expose-gc do-build.mjs <worktree> <ref> <số lượt> <out.json>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, ref, times, out] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const changed = new Set(git("diff", "--name-only", ref, "--", "suppliers/cn/").trim().split("\n").filter(Boolean).map((f) => path.basename(f)));
const files = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json"));
const nowText = files.map((f) => fs.readFileSync(path.join(SUP, "cn", f), "utf8"));
const oldText = files.map((f, i) => (changed.has(f) ? git("show", `${ref}:suppliers/cn/${f}`) : nowText[i]));
const cpu = (texts) => { const l = texts.map((t) => JSON.parse(t)); global.gc?.(); const s = process.cpuUsage(); C.build(l); const d = process.cpuUsage(s); return Math.round((d.user + d.system) / 1000); };
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const goc = [], sau = [];
for (let i = 0; i < +times; i++) { if (i % 2) { sau.push(cpu(nowText)); goc.push(cpu(oldText)); } else { goc.push(cpu(oldText)); sau.push(cpu(nowText)); } }
const raw = (l) => l.reduce((a, t) => a + Buffer.byteLength(t), 0), gz = (l) => l.reduce((a, t) => a + zlib.gzipSync(t).length, 0);
const r = { cpuMs: { goc, sau, trungViGoc: med(goc), trungViSau: med(sau) }, bytes: { rawGoc: raw(oldText), rawSau: raw(nowText), gzipGoc: gz(oldText), gzipSau: gz(nowText) } };
fs.writeFileSync(out, JSON.stringify(r, null, 1), "utf8");
console.log(JSON.stringify(r));
