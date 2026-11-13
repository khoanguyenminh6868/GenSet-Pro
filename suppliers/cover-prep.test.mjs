// node --test suppliers/*.test.mjs — H1 (13/11/2026): các hàm của config-bot.mjs đan với tệp và tiến trình ngoài, nay tiêm
// được phụ thuộc qua tham số có mặc định như cũ: pdfToText (exec), prep / findPrep (io: doc, allDocs, supDir, local,
// memoDir, today), specPrep (thư mục lượt), specPost (io của addToCatalog: git, post, gh, merge).
// Không mạng (fetch bị chặn), không git / gh thật, không agent; chỉ ghi vào thư mục tạm.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "cover-prep-"));
process.env.GENBID_INGEST_TOKEN_FILE = path.join(TMP, "token");
fs.writeFileSync(process.env.GENBID_INGEST_TOKEN_FILE, "tok-test\n");
process.env.GENBID_WEB = "http://stub.invalid";
process.env.GENBID_DOC_CACHE = path.join(TMP, "doc-cache");
process.env.GENBID_WEB_MEMO = path.join(TMP, "web-memo");
delete process.env.GENBID_LOCAL_SUPPLIERS;
delete process.env.GENBID_CATALOG_DRY;
const C = await import("./config-bot.mjs");
const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => { throw new Error(`test gọi mạng: ${url}`); };
test.after(() => { globalThis.fetch = realFetch; fs.rmSync(TMP, { recursive: true, force: true }); });

let seq = 0;
const tmpDir = (name) => path.join(TMP, `${name}-${++seq}`);
const read = (dir, f) => fs.readFileSync(path.join(dir, f), "utf8");
const readJ = (dir, f) => JSON.parse(read(dir, f));

// ---------- kho NCC nhỏ giả ----------
const H = "| Model | Prime kVA | Prime kW | Engine |";
const sup = (id, rows, o = {}) => ({ id, country: "CN", role: "genset_oem", status: "partial", confidence: "medium", names: { en: id.toUpperCase() },
  website: null, sources: [], specTables: [{ n: 101, title: "Cummins gensets 50Hz", header: [H], rows }], ...o });
// 400 kVA: dải Tìm NCC / danh mục là 99,5 % – 120 % (bandOf, Khoa 12/11) = 398 – 480 kVA.
const BAND = sup("cn-band", ["| A-398 | 398 | 318.4 | 6LTAA8.9-G2 |", "| A-480 | 480 | 384 | NTA855-G4 |", "| A-481 | 481 | 384.8 | KTA19-G2 |", "| A-390 | 390 | 312 | QSL9-G2 |"]);
const DE = sup("de-maker", ["| B-420 | 420 | 336 | TAD1641GE |"], { country: "DE" });
const SMALL = sup("cn-small", ["| S-30 | 30 | 24 | 4B3.9-G2 |"]);

const HSMT = "Chương V. Yêu cầu về kỹ thuật\n1. Máy phát điện diesel công suất liên tục 400 kVA, 50 Hz, 3 pha.\n";
// doc(coll, id) giả: phân tích + HSMT một khối chữ của gói.
const fakeDoc = ({ capText = "400 kVA", bidName = "Mua sắm máy phát điện 400 kVA", text = HSMT, specs = [] } = {}) => async (coll, id) => {
  if (coll === "analysis") return { result: { keyInfo: { generatorCapacity: capText, bidName }, technicalSpecs: specs } };
  if (coll === "hsmt") return text ? { textChunks: 1 } : null;
  if (coll === "hsmttext") return { text };
  return undefined; // notice
};
const io0 = (o = {}) => ({ doc: fakeDoc(o), allDocs: async () => { throw new Error("allDocs không được gọi"); }, memoDir: path.join(TMP, "no-memo"), today: "2026-11-13", ...o.io });
// The "## Ứng viên" part of catalog.md (before the supplier list).
const candidatesPart = (dir) => read(dir, "catalog.md").split("\n\n# Nhà cung cấp trong hệ thống")[0];
const systemPart = (dir) => read(dir, "catalog.md").split("\n\n# Nhà cung cấp trong hệ thống")[1] || "";

