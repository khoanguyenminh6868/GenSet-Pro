// Các tab cần tệp (việc H2, 13/11/2026): YCKT tiếng Anh, Đối chiếu TLKT, Tạo HSDT, Đối chiếu HSDT. Thư viện CDN (pdf.js,
// mammoth, jsPDF, docx, phông DejaVu) được phục vụ từ node_modules của web/test (fixtures.mjs), SRI vẫn được kiểm. Tệp mẫu
// nhỏ tự tạo (fixtures/files.mjs), nội dung và kết quả của bot đều BỊA. Kiểm: đọc tệp, yêu cầu gửi bot (qua webreq.js thật),
// hiện kết quả, tệp xuất ra có nội dung.
import { test, expect, SEED, SRC_MARK, RICH, openApp, openTab, reqsOf, writesOf } from "./fixtures.mjs";
import { throughWebreq } from "./fixtures/real-api.mjs";
import { tinyPdf, tinyDocx, tinyXlsx, docxText, pdfText, download } from "./fixtures/files.mjs";

const PREP = "IB2699000103"; // gói Chuẩn bị HSDT (Đối chiếu chỉ mở ở trạng thái này)
const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k);
const HSMT = (k) => ({ [k]: { files: [{ name: "E-HSMT (BỊA).pdf", size: 120000 }], updatedAt: "2026-11-02T00:00:00.000Z" } });
const AT = "2026-11-10T02:00:00.000Z";
const PDF_LINES = ["Technical proposal (FAKE)", "Engine: Perkins 1106A-70TAG4 (FAKE)", "Prime power 160 kVA"];
const DOCX_PARAS = ["YCKT rút gọn (BỊA)", "Công suất liên tục ≥ 160 kVA", "Động cơ diesel 4 thì"];
const file = (name, mimeType, buffer) => ({ name, mimeType, buffer });
const PDF_MIME = "application/pdf", DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function oneReq(page, coll) {
  await expect.poll(async () => (await reqsOf(page, coll)).length, { message: coll, timeout: 20000 }).toBe(1);
  const [body] = await reqsOf(page, coll);
  const real = await throughWebreq(body);
  expect(real.status, real.error).toBe(200);
  return { item: body.items[0], saved: real.saved[0].data };
}

test.describe("YCKT tiếng Anh", () => {
  // Bản dịch (bịa) đã có: translation/<key> (meta v2) + translation/<key>_0 (các mục).
  const secs = [{ heading: "General requirements", points: ["Prime power 160 kVA, standby 180 kVA (FAKE)", "Diesel engine, <b>4-stroke</b>, water cooled"] }];
  test.use({ patch: { colls: { hsmt: HSMT(RICH), translation: { [RICH]: { v2: true, parts: 1, total: 1, done: true, at: AT }, [RICH + "_0"]: { sections: secs } } } } });

  test("hiện bản dịch có sẵn; Tạo lại → translationreq; Tải PDF ra tệp tên theo công suất liên tục, có chữ của bản dịch", async ({ page, libs }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "translate");
    await expect(page.locator("#trEdit h3")).toHaveText("General requirements");
    await expect(page.locator("#trEdit li")).toHaveCount(2);
    await expect(page.locator("#trEdit b")).toHaveText("4-stroke");
    const pdf = await download(page, () => page.locator("#trPdf").click());
    expect(pdf.name).toBe("160kVA - Technical requirements.pdf"); // trPrimeKva: số kVA sau "Prime power"
    expect(pdf.buf.subarray(0, 5).toString()).toBe("%PDF-");
    const { text } = await pdfText(pdf.buf);
    expect(text).toContain("Technical Requirement");
    expect(text).toContain("General requirements");
    expect(text.replace(/\s+/g, " ")).toContain("Prime power 160 kVA");
    expect(libs).toEqual(expect.arrayContaining(["jspdf.umd.min.js", "DejaVuSans.ttf", "DejaVuSans-Bold.ttf"]));
    await expect(page.locator("#trInfo")).toHaveText("Đã tải PDF.");

    await page.locator("#trRun").click();
    const { item, saved } = await oneReq(page, "translationreq");
    expect(item).toEqual({ key: RICH, notifyNo: RICH, bidName: tender(RICH).bidName });
    expect(saved.notifyNo).toBe(RICH);
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent dịch");
  });
});

