// node --test suppliers/*.test.mjs — less re-reading in a "Gợi ý cấu hình" run (2026-11-12, token-do.md): files cut
// under the Read limit, the instructions in the first message, controller functions looked up before the run, and
// how to fix what check prints. None of it changes what check() decides.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { splitForRead, writeForRead, READ_MAX, agentInput, ctlLineFor, ctlLookupMd, fixNotes } from "./config-bot.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "agent-waste-"));

test("splitForRead: every part under the limit, at headings first, the parts together are the text word for word", () => {
  const sec = (h, n, w = 90) => `## ${h}\n\n` + Array.from({ length: n }, (_, i) => `### ${h} ${i}\n` + "x".repeat(w) + "\n").join("");
  const text = `# Danh mục\n\n${sec("Ứng viên", 300)}${sec("Thông số theo model", 50)}${sec("Bộ điều khiển", 10)}`;
  const parts = splitForRead(text, 10000);
  assert.ok(parts.length > 2);
  assert.ok(parts.every((p) => p.length <= 10000));
  assert.equal(parts.join(""), text);
  assert.ok(parts.slice(1).every((p) => /^##/.test(p)), "each part starts at a heading");
  // One line longer than the limit is still cut, nothing lost.
  const long = "a".repeat(25000) + "\nb\n";
  assert.equal(splitForRead(long, 10000).join(""), long);
  assert.ok(splitForRead(long, 10000).every((p) => p.length <= 10000));
  assert.deepEqual(splitForRead("ngắn"), ["ngắn"]);
});

test("writeForRead: the whole file stays for the code and grep, the parts are written only when needed, old parts go", () => {
  const dir = tmp(), big = Array.from({ length: 4 }, (_, i) => `## M${i}\n` + "y".repeat(READ_MAX - 100) + "\n").join("");
  fs.writeFileSync(path.join(dir, "catalog-9.md"), "cũ");
  const files = writeForRead(dir, "catalog.md", big);
  assert.deepEqual(files, ["catalog-1.md", "catalog-2.md", "catalog-3.md", "catalog-4.md"]);
  assert.equal(fs.readFileSync(path.join(dir, "catalog.md"), "utf8"), big);
  assert.equal(files.map((f) => fs.readFileSync(path.join(dir, f), "utf8")).join(""), big);
  assert.ok(!fs.existsSync(path.join(dir, "catalog-9.md")));
  assert.deepEqual(writeForRead(dir, "catalog.md", "nhỏ"), ["catalog.md"]);
  assert.ok(!fs.readdirSync(dir).some((f) => /^catalog-\d+\.md$/.test(f)));
});

test("agentInput: the instructions in the message, then the files in order; no 'read prompt.md'", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "prompt.md"), "# Gợi ý cấu hình\nHƯỚNG DẪN");
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(["input.md", "catalog-1.md", "catalog-2.md", "ctl-lookup.md"]));
  const t = agentInput(dir);
  assert.ok(t.startsWith("# Gợi ý cấu hình\nHƯỚNG DẪN"));
  assert.match(t, /input\.md, catalog-1\.md, catalog-2\.md, ctl-lookup\.md/);
  assert.match(t, /không cần mở lại/);
  assert.match(t, /scripts\//);
  assert.match(t, /không có python/);
  assert.ok(fs.existsSync(path.join(dir, "scripts")));
  // A folder of an older prep (no read-order.json): the old message.
  const old = tmp();
  fs.writeFileSync(path.join(old, "prompt.md"), "x");
  assert.match(agentInput(old), /^Đọc prompt\.md/);
});

const sheet = (lines) => lines.map((line) => ({ key: "ctl", line, supplierId: "deep-sea-electronics", n: 1002 }));
const DSE = sheet(["Operating Current 12V", "The event log records 250 events", "Over voltage and under voltage alarms", "Emergency stop", "RS485 MODBUS RTU"]);

test("ctlLineFor: the hint's search (module specs left out, words in their order)", () => {
  assert.equal(ctlLineFor(DSE, [/event log|events/i]).line, "The event log records 250 events");
  assert.equal(ctlLineFor(DSE, [/operating current/i]), null);
  assert.equal(ctlLineFor(DSE, [/nothing/i, /RS-?485/i]).line, "RS485 MODBUS RTU");
});

test("ctlLookupMd: the HSMT's controller functions × each datasheet, the line with its factSrc or none", () => {
  const HSMT = "Chương V. Yêu cầu kỹ thuật\nBộ điều khiển:\n- Nhật ký sự kiện: lưu tối thiểu 50 sự kiện\n- Bảo vệ quá áp\n- Cổng SNMP\n- Dừng khẩn cấp";
  const md = ctlLookupMd(["DSE7320"], () => DSE, HSMT);
  assert.match(md, /F\d: "- Nhật ký sự kiện: lưu tối thiểu 50 sự kiện"/);
  assert.match(md, /## DSE7320/);
  assert.match(md, /- F\d: \{ "supplierId": "deep-sea-electronics", "n": 1002, "line": "The event log records 250 events" \}/);
  assert.match(md, /"line": "Emergency stop" \}/);
  assert.match(md, /- không thấy dòng nào: F\d/, "SNMP is in no line");
  assert.equal(ctlLookupMd(["DSE7320"], () => DSE, "Chương V. Yêu cầu kỹ thuật\nĐường kính xi lanh 128 mm"), "");
  assert.equal(ctlLookupMd([], () => DSE, HSMT), "");
});

test("fixNotes: one note per kind of problem, and the numbers of each quote a 'số' problem is about", () => {
  const result = { configs: [{ rank: 1, checks: [{ item: "Dung tích xi lanh", offered: "11,05 L", sourceQuote: "| Displacement | 11.051 L |" }] }] };
  const t = fixNotes(["#1 Dung tích xi lanh: số 11.05", "#2 Kiểu động cơ: câu trích nguồn", "#2 Ổ đỡ: factSrc không phải dòng ghi thông số của model này"], result);
  assert.match(t, /CÁCH SỬA — 3 loại/);
  assert.match(t, /#1 Dung tích xi lanh: câu trích "\| Displacement \| 11\.051 L \|" có các số \[11\.051\]/);
  assert.equal(fixNotes([], result), "");
});