// ---------- pdfToText ----------
const fakeExec = (answers) => {
  const calls = [];
  const exec = (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    const a = answers[args[0]];
    if (a instanceof Error) throw a;
    return Buffer.from(a ?? "", "utf8");
  };
  return { exec, calls };
};
test("pdfToText: gọi pdftotext -table -enc UTF-8 <tệp> - (xpdf giữ một model một dòng), đọc chữ tiếng Việt / Trung đúng mã UTF-8", () => {
  const { exec, calls } = fakeExec({ "-table": "Tổ máy 400 kVA — 机组型号 | NTA855-G4\n" });
  assert.equal(C.pdfToText("C:/x/1.pdf", exec), "Tổ máy 400 kVA — 机组型号 | NTA855-G4\n");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].cmd, "pdftotext");
  assert.deepEqual(calls[0].args, ["-table", "-enc", "UTF-8", "C:/x/1.pdf", "-"]); // Git Bash pdftotext cần -enc UTF-8 (suppliers/CLAUDE.md)
  assert.ok(calls[0].opts.maxBuffer >= 64 << 20, "PDF catalog lớn: bộ đệm ≥ 64 MB");
});
test("pdfToText: pdftotext của poppler không có -table → chạy lại bằng -layout, vẫn -enc UTF-8", () => {
  const { exec, calls } = fakeExec({ "-table": Object.assign(new Error("Unknown option -table"), { status: 99 }), "-layout": "| SP-400 | 400 | 320 |" });
  assert.equal(C.pdfToText("a.pdf", exec), "| SP-400 | 400 | 320 |");
  assert.deepEqual(calls.map((c) => c.args[0]), ["-table", "-layout"]);
  assert.deepEqual(calls[1].args.slice(1), ["-enc", "UTF-8", "a.pdf", "-"]);
});
test("pdfToText: máy không cài pdftotext (ENOENT cả hai lần) → ném lỗi, không trả chữ rỗng giả như trang trắng", () => {
  const enoent = Object.assign(new Error("spawnSync pdftotext ENOENT"), { code: "ENOENT" });
  const { exec, calls } = fakeExec({ "-table": enoent, "-layout": enoent });
  assert.throws(() => C.pdfToText("a.pdf", exec), /ENOENT/);
  assert.equal(calls.length, 2);
});
test("pdfToText: PDF scan (không lớp chữ) → pdftotext chạy được, trả chuỗi rỗng; không thử -layout (khoá hành vi: save ghi trang rỗng, agent tự thấy)", () => {
  const { exec, calls } = fakeExec({ "-table": "", "-layout": "không được gọi" });
  assert.equal(C.pdfToText("scan.pdf", exec), "");
  assert.equal(calls.length, 1);
});

