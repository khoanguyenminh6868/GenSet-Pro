# Brief: Soát ngưỡng HSMT, giảm 664 mục "thiếu" (Khoa 17/11: "làm 3")

Mục tiêu: giảm số mục "THIẾU" (664) trong soát ngưỡng HSMT: dòng HSMT có ngưỡng tiêu hao nhiên liệu (maxFuel / maxFuel75 / maxFuel50) hoặc số xi lanh (minCyl) mà Phân tích đọc ra còn code `suppliers/config-bot.mjs` (`hintsOf`, `powerMins` phần tiêu hao, `engineLists` / `engineMins`, `powerRead`) không đọc được. Hiện: maxFuel 238, maxFuel75 144, maxFuel50 98, minCyl 184. KHÔNG chạy lại Gợi ý / Phân tích cho gói cũ.

Đọc trước: `C:\Projects\GenSet Pro\genbid-work\dieu-phoi\nghiem-thu\soat-nguong-2.md` (đợt trước #844), `soat-nguong-sau.json` cùng thư mục (danh sách thiếu hiện tại).
Lệnh đo: `node suppliers\hints-audit.mjs --texts "C:\Projects\GenSet Pro\genbid-work\specs" --out <tệp>` (không tốn agent, không ghi web).

1. Worktree `C:\Projects\GenSet Pro\wt-soat-thieu` từ `origin/main` (CLAUDE.md của repo). Không đụng checkout chính `GenSet-Pro`.
2. Gom mục thiếu theo DẠNG dòng HSMT (nhãn, bố cục bảng, đơn vị), xếp theo số gói, mỗi dạng 2–3 dòng nguyên văn; bảng dạng → số gói vào tệp nghiệm thu.
3. Sửa code cho các dạng phổ biến, mỗi dạng thêm ca test dòng thật. AN TOÀN hơn độ phủ: đọc sai ngưỡng sẽ loại nhầm động cơ, tệ hơn bỏ trống. Dòng nhiều cỡ máy không gán được cỡ thì không đọc; ">N"/"≥N" không thành số chính xác.
4. Đo sau: thiếu từng loại; LỆCH không được tăng (hiện 9, đều lỗi Phân tích); soi tay ≥15 mục mới đọc được (ngẫu nhiên) với nguyên văn HSMT → sai phải 0. `node --test suppliers/` xanh, `quality --check` không xấu đi.
5. PR DRAFT, KHÔNG tự merge, không chép sang bot. Nghiệm thu `genbid-work\dieu-phoi\nghiem-thu\soat-nguong-3.md`: link PR, lệnh + đầu ra thật, trước/sau, dạng còn bỏ (vì sao), rủi ro + cách quay lui.

Tệp chung: phiên `noi-san-xuat` (`wt-noi-sx`, PR chưa merge) cũng sửa `config-bot.mjs` ở vùng `originOfHsmt`, `candidates`, `originChecks`, một dòng trong `hintsOf`: không sửa các vùng đó; rebase lên `origin/main` mới nhất trước khi báo.
Báo xong ≤5 dòng: link PR, thiếu trước → sau, lệch trước → sau, số sai khi soi tay.
