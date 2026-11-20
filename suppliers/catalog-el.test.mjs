// node --test suppliers/catalog-el.test.mjs — eastern-lion-fuan: "EL / ELS + 3 số" là mã đầu phát của chính NCC (OWN_ALT, chỉ
// danh sách bảng của NCC này) và bảng "EL Series" n156 cho bản ghi đầu phát (ALT_TABLES). Khoa 20/11/2026 (câu 1 = B, câu 2).
// Dòng lấy nguyên văn từ suppliers/cn/eastern-lion-fuan.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const EL = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", "eastern-lion-fuan.json"), "utf8"));
const sup = (id, tables) => ({ id, country: "CN", role: "genset_maker", names: { en: id }, specTables: tables });
const T116 = {
  n: 116, title: "Engine By Kofo Series | EASTERNLION",
  header: ["| | Genset Specification 400/230V 50HZ | Engine | Brushless Alternator | Controller | Datasheet", "| Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller | Datasheet"],
  rows: ["| GF/GFS-KF10 | 10 | 13 | 11 | 14 | K4100DS | 30.1 | EL 164C | 10.8KW | RUIFEN6120 | Detail"],
};
const T147 = {
  n: 147, title: "Engine By Woling Series — Generator set specification sheet | Fuan EASTERNLION Electric Machines Co., Ltd",
  header: ["| | Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model | Alternator power (kW) | Controller"],
  rows: ["| GF/GFS-WL128 | 128 | 160 | 142 | 178 | D114系列WLD171 | 171KW | EL 274F | 128 | Smartgen 6120"],
};
const T156 = {
  n: 156, title: "EL Series Brushless Alternator | EASTERNLION",
  header: ["| | Model | 50Hz Output (kW) | 50Hz Output (kVA) | 60Hz Output (kW) | 60Hz Output (kVA) | SAE Size | Core Length (mm)"],
  rows: ["| EL 164A | 6.5 | 8.1 | 7.8 | 9.7 | 4#7.5 | 65", "| El 164C | 10.8 | 13.5 | 13 | 16.2 | 100 |"],
};

test("bảng tổ máy eastern-lion: EL là đầu phát, RUIFEN6120 không thành đầu phát", () => {
  const r = C.fromSupplier(sup("eastern-lion-fuan", [T116]));
  const eng = r.find((o) => o.kind === "engine"), alt = r.filter((o) => o.kind === "alternator");
  assert.equal(eng.model, "K4100DS");
  assert.equal(eng.other, "EL 164C");
  assert.deepEqual(alt.map((o) => o.model), ["EL 164C"]);
});

test("ô động cơ không đọc được thì EL không bị đọc thành động cơ", () => {
  const r = C.fromSupplier(sup("eastern-lion-fuan", [T147]));
  assert.equal(r.filter((o) => o.kind === "engine").length, 0);
  assert.deepEqual(r.filter((o) => o.kind === "alternator").map((o) => o.model), ["EL 274F"]);
});

test("NCC khác với cùng bảng: không áp danh sách (luật chỉ của eastern-lion)", () => {
  const a = C.fromSupplier(sup("ncc-khac", [T116, T147, T156]));
  assert.ok(!a.some((o) => o.n === 156), "n156 chỉ đọc cho eastern-lion");
  // Không có OWN_ALT: đọc y như trước PR (mã EL không là mã đầu phát của luật chung).
  assert.deepEqual(a.map((o) => `${o.kind}:${o.model}:${o.other}`), ["engine:K4100DS:null", "engine:EL 274F:null"]);
});

test("n156 EL Series: mỗi dòng hai bản ghi đầu phát 50 / 60 Hz, mức rated, đúng số trang", () => {
  const r = C.fromSupplier(sup("eastern-lion-fuan", [T156]));
  assert.equal(r.length, 4);
  const a = r.find((o) => o.model === "EL 164A" && o.freq === 60);
  assert.equal(a.kind, "alternator");
  assert.deepEqual(a.power, { rated: { kW: 7.8, kVA: 9.7 } });
  assert.ok(!a.fromLine, "không phải dòng máy (fromLine)");
  assert.deepEqual(r.find((o) => o.model === "El 164C" && o.freq === 50).power, { rated: { kW: 10.8, kVA: 13.5 } });
});

test("n156 đổi tiêu đề thì không đọc, có note", () => {
  const notes = [];
  const r = C.fromSupplier(sup("eastern-lion-fuan", [{ ...T156, header: ["| | Model | 50Hz Output (kW) | 50Hz Output (kVA) | SAE Size"] }]), notes);
  assert.equal(r.length, 0);
  assert.ok(notes.some((n) => /đổi tiêu đề/.test(JSON.stringify(n))));
});

test("hồ sơ thật: n156 cho 98 bản ghi, không còn EL ở vai động cơ, không còn RUIFEN6120 ở vai đầu phát", () => {
  const r = C.fromSupplier(EL);
  assert.equal(r.filter((o) => o.n === 156).length, 98);
  assert.equal(r.filter((o) => o.kind === "engine" && /^ELS?\s?\d{3}/i.test(o.model)).length, 0);
  assert.equal(r.filter((o) => o.kind === "alternator" && /RUIFEN/i.test(o.model)).length, 0);
});
