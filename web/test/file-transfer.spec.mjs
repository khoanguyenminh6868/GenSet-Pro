// Tải tệp báo giá và tệp HSMT / dự án trên bản web (việc phủ test còn thiếu, 19/11/2026). Chưa test nào đụng tới:
//   Báo giá NCC: addQuoteFiles (Upload → genbidScratch → /api/quote upload → lưu quote/<key>), openQuoteFile (mở PDF ở tab mới,
//     tệp khác tải về), askRemoveQuote (xoá một tệp → /api/quote delete);
//   HSMT / dự án: downloadHsmtFile (nút tải tệp không phải PDF, `fetchSiteFile` chỉ nhận địa chỉ cùng trang), openPdf (khung xem
//     pdf.js + "Tải về"), addProjectFiles (Upload vào kho `assets`, chữ ghi ở hsmttext/<key>_<i>, danh sách ở hsmt/<key>),
//     askRemoveProjectFile.
// Không gọi mạng: `genbidFetch`, `genbidScratch`, `/api/quote` và kho `assets` là giả (dựng lại trong ca, như fake-shim.js dựng
// phần còn lại); tệp và chữ trong tệp đều BỊA.
import { test, expect, openApp, openTab, writesOf } from "./fixtures.mjs";
import { tinyPdf } from "./fixtures/files.mjs";

const KEY = "IB2600586587"; // RICH
const PROJ = "DA-2026-11-04-01"; // dự án của dữ liệu mẫu
const AT = "2026-11-10T02:00:00.000Z";
// Thông báo MỚI NHẤT (.last()). Mỗi thông báo là một thẻ .toast riêng, sống 2,6 giây, thẻ mới nằm sau thẻ cũ. Với .first(), khi
// hai thông báo nối nhau trong vòng 2,6 giây (ca "Bỏ tệp tải tay": "Đã tải lên 2 tệp" rồi "Đã bỏ tệp" sau ~250 ms trên CI) thì
// .first() là thẻ CŨ cho tới khi nó tự xoá; thẻ mới chỉ là .first() trong đúng khoảng cách giữa hai thông báo, và lần thử lại
// của expect (cách nhau tới 1 giây) rơi ra ngoài khoảng đó → "element(s) not found" (9 / 157 lượt test-web, 19–22/11/2026).
const toast = (page) => page.locator("#toast, .toast").last();

// Giả các lời gọi ra ngoài của trang. files: { "/_gh/x": { type, text | bytes } }; apiFail: đường dẫn → thông báo lỗi.
async function stubNet(page, files = {}, { scratchFail = [] } = {}) {
  await page.evaluate(({ files, scratchFail }) => {
    const bytesOf = (f) => (f.bytes ? Uint8Array.from(f.bytes) : new TextEncoder().encode(f.text || ""));
    window.__net = { fetched: [], uploads: [], quote: [], assets: [] };
    window.genbidFetch = async (u) => {
      window.__net.fetched.push(u);
      const f = files[u];
      if (!f) throw { message: "HTTP 404" };
      return new Blob([bytesOf(f)], { type: f.type });
    };
    const scratch = window.genbidScratch;
    window.genbidScratch = async (key, list, dir) => {
      if ([...list].some((f) => scratchFail.includes(f.name))) throw { message: "kho tạm đầy (server thử)" };
      return scratch(key, list, dir);
    };
    let n = 0;
    const api = window.genbidApi;
    window.genbidApi = async (path, body) => {
      if (path !== "/api/quote") return api(path, body);
      window.__net.quote.push(body);
      if (body.action === "upload") { n++; return { id: "qa" + n, name: body.name, size: 1000 + n, url: "/_gh/qa" + n }; }
      return { ok: true };
    };
    const claude = window.claude, use = claude.use.bind(claude);
    claude.use = async (name) => (name === "assets"
      ? { async upload(f) { window.__net.assets.push({ name: f.name, size: f.size }); return { url: "/_gh/as-" + encodeURIComponent(f.name) }; } }
      : use(name));
  }, { files, scratchFail });
}
const net = (page) => page.evaluate(() => window.__net);
// window.open giả: tab mới của Chromium không đầu có thể hiện PDF hoặc tải về tuỳ bản, nên ghi lại đối số, địa chỉ được đặt, đóng.
const stubOpen = (page) => page.evaluate(() => {
  window.__popup = { args: null, href: "", closed: false };
  window.open = (...args) => { window.__popup.args = args; return { location: { set href(v) { window.__popup.href = v; } }, close() { window.__popup.closed = true; } }; };
});