test.describe("Đối chiếu TLKT: tải tệp lên không được → trang tự đọc chữ trong tệp", () => {
  test.use({ patch: { scratch: "fail", colls: { hsmt: HSMT(RICH) } } });

  test("YCKT rút gọn (DOCX, mammoth) + đề xuất (PDF, pdf.js; XLSX, xlsx) → tlktreq mang chữ đã đọc và lý do", async ({ page, libs }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "tlkt");
    await page.locator("#tyFiles").setInputFiles(file("YCKT-rut-gon.docx", DOCX_MIME, await tinyDocx(DOCX_PARAS)));
    await page.locator("#tkFiles").setInputFiles([file("de-xuat.pdf", PDF_MIME, tinyPdf(PDF_LINES)),
      file("bang-dap-ung.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", tinyXlsx("Đáp ứng", [["Hạng mục", "Chào"], ["Động cơ", "Perkins 1106A-70TAG4 (BỊA)"]]))]);
    await expect(page.locator("#tyList .fn")).toHaveText("YCKT-rut-gon.docx");
    await expect(page.locator("#tkList .fn")).toHaveText(["de-xuat.pdf", "bang-dap-ung.xlsx"]);
    await page.locator("#tkRun").click();
    const { item, saved } = await oneReq(page, "tlktreq");
    expect(item.files).toEqual([]);
    expect(item.reqFiles).toEqual([]);
    expect(item.text).toContain("--- Tệp: de-xuat.pdf ---");
    for (const l of PDF_LINES) expect(item.text).toContain(l);
    expect(item.reqText).toContain("--- Tệp: YCKT-rut-gon.docx ---");
    for (const p of DOCX_PARAS) expect(item.reqText).toContain(p);
    expect(item.uploadError).toContain("YCKT-rut-gon.docx");
    expect(item.uploadError).toContain("de-xuat.pdf");
    // Bảng tính: mỗi sheet một tiêu đề, mỗi hàng một dòng, các ô nối bằng " | " (như bot Windows đọc).
    expect(item.text).toContain("--- Tệp: bang-dap-ung.xlsx ---\n### Sheet: Đáp ứng\nHạng mục | Chào\nĐộng cơ | Perkins 1106A-70TAG4 (BỊA)");
    // Bot nhận đủ chữ đã đọc (webreq.js giữ text, reqText, uploadError).
    for (const k of ["text", "reqText", "uploadError"]) expect(saved[k], k).toBe(item[k]);
    expect(libs).toEqual(expect.arrayContaining(["pdf.min.js", "pdf.worker.min.js", "mammoth.browser.min.js", "xlsx.full.min.js"]));
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent đối chiếu tài liệu kỹ thuật");
  });
});

test.describe("Đối chiếu TLKT: tải tệp lên được", () => {
  test.use({ patch: { colls: { hsmt: HSMT(RICH) } } });

  test("Cấu hình Kỹ Thuật nhập tay thay cho tệp đề xuất; YCKT rút gọn đi dạng tệp đã tải lên", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "tlkt");
    await page.locator("#tyFiles").setInputFiles(file("YCKT-rut-gon.docx", DOCX_MIME, await tinyDocx(DOCX_PARAS)));
    await page.locator("#tkFiles").setInputFiles(file("de-xuat.pdf", PDF_MIME, tinyPdf(PDF_LINES)));
    await page.locator("#tkText").fill("Tổ máy 160 kVA, động cơ Perkins 1106A-70TAG4 (BỊA)");
    await page.locator("#tkRun").click();
    const { item, saved } = await oneReq(page, "tlktreq");
    expect(item.files).toEqual([]); // ô nhập tay có chữ: không gửi tệp đề xuất
    expect(item.text).toBe("--- Cấu hình Kỹ Thuật của Nhà Cung Cấp (nhập tay) ---\nTổ máy 160 kVA, động cơ Perkins 1106A-70TAG4 (BỊA)");
    expect(item.reqFiles).toHaveLength(1);
    expect(item.reqFiles[0]).toMatchObject({ name: "YCKT-rut-gon.docx" });
    expect(item.reqFiles[0].path).toMatch(new RegExp(`^tlkt/${RICH}/`));
    expect(item.reqText).toBe("");
    expect(saved.reqFiles).toEqual(item.reqFiles);
    expect(saved.text).toBe(item.text);
  });
});

