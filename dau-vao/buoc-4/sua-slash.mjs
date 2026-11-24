// Tam: escape dau "/" tran trong cac regex literal cua an-xep2.mjs
import fs from "node:fs";
const f = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4/an-xep2.mjs";
const L = fs.readFileSync(f, "utf8").split("\n").map((l) => {
  const m = l.match(/^(  "[a-z_.0-9]+": \/\^)(.*)(\$\/,)$/);
  if (!m) return l;
  return m[1] + m[2].replace(/(?<!\\)\//g, "\\/") + m[3];
});
fs.writeFileSync(f, L.join("\n"));