// ---------- Báo giá NCC ----------

const QFILES = [
  { id: "f-pdf", name: "BG tecgen (BỊA).pdf", size: 2 * 1048576, url: "/_gh/f-pdf", at: AT },
  { id: "f-xls", name: "BG tecgen (BỊA).xlsx", size: 1048576, url: "/_gh/f-xls", at: AT },
];
const QUOTE = { [KEY]: { rows: [{ id: "r1", supplierId: "tecgen-fujian", files: QFILES }], memo: "giữ", updatedAt: "2026-10-01T00:00:00.000Z" } };

async function openQuote(page, files, opts) {
  await openApp(page, "#goi/" + KEY);
  await openTab(page, "price");
  await expect(page.locator("#dbody .qrow").first()).toBeVisible();
  await stubNet(page, files, opts);
}

test.describe("tệp báo giá NCC", () => {
  test.use({ patch: { colls: { quote: QUOTE } } });

  test("hiện từng tệp có tên, cỡ, nút Xem (PDF) / Tải về (tệp khác); tệp khác PDF bấm Tải về → tải đúng nội dung, qua genbidFetch với đúng địa chỉ", async ({ page }) => {
    await openQuote(page, { "/_gh/f-xls": { type: "application/vnd.ms-excel", text: "GIA BIA 123" } });
    const rows = page.locator("#dbody .docrow");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("BG tecgen (BỊA).pdf");
    await expect(rows.nth(0)).toContainText("2.00 MB");
    await expect(rows.nth(0).locator(".qpdf")).toHaveCount(1);
    await expect(rows.nth(1).locator(".qpdf")).toHaveCount(0);
    const [dl] = await Promise.all([page.waitForEvent("download"), rows.nth(1).locator("[data-qopen]").click()]);
    expect(dl.suggestedFilename()).toBe("BG tecgen (BỊA).xlsx");
    const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c);
    expect(Buffer.concat(chunks).toString()).toBe("GIA BIA 123");
    expect((await net(page)).fetched).toEqual(["/_gh/f-xls"]);
  });

  test("tệp PDF mở ở tab mới bằng link blob application/pdf (không tải về)", async ({ page }) => {
    await openQuote(page, { "/_gh/f-pdf": { type: "application/pdf", bytes: [...tinyPdf(["Bao gia (FAKE)"])] } });
    await stubOpen(page);
    await page.locator('[data-qopen="r1:0"]').click();
    // window.open("", "_blank") mở trước khi chờ (không thì trình duyệt chặn); sau khi có tệp, tab được đưa tới link blob.
    await expect.poll(() => page.evaluate(() => window.__popup.href)).toMatch(/^blob:http:\/\/127\.0\.0\.1:\d+\//);
    expect(await page.evaluate(() => window.__popup.args)).toEqual(["", "_blank"]);
    // Link blob là PDF thật: đọc lại từ chính trang (Chromium không đầu có thể tải thay vì hiện PDF, nên không dựa vào tab).
    const blob = await page.evaluate(async () => { const b = await (await fetch(window.__popup.href)).blob(); return { type: b.type, head: new TextDecoder().decode((await b.arrayBuffer()).slice(0, 5)) }; });
    expect(blob).toEqual({ type: "application/pdf", head: "%PDF-" });
    expect((await net(page)).fetched).toEqual(["/_gh/f-pdf"]);
    expect(await page.evaluate(() => window.__popup.closed)).toBe(false);
  });

  test("không lấy được tệp: báo 'Không mở được tệp' kèm lý do; PDF thì tab mới bị đóng, danh sách tệp giữ nguyên", async ({ page }) => {
    await openQuote(page, {}); // mọi địa chỉ → HTTP 404
    await page.locator('[data-qopen="r1:1"]').click();
    await expect(toast(page)).toContainText("Không mở được tệp: HTTP 404");
    await stubOpen(page);
    await page.locator('[data-qopen="r1:0"]').click();
    await expect.poll(() => page.evaluate(() => window.__popup.closed)).toBe(true);
    expect(await page.evaluate(() => window.__popup.href)).toBe("");
    await expect(toast(page)).toContainText("Không mở được tệp: HTTP 404");
    await expect(page.locator("#dbody .docrow")).toHaveCount(2);
    expect(await writesOf(page, "quote/")).toHaveLength(0);
  });

  test("Upload hai tệp: mỗi tệp qua kho tạm (thư mục quote) rồi /api/quote upload; danh sách lưu giữ tệp cũ và trường khác của gói", async ({ page }) => {
    await openQuote(page, {});
    await page.locator('input[data-qfiles="r1"]').setInputFiles([
      { name: "bg-moi-1.pdf", mimeType: "application/pdf", buffer: Buffer.from("x".repeat(10)) },
      { name: "bg-moi-2.xlsx", mimeType: "application/octet-stream", buffer: Buffer.from("y".repeat(20)) },
    ]);
    await expect(toast(page)).toContainText("Đã tải lên 2 tệp");
    const n = await net(page);
    expect(n.quote.map((b) => [b.action, b.key, b.name, b.path])).toEqual([
      ["upload", KEY, "bg-moi-1.pdf", `quote/${KEY}/1/01-bg-moi-1.pdf`],
      ["upload", KEY, "bg-moi-2.xlsx", `quote/${KEY}/1/01-bg-moi-2.xlsx`],
    ]);
    const scratch = await page.evaluate(() => window.__gb.scratch);
    expect(scratch.map((s) => [s.key, s.dir, s.names])).toEqual([[KEY, "quote", ["bg-moi-1.pdf"]], [KEY, "quote", ["bg-moi-2.xlsx"]]]);
    const ws = await writesOf(page, "quote/" + KEY);
    expect(ws).toHaveLength(2); // lưu sau MỖI tệp
    const last = ws[1].data;
    expect(last.memo).toBe("giữ");
    expect(last.rows[0].files.map((f) => f.name)).toEqual([...QFILES.map((f) => f.name), "bg-moi-1.pdf", "bg-moi-2.xlsx"]);
    expect(last.rows[0].files[2]).toMatchObject({ id: "qa1", url: "/_gh/qa1", by: "test@example.invalid" });
    await expect(page.locator("#dbody .docrow")).toHaveCount(4);
    await expect(page.locator("#dbody .qrow .muted", { hasText: /^4 tệp$/ })).toHaveCount(0); // đếm ở đầu hộp, không trong dòng
    await expect(page.locator("#dbody .drop > .row .muted")).toHaveText("4 tệp");
  });

  test("tệp lớn hơn 45 MB bị chặn trước khi tải; tệp lỗi giữa chừng không làm mất tệp đã lên: báo từng tệp lỗi", async ({ page }) => {
    await openQuote(page, {}, { scratchFail: ["loi.pdf"] });
    await page.evaluate(() => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array(46 * 1048576)], "qua-lon.pdf"));
      dt.items.add(new File(["ok"], "tot.pdf"));
      dt.items.add(new File(["no"], "loi.pdf"));
      const i = document.querySelector('input[data-qfiles="r1"]');
      i.files = dt.files; i.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(toast(page)).toContainText("Đã tải lên 1 tệp.");
    const msg = await toast(page).innerText();
    expect(msg).toContain("qua-lon.pdf: lớn hơn 45 MB");
    expect(msg).toContain("loi.pdf: kho tạm đầy (server thử)");
    expect((await net(page)).quote.map((b) => b.name)).toEqual(["tot.pdf"]); // tệp lớn không tới /api/quote
    const [w] = (await writesOf(page, "quote/" + KEY)).slice(-1);
    expect(w.data.rows[0].files.map((f) => f.name)).toEqual([...QFILES.map((f) => f.name), "tot.pdf"]);
  });

  test("Xoá một tệp: hỏi xác nhận, gọi /api/quote delete đúng id, chỉ tệp đó mất khỏi danh sách; Huỷ thì không đổi gì", async ({ page }) => {
    await openQuote(page, {});
    await page.locator('[data-qdel="r1:1"]').click();
    await expect(page.locator("#qDelOk")).toBeVisible();
    await page.locator("[data-close]").last().click();
    await expect(page.locator("#ov")).toBeHidden();
    expect((await net(page)).quote).toEqual([]);
    expect(await writesOf(page, "quote/")).toHaveLength(0);

    await page.locator('[data-qdel="r1:1"]').click();
    await expect(page.locator("#mdl")).toContainText("BG tecgen (BỊA).xlsx");
    await page.locator("#qDelOk").click();
    await expect(toast(page)).toContainText("Đã xoá tệp");
    expect((await net(page)).quote).toEqual([{ action: "delete", key: KEY, id: "f-xls" }]);
    const [w] = await writesOf(page, "quote/" + KEY);
    expect(w.data.rows[0].files.map((f) => f.id)).toEqual(["f-pdf"]);
    expect(w.data.memo).toBe("giữ");
  });
});

