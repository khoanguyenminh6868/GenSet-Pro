// node ids.mjs : các lượt mà all (khoá + điểm, đa tập) hoặc top khác → ids.json
import fs from "node:fs"; import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const A = rd("gop-goc.json.gz"), B = rd("gop-nhanh.json.gz");
const s = (r) => JSON.stringify([r.top, (r.all || []).map((x) => x.join("@")).sort()]);
const ids = Object.keys(A).filter((k) => s(A[k]) !== s(B[k] || {}));
fs.writeFileSync(new URL("ids.json", import.meta.url), JSON.stringify(ids)); console.log(ids.length);
