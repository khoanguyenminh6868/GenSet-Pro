// Chốt chặn "agent đọc thiếu đầu vào" (điều phối 2026-11-12, Khoa hỏi: việc agent đọc thiếu đã fix triệt để chưa).
//
// Công cụ Read của Claude Code từ chối tệp > 25.000 token, và (bản cũ) trả thiếu dòng mà không báo: IB2600592684 ngày
// 04/11 agent chỉ thấy input.md dòng 1–321/446. writeForRead (config-bot.mjs) cắt tệp dưới giới hạn, nhưng không gì bảo
// đảm agent thật sự đọc hết. Ở đây code tự xem, từ log stream-json của chính lượt đó, agent đã đọc những dòng nào của
// mỗi tệp phải đọc trọn (read-order.json), và lượt có kết thúc bình thường không. Không tin lời agent.
//
//   node suppliers/read-guard.mjs <log> [<log>...] [--json]     bảng: tệp nào đọc thiếu dòng nào, Read bị từ chối,
//                                                               số vòng, chi phí (chỉ đọc log)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// One line of the log: "[Ns] {json}" (config-bot.mjs runClaudeOnce) or the JSON alone.
const jsonOf = (l) => { const m = l.match(/^(?:\[\d+s\]\s*)?(\{.*\})\s*$/); if (!m) return null; try { return JSON.parse(m[1]); } catch { return null; } };
const textOf = (c) => (typeof c?.content === "string" ? c.content : (c?.content || []).map((x) => x?.text || "").join("\n"));
const baseOf = (f) => String(f || "").split(/[\\/]/).pop();
// The shell prints at most ~30 KB; more is saved to a file and the agent sees a 2 KB preview (token-do.md).
const PERSISTED = /<persisted-output>|Output too large/i;
// A Read the tool refused: too many tokens, or a file too big.
const REFUSED = /exceeds maximum allowed (tokens|size)|too large|file content \(\d+ tokens\)/i;

