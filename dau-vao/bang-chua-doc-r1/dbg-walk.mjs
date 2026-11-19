// Gỡ lỗi: in từng lượt đi của walkedSpecs cho một dòng. node dbg-walk.mjs <worktree> <ncc> <bảng ti> <dòng>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [WT, SID, TI, RI] = process.argv.slice(2);
let src = fs.readFileSync(path.join(WT, "web", "catalog.js"), "utf8");
src = src.replace("for (const m of mine) { reads.push(", "if (globalThis.__W) console.log('lượt', j0, c0, d, !!edge, 'anchored', anchored, 'miss', miss, JSON.stringify(mine.map((m) => m.key + '=' + m.value + '@' + m.c)));\n        for (const m of mine) { reads.push(");
src = src.replace("const at = new Map();\n    for (const m of [...got.values()]", "if (globalThis.__W) console.log('bad', [...bad]);\n    const at = new Map();\n    for (const m of [...got.values()]");
const box = { console }; box.globalThis = box; box.window = box;
vm.runInNewContext(src, box);
const C = box.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(path.join(WT, "suppliers", "cn", SID + ".json"), "utf8"));
s.specTables = s.specTables.map((t, i) => (i === +TI ? { ...t, rows: [t.rows[+RI]] } : { ...t, rows: [] }));
box.__W = true;
for (const o of C.fromSupplier(s)) console.log(o.kind, o.model, o.specs.map((x) => x.key + "=" + x.value).join("; "));
