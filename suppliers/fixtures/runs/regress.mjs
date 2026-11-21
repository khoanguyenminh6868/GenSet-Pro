// Hồi quy phần sau agent (việc T4, 13/11/2026): câu trả lời agent của một lượt thật là đầu vào cố định, code chạy lại
// (config-bot `check` + `rankConfigs`, bidprice-bot `check`) phải ra đúng bản tóm tắt đã lưu (expected.json).
// Cách dựng fixture và vì sao chọn từng lượt: README.md cạnh tệp này.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

export const RUNS = path.dirname(fileURLToPath(import.meta.url));
export const UPDATE = process.env.GENBID_REGRESS_UPDATE === "1";

// Các lượt: [{ tender, name, input, expected }], name = "config", "config-1"... hoặc "bidprice".
export function runsOf(kind) {
  const out = [];
  for (const tender of fs.readdirSync(RUNS).filter((d) => /^IB\d+$/.test(d)).sort()) {
    for (const f of fs.readdirSync(path.join(RUNS, tender)).filter((f) => f.startsWith(kind) && f.endsWith(".input.json.gz")).sort()) {
      const name = f.replace(/\.input\.json\.gz$/, "");
      out.push({ tender, name, input: path.join(RUNS, tender, f), expected: path.join(RUNS, tender, `${name}.expected.json`) });
    }
  }
  return out;
}
export const readBundle = (file) => JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf8"));
// Ghi gzip cố định (không có thời gian trong header) để dựng lại cùng dữ liệu thì cùng tệp.
export const writeBundle = (file, data) => fs.writeFileSync(file, zlib.gzipSync(Buffer.from(JSON.stringify(data), "utf8"), { level: 9 }));
export const tmpDir = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), `genbid-regress-${tag}-`));

// So với expected.json; GENBID_REGRESS_UPDATE=1 ghi lại expected.json (đổi quy tắc có chủ ý: xem diff rồi commit).
export function matchExpected(file, got) {
  const text = JSON.stringify(got, null, 1) + "\n";
  if (UPDATE || !fs.existsSync(file)) { fs.writeFileSync(file, text); if (!UPDATE) assert.fail(`chưa có ${path.basename(file)}: đã ghi, xem lại rồi commit`); return; }
  assert.deepEqual(got, JSON.parse(fs.readFileSync(file, "utf8")), `${path.relative(RUNS, file)} khác: đổi quy tắc có chủ ý thì chạy lại với GENBID_REGRESS_UPDATE=1 và xem diff`);
}

// ---------- Gợi ý cấu hình ----------
const PARTS = ["genset", "engine", "alternator", "controller"], ST = ["met", "not_met", "unclear", "confirm"];
const name = (p) => (p ? [p.make || p.brand, p.model].filter(Boolean).join(" ") : null);
// Số đạt / không đạt / chưa rõ / xác nhận theo bộ phận ("đạt/không/chưa rõ/xác nhận"), thứ hạng, NCC, cảnh báo.
export function configSummary({ result, problems = [] }, missing = []) {
  return {
    problems: problems.length,
    requirements: (result.requirements || []).length,
    unverifiedRequirements: (result.requirements || []).filter((r) => r.unverified).length,
    brandSync: result.brandSync ? `${result.brandSync.need}/${(result.brandSync.parts || []).length}` : null,
    named: result.named ? { make: result.named.make, models: result.named.models, found: result.named.found, equivalent: result.named.equivalent, warn: !!result.namedWarn } : null,
    clarifyByCode: (result.clarify || []).filter((x) => x.by === "code").map((x) => x.item),
    missingCodes: missing.map((m) => m.code),
    message: result.message || null,
    configs: (result.configs || []).map((c) => {
      const checks = {};
      for (const part of PARTS) {
        const xs = (c.checks || []).filter((x) => (PARTS.includes(x.part) ? x.part : "genset") === part);
        if (xs.length) checks[part] = ST.map((s) => xs.filter((x) => x.status === s).length).join("/");
      }
      return {
        rank: c.rank, engine: name(c.engine), alternator: name(c.alternator), controller: name(c.controller),
        named: c.named || (c.equivalent ? "equivalent" : null),
        suppliers: (c.suppliers || []).map((s) => `${s.supplierId}:${s.n}${s.unverified ? "?" : ""}`),
        checks, unverifiedChecks: (c.checks || []).filter((x) => x.unverified).length,
        notMet: (c.checks || []).filter((x) => x.status === "not_met").map((x) => x.item),
        lossWarn: (c.lossWarn || []).map((w) => `${w.code}:${w.status}`),
      };
    }),
  };
}

// ---------- Giá gợi ý ----------
const lv = (levels) => (levels || []).map((l) => `${l.id}:${l.price}`);
export function bidpriceSummary({ result, problems = [] }) {
  const s = result.stats || {};
  return {
    problems: problems.length,
    // Mức của từng gói cũ sau check ("!" = câu trích không khớp / agent không xếp: không tính giá).
    samples: (result.samples || []).map((x) => `${x.id}:${x.level}${x.unverified ? "!" : ""}`),
    // Gói mẫu được chọn làm giá: giống/gần đã kiểm câu trích.
    chosen: (result.samples || []).filter((x) => (x.level === "same" || x.level === "close") && !x.unverified).map((x) => `${x.key}|${x.lotNo || ""}`),
    stats: { basis: s.basis, n: s.n, same: s.same, close: s.close, nPrior: s.nPrior, pool: s.pool, enough: s.enough, levels: lv(s.levels), calib: lv(s.calib?.levels), perKva: s.perKva?.price ?? null },
    byConfig: (result.byConfig || []).map((b) => ({ rank: b.rank, group: b.group, main: !!b.main, n: b.n ?? null, levels: lv(b.stats?.levels) })),
  };
}