// What one run read, from its log. reads: every Read (file, the lines it got, the file's lines, refused or not);
// shell: a whole `cat <file>` or `sed -n 'a,bp' <file>` whose output came back whole (a Bash read); end: the run's
// result line (subtype, turns, cost) or null when there is none (killed, timeout, crash).
export function readTrace(logText) {
  const uses = new Map(), reads = [], shell = [];
  let end = null;
  for (const l of String(logText || "").split("\n")) {
    const j = jsonOf(l);
    if (!j) continue;
    if (j.type === "result") { end = { subtype: j.subtype || "", isError: !!j.is_error, turns: j.num_turns ?? null, cost: j.total_cost_usd ?? null, stop: j.stop_reason ?? null, text: String(j.result || "").slice(0, 300) }; continue; }
    const content = Array.isArray(j?.message?.content) ? j.message.content : [];
    for (const c of content) {
      if (c.type === "tool_use") { uses.set(c.id, c); continue; }
      if (c.type !== "tool_result" || !uses.has(c.tool_use_id)) continue;
      const u = uses.get(c.tool_use_id), out = textOf(c);
      // tool_use_result is the user event's: the one result of that message.
      const tr = content.filter((x) => x.type === "tool_result").length === 1 ? j.tool_use_result : null;
      if (u.name === "Read") {
        const file = String(u.input?.file_path || ""), f = tr && typeof tr === "object" ? tr.file : null;
        const r = { file, name: baseOf(file), offset: u.input?.offset ?? null, limit: u.input?.limit ?? null, refused: false, error: "" };
        if (c.is_error || !f) {
          r.refused = REFUSED.test(out); r.error = out.trim().slice(0, 200);
          if (!c.is_error && !f) {
            // A Read without its structured result (older logs): line numbers from the text "   12\t...".
            const nums = [...out.matchAll(/^\s*(\d+)[\t→]/gm)].map((m) => Number(m[1]));
            if (nums.length) Object.assign(r, { start: nums[0], num: nums.length, total: null, error: "" });
          }
        } else {
          const lines = String(f.content || "").split("\n");
          Object.assign(r, { start: f.startLine || 1, num: f.numLines ?? lines.length, total: f.totalLines ?? null, chars: String(f.content || "").length, longest: Math.max(0, ...lines.map((x) => x.length)) });
        }
        reads.push(r);
      } else if (u.name === "Bash" && typeof u.input?.command === "string" && !c.is_error) {
        const cmd = u.input.command.trim();
        // Only a read of one file, nothing piped after it (a pipe through grep is a search, not a read).
        const cat = cmd.match(/^cat\s+("[^"]+"|'[^']+'|[^\s|;&<>]+)\s*$/), sed = cmd.match(/^sed\s+-n\s+["']?(\d+),(\d+)p["']?\s+("[^"]+"|'[^']+'|[^\s|;&<>]+)\s*$/);
        const m = cat || sed;
        if (!m) continue;
        const file = (cat ? cat[1] : sed[3]).replace(/^["']|["']$/g, "");
        shell.push({ file, name: baseOf(file), whole: !!cat, from: sed ? Number(sed[1]) : 1, to: sed ? Number(sed[2]) : null, persisted: PERSISTED.test(out), lines: out.split("\n").length });
      }
    }
  }
  const turns = end?.turns ?? null;
  return { reads, shell, end, turns };
}

// Line ranges [a, b] merged.
const merge = (ranges) => {
  const s = ranges.filter(([a, b]) => b >= a).sort((x, y) => x[0] - y[0]), out = [];
  for (const [a, b] of s) { const last = out[out.length - 1]; if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b); else out.push([a, b]); }
  return out;
};
const gaps = (covered, n) => { const out = []; let at = 1; for (const [a, b] of covered) { if (a > at) out.push([at, Math.min(a - 1, n)]); at = Math.max(at, b + 1); } if (at <= n) out.push([at, n]); return out.filter(([a, b]) => b >= a); };
// The lines of a text as Read numbers them, less a last empty line (a file that ends with a newline).
export const lineCount = (text) => { const l = String(text ?? "").split("\n"); if (l.length > 1 && l[l.length - 1] === "") l.pop(); return l.length; };

// Which lines of each logical file (input.md, catalog.md, ctl-lookup.md…) the run read. `files`: [{ name, lines,
// parts: [{ name, from, lines }] }] — a part's line 1 is line `from` of the whole (partsMap). A read of the whole file or
// of any part counts, by Read (lines it really got) or by a whole `cat` / `sed -n` that came back whole.
export function coverage(trace, files) {
  return files.map((f) => {
    const map = new Map([[f.name, { from: 1, lines: f.lines }], ...(f.parts || []).map((p) => [p.name, p])]);
    const got = [], refused = [];
    let total = f.lines;
    for (const r of trace.reads) {
      const at = map.get(r.name);
      if (!at) continue;
      if (r.refused || r.error) { refused.push(`${r.name}${r.offset != null ? `@${r.offset}` : ""}${r.limit != null ? `+${r.limit}` : ""}`); continue; }
      if (r.num == null) continue;
      // No file in the folder (an old log): the whole file's lines as Read counted them.
      if (total == null && r.name === f.name && r.total != null) total = lineCount("x\n".repeat(r.total)) - (r.total ? 0 : 1);
      got.push([at.from + r.start - 1, at.from + r.start - 1 + r.num - 1]);
    }
    for (const s of trace.shell) {
      const at = map.get(s.name);
      if (!at || s.persisted) continue;
      got.push(s.whole ? [at.from, at.from + at.lines - 1] : [at.from + s.from - 1, at.from + Math.min(s.to, at.lines) - 1]);
    }
    const covered = merge(got), n = total ?? Math.max(0, ...covered.map(([, b]) => b));
    const missing = n ? gaps(covered, n) : [];
    return { name: f.name, lines: n || null, covered, missing, refused, read: got.length > 0 };
  });
}

// The files of a run folder the agent had to read whole, from read-order.json: each logical file with its parts.
export function partsMap(dir) {
  const p = (f) => path.join(dir, f);
  if (!fs.existsSync(p("read-order.json"))) return [];
  const order = JSON.parse(fs.readFileSync(p("read-order.json"), "utf8")), out = [];
  for (const name of order) {
    const m = name.match(/^(.+)-(\d+)\.md$/), whole = m && fs.existsSync(p(`${m[1]}.md`)) ? `${m[1]}.md` : name;
    let f = out.find((x) => x.name === whole);
    if (!f) { f = { name: whole, lines: fs.existsSync(p(whole)) ? lineCount(fs.readFileSync(p(whole), "utf8")) : null, parts: [], at: 0 }; out.push(f); }
    if (whole !== name) {
      const text = fs.existsSync(p(name)) ? fs.readFileSync(p(name), "utf8") : "";
      // A part ends with a newline (cut at a heading or a line) unless a single line longer than the limit was cut.
      f.parts.push({ name, from: f.at + 1, lines: lineCount(text) });
      f.at += (text.match(/\n/g) || []).length;
    }
  }
  return out.map(({ at, ...f }) => f);
}

const rng = (r) => r.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(", ");
// The notes for the result (shown under "Lưu ý về độ tin cậy") and the console: a file of read-order.json not read
// whole, a refused Read, a run that did not end normally. [] when nothing is wrong.
export function readNotes(cov, end, { label = "" } = {}) {
  const notes = [], who = label ? ` (${label})` : "";
  for (const c of cov) {
    if (!c.missing.length) continue;
    notes.push(c.read
      ? `Agent chưa đọc hết ${c.name}${who} (thiếu dòng ${rng(c.missing)} / ${c.lines}): kết quả có thể thiếu yêu cầu — bấm Gợi ý lại.`
      : `Agent không đọc ${c.name}${who} (${c.lines} dòng)${c.refused.length ? `: Read bị từ chối (${c.refused.join(", ")})` : ""}: kết quả có thể thiếu yêu cầu — bấm Gợi ý lại.`);
  }
  const stopped = stoppedNote(end);
  if (stopped) notes.push(`Lượt agent${who} bị dừng giữa chừng (${stopped}): result.json có thể là bản dở — bấm Gợi ý lại.`);
  return notes;
}
// Why a run did not end normally, or "": no result line in its log (killed, timeout, crash), or an error end
// (error_max_turns, error_during_execution, is_error). `error`: the runner's own (e.g. "quá 40 phút").
export function stoppedNote(end, error = "") {
  if (error) return error;
  if (end === null) return "không có dòng kết thúc trong log: bị dừng, quá giờ hoặc lỗi";
  if (end && (end.isError || (end.subtype && end.subtype !== "success"))) return `kết thúc ${end.subtype || "lỗi"}${end.stop ? `, ${end.stop}` : ""}`;
  return "";
}
// One run folder + its log → { cov, end, notes }. Nothing when the folder has no read-order.json (an old run).
export function guardRun(dir, logText, opts = {}) {
  const files = partsMap(dir);
  const trace = readTrace(logText);
  if (!files.length) return { cov: [], end: trace.end, notes: readNotes([], trace.end, opts), trace };
  const cov = coverage(trace, files);
  return { cov, end: trace.end, notes: readNotes(cov, trace.end, opts), trace };
}

// ---------- CLI: the table of item 4 (read-guard.md) ----------
// Without the run folder (deleted after the run) the files and their lines come from the log: input.md, catalog.md,
// ctl-lookup.md and their parts as Read counted them (totalLines); a file never opened shows as such only when the
// log names it elsewhere (read-order in the first message).
export function logFiles(logText, trace = readTrace(logText)) {
  // The first message goes in through stdin, not into the log: the parts are those the run read (x-N.md), in order.
  const parts = [...new Set(trace.reads.map((r) => r.name).filter((n) => /^(input|catalog|ctl-lookup)-\d+\.md$/.test(n)))]
    .sort((a, b) => { const [, x, i] = a.match(/^(.+)-(\d+)\.md$/), [, y, j] = b.match(/^(.+)-(\d+)\.md$/); return x === y ? i - j : ["input", "catalog", "ctl-lookup"].indexOf(x) - ["input", "catalog", "ctl-lookup"].indexOf(y); });
  const order = [...new Set(["input.md", "catalog.md", ...parts, ...(trace.reads.some((r) => r.name === "ctl-lookup.md") ? ["ctl-lookup.md"] : [])])]
    .filter((n) => !parts.some((p) => p.startsWith(n.replace(/\.md$/, "-")))); // a file read by parts: its parts
  const totals = new Map();
  for (const r of trace.reads) if (r.total != null) totals.set(r.name, Math.max(totals.get(r.name) || 0, r.total));
  const out = [];
  for (const name of order) {
    const m = name.match(/^(.+)-(\d+)\.md$/), whole = m ? `${m[1]}.md` : name;
    let f = out.find((x) => x.name === whole);
    if (!f) { f = { name: whole, lines: totals.has(whole) ? lineCount("x\n".repeat(totals.get(whole))) : null, parts: [], at: 0 }; out.push(f); }
    if (m) {
      const n = totals.has(name) ? lineCount("x\n".repeat(totals.get(name))) : null;
      f.parts.push({ name, from: f.at + 1, lines: n ?? 0 });
      f.at += n ?? 0;
      // A whole file read by its parts: its lines are the sum of theirs.
      f.lines = f.parts.every((p) => p.lines) ? f.at : f.lines;
    }
  }
  return out.map(({ at, ...f }) => f);
}
export function logReport(logText) {
  const trace = readTrace(logText), files = logFiles(logText, trace), cov = coverage(trace, files);
  const refused = trace.reads.filter((r) => r.refused || r.error).map((r) => `${r.name}${r.offset != null ? `@${r.offset}` : ""}`);
  const count = new Map();
  for (const r of trace.reads) if (!r.refused && !r.error) count.set(r.name, (count.get(r.name) || 0) + 1);
  const again = [...count].filter(([, n]) => n > 1).map(([f, n]) => `${f}×${n}`);
  const persisted = trace.shell.filter((s) => s.persisted).length + (String(logText).match(/Output too large/g) || []).length;
  const longest = Math.max(0, ...trace.reads.map((r) => r.longest || 0));
  return { files: cov, refused, again, persisted, longest, end: trace.end, notes: readNotes(cov, trace.end) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), json = args.includes("--json"), logs = args.filter((a) => a !== "--json");
  const rows = logs.map((f) => ({ log: path.basename(f), ...logReport(fs.readFileSync(f, "utf8")) }));
  if (json) console.log(JSON.stringify(rows, null, 1));
  else for (const r of rows) {
    console.log(`\n${r.log}: ${r.end ? `${r.end.subtype}, ${r.end.turns} vòng, ${r.end.cost?.toFixed(2)} USD` : "KHÔNG có dòng result (bị dừng?)"}`);
    for (const c of r.files) console.log(`  ${c.name}: ${c.lines ?? "?"} dòng; đã đọc ${rng(c.covered) || "—"}${c.missing.length ? `; THIẾU ${rng(c.missing)}` : ""}${c.refused.length ? `; từ chối ${c.refused.join(", ")}` : ""}`);
    console.log(`  Read bị từ chối/lỗi: ${r.refused.join(", ") || "0"}; đọc lặp: ${r.again.join(", ") || "0"}; đầu ra shell bị cắt: ${r.persisted}; dòng dài nhất trả về: ${r.longest}`);
  }
}
