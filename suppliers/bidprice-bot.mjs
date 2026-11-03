// "Gợi ý giá đấu" in the Tạo HSDT tham khảo tab (Khoa, 2026-11-03: compare by configuration with AI), run on the Windows
// PC by config-bot.mjs run (as a child process: run) for every pending bidpricereq/<TBMT>:
//   node suppliers/bidprice-bot.mjs prep --key <TBMT> --out <dir> [--kva 400 --price 1230000000]
//   node suppliers/bidprice-bot.mjs check --dir <dir>          check result.json in code, print the prices
//   node suppliers/bidprice-bot.mjs run [--key <TBMT>]              answer every pending bidpricereq (or that tender's)
//   node suppliers/bidprice-bot.mjs try --key <TBMT> [--kva .. --price ..]   prep + agent + check, nothing posted
// Code picks the decided lots most like the tender from bidhist (web/bidprice.js candidates); the agent (claude -p,
// bidprice-prompt.md) reads this tender's configuration and each lot's (won goods, HSMT lines) and puts each lot in a
// level (same / close / different / unknown) with a quote; check drops a lot whose quote is not word for word in what it
// was given; code computes the prices from the alike lots (suggest) and posts bidprice/<TBMT>.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm } from "./verify.mjs";
import { api, doc, post, technicalPart, hsmtTextOf } from "./config-bot.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fileURLToPath(import.meta.url);
const CLAUDE = process.env.GENBID_CLAUDE || "claude";
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const BP = globalThis.GenbidBidprice;
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const fmt = (v) => Number(v).toLocaleString("vi-VN");

// The tender as the web sent it (bidpricereq basis: kva, price, capText, bidForm, investorName read on the page), with what
// the bot can add: the analysis, the configuration suggested in Cấu hình gợi ý and the HSMT's technical part.
export async function prep(req, dir, hist) {
  fs.mkdirSync(dir, { recursive: true });
  const key = req.key || req.notifyNo, b = req.basis || {};
  const [analysis, cfg, hsmt] = await Promise.all([doc("analysis", key).catch(() => null), doc("configmatch", key).catch(() => null), hsmtTextOf(key).catch(() => null)]);
  const a = analysis?.result, K = Number(b.kva) || null, P = Number(b.price) || null;
  const top = (cfg?.result?.configs || []).slice(0, 3);
  // What this HSMT asks for, read the way bidhist's config.text was (the analysis' technical lines), else the HSMT's
  // technical part; and the engine of the configuration Gợi ý cấu hình put first (its origin group picks the lots).
  const cfgText = a?.technicalSpecs?.length ? a.technicalSpecs.map((s) => `${s.item}: ${s.requirement}`).join("\n") : hsmt ? technicalPart(hsmt.text).slice(0, 20000) : "";
  const t = { notifyNo: key, bidName: req.bidName || a?.keyInfo?.bidName || "", investorName: b.investorName || a?.keyInfo?.investor || "", cfgText, engine: top[0]?.engine || null };
  const docs = hist || Object.fromEntries((await api("kind=docs&coll=bidhist")).map((d) => [d.id, d.data]));
  const { total, group, otherGroup, list } = BP.candidates(t, docs, K, P);
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Gói thầu ${key}`, `Tên gói: ${t.bidName}`, t.investorName ? `Chủ đầu tư: ${t.investorName}` : "",
    `Công suất: ${K ? `${fmt(Math.round(K))} kVA${b.capText ? ` (${b.capText})` : ""}` : "không rõ"}`, `Giá gói: ${P ? fmt(P) + " đ" : "không rõ"}`,
    `Nhóm xuất xứ động cơ (code đọc từ cấu hình dự kiến chào, nếu chưa có thì từ HSMT): ${group ? BP.GROUP[group] : "không rõ"}${otherGroup ? ` — đã bỏ ${otherGroup} gói khác nhóm` : ""}`, "",
    ...(a?.keyInfo ? ["## Thông tin chính (phân tích HSMT)", ...Object.entries(a.keyInfo).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`), ""] : []),
    ...(a?.technicalSpecs?.length ? ["## Thông số kỹ thuật (phân tích HSMT)", ...a.technicalSpecs.map((s) => `- ${s.item}: ${s.requirement}`), ""] : []),
    ...(top.length ? ["## Cấu hình dự kiến chào (Gợi ý cấu hình)", ...top.map((c) => `- ${[c.engine && `động cơ ${[c.engine.make, c.engine.model].filter(Boolean).join(" ")}`, c.alternator && `đầu phát ${[c.alternator.make, c.alternator.model].filter(Boolean).join(" ")}`, c.controller && `bộ điều khiển ${[c.controller.make || c.controller.brand, c.controller.model].filter(Boolean).join(" ")}`].filter(Boolean).join(", ")}`), ""] : []),
    hsmt ? "## Phần kỹ thuật của HSMT\n" + technicalPart(hsmt.text).slice(0, 60000) : "Chưa có văn bản HSMT.",
  ].filter((l) => l !== "").join("\n"), "utf8");
  fs.writeFileSync(path.join(dir, "samples.md"), list.map((s) => `## ${s.id}\n${BP.sampleText(s)}\n${BP.cfgLine(s)}`).join("\n\n"), "utf8");
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify({ basis: { kva: K, price: P, capText: b.capText || "" }, total, list }), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "bidprice-prompt.md"), "utf8"), "utf8");
  return { total, group, otherGroup, candidates: list.length, K, P };
}

