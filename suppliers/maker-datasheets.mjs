// Datasheets of an engine or alternator maker that name the model only in their title (Stamford: "UCI274F - Winding
// 311", no "Alternator model" line), which crawl-datasheets.mjs leaves out (Khoa, 2026-11-02):
//   node suppliers/maker-datasheets.mjs <id> <pdf url> [<pdf url> ...]
// Each PDF is read as crawl-datasheets.mjs reads one (pdftotext -table, pdfText) and saved as sources/<id>/<n>.md
// (n from 1001, after the datasheets already there). Its first line (the title naming the model) and its spec lines
// (a label web/catalog.js specKey knows, with a value of the right shape) go to datasheets/<id>.json; then run
// merge-specs.mjs <id> and verify.mjs as for the other datasheets. config-bot.mjs modelFacts reads a maker's table
// whose title names one model of the catalog as the figures of that model.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pdfText } from "./crawl-datasheets.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// A controller's datasheet (role controller_maker, Khoa 2026-11-02) is a list of functions, not "label | value" lines:
// every line is kept except the page footer (offices, phone, legal), with the first line that names a controller
// model as its title. config-bot.mjs modelFacts gives each line to the model of its section.
const FOOTER = /^(\|\s*)?(T|E|W)\s*:|DEEP SEA ELECTRONICS (UK|USA|UAE|INDIA|CHINA)|Registered in England|maintains a policy|details shown on this data sheet|contents are intended for guidance|^(\|\s*)?(\d{3}-\d{3}\b)/i;
export function controllerSheet(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && l.length <= 220 && /[a-z]{2}/i.test(l) && !FOOTER.test(l));
  const title = lines.find((l) => C.controllersIn(l).some((c) => c.model)) || lines[0] || "";
  return { title, rows: [...new Set(lines.filter((l) => l !== title))].slice(0, 400) };
}

// The title line and the spec lines of a datasheet's text, word for word.
export function makerSheet(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  for (const l of lines) {
    const c = C.cellsOf(l);
    if (c.length < 2 || l.length > 220) continue;
    const key = C.specKey(c[0]);
    if (key && c.slice(1).some((v) => C.SPEC[key].ok.test(v)) && !rows.includes(l)) rows.push(l);
  }
  return { title: lines[0] || "", rows };
}

async function pdfOf(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("not a PDF");
  const tmp = path.join(os.tmpdir(), `mds-${process.pid}-${Math.random().toString(36).slice(2)}.pdf`);
  fs.writeFileSync(tmp, buf);
  try { return { url: r.url || url, text: pdfText(execFileSync("pdftotext", ["-table", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20, timeout: 60000 }).toString("utf8")) }; }
  finally { fs.rmSync(tmp, { force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [id, ...urls] = process.argv.slice(2);
  if (!id || !urls.length || !fs.existsSync(path.join(ROOT, "cn", `${id}.json`))) { console.error("usage: maker-datasheets.mjs <id> <pdf url> ..."); process.exit(2); }
  const isCtl = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8")).role === "controller_maker";
  const dir = path.join(ROOT, "sources", id), out = path.join(ROOT, "datasheets", `${id}.json`);
  fs.mkdirSync(dir, { recursive: true });
  const found = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
  let n = Math.max(1000, ...fs.readdirSync(dir).map((f) => parseInt(f, 10)).filter((x) => x >= 1001 && x < 2000)) + 1;
  for (const url of urls) {
    if (found.some((t) => t.url === url)) { console.log("đã có", url); continue; }
    let d; try { d = await pdfOf(url); } catch (e) { console.log("x", url, e.message); continue; }
    const { title, rows } = isCtl ? controllerSheet(d.text) : makerSheet(d.text);
    if (rows.length < 3) { console.log("x", url, `chỉ ${rows.length} dòng thông số`); continue; }
    fs.writeFileSync(path.join(dir, `${n}.md`), `URL: ${d.url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${d.text}\n`, "utf8");
    found.push({ n, url: d.url, title: `Datasheet: ${title}`, from: url, header: [], rows: [title, ...rows] });
    console.log("+", n, title, rows.length, "dòng");
    n++;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(found, null, 1) + "\n", "utf8");
}