// ---------- findPrep: cỡ máy, cấu hình target ----------
const TWO = "Tổ 400kVA: Prime Power 400KVA/320KW; Tổ 30kVA: Prime Power 30KVA/24KW";
test("findPrep gói một cỡ: cap là công suất gói, meta.json ghi origin + cap, prompt.md là find-prompt.md, input.md mở đầu bằng lệnh find-check", async () => {
  const dir = tmpDir("find1");
  const info = await C.findPrep("IB0000000001", dir, { origin: "all" }, [BAND, DE], io0());
  assert.deepEqual(info.cap, { value: 400, unit: "kVA" });
  assert.deepEqual(readJ(dir, "meta.json"), { origin: "all", cap: { value: 400, unit: "kVA" } });
  assert.equal(read(dir, "prompt.md"), fs.readFileSync(path.join(HERE, "find-prompt.md"), "utf8"));
  const input = read(dir, "input.md");
  assert.match(input, /^# Tìm NCC cho gói IB0000000001\n/);
  assert.match(input, /find-check --dir \./);
  assert.doesNotMatch(input, /Tìm nhà cung cấp cho MỘT cấu hình/);
  assert.doesNotMatch(input, /Gói có nhiều cỡ máy/);
});
test("findPrep dải công suất bandOf (Khoa 12/11): ứng viên 398 kVA (99,5 %) và 480 kVA (120 %) vào, 390 và 481 kVA không", async () => {
  const dir = tmpDir("band");
  await C.findPrep("IB0000000002", dir, { origin: "all" }, [BAND], io0());
  const cand = candidatesPart(dir);
  assert.match(cand, /tổ máy 400 kVA, từ 100% đến 120%/, "tiêu đề danh mục nêu dải (100 % là 99,5 % sau làm tròn)");
  assert.match(cand, /## Ứng viên \(2 dòng tổ máy/);
  assert.match(cand, /A-398/); assert.match(cand, /A-480/);
  assert.doesNotMatch(cand, /A-481/); assert.doesNotMatch(cand, /A-390/);
});
test("findPrep máy ≤ 30 kVA: dải tới 140 % (NEAR_HIGH_SMALL) — 42 kVA còn vào, 43 kVA không", async () => {
  const dir = tmpDir("small");
  const s = sup("cn-30", ["| T-42 | 42 | 33.6 | 4BT3.9-G2 |", "| T-43 | 43 | 34.4 | 4BTA3.9-G2 |"]);
  await C.findPrep("IB0000000003", dir, { origin: "all" }, [s], io0({ capText: "30 kVA", bidName: "Máy phát điện 30 kVA", text: "Chương V. Yêu cầu về kỹ thuật\nMáy phát 30 kVA, 50 Hz\n" }));
  const cand = candidatesPart(dir);
  assert.match(cand, /T-42/);
  assert.doesNotMatch(cand, /T-43/);
});
test("findPrep, HSMT không đòi G7/G20: ứng viên chỉ của NCC đặt tại Trung Quốc (Khoa 10/11), nhưng danh sách 'NCC trong hệ thống' có MỌI NCC để agent không gợi ý lại", async () => {
  const dir = tmpDir("grp");
  await C.findPrep("IB0000000004", dir, { origin: "all" }, [BAND, DE], io0());
  assert.doesNotMatch(candidatesPart(dir), /de-maker/);
  assert.match(systemPart(dir), /de-maker/);
  assert.match(systemPart(dir), /cn-band/);
});
test("findPrep gói nhiều cỡ, không target: tìm cho MỌI cỡ — cap là danh sách cỡ, input.md nêu đủ các cỡ", async () => {
  const dir = tmpDir("multi");
  const info = await C.findPrep("IB0000000005", dir, { origin: "all" }, [BAND, SMALL], io0({ capText: TWO, bidName: "Máy phát điện 400kVA và 30kVA" }));
  assert.deepEqual(info.cap, [{ value: 30, unit: "kVA" }, { value: 400, unit: "kVA" }]);
  assert.deepEqual(readJ(dir, "meta.json").cap, info.cap);
  const input = read(dir, "input.md");
  assert.match(input, /## Gói có nhiều cỡ máy: 30 kVA; 400 kVA/);
  assert.match(input, /Tìm nhà cung cấp cho mọi cỡ máy này/);
});
const TARGET = { size: "400 kVA", rank: 2, engine: { model: "NTA855-G4", make: "Cummins" }, alternator: { model: "HCI544D" }, controller: { model: "DSE7320" } };
test("findPrep có target (Tìm NCC cho MỘT cấu hình đã gợi ý): chỉ cỡ máy của cấu hình đó, chỉ ĐÚNG động cơ đó", async () => {
  const dir = tmpDir("target");
  const info = await C.findPrep("IB0000000006", dir, { origin: "all", target: TARGET }, [BAND, SMALL], io0({ capText: TWO, bidName: "Máy phát điện 400kVA và 30kVA" }));
  assert.deepEqual(info.cap, { value: 400, unit: "kVA" }, "cap là MỘT cỡ, không phải danh sách");
  assert.deepEqual(readJ(dir, "meta.json").cap, { value: 400, unit: "kVA" });
  const input = read(dir, "input.md");
  assert.match(input, /## Tìm nhà cung cấp cho MỘT cấu hình đã gợi ý: #2 máy 400 kVA/);
  assert.match(input, /ĐÚNG động cơ NTA855-G4/);
  assert.match(input, /cùng đầu phát HCI544D/);
  assert.match(input, /bộ điều khiển DSE7320/);
  assert.match(input, /Lượt Tìm NCC này CHỈ tìm cho máy 400 kVA/);
  assert.match(candidatesPart(dir), /A-480/); // danh mục xếp cho 400 kVA, không phải cỡ đầu (30 kVA)
  assert.doesNotMatch(candidatesPart(dir), /S-30/);
});
test("findPrep target ghi cỡ không có trong gói → tìm cho mọi cỡ (khoá hành vi), vẫn nêu cấu hình cần tìm", async () => {
  const dir = tmpDir("target-miss");
  const info = await C.findPrep("IB0000000007", dir, { origin: "all", target: { ...TARGET, size: "250 kVA" } }, [BAND, SMALL], io0({ capText: TWO, bidName: "x" }));
  assert.ok(Array.isArray(info.cap));
  assert.match(read(dir, "input.md"), /ĐÚNG động cơ NTA855-G4/);
});
test("findPrep target không có model động cơ → coi như không có target (không phần 'MỘT cấu hình')", async () => {
  const dir = tmpDir("target-noeng");
  await C.findPrep("IB0000000008", dir, { origin: "all", target: { size: "400 kVA", rank: 1, engine: {} } }, [BAND], io0());
  assert.doesNotMatch(read(dir, "input.md"), /MỘT cấu hình/);
});
test("findPrep xoá các phần cắt cho Gợi ý (read-order.json, catalog-N.md...) để agent không đọc bản cũ", async () => {
  const dir = tmpDir("cut");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "catalog-1.md"), "cũ"); fs.writeFileSync(path.join(dir, "input-2.md"), "cũ");
  await C.findPrep("IB0000000009", dir, { origin: "all" }, [BAND], io0());
  for (const f of ["read-order.json", "catalog-1.md", "input-2.md"]) assert.ok(!fs.existsSync(path.join(dir, f)), f);
  for (const f of ["catalog.md", "input.md", "suppliers.json", "hsmt.txt", "meta.json", "prompt.md"]) assert.ok(fs.existsSync(path.join(dir, f)), f);
});
test("findPrep gói chưa có chữ HSMT → lỗi 'cần tải hồ sơ', không chuẩn bị lượt", async () => {
  await assert.rejects(C.findPrep("IB0000000010", tmpDir("nohsmt"), { origin: "all" }, [BAND], io0({ text: "" })), /chưa có văn bản HSMT/);
});

// ---------- prep / findPrep với kho NCC tệp (GENBID_LOCAL_SUPPLIERS): bỏ NCC loại trừ / xoá mềm ----------
const localStore = () => {
  const d = tmpDir("cn");
  fs.mkdirSync(d, { recursive: true });
  for (const r of [BAND, sup("cn-excl", ["| X-400 | 400 | 320 | NTA855-G4 |"]), sup("cn-back", ["| Y-400 | 400 | 320 | NTA855-G4 |"]), sup("cn-del", ["| D-400 | 400 | 320 | NTA855-G4 |"]), sup("cn-inc", ["| I-400 | 400 | 320 | NTA855-G4 |"], { status: "incomplete" })])
    fs.writeFileSync(path.join(d, `${r.id}.json`), JSON.stringify(r));
  fs.writeFileSync(path.join(d, "README.txt"), "không phải bản ghi");
  return d;
};
const skipDocs = async (coll) => (coll === "supexcl" ? [{ id: "cn-excl", data: { on: true } }, { id: "cn-back", data: { on: false } }] : coll === "supdeleted" ? [{ id: "cn-del", data: {} }] : []);
test("findPrep với kho tệp: bỏ NCC Loại trừ (on:true) và xoá mềm, giữ NCC đã bỏ loại trừ (Khoa 11/11), bỏ bản ghi incomplete; danh sách truyền vào bị bỏ qua", async () => {
  const dir = tmpDir("local");
  await C.findPrep("IB0000000011", dir, { origin: "all" }, [DE], io0({ io: { local: true, supDir: localStore(), allDocs: skipDocs } }));
  assert.deepEqual(readJ(dir, "suppliers.json").map((s) => s.id).sort(), ["cn-back", "cn-band"]);
  for (const id of ["cn-excl", "cn-del", "cn-inc", "de-maker"]) assert.doesNotMatch(read(dir, "catalog.md"), new RegExp(id), id);
});
test("prep với kho tệp mà không đọc được danh sách loại trừ: cảnh báo 'chưa lọc NCC loại trừ', không bỏ ai (đường thử), vẫn bỏ incomplete", async () => {
  const dir = tmpDir("local-unf"), errs = [], err0 = console.error;
  console.error = (...a) => errs.push(a.join(" "));
  try { await C.prep("IB0000000012", dir, { origin: "all" }, null, null, io0({ io: { local: true, supDir: localStore(), allDocs: async () => { throw new Error("mạng"); } } })); }
  finally { console.error = err0; }
  assert.ok(errs.some((e) => /chưa lọc NCC loại trừ/.test(e)), errs.join("\n"));
  assert.deepEqual(readJ(dir, "suppliers.json").map((s) => s.id).sort(), ["cn-back", "cn-band", "cn-del", "cn-excl"]);
});

// ---------- prep: các tệp của lượt Gợi ý ----------
test("prep: ghi hsmt.txt đúng chữ HSMT, specs.json từ phân tích, read-order.json liệt kê input.md rồi catalog.md, prompt.md là config-prompt.md + công thức", async () => {
  const dir = tmpDir("prep");
  const specs = [{ item: "Công suất", requirement: "400 kVA", reference: "Mục 1" }];
  const info = await C.prep("IB0000000013", dir, { origin: "cn", bidName: "Máy phát điện 400 kVA" }, [BAND, DE], null, io0({ specs }));
  assert.equal(read(dir, "hsmt.txt"), HSMT);
  assert.deepEqual(readJ(dir, "specs.json"), [{ item: "Công suất", requirement: "400 kVA" }]);
  assert.deepEqual(readJ(dir, "read-order.json"), ["input.md", "catalog.md"]);
  assert.ok(read(dir, "prompt.md").startsWith(fs.readFileSync(path.join(HERE, "config-prompt.md"), "utf8")));
  assert.equal(info.origin, "cn"); // Trung Quốc chọn trên web thì giữ (Khoa 04/11)
  assert.deepEqual(readJ(dir, "meta.json"), { origin: "cn" });
  assert.equal(info.reused, false);
  assert.match(read(dir, "input.md"), /## Xuất xứ động cơ: Trung Quốc/);
});
test("prep: Gợi ý lại khi HSMT + Yêu cầu khác không đổi (cùng reqHash) → dùng lại requirements đã đọc (Khoa 02/11), bỏ dòng byCode", async () => {
  const dir = tmpDir("reuse");
  const req = { code: "power_prime", item: "Công suất", requirement: "400 kVA", quote: "400 kVA", part: "genset", level: "must" };
  const prevResult = { reqHash: C.reqHashOf(HSMT, ""), requirements: [req, { ...req, code: "freq", byCode: true }] };
  const info = await C.prep("IB0000000014", dir, { origin: "cn", prevResult }, [BAND], null, io0());
  assert.equal(info.reused, true);
  assert.deepEqual(readJ(dir, "requirements.json"), [req]);
  assert.match(read(dir, "input.md"), /Yêu cầu đã đọc lần trước: requirements.json/);
  // HSMT đổi (hash khác) → đọc lại.
  const dir2 = tmpDir("reuse2");
  const info2 = await C.prep("IB0000000014", dir2, { origin: "cn", prevResult: { ...prevResult, reqHash: "khác" } }, [BAND], null, io0());
  assert.equal(info2.reused, false);
  assert.ok(!fs.existsSync(path.join(dir2, "requirements.json")));
});
test("prep một cỡ của gói nhiều cỡ: meta.json sized, input.md 'CHỈ gợi ý cấu hình cho máy 30 kVA', cap là cỡ đó", async () => {
  const dir = tmpDir("sized");
  const sizes = C.sizesOf([TWO, ""], "");
  const info = await C.prep("IB0000000015", dir, { origin: "cn" }, [BAND, SMALL], { size: sizes[0], sizes }, io0({ capText: TWO }));
  assert.deepEqual(info.cap, { value: 30, unit: "kVA" });
  assert.equal(readJ(dir, "meta.json").sized, true);
  assert.match(read(dir, "input.md"), /CHỈ gợi ý cấu hình cho máy 30 kVA/);
});

// ---------- specPrep ----------
const SPEC_SKILL = fs.readFileSync(path.join(HERE, "..", "bot", "claude", "skills", "tim-thong-so-ncc", "SKILL.md"), "utf8");
test("specPrep: thư mục lượt có supplier.json, suppliers.json, meta.json {mode:spec}, prompt.md = skill tim-thong-so-ncc bỏ phần frontmatter", async () => {
  const dir = tmpDir("spec");
  const s = sup("cn-web", ["| W-400 | 400 | 320 | NTA855-G4 |"], { website: "https://www.cn-web.com" });
  await C.specPrep("cn-web", dir, [s, BAND]);
  assert.deepEqual(readJ(dir, "supplier.json"), s);
  assert.deepEqual(readJ(dir, "suppliers.json").map((x) => x.id), ["cn-web", "cn-band"]);
  assert.deepEqual(readJ(dir, "meta.json"), { mode: "spec", id: "cn-web" });
  const prompt = read(dir, "prompt.md");
  assert.ok(!prompt.startsWith("---"));
  assert.ok(SPEC_SKILL.endsWith(prompt), "phần thân của SKILL.md, nguyên văn");
  assert.match(prompt, /made-in-china\.com.*KHÔNG được đưa vào danh mục/); // tier C (Khoa 12/11) có trong chỉ dẫn agent
  assert.ok(fs.statSync(path.join(dir, "web")).isDirectory());
  const input = read(dir, "input.md");
  assert.match(input, /- Website: https:\/\/www\.cn-web\.com/);
  assert.match(input, /spec-check --dir \./);
});
test("specPrep NCC không có website: dừng trước khi dựng thư mục lượt và chạy agent (Khoa 13/11 'chặn đi')", async () => {
  const dir = tmpDir("spec-noweb");
  fs.rmSync(dir, { recursive: true, force: true });
  for (const website of [null, undefined, "", "   "]) {
    await assert.rejects(C.specPrep("cn-band", dir, [{ ...BAND, website }]), /chưa có website/, JSON.stringify(website));
    assert.equal(fs.existsSync(dir), false, "không tạo thư mục lượt");
  }
  assert.equal(C.specSkip({ website: "https://www.cn-web.com" }), "");
  assert.match(C.specSkip({ website: null }), /Thêm website/);
  assert.match(C.specSkip(undefined), /chưa có website/);
});
test("specPrep NCC đã có bảng: liệt kê 'Bảng thông số đã có (đừng thêm lại)' và động cơ đọc được; > 80 bảng thì cắt, chỉ chỗ xem tiếp (khoá hành vi: không dừng sớm)", async () => {
  const dir = tmpDir("spec-full");
  const tables = Array.from({ length: 85 }, (_, i) => ({ n: 101 + i, title: `Bảng ${i + 1}`, header: [H], rows: [`| M-${i} | 400 | 320 | NTA855-G4 |`] }));
  await C.specPrep("cn-full", dir, [sup("cn-full", [], { specTables: tables, website: "https://www.cn-full.com" })]);
  const input = read(dir, "input.md");
  const part = input.split("## Bảng thông số đã có (đừng thêm lại)\n")[1].split("\n\n")[0].split("\n");
  assert.equal(part.length, 81);
  assert.equal(part[80], "- … và 5 mục nữa (xem supplier.json)");
  assert.match(input, /### Động cơ\n- NTA855-G4/);
});
test("specPrep NCC chưa có bảng nào: '(chưa có)' ở bảng, động cơ, đầu phát, bộ điều khiển", async () => {
  const dir = tmpDir("spec-empty");
  await C.specPrep("cn-none", dir, [{ id: "cn-none", country: "CN", role: "genset_oem", names: { en: "None" }, website: "https://www.cn-none.com", sources: [] }]);
  const input = read(dir, "input.md");
  assert.equal(input.match(/\(chưa có\)/g).length, 4);
});
test("specPrep id không có trong kho → lỗi, KHÔNG xoá thư mục cũ", async () => {
  const dir = tmpDir("spec-miss");
  fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "giu.txt"), "x");
  await assert.rejects(C.specPrep("khong-co", dir, [BAND]), /không có nhà cung cấp khong-co/);
  assert.ok(fs.existsSync(path.join(dir, "giu.txt")));
});

// ---------- specPost ----------
const SP = { id: "cn-sp", country: "CN", role: "genset_oem", status: "partial", confidence: "low", names: { en: "CN SP Power" }, website: "https://www.cnsp-power.com", sources: [] };
const ROW_A = "| SP-400 | 400 | 320 | NTA855-G4 |", ROW_C = "| SP-500 | 500 | 400 | KTA19-G3 |";
const page = (url, ...lines) => `URL: ${url}\nAccessed: 2026-11-13T00:00:00Z\n\nCummins gensets 50Hz\n${H}\n${lines.join("\n")}\n`;
// A Tìm Thông Số run folder as specPrep + the agent leave it.
function specRun({ entries, pages = {}, spec = { summary: "Bổ sung bảng SP", skipped: [], notes: [] } }) {
  const dir = tmpDir("specpost");
  fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ mode: "spec", id: "cn-sp" }));
  if (entries) fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify(entries));
  if (spec) fs.writeFileSync(path.join(dir, "spec.json"), JSON.stringify(spec));
  for (const [f, t] of Object.entries(pages)) fs.writeFileSync(path.join(dir, f), t);
  return dir;
}
// addToCatalog's world, faked: git (a worktree with this checkout's verify.mjs), post to the web, gh, the merge watcher.
function fakeRepo() {
  const calls = { git: [], post: [], gh: [], merge: [] };
  const git = (cwd, ...a) => {
    calls.git.push(a.join(" "));
    if (a[0] === "worktree" && a[1] === "add") {
      const wt = a[5];
      fs.mkdirSync(path.join(wt, "suppliers", "cn"), { recursive: true });
      fs.copyFileSync(path.join(HERE, "verify.mjs"), path.join(wt, "suppliers", "verify.mjs"));
    }
    if (a[0] === "worktree" && a[1] === "remove") fs.rmSync(a[3], { recursive: true, force: true });
    return "";
  };
  return { calls, io: { git, repo: path.join(TMP, "repo"), post: async (rows) => { calls.post.push(rows); return "ok"; }, gh: (args) => { calls.gh.push(args); return "https://github.com/x/y/pull/9"; }, merge: (pr) => calls.merge.push(pr) } };
}
const A_SRC = { n: 1, file: "web/1.txt", tier: "A", quote: [ROW_A] }, A_TAB = { n: 1, title: "Cummins gensets 50Hz", header: [H], rows: [ROW_A] };
const C_SRC = { n: 2, file: "web/2.txt", tier: "C", quote: [ROW_C] }, C_TAB = { n: 2, title: "Cummins gensets 50Hz", header: [H], rows: [ROW_C] };
const PAGES = { "web/1.txt": page("https://www.cnsp-power.com/products/gensets", ROW_A), "web/2.txt": page("https://cnsp.en.made-in-china.com/product/sp-500.html", ROW_C) };

