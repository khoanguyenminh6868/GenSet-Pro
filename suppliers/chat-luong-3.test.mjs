// node --test suppliers/chat-luong-3.test.mjs — bố cục mã chưa hiểu thì để thiếu và ghi vào danh sách chưa đọc được
// (chat-luong-3, Khoa 18/11/2026: phương án C + giữ 6 số đúng). Dòng thật ở suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = (header, rows, title = "", role = "genset_oem") => ({ id: "t", role, country: "CN", names: { en: "Test" }, specTables: [{ n: 101, title, header, rows }] });
const read = (...a) => { const notes = []; const out = C.fromSupplier(sup(...a), notes); return { out, notes }; };
const spec = (u, k) => u.specs.find((s) => s.key === k)?.value;

test("L3B gb-power n1001: the page footer 'GB POWER | 3/4' is no 4 kVA / 3 kW rating; the sheet's own ratings stay", () => {
  const rows = ["Standard Features", "| MODEL | GB-P10", "| Standby Power(50Hz) | 8.8KW/11KVA", "| Prime Power(50Hz) | 8KW/10KVA", "| Engine | PERKINS 403D-11G",
    "| Alternator | STAMFORD PI044E", "| Copyright By GB POWER | 1/4", "| GB POWER | 3/4", "| Engine Model | 403D-11G"];
  const { out, notes } = read([], rows, "Datasheet: GB-P10.doc-1.pdf");
  const e = out.find((u) => u.kind === "engine");
  assert.equal(e.model, "403D-11G");
  assert.deepEqual(e.power, { prime: { kW: 8, kVA: 10 }, standby: { kW: 8.8, kVA: 11 } });
  assert.ok(notes.some((x) => x.reason === "cặp a/b dưới nhãn không ghi mức / đơn vị" && /3\/4/.test(x.detail)));
});

test("L3B keeps 'a/b' under a rating written as ESP / PRP with the unit in its own cell (westinpower)", () => {
  const { out } = read([], ["| Model | 4016-61TRG3", "| Engine Model | 4016-61TRG3", "| Power(ESP) | kVA/kw | 2500/2000", "| Power(PRP) | kVA/kw | 2250/1800"]);
  const e = out.find((u) => u.kind === "engine");
  assert.deepEqual(e.power.standby, { kVA: 2500, kW: 2000 });
  assert.deepEqual(e.power.prime, { kVA: 2250, kW: 1800 });
});
