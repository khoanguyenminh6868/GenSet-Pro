// Dựng web/test/fixtures/seed.json: dữ liệu mẫu NHỎ cho server thử (web/test/serve.mjs) và test khói Playwright.
// Chỉ chạy trên máy của Khoa (cần genbid-work\doc-cache); CI chỉ đọc seed.json đã commit.
//   node web/test/fixtures/make-seed.mjs            (doc-cache mặc định: <repo>/../genbid-work/doc-cache)
//   GENBID_DOC_CACHE=<thư mục> node web/test/fixtures/make-seed.mjs
// Repo công khai: KHÔNG đưa giá vốn, báo giá NCC (quote/*), token, email vào đây. Email trong dữ liệu muasamcong được thay
// bằng "[email]". Gói đang mở là gói giả (IB2699…), trừ IB2600586587 (gói thật có Phân tích + Cấu hình gợi ý + Giá gợi ý).
// Câu trích nguồn (cấu hình gợi ý, phân tích) được gắn tiền tố SRC_MARK để test SHOW_SRC=false tìm thấy nếu nó lộ ra.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { check } from "../../../suppliers/bidprice-bot.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../..");
const CACHE = process.env.GENBID_DOC_CACHE || path.join(REPO, "..", "genbid-work", "doc-cache");
export const SRC_MARK = "SRCQ_";
const docs = (f) => JSON.parse(fs.readFileSync(path.join(CACHE, f + ".json"), "utf8")).docs;
const noEmail = (o) => JSON.parse(JSON.stringify(o).replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]"));

const RICH = "IB2600586587"; // Bệnh viện Mắt Huế, 160 kVA: có analysis, configmatch, bidprice (lượt hồi quy T4)
const STAMP = "2026-11-01T00:00:00.000Z"; // updated_at của mọi tài liệu mẫu: thao tác ghi phải ra mốc mới hơn

// ---------- câu trích nguồn: gắn dấu ----------
// Cấu hình gợi ý: câu trích của nguồn NCC và của HSMT, dòng bảng thông số, đường dẫn / tệp nguồn.
const CFG_SRC = new Set(["sourceQuote", "hsmtQuote", "quote", "quoteA", "quoteB", "modelRow", "requirementQuote", "line", "url", "file"]);
// Phân tích: câu trích HSMT và chỗ dẫn chiếu (Chương / Mục).
const ANA_SRC = new Set(["quote", "reference", "requirementRef", "offeredRef"]);
function mark(o, keys) {
  if (Array.isArray(o)) return o.map((x) => mark(x, keys));
  if (!o || typeof o !== "object") return o;
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" && v && keys.has(k) ? SRC_MARK + v : mark(v, keys)]));
}

// ---------- gói thầu ----------
const bidhistAll = docs("bidhist");
const BH = {
  won: "IB2400337979", // có Thảo Nguyên (MST 4101623015) trúng → tab Trúng thầu
  lost: "IB2400379144", // có Thảo Nguyên, không trúng → tab Không trúng
  sample1: "IB2200004914", sample2: "IB2300231276", // hai gói "gần" mà Giá gợi ý của RICH chọn
};
const ours = (d) => JSON.stringify(d.lots || []).includes("4101623015");
// Trang Chủ đầu tư: chủ đầu tư nhỏ nhất có ≥ 3 gói mua máy phát (isGensetName, như danh sách gói) mà Thảo Nguyên không dự.
const isGen = globalThis.GenbidBidprice.isGensetName; // nạp cùng bidprice-bot.mjs
const byInv = {};
for (const [k, v] of Object.entries(bidhistAll)) if (v.d.investorName && isGen(v.d.bidName) && !ours(v.d)) (byInv[v.d.investorName] ||= []).push(k);
const size = (keys) => keys.reduce((n, k) => n + JSON.stringify(bidhistAll[k]).length, 0);
const [INVESTOR, invAll] = Object.entries(byInv).filter(([, ks]) => ks.length >= 3).sort((a, b) => size(a[1]) - size(b[1]) || a[0].localeCompare(b[0]))[0];
const invKeys = invAll.sort().slice(0, 3);
const subKey = Object.entries(bidhistAll).filter(([, v]) => ours(v.d) && !v.d.final).sort((a, b) => JSON.stringify(a[1]).length - JSON.stringify(b[1]).length)[0][0];
const bidhist = {};
for (const k of [...Object.values(BH), ...invKeys, subKey]) bidhist[k] = noEmail(bidhistAll[k].d);

// Gói đang mở (feed/current), ngày đóng thầu năm 2030 để test không phụ thuộc giờ hệ thống.
const OPEN_CLOSE = "2030-01-10T03:00:00.000Z";
const T = (notifyNo, bidName, publicDate, extra = {}) => ({ notifyNo, bidName, investorName: "Bệnh viện Thử Nghiệm", location: "Thành phố Huế", bidForm: "CHCT", field: "HH",
  isInternet: true, publicDate, bidCloseDate: OPEN_CLOSE, estimatedPrice: 950000000, sourceUrl: "", ...extra });
