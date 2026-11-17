// node revDiff.cjs <revP cũ> <revP mới>: in các lớp có ở bản mới mà bản cũ không có y hệt (bỏ số thứ tự), và mọi lớp MẤT.
const fs = require("fs");
const parse = (f) => fs.readFileSync(f, "utf8").split(/\n\n/).slice(1).map((b) => b.replace(/^#\d+ /, "").replace(/ ×\d+ \|/, " |"));
const [a, b] = process.argv.slice(2).map(parse), old = new Set(a);
const out = b.filter((x) => !old.has(x) || x.startsWith("MẤT"));
console.log("lớp mới / đổi / MẤT:", out.length, "trên", b.length, "| lớp cũ không còn:", a.filter((x) => !new Set(b).has(x)).length);
console.log(out.join("\n\n"));
