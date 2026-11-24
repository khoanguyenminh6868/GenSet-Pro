// node --test suppliers/linz-noi-model.test.mjs — linz-noi-model (điều phối 24/11/2026): tiêu đề tờ Linz "PRO18S C/4" ra ĐÚNG MỘT mã
// như tờ ghi ("PRO18SC/4" sau keyOf), không còn rút về khung "PRO18S" (ba tờ A/B/C cùng một khoá). Chỉ nối tờ với model khi mã
// trùng chính xác sau keyOf; tiêu đề hãng khác không đổi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { titleModelKeys, modelFacts } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const none = new Set();

test("tiêu đề Linz ra đúng một mã, đủ khung + cuộn dây / cực", () => {
  assert.deepEqual(titleModelKeys("Datasheet: PRO18S C/4", none), ["PRO18SC/4"]);
  assert.deepEqual(titleModelKeys("Datasheet: ALTERNATOR PRO18L G/4", none), ["PRO18LG/4"]);
  assert.deepEqual(titleModelKeys("Datasheet: ALTERNATOR PRO40S A/4", none), ["PRO40SA/4"]);
  assert.equal(C.keyOf("Linz PRO18S C/4".replace("Linz ", "")), "PRO18SC/4");
});

test("ba tờ cùng khung ra ba khoá khác nhau", () => {
  const k = ["A", "B", "C"].map((w) => titleModelKeys(`Datasheet: PRO18S ${w}/4`, none)[0]);
  assert.equal(new Set(k).size, 3);
});

test("tiêu đề khác giữ như cũ (không ghép, không đổi)", () => {
  assert.deepEqual(titleModelKeys("Datasheet: PRO18S", none), ["PRO18S"]);
  assert.deepEqual(titleModelKeys("TAL-A46 C/4 datasheet", none), ["TALA46"]);
  assert.deepEqual(titleModelKeys("6M31G825/5 - Baudouin", new Set(["6M31G825/5"])), ["6M31G825/5"]);
  assert.deepEqual(titleModelKeys("PRO18S X/4", none), ["PRO18S"]);
  assert.deepEqual(titleModelKeys("WT544C - Technical Data Sheet", none), ["WT544C"]);
});

test("mọi bảng của mọi hồ sơ hãng: chỉ tờ linz-electric đổi (cũ ↔ mới)", () => {
  const old = (title, pk) => [...new Set(String(title || "").split(/[\s:–—|,()]+/).flatMap((w) => (pk.has(C.keyOf(w)) ? [w] : w.split("/"))).filter((w) => C.isCode(w)).map((w) => C.keyOf(w)))];
  const dir = new URL("./cn/", import.meta.url);
  const changed = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const s = JSON.parse(fs.readFileSync(new URL(f, dir), "utf8"));
    for (const t of s.specTables || []) if (JSON.stringify(old(t.title, none)) !== JSON.stringify(titleModelKeys(t.title, none))) changed.push(`${s.id}#${t.n}`);
  }
  assert.ok(changed.length > 0 && changed.every((x) => x.startsWith("linz-electric#")), changed.filter((x) => !x.startsWith("linz-electric#")).join(", "));
});

test("nối model chỉ khi trùng chính xác khoá: danh mục có PRO18SC/4 thì tờ C/4 gắn, tờ A/4 và model gần giống thì không", () => {
  const sheet = (n, w) => ({ n, title: `Datasheet: PRO18S ${w}/4`, header: [], rows: [`PRO18S ${w}/4`, "| Insulation Class | H", "| Protection | IP23"] });
  const sup = { id: "linz-electric", country: "CN", role: "alternator_maker", specTables: [sheet(1005, "A"), sheet(1007, "C")] };
  const cat = { engines: [], alternators: [{ key: "PRO18SC/4", uses: [] }, { key: "PRO18SB/4", uses: [] }, { key: "PRO18S", uses: [] }] };
  const facts = modelFacts(cat, [sup]);
  const of = (k) => (facts.get(`alternator:${k}`) || []).map((f) => f.n);
  assert.ok(of("PRO18SC/4").length > 0 && of("PRO18SC/4").every((n) => n === 1007));
  assert.deepEqual(of("PRO18SB/4"), []);
  assert.deepEqual(of("PRO18S"), []);
});