test.describe("Đối chiếu TLKT: kết quả có sẵn", () => {
  // Kết quả (bịa) và bản tiếng Anh cùng lượt (resultEnAt = at): Tải PDF tạo ngay, không gửi yêu cầu dịch.
  const result = { verdict: "at_risk", overallScore: 72, supplier: "Nhà cung cấp BỊA", offer: "Tổ máy 160 kVA (BỊA)", summary: "Đáp ứng phần lớn, cần làm rõ bộ điều khiển (BỊA).",
    items: [{ group: "Động cơ", requirement: "Công suất liên tục ≥ 160 kVA", requirementRef: SRC_MARK + "Chương V mục 2", offered: "160 kVA", offeredRef: SRC_MARK + "trang 3", status: "met", critical: true, note: "" },
      { requirement: "Bộ điều khiển có màn hình", offered: "—", status: "unclear", note: "Đề xuất không ghi" },
      { requirement: "Bình dầu ≥ 6 giờ", offered: "4 giờ", status: "not_met", note: "Thiếu dung tích" }],
    questionsForSupplier: ["Model bộ điều khiển là gì?"], deviations: ["Bình dầu 4 giờ thay vì 6 giờ"] };
  const resultEn = { verdict: "at_risk", overallScore: 72, supplier: "FAKE supplier", summary: "Mostly compliant, controller to clarify (FAKE).",
    items: [{ requirement: "Prime power >= 160 kVA", offered: "160 kVA", status: "met", note: "" }, { requirement: "Fuel tank >= 6 hours", offered: "4 hours", status: "not_met", note: "Too small" }],
    questionsForSupplier: ["Which controller model?"], deviations: [] };
  test.use({ patch: { colls: { hsmt: HSMT(RICH), tlkt: { [RICH]: { at: AT, result, resultEn, resultEnAt: AT } } } } });

  test("điểm, kết luận, số mục theo trạng thái, câu hỏi; không in chỗ dẫn chiếu; Tải PDF tiếng Anh có nội dung", async ({ page, libs }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "tlkt");
    const out = page.locator("#tkOut");
    await expect(out.locator(".dial span")).toHaveText("72");
    await expect(out).toContainText("Còn điểm cần làm rõ");
    await expect(out).toContainText("1 Đạt");
    await expect(out).toContainText("1 Không đạt");
    await expect(out).toContainText("1 Chưa rõ");
    await expect(out.locator("tbody tr")).toHaveCount(3);
    await expect(out).toContainText("Câu hỏi cần nhà cung cấp làm rõ (1)");
    await expect(out).toContainText("Điểm khác với yêu cầu (1)");
    expect(await out.textContent()).not.toContain(SRC_MARK);
    const pdf = await download(page, () => page.locator("#tkPdf").click());
    expect(pdf.name).toBe(`${RICH} Technical compliance review EN.pdf`);
    const { text } = await pdfText(pdf.buf);
    const flat = text.replace(/\s+/g, " ");
    for (const s of ["Technical Proposal Compliance Review", "Score 72/100", "Clarifications needed", "Fuel tank >= 6 hours", "Which controller model?"]) expect(flat).toContain(s);
    expect(flat).not.toContain(SRC_MARK);
    expect(libs).toContain("jspdf.umd.min.js");
    expect(await reqsOf(page, "tlktreq")).toEqual([]);
  });
});

test.describe("Tạo HSDT tham khảo", () => {
  test.use({ patch: { scratch: "fail", colls: { hsmt: HSMT(RICH) } } });

  test("template DOCX + cấu hình NCC PDF, tải lên không được → hsdtreq mang chữ đã đọc", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "hsdt");
    await page.locator("#hpFiles").setInputFiles(file("template.docx", DOCX_MIME, await tinyDocx(DOCX_PARAS)));
    await page.locator("#hcFiles").setInputFiles(file("cau-hinh-ncc.pdf", PDF_MIME, tinyPdf(PDF_LINES)));
    await page.locator("#hsRun").click();
    const { item, saved } = await oneReq(page, "hsdtreq");
    expect(item.templateFiles).toEqual([]);
    expect(item.configFiles).toEqual([]);
    for (const p of DOCX_PARAS) expect(item.templateText).toContain(p);
    for (const l of PDF_LINES) expect(item.configText).toContain(l);
    for (const k of ["templateText", "configText", "uploadError"]) expect(saved[k], k).toBe(item[k]);
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent soạn HSDT tham khảo");
  });
});

