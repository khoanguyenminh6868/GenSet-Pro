# Tờ hãng lượt 4 (24/11/2026)

**Tình trạng**: dữ liệu xong trong worktree `C:\Projects\GenSet Pro\wt-to-hang-4` (nhánh `wt-to-hang-4`), CHƯA commit / push / PR: lệnh `git commit && git push && gh pr create` bị bộ phân loại quyền của phiên từ chối. Cần Khoa (hoặc phiên điều phối có quyền) chạy commit + push + PR nháp. Bản sao gốc để so: worktree `wt-to-hang-4-base` (detach từ origin/main), xoá khi xong.

## Đã thêm (hồ sơ chỉ thêm; verify 436 bản ghi 0 lỗi; 70 test đạt: ls-ratings, dau-phat-hang, dau-phat-hang-d, ctl-twin, ctl-module, regress-config, ratings)
Stamford `stamford-avk-china`, URL `https://www.stamford-avk.com/sites/stamfordavk/files/…`:
- 1061 PI734B Wdg 13 (PI7B-13-TD-EN_Rev_A.pdf) — trang hãng chỉ có 13/26/28, không có 311/312.
- 1062 PI734D Wdg 312; 1063 PI734E Wdg 312; 1064 PI734F Wdg 07 (Rev_B; chỉ có 07/13/26).
- 1065–1068 LVSI804S / R / T / W Wdg 12 (tờ ghi "LV 804 S WDG 12"…; tiêu đề hồ sơ có "(tờ ghi LV 804 S)"). Danh mục có LVSI804R/S/T/T2/W; T2 không thêm.
- UCI274G, UCDI274J, UCDI274K: ĐÃ CÓ sẵn trong hồ sơ từ trước (maker-datasheets báo "đã có"), không thêm. UCDI giữ đúng tên UCDI.
SmartGen `smartgen`: nguồn 1014 HGM9510, URL `https://www.smartgen-america.com/upload/iblock/0c9/zhr01df3en0stwmaivrnra99eacdr28m.pdf`. Kiểm chữ: "HGM9510 GENSET PARALLEL (WITH GENSET) CONTROLLER USER MANUAL", "SmartGen Technology Co., Ltd.", "This manual is suitable for HGM9510 parallel controller only." Tiêu đề: "… - bản của hãng do smartgen-america.com đăng lại". Bị cắt ở 700 dòng (699 dòng giữ).

## Đo model được gắn tờ (CAT.build, `dau-vao\dau-phat-dien-ap\do-hien-trang.mjs`, số liệu ở `dau-vao\to-hang-4\base.json` / `new.json`)
Đầu phát: model có dòng định mức 242 → 242; Stamford thiếu tờ 243 → 243. **0 model được gắn thêm.** Lý do: 8 tờ mới ra 0 dòng qua `ratingsOf` (tờ PI734C 1060 cũng vậy): bảng "Winding 13 / 0.8 Power | Factor" xuống dòng khác bố cục `ratingsOf` đọc; hàng "| kVA | 1455 | 1455 | 1455 | 1560 …" cột lệch. Cần việc code đọc riêng (ratings.mjs), KHÔNG làm trong PR này. Tờ lưu đủ làm nguồn và `modelFacts` có thể gắn thuộc tính.
HGM9510: chưa đo `modelFacts` (hết context); chưa biết có bao nhiêu model catalog nhận.

## Chưa làm
- commit / push / PR nháp (bị từ chối quyền).
- Đo gắn HGM9510 vào `modelFacts` / `factsFor`.
- Đọc dòng định mức bảng PI7 / LVSI804.
- Xoá worktree `wt-to-hang-4-base`.
