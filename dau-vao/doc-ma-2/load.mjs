import fs from "node:fs";
import path from "node:path";
export function loadWeb(dir) {
  const win = {};
  for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) {
    const p = path.join(dir, "web", f);
    if (fs.existsSync(p)) new Function("window", "module", fs.readFileSync(p, "utf8"))(win, undefined);
  }
  return win.GenbidCatalog;
}
export function loadSideOne(dir, id) {
  const C = loadWeb(dir);
  const s = JSON.parse(fs.readFileSync(path.join(dir, "suppliers", "cn", id + ".json"), "utf8"));
  return { C, s };
}
