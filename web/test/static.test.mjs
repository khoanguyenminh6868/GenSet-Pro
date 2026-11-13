// node --test web/test/static.test.mjs — kiểm tĩnh web/index.html, không cần trình duyệt (việc T7, 13/11/2026).
// web/CLAUDE.md: index.html là một script lớn, hàm trùng tên thì hàm sau đè hàm trước không báo lỗi; màn hình / chi tiết mới
// phải có trong navSnap và navRestore để Back về đúng màn trước.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HTML = fs.readFileSync(path.join(WEB, "index.html"), "utf8");
const SCRIPTS = [...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
// Thân của IIFE `(() => { ... })();` chứa toàn bộ ứng dụng.
const APP = (() => {
  const s = SCRIPTS.find((x) => x.length > 100000) || "";
  const a = s.indexOf("(() => {"), b = s.lastIndexOf("})();");
  return a >= 0 && b > a ? s.slice(a + "(() => {".length, b) : "";
})();

// Các hàm khai báo ở cấp ngoài cùng (cột 0, như cách index.html viết) và tên trùng.
const topFunctions = (src) => [...src.matchAll(/^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/gm)].map((m) => m[1]);
const dupes = (names) => [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
// V8 báo trùng khi bọc thân trong khối strict: hàm trong khối là khai báo lexical, trùng tên là SyntaxError.
// Bắt cả hàm trùng mà không viết ở cột 0, và trùng giữa function với const/let/class cùng tên.
function v8Dupe(body) {
  try { new vm.Script(`"use strict";{${body}\n}`); return null; } catch (e) { return e instanceof SyntaxError ? e.message : String(e); }
}

test("index.html có script ứng dụng (IIFE) để kiểm", () => {
  assert.ok(APP.length > 100000, "không tách được thân IIFE của index.html");
  assert.ok(topFunctions(APP).length > 100, "đếm được quá ít hàm cấp ngoài cùng: cách tách đã sai");
});

test("không có hai khai báo function trùng tên ở cấp ngoài cùng của index.html", () => {
  assert.deepEqual(dupes(topFunctions(APP)), []);
  for (const s of SCRIPTS.filter((x) => x !== SCRIPTS.find((y) => y.length > 100000))) assert.deepEqual(dupes(topFunctions(s)), []);
});

test("V8 dịch thân ứng dụng trong khối strict không báo tên khai báo trùng", () => {
  assert.equal(v8Dupe(APP), null);
});

test("ca phủ định: cách kiểm bắt được hàm trùng tên (cột 0 và V8)", () => {
  const extra = "\nfunction renderAll() {}\n";
  assert.deepEqual(dupes(topFunctions(APP + extra)), ["renderAll"]);
  assert.match(v8Dupe(APP + extra) || "", /renderAll.*already been declared/);
  // Trùng tên lồng sâu, viết thụt lề: cột 0 không thấy nhưng V8 vẫn thấy khi nằm cùng cấp ngoài cùng.
  assert.match(v8Dupe(APP + "\n  function navSnap() {}\n") || "", /navSnap/);
});

// ---------- Back: navSnap / navRestore ----------
const fnBody = (name) => {
  const i = APP.search(new RegExp(`^function ${name}\\s*\\(`, "m"));
  assert.ok(i >= 0, `không thấy function ${name}`);
  const j = APP.slice(i + 1).search(/^(?:async\s+)?function |^const |^let |^addEventListener|^document\.|^window\./m);
  return APP.slice(i, j < 0 ? undefined : i + 1 + j);
};
const SNAP = fnBody("navSnap"), RESTORE = fnBody("navRestore");
// Màn của navSnap: chuỗi `$("#xBody") ? "x" : ... : "dlg"`.
const snapScreens = () => {
  const line = SNAP.match(/const scr = ([^;]+);/)?.[1] || "";
  return [...line.matchAll(/\$\("(#\w+)"\)\s*\?\s*"(\w+)"/g)].map((m) => ({ el: m[1], scr: m[2] })).concat(/:\s*"dlg"\s*$/.test(line.trim()) ? [{ el: null, scr: "dlg" }] : []);
};
// Trường mà navSnap ghi lại (đối tượng trả về).
const snapFields = () => {
  const obj = SNAP.slice(SNAP.indexOf("return {") + 8, SNAP.lastIndexOf("}"));
  return [...("," + obj).matchAll(/,\s*([a-zA-Z]+)\s*(?=[:,]|$)/g)].map((m) => m[1]);
};

test("navSnap nhận ra các màn Nhà cung cấp / Nhà thầu / Danh mục và hộp thoại", () => {
  assert.deepEqual(snapScreens().map((s) => s.scr), ["sup", "bd", "cat", "dlg"]);
});

test("mọi màn trong navSnap có trong navRestore", () => {
  for (const { scr } of snapScreens()) {
    if (scr === "dlg") assert.match(RESTORE, /cur\.scr === "dlg"/, "navRestore không đóng hộp thoại khi Back");
    else assert.match(RESTORE, new RegExp(`s\\.scr === "${scr}"`), `navRestore không dựng lại màn "${scr}"`);
  }
});

test("mọi trường navSnap ghi lại đều được navRestore dùng (trừ url, navSync dùng)", () => {
  const fields = snapFields();
  for (const f of ["open", "dtab", "list", "back", "scr", "sup", "bd", "cat", "catOpen", "catFrom", "dscroll", "mscroll", "url"]) assert.ok(fields.includes(f), `navSnap thiếu ${f}: ${fields}`);
  for (const f of fields.filter((f) => f !== "url")) assert.match(RESTORE, new RegExp(`\\bs\\.${f}\\b`), `navRestore không dùng s.${f}`);
  // navKey (khi nào là một bước mới) chỉ dùng trường navSnap có.
  const key = APP.match(/const navKey = \(s\) => JSON\.stringify\(\[([^\]]+)\]\)/)?.[1] || "";
  const used = [...key.matchAll(/s\.(\w+)/g)].map((m) => m[1]);
  assert.ok(used.length >= 5, "không đọc được navKey");
  for (const f of used) assert.ok(fields.includes(f), `navKey dùng ${f} mà navSnap không có`);
});

test("mỗi màn mở bằng modal(mBanner(...)) có trong navSnap; còn lại Back đóng như hộp thoại (khoá hành vi)", () => {
  const known = new Set(snapScreens().map((s) => s.el).filter(Boolean));
  const screens = [...APP.matchAll(/modal\(mBanner\([^;]*?id="(\w+)"/g)].map((m) => "#" + m[1]);
  assert.ok(screens.length >= 4, `chỉ thấy ${screens}`);
  // Sổ báo giá (#qlScr) chưa có trạng thái riêng trong navSnap: Back đóng nó như một hộp thoại.
  assert.deepEqual(screens.filter((s) => !known.has(s)), ["#qlScr"]);
});

test("đổi URL bằng replaceState(history.state, …), không replaceState(null, …) (Back cần state của bước)", () => {
  assert.equal((APP.match(/replaceState\(\s*null\b/g) || []).length, 0);
});

test("SHOW_SRC = false và danh sách mặc định theo ngày đăng giảm dần", () => {
  assert.match(APP, /^const SHOW_SRC = false;/m);
  assert.match(APP, /^const DEFAULT_SORT = \{ col: "no", dir: -1 \};/m);
  // Cột "no" xếp theo ngày đăng rồi mới tới Mã số.
  assert.match(APP, /\{ k: "no", label: "Mã Số"[^\n]*val: \(t\) => `\$\{pubOf\(t\)\}\|/);
});