test("specPost: phần mới qua verify, trang của chính NCC → đăng supplier/<id> lên web một lần, mở PR nhánh specs/<id>, trả động cơ đọc được", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [A_SRC], specTables: [A_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], { by: "khoa" }, io);
  assert.equal(r.error, undefined, r.error);
  assert.equal(calls.post.length, 1);
  const [row] = calls.post[0];
  assert.equal(row.coll, "supplier"); assert.equal(row.id, "cn-sp");
  assert.deepEqual(row.data.sources.map((s) => [s.n, s.url, s.official]), [[2001, "https://www.cnsp-power.com/products/gensets", true]]); // trang Tìm NCC / Tìm thông số đánh số từ 2001
  assert.deepEqual(row.data.specTables.map((t) => t.rows), [[ROW_A]]);
  assert.ok(calls.git.some((g) => g.startsWith("worktree add -f -B specs/cn-sp ")));
  assert.ok(calls.git.some((g) => g.startsWith("push -q -f -u origin specs/cn-sp")));
  assert.deepEqual(calls.gh[0].slice(0, 4), ["pr", "create", "--head", "specs/cn-sp"]);
  assert.deepEqual(calls.merge, ["https://github.com/x/y/pull/9"]);
  assert.equal(r.added[0].pr, "https://github.com/x/y/pull/9");
  assert.deepEqual(r.found.engines.map((e) => e.model), ["NTA855-G4"]);
  assert.equal(r.summary, "Bổ sung bảng SP");
  assert.ok(!calls.git.some((g) => g.startsWith("worktree add")) || calls.git.some((g) => g.startsWith("worktree remove")), "worktree tạm được gỡ");
});
test("specPost: trang bên bán (tier C, ngoài tên miền NCC; Khoa 12/11) KHÔNG lên danh mục — nguồn và bảng chỉ dựa trên nó bị bỏ, ghi lý do", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [A_SRC, C_SRC], specTables: [A_TAB, C_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.equal(calls.post.length, 1);
  const data = calls.post[0][0].data;
  assert.ok(!data.sources.some((s) => /made-in-china/.test(s.url)));
  assert.ok(!JSON.stringify(data.specTables).includes("SP-500"));
  assert.deepEqual(r.added[0].skippedSources.map((s) => s.url), ["https://cnsp.en.made-in-china.com/product/sp-500.html"]);
  assert.match(r.added[0].skippedSources[0].why, /trang bên bán/);
  assert.deepEqual(r.found.engines.map((e) => e.model), ["NTA855-G4"]); // KTA19-G3 chỉ ở trang bên bán
});
test("specPost: mọi nguồn là trang bên bán → không đăng, không git, lỗi nêu trang bên bán", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [C_SRC], specTables: [C_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.deepEqual(r.added, []);
  assert.match(r.error, /trang bên bán/);
  assert.equal(calls.post.length + calls.git.length + calls.gh.length, 0);
});
test("specPost: tier C nhưng trên chính tên miền của NCC (trang hãng tự giới thiệu) vẫn được đưa vào", async () => {
  const own = { "web/1.txt": PAGES["web/1.txt"] };
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [{ ...A_SRC, tier: "C" }], specTables: [A_TAB] }], pages: own });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.equal(r.error, undefined, r.error);
  assert.equal(calls.post.length, 1);
});
test("specPost: verify không đạt (dòng bảng không có nguyên văn trong trang đã lưu) → không đăng, lỗi verify.mjs", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [A_SRC], specTables: [{ ...A_TAB, rows: ["| SP-400 | 410 | 328 | NTA855-G4 |"] }] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.match(r.error, /cn-sp: specTables\[0\]: không tìm thấy dòng/);
  assert.equal(calls.post.length + calls.git.length, 0);
});
test("specPost: nguồn trỏ tới trang chưa lưu → không đăng", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [{ ...A_SRC, file: "web/7.txt" }], specTables: [A_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.match(r.error, /không có trang đã lưu web\/7\.txt/);
  assert.equal(calls.post.length, 0);
});
test("specPost: newCatalog ghi id NCC khác → không đăng, lỗi 'id khác nhà cung cấp cần tìm'", async () => {
  const other = { id: "cn-other", country: "CN", role: "genset_oem", names: { en: "Other" }, confidence: "low", sources: [A_SRC], specTables: [A_TAB] };
  const dir = specRun({ entries: [other], pages: PAGES });
  const { calls, io } = fakeRepo();
  const r = await C.specPost(dir, [SP], {}, io);
  assert.match(r.error, /id khác nhà cung cấp cần tìm \(cn-sp\)/);
  assert.equal(calls.post.length, 0);
});
test("specPost: không có gì mới ([] hoặc mục rỗng) hoặc agent không ghi newCatalog.json → không đăng, báo không bổ sung được", async () => {
  for (const [entries, re] of [[[], /không bổ sung được gì mới/], [[{ id: "cn-sp", sources: [] }], /cn-sp: không có gì mới/], [null, /không bổ sung được gì mới/]]) {
    const dir = specRun({ entries, pages: PAGES, spec: null });
    const { calls, io } = fakeRepo();
    const r = await C.specPost(dir, [SP], {}, io);
    assert.match(r.error, re, JSON.stringify(entries));
    assert.deepEqual(r.added, []); assert.equal(r.summary, ""); // spec.json thiếu → tóm tắt rỗng
    assert.equal(calls.post.length, 0);
  }
});
test("specPost: newCatalog có thêm mục của NCC khác → chỉ mục của NCC cần tìm được đăng", async () => {
  const other = { id: "cn-other", country: "CN", role: "genset_oem", names: { en: "Other" }, confidence: "low", sources: [A_SRC], specTables: [A_TAB] };
  const dir = specRun({ entries: [other, { id: "cn-sp", sources: [A_SRC], specTables: [A_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  await C.specPost(dir, [SP], {}, io);
  assert.deepEqual(calls.post.flat().map((r) => r.id), ["cn-sp"]);
  assert.deepEqual(readJ(dir, "newCatalog.json").map((e) => e.id), ["cn-sp"]);
});
test("specPost: đăng web được nhưng git / gh lỗi → kết quả vẫn có NCC, ghi prError 'chưa mở được PR'", async () => {
  const dir = specRun({ entries: [{ id: "cn-sp", sources: [A_SRC], specTables: [A_TAB] }], pages: PAGES });
  const { calls, io } = fakeRepo();
  io.gh = () => { throw Object.assign(new Error("gh: not logged in"), { stderr: "gh: not logged in" }); };
  const r = await C.specPost(dir, [SP], {}, io);
  assert.equal(calls.post.length, 1);
  assert.match(r.added[0].prError, /Đã đăng lên web nhưng chưa mở được PR vào repo: gh: not logged in/);
  assert.equal(calls.merge.length, 0);
});
