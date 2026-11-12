// Gợi ý giá đấu: no silent cut (cut guard, điều phối 2026-11-12). fitPart instead of slice(0, 60000); input.md and
// samples.md cut for Read and checked in the run's log; notes in the result.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as RG from "./read-guard.mjs";
import { fitPart, writeForRead, agentInput, NOTE_MAX } from "./config-bot.mjs";
import { check, TP_MAX } from "./bidprice-bot.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "cutguard-"));

test("fitPart: a text that fits comes back whole, no note", () => {
  const r = fitPart("a\nb\nc\n", 100);
  assert.equal(r.text, "a\nb\nc\n");
  assert.deepEqual(r.dropped, []);
  assert.equal(r.note, "");
});

test("fitPart: the window with the figures, whole lines, the lines left out named with their figures", () => {
  const filler = Array.from({ length: 200 }, (_, i) => `Điều ${i} chỉ dẫn nhà thầu không có số liệu kỹ thuật.`).join("\n");
  const specs = Array.from({ length: 30 }, (_, i) => `Máy ${i}: công suất liên tục 500 kVA, động cơ 6 xi lanh, đầu phát Stamford`).join("\n");
  const text = `${filler}\n${specs}\nHết.\n`;
  const r = fitPart(text, 4000);
  assert.ok(r.text.length <= 4000);
  assert.ok(r.text.startsWith("Điều") || r.text.startsWith("Máy"), "starts at a line start");
  assert.ok(r.text.endsWith("\n"), "ends at a line end");
  assert.ok(text.includes(r.text));
  // Every figure line kept: the figures are at the end, the first 4,000 characters have none.
  assert.ok(r.text.includes("Máy 0:") && r.text.includes("Máy 29:"));
  assert.equal(r.hits, 0);
  assert.equal(r.lines, 231);
  assert.equal(r.dropped[0][0], 1);
  assert.match(r.note, /^\(đã lược: dòng 1–\d+ \/ 231 của phần này/);
  // Figures only at the start: the first window, the tail named.
  const r2 = fitPart(`${specs}\n${filler}\n`, 4000);
  assert.ok(r2.text.startsWith("Máy 0:"));
  assert.ok(r2.dropped.at(-1)[1] === 230);
});

test("fitPart: figures on both sides — the part left out counts its figures", () => {
  const block = (n) => Array.from({ length: 40 }, (_, i) => `Mục ${n}.${i}: công suất dự phòng 400 kVA`).join("\n");
  const r = fitPart(`${block(1)}\n${"x ".repeat(3000)}\n${block(2)}\n`, 2500);
  assert.ok(r.hits > 0);
  assert.match(r.note, new RegExp(`phần lược có ${r.hits} chỗ thông số`));
});

test("bidprice: TP_MAX stays 60,000 (what the agent read before)", () => assert.equal(TP_MAX, 60000));

test("bidprice check: the code's cut note follows the agent's notes", () => {
  const dir = tmp();
  const list = [{ id: "S1", key: "IB1", k: 500, ratio: 0.9, bidders: ["a", "b"], name: "Máy phát 500 kVA Cummins", goods: [] }];
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: 500, price: 1e9 }, total: 1, list, prior: [], cutNotes: ["Phần kỹ thuật HSMT dài hơn 60.000 ký tự: agent không được đọc dòng 1031–1088 / 1088 của phần đó (8 chỗ thông số)."] }));
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ tender: { summary: "x" }, notes: ["ghi chú agent"], samples: [{ id: "S1", level: "different", quote: "" }] }));
  const { result } = check(dir);
  assert.deepEqual(result.notes.map((n) => n.slice(0, 20)), ["ghi chú agent", "Phần kỹ thuật HSMT d"]);
  // An older samples.json (no cutNotes): as before.
  const old = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8"));
  delete old.cutNotes;
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify(old));
  assert.deepEqual(check(dir).result.notes, ["ghi chú agent"]);
});

