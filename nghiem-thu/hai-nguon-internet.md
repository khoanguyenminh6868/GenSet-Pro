# Luật "2 nguồn internet" — danh sách (24/11/2026) — DỞ DANG, DỪNG VÌ LUẬT CONTEXT 30 %

Máy đọc được: `dau-vao\hai-nguon-internet\danh-sach.json`. Phiên chỉ đọc repo, không sửa, không PR.

## Kết quả
- Model / trường ĐỦ 2 nguồn độc lập: **0**.
- Chưa đủ: **HGM9320** (mọi trường tìm được) — mọi trang là bản chép của MỘT tài liệu hãng SmartGen.

## HGM9320
- smartgen-america.com (nhà phân phối SmartGen Mỹ), ats4pro.com, presertec.cl: cùng chữ y hệt bảng "Technical Parameters" của brochure hãng (DC(8-35)V; 237*172*45; cắt panel 214*160; (-25~+70)℃; màn 4.3" TFT 480*272; RS485 / USB; RTC & Event Log; Scheduled Start). Tính là MỘT nguồn.
- doc.diytrade.com/…/1433217562.pdf = "HGM9200-HGM9300-HGM9400 INSTRUCTION V-1.0 en", 74 trang: manual của SmartGen do đại lý đăng lại, tải không cần đăng nhập → thuộc "tờ hãng", không thuộc luật này. Chưa trích được câu (truy vấn Firecrawl "query generation failed").
- Hệ quả: HGM9320 nên xử lý như "có tờ hãng qua bản đăng lại" (manual + brochure), cần Khoa/điều phối quyết có coi bản đại lý đăng lại là tờ hãng hay không; không phải việc của luật 2 nguồn.
- Câu trích đầy đủ nằm trong JSON (smartgen-america đã đọc; ats4pro, presertec mới thấy đoạn trích kết quả tìm kiếm).

## Bẫy gặp
- Trang đại lý / bán hàng chép nguyên bảng thông số của hãng: ba URL khác domain vẫn là một nguồn.
- presertec.cl: tải trực tiếp bằng curl trả trang 404 (HTML) dù tìm kiếm thấy; diytrade không trả header cho curl.
- Firecrawl quét PDF 74 trang tốn 78 credit và truy vấn trích lỗi; đừng quét cả PDF lớn, tải bằng curl + pdftotext.
- Kết quả firecrawl_search có thể trả cả trang chủ dạng base64 rất dài (smartgen.cn): đặt `limit` nhỏ, `includeDomains`.

## Chưa làm
HGM9520, 9220/9210, 9410, 9500, 6100CAN; SICES GC310/350/500Plus; toàn bộ đầu phát Stamford (LVI634B–G, PI734, UCI274J/K, 164/184, P126TI, P086TI, LVSI804).
Gợi ý phiên sau: với mỗi model, tìm nguồn KHÔNG phải bản chép của hãng (diễn đàn kỹ thuật, nhà tích hợp tự viết, tài liệu thứ ba tự đo), kiểm hai nguồn không chung văn bản; dùng curl + pdftotext để tiết kiệm context.

## Đề xuất lưu vào hồ sơ (để verify.mjs kiểm được)
Mỗi giá trị loại này là một mục `evidence: [{url, quote}, {url, quote}]` (đúng 2 phần tử, domain khác nhau) kèm `basis: "2-nguon-internet"`. `verify.mjs` kiểm: (1) hai domain khác nhau, (2) mỗi `quote` có mặt nguyên văn trong bản lưu của trang (lưu bản chụp text vào `genbid-work` kèm hash), (3) cả hai quote chứa cùng giá trị sau chuẩn hoá `sameValue`, (4) hai bản chụp không trùng quá ngưỡng (phát hiện bản chép). Web hiện dấu "2 nguồn internet".
