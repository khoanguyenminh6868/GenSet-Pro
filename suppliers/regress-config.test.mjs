// Hồi quy Gợi ý cấu hình không gọi agent (T4): kết quả đã lưu của lượt thật (configmatch) chạy lại `check` +
// `rankConfigs` trên dữ liệu NCC đóng băng của chính lượt đó, so với expected.json cạnh fixture. Đây là KHOÁ HÀNH VI
// (đúng/sai nghiệp vụ đã xem tay khi chốt mẫu, ghi ở nghiem-thu\test-t4.md): đổi code làm đổi kết quả thì test đỏ,
// người sửa xem diff rồi cập nhật có chủ ý bằng GENBID_REGRESS_UPDATE=1 (suppliers/fixtures/runs/README.md).
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { check, rankConfigs, technicalPart } from "./config-bot.mjs";
import { missingCodes } from "./reqcodes.mjs";
import { runsOf, readBundle, tmpDir, matchExpected, configSummary } from "./fixtures/runs/regress.mjs";

delete process.env.GENBID_NAMED_SELLER; // cờ nhận tổ máy nêu đích danh từ trang bên bán: mặc định tắt

const CASES = {
  "IB2600586587/config": "máy một cỡ thường 160 kVA, xuất xứ Tất cả, không điều kiện đặc biệt",
  "IB2600601812/config": "HSMT nêu đích danh tổ máy Huyndai DHY110K SE (100 kVA), không cấu hình nào đúng hãng",
  "IB2600592684/config-1": "gói nhiều cỡ máy: cỡ 30 kVA (nêu đích danh FORTUGEN)",
  "IB2600592684/config-2": "gói nhiều cỡ máy: cỡ 500 kVA (nêu đích danh FORTUGEN)",
  "IB2600603983/config": "xuất xứ G7/EU tự đọc từ HSMT (chỉ bộ phận chính), 700 kVA",
  "IB2600594596/config-1": "đồng bộ thương hiệu 2/3 bộ phận, cỡ 300 kVA của gói hai cỡ",
};

const runs = runsOf("config");
test("có đủ các lượt hồi quy Gợi ý cấu hình đã chọn", () => {
  if (runs.map((r) => `${r.tender}/${r.name}`).join(",") !== Object.keys(CASES).sort().join(",")) throw new Error(`fixture: ${runs.map((r) => `${r.tender}/${r.name}`).join(", ")}`);
});
for (const r of runs) {
  test(`hồi quy cấu hình ${r.tender}/${r.name}: ${CASES[`${r.tender}/${r.name}`] || "?"}`, () => {
    const b = readBundle(r.input), dir = tmpDir(r.tender);
    try {
      // Bảng thông số (RATINGS) đóng băng mà sourceRatings đọc, thay cho suppliers/sources/ của repo.
      for (const [f, text] of Object.entries(b.sources || {})) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
      const out = check(b.result, { hsmtText: b.hsmtText, suppliers: b.suppliers, readWeb: () => null, origin: b.meta.origin, basis: b.meta.basis, sized: !!b.meta.sized, sourcesDir: dir });
      rankConfigs(out.result);
      matchExpected(r.expected, configSummary(out, missingCodes(technicalPart(b.hsmtText), out.result.requirements)));
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
}
