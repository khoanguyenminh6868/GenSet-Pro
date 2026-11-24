// Giá trị một nguồn internet trong Gợi ý cấu hình (one-source-4, PR 4 của thiết kế gia-tri-mot-nguon; Khoa 24/11/2026: CHỈ
// HIỂN THỊ kèm nhãn, KHÔNG cộng điểm, KHÔNG dùng để loại; check dựa vào nó luôn "cần xác nhận", không bao giờ "đạt").
//   catalogMd: dòng riêng có nhãn sau các fact của model; ratings gom theo dòng trích + điều kiện (trừ điện áp).
//   candidates: danh sách + điểm ứng viên giống hệt có / không có one-source.json (gói có đầu phát LSA 46.2).
//   check: check dựa vào câu trích / URL của bản ghi → "confirm" (document), oneHold giữ trạng thái agent, chạy lại ra cùng JSON.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalogMd, candidates, hintsOf, check, oneSourceMd, oneSourceOf, ONE_TAG } from "./config-bot.mjs";
import { readOneSource, fieldOf } from "./one-source-rules.mjs";
import { readBundle, tmpDir } from "./fixtures/runs/regress.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const C = globalThis.GenbidCatalog;
const records = readOneSource();
const isOneLine = (l) => l.startsWith("- [MỘT NGUỒN INTERNET") || l.startsWith("  tiêu đề cột trên trang ");

test("oneSourceMd: 16 dòng định mức LSA 46.2 M3 gom thành 4 dòng (tần số × mức), không mất điều kiện / giá trị nào", () => {
  const list = records.filter((r) => r.key === "LSA462M3").map((rec) => ({ rec, f: fieldOf.alternator[rec.field] }));
  assert.equal(list.length, 16);
  const md = oneSourceMd(list), rows = md.filter((l) => l.startsWith("- "));
  assert.equal(rows.length, 4);
  for (const l of rows) assert.ok(l.startsWith(`- ${ONE_TAG(2)} `), l);
  // Mỗi bản ghi: dòng có đúng tần số + mức + cấp của nó và cặp "điện áp kVA".
  for (const { rec } of list) {
    const v = rec.value, duty = v.duty === "standby" ? "dự phòng (standby)" : "liên tục";
    assert.ok(rows.some((l) => l.includes(`(${v.hz} Hz, ${duty}, ${v.ambient_c}°C, ${v.insulation_rise}, ${v.phases} pha, ${v.connection})`) && l.includes(`${v.voltage} V ${v.kva} kVA`) && l.includes(rec.url) && l.includes(JSON.stringify(rec.quote[0]))), rec.id);
  }
  // Tiêu đề cột (condQuote) mỗi trang một lần.
  assert.equal(md.filter((l) => l.startsWith("  tiêu đề cột")).length, new Set(list.map(({ rec }) => JSON.stringify(rec.condQuote))).size);
});

test("oneSourceOf: tờ hãng trong repo đã ghi trường đó → không hiện; mâu thuẫn → không bản nào; model không hiện → không đọc", () => {
  const f = Object.values(fieldOf.engine).find((x) => x.key && x.type !== "table");
  const rec = (id, value, key = "XYZ123") => ({ id, part: "engine", make: "X", model: key, key, field: f.id, value, unit: f.unit || null, cond: null, level: 3, url: "https://example.com/a", accessedAt: "2026-11-24", quote: [`${f.id} ${value}`], condQuote: [] });
  const keys = new Set(["engine:XYZ123"]);
  assert.equal(oneSourceOf([rec("a", 7)], keys).get("engine:XYZ123").length, 1);
  const facts = new Map([["engine:XYZ123", [{ key: f.key, sheet: true, value: "7", supplierId: "s", n: 1001, line: "x" }]]]);
  assert.equal(oneSourceOf([rec("a", 7)], keys, { facts }).size, 0);
  assert.equal(oneSourceOf([rec("a", 7), rec("b", 8)], keys).size, 0);
  assert.equal(oneSourceOf([rec("a", 7, "KHAC1")], keys).size, 0);
  assert.equal(oneSourceOf([], keys).size, 0);
});

