// node --test suppliers/*.test.mjs — T2: hàm xuất ra của read-guard.mjs chưa có test nào nhắc tới:
// traceUnder, guardTrace, logFiles, logReport. Chốt chặn "agent đọc thiếu đầu vào" (IB2600592684 04/11: agent chỉ thấy input.md
// 321/446 dòng). Log dựng theo định dạng stream-json thật mà config-bot ghi: "[Ns] {json}".
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readTrace, traceUnder, guardTrace, logFiles, logReport } from "./read-guard.mjs";

let id = 0;
const L = (o) => `[${id}s] ${JSON.stringify(o)}`;
const INIT = (cwd) => L({ type: "system", subtype: "init", cwd });
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
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "cover-guard-"));

// ---------- traceUnder ----------
test("traceUnder: một lượt đọc nhiều thư mục (Phân tích HSMT) — chỉ tính tệp nằm trong thư mục đang xét", () => {
  const log = [...read("C:\\runs\\A\\input.md", { num: 10, total: 10 }), ...read("C:\\runs\\B\\input.md", { num: 5, total: 20 }), END].join("\n");
  const t = traceUnder(readTrace(log), "C:\\runs\\A");
  assert.equal(t.reads.length, 1);
  assert.equal(t.reads[0].num, 10);
  assert.equal(t.end.subtype, "success"); // phần còn lại của dấu vết giữ nguyên
});
test("traceUnder: thư mục A không nuốt thư mục A2 (so tiền tố có dấu /)", () => {
  const log = read("C:\\runs\\A2\\input.md", { num: 3, total: 3 }).join("\n");
  assert.equal(traceUnder(readTrace(log), "C:\\runs\\A").reads.length, 0);
});
test("traceUnder: không phân biệt hoa thường và kiểu gạch chéo (Windows)", () => {
  const log = read("c:/Runs/a/input.md", { num: 3, total: 3 }).join("\n");
  assert.equal(traceUnder(readTrace(log), "C:\\runs\\A\\").reads.length, 1);
});
test("traceUnder: đường dẫn tương đối ghép với cwd của lượt (dòng init) hoặc cwd truyền vào", () => {
  const log = [INIT("C:\\runs\\A"), ...read("./input.md", { num: 3, total: 3 }), ...read("input.md", { num: 2, total: 2 })].join("\n");
  const t = readTrace(log);
  assert.equal(traceUnder(t, "C:\\runs\\A").reads.length, 2);
  assert.equal(traceUnder(t, "C:\\runs\\B").reads.length, 0);
  // cwd truyền vào thắng cwd của dòng init
  assert.equal(traceUnder(t, "C:\\runs\\B", "C:\\runs\\B").reads.length, 2);
});
test("traceUnder: đường tương đối không biết cwd thì không tính; lệnh cat trong shell cũng lọc theo thư mục", () => {
  assert.equal(traceUnder(readTrace(read("input.md", { num: 1, total: 1 }).join("\n")), "C:\\runs\\A").reads.length, 0);
  const log = [...bash("cat C:\\runs\\A\\catalog.md", "ok"), ...bash("cat C:\\runs\\B\\catalog.md", "ok")].join("\n");
  assert.equal(traceUnder(readTrace(log), "C:\\runs\\A").shell.length, 1);
});

// ---------- guardTrace ----------
const folder = (name, lines) => { const d = tmp(); fs.writeFileSync(path.join(d, name), "dòng\n".repeat(lines)); fs.writeFileSync(path.join(d, "read-order.json"), JSON.stringify([name])); return d; };