// result.json checked against samples.json: every lot gets a level; a lot the agent left out, or whose quote is not in
// its own text, counts as unknown (unverified). A "same" lot whose power code read is over 1,5 times off becomes "close".
export function check(dir) {
  const { basis, total, list } = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8"));
  const r = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8")), problems = [];
  const by = new Map((r.samples || []).map((x) => [x.id, x]));
  const samples = list.map((s) => {
    const x = by.get(s.id), level = BP.LEVELS.includes(x?.level) ? x.level : "unknown";
    const out = { ...s, level, same: (x?.same || []).map(String).slice(0, 8), diff: (x?.diff || []).map(String).slice(0, 8), quote: String(x?.quote || "") };
    if (!x) { problems.push(`${s.id}: agent không xếp mức`); return { ...out, unverified: "agent không xếp mức" }; }
    if (level === "same" || level === "close") {
      const q = norm(out.quote).replace(/…$/, "");
      if (!q || !norm(BP.sampleText(s)).includes(q)) { problems.push(`${s.id}: câu trích không có trong thông tin gói: "${out.quote.slice(0, 80)}"`); return { ...out, unverified: "câu trích không khớp thông tin gói" }; }
      if (level === "same" && basis.kva && s.k && Math.abs(Math.log(basis.kva / s.k)) > Math.log(1.5)) { problems.push(`${s.id}: "giống" nhưng công suất ${Math.round(s.k)} kVA → "gần"`); return { ...out, level: "close" }; }
    }
    return out;
  });
  const stats = BP.suggest(samples, basis.price, basis.kva);
  const result = { basis, total, tender: { summary: String(r.tender?.summary || ""), points: (r.tender?.points || []).map(String).slice(0, 10) }, notes: (r.notes || []).map(String).slice(0, 6), samples, stats };
  fs.writeFileSync(path.join(dir, "result.checked.json"), JSON.stringify(result, null, 1));
  return { result, problems };
}

function runClaude(dir) {
  return spawnSync(CLAUDE, ["-p", "--permission-mode", "auto", "--output-format", "text", "--model", process.env.GENBID_BIDPRICE_MODEL || "opus",
    "--strict-mcp-config", "--disable-slash-commands", "--tools", "Read", "Write", "Grep", "Glob"],
    { cwd: dir, encoding: "utf8", timeout: 25 * 60e3, maxBuffer: 64 << 20, windowsHide: true,
      input: "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md và samples.md, chỉ ghi result.json. Chạy không người trông, không ai trả lời câu hỏi." });
}

