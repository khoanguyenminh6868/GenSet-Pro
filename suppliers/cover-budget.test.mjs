// node --test suppliers/*.test.mjs — T2: api-budget.mjs (tiền thật). Hạn mức API key 100 USD/tháng làm mới ngày 2
// (Khoa 2026-11-12); bot đổi sang gói tháng khi tiêu ≥ ngưỡng hoặc API báo hết tiền. Test dùng thư mục tạm cho sổ chi,
// không đụng tệp thật .anthropic-api-*; môi trường được khôi phục sau mỗi ca.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { API_OUT, viaApi, noteApiSpend, switchToPlan } from "./api-budget.mjs";

const KEYS = ["ANTHROPIC_API_KEY", "GENBID_API_SPEND_FILE", "GENBID_CLAUDE_TOKEN_FILE", "CLAUDE_CODE_OAUTH_TOKEN", "HOME", "USERPROFILE"];
function sandbox(fn) {
  const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-budget-"));
  const log = console.log; console.log = () => {};
  try {
    for (const k of KEYS) delete process.env[k];
    // Thư mục nhà giả: không có .claude/.credentials.json thật.
    process.env.HOME = dir; process.env.USERPROFILE = dir;
    return fn(dir, path.join(dir, "spend.jsonl"));
  } finally {
    console.log = log;
    for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const rows = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);

// ---------- API_OUT ----------
test("API_OUT: nhận hai thông báo API hết tiền / chạm hạn mức, không phân biệt hoa thường", () => {
  assert.ok(API_OUT.test("Credit balance is too low to access the Anthropic API"));
  assert.ok(API_OUT.test("You have reached your specified API usage limits. You will regain access on 2026-12-01"));
  assert.ok(API_OUT.test("CREDIT BALANCE IS TOO LOW"));
});
test("API_OUT: lỗi khác (mạng, 429 rate limit, hết lượt) không bị coi là hết tiền", () => {
  for (const s of ["rate_limit_error: Number of request tokens has exceeded", "Overloaded", "ECONNRESET", "error_max_turns", "", "Claude usage limit reached"]) assert.ok(!API_OUT.test(s), s);
});

// ---------- viaApi ----------
test("viaApi: đúng khi có ANTHROPIC_API_KEY, sai khi không có hoặc rỗng", () => sandbox(() => {
  assert.equal(viaApi(), false);
  process.env.ANTHROPIC_API_KEY = "";
  assert.equal(viaApi(), false);
  process.env.ANTHROPIC_API_KEY = "sk-test";
  assert.equal(viaApi(), true);
}));

// ---------- noteApiSpend ----------
test("noteApiSpend: lượt trả bằng API key ghi một dòng JSON vào sổ chi, làm tròn 4 số lẻ, có src và thời điểm", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f;
  noteApiSpend(1.6170104, "config", true);
  noteApiSpend(0.12345678, "bidprice", true);
  const r = rows(f);
  assert.equal(r.length, 2);
  assert.deepEqual(r.map((x) => [x.usd, x.src]), [[1.617, "config"], [0.1235, "bidprice"]]);
  assert.ok(!Number.isNaN(Date.parse(r[0].t)));
}));
test("noteApiSpend: lượt chạy bằng gói tháng (api=false) KHÔNG tính vào hạn mức API", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f;
  noteApiSpend(2, "config", false);
  noteApiSpend(2, "config", undefined);
  assert.equal(fs.existsSync(f), false);
}));
test("noteApiSpend: chi phí 0, âm, NaN, null, chữ không ghi dòng nào; chuỗi số '0.5' vẫn ghi", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f;
  for (const v of [0, -1, NaN, null, undefined, "abc"]) noteApiSpend(v, "x", true);
  assert.equal(fs.existsSync(f), false);
  noteApiSpend("0.5", "x", true);
  assert.equal(rows(f)[0].usd, 0.5);
}));
test("noteApiSpend: không đặt GENBID_API_SPEND_FILE thì không ghi và không ném; thư mục sổ không tồn tại cũng không ném", () => sandbox((dir, f) => {
  assert.doesNotThrow(() => noteApiSpend(1, "x", true));
  process.env.GENBID_API_SPEND_FILE = path.join(dir, "khong-co", "sub", "spend.jsonl");
  assert.doesNotThrow(() => noteApiSpend(1, "x", true));
}));
test("noteApiSpend: ghi nối tiếp (append), không xoá dòng cũ — bot cộng dồn cả tháng từ sổ này", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f;
  fs.writeFileSync(f, JSON.stringify({ t: "2026-11-02T00:00:00Z", usd: 10, src: "cũ" }) + "\n");
  noteApiSpend(1, "mới", true);
  const r = rows(f);
  assert.equal(r.length, 2);
  assert.equal(r[0].src, "cũ");
  assert.equal(r.reduce((s, x) => s + x.usd, 0), 11);
}));