const ana = docs("analysis")[RICH].d;
const tenders = [
  T(RICH, "Mua sắm máy phát điện phục vụ công việc của Bệnh viện Mắt Huế", "2026-11-05T02:00:00.000Z", { investorName: "Bệnh Viện Mắt Huế", bidForm: "DTRR", estimatedPrice: 906120000 }),
  T("IB2699000102", "Mua sắm máy phát điện dự phòng 250 kVA", "2026-11-10T02:00:00.000Z"),
  T("IB2699000103", "Cung cấp, lắp đặt máy phát điện 400 kVA", "2026-11-08T02:00:00.000Z"),
  T("IB2699000104", "Mua máy phát điện 3 pha 100 kVA", "2026-10-20T02:00:00.000Z", { bidCloseDate: "2026-10-30T03:00:00.000Z" }),
  T("IB2699000105", "Mua sắm máy phát điện 500 kVA (đã hủy TBMT)", "2026-11-07T02:00:00.000Z", { status: "cancelled" }),
  T("IB2699000106", "Mua sắm máy phát điện 60 kVA", "2026-11-06T02:00:00.000Z"),
  T("IB2699000107", "Mua sắm máy phát điện 1000 kVA", "2026-11-03T02:00:00.000Z"),
];
const strip = (t) => Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith("_")));
const byNo = Object.fromEntries(tenders.map((t) => [t.notifyNo, t]));
const tracked = {
  IB2699000103: { stage: "preparing", note: "", tender: strip(byNo.IB2699000103), updatedAt: STAMP },
  IB2699000104: { stage: "submitted", note: "Đã nộp qua mạng", bidPrice: 410000000, tender: strip(byNo.IB2699000104), updatedAt: STAMP },
  IB2699000106: { stage: "dropped", prevStage: "new", note: "", tender: strip(byNo.IB2699000106), updatedAt: STAMP },
};
// Dự án tạo tay (tab Dự án).
const manual = { "DA-2026-11-04-01": { isProject: true, projectNo: "DA-2026-11-04-01", bidName: "Dự án thử: cải tạo nguồn dự phòng", investorName: "Công ty Thử", location: "Đà Nẵng", addedAt: "2026-11-04T02:00:00.000Z" } };

// ---------- gói có đủ dữ liệu ----------
const cm = docs("configmatch")[RICH].d;
// Hai cấu hình đầu (đủ cho bảng so, thứ hạng, NCC); bỏ phần còn lại cho nhỏ.
const configmatch = { [RICH]: mark({ ...cm, result: { ...cm.result, configs: cm.result.configs.slice(0, 2) } }, CFG_SRC) };
const analysis = { [RICH]: mark(ana, ANA_SRC) };
// Giá gợi ý: chạy lại bidprice-bot check trên lượt hồi quy T4 (cùng cách bot dựng bidprice/<TBMT>).
const run = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(REPO, "suppliers/fixtures/runs", RICH, "bidprice.input.json.gz"))));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "genbid-seed-"));
let bp;
try {
  fs.writeFileSync(path.join(dir, "samples.json"), JSON.stringify(run.samples));
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(run.result));
  bp = check(dir).result;
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
// Chỉ giữ các gói mẫu đã xếp giống / gần và 3 gói khác (cho nhỏ); giá ba mức vẫn là của lượt thật.
const keep = new Set([...bp.samples.filter((s) => s.level === "same" || s.level === "close").map((s) => s.id), ...bp.samples.filter((s) => s.level === "different").slice(0, 3).map((s) => s.id)]);
const bidprice = { [RICH]: noEmail({ at: run.from.bidpriceAt, result: { ...bp, samples: bp.samples.filter((s) => keep.has(s.id)) } }) };
// Nhà thầu của RICH: mượn danh sách nhà thầu công khai của gói mẫu 2 (cùng cỡ) để màn có dữ liệu; final=false.
const lot = bidhist[BH.sample2].lots[0];
const bidders = { [RICH]: { at: STAMP, final: false, url: "", packagePrice: 906120000, list: lot.bidders.map((b) => ({ name: b.name, taxCode: b.taxCode, bidPrice: b.bidPrice ?? null, priceAfterDiscount: b.finalPrice ?? b.bidPrice ?? null, won: false, note: "" })) } };

// ---------- nhà cung cấp (suppliers/cn) ----------
// NCC mà cấu hình hạng 1 dẫn tới (đủ nhỏ) và hai NCC nhỏ khác.
const SUP = ["tecgen-fujian", "hosem-power", "kaichen-jiangsu", "sices", "abz-power"];
const supplier = Object.fromEntries(SUP.map((id) => [id, noEmail(JSON.parse(fs.readFileSync(path.join(REPO, "suppliers/cn", id + ".json"), "utf8")))]));
const supfav = { "tecgen-fujian": { on: true, at: STAMP, by: "" } };

const colls = { feed: { current: { tenders, fetchedAt: "2026-11-12T22:00:00.000Z" } }, bidhist, tracked, manual, analysis, configmatch, bidprice, bidders, supplier, supfav, supexcl: {} };
const out = { stamp: STAMP, colls };
const file = path.join(HERE, "seed.json");
fs.writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
console.log(file, (fs.statSync(file).size / 1024).toFixed(0) + " KB", Object.fromEntries(Object.entries(colls).map(([c, v]) => [c, Object.keys(v).length])));