// A stream-json log line ("[Ns] {json}" or the JSON alone, as spawnSync gives it).
let id = 0;
const L = (o) => JSON.stringify(o);
const read = (file, start, num, total) => {
  const tid = `t${++id}`;
  return [L({ type: "assistant", message: { content: [{ type: "tool_use", id: tid, name: "Read", input: { file_path: file } }] } }),
    L({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: tid, content: "x" }] }, tool_use_result: { type: "text", file: { filePath: file, content: "a\n".repeat(num - 1) + "a", numLines: num, startLine: start, totalLines: total } } })];
};

test("bidprice run folder: samples.md read by parts, one part skipped → a short note with the button of Gợi ý giá đấu", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "prompt.md"), "# Gợi ý giá đấu\nHƯỚNG DẪN");
  const samples = Array.from({ length: 60 }, (_, i) => `## S${i + 1}\n${"Gói máy phát điện 500 kVA, chủ đầu tư X, giá trúng 1.000.000.000 đ. ".repeat(12)}`).join("\n\n");
  const order = [...writeForRead(dir, "input.md", "# Gói thầu\nx\n"), ...writeForRead(dir, "samples.md", samples)];
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(order));
  assert.ok(order.length >= 3 && order[1] === "samples-1.md");
  const files = RG.partsMap(dir), lines = (f) => fs.readFileSync(path.join(dir, f), "utf8").split("\n").length;
  const end = L({ type: "result", subtype: "success", is_error: false, num_turns: 6, total_cost_usd: 0.8 });
  const all = [...read(path.join(dir, "input.md"), 1, 2, 2), ...order.slice(1).flatMap((f) => read(path.join(dir, f), 1, lines(f), lines(f))), end].join("\n");
  assert.deepEqual(RG.guardRun(dir, all).notes, []);
  const skip = [...read(path.join(dir, "input.md"), 1, 2, 2), ...order.slice(1, -1).flatMap((f) => read(path.join(dir, f), 1, lines(f), lines(f))), end].join("\n");
  const g = RG.guardRun(dir, skip, { label: "máy 500 kVA", risk: "mức giống/gần của gói cũ có thể sai", again: "bấm Gợi ý giá đấu lại" });
  assert.equal(g.notes.length, 1);
  assert.match(g.notes[0], /^Agent chưa đọc hết samples\.md \(máy 500 kVA\) \(thiếu dòng \d+–\d+ \/ \d+\): mức giống\/gần của gói cũ có thể sai — bấm Gợi ý giá đấu lại\.$/);
  assert.ok(g.notes[0].length <= NOTE_MAX);
  assert.equal(files[1].name, "samples.md");
  // No result line (killed at 25 minutes): stopped.
  assert.match(RG.stoppedNote(RG.readTrace(all.split("\n").slice(0, -1).join("\n")).end), /không có dòng kết thúc/);
});

test("agentInput without scripts (Gợi ý giá đấu: no Bash): no scripts/ folder, no hsmt.txt line, names every split file", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "prompt.md"), "# Gợi ý giá đấu");
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(["input-1.md", "input-2.md", "samples-1.md", "samples-2.md"]));
  const m = agentInput(dir, "chỉ ghi result.json", { scripts: false });
  assert.ok(!fs.existsSync(path.join(dir, "scripts")));
  assert.doesNotMatch(m, /scripts\/|hsmt\.txt/);
  assert.match(m, /chỉ ghi result\.json\./);
  assert.match(m, /input-N\.md \/ samples-N\.md là input\.md \/ samples\.md cắt theo mục/);
  // Gợi ý cấu hình (hsmt.txt there, scripts on): its lines as before.
  fs.writeFileSync(path.join(dir, "hsmt.txt"), "x");
  const c = agentInput(dir);
  assert.match(c, /hsmt\.txt và controllers\.md/);
  assert.match(c, /scripts\//);
});
