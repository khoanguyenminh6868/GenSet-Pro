// bot/sandbox/ensure.mjs: logic giữ bot sống trong Vercel Sandbox, với sandbox giả (không gọi mạng, không cần @vercel/sandbox).
import test from "node:test";
import assert from "node:assert/strict";
import { ensure, secretsEnv, checkSecrets, BOT_UP_CMD, rawUrl } from "../sandbox/ensure.mjs";

const ENV = { GENBID_INGEST_TOKEN: "i", CLAUDE_CODE_OAUTH_TOKEN: "c", GH_TOKEN: "g" };
const CREDS = { token: "t", teamId: "team", projectId: "prj" };

// Sandbox giả: script nào chứa chuỗi trong `answers` thì trả chuỗi đó; ghi lại các lệnh đã chạy.
function fakeSandbox({ botUp = false, setupDone = true, startWorks = true, expiresAt = null } = {}) {
  const calls = [];
  const sb = {
    expiresAt, extended: [],
    async extendTimeout(ms) { sb.extended.push(ms); },
    async runCommand(p) {
      calls.push(p);
      const s = p.args[1];
      let out = "";
      if (s === BOT_UP_CMD) out = botUp ? "UP" : "DOWN";
      else if (s.includes("sandbox-setup-done") && s.startsWith("test -f")) out = setupDone ? "DONE" : "TODO";
      else if (s.includes("start-bot.sh")) out = startWorks ? "UP" : "DOWN";
      return { exitCode: 0, stdout: async () => out };
    },
  };
  return { sb, calls };
}
const SandboxWith = (sb, { exists = true } = {}) => {
  const created = [];
  return {
    created,
    async get() { if (!exists) throw Object.assign(new Error("Not Found"), { response: { status: 404 } }); return sb; },
    async create(o) { created.push(o); return sb; },
  };
};

test("thiếu bí mật: báo lỗi, không đụng sandbox", async () => {
  assert.deepEqual(checkSecrets({}), ["GENBID_INGEST_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN hoặc ANTHROPIC_API_KEY", "GH_TOKEN"]);
  assert.deepEqual(checkSecrets({ ...ENV }), []);
  assert.deepEqual(checkSecrets({ GENBID_INGEST_TOKEN: "i", ANTHROPIC_API_KEY: "a", GH_TOKEN: "g" }), []);
  const { sb } = fakeSandbox();
  await assert.rejects(ensure({ Sandbox: SandboxWith(sb), creds: CREDS, env: {}, log() {} }), /Thiếu bí mật/);
});

test("bot đang chạy: không khởi chạy lại", async () => {
  const { sb, calls } = fakeSandbox({ botUp: true });
  await ensure({ Sandbox: SandboxWith(sb), creds: CREDS, env: ENV, log() {} });
  assert.ok(!calls.some((c) => c.args[1].includes("start-bot.sh")));
});

test("bot không chạy: khởi chạy start-bot.sh nền, bí mật chỉ nằm trong env của lệnh đó", async () => {
  const { sb, calls } = fakeSandbox({ botUp: false });
  await ensure({ Sandbox: SandboxWith(sb), creds: CREDS, env: { ...ENV, FIRECRAWL_KEY: "f", VERCEL_TOKEN: "không-được-chuyển" }, log() {} });
  const start = calls.find((c) => c.args[1].includes("start-bot.sh"));
  assert.ok(start);
  assert.match(start.args[1], /setsid nohup bash .*start-bot\.sh .*< \/dev\/null &/);
  assert.deepEqual(Object.keys(start.env).sort(), ["CLAUDE_CODE_OAUTH_TOKEN", "FIRECRAWL_KEY", "GENBID_BRANCH", "GENBID_INGEST_TOKEN", "GH_TOKEN"]);
  // token Vercel không đi vào sandbox, bí mật không nằm trong dòng lệnh
  for (const c of calls) { assert.ok(!JSON.stringify(c.args).includes("không-được-chuyển")); assert.ok(!JSON.stringify(c.args).includes('"c"')); }
});