// ---------- switchToPlan ----------
test("switchToPlan: API báo hết tiền → ghi 'exhausted', bỏ ANTHROPIC_API_KEY khỏi tiến trình, trả true để gọi lại", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test";
  assert.equal(switchToPlan("Credit balance is too low", "config"), true);
  assert.equal(process.env.ANTHROPIC_API_KEY, undefined);
  assert.equal(viaApi(), false); // các lần gọi sau đi bằng gói tháng
  assert.deepEqual(rows(f).map(({ t, ...x }) => x), [{ usd: 0, exhausted: true, src: "config" }]);
}));
test("switchToPlan: lỗi khác → false, giữ API key, không ghi sổ", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test";
  assert.equal(switchToPlan("Overloaded", "config"), false);
  assert.equal(switchToPlan("", "config"), false);
  assert.equal(switchToPlan(undefined, "config"), false);
  assert.equal(process.env.ANTHROPIC_API_KEY, "sk-test");
  assert.equal(fs.existsSync(f), false);
}));
test("switchToPlan: lượt đã chạy bằng gói tháng (không có API key) → false dù văn bản có chữ 'hết tiền' (không đổi gì)", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f;
  assert.equal(switchToPlan("credit balance is too low", "config"), false);
  assert.equal(fs.existsSync(f), false);
}));
test("switchToPlan: gọi lần hai không ghi 'exhausted' lần nữa (key đã bỏ)", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test";
  switchToPlan("credit balance is too low", "a");
  assert.equal(switchToPlan("credit balance is too low", "b"), false);
  assert.equal(rows(f).length, 1);
}));
test("switchToPlan: máy chưa đăng nhập gói tháng (không có .credentials.json) → nạp token từ GENBID_CLAUDE_TOKEN_FILE, chỉ dòng đầu", () => sandbox((dir, f) => {
  const tok = path.join(dir, "token");
  fs.writeFileSync(tok, "oat-123\nsecond line\n");
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test"; process.env.GENBID_CLAUDE_TOKEN_FILE = tok;
  assert.equal(switchToPlan("reached your specified API usage limits", "bid"), true);
  assert.equal(process.env.CLAUDE_CODE_OAUTH_TOKEN, "oat-123");
}));
test("switchToPlan: đã đăng nhập gói tháng (.credentials.json) → không đụng CLAUDE_CODE_OAUTH_TOKEN", () => sandbox((dir, f) => {
  fs.mkdirSync(path.join(dir, ".claude"));
  fs.writeFileSync(path.join(dir, ".claude", ".credentials.json"), "{}");
  const tok = path.join(dir, "token"); fs.writeFileSync(tok, "oat-123\n");
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test"; process.env.GENBID_CLAUDE_TOKEN_FILE = tok;
  // os.homedir() trên Windows đọc USERPROFILE, trên Linux đọc HOME: cả hai đã trỏ về thư mục tạm.
  assert.equal(switchToPlan("credit balance is too low", "x"), true);
  assert.equal(process.env.CLAUDE_CODE_OAUTH_TOKEN, undefined);
}));
test("switchToPlan: tệp token thiếu thì vẫn chuyển được, không ném", () => sandbox((dir, f) => {
  process.env.GENBID_API_SPEND_FILE = f; process.env.ANTHROPIC_API_KEY = "sk-test"; process.env.GENBID_CLAUDE_TOKEN_FILE = path.join(dir, "khong-co");
  assert.equal(switchToPlan("credit balance is too low", "x"), true);
  assert.equal(process.env.CLAUDE_CODE_OAUTH_TOKEN, undefined);
}));
