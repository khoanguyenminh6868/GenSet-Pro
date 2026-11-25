// do-gop.mjs lưu tiến độ và chạy tiếp (25/11/2026). Chạy script thật như tiến trình con với mã `config-bot.mjs` giả và bidhist giả nhỏ;
// "ngắt giữa chừng" = mã giả gọi process.exit sau N lần `candidates` (biến STUB_DIE_AFTER), y như container bị tắt.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "do-gop.mjs");
const STUB = `
globalThis.GenbidCatalog = { build: () => ({ engines: [] }), keyOf: (x) => String(x) };
globalThis.GenbidBidprice = { isGensetName: () => true, bidKind: () => "supply", brandSyncOf: () => null };
let calls = 0;
export const MAX_SIZES = 5;
export const cnSuppliers = () => ({});
export const groupSuppliers = () => null;
export const byOrigin = (e) => e;
export const modelFacts = () => ({});
export const sizesOf = (_a, _n, text) => String(text).split(",").map((c) => ({ cap: Number(c) }));
export const capacity = (a) => parseInt(a[1]);
export const hintsOf = () => ({});
export const originOfHsmt = () => null;
export const partsOnlyOf = () => false;
export const candidates = (_cat, cap) => {
  if (++calls === Number(process.env.STUB_DIE_AFTER || -1)) process.exit(1);
  if (cap === 7) throw new Error("lỗi giả");
  const row = (n) => ({ u: { supplierId: "s" + n, line: "L" + cap }, e: { key: "E" + cap }, a: null, score: cap * 10 - n });
  return { top: [row(1), row(2)], all: [row(1), row(2), row(3)], dropped: [] };
};
`;

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dogop-"));
  const wt = path.join(dir, "wt"), cn = path.join(dir, "cn");
  fs.mkdirSync(path.join(wt, "suppliers"), { recursive: true }); fs.mkdirSync(cn);
  fs.writeFileSync(path.join(wt, "suppliers", "config-bot.mjs"), STUB);
  fs.writeFileSync(path.join(cn, "a.json"), JSON.stringify({ id: "a" }));
  fs.writeFileSync(path.join(cn, "b.json"), JSON.stringify({ id: "b", status: "incomplete" }));
  const git = (...a) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "-C", wt, ...a], { encoding: "utf8" });
  git("init", "-q"); git("add", "-A"); git("commit", "-qm", "một");
  const docs = {};
  for (let i = 1; i <= 25; i++) docs["d" + i] = { d: { bidName: "máy phát", notifyNo: "N" + i, config: { text: String(i), kvas: [{ v: i, u: "kVA" }] } } };
  docs.d26 = { d: { bidName: "máy phát", notifyNo: "N26", config: { text: "100,200", kvas: [{ v: 100, u: "kVA" }] } } };
  const hist = path.join(dir, "bidhist.json");
  fs.writeFileSync(hist, JSON.stringify({ fetchedAt: "2026-11-25T00:00:00.000Z", docs }));
  return { dir, wt, cn, hist, git, out: (n) => path.join(dir, n) };
}
function run(s, out, extra = [], env = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, s.wt, s.cn, out, "--bidhist", s.hist, ...extra], { encoding: "utf8", env: { ...process.env, ...env } });
  return { code: r.status, err: r.stderr, out: fs.existsSync(out) ? fs.readFileSync(out, "utf8") : null, meta: fs.existsSync(out + ".meta.json") ? JSON.parse(fs.readFileSync(out + ".meta.json", "utf8")) : null,
    resume: fs.existsSync(out + ".resume.json") ? JSON.parse(fs.readFileSync(out + ".resume.json", "utf8")) : null };
}
const noGiay = (m) => { const { giay, ...r } = m; return r; };

test("chạy một mạch: không để lại tệp phần, có tiến độ cuối và RAM đỉnh", () => {
  const s = setup(), o = s.out("full.json"), r = run(s, o);
  assert.equal(r.code, 0, r.err);
  assert.equal(Object.keys(JSON.parse(r.out)).length, 27);
  assert.equal(JSON.parse(r.out)["N7#0"].error, "lỗi giả");
  assert.equal(r.meta.luot, 27); assert.equal(r.meta.luotLoi, 1);
  assert.ok(!fs.existsSync(o + ".part.jsonl"));
  assert.equal(r.resume.chayTiep, 0); assert.equal(r.resume.luotLayLai, 0); assert.equal(r.resume.luotTinh, 27);
  assert.match(r.err, /RAM đỉnh: \d+ MB/);
});