test("bot khởi chạy mà không lên: báo lỗi", async () => {
  const { sb } = fakeSandbox({ botUp: false, startWorks: false });
  await assert.rejects(ensure({ Sandbox: SandboxWith(sb), creds: CREDS, env: ENV, log() {} }), /Bot không khởi động được/);
});

test("lần đầu (chưa có dấu cài đặt): chạy setup-sandbox.sh trước khi khởi chạy bot", async () => {
  const { sb, calls } = fakeSandbox({ botUp: false, setupDone: false });
  await ensure({ Sandbox: SandboxWith(sb), creds: CREDS, env: { ...ENV, GENBID_BRANCH: "bot-sandbox" }, log() {} });
  const iSetup = calls.findIndex((c) => c.args[1].includes("setup-sandbox.sh"));
  const iStart = calls.findIndex((c) => c.args[1].includes("start-bot.sh"));
  assert.ok(iSetup >= 0 && iStart > iSetup);
  assert.ok(calls[iSetup].args[1].includes(rawUrl("bot-sandbox", "bot/sandbox/setup-sandbox.sh")));
  assert.ok(calls[iSetup].timeoutMs >= 15 * 60e3);
});

test("chưa có sandbox: tạo persistent ở sin1; gói Hobby (create lỗi) thì thử lại phiên 45 phút", async () => {
  const { sb } = fakeSandbox({ botUp: true });
  const S = SandboxWith(sb, { exists: false });
  await ensure({ Sandbox: S, creds: CREDS, env: ENV, log() {} });
  assert.equal(S.created.length, 1);
  const o = S.created[0];
  assert.equal(o.name, "genbid-bot"); assert.equal(o.persistent, true); assert.equal(o.region, "sin1"); assert.equal(o.resources.vcpus, 4);
  assert.equal(o.timeout, 300 * 60e3); assert.deepEqual(o.failoverRegions, ["hkg1"]);
  assert.deepEqual(o.token, "t");

  const tries = [];
  const Hobby = { async get() { throw Object.assign(new Error("404"), { status: 404 }); }, async create(o) { tries.push(o); if (o.failoverRegions) throw new Error("failoverRegions chỉ có ở Pro"); return sb; } };
  await ensure({ Sandbox: Hobby, creds: CREDS, env: ENV, log() {} });
  assert.equal(tries.length, 2);
  assert.equal(tries[1].timeout, 45 * 60e3); assert.equal(tries[1].failoverRegions, undefined);
});

test("lỗi khác 404 khi lấy sandbox: ném lên, không tạo thêm sandbox", async () => {
  const S = { async get() { throw new Error("401 Unauthorized token sai"); }, async create() { throw new Error("không được gọi"); } };
  await assert.rejects(ensure({ Sandbox: S, creds: CREDS, env: ENV, log() {} }), /401/);
});

test("phiên sắp hết hạn thì gia hạn; còn nhiều thì thôi; hết trần gói không làm hỏng lượt", async () => {
  const t0 = 1_000_000_000_000;
  let r = fakeSandbox({ botUp: true, expiresAt: t0 + 10 * 60e3 });
  await ensure({ Sandbox: SandboxWith(r.sb), creds: CREDS, env: ENV, log() {}, now: () => t0 });
  assert.deepEqual(r.sb.extended, [120 * 60e3]);
  r = fakeSandbox({ botUp: true, expiresAt: t0 + 3 * 3600e3 });
  await ensure({ Sandbox: SandboxWith(r.sb), creds: CREDS, env: ENV, log() {}, now: () => t0 });
  assert.deepEqual(r.sb.extended, []);
  r = fakeSandbox({ botUp: true, expiresAt: t0 + 60e3 });
  r.sb.extendTimeout = async () => { throw new Error("vượt trần của gói"); };
  await ensure({ Sandbox: SandboxWith(r.sb), creds: CREDS, env: ENV, log() {}, now: () => t0 });
});

test("secretsEnv chỉ lấy bí mật có giá trị", () => {
  assert.deepEqual(secretsEnv({ GENBID_INGEST_TOKEN: "a", GH_TOKEN: "", PATH: "/bin" }), { GENBID_INGEST_TOKEN: "a" });
});