// ---------- Tệp HSMT: tải về và xem ----------

const HFILES = [
  { name: "Chuong V (BỊA).docx", size: 3 * 1048576, hasText: true, url: "/_gh/h-docx" },
  { name: "E-HSMT (BỊA).pdf", size: 1048576, hasText: true, url: "/_gh/h-pdf" },
  { name: "Gia (BỊA).xlsx", size: 1000, hasText: true, url: "https://evil.example/x.xlsx" }, // địa chỉ ngoài trang
  { name: "Cũ (BỊA).doc", size: 1000, hasText: true }, // chưa có url: không có nút
];

test.describe("tệp HSMT: tải về, xem PDF", () => {
  test.use({ patch: { colls: { hsmt: { [KEY]: { files: HFILES, textChunks: 0, updatedAt: AT } } } } });

  async function openInfo(page, files) {
    await openApp(page, "#goi/" + KEY);
    await expect(page.locator("#dbody .docrow")).toHaveCount(HFILES.length);
    await stubNet(page, files);
  }

  test("tệp không phải PDF: nút Tải tệp tải về đúng tên và nội dung; tệp PDF có nút Xem, tệp chưa có url không có nút nào", async ({ page }) => {
    await openInfo(page, { "/_gh/h-docx": { type: "application/octet-stream", text: "NOI DUNG BIA" } });
    const rows = page.locator("#dbody .docrow");
    await expect(rows.nth(0).locator("[data-dlfile]")).toHaveCount(1);
    await expect(rows.nth(1).locator("[data-openpdf]")).toHaveCount(1);
    await expect(rows.nth(3).locator("button, a")).toHaveCount(0);
    const [dl] = await Promise.all([page.waitForEvent("download"), rows.nth(0).locator("[data-dlfile]").click()]);
    expect(dl.suggestedFilename()).toBe("Chuong V (BỊA).docx");
    const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c);
    expect(Buffer.concat(chunks).toString()).toBe("NOI DUNG BIA");
    expect((await net(page)).fetched).toEqual(["/_gh/h-docx"]);
    expect(page.url()).toContain("#goi/" + KEY); // nút là link href="#": không đổi địa chỉ
  });

  test("địa chỉ tệp không bắt đầu bằng một dấu '/' (trang khác) bị từ chối, không gọi genbidFetch", async ({ page }) => {
    await openInfo(page, {});
    await page.locator("#dbody .docrow").nth(2).locator("[data-dlfile]").click();
    await expect(toast(page)).toContainText("Không tải được tệp: địa chỉ tệp không hợp lệ");
    expect((await net(page)).fetched).toEqual([]);
  });

  test("không lấy được tệp: báo 'Không tải được tệp' kèm lý do, trang vẫn dùng được", async ({ page }) => {
    await openInfo(page, {});
    await page.locator("#dbody .docrow").nth(0).locator("[data-dlfile]").click();
    await expect(toast(page)).toContainText("Không tải được tệp: HTTP 404");
    await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
  });

  test("Xem PDF: khung xem vẽ đủ trang bằng pdf.js; Tải về lưu đúng tệp; lỗi lấy tệp hiện thông báo trong khung", async ({ page, libs }) => {
    test.setTimeout(60000);
    const pdf = tinyPdf(["E-HSMT (FAKE)", "Prime power 160 kVA"]);
    await openInfo(page, { "/_gh/h-pdf": { type: "application/pdf", bytes: [...pdf] } });
    await page.locator("[data-openpdf]").click();
    await expect(page.locator("#pvBody")).toContainText("1 trang", { timeout: 25000 }); // pdf.js + worker tải theo nhu cầu: chậm khi máy bận
    await expect(page.locator("#pvBody canvas")).toHaveCount(1);
    expect(libs).toContain("pdf.min.js");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("#pvSave").click()]);
    expect(dl.suggestedFilename()).toBe("E-HSMT (BỊA).pdf");
    const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c);
    expect(Buffer.concat(chunks).equals(pdf)).toBe(true);

    await page.evaluate(() => { document.querySelector(".modal [data-close]")?.click(); });
    await page.evaluate(() => { window.genbidFetch = async () => { throw { message: "HTTP 500" }; }; });
    await page.locator("[data-openpdf]").click();
    await expect(page.locator("#pvBody")).toContainText("Không tải được tệp từ kho lưu trữ (HTTP 500)");
  });
});

