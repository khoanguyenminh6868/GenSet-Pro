// Chốt đọc cho agent của bot HSMT (Phân tích, Đối chiếu, HSDT… — thư mục có tệp AGENT; điều phối 2026-11-12).
// GenBid-Bot.ps1 Invoke-Agent gọi hai lệnh này (genbid-sync.js không import gì từ repo, nên việc nằm ở đây):
//
//   node suppliers/agent-read.mjs prep <thư mục>...             input.md chia phần ≤ mức Read đọc trọn (writeForRead),
//                                                               read-order.json, và đoạn "Cách đọc" nối vào TASK.md
//   node suppliers/agent-read.mjs guard --log <log> <thư mục>... đọc log stream-json của lượt (một lượt nhiều thư mục:
//                                                               chỉ tính Read trong thư mục của gói), ghi read-guard.json
//
// read-guard.json: { incomplete, notes[], error } — genbid-sync.js finish: incomplete thì KHÔNG ghi đè kết quả cũ
// trên web bằng kết quả của lượt đọc thiếu, chỉ ghi `error` (≤ 300 ký tự); còn lại notes nối vào ghi chú của Phân tích.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeForRead } from "./config-bot.mjs";
import { readTrace, guardTrace, stoppedNote } from "./read-guard.mjs";

const MARK = "<!-- cách đọc (agent-read) -->";
const NOTE_MAX = 300;

// The rule appended to TASK.md: which files to Read, in order, whole; not by Bash.
export function taskReadRule(files) {
  const split = files.map((f) => f.match(/^(.+)-\d+\.md$/)?.[1]).filter((b, i, a) => b && a.indexOf(b) === i);
  return [MARK, "",
    "## Cách đọc (code kiểm trong log của lượt)",
    `Đọc bằng Read, theo thứ tự, mỗi tệp một lần, trọn tệp (không cần offset / limit — code đã cắt mỗi tệp dưới giới hạn của Read): ${files.join(", ")}.`
      + (split.length ? ` ${split.map((b) => `${b}-N.md`).join(" / ")} là ${split.map((b) => `${b}.md`).join(" / ")} cắt theo mục, chữ y hệt; không Read lại ${split.map((b) => `${b}.md`).join(" / ")}.` : ""),
    "Các tệp trên KHÔNG được đọc bằng Bash (cat, head, tail, sed, cut, head -c / tail -c, | cut -c…): đầu ra shell bị cắt. Code kiểm trong log mọi dòng của các tệp đó đã qua Read; thiếu dòng nào thì kết quả bị bỏ, không gửi lên web.",
    "hsmt-full.txt (nếu có): chỉ grep / sed theo dòng khi cần phần đã bỏ, không đọc trọn.", ""].join("\n");
}

// One folder: input.md in parts, read-order.json, the rule in TASK.md. Returns the files the agent reads. [] when the
// folder has no input.md.
export function prepDir(dir) {
  const input = path.join(dir, "input.md");
  if (!fs.existsSync(input)) return [];
  const files = writeForRead(dir, "input.md", fs.readFileSync(input, "utf8"));
  fs.writeFileSync(path.join(dir, "read-order.json"), JSON.stringify(files), "utf8");
  const task = path.join(dir, "TASK.md");
  if (fs.existsSync(task)) {
    const cur = fs.readFileSync(task, "utf8").split(MARK)[0].replace(/\s+$/, "\n");
    fs.writeFileSync(task, cur + "\n" + taskReadRule(files), "utf8");
  }
  return files;
}

// One folder of a run: { incomplete, notes, error }. incomplete = a file of read-order.json read with lines missing
// (or not at all). A run that stopped (no result line, error end) but read everything: the notes say so, the result
// stays (it is whole when result.json exists).
export function guardDir(dir, trace) {
  const g = guardTrace(dir, trace, { under: true, risk: "kết quả có thể thiếu", again: "bấm gửi lại yêu cầu" });
  const incomplete = g.cov.some((c) => c.missing.length);
  const notes = g.notes.map((n) => n.slice(0, NOTE_MAX));
  const stopped = stoppedNote(g.end);
  const error = incomplete ? (g.notes.filter((n) => !/bị dừng giữa chừng/.test(n)).join(" ").slice(0, NOTE_MAX - 40).trim() + " Giữ kết quả cũ.").slice(0, NOTE_MAX) : "";
  return { incomplete, notes, stopped, error };
}

export function guardDirs(dirs, logText) {
  const trace = readTrace(logText), out = [];
  for (const dir of dirs) {
    if (!fs.existsSync(path.join(dir, "read-order.json"))) continue;
    const r = guardDir(dir, trace);
    fs.writeFileSync(path.join(dir, "read-guard.json"), JSON.stringify(r, null, 1), "utf8");
    out.push({ dir, ...r });
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "prep") {
    for (const d of rest) { const f = prepDir(d); console.log(`${path.basename(d)}: ${f.join(", ") || "không có input.md"}`); }
  } else if (cmd === "guard") {
    const i = rest.indexOf("--log"), log = rest[i + 1], dirs = rest.filter((_, j) => j !== i && j !== i + 1);
    for (const r of guardDirs(dirs, fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "")) {
      console.log(`CHỐT ĐỌC ${path.basename(r.dir)}: ${r.incomplete ? "ĐỌC THIẾU — " + r.error : r.notes.length ? r.notes.join(" ") : "đọc đủ"}`);
    }
  } else { console.error("usage: agent-read.mjs prep <dir>... | guard --log <log> <dir>..."); process.exit(2); }
}
