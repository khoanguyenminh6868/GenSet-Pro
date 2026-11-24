// Báo giá trị sai MỚI của bản chuẩn (Khoa 24/11/2026: "Bộ kiểm giá trị khi nối vào workflow đăng thì cảnh báo cho anh biết
// để quyết định"). Chạy bộ kiểm `spec-value-check.mjs` (import, không sửa), so với danh sách vi phạm của lần chạy trước
// (doc `specvalue/current` trên web, chỉ ghi khi đổi như `rowflags/current`), in vi phạm MỚI và số đã HẾT.
//   KHÔNG chặn đăng, KHÔNG sửa / xoá dữ liệu, KHÔNG commit vào git. Lỗi thì in ::warning:: (workflow đặt continue-on-error).
//   node suppliers/spec-value-gate.mjs [--dry] [--prev <tệp doc>] [--out <tệp doc>] [--summary <tệp .md>]
// Lần chạy đầu (chưa có doc) chỉ lưu mốc, không báo các ca cũ.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const h8 = (s) => crypto.createHash("sha1").update(String(s ?? "")).digest("hex").slice(0, 10);

// Khoá bền của một vi phạm: trường + model + NCC + số nguồn + băm chữ dòng + giá trị + luật. Không dùng vị trí dòng
// (đánh số lại bảng không làm vi phạm cũ thành mới). Chữ dòng = chữ của dòng bảng nguồn, không có thì chữ gốc của giá trị.
export function violationKey(v) {
  return [`${v.part}.${v.field}`, v.model ?? "", v.supplier ?? "", v.src?.n ?? "", h8(v.row ?? v.raw ?? ""), h8(JSON.stringify(v.value ?? null)), v.rule].join("|");
}

// Chỉ giá trị SAI (level "sai"); "chưa chuẩn" (chưa về giá trị chuẩn / thiếu đơn vị) chỉ đếm.
export const badOf = (violations) => violations.filter((v) => v.level === "sai");

// prevKeys: mảng khoá của lần trước, hoặc null khi chưa có mốc.
export function diffViolations(prevKeys, violations) {
  const bad = badOf(violations), keyOf = new Map();
  for (const v of bad) if (!keyOf.has(violationKey(v))) keyOf.set(violationKey(v), v);
  const cur = [...keyOf.keys()].sort();
  if (!prevKeys) return { baseline: true, keys: cur, added: [], resolved: 0, total: cur.length };
  const prev = new Set(prevKeys), now = new Set(cur);
  return { baseline: false, keys: cur, added: cur.filter((k) => !prev.has(k)).map((k) => keyOf.get(k)), resolved: prevKeys.filter((k) => !now.has(k)).length, total: cur.length };
}

export const webDoc = (keys, at = new Date().toISOString()) => ({ at, commit: process.env.GITHUB_SHA || "", keys });

const short = (x, n = 90) => { const s = typeof x === "string" ? x : JSON.stringify(x); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const cell = (x) => String(x ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

// Báo cáo markdown cho Khoa: gom theo NCC; mỗi ca = trường, model, giá trị, chữ gốc, số nguồn, luật.
export function reportMd(d, { soft = 0, commit = "" } = {}) {
  const out = ["## Giá trị sai mới của bản chuẩn", ""];
  if (d.baseline) return [...out, `Lần chạy đầu: đã lưu mốc ${d.total} giá trị sai hiện có (không báo từng ca). Từ lần sau chỉ báo ca mới.`, ""].join("\n");
  out.push(`**${d.added.length} giá trị sai mới**, ${d.resolved} đã hết so với lần trước (tổng còn ${d.total}); ${soft} giá trị "chưa chuẩn" không tính. Không có gì bị chặn, sửa hay ẩn: anh xem rồi quyết.${commit ? ` Commit ${commit.slice(0, 7)}.` : ""}`, "");
  const by = new Map();
  for (const v of d.added) { const s = v.supplier ?? "(không rõ NCC)"; if (!by.has(s)) by.set(s, []); by.get(s).push(v); }
  for (const [s, list] of [...by].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))) {
    out.push(`### ${s} (${list.length})`, "", "| Trường | Model | Giá trị | Chữ gốc | Nguồn | Luật |", "|---|---|---|---|---|---|");
    for (const v of list.slice(0, 50)) out.push(`| ${cell(`${v.part}.${v.field}`)} | ${cell(v.model)} | ${cell(short(v.value, 60))} | ${cell(short(v.raw ?? v.row ?? "", 80))} | ${v.src?.n ?? ""} | ${cell(v.rule)}: ${cell(short(v.detail, 80))} |`);
    if (list.length > 50) out.push(`| … | còn ${list.length - 50} ca nữa | | | | |`);
    out.push("");
  }
  return out.join("\n");
}

async function readPrev(SB, KEY) {
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  const r = await fetch(`${SB}/rest/v1/docs?coll=eq.specvalue&id=eq.current&select=data`, { headers: H });
  if (!r.ok) throw new Error(`Đọc specvalue/current: HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json())[0]?.data ?? null;
}
// Ghi chỉ khi danh sách khoá đổi (đổi updated_at làm mọi trang đang mở tải lại doc).
async function writePrev(SB, KEY, doc) {
  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" };
  const r = await fetch(`${SB}/rest/v1/docs`, { method: "POST", headers: H, body: JSON.stringify([{ coll: "specvalue", id: "current", data: doc, updated_at: doc.at }]) });
  if (!r.ok) throw new Error(`Ghi specvalue/current: HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

export async function main(argv) {
  const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  const dry = argv.includes("--dry"), SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { runAll } = await import("./spec-value-check.mjs");
  const dir = path.join(ROOT, "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const { violations } = runAll(all);
  let prev = null;
  if (opt("--prev")) prev = JSON.parse(fs.readFileSync(opt("--prev"), "utf8").replace(/^﻿/, ""));
  else if (SB && KEY) prev = await readPrev(SB, KEY);
  else console.log("Chưa đặt SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: coi như chưa có mốc, không ghi.");
  const d = diffViolations(prev?.keys ?? null, violations);
  const soft = violations.filter((v) => v.level !== "sai").length;
  const md = reportMd(d, { soft, commit: process.env.GITHUB_SHA || "" });
  console.log(md);
  const sum = opt("--summary") || process.env.GITHUB_STEP_SUMMARY;
  if (sum) fs.appendFileSync(sum, md + "\n");
  if (d.baseline) console.log(`::notice::Bộ kiểm giá trị: lưu mốc ${d.total} giá trị sai, chưa báo ca nào.`);
  else if (d.added.length) console.log(`::warning title=Giá trị sai mới của bản chuẩn::${d.added.length} giá trị sai mới (${d.resolved} đã hết). Xem tóm tắt của lượt chạy này.`);
  else console.log(`Không có giá trị sai mới (${d.resolved} đã hết, còn ${d.total}).`);
  const doc = webDoc(d.keys);
  if (opt("--out")) fs.writeFileSync(opt("--out"), JSON.stringify(doc) + "\n", "utf8");
  if (dry || !SB || !KEY || opt("--prev")) return d;
  if (prev && JSON.stringify(prev.keys) === JSON.stringify(d.keys)) { console.log("Không đổi so với specvalue/current: không ghi."); return d; }
  await writePrev(SB, KEY, doc);
  console.log("đã ghi specvalue/current");
  return d;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { await main(process.argv.slice(2)); } catch (e) { console.log(`::warning title=Bộ kiểm giá trị lỗi::${String(e.message ?? e).slice(0, 300)}`); process.exit(1); }
}
