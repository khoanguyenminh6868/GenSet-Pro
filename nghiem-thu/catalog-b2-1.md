# catalog-b2 — ROW_EXCEPTIONS kiểu `dropspec` (20/11/2026)

PR draft: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/952 (nhánh `catalog-b2`, 2 commit). Gốc `85466b48`.
- Commit 1 `0e34ac3e`: A, khối lượng của 5 dòng (Khoa 19/11 "ok").
- Commit 2 (đầu nhánh): B, aosif 8M33D1012E311 — **Khoa CHƯA duyệt riêng**, tách commit để gỡ (`git revert` / bỏ mục aosif ở `ROW_EXCEPTIONS` + ca test aosif + một câu trong `web/CLAUDE.md`).

## Tệp đổi
`web/catalog.js` (mục `dropspec` trong `rowExceptions`, 7 mục dữ liệu), `web/CLAUDE.md` (dòng "Ngoại lệ theo DÒNG"), `suppliers/catalog-b2.test.mjs` (mới, 4 ca dòng thật). Không đụng `suppliers/cn`.

## Thiết kế
`act: "dropspec", keys: [...]`: bản ghi khớp (NCC + n + model tổ máy + chữ dòng nguyên văn) giữ nguyên, chỉ lọc `specs` bỏ khoá trong `keys`; ghi note "ngoại lệ theo dòng". Bẫy gặp: pengpai n131 chép NGUYÊN VĂN dòng LZ1750 của n103; ngoại lệ chạy trước `mergeRepeats` nên nếu chỉ liệt kê n103 thì số 1440 từ bản ghi n131 được gộp lại → thêm cả n131. bdadl n129 ghi "…| 14400" (chữ dòng khác) KHÔNG đụng.

## Kiểm (đo thật)
- spec-diff toàn bộ `git:85466b48 .`: `bản ghi cũ 60073, mới 60073 | khác 6 | chỉ cũ 0, chỉ mới 0`; `{"cyl bỏ":1,"disp bỏ":1,"weight bỏ":5}`; đảo vai 0 → 0. Từng bản ghi (trước → sau):
  - bdadl-shanghai n104 b2 dòng 14 BDA-LZ1750 / S16R-PTAA2-C: weight 1440 → ∅
  - fukangsi-yangzhou n2009 b18 dòng 7 FKS-LZ1750: weight 1440 → ∅
  - pengpai-yangzhou n103 b2 dòng 14 PPDL-LZ1750: weight 1440 → ∅ (n131 gộp vào đây, không còn bản ghi riêng)
  - fukangsi-yangzhou n2001 b2 dòng 0 FKS-C20 4B3.9-G1: weight 5500 → ∅
  - pengpai-yangzhou n125 b24 dòng 0 PPDL-C20 4B3.9-G1: weight 5500 → ∅
  - aosif n123 b21 dòng 19 AW1125 8M33D1012E311: cyl 12V → ∅; disp 31.8 → ∅
  Mọi số khác của 6 dòng (model, cyl 16 / 4, disp 65.4 / 3.92, tiêu hao, kích thước…) giữ. "tự kiểm: cần soát tay 7" = đúng 7 số bỏ trên ("mới không kiểm được"), không số mới.
- `row-flags.mjs --json` gốc ↔ nhánh: 160 → 158 dòng. MẤT 2: fukangsi n2001 4B3.9-G1 và pengpai n125 4B3.9-G1 (`absurd` drop, weight "5500"). MỚI 0. Cờ khác (cylMaj …) không đổi. aosif không có cờ từ trước.
- Test: `node --test suppliers/*.test.mjs web/test/*.test.mjs` → 1340 pass / 0 fail (chạy bằng Bash, 4 ca mới); `quality.mjs --check` không xấu đi. Playwright không chạy (không đổi giao diện).
- spec-diff riêng commit B (so với commit 1): khác 1 bản ghi (aosif), cyl / disp bỏ.
- Top 30: CHƯA đo (điều phối đo cloud). Dự kiến đổi: dòng 4B3.9-G1 của fukangsi / pengpai trở lại ứng viên (hết `rowflag` loại); LZ1750 mất khối lượng ở `khoaRules`; 8M33D1012E311 thay đổi theo luật xi lanh / dung tích (aosif không còn phiếu 12V / 31,8).

## Đối chiếu nguồn (3 mẫu)
1. http://www.bdadl.cn/?products_47/89.html (`sources/bdadl-shanghai/104.md` dòng 106): "| BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440" — chữ dòng đúng; cột cuối "机组重量(KG)". 1.440 kg cho 1.600 kW (0,9 kg/kW) vô lý; bảng n129 cùng NCC ghi 14400 cho cùng model.
2. http://yzfks.cn/?products_12/65.html (`sources/fukangsi-yangzhou/2001.md` dòng 199): "| FKS-C20 | 20/25 | 东风康明斯 | 4B3.9-G1 | 4 | 3.92 | 9 | ≤210 | 1600*800*1300 | 5500"; dòng kế "4B3.9-G2 … 1600*700*1150 | 600".
3. https://www.aosif.com/p/5-77.html (`sources/aosif/123.md` dòng 126): "| AW1125 | 1000/800 | 1125/900 | 8M33D1012E311^ | 218.9 | 12V | 31.8 |". Chữ dòng ĐÚNG như bản lưu. Việc "số thật sự sai" KHÔNG đọc ra được từ chính nguồn (dòng AW1000 kế bên 8M33D979E201 cũng "12V | 31.8"); căn cứ là số tên mã "8M33" (8 xi lanh), waeta / wiseke ghi 8 / 26,14 L, 150×185 mm × 8 ≈ 26,1 L — đó là suy luận từ nguồn khác, nên Khoa cần duyệt riêng. Lưu ý: dòng AW1000 / 8M33D979E201 cùng "12V | 31.8" chưa động tới (ngoài phạm vi).

## Rủi ro, quay lui
- Ngoại lệ chỉ ăn khi chữ dòng nguyên văn; nguồn cào lại đổi chữ thì tự hết (có test).
- Quay lui: revert PR; riêng B: bỏ commit 2.
- Chưa kiểm: top 30; tác động config-bot lên gói thật.

## Cần ghi nhớ
- B chờ Khoa duyệt riêng. Dòng AW1000 aosif (8M33D979E201 "12V | 31.8") nghi cùng lỗi, chưa xử lý.
