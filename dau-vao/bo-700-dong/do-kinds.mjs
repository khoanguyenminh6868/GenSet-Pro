// ctlKinds đúng như bot gọi (modelsIn: ctlModelsIn), trước / sau, kèm từng dòng MỚI làm đổi loại, và soát bản ghi mới của catalog.
// node do-kinds.mjs <worktree> <ref>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, ref] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const { ctlModelsIn } = await import(pathToFileURL(path.join(SUP, "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(SUP, "ctl-module.mjs")).href);
const ids = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8"))).filter((r) => r.role === "controller_maker").map((r) => r.id);
const now = ids.map((id) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", `${id}.json`), "utf8")));
const old = ids.map((id) => JSON.parse(git("show", `${ref}:suppliers/cn/${id}.json`)));
const kinds = (l) => CM.ctlKinds(l, { modelsIn: ctlModelsIn });
const A = kinds(old), B = kinds(now);
const diff = [...new Set([...A.keys(), ...B.keys()])].filter((k) => A.get(k) !== B.get(k)).sort();
console.log(`khoá trước ${A.size}, sau ${B.size}, đổi ${diff.length}`);

// Dòng nào gây đổi: thử bỏ từng dòng mới của đúng model (chỉ các dòng nhắc model), xem loại có về như cũ không.
for (const m of diff) {
  console.log(`\n${m}: ${A.get(m) ?? "(trống)"} -> ${B.get(m) ?? "(trống)"}`);
  const causes = [];
  now.forEach((r, ri) => {
    const before = old[ri];
    (r.specTables || []).forEach((t, ti) => {
      const n0 = before.specTables?.[ti]?.rows.length ?? t.rows.length;
      for (let i = n0; i < t.rows.length; i++) {
        const near = t.rows.slice(Math.max(n0, i - 3), i + 1).join(" ");
        if (!ctlModelsIn(near).some((x) => x.toUpperCase().replace(/[^A-Z0-9]/g, "") === m)) continue;
        const one = { id: r.id, role: r.role, specTables: [{ n: t.n, title: "", header: [], rows: t.rows.slice(Math.max(n0, i - 3), i + 4) }] };
        const k = kinds([one]).get(m);
        if (k) causes.push(`${r.id}#${t.n} dòng ${i + 1} [${k}] ${t.rows[i].slice(0, 150)}`);
      }
    });
  });
  for (const c of [...new Set(causes)].slice(0, 8)) console.log("  ", c);
  if (causes.length > 8) console.log(`   ... ${causes.length} dòng`);
}
