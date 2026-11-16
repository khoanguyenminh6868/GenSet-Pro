// Đo đủ PR #786 trên mọi gói có phân tích của bản web, chia phần để chạy song song. Chỉ đọc web, không gọi agent.
// Mỗi gói: prep với cờ tắt và "1"; khác nhau thì thêm fuel, disp, other. So danh sách model ứng viên (models.json)
// và catalog.md (các dòng xếp, lý do loại / trừ điểm).
// node measure-full.mjs <worktree> <out> <shard> <shards>
import fs from "node:fs";
import path from "node:path";

const [W, OUT, SHARD, SHARDS] = process.argv.slice(2);
const k = Number(SHARD), K = Number(SHARDS);
const CB = await import(`file:///${W.replace(/\\/g, "/")}/suppliers/config-bot.mjs`);
const setFlag = (f) => { if (f === "off") delete process.env.GENBID_SPEC_NORM; else process.env.GENBID_SPEC_NORM = f; };
const cache = new Map(), cacheAll = new Map();
const doc = async (c, id) => { const key = `${c}/${id}`; if (!cache.has(key)) cache.set(key, await CB.doc(c, id).catch(() => null)); return cache.get(key); };
const allDocs = async (c) => { if (!cacheAll.has(c)) cacheAll.set(c, await CB.allDocs(c)); return cacheAll.get(c); };
const base = path.join(OUT, `shard-${k}`);
fs.mkdirSync(base, { recursive: true });
const memoDir = fs.mkdtempSync(path.join(base, "memo-"));

const all = (await allDocs("analysis")).filter((d) => d.data?.result).sort((a, b) => a.id.localeCompare(b.id));
const mine = all.filter((_, i) => i % K === k);
const rows = [], started = Date.now();
const readOne = (dir) => ({
  models: JSON.parse(fs.readFileSync(path.join(dir, "models.json"), "utf8")),
  cat: fs.readFileSync(path.join(dir, "catalog.md"), "utf8"),
});
for (const [i, a] of mine.entries()) {
  const key = a.id, row = { key, res: {} };
  try { await CB.hsmtTextOf(key, doc); } catch { row.skip = "không có chữ HSMT"; rows.push(row); continue; }
  try {
    for (const f of ["off", "1"]) {
      setFlag(f);
      const dir = path.join(base, "tmp", f);
      fs.rmSync(dir, { recursive: true, force: true });
      await CB.prep(key, dir, { bidName: a.data?.bidName || "" }, null, null, { doc, allDocs, memoDir, local: false });
      row.res[f] = readOne(dir);
    }
    if (row.res.off.cat !== row.res["1"].cat) for (const f of ["fuel", "disp", "other"]) {
      setFlag(f);
      const dir = path.join(base, "tmp", f);
      fs.rmSync(dir, { recursive: true, force: true });
      await CB.prep(key, dir, { bidName: a.data?.bidName || "" }, null, null, { doc, allDocs, memoDir, local: false });
      row.res[f] = readOne(dir);
    }
  } catch (e) { row.err = String(e.message).slice(0, 200); }
  // Keep only what the summary needs: model lists, and the catalog lines that differ from the flag-off catalog.
  if (row.res.off) {
    const offLines = new Set(row.res.off.cat.split("\n"));
    for (const f of Object.keys(row.res)) {
      const lines = row.res[f].cat.split("\n");
      row.res[f] = { models: row.res[f].models, ...(f === "off" ? {} : { onlyHere: lines.filter((l) => !offLines.has(l)).slice(0, 40), goneHere: [...offLines].filter((l) => !lines.includes(l)).slice(0, 40) }) };
    }
  }
  rows.push(row);
  if (i % 10 === 9) {
    fs.writeFileSync(path.join(base, "rows.json"), JSON.stringify(rows));
    console.log(`shard ${k}: ${i + 1}/${mine.length} gói, ${Math.round((Date.now() - started) / 60000)} phút`);
  }
}
setFlag("off");
fs.writeFileSync(path.join(base, "rows.json"), JSON.stringify(rows));
console.log(`shard ${k}: xong ${mine.length} gói, ${Math.round((Date.now() - started) / 60000)} phút`);
