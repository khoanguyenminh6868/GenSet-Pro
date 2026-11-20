# So sánh top 30: GỐC vs NHÁNH (PR #978, datasheet bộ điều khiển)

- GỐC `c89a4e01f54329c4e1d1ceaf4cedde4c6fea09f1`, NHÁNH `e19777db4e0d50933dd119e872321b8efa047074`; chung bidhist tải lúc 2026-11-20T05:06:37.020Z.
- Số gói: 928; số lượt: GỐC 1093, NHÁNH 1093 (lỗi: 0 / 0). Lượt chỉ có ở một bên: 0 / 0.
- **Lượt top 30 giống hệt** (cùng khoá, cùng thứ tự, cùng điểm): 1093 / 1093. **Lượt khác**: 0.
- Đếm theo LƯỢT (một lượt = gói#chỉ số). Khoá dòng trong một lượt coi là duy nhất (khoá trùng trong `all` của một lượt: 4300).

## Lượt top 30 khác

## Dòng-lượt đổi điểm (trên toàn bộ danh sách `all` của mỗi lượt)
- Tổng dòng-lượt đổi điểm: **0** (đếm theo lần, mỗi lượt tính riêng); số khoá dòng khác nhau: **0**.
- Theo mức đổi: +40: 0; khác +40: 0.
- Chi tiết mức đổi: 

### Theo NCC (số dòng-lượt)

### Dòng đổi điểm KHÁC +40 hoặc chỉ có ở một bên (0 dòng-lượt)

## Ghi chú
- `gop-goc.json` và `gop-nhanh.json` GIỐNG HỆT từng byte (`cmp`), dù `suppliers/cn/{deif,woodward,datakom,sices}.json` khác nhau giữa hai commit (PR #978 đổi 4 tệp cn + thêm `suppliers/datasheets`, `suppliers/sources`).
- Nghĩa là: với bidhist này, không dòng nào trong `all` của 1093 lượt được +40 "bộ điều khiển có datasheet hãng" (hay đổi điểm bất kỳ), kể cả AGC150, SGC-420, DKG-309, DKG-116, easYgen-1800. Chưa tìm nguyên nhân (không sửa code theo yêu cầu); gợi ý kiểm tra: `factsFor(facts, "controller", model)` ở `config-bot.mjs:1540` với `facts` từ `B.modelFacts(cat, sups)` (`do-gop.mjs:61`) có nhận ra các model này từ cn mới không, và `offers` của dòng có `c.model` không.
- Khoá dòng trùng trong `all` của một lượt: 4300 lần; phép so dùng Map theo khoá nên tệp giống hệt từng byte mới là bằng chứng chính.
