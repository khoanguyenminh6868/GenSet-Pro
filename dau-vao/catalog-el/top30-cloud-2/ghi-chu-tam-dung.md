# Ghi chú khi tạm dừng (20/11/2026, trước 17:00) — CHƯA báo điều phối

- #986 = cc23236c (gộp main 8b5184eb). Quét named giống từng byte bản đo (104 giữ / 81 mất). Test 1.433 đạt / 0 lỗi. Độc lập với #969 (không chứa 3bd48e84).
- #969 = 5759878e (sửa chú thích theo Khoa chốt (i) + gộp main e0b64666). Patch mã so với main giống hệt bản 3bd48e84 đã đo, chỉ khác 2 dòng chú thích. Test 1.438 đạt / 0 lỗi. Quét named hẹp: 9 cặp, giống. `quality --check` đang chạy (b7duslsxg).
- Câu hỏi (a) của điều phối về #969:
  - 61 khoá EL "chỉ có ở nhánh" đều ở lượt IB2400073761#0.
  - ~1.005 khoá NCC khác "vào all" nằm ở IB2400073761#0 (979), IB2500500319#1 (19), #0 (12), IB2500314001#0 (12).
  - Nguyên nhân: nhánh 3bd48e84 đã gộp main có #979 (HSMT ghi cả hai tần số = không ràng buộc), còn gốc đo cf0b0448 chưa có #979. Dòng bị loại `freq` ở gốc: 430 / 3 / 9 / 3 → 0. Không do #969.
  - Số dòng `all` giảm ở 369 lượt = đúng 26 khoá EL sai vai (động cơ = mã EL), đã kiểm 369/369.
- Còn lại:
  - #986: giải thích đủ 28 khoá rời không có bản vào (do-luot.mjs / so-b-dong.tsv).
  - #973: so-du-b xong; ly-do-goc/b.json đang hoặc đã chạy. Còn đối chiếu cummins.com, đề xuất dropspec, ghi mục "Top 30 cloud" trong catalog-hy-2.md.
  - Việc win đếm theo số.