test.describe("HSDT tham khảo có sẵn", () => {
  const result = { summary: "Hồ sơ tham khảo (BỊA) cho gói máy phát 160 kVA.", warnings: ["Kiểm lại thời gian giao hàng (BỊA)"],
    sections: [{ title: "Đề xuất kỹ thuật (BỊA)", paragraphs: ["Tổ máy [điền model] 160 kVA."], table: { headers: ["Hạng mục", "Đáp ứng"], rows: [["Công suất", "160 kVA"]] } }],
    checklist: [{ document: "Bảo đảm dự thầu", required: true, note: "" }, { document: "Catalogue", required: false, note: "bản chụp" }] };
  test.use({ patch: { colls: { hsmt: HSMT(RICH), hsdt: { [RICH]: { at: AT, result } } } } });

  test("hiện hồ sơ (sửa được tại chỗ), Tải Word ra .docx có đủ mục, bảng, danh mục", async ({ page, libs }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "hsdt");
    const doc = page.locator("#hsDoc");
    await expect(doc).toContainText("HỒ SƠ DỰ THẦU (BẢN THAM KHẢO)");
    await expect(doc.locator('[data-h="sections.0.title"]')).toHaveText("Đề xuất kỹ thuật (BỊA)");
    await expect(doc.locator('[data-h="sections.0.title"]')).toHaveAttribute("contenteditable", "true");
    await expect(doc).toContainText("☐ Bảo đảm dự thầu (bắt buộc)");
    const w = await download(page, () => page.locator("#hsDocx").click());
    expect(w.name).toBe(`HSDT tham khao ${RICH}.docx`);
    const text = await docxText(w.buf);
    for (const s of ["HỒ SƠ DỰ THẦU (BẢN THAM KHẢO)", tender(RICH).bidName, result.summary, "Lưu ý: Kiểm lại thời gian giao hàng (BỊA)", "Đề xuất kỹ thuật (BỊA)", "160 kVA", "Danh mục hồ sơ cần chuẩn bị", "☐ Bảo đảm dự thầu (bắt buộc)", "☐ Catalogue – bản chụp"]) expect(text).toContain(s);
    expect(libs).toContain("index.umd.js");
    await expect(page.locator("#hsInfo")).toHaveText("Đã tải tệp Word.");
  });
});

test.describe("Đối chiếu HSDT (gói Chuẩn bị HSDT)", () => {
  const result = { verdict: "at_risk", overallScore: 64, summary: "Hồ sơ còn thiếu cam kết bảo hành (BỊA).",
    items: [{ requirement: "Bảo hành ≥ 12 tháng", requirementRef: SRC_MARK + "Chương V", offered: "—", status: "missing", critical: true, note: "Chưa có" },
      { requirement: "Công suất 400 kVA", offered: "400 kVA", offeredRef: SRC_MARK + "trang 2", status: "met", note: "" }],
    selfChecks: [{ kind: "model_consistency", status: "problem", finding: "Model động cơ hai chỗ ghi khác nhau (BỊA)", fix: "Thống nhất model" }, { kind: "package_identity", status: "ok", finding: "Đúng tên gói" }],
    recommendations: ["Bổ sung cam kết bảo hành (BỊA)"], missingDocuments: ["Giấy phép bán hàng (BỊA)"] };
  test.use({ patch: { colls: { hsmt: HSMT(PREP), compare: { [PREP]: { at: AT, result } } } } });

  test("kết quả: điểm, kết luận, tự kiểm (1 vấn đề), mục thiếu; Đối chiếu lại gửi comparereq với tệp đã tải lên và chữ dán", async ({ page }) => {
    await openApp(page, "#goi/" + PREP);
    await openTab(page, "compare");
    const out = page.locator("#cmOut");
    await expect(out.locator(".dial span")).toHaveText("64");
    await expect(out).toContainText("Có rủi ro, sửa được");
    await expect(out).toContainText("Tự kiểm hồ sơ dự thầu (1 vấn đề)");
    await expect(out).toContainText("Hãng, model, xuất xứ: Model động cơ hai chỗ ghi khác nhau (BỊA)");
    await expect(out).toContainText("Tài liệu còn thiếu (1)");
    await expect(out).toContainText("1 Thiếu");
    expect(await out.textContent()).not.toContain(SRC_MARK);

    await page.locator("#cmFiles").setInputFiles(file("HSDT.pdf", PDF_MIME, tinyPdf(PDF_LINES)));
    await page.locator("#cmText").fill("Bảng đáp ứng kỹ thuật (BỊA)");
    await page.locator("#cmRun").click();
    // Đã có kết quả + có tệp mới: hỏi trước khi đối chiếu lại.
    await page.locator("#cmAgain").click();
    const { item, saved } = await oneReq(page, "comparereq");
    // Kết quả cũ bị xoá ngay (compare/<TBMT>), rời màn hình.
    expect((await writesOf(page, "compare/" + PREP)).map((w) => w.op)).toEqual(["delete"]);
    await expect(out.locator(".dial")).toHaveCount(0);
    expect(item.files).toHaveLength(1);
    expect(item.files[0]).toMatchObject({ name: "HSDT.pdf" });
    expect(item.files[0].path).toMatch(new RegExp(`^hsdt/${PREP}/`));
    expect(item.text).toBe("Bảng đáp ứng kỹ thuật (BỊA)");
    expect(saved.files).toEqual(item.files);
    expect(saved.text).toBe(item.text);
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent đối chiếu");
  });
});
