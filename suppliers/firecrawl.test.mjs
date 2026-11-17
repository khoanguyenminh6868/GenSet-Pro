// node --test suppliers/firecrawl.test.mjs — Firecrawl as the fallback of the agents' save command (Khoa 2026-11-17).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { shouldRetry, keyFile } from "./firecrawl.mjs";

const { save } = await import("./config-bot.mjs");

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "fc-"));
const html = (body) => ({ ok: true, status: 200, url: "https://maker.example/p", headers: new Headers({ "content-type": "text/html; charset=utf-8" }), arrayBuffer: async () => new TextEncoder().encode(`<html><body>${body}</body></html>`).buffer });
const fcFake = (calls, fail) => ({ hasKey: () => true, shouldRetry, scrape: async (url) => { calls.push(url); if (fail) throw new Error("firecrawl HTTP 402 (hết credit tháng này)"); return { url, markdown: "| Model | kVA |\n| D440 | 440 |" }; } });

test("shouldRetry: bị chặn, lỗi mạng, trang JS rỗng thì thử Firecrawl; 404 / tên miền sai thì không", () => {
  assert.equal(shouldRetry({ status: 403 }), true);
  assert.equal(shouldRetry({ status: 429 }), true);
  assert.equal(shouldRetry({ status: 503 }), true);
  assert.equal(shouldRetry({ status: 404 }), false);
  assert.equal(shouldRetry({ error: "ENOTFOUND" }), false);
  assert.equal(shouldRetry({ error: "ECONNRESET" }), true);
  assert.equal(shouldRetry({ status: 200, textLength: 120 }), true);
  assert.equal(shouldRetry({ status: 200, textLength: 5000 }), false);
});

test("keyFile: biến môi trường, rồi GENBID_ROOT (sandbox), rồi máy Windows", () => {
  assert.equal(keyFile({ GENBID_FIRECRAWL_KEY_FILE: "/k" }), "/k");
  assert.equal(keyFile({ GENBID_ROOT: "/r" }), path.join("/r", "genbid-hsmt", ".firecrawl-key"));
  assert.match(keyFile({}), /genbid-hsmt\/\.firecrawl-key$/);
});

test("save: 403 thì đọc lại qua Firecrawl, ghi Via: firecrawl", async () => {
  const dir = tmp(), calls = [];
  const f = await save(dir, "https://maker.example/p", { fetchImpl: async () => ({ ok: false, status: 403 }), fc: fcFake(calls) });
  assert.equal(f, "web/1.txt");
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  assert.match(t, /^URL: https:\/\/maker\.example\/p\nAccessed: \d{4}-\d\d-\d\d\nVia: firecrawl\n\n\| Model/);
  assert.deepEqual(calls, ["https://maker.example/p"]);
});

test("save: trang đọc được thì không tốn credit", async () => {
  const dir = tmp(), calls = [];
  await save(dir, "https://maker.example/p", { fetchImpl: async () => html("x".repeat(2000)), fc: fcFake(calls) });
  assert.deepEqual(calls, []);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, "web/1.txt"), "utf8"), /Via:/);
});

test("save: trang JS rỗng mà Firecrawl lỗi thì giữ bản tự tải; 403 mà Firecrawl lỗi thì báo cả hai", async () => {
  const dir = tmp();
  assert.equal(await save(dir, "https://maker.example/p", { fetchImpl: async () => html("ngắn"), fc: fcFake([], true) }), "web/1.txt");
  await assert.rejects(save(dir, "https://maker.example/q", { fetchImpl: async () => ({ ok: false, status: 403 }), fc: fcFake([], true) }), /HTTP 403; firecrawl HTTP 402/);
});

test("save: không có khoá thì như trước (403 là lỗi)", async () => {
  const fc = { hasKey: () => false, shouldRetry, scrape: async () => assert.fail("không được gọi") };
  await assert.rejects(save(tmp(), "https://maker.example/p", { fetchImpl: async () => ({ ok: false, status: 403 }), fc }), /^Error: HTTP 403$/);
});