// ---------- Tệp tải tay của dự án / HSMT ----------

test.describe("tải tệp lên dự án", () => {
  const TEXT = "Dự án BỊA: cung cấp máy phát điện dự phòng 250 kVA cho trạm bơm. Yêu cầu: động cơ diesel 4 kỳ, làm mát bằng nước.";

  async function openProject(page) {
    await openApp(page, "#goi/" + PROJ);
    await expect(page.locator("#dtitle")).toBeVisible();
    await stubNet(page, {});
  }

  test("Upload tệp .txt: tệp vào kho assets, chữ ghi hsmttext/<key>_0, danh sách ghi hsmt/<key> có manual + hasText; tải lại cùng tên thì thay chứ không thêm", async ({ page }) => {
    await openProject(page);
    const up = (name, text) => page.locator("#pFiles").setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from(text) });
    await up("yeu-cau.txt", TEXT);
    await expect(toast(page)).toContainText("Đã tải lên 1 tệp");
    expect((await net(page)).assets).toEqual([{ name: "yeu-cau.txt", size: Buffer.byteLength(TEXT) }]);
    let h = (await writesOf(page, "hsmt/" + PROJ)).at(-1).data;
    expect(h).toMatchObject({ notifyNo: PROJ, source: "tải tay", textChunks: 1 });
    expect(h.files).toEqual([{ name: "yeu-cau.txt", size: Buffer.byteLength(TEXT), hasText: true, converted: false, url: "/_gh/as-yeu-cau.txt", manual: true }]);
    const t = (await writesOf(page, `hsmttext/${PROJ}_0`)).at(-1).data.text;
    expect(t).toContain("--- Tệp: yeu-cau.txt ---");
    expect(t).toContain("động cơ diesel 4 kỳ");
    await expect(page.locator("#dbody .docrow")).toHaveCount(1);

    // Cùng tên: thay bản cũ, vẫn một dòng.
    await up("yeu-cau.txt", TEXT + " Bổ sung: đầu phát Stamford, điện áp 400/230 V, tần số 50 Hz, có tủ ATS.");
    await expect(page.locator("#dbody .docrow")).toHaveCount(1);
    h = (await writesOf(page, "hsmt/" + PROJ)).at(-1).data;
    expect(h.files).toHaveLength(1);
    expect((await writesOf(page, `hsmttext/${PROJ}_0`)).at(-1).data.text).toContain("tủ ATS");
  });

  test("tệp ít chữ (< 40 ký tự) không có hasText và không có chữ ghi lên; tệp khác .txt (ảnh) vẫn lưu danh sách", async ({ page }) => {
    await openProject(page);
    await page.locator("#pFiles").setInputFiles([
      { name: "ngan.txt", mimeType: "text/plain", buffer: Buffer.from("ngắn quá") },
      { name: "ban-ve.png", mimeType: "image/png", buffer: Buffer.from("png") },
    ]);
    await expect(toast(page)).toContainText("Đã tải lên 2 tệp");
    const h = (await writesOf(page, "hsmt/" + PROJ)).at(-1).data;
    expect(h.files.map((f) => [f.name, f.hasText, f.manual])).toEqual([["ngan.txt", false, true], ["ban-ve.png", false, true]]);
    expect(h.textChunks).toBe(0);
    expect(await writesOf(page, "hsmttext/")).toHaveLength(0);
  });

  test("kho tệp không dùng được (chế độ xem hạn chế): báo, không ghi hsmt", async ({ page }) => {
    await openApp(page, "#goi/" + PROJ);
    await expect(page.locator("#pFiles")).toHaveCount(1); // chưa có db thì addProjectFiles báo "Đăng nhập": chờ khung vẽ xong
    await expect(page.locator("#dtitle")).toBeVisible();
    await page.evaluate(() => { const use = window.claude.use.bind(window.claude); window.claude.use = async (n) => (n === "assets" ? null : use(n)); });
    await page.locator("#pFiles").setInputFiles({ name: "a.txt", mimeType: "text/plain", buffer: Buffer.from(TEXT) });
    await expect(toast(page)).toContainText("Chế độ xem này không tải tệp lên được.");
    expect(await writesOf(page, "hsmt/")).toHaveLength(0);
  });

  test("tải lên lỗi (kho assets ném lỗi): báo lý do, không ghi hsmt, khung tải lên dùng lại được", async ({ page }) => {
    await openApp(page, "#goi/" + PROJ);
    await expect(page.locator("#pFiles")).toHaveCount(1);
    await expect(page.locator("#dtitle")).toBeVisible();
    await page.evaluate(() => { const use = window.claude.use.bind(window.claude); window.claude.use = async (n) => (n === "assets" ? { async upload() { throw { message: "hết dung lượng (server thử)" }; } } : use(n)); });
    await page.locator("#pFiles").setInputFiles({ name: "a.txt", mimeType: "text/plain", buffer: Buffer.from(TEXT) });
    await expect(toast(page)).toContainText("Không tải được tệp lên: hết dung lượng (server thử)");
    expect(await writesOf(page, "hsmt/")).toHaveLength(0);
    await expect(page.locator("#pFiles")).toHaveCount(1);
  });

  test("Bỏ tệp tải tay: hỏi xác nhận; xác nhận thì tệp mất khỏi hsmt và chữ của tệp đó mất khỏi hsmttext, tệp còn lại giữ chữ", async ({ page }) => {
    await openProject(page);
    await page.locator("#pFiles").setInputFiles([
      { name: "a.txt", mimeType: "text/plain", buffer: Buffer.from("AAA " + TEXT) },
      { name: "b.txt", mimeType: "text/plain", buffer: Buffer.from("BBB " + TEXT) },
    ]);
    await expect(toast(page)).toContainText("Đã tải lên 2 tệp");
    await expect(page.locator("#dbody .docrow")).toHaveCount(2);
    await page.locator('[data-pdel="0"]').click();
    await page.locator("[data-close]").last().click(); // Huỷ
    await expect(page.locator("#ov")).toBeHidden(); // hộp thoại đóng hẳn trước khi mở lại (không thì bấm nhầm vào hộp đang đóng)
    await expect(page.locator("#dbody .docrow")).toHaveCount(2);
    await page.locator('[data-pdel="0"]').click();
    await page.locator("#pDelOk").click();
    await expect(toast(page)).toContainText("Đã bỏ tệp");
    await expect(page.locator("#dbody .docrow")).toHaveCount(1);
    await expect(page.locator("#dbody .docrow .fn")).toHaveText("b.txt");
    const h = (await writesOf(page, "hsmt/" + PROJ)).at(-1).data;
    expect(h.files.map((f) => f.name)).toEqual(["b.txt"]);
    const t = (await writesOf(page, `hsmttext/${PROJ}_0`)).at(-1).data.text;
    expect(t).toContain("--- Tệp: b.txt ---");
    expect(t).not.toContain("a.txt");
    expect(t).not.toContain("AAA");
  });
});
