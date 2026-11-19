import fs from "node:fs";
const G = JSON.parse(fs.readFileSync("gop-goc.json")), H = JSON.parse(fs.readFileSync("gop-nhanh.json"));
const rows = fs.readFileSync("cmp-ef.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const dong = fs.readFileSync("cmp-dong.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const sp = (k) => k.split("|");
const tally = {}, out = [];
for (const [id, L, kind, s] of rows) {
  const full = dong.find((d) => d[0] === id && d[1] === (L === "F" ? "top: ra" : "top: vào") && d[5].startsWith(L) && d[2].startsWith(rows.find((r) => r[0] === id)[5].slice(0, 0)) && (L === "F" ? +d[3] === +s : +d[4] === +s));
  const g = G[id], h = H[id], gs = new Set(g.top), hs = new Set(h.top);
  const came = h.top.filter((k) => !gs.has(k)), went = g.top.filter((k) => !hs.has(k));
  const me = sp(full[2]);
  let why;
  if (kind === "hoà-điểm-biên") why = "hoà điểm ở biên: thứ tự dòng cùng điểm đổi";
  else if (L === "F") {
    const others = came.filter((k) => k !== full[2]);
    if (others.some((k) => sp(k)[0] === me[0])) why = "trần 4 dòng/NCC: dòng mới cùng NCC vào";
    else if (others.some((k) => sp(k)[1] === me[1])) why = "trần 3 dòng/động cơ: dòng mới cùng động cơ vào";
    else if (+s < h.topScore[h.topScore.length - 1]) why = "điểm dưới biên mới (dòng điểm cao hơn vào)";
    else why = "chỗ dành (12 dòng hãng TQ / hãng G7-G20) hoặc trần hãng: dòng khác vào";
  } else {
    const others = went.filter((k) => k !== full[2]);
    if (others.some((k) => sp(k)[0] === me[0])) why = "trần 4 dòng/NCC: dòng cùng NCC ra nhường chỗ";
    else if (others.some((k) => sp(k)[1] === me[1])) why = "trần 3 dòng/động cơ: dòng cùng động cơ ra";
    else if (+s > g.topScore[g.topScore.length - 1]) why = "điểm trên biên cũ, trước bị trần/chỗ dành chặn";
    else why = "chỗ dành (12 dòng hãng TQ / hãng G7-G20) hoặc trần hãng: dòng khác ra";
  }
  const c = `${L} ${why}`; tally[c] = (tally[c] || 0) + 1; out.push([id, L, why, s, full[2].slice(0, 100)].join("\t"));
}
fs.writeFileSync("cmp-ef.tsv", "luot\tlop\tvi-sao\tdiem\tkhoa\n" + out.join("\n") + "\n");
console.log(tally);
