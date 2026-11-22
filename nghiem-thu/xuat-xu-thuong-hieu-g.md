# Nhóm G: xuất xứ theo thương hiệu (22/11/2026)

Nhánh `fix/xuat-xu-thuong-hieu-g`, gốc đo `a903498c`. Không dựa vào mã nhóm A (#1093). Chưa merge.

## Luật
HSMT đòi "nhà sản xuất / nhãn hiệu" thuộc nhóm (G7, EU, G20): check xuất xứ đang chưa rõ / cần xác nhận thành đạt, ghi "nơi sản xuất cần CO", khi mọi hãng của `keptMakes` thuộc nhóm.
Giữ nguyên khi: chưa rõ hãng, model không có trong danh mục, chính dòng ghi nơi ngoài nhóm, check `unverified` / `conflict` / `version` / `parts`. HSMT đòi NƠI sản xuất vẫn cần CO. Check đạt / không đạt của agent không đổi.

## Vá theo phản biện điều phối (22/11/2026)
`rowPlacesOff`: dòng nguồn và dòng các NCC của cấu hình mà `placeInRow` / `placesInRow` báo nơi ngoài nhóm ("India <mã>", "<mã>(India)", "Perkins India", ô INDIA, sanq "UK/INDIA") thì KHÔNG đạt theo thương hiệu, giữ trạng thái, ghi nơi NCC ghi. Phần `chinaPlantInRow` thêm sau khi #1095 merge.

## Đo (bản vá, SHA 5a9937b2, gốc a5db53ca)
- check-all 17 lượt, bản chụp 21/11 (47 cấu hình): 6 cấu hình, 7 check, chỉ gói IB2600603983. 0 check đổi ở gói khác. Bản vá không chặn check nào trong 7 check này, vì dòng của chúng không ghi nơi ngoài nhóm.
- Thứ tự và danh sách cấu hình: 0 gói đổi. Chạy `check` hai lần giống nhau ở cả 17 lượt.
- Test `suppliers` 1.547 / 1.547. Không đổi `candidates`, `web/catalog.js`, nên không cần đo top 30.

## Đo lại khi chồng lên `nha-may-tq` (SHA dca34de1, gốc 5500c45b)
- `rowPlacesOff` thêm `chinaPlantInRow` và ô hai nơi "JAPAN OR CHINA", gọi hàm của nhánh đó, không chép regex. Baudouin ghi "Weichai Baudouin" / "潍柴博杜安" không bị chặn (Khoa 22/11/2026). Nhóm G20 của catalog không gồm Trung Quốc nên dòng CCEC ở gói G20 giữ chưa rõ.
- check-all 17 lượt: 7 cấu hình, 8 check đổi, chỉ IB2600603983. 7 check là danh sách dưới (chưa rõ → đạt). Check thứ 8 chỉ thêm ghi chú, trạng thái không đổi.
- Thứ tự và danh sách cấu hình: 0 gói đổi. Chạy `check` hai lần giống nhau ở cả 17 lượt. Test `suppliers` 1.560 / 1.560.

## Bản cuối (SHA 078f9f38, gốc 5500c45b)
Điều phối 22/11/2026: check đang "đạt" mà dòng của cấu hình bị `rowPlacesOff` báo nơi ngoài nhóm hoặc hai nơi về "cần xác nhận", ghi nguyên chữ NCC. HSMT đòi NƠI sản xuất mà `madeIn` đọc đúng một nơi ngoài nhóm thì vẫn "không đạt" như luật cũ.
- check-all 17 lượt: 7 cấu hình, 8 check, chỉ IB2600603983. 7 check chưa rõ → đạt (bảng dưới). Check thứ 8: S6R2-PTAA + S5L1D-H41 + DSE7320, Xuất xứ động cơ, **đạt → cần xác nhận** (fdk-energy ghi "Mitsubishi (SME Shanghai)").
- Thứ tự và danh sách cấu hình: 0 gói đổi. Chạy `check` hai lần giống nhau ở cả 17 lượt. Test `suppliers` 1.561 / 1.561.

## Danh sách đủ, đã soát tay từng hãng

| Cấu hình | Check | Trước → sau | Hãng (nước) | Soát nguồn |
|---|---|---|---|---|
| TWD1673GE + LSA 49.3 M8 + InteliLite 4 AMF8 | Xuất xứ động cơ | chưa rõ → đạt | Volvo Penta (Thụy Điển, EU) | 2 dòng, một hãng, không dòng nào ghi nơi SX |
| 6M31G825/5 + LSA 49.3 M8 + DSE7320 MKII | Xuất xứ động cơ | chưa rõ → đạt | Baudouin (Pháp) | 8 dòng, một hãng, không dòng nào ghi nơi SX |
| 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Xuất xứ động cơ | chưa rõ → đạt | Baudouin (Pháp) | như trên |
| 6M31G825/5 + LSA 49.3 M8 + DSE7420 | Xuất xứ bộ điều khiển | chưa rõ → đạt | Deep Sea (Anh) | 18 dòng, một hãng; mọi dòng có nơi đều là Anh |
| V20 TE2 + LSA 49.3 M8 + DSE7320 MKII | Xuất xứ động cơ | chưa rõ → đạt | FPT (Ý) | 2 dòng, một hãng, không dòng nào ghi nơi SX |
| 2806A-E18TTAG4 + LSA 49.3 M8 + DSE7320 | Xuất xứ động cơ | chưa rõ → đạt | Perkins (Anh) | 22 dòng, một hãng, không dòng nào ghi nơi SX |
| 6M33G8D3/5 + S5L1D-H41 + Deepsea 7320 | Xuất xứ động cơ | chưa rõ → đạt | Baudouin (Pháp) | 10 dòng, một hãng, không dòng nào ghi nơi SX |

Cả 6 model: không có xung đột hãng. Đạt ở đây chỉ là theo thương hiệu; nơi sản xuất vẫn phải có CO.