// Gói 200 kVA trên dữ liệu thật của 5 NCC có dòng đầu phát LSA 46.2 (camda-generator, hosem-power, pramac, rise-power,
// wintpower): RÀNG BUỘC của PR 4 — one-source.json không đổi ứng viên, điểm, lý do; catalog.md chỉ THÊM dòng có nhãn.
const IDS = ["camda-generator", "hosem-power", "pramac", "rise-power", "wintpower"];
const list = IDS.map((id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")));
const cat = C.build(list), cap = { value: 200, unit: "kVA" };
const sig = (r) => JSON.stringify({ e: r.e.key, a: r.a?.key ?? null, sup: r.u.supplierId, n: r.u.n, line: r.u.line ?? null, score: r.score, why: r.why });

test("catalogMd gói 200 kVA có đầu phát LSA 46.2: ứng viên + điểm giống hệt có / không có one-source.json; catalog chỉ thêm dòng có nhãn", () => {
  const opts = { suppliers: list, origin: "all" };
  const base = candidates(cat, cap, hintsOf("Tần số 50 Hz"), opts);
  const off = catalogMd(cat, cap, hintsOf("Tần số 50 Hz"), { ...opts, oneSource: [] });
  const on = catalogMd(cat, cap, hintsOf("Tần số 50 Hz"), opts);
  assert.ok(on.top.some((r) => /^LSA462/.test(r.a?.key || "")), "gói thử phải có ứng viên đầu phát LSA 46.2");
  assert.deepEqual(on.top.map(sig), base.top.map(sig));
  assert.deepEqual(off.top.map(sig), base.top.map(sig));
  assert.ok(!off.md.includes("MỘT NGUỒN INTERNET"));
  const added = on.md.split("\n").filter(isOneLine);
  assert.ok(added.length >= 4, "phải in dòng một nguồn cho LSA 46.2");
  assert.equal(on.md.split("\n").filter((l) => !isOneLine(l)).join("\n"), off.md);
  // Dòng một nguồn nằm ngay dưới đầu mục của đầu phát đó, trong "Thông số theo model".
  const lines = on.md.split("\n"), i = lines.findIndex(isOneLine), head = lines.slice(0, i).reverse().find((l) => l.startsWith("### "));
  assert.match(head, /^### Đầu phát LSA ?46\.2/);
  assert.ok(lines.indexOf("## Thông số theo model (dùng cho mọi cấu hình có model đó; ghi factSrc như dưới)") < i);
});

// check trên lượt hồi quy thật IB2600586587 (đầu phát UCI274G), với một bản ghi một nguồn GIẢ cho UCI274G (690 V, 777 kVA).
const B = readBundle(path.join(ROOT, "fixtures", "runs", "IB2600586587", "config.input.json.gz"));
const QUOTE = "UCI274G kVA 777 tại 690 V (trang thử)";
const fake = { id: "test-uci274g", part: "alternator", make: "Stamford", model: "UCI274G", key: C.keyOf("UCI274G"), field: "ratings",
  value: { voltage: 690, connection: "Y", phases: 3, hz: 50, duty: "continuous", ambient_c: 40, insulation_rise: "H/125 K", kva: 777 }, unit: null, cond: null, level: 2,
  url: "https://example.com/uci274g.pdf", file: "sources/one-source/999.md", accessedAt: "2026-11-24", quote: [QUOTE], condQuote: [], makerChecked: [], addedBy: "test", note: "" };
const ITEM = "Công suất đầu phát (thử một nguồn)";
const run = (result, oneSource) => {
  const dir = tmpDir("one-source");
  try {
    for (const [f, text] of Object.entries(B.sources || {})) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
    return check(result, { hsmtText: B.hsmtText, suppliers: B.suppliers, readWeb: () => null, origin: B.meta.origin, basis: B.meta.basis, sized: !!B.meta.sized, sourcesDir: dir, oneSource });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
};
const withCheck = (extra) => {
  const r = JSON.parse(JSON.stringify(B.result));
  r.configs[0].checks.push({ item: ITEM, requirement: "≥ 700 kVA", hsmtQuote: "", offered: "690 V: 777 kVA", sourceQuote: QUOTE, part: "alternator", status: "met", ...extra });
  return r;
};
const mine = (out) => out.result.configs[0].checks.find((x) => x.item === ITEM);

test("check: met dựa vào câu trích một nguồn → cần xác nhận (document), ghi URL + bậc; không bao giờ đạt", () => {
  const out = run(withCheck({}), [fake]), x = mine(out);
  assert.equal(x.status, "confirm");
  assert.equal(x.confirm, "document");
  assert.equal(x.oneHold, "met");
  assert.deepEqual(x.oneSource, { ids: [fake.id], url: fake.url, level: 2 });
  assert.match(x.note, /một nguồn internet \(bậc 2: bản hãng do bên khác đăng lại\), không phải tờ hãng; cần nhà cung cấp xác nhận\./);
  assert.ok(!x.unverified);
  assert.ok(!out.problems.some((p) => p.includes(ITEM)), out.problems.join("\n"));
  // Không có bản ghi: câu trích không có trong nguồn nào → chưa khớp nguồn như trước.
  const no = mine(run(withCheck({}), []));
  assert.equal(no.status, "unclear");
  assert.ok(no.unverified);
  assert.ok(!no.oneSource);
});

test("check: không đạt dựa vào một nguồn cũng thành cần xác nhận; số ngoài bản ghi vẫn bị đánh dấu", () => {
  const x = mine(run(withCheck({ status: "not_met" }), [fake]));
  assert.equal(x.status, "confirm");
  assert.equal(x.oneHold, "not_met");
  const bad = mine(run(withCheck({ offered: "690 V: 900 kVA" }), [fake]));
  assert.equal(bad.status, "unclear");
  assert.ok(bad.unverified);
});

test("check: check nêu URL của bản ghi cũng hạ; chạy lại check trên kết quả ra cùng JSON", () => {
  const r = JSON.parse(JSON.stringify(B.result)), own = r.configs[0].checks.find((y) => y.status === "met" && y.part === "alternator" && y.sourceQuote);
  own.note = `Theo ${fake.url}`;
  const x = run(r, [fake]).result.configs[0].checks.find((y) => y.item === own.item);
  assert.equal(x.status, "confirm");
  assert.equal(x.oneHold, "met");
  const once = run(withCheck({}), [fake]).result, twice = run(JSON.parse(JSON.stringify(once)), [fake]).result;
  assert.equal(JSON.stringify(twice), JSON.stringify(once));
});

test("check: mọi check khác của mọi cấu hình giống hệt có / không có bản ghi một nguồn", () => {
  const strip = (res) => JSON.stringify(res.configs.map((c) => (c.checks || []).filter((x) => x.item !== ITEM)));
  assert.equal(strip(run(withCheck({}), [fake]).result), strip(run(withCheck({}), []).result));
  assert.equal(JSON.stringify(run(JSON.parse(JSON.stringify(B.result)), [fake]).result), JSON.stringify(run(JSON.parse(JSON.stringify(B.result)), []).result));
});