test("(a) ngắt giữa chừng rồi chạy tiếp ra out.json và meta y hệt chạy một mạch", () => {
  const s = setup(), full = run(s, s.out("full.json"));
  const o = s.out("res.json"), die = run(s, o, [], { STUB_DIE_AFTER: "13" });
  assert.equal(die.code, 1); assert.equal(die.out, null);
  const part = fs.readFileSync(o + ".part.jsonl", "utf8").trim().split("\n");
  assert.equal(part.length, 1 + 10);                                   // dòng nhận dạng + một lô 10 lượt
  const r = run(s, o);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, full.out);                                       // từng byte
  assert.deepEqual(noGiay(r.meta), noGiay(full.meta));
  assert.deepEqual([r.resume.chayTiep, r.resume.luotLayLai, r.resume.luotTinh], [1, 10, 17]);
  assert.match(r.err, /chạy tiếp/);
  assert.ok(!fs.existsSync(o + ".part.jsonl"));
});

test("(a) ngắt hai lần liên tiếp vẫn ra y hệt, đếm đủ số lần chạy tiếp", () => {
  const s = setup(), full = run(s, s.out("full.json")), o = s.out("res.json");
  run(s, o, [], { STUB_DIE_AFTER: "13" });
  run(s, o, [], { STUB_DIE_AFTER: "5" });                              // 10 lượt lấy lại, rồi 5 lượt tính chưa đủ lô 10 → mất
  const r = run(s, o);
  assert.equal(r.out, full.out);
  assert.equal(r.resume.chayTiep, 2);
});

test("(b) dòng cuối tệp phần bị cắt giữa chừng thì bỏ qua an toàn", () => {
  const s = setup(), full = run(s, s.out("full.json")), o = s.out("res.json");
  run(s, o, [], { STUB_DIE_AFTER: "13" });
  fs.appendFileSync(o + ".part.jsonl", '{"id":"10:N11#0","v":{"top":["s1|E11');   // cắt giữa dòng, không xuống dòng
  const r = run(s, o);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, full.out);
  assert.equal(r.resume.luotLayLai, 10);
});

test("(b) dòng hỏng ở giữa: từ đó trở đi tính lại, kết quả vẫn y hệt", () => {
  const s = setup(), full = run(s, s.out("full.json")), o = s.out("res.json");
  run(s, o, [], { STUB_DIE_AFTER: "13" });
  const lines = fs.readFileSync(o + ".part.jsonl", "utf8").split("\n");
  lines[5] = "{hỏng"; fs.writeFileSync(o + ".part.jsonl", lines.join("\n"));
  const r = run(s, o);
  assert.equal(r.out, full.out);
  assert.equal(r.resume.luotLayLai, 4);
});

test("(c) đổi commit code / cn / bidhist thì không dùng lại phần cũ, in lý do", () => {
  const cases = {
    "commit code": (s) => { fs.writeFileSync(path.join(s.wt, "x.txt"), "x"); s.git("add", "-A"); s.git("commit", "-qm", "hai"); },
    "thay đổi chưa commit": (s) => fs.appendFileSync(path.join(s.wt, "suppliers", "config-bot.mjs"), "\n// sửa\n"),
    "thư mục cn": (s) => fs.writeFileSync(path.join(s.cn, "a.json"), JSON.stringify({ id: "a", them: 1 })),
    "bidhist": (s) => { const j = JSON.parse(fs.readFileSync(s.hist, "utf8")); j.docs.d1.d.bidName = "máy phát điện"; fs.writeFileSync(s.hist, JSON.stringify(j)); },
  };
  for (const [name, change] of Object.entries(cases)) {
    const s = setup(), o = s.out("res.json");
    run(s, o, [], { STUB_DIE_AFTER: "13" });
    change(s);
    const base = run(s, s.out("base.json")), r = run(s, o);              // base = chạy một mạch trên dữ liệu mới
    assert.equal(r.code, 0, r.err);
    assert.match(r.err, /bỏ tệp phần/, name); assert.ok(r.err.includes(name), `${name}: ${r.err}`);
    assert.equal(r.resume.luotLayLai, 0, name); assert.equal(r.resume.chayTiep, 0, name);
    assert.equal(r.out, base.out, name);
  }
});

test("(d) --fresh ép chạy từ đầu dù phần cũ khớp; cờ không nuốt đối số vị trí", () => {
  const s = setup(), full = run(s, s.out("full.json")), o = s.out("res.json");
  run(s, o, [], { STUB_DIE_AFTER: "13" });
  const r = run(s, o, ["--fresh"]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.resume.luotLayLai, 0); assert.equal(r.resume.luotTinh, 27);
  assert.equal(r.out, full.out);
  const r2 = run(s, s.out("res2.json"), []);                           // không có phần: chạy bình thường
  assert.equal(r2.out, full.out);
});
