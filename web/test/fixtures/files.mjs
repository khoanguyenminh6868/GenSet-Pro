// Tệp mẫu nhỏ tự tạo cho các tab cần tệp (YCKT tiếng Anh, Đối chiếu TLKT, Tạo HSDT, Đối chiếu HSDT), và đọc lại tệp trang
// xuất ra (PDF, DOCX) bằng cùng thư viện có trong node_modules của web/test. Nội dung tệp là chữ BỊA.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// PDF một trang, phông Helvetica, chữ ASCII; dựng tay (đủ bảng xref) để không cần thư viện tạo PDF.
export function tinyPdf(lines) {
  const esc = (s) => s.replace(/[\\()]/g, (c) => "\\" + c);
  const content = "BT /F1 12 Tf 72 720 Td 16 TL " + lines.map((l) => `(${esc(l)}) Tj T*`).join(" ") + " ET";
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offs = objs.map((o, i) => { const at = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

// DOCX vài đoạn (thư viện docx, cùng bản trang dùng để xuất Word).
export async function tinyDocx(paras) {
  const { Document, Packer, Paragraph, TextRun } = require("docx");
  const doc = new Document({ sections: [{ children: paras.map((p) => new Paragraph({ children: [new TextRun(p)] })) }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

// XLSX một sheet (thư viện xlsx, cùng bản trang dùng để đọc bảng tính).
export function tinyXlsx(sheet, rows) {
  const XLSX = require("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheet);
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

// Chữ trong tệp DOCX (mammoth, như trang đọc tệp).
export async function docxText(buf) {
  const mammoth = require("mammoth");
  return (await mammoth.extractRawText({ buffer: buf })).value;
}

// Chữ trong tệp PDF (pdf.js bản legacy cho Node, cùng phiên bản trang dùng).
export async function pdfText(buf) {
  const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), disableFontFace: true, isEvalSupported: false }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) pages.push((await (await doc.getPage(p)).getTextContent()).items.map((i) => i.str).join(" "));
  return { pages: doc.numPages, text: pages.join("\n") };
}

// Bắt tệp trang tải về (shim.save → thẻ <a download>) khi chạy action; trả { name, buf }.
export async function download(page, action) {
  const [d] = await Promise.all([page.waitForEvent("download"), action()]);
  const chunks = [];
  for await (const c of await d.createReadStream()) chunks.push(c);
  return { name: d.suggestedFilename(), buf: Buffer.concat(chunks) };
}
