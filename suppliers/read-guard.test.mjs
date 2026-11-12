import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as RG from "./read-guard.mjs";
import { splitForRead, writeForRead, readSize, READ_MAX, coverNotes, agentInput } from "./config-bot.mjs";

// A stream-json log as config-bot.mjs writes it: "[Ns] {json}" per line.
let id = 0;
const L = (o) => `[${id}s] ${JSON.stringify(o)}`;
const read = (file, { offset, limit, start = 1, num, total, err } = {}) => {
  const tid = `t${++id}`;
  const use = L({ type: "assistant", message: { content: [{ type: "tool_use", id: tid, name: "Read", input: { file_path: file, ...(offset != null ? { offset } : {}), ...(limit != null ? { limit } : {}) } }] } });
  const res = err
    ? L({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: tid, is_error: true, content: err }] }, tool_use_result: `Error: ${err}` })
    : L({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: tid, content: "x" }] }, tool_use_result: { type: "text", file: { filePath: file, content: "a\n".repeat(num - 1) + "a", numLines: num, startLine: start, totalLines: total } } });
  return [use, res];
};
const bash = (command, out) => { const tid = `t${++id}`; return [L({ type: "assistant", message: { content: [{ type: "tool_use", id: tid, name: "Bash", input: { command } }] } }), L({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: tid, content: out }] } })]; };
const END = L({ type: "result", subtype: "success", is_error: false, num_turns: 9, total_cost_usd: 1.5 });

test("readTrace: lines got, silent cut, refused, end", () => {
  const log = [...read("C:\\t\\input.md", { num: 321, total: 447 }), ...read("C:\\t\\catalog.md", { offset: 216, limit: 520, err: "File content (29666 tokens) exceeds maximum allowed tokens (25000)." }), END].join("\n");
  const t = RG.readTrace(log);
  assert.equal(t.reads.length, 2);
  assert.deepEqual([t.reads[0].start, t.reads[0].num, t.reads[0].total], [1, 321, 447]);
  assert.ok(t.reads[1].refused);
  assert.equal(t.end.subtype, "success");
  assert.equal(t.end.turns, 9);
});

test("coverage: IB2600592684 04/11 — input.md 1–321 / 446 is caught", () => {
  const log = [...read("C:\\t\\input.md", { num: 321, total: 447 }), END].join("\n");
  const cov = RG.coverage(RG.readTrace(log), [{ name: "input.md", lines: 446, parts: [] }]);
  assert.deepEqual(cov[0].missing, [[322, 446]]);
  const notes = RG.readNotes(cov, RG.readTrace(log).end);
  assert.match(notes[0], /chưa đọc hết input\.md \(thiếu dòng 322–446 \/ 446\)/);
});

test("coverage: parts read whole cover the whole file; a missing part is named by whole-file lines", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rg-"));
  const text = Array.from({ length: 30 }, (_, i) => `## M${i}\n${"chữ ".repeat(3000)}\n`).join("");
  const files = writeForRead(dir, "catalog.md", text);
  assert.ok(files.length > 1);
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(files));
  const map = RG.partsMap(dir);
  assert.equal(map[0].name, "catalog.md");
  assert.equal(map[0].lines, RG.lineCount(text));
  const all = files.flatMap((f) => read(path.join(dir, f), { num: RG.lineCount(fs.readFileSync(path.join(dir, f), "utf8")), total: RG.lineCount(fs.readFileSync(path.join(dir, f), "utf8")) }));
  assert.equal(RG.guardRun(dir, [...all, END].join("\n")).notes.length, 0);
  const skip = files.slice(1).flatMap((f) => read(path.join(dir, f), { num: RG.lineCount(fs.readFileSync(path.join(dir, f), "utf8")), total: 1 }));
  const g = RG.guardRun(dir, [...skip, END].join("\n"));
  assert.equal(g.notes.length, 1);
  assert.match(g.notes[0], /chưa đọc hết catalog\.md \(thiếu dòng 1–\d+ \//);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("coverage: the whole file read instead of its parts counts; Bash head/cut/tail -c do not", () => {
  const log = [...bash('cat input.md | head -c 30000', "…"), ...bash("sed -n 1,500p catalog.md | cut -c1-500", "…"), ...bash("sed -n 1,200p input.md", "ok"), END].join("\n");
  const cov = RG.coverage(RG.readTrace(log), [{ name: "input.md", lines: 300, parts: [] }, { name: "catalog.md", lines: 500, parts: [] }]);
  assert.deepEqual(cov[0].missing, [[201, 300]]);
  assert.equal(cov[1].read, false);
  // A shell read whose output was cut (persisted, 2 KB preview) does not count either.
  const cut = RG.readTrace(bash("cat input.md", "<persisted-output>\nOutput too large (40KB)").join("\n"));
  assert.equal(RG.coverage(cut, [{ name: "input.md", lines: 300, parts: [] }])[0].read, false);
});

