import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { prepDir, guardDirs, taskReadRule } from "./agent-read.mjs";
import { lineCount } from "./read-guard.mjs";

let id = 0;
const L = (o) => JSON.stringify(o);
const read = (file, num, total) => {
  const tid = `t${++id}`;
  return [L({ type: "assistant", message: { content: [{ type: "tool_use", id: tid, name: "Read", input: { file_path: file } }] } }),
    L({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: tid, content: "x" }] }, tool_use_result: { type: "text", file: { filePath: file, content: "a\n".repeat(num - 1) + "a", numLines: num, startLine: 1, totalLines: total } } })];
};
const END = L({ type: "result", subtype: "success", is_error: false, num_turns: 5, total_cost_usd: 1 });
const lines = (f) => lineCount(fs.readFileSync(f, "utf8"));
const mk = (n) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ar-"));
  fs.writeFileSync(path.join(d, "input.md"), Array.from({ length: n }, (_, i) => `## Mục ${i}\n${"chữ ".repeat(2500)}\n`).join(""), "utf8");
  fs.writeFileSync(path.join(d, "TASK.md"), "# Phân tích\n1. Đọc input.md\n", "utf8");
  return d;
};

test("prepDir: input.md chia phần, read-order.json, TASK.md có cách đọc (chạy lại không nhân đôi)", () => {
  const d = mk(20);
  const files = prepDir(d);
  assert.ok(files.length > 1 && files.every((f) => /^input-\d+\.md$/.test(f)));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(d, "read-order.json"), "utf8")), files);
  assert.equal(files.map((f) => fs.readFileSync(path.join(d, f), "utf8")).join(""), fs.readFileSync(path.join(d, "input.md"), "utf8"));
  prepDir(d);
  const task = fs.readFileSync(path.join(d, "TASK.md"), "utf8");
  assert.equal(task.split("Cách đọc (code kiểm").length, 2);
  assert.match(task, /input-1\.md/);
  assert.match(taskReadRule(["input.md"]), /input\.md/);
});

test("prepDir: input.md ngắn → một tệp; không có input.md → []", () => {
  const d = mk(1);
  assert.deepEqual(prepDir(d), ["input.md"]);
  assert.deepEqual(prepDir(fs.mkdtempSync(path.join(os.tmpdir(), "ar-"))), []);
});

test("guardDirs: hai thư mục một lượt — chỉ tính Read trong thư mục của gói", () => {
  const a = mk(20), b = mk(20);
  const fa = prepDir(a), fb = prepDir(b);
  // The agent read every part of a, but only the first part of b (and a's parts do not count for b).
  const log = [...fa.flatMap((f) => read(path.join(a, f), lines(path.join(a, f)), lines(path.join(a, f)))), ...read(path.join(b, fb[0]), lines(path.join(b, fb[0])), lines(path.join(b, fb[0]))), END].join("\n");
  const [ra, rb] = guardDirs([a, b], log);
  assert.equal(ra.incomplete, false);
  assert.deepEqual(ra.notes, []);
  assert.equal(rb.incomplete, true);
  assert.match(rb.error, /chưa đọc hết input\.md/);
  assert.ok(rb.error.length <= 300);
  assert.match(rb.error, /Giữ kết quả cũ/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(b, "read-guard.json"), "utf8")).incomplete, true);
});

test("guardDirs: đường dẫn kiểu Windows, khác hoa thường vẫn tính", () => {
  const a = mk(1);
  prepDir(a);
  const win = a.replace(/\//g, "\\").toUpperCase() + "\\input.md";
  const [r] = guardDirs([a], [...read(win, lines(path.join(a, "input.md")), lines(path.join(a, "input.md"))), END].join("\n"));
  assert.equal(r.incomplete, false);
});

test("guardDirs: không đọc gì / Read ở thư mục khác → đọc thiếu; lượt dừng nhưng đọc đủ → giữ kết quả, có ghi chú", () => {
  const a = mk(1), other = mk(1);
  prepDir(a); prepDir(other);
  const n = lines(path.join(a, "input.md"));
  const [none] = guardDirs([a], [...read(path.join(other, "input.md"), n, n), END].join("\n"));
  assert.equal(none.incomplete, true);
  assert.match(none.error, /không đọc input\.md/);
  const [stopped] = guardDirs([a], read(path.join(a, "input.md"), n, n).join("\n")); // no result line: killed
  assert.equal(stopped.incomplete, false);
  assert.match(stopped.notes.join(" "), /dừng giữa chừng/);
});

test("guardDirs: thư mục không có read-order.json (lượt cũ) bị bỏ qua", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ar-"));
  assert.deepEqual(guardDirs([d], END), []);
  assert.equal(fs.existsSync(path.join(d, "read-guard.json")), false);
});

test("guardDirs: đường dẫn tương đối nối với thư mục chạy (--cwd, hoặc dòng init của log)", () => {
  const a = mk(1);
  prepDir(a);
  const n = lines(path.join(a, "input.md")), root = path.dirname(a), rel = `${path.basename(a)}/input.md`;
  const log = [...read(rel, n, n), END].join("\n");
  const [byCwd] = guardDirs([a], log, root);
  assert.equal(byCwd.incomplete, false);
  const init = L({ type: "system", subtype: "init", cwd: root.replace(/\//g, "\\") });
  const [byInit] = guardDirs([a], [init, ...read(rel, n, n), END].join("\n"));
  assert.equal(byInit.incomplete, false);
  // No cwd known: a relative path cannot be placed, so it does not count (reported as missing, the safe side).
  const [none] = guardDirs([a], log);
  assert.equal(none.incomplete, true);
  // A relative path of another folder does not count.
  const [other] = guardDirs([a], [...read("zzz/input.md", n, n), END].join("\n"), root);
  assert.equal(other.incomplete, true);
});
