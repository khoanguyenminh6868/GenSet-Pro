// node cylKeys.mjs <worktree code> <out.txt>: khoá lượt (như do-gop.mjs) có hints.minCyl, tức mọi lượt mà luật số đông số xi lanh
// (lech-cot-9) có thể đổi kết quả: candidates() chỉ gọi majorityOf khi HSMT đòi số xi lanh. Lượt khác đi đúng đường mã của main.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const hist = Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const keys = [];
let runs = 0, exact = 0;
for (const d of hist) {
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const rs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  rs.forEach((rn, ri) => {
    if (!rn.cap) return;
    runs++;
    const h = B.hintsOf(text, "", rn.sizing);
    if (h.minCyl) { keys.push(`${d.notifyNo}#${ri}`); if (h.cylExact) exact++; }
  });
}
fs.writeFileSync(OUT, keys.join(","));
console.error(`lượt: ${runs}; có minCyl: ${keys.length} (cylExact ${exact})`);
