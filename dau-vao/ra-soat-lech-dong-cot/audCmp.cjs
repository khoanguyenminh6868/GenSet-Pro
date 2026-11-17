// node audCmp.cjs <audB trước.json> <audB sau.json>: số bản ghi từng loại lỗi đọc trước / sau
const [a, b] = process.argv.slice(2).map((f) => require(require("path").resolve(f)));
for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
  const sup = (l) => { const m = new Map(); for (const f of l || []) m.set(f.sup, (m.get(f.sup) || 0) + 1); return [...m].sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x.join("×")).join(", "); };
  console.log(`${k.padEnd(8)} ${String((a[k] || []).length).padStart(5)} → ${String((b[k] || []).length).padStart(5)}   còn: ${sup(b[k])}`);
}