test("guardTrace: đọc đủ và kết thúc success → không ghi chú", () => {
  const d = folder("input.md", 40);
  const g = guardTrace(d, readTrace([...read(path.join(d, "input.md"), { num: 40, total: 40 }), END].join("\n")));
  assert.deepEqual(g.notes, []);
  assert.deepEqual(g.cov[0].missing, []);
  fs.rmSync(d, { recursive: true, force: true });
});
test("guardTrace: đọc thiếu → ghi chú nêu dòng thiếu, kèm risk/again do lượt truyền (Giá gợi ý)", () => {
  const d = folder("input.md", 446);
  const g = guardTrace(d, readTrace([...read(path.join(d, "input.md"), { num: 321, total: 446 }), END].join("\n")), { label: "gói A", risk: "giá có thể lệch", again: "bấm Gợi ý giá lại" });
  assert.equal(g.notes.length, 1);
  assert.match(g.notes[0], /thiếu dòng 322–446 \/ 446/);
  assert.match(g.notes[0], /\(gói A\)/);
  assert.match(g.notes[0], /giá có thể lệch/);
  assert.match(g.notes[0], /bấm Gợi ý giá lại/);
  fs.rmSync(d, { recursive: true, force: true });
});
test("guardTrace: không đọc tệp nào → 'không đọc', kèm Read bị từ chối", () => {
  const d = folder("input.md", 100);
  const log = [...read(path.join(d, "input.md"), { err: "File content (29666 tokens) exceeds maximum allowed tokens (25000)." }), END].join("\n");
  const g = guardTrace(d, readTrace(log));
  assert.match(g.notes[0], /Agent không đọc input\.md/);
  assert.match(g.notes[0], /Read bị từ chối/);
  fs.rmSync(d, { recursive: true, force: true });
});
test("guardTrace: lượt bị dừng (không có dòng result) → ghi chú dừng giữa chừng dù đọc đủ", () => {
  const d = folder("input.md", 10);
  const g = guardTrace(d, readTrace(read(path.join(d, "input.md"), { num: 10, total: 10 }).join("\n")));
  assert.equal(g.notes.length, 1);
  assert.match(g.notes[0], /bị dừng giữa chừng/);
  fs.rmSync(d, { recursive: true, force: true });
});
test("guardTrace: thư mục không có read-order.json (lượt cũ) → không có cov, chỉ ghi chú về kết thúc", () => {
  const d = tmp();
  const g = guardTrace(d, readTrace(""));
  assert.deepEqual(g.cov, []);
  assert.equal(g.notes.length, 1); // không có dòng result
  assert.deepEqual(guardTrace(d, readTrace(END)).notes, []);
  fs.rmSync(d, { recursive: true, force: true });
});
test("guardTrace {under}: Read của thư mục khác không che khuất việc thư mục này chưa đọc", () => {
  const a = tmp(), b = tmp();
  for (const d of [a, b]) { fs.writeFileSync(path.join(d, "input.md"), "x\n".repeat(20)); fs.writeFileSync(path.join(d, "read-order.json"), '["input.md"]'); }
  const trace = readTrace([...read(path.join(b, "input.md"), { num: 20, total: 20 }), END].join("\n"));
  assert.match(guardTrace(a, trace, { under: true }).notes[0], /không đọc input\.md/);
  assert.deepEqual(guardTrace(b, trace, { under: true }).notes, []);
  // không có under: tệp trùng tên ở thư mục khác bị tính nhầm là đã đọc (khoá hành vi, vì thế phải dùng under)
  assert.deepEqual(guardTrace(a, trace).notes, []);
  for (const d of [a, b]) fs.rmSync(d, { recursive: true, force: true });
});

// ---------- logFiles ----------
test("logFiles: log không còn thư mục lượt — tệp và số dòng lấy từ totalLines của Read", () => {
  const log = [...read("C:\\t\\input.md", { num: 50, total: 50 }), ...read("C:\\t\\catalog.md", { num: 30, total: 30 })].join("\n");
  const f = logFiles(log);
  assert.deepEqual(f.map((x) => [x.name, x.lines]), [["input.md", 50], ["catalog.md", 30]]);
});
test("logFiles: tệp đọc theo phần (input-1, input-2) → gộp thành input.md, tổng dòng = tổng các phần, đúng thứ tự phần", () => {
  const log = [...read("C:\\t\\input-2.md", { num: 20, total: 20 }), ...read("C:\\t\\input-1.md", { num: 30, total: 30 })].join("\n");
  const f = logFiles(log).filter((x) => x.name === "input.md");
  assert.equal(f.length, 1); // input.md không xuất hiện hai lần
  assert.deepEqual(f[0].parts.map((p) => [p.name, p.from, p.lines]), [["input-1.md", 1, 30], ["input-2.md", 31, 20]]);
  assert.equal(f[0].lines, 50);
});
test("logFiles: tệp ctl-lookup.md chỉ liệt kê khi agent có mở; log rỗng thì input.md / catalog.md chưa rõ số dòng", () => {
  assert.deepEqual(logFiles("").map((x) => [x.name, x.lines]), [["input.md", null], ["catalog.md", null]]);
  assert.ok(logFiles(read("C:\\t\\ctl-lookup.md", { num: 5, total: 5 }).join("\n")).some((x) => x.name === "ctl-lookup.md"));
});

// ---------- logReport ----------
test("logReport: đọc thiếu input.md, đọc lặp catalog.md, Read bị từ chối, độ dài dòng", () => {
  const log = [
    ...read("C:\\t\\input.md", { num: 321, total: 446 }),
    ...read("C:\\t\\catalog.md", { num: 10, total: 10 }), ...read("C:\\t\\catalog.md", { num: 10, total: 10 }),
    ...read("C:\\t\\ctl-lookup.md", { err: "File too large to read" }),
    END,
  ].join("\n");
  const r = logReport(log);
  assert.deepEqual(r.refused, ["ctl-lookup.md"]);
  assert.deepEqual(r.again, ["catalog.md×2"]);
  const input = r.files.find((x) => x.name === "input.md");
  assert.deepEqual(input.missing, [[322, 446]]);
  assert.equal(r.end.turns, 9);
  assert.ok(r.notes.some((n) => /input\.md/.test(n)));
  assert.equal(typeof r.longest, "number");
});
test("logReport: đầu ra shell bị cắt ('Output too large') được đếm; log rỗng không ném", () => {
  const log = [...bash("cat C:\\t\\input.md", "<persisted-output>saved"), "Output too large"].join("\n");
  assert.equal(logReport(log).persisted, 2);
  const r = logReport("");
  assert.equal(r.end, null);
  assert.ok(r.notes.some((n) => /bị dừng/.test(n)));
});
