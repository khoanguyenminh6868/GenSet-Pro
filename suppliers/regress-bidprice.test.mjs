// Hồi quy Giá gợi ý không gọi agent (T4): mức agent xếp từng gói cũ ở lượt thật (bidprice đã lưu) là đầu vào cố định,
// cùng samples.json do `prep` dựng lại từ bidhist 12/11/2026; `check` chạy lại phải ra đúng giá gợi ý và gói mẫu đã lưu
// (expected.json; lúc chốt mẫu khớp từng đồng với giá trên web). KHOÁ HÀNH VI: đổi quy tắc có chủ ý thì
// GENBID_REGRESS_UPDATE=1 (suppliers/fixtures/runs/README.md).
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { check } from "./bidprice-bot.mjs";
import { runsOf, readBundle, tmpDir, matchExpected, bidpriceSummary } from "./fixtures/runs/regress.mjs";

const CASES = {
  IB2600586587: "160 kVA: chỉ 1 gói gần dùng được, bù bằng gói cùng cỡ (prior); có giá cấu hình khác nhóm (Cummins sản xuất tại Trung Quốc)",
  IB2600601812: "100 kVA: 3 giống + 5 gần, hiệu chỉnh theo dự báo số nhà thầu; có giá cấu hình khác nhóm",
  IB2600603983: "700 kVA: không gói nào giống/gần, giá chỉ từ gói cùng cỡ (prior)",
};

const runs = runsOf("bidprice");
test("có đủ các lượt hồi quy Giá gợi ý đã chọn", () => {
  if (runs.map((r) => r.tender).join(",") !== Object.keys(CASES).sort().join(",")) throw new Error(`fixture: ${runs.map((r) => r.tender).join(", ")}`);
});
for (const r of runs) {
  test(`hồi quy giá ${r.tender}: ${CASES[r.tender] || "?"}`, () => {
    const b = readBundle(r.input), dir = tmpDir(r.tender);
    try {
      fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify(b.samples));
      fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(b.result));
      matchExpected(r.expected, bidpriceSummary(check(dir)));
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
}