test("stopped run: no result line, error end, runner timeout", () => {
  assert.match(RG.stoppedNote(null), /không có dòng kết thúc/);
  assert.match(RG.stoppedNote({ subtype: "error_max_turns", isError: true }), /error_max_turns/);
  assert.equal(RG.stoppedNote({ subtype: "success", isError: false }), "");
  assert.equal(RG.stoppedNote({ subtype: "success" }, "quá 40 phút"), "quá 40 phút");
  const notes = RG.readNotes([], null, { label: "máy 500 kVA" });
  assert.match(notes[0], /máy 500 kVA.*bị dừng giữa chừng/);
});

test("splitForRead: no character lost, a single line longer than the limit is cut inside, Chinese weighs more", () => {
  const long = "x".repeat(READ_MAX * 2 + 123);
  const t = `## a\n${long}\n## b\nend\n`;
  const p = splitForRead(t);
  assert.equal(p.join(""), t);
  assert.ok(p.every((x) => readSize(x) <= READ_MAX));
  const cn = Array.from({ length: 2000 }, (_, i) => `- 柴油发电机组 ${i} 国二 排放\n`).join("");
  const q = splitForRead(cn);
  assert.equal(q.join(""), cn);
  assert.ok(q.every((x) => readSize(x) <= READ_MAX));
  assert.ok(readSize("柴油") === 3);
});

test("coverNotes: missing codes, uncovered lines, a requirement with no check in a configuration", () => {
  const result = { requirements: [{ item: "Công suất liên tục", level: "core" }, { item: "Bồn dầu", level: "option" }, { item: "Xuất xứ", byCode: true }],
    configs: [{ rank: 1, checks: [{ item: "Công suất liên tục" }] }, { rank: 2, checks: [] }] };
  const n = coverNotes(result, { missing: [{ code: "noise", item: "Độ ồn", line: "Độ ồn ≤ 75 dB(A)" }], uncovered: ["- Độ ồn: 75 dB [chưa có yêu cầu về: độ ồn]"] });
  assert.equal(n.length, 3);
  assert.match(n[0], /Độ ồn — "Độ ồn ≤ 75 dB\(A\)"/);
  assert.match(n[2], /#2 \(Công suất liên tục\)/);
  assert.doesNotMatch(n[2], /#1|Bồn dầu|Xuất xứ/);
  assert.deepEqual(coverNotes({ requirements: [], configs: [] }), []);
});

test("agentInput forbids reading the files of read-order.json through the shell", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rg-"));
  fs.writeFileSync(path.join(dir, "prompt.md"), "P");
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(["input.md", "catalog-1.md"]));
  const m = agentInput(dir, "chỉ sửa result.json");
  assert.match(m, /KHÔNG được đọc bằng Bash/);
  assert.match(m, /chỉ sửa result\.json\./);
  fs.rmSync(dir, { recursive: true, force: true });
});