async function attempt(req, dir, hist) {
  fs.rmSync(dir, { recursive: true, force: true });
  const info = await prep(req, dir, hist);
  if (!info.candidates) return { result: { basis: { kva: info.K, price: info.P, capText: req.basis?.capText || "" }, total: info.total, tender: { summary: "", points: [] }, notes: [`Chưa có gói đã có kết quả nào gần với gói này (cùng là cung cấp máy phát, công suất xê dịch không quá 5%${info.group ? `, động cơ cùng nhóm ${BP.GROUP[info.group]}` : ""}).`], samples: [], stats: BP.suggest([], info.P, info.K) }, problems: [] };
  const started = Date.now(), r = runClaude(dir);
  fs.writeFileSync(path.join(os.tmpdir(), `genbid-bidprice-${req.key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
  if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
  const out = check(dir);
  out.result.seconds = Math.round((Date.now() - started) / 1000);
  return out;
}

// bidpricereq keeps the request's own fields and gets doneAt (+ error); bidprice carries the checked result.
export async function answer(req, hist) {
  const key = req.key, dir = path.join(os.tmpdir(), "genbid-bidprice", key);
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = JSON.parse(JSON.stringify({ notifyNo: req.notifyNo || key, bidName: req.bidName, basis: req.basis, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" }));
    return post([...(result ? [{ coll: "bidprice", id: key, data: { at, result } }] : []), { coll: "bidpricereq", id: key, data: reqData }]);
  };
  try {
    const { result, problems } = await attempt(req, dir, hist);
    await done({ result, error: "" });
    console.log(`${key}: giá đấu từ ${result.stats.n} gói tương tự (${result.samples.length} ứng viên${problems.length ? `, ${problems.length} điểm chưa khớp` : ""})`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: Gợi ý giá đấu lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function printResult({ result, problems }) {
  const s = result.stats;
  console.log(`Ứng viên ${result.samples.length}/${result.total}: ${BP.LEVELS.map((l) => `${l} ${result.samples.filter((x) => x.level === l).length}`).join(", ")}`);
  console.log(`Tính từ ${s.n} gói (${s.basis})${s.enough ? "" : " — CHƯA ĐỦ"}: ${s.levels.map((l) => `${l.label} ${fmt(l.price)} (${Math.round(100 * l.ratio)}%, thắng ${Math.round(100 * l.chance)}%)`).join(" · ")}`);
  if (s.perKva) console.log(`Theo đ/kVA: ${fmt(s.perKva.value)} đ/kVA → ${fmt(s.perKva.price)} (${s.perKva.n} gói)`);
  for (const x of result.samples.filter((x) => x.level === "same" || x.level === "close")) console.log(`  ${x.id} ${x.level} ${x.key} ${Math.round(100 * x.ratio)}% ${x.bidders.length}NT — ${x.same.join(", ")} / khác: ${x.diff.join(", ")}`);
  if (problems.length) console.log("Chưa khớp:\n" + problems.join("\n"));
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  const req = { key: arg("key"), notifyNo: arg("key"), basis: { kva: arg("kva"), price: arg("price") } };
  if (cmd === "prep") console.log(JSON.stringify(await prep(req, arg("out"))));
  else if (cmd === "check") printResult(check(arg("dir", ".")));
  else if (cmd === "run") {
    // Every pending bidpricereq, or with --key only that tender's (config-bot.mjs run starts one per tender, all at once).
    // Only requests the web wrote (basis).
    const reqs = (await api("kind=bidprice")).filter((r) => r.basis && (!arg("key") || r.key === arg("key")));
    if (reqs.length) { const hist = Object.fromEntries((await api("kind=docs&coll=bidhist")).map((d) => [d.id, d.data])); for (const r of reqs) await answer(r, hist); }
  }
  else if (cmd === "try") { const dir = arg("out") || path.join(os.tmpdir(), "genbid-bidprice-try", req.key); printResult(await attempt(req, dir)); console.log(`Thư mục: ${dir}`); }
  else { console.error("usage: bidprice-bot.mjs prep --key K --out D [--kva N --price P] | check --dir D | try --key K [--kva N --price P]"); process.exit(2); }
}
