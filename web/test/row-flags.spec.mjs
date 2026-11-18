// Dòng nghi sai (Chất lượng 1 chặng 2, 18/11/2026): rowflags/current do suppliers/row-flags.mjs --post ghi; màn Nhà cung
// cấp hiện nhãn "n dòng nghi sai", mục liệt kê dòng (chữ nguyên văn + link nguồn: ngoại lệ duy nhất của SHOW_SRC) và hai
// nút ghi rowok/<NCC>. Quyền bấm: một chỗ kiểm (rowOkCan), mặc định chỉ Superadmin.
import { test, expect, SEED, openApp, writesOf } from "./fixtures.mjs";

const SID = "hosem-power";
const S = SEED.colls.supplier[SID];
const T = 1, tab = S.specTables[T], URL1 = S.sources.find((x) => x.n === tab.n).url;
const row = (i, key, drop, code, detail) => ({ key, supplierId: SID, n: tab.n, table: T, row: i, kind: "engine", model: "BF4M2012", text: tab.rows[i], drop, reasons: [{ code, detail }] });
const ROWS = [
  row(0, `${SID}|engine|BF4M2012|aaaaaaaaaaaa`, true, "absurd", 'disp "108" (nhãn "排量(L)")'),
  row(1, `${SID}|engine|BF4M2012|bbbbbbbbbbbb`, false, "cylMaj", "4 ≠ 6 (số đông 3 NCC)"),
];
const colls = { rowflags: { current: { at: "2026-11-18T00:00:00Z", commit: "test", rows: ROWS } } };

async function openSup(page) {
  await openApp(page);
  await page.locator("#supBtn").click();
  await expect(page.locator("#supBody tr[data-supopen]")).toHaveCount(Object.keys(SEED.colls.supplier).length);
}

test.describe("Superadmin", () => {
  test.use({ patch: { colls } });
  test("nhãn ở danh sách, mục dòng nghi sai, hai nút ghi rowok, bấm lại bỏ quyết định", async ({ page }) => {
    await openSup(page);
    const tr = page.locator(`#supBody tr[data-supopen="${SID}"]`);
    await expect(tr).toContainText("2 dòng nghi sai");
    // NCC không có cờ: không nhãn.
    await expect(page.locator('#supBody tr[data-supopen="tecgen-fujian"]')).not.toContainText("dòng nghi sai");

    await tr.locator(".hlname").click();
    const box = page.locator("#supRowFlags");
    await expect(box).toHaveAttribute("open", "");
    await expect(box.locator("summary")).toHaveText("Dòng nghi sai (2)");
    const items = box.locator("li.rowflag");
    await expect(items).toHaveCount(2);
    // Chữ nguyên văn + link nguồn chỉ ở mục này.
    await expect(items.nth(0).locator("pre")).toContainText(tab.rows[0]);
    await expect(items.nth(0).locator("a")).toHaveAttribute("href", URL1);
    await expect(items.nth(0)).toContainText("số vô lý so với công suất của dòng");
    await expect(items.nth(0)).toContainText("Mức loại");
    await expect(items.nth(1)).toContainText("Chỉ cảnh báo");
    // Chặng B(iii) chưa làm: không được nói đã loại khỏi gợi ý.
    await expect(box).toContainText("Gợi ý cấu hình chưa dùng các quyết định này.");
    await expect(box).not.toContainText("Bị loại khỏi gợi ý");

    await items.nth(0).locator('[data-rowok="ok"]').click();
    await expect.poll(() => writesOf(page, `rowok/${SID}`)).toHaveLength(1);
    const [w1] = await writesOf(page, `rowok/${SID}`);
    expect(Object.keys(w1.data)).toEqual([ROWS[0].key]);
    expect(w1.data[ROWS[0].key].d).toBe("ok");
    expect(w1.data[ROWS[0].key].by).toBe("test@example.invalid");
    expect(w1.updated_at > SEED.stamp).toBe(true);
    await expect(box.locator("summary")).toHaveText("Dòng nghi sai (1 / 2)");
    await expect(page.locator("#supRowFlags li.rowflag").nth(0)).toContainText("Đã cho dùng");

    // Bỏ hẳn dòng thứ hai: giữ quyết định của dòng đầu.
    await page.locator("#supRowFlags li.rowflag").nth(1).locator('[data-rowok="drop"]').click();
    await expect.poll(() => writesOf(page, `rowok/${SID}`)).toHaveLength(2);
    const w2 = (await writesOf(page, `rowok/${SID}`))[1];
    expect(w2.data[ROWS[0].key].d).toBe("ok");
    expect(w2.data[ROWS[1].key].d).toBe("drop");
    await expect(page.locator("#supRowFlags li.rowflag").nth(1)).toContainText("Đã bỏ hẳn");
    // Dòng bỏ hẳn vẫn là dòng sai: vẫn đếm.
    await expect(page.locator("#supRowFlags summary")).toHaveText("Dòng nghi sai (1 / 2)");

    // Bấm lại "cho dùng": bỏ quyết định.
    await page.locator("#supRowFlags li.rowflag").nth(0).locator('[data-rowok="ok"]').click();
    await expect.poll(() => writesOf(page, `rowok/${SID}`)).toHaveLength(3);
    const w3 = (await writesOf(page, `rowok/${SID}`))[2];
    expect(Object.keys(w3.data)).toEqual([ROWS[1].key]);
    await expect(page.locator("#supRowFlags summary")).toHaveText("Dòng nghi sai (2)");

    await page.locator("#supBack").click();
    await expect(page.locator(`#supBody tr[data-supopen="${SID}"]`)).toContainText("2 dòng nghi sai");
  });

  test("NCC không có dòng nghi sai: không có mục", async ({ page }) => {
    await openSup(page);
    await page.locator('#supBody tr[data-supopen="tecgen-fujian"] .hlname').click();
    await expect(page.locator("#supBack")).toBeVisible();
    await expect(page.locator("#supRowFlags")).toHaveCount(0);
  });
});

test.describe("Thành viên thường", () => {
  test.use({ patch: { colls, role: "member" } });
  test("thấy mục nhưng không có nút", async ({ page }) => {
    await openSup(page);
    await page.locator(`#supBody tr[data-supopen="${SID}"] .hlname`).click();
    await expect(page.locator("#supRowFlags li.rowflag")).toHaveCount(2);
    await expect(page.locator("#supRowFlags [data-rowok]")).toHaveCount(0);
  });
});
