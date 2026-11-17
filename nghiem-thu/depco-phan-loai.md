# Phân loại mâu thuẫn do depco-power (#806)

Sinh ngày 17/11/2026, chỉ đọc `GenSet-Pro` (main, `quality.mjs` chế độ đủ đơn vị). Số ghi `giá trị×số NCC`, dấu † = có depco-power trong nhóm đó.

## Tóm tắt

- `quality --check` có 711 model mâu thuẫn (cyl 138, disp 383, bore 136, compr 54). **335** model trong đó có depco-power ở ít nhất một phía và khác khi bỏ depco ra; **98** là model chỉ mâu thuẫn nhờ có depco (bỏ depco thì hết). Không tái hiện được con số 130 của #813: con số gần nhất là 98 (mới) / 201 (mới + depco lệch khỏi số đông).
- Loại 0 không do depco: **134**
- Loại 1 code đọc sai: **0**
- Loại 2 nguồn lệch: **160**
- Loại 3 khác (làm tròn): **41**
- Loại 2 áp luật số đông (≥3 NCC và ≥3× mỗi giá trị khác): 47 có giá trị thắng, 113 "chưa rõ".
- **Loại 1 = 0**: so chuỗi thô trong `specTables` của depco với giá trị chuẩn hoá cho từng dòng, không dòng nào lệch. 4006-23TAG3A: không có "6,8L"; bảng #705 (nguồn `2636.md` dòng 132, 138) ghi `Cylinder | 8L`, bảng #517 ghi 6. Code đọc đúng "8L"=8, nguồn gõ sai (mọi NCC khác = 6, ×25).

Loại: **0** depco cùng phía số đông, xung đột có từ trước hoặc do NCC khác; **1** code đọc sai; **2** nguồn depco lệch thật so với NCC khác (hoặc tự lệch giữa các bảng của depco); **3** khác (làm tròn dung tích ≤2%).

## Bảng (335 ca)

| Trường | Model | Giá trị các bên | Loại | Ghi chú / kết luận số đông | Trích nguồn depco (bảng #, nhãn=giá trị) |
|---|---|---|---|---|---|
| xi lanh | 12M26D902E200 | 12×14† / 8×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 141) | #141 Cylinder=12 |
| xi lanh | 12M26D968E200 | 12×15† / 8×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 139) | #139 Cylinder=12 |
| xi lanh | 12M33D1108E200 | 12×15† / 8×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 138) | #138 Cylinder=12 |
| xi lanh | 12M33G1320/6 | 12×3† / 16×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 448) | #448 Cylinder=12 |
| xi lanh | 12M33G1650/5 | 12×5† / 16×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 471) | #471 Cylinder=12 |
| xi lanh | 4006-23TAG3A | 6×26† / 8×1† | 2 nguồn lệch (mới) | số đông 6 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 517) | #517 Cylinder=6; #705 Cylinder=8L |
| xi lanh | 4016TAG1A | 12×1 / 16×24† | 0 không do depco | số đông 16 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 512) | #512 Cylinder=16 |
| xi lanh | 4016TAG2A | 12×1 / 16×24† | 0 không do depco | số đông 16 (gồm depco); suy từ dung tích/bore×stroke ≈ 16.0 xi lanh (bảng 511) | #511 Cylinder=16 |
| xi lanh | 403A-15G1 | 3×13 / 4×2† | 2 nguồn lệch | số đông 3 (depco lệch); suy từ dung tích/bore×stroke ≈ 3.0 xi lanh (bảng 713) | #713 Cylinder=4 |
| xi lanh | 403A-15G2 | 3×13 / 4×2† | 2 nguồn lệch | số đông 3 (depco lệch); suy từ dung tích/bore×stroke ≈ 3.0 xi lanh (bảng 712) | #712 Cylinder=4 |
| xi lanh | 403D-11G | 3×16 / 4×1† | 2 nguồn lệch (mới) | số đông 3 (depco lệch); suy từ dung tích/bore×stroke ≈ 2.9 xi lanh (bảng 510) | #510 Cylinder=4 |
| xi lanh | 403D-15G | 3×18 / 4×1† | 2 nguồn lệch (mới) | số đông 3 (depco lệch); suy từ dung tích/bore×stroke ≈ 3.0 xi lanh (bảng 509) | #509 Cylinder=4; #710 Cylinder=4 |
| xi lanh | 4BTA3.9-G2 | 4×22† / 6×1 | 0 không do depco | số đông 4 (gồm depco); suy từ dung tích/bore×stroke ≈ 4.0 xi lanh (bảng 66) | #66 Cylinder=4; #68 Cylinder=4; #549 Cylinder=4 |
| xi lanh | 6M33G660/6 | 6×5 / 12×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 454) | #454 Cylinder=12 |
| xi lanh | BF6M1013EC-G1 | 4×1† / 6×2† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 410) | #410 Cylinder=4; #442 Cylinder=6 |
| xi lanh | BF8M1015C-LA G1A | 8×10 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 429) | #429 Cylinder=6 |
| xi lanh | BF8M1015C-LA G2 | 8×9 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 428) | #428 Cylinder=6 |
| xi lanh | BF8M1015CP-LA G1A | 8×10† / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model; suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 400) | #400 Cylinder=8; #427 Cylinder=6 |
| xi lanh | BF8M1015CP-LA G2 | 8×10 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 426) | #426 Cylinder=6 |
| xi lanh | BF8M1015CP-LA G3 | 8×9 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 425) | #425 Cylinder=6 |
| xi lanh | BF8M1015CP-LA G4 | 8×10 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 424) | #424 Cylinder=6 |
| xi lanh | BF8M1015CP-LA G5 | 8×11 / 6×1† | 2 nguồn lệch (mới) | số đông 8 (depco lệch); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 423) | #423 Cylinder=6 |
| xi lanh | CA6DF2-17D | 6×2† / 4×1 | 2 nguồn lệch | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 395) | #395 Cylinder=6 |
| xi lanh | CA6DF2-18D | 4×1† / 6×1 | 2 nguồn lệch (mới) | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.5 xi lanh (bảng 370) | #370 Cylinder=4 |
| xi lanh | CA6DF2-19D | 6×2† / 4×1 | 2 nguồn lệch | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 394) | #394 Cylinder=6 |
| xi lanh | CA6DF2D-14D | 6×2† / 4×1 | 2 nguồn lệch | chưa rõ; suy từ dung tích/bore×stroke ≈ 5.5 xi lanh (bảng 396) | #396 Cylinder=6 |
| xi lanh | CA6DF2D-16D | 4×1† / 6×1 | 2 nguồn lệch (mới) | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.5 xi lanh (bảng 371) | #371 Cylinder=4 |
| xi lanh | CA6DL1-24D | 6×2† / 4×1 | 2 nguồn lệch | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 393) | #393 Cylinder=6 |
| xi lanh | CA6DL2-27D | 6×3† / 4×1 | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 392) | #392 Cylinder=6 |
| xi lanh | DP126LB | 6×5† / 8×1 | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.1 xi lanh (bảng 172) | #172 Cylinder=6; #252 Cylinder=6 |
| xi lanh | DP158LD | 8×13† / 6×1 | 0 không do depco | số đông 8 (gồm depco); suy từ dung tích/bore×stroke ≈ 8.0 xi lanh (bảng 168) | #168 Cylinder=8; #249 Cylinder=8 |
| xi lanh | KT38-G | 12×14† / 6×2 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 561) | #561 Cylinder=12 |
| xi lanh | KT38-GA | 12×8† / 6×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 557) | #557 Cylinder=12 |
| xi lanh | KTA38-G1 | 12×9† / 6×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 524) | #524 Cylinder=12 |
| xi lanh | KTA38-G2 | 12×26† / 6×2 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 523) | #523 Cylinder=12; #556 Cylinder=12 |
| xi lanh | KTA38-G2A | 12×28† / 6×1 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 522) | #522 Cylinder=12; #554 Cylinder=12 |
| xi lanh | KTA38-G2B | 12×27† / 6×2 | 0 không do depco | số đông 12 (gồm depco); suy từ dung tích/bore×stroke ≈ 12.0 xi lanh (bảng 555) | #555 Cylinder=12 |
| xi lanh | KTA50-G3 | 16×29† / 10×1 / 12×7 | 0 không do depco | số đông 16 (gồm depco); suy từ dung tích/bore×stroke ≈ 15.8 xi lanh (bảng 714) | #714 Cylinder=V16 |
| xi lanh | KTA50-G8 | 16×29† / 10×1 / 12×3 | 0 không do depco | số đông 16 (gồm depco); suy từ dung tích/bore×stroke ≈ 15.9 xi lanh (bảng 706) | #706 Cylinder=V16 |
| xi lanh | KTA50-GS8 | 16×29† / 12×1 | 0 không do depco | số đông 16 (gồm depco); suy từ dung tích/bore×stroke ≈ 15.8 xi lanh (bảng 708) | #708 Cylinder=V16 |
| xi lanh | P086TI | 4×1 / 6×2† | 2 nguồn lệch | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 178) | #178 Cylinder=6; #257 Cylinder=6 |
| xi lanh | P086TI-1 | 4×1 / 6×1† | 2 nguồn lệch (mới) | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 179) | #179 Cylinder=6; #258 Cylinder=6 |
| xi lanh | SC15G500D2 | 6×25† / 12×1 | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 281) | #281 Cylinder=6 |
| xi lanh | SC33W1150D2 | 12×2 / 6×21† | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 262) | #262 Cylinder=6 |
| xi lanh | SC33W990D2 | 12×3 / 6×23† | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 265) | #265 Cylinder=6 |
| xi lanh | WP10D200E201 | 6×4 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 93) | #93 Cylinder=4 |
| xi lanh | WP10D238E201 | 6×6 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 92) | #92 Cylinder=4 |
| xi lanh | WP10D264E201 | 4×1† / 6×5 | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 91) | #91 Cylinder=4 |
| xi lanh | WP10D288E201 | 4×1† / 6×3 | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 90) | #90 Cylinder=4 |
| xi lanh | WP12D317E201 | 4×1† / 6×1 | 2 nguồn lệch (mới) | chưa rõ; suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 89) | #89 Cylinder=4 |
| xi lanh | WP13D385E201 | 6×6 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 88) | #88 Cylinder=4 |
| xi lanh | WP13D440E310 | 6×7† / 9×1 | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 148) | #148 Cylinder=6 |
| xi lanh | WP13D490E310 | 6×8† / 9×1 | 0 không do depco | số đông 6 (gồm depco); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 147) | #147 Cylinder=6 |
| xi lanh | WP13D510E311 | 6×6 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 86) | #86 Cylinder=4; #87 Cylinder=4 |
| xi lanh | WP4.1D80E200 | 4×14† / 6×1 | 0 không do depco | số đông 4 (gồm depco); suy từ dung tích/bore×stroke ≈ 4.0 xi lanh (bảng 615) | #615 Cylinder=4 |
| xi lanh | WP6D132E201 | 6×7 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 96) | #96 Cylinder=4 |
| xi lanh | WP6D158E201 | 6×7 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 95) | #95 Cylinder=4 |
| xi lanh | WP6D180E201 | 6×6 / 4×1† | 2 nguồn lệch (mới) | số đông 6 (depco lệch); suy từ dung tích/bore×stroke ≈ 6.0 xi lanh (bảng 94) | #94 Cylinder=4 |
| xi lanh | YD480D | 4×9† / 3×1 | 0 không do depco | số đông 4 (gồm depco); suy từ dung tích/bore×stroke ≈ 4.0 xi lanh (bảng 633) | #633 Cylinder=4 |
| dung tích | 1103A-33G | 3.3×20† / 2.2×1† | 2 nguồn lệch (mới) | số đông 3.3 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #506 Displacement(L)=3.3; #685 Displacement(L)=2.216 |
| dung tích | 1104C-44TAG2 | 4.4×21† / 12.6×1 | 0 không do depco | số đông 4.4 (gồm depco) | #500 Displacement(L)=4.4 |
| dung tích | 1106A-70TAG2 | 7×20† / 6×1 | 0 không do depco | số đông 7 (gồm depco) | #498 Displacement(L)=7.01; #590 Displacement(L)=7.01; #591 Displacement(L)=7.01 |
| dung tích | 1106A-70TAG3 | 6×1 / 7×20† | 0 không do depco | số đông 7 (gồm depco) | #497 Displacement(L)=7.01 |
| dung tích | 1106A-70TG1 | 7×17† / 6.6×2 / 12.6×1 / 6×1 | 0 không do depco | số đông 7 (gồm depco) | #499 Displacement(L)=7.01; #593 Displacement(L)=7.01 |
| dung tích | 12M33D1108E200 | 39.2×9† / 31.8×2 | 0 không do depco | số đông 39.2 (gồm depco) | #138 Displacement(L)=39.2 |
| dung tích | 1506A-E88TAG2 | 8.8×7† / 8.7×1 | 3 khác (làm tròn) | số đông 8.8 (gồm depco); làm tròn (lệch 1.1%) | #496 Displacement(L)=8.8 |
| dung tích | 1506A-E88TAG3 | 8.8×10† / 8.7×1 | 3 khác (làm tròn) | số đông 8.8 (gồm depco); làm tròn (lệch 1.1%) | #495 Displacement(L)=8.8 |
| dung tích | 1506A-E88TAG5 | 8.8×14† / 7×1 | 0 không do depco | số đông 8.8 (gồm depco) | #494 Displacement(L)=8.8 |
| dung tích | 2206C-E13TAG2 | 12.5×15† / 51.4×1 / 13×1 | 0 không do depco | số đông 12.5 (gồm depco) | #69 Displacement(L)=12.5; #493 Displacement(L)=12.5; #584 Displacement(L)=12.5 |
| dung tích | 2206C-E13TAG3 | 12.5×14† / 13×1 | 0 không do depco | số đông 12.5 (gồm depco) | #492 Displacement(L)=12.5; #583 Displacement(L)=12.5 |
| dung tích | 2506C-E15TAG1 | 15×14† / 15.2×5 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 1.3%) | #582 Displacement(L)=15 |
| dung tích | 2506C-E15TAG2 | 15×13† / 15.2×6 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 1.3%) | #520 Displacement(L)=15 |
| dung tích | 2806C-E18TAG1A | 18×3 / 18.1×14† | 3 khác (làm tròn) | số đông 18.1 (gồm depco); làm tròn (lệch 0.6%) | #519 Displacement(L)=18.13 |
| dung tích | 4006-23TAG2A | 22.9×15† / 23×7 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.4%) | #518 Displacement(L)=22.921 |
| dung tích | 4006-23TAG3A | 22.9×16† / 23×6 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.4%) | #517 Displacement(L)=22.921; #705 Displacement(L)=22.92 |
| dung tích | 4008-30TAG3 | 30.6×3† / 30×1 / 30.5×2 | 2 nguồn lệch | chưa rõ | #516 Displacement(L)=30.561 |
| dung tích | 4008TAG1A | 30.6×11 / 22.9×1† / 30.5×4 / 30×1 | 2 nguồn lệch | chưa rõ | #704 Displacement(L)=22.92 |
| dung tích | 4012-46TAG2A | 45.8×20† / 458×1 / 46×2 | 0 không do depco | số đông 45.8 (gồm depco) | #514 Displacement(L)=45.842 |
| dung tích | 4012-46TAG3A | 45.8×19† / 46×2 | 3 khác (làm tròn) | số đông 45.8 (gồm depco); làm tròn (lệch 0.4%) | #513 Displacement(L)=45.842 |
| dung tích | 4012-46TWG2A | 45.8×19† / 458×1 / 46×2 | 0 không do depco | số đông 45.8 (gồm depco) | #515 Displacement(L)=45.842 |
| dung tích | 4016TAG1A | 61.1×15 / 45.8×2† / 61×2 | 2 nguồn lệch | số đông 61.1 (depco lệch) | #512 Displacement(L)=45.842 |
| dung tích | 4016TAG2A | 61.1×18† / 61×2 | 3 khác (làm tròn) | số đông 61.1 (gồm depco); làm tròn (lệch 0.2%) | #511 Displacement(L)=61.123 |
| dung tích | 403A-15G1 | 1.5×10† / 1.1×1 / 2.2×1 | 0 không do depco | số đông 1.5 (gồm depco) | #713 Displacement(L)=1.496 |
| dung tích | 403A-15G2 | 1.5×8† / 1.1×1 / 2.2×1 | 0 không do depco | số đông 1.5 (gồm depco) | #712 Displacement(L)=1.496 |
| dung tích | 403D-11G | 1.1×10† / 1.5×1 | 0 không do depco | số đông 1.1 (gồm depco) | #510 Displacement(L)=1.131 |
| dung tích | 403D-15G | 1.5×10† / 2.2×1 / 149×1 | 0 không do depco | số đông 1.5 (gồm depco) | #509 Displacement(L)=1.496; #710 Displacement(L)=1.496 |
| dung tích | 4B3.9-G2 | 3.9×17† / 4.5×1 | 0 không do depco | số đông 3.9 (gồm depco) | #552 Displacement(L)=3.9; #718 Displacement(L)=3.9 |
| dung tích | 4DW81-23D | 2.3×4† / 1.5×1 / 1.8×1 | 0 không do depco | số đông 2.3 (gồm depco) | #658 Displacement(L)=2.27 |
| dung tích | 4DW81-28D | 2.3×2† / 1.8×1 / 2.2×1 | 2 nguồn lệch | chưa rõ | #386 Displacement(L)=2.27; #387 Displacement(L)=2.27 |
| dung tích | 4M06G50/5 | 2.3×1† / 4.1×1 | 2 nguồn lệch (mới) | chưa rõ | #699 Displacement(L)=2.3 |
| dung tích | 4M06G55/5 | 2.3×1† / 4.1×1 | 2 nguồn lệch (mới) | chưa rõ | #698 Displacement(L)=2.3 |
| dung tích | 6BTA5.9-G2 | 5.9×21† / 8.3×1 | 0 không do depco | số đông 5.9 (gồm depco) | #545 Displacement(L)=5.9; #605 Displacement(L)=5.9; #606 Displacement(L)=5.9 |
| dung tích | 6BTAA5.9-G12 | 8.3×1 / 6.7×1 / 5.9×18† | 0 không do depco | số đông 5.9 (gồm depco) | #543 Displacement(L)=5.9; #603 Displacement(L)=5.9 |
| dung tích | 6BTAA5.9-G2 | 5.9×19† / 8.3×1 | 0 không do depco | số đông 5.9 (gồm depco) | #544 Displacement(L)=5.9; #604 Displacement(L)=5.9 |
| dung tích | 6CTA8.3-G2 | 8.3×21† / 8.9×1 / 13×1 / 5.9×1 | 0 không do depco | số đông 8.3 (gồm depco) | #541 Displacement(L)=8.3; #542 Displacement(L)=8.3; #602 Displacement(L)=8.3 |
| dung tích | 6CTAA8.3-G2 | 8.9×1 / 14×1 / 8.3×20† | 0 không do depco | số đông 8.3 (gồm depco) | #540 Displacement(L)=8.3; #601 Displacement(L)=8.3 |
| dung tích | 6DTAA8.9-G21 | 8.8×1† / 8.9×2 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.1%) | #222 Displacement(L)=8.82; #291 Displacement(L)=8.82 |
| dung tích | 6DTAA8.9-G23 | 8.8×1† / 8.9×2 / 9.7×1 | 2 nguồn lệch | chưa rõ | #220 Displacement(L)=8.82; #287 Displacement(L)=8.82 |
| dung tích | 6DTAA8.9-G24 | 8.8×1† / 8.9×2 / 9.7×1 | 2 nguồn lệch | chưa rõ | #221 Displacement(L)=8.82; #290 Displacement(L)=8.82 |
| dung tích | 6ETAA11.8-G21 | 11.8×2† / 11.6×1 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.7%) | #217 Displacement(L)=11.8; #283 Displacement(L)=11.8 |
| dung tích | 6ETAA11.8-G31 | 11.8×8† / 14.2×1† | 2 nguồn lệch (mới) | số đông 11.8 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #216 Displacement(L)=11.8; #279 Displacement(L)=11.8; #280 Displacement(L)=14.16 |
| dung tích | 6KTAA25-G31 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #263 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G310 | 25.2×6† / 25×2 | 3 khác (làm tròn) | số đông 25.2 (gồm depco); làm tròn (lệch 0.8%) | #271 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G311 | 25.2×5† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #206 Displacement(L)=25.18; #273 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G32 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #264 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G33 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #266 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G34 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #268 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G36 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #274 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G38 | 25.2×5† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #267 Displacement(L)=25.18 |
| dung tích | 6KTAA25-G39 | 25.2×4† / 25×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.8%) | #269 Displacement(L)=25.18 |
| dung tích | 6LTAA8.9-G2 | 8.9×21† / 14×1 / 8.3×3† | 2 nguồn lệch | số đông 8.9 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #539 Displacement(L)=8.3; #599 Displacement(L)=8.9 |
| dung tích | 6LTAA8.9-G3 | 8.9×17† / 9.9×1 | 0 không do depco | số đông 8.9 (gồm depco) | #538 Displacement(L)=8.9; #580 Displacement(L)=8.9; #598 Displacement(L)=8.9 |
| dung tích | 6LTAA9.5-G3 | 9.5×10 / 14×1† / 8.9×1 | 2 nguồn lệch | số đông 9.5 (depco lệch) | #581 Displacement(L)=14 |
| dung tích | 6M33D572E200 | 19.6×10† / 15.9×1 | 0 không do depco | số đông 19.6 (gồm depco) | #146 Displacement(L)=19.6 |
| dung tích | 6ZTAA13-G2 | 14×1 / 13×15† | 0 không do depco | số đông 13 (gồm depco) | #534 Displacement(L)=13; #569 Displacement(L)=13 |
| dung tích | 8M33G1000/5 | 31.8×1† / 26.1×1 | 2 nguồn lệch (mới) | chưa rõ | #476 Displacement(L)=31.8 |
| dung tích | 8M33G800/6 | 31.8×1† / 26.1×1 | 2 nguồn lệch (mới) | chưa rõ | #452 Displacement(L)=31.8 |
| dung tích | BF4M1013FC | 4.8×6† / 7.2×2 | 0 không do depco | số đông 4.8 (gồm depco) | #411 Displacement(L)=4.76; #443 Displacement(L)=4.76 |
| dung tích | BF4M2012 | 4×6† / 1×1 | 0 không do depco | số đông 4 (gồm depco) | #416 Displacement(L)=4.04; #667 Displacement(L)=4.04 |
| dung tích | BF6M1013EC-G1 | 7.2×1† / 7.1×1 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.4%) | #410 Displacement(L)=7.15; #442 Displacement(L)=7.15 |
| dung tích | BF6M1013EC-G2 | 7.2×1† / 7.1×1 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.4%) | #409 Displacement(L)=7.15; #441 Displacement(L)=7.15 |
| dung tích | BF6M1013FC-G2 | 7.2×3† / 7.1×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 1.4%) | #440 Displacement(L)=7.15 |
| dung tích | BF6M1013FC-G3 | 7.2×3† / 7.1×3 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 1.4%) | #408 Displacement(L)=7.15; #439 Displacement(L)=7.15 |
| dung tích | CA4DF2-12D | 3.9×1 / 4.8×1† | 2 nguồn lệch (mới) | chưa rõ | #650 Displacement(L)=4.75 |
| dung tích | CA6DF2D-14D | 6.5×1† / 6.6×1 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.5%) | #396 Displacement(L)=6.5 |
| dung tích | CA6DF2D-16D | 7.1×1† / 6.6×1 | 2 nguồn lệch (mới) | chưa rõ | #371 Displacement(L)=7.13 |
| dung tích | CA6DL1-24D | 7.1×1† / 7.7×1 | 2 nguồn lệch (mới) | chưa rõ | #393 Displacement(L)=7.13 |
| dung tích | CA6DL1-27D | 7.1×1† / 7.7×1 | 2 nguồn lệch (mới) | chưa rõ | #368 Displacement(L)=7.13 |
| dung tích | CA6DM2J-42D | 8.6×1† / 11×1 | 2 nguồn lệch (mới) | chưa rõ | #366 Displacement(L)=8.6 |
| dung tích | DP086LA | 8.1×4† / 8×1 | 3 khác (làm tròn) | số đông 8.1 (gồm depco); làm tròn (lệch 1.2%) | #177 Displacement(L)=8.074; #256 Displacement(L)=8.1 |
| dung tích | DP086TA | 8.1×3 / 9.1×1† | 2 nguồn lệch (mới) | số đông 8.1 (depco lệch) | #259 Displacement(L)=9.1 |
| dung tích | DP126LB | 11×3 / 11.1×2† / 14.6×1 | 2 nguồn lệch | chưa rõ | #172 Displacement(L)=11.051; #252 Displacement(L)=11.05 |
| dung tích | DP180LA | 18.2×1 / 18.3×5† | 3 khác (làm tròn) | số đông 18.3 (gồm depco); làm tròn (lệch 0.5%) | #167 Displacement(L)=18.273; #248 Displacement(L)=18.27 |
| dung tích | KT38-G | 18.9×2 / 37.8×6† / 38×2 | 0 không do depco | số đông 37.8 (gồm depco) | #561 Displacement(L)=37.8 |
| dung tích | KT38-GA | 38×3† / 19×1 / 37.8×1 | 0 không do depco | số đông 38 (gồm depco) | #557 Displacement(L)=38 |
| dung tích | KTA19-G2 | 13×1 / 19×3 / 14×2 / 18.9×6† / 14.5×1 | 2 nguồn lệch | chưa rõ | #533 Displacement(L)=18.9; #571 Displacement(L)=18.9 |
| dung tích | KTA19-G3 | 18.9×13† / 13×1 / 19×11† / 14×1 / 87×1 | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #530 Displacement(L)=19; #566 Displacement(L)=18.9 |
| dung tích | KTA19-G3A | 13×1 / 18.9×9 / 19×12† / 89×1 | 2 nguồn lệch | chưa rõ | #529 Displacement(L)=19; #565 Displacement(L)=19 |
| dung tích | KTA19-G4 | 18.9×8 / 13×2† / 19×8† | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #528 Displacement(L)=19; #564 Displacement(L)=13 |
| dung tích | KTA38-G1 | 38×4† / 37.8×4 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #524 Displacement(L)=38 |
| dung tích | KTA38-G2 | 37.8×11 / 18.9×1 / 38×9† | 2 nguồn lệch | chưa rõ | #523 Displacement(L)=38; #556 Displacement(L)=38 |
| dung tích | KTA38-G2A | 37.8×14 / 18.9×1 / 38×10† | 2 nguồn lệch | chưa rõ | #522 Displacement(L)=38; #554 Displacement(L)=38 |
| dung tích | KTA38-G2B | 37.8×10 / 38×10† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #555 Displacement(L)=38 |
| dung tích | KTA38-G4 | 38×3† / 37.8×6 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #521 Displacement(L)=38 |
| dung tích | KTA38-G5 | 37.8×13 / 38×9† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #553 Displacement(L)=38 |
| dung tích | KTA50-G15 | 50×4 / 50.3×2† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.6%) | #707 Displacement(L)=50.3 |
| dung tích | KTA50-G3 | 50.3×12 / 18.9×1 / 50×12† / 50.8×1 / 37.8×1 | 2 nguồn lệch | chưa rõ | #714 Displacement(L)=50 |
| dung tích | KTA50-G8 | 50.3×14† / 50×7 / 37.8×1 | 2 nguồn lệch | chưa rõ | #706 Displacement(L)=50.3 |
| dung tích | KTA50-GS8 | 50.3×11 / 37.8×2 / 50×10† | 2 nguồn lệch | chưa rõ | #708 Displacement(L)=50 |
| dung tích | KTAA19-G5 | 18.9×10 / 19×10† / 74×1 | 2 nguồn lệch | chưa rõ | #527 Displacement(L)=19; #563 Displacement(L)=19 |
| dung tích | KTAA19-G6 | 18.9×8 / 19×6† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #562 Displacement(L)=19 |
| dung tích | KTAA19-G6A | 18.9×12 / 19×11† / 74×1 | 2 nguồn lệch | chưa rõ | #526 Displacement(L)=19; #560 Displacement(L)=19 |
| dung tích | KTAA19-G7 | 18.9×4† / 19×2 | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #559 Displacement(L)=18.9 |
| dung tích | LR4B5-D | 4.7×1 / 5×2† | 2 nguồn lệch | chưa rõ | #120 Displacement(L)=4.95; #612 Displacement(L)=4.95 |
| dung tích | LR4N5LP-D | 4.8×1 / 5.3×1† | 2 nguồn lệch (mới) | chưa rõ | #115 Displacement(L)=5.32 |
| dung tích | LR6B3L-D | 6.9×2† / 6.5×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #113 Displacement(L)=6.49; #132 Displacement(L)=6.87 |
| dung tích | LR6M3L-D | 7.1×2† / 6.9×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #112 Displacement(L)=7.13; #131 Displacement(L)=6.87 |
| dung tích | MTA11-G2 | 10.8×4† / 13×1 | 0 không do depco | số đông 10.8 (gồm depco) | #597 Displacement(L)=10.8 |
| dung tích | NT855-GA | 10.8×1 / 14×15† | 0 không do depco | số đông 14 (gồm depco) | #596 Displacement(L)=14 |
| dung tích | NTA855-G1 | 13×1 / 14×8† | 0 không do depco | số đông 14 (gồm depco) | #537 Displacement(L)=14; #595 Displacement(L)=14 |
| dung tích | NTA855-G1A | 13×1 / 14×15† / 10.8×1 | 0 không do depco | số đông 14 (gồm depco) | #577 Displacement(L)=14; #579 Displacement(L)=14 |
| dung tích | NTA855-G1B | 13×1 / 14×17† / 10.8×1 | 0 không do depco | số đông 14 (gồm depco) | #576 Displacement(L)=14 |
| dung tích | NTA855-G2A | 13×1 / 14×18† | 0 không do depco | số đông 14 (gồm depco) | #574 Displacement(L)=14 |
| dung tích | NTA855-G3 | 13×1 / 14×7† | 0 không do depco | số đông 14 (gồm depco) | #536 Displacement(L)=14 |
| dung tích | NTA855-G4 | 13×1 / 14×14† | 0 không do depco | số đông 14 (gồm depco) | #573 Displacement(L)=14 |
| dung tích | NTAA855-G7 | 13×1 / 14×17† | 0 không do depco | số đông 14 (gồm depco) | #570 Displacement(L)=14 |
| dung tích | NTAA855-G7A | 13×1 / 14×17† / 18.9×2 | 0 không do depco | số đông 14 (gồm depco) | #568 Displacement(L)=14 |
| dung tích | QSK19-G4 | 19×4 / 18.9×4† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 0.5%) | #558 Displacement(L)=18.9 |
| dung tích | QSZ13-G3 | 13×16† / 14×1 / 19.6×1 | 0 không do depco | số đông 13 (gồm depco) | #531 Displacement(L)=13 |
| dung tích | S12A2-PTA | 12×2 / 33.9×2† / 24.5×1 / 18.6×1 | 2 nguồn lệch | chưa rõ | #190 Displacement(L)=33.93; #318 Displacement(L)=33.93 |
| dung tích | S12A2-PTA2 | 12×2 / 33.9×1† | 2 nguồn lệch (mới) | chưa rõ | #189 Displacement(L)=33.93; #316 Displacement(L)=33.93 |
| dung tích | S12H-PTA | 12×2 / 33.9×1† / 37.1×2† / 24.5×1 / 49×1 | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #188 Displacement(L)=33.93; #315 Displacement(L)=37.11 |
| dung tích | S12R-PTA | 12×2 / 49×2† / 30×1 | 2 nguồn lệch | chưa rõ | #187 Displacement(L)=49.03; #314 Displacement(L)=49.03 |
| dung tích | S12R-PTA2 | 12×2 / 49×2† / 30×1 | 2 nguồn lệch | chưa rõ | #186 Displacement(L)=49.03; #313 Displacement(L)=49.03 |
| dung tích | S12R-PTAA2 | 12×2 / 49×2† / 33.9×1 | 2 nguồn lệch | chưa rõ | #185 Displacement(L)=49.03; #312 Displacement(L)=49.03 |
| dung tích | S16R-PTA | 16×2 / 65.4×2† / 37.1×1 | 2 nguồn lệch | chưa rõ | #184 Displacement(L)=65.37; #311 Displacement(L)=65.37 |
| dung tích | S16R-PTA2 | 16×2 / 65.4×2† / 49×1 | 2 nguồn lệch | chưa rõ | #183 Displacement(L)=65.37; #310 Displacement(L)=65.37 |
| dung tích | S16R-PTAA2 | 16×2 / 65.4×2† / 49×1 | 2 nguồn lệch | chưa rõ | #182 Displacement(L)=65.37; #309 Displacement(L)=65.37 |
| dung tích | S16R2-PTAW | 16×2 / 79.9×2† / 49×1 | 2 nguồn lệch | chưa rõ | #308 Displacement(L)=79.9 |
| dung tích | S16R2-PTAW-E | 16×2 / 79.9×1† | 2 nguồn lệch (mới) | chưa rõ | #307 Displacement(L)=79.9 |
| dung tích | S6A3-PTA | 18.6×2† / 14.6×1 | 2 nguồn lệch | chưa rõ | #192 Displacement(L)=18.56; #193 Displacement(L)=18.56; #323 Displacement(L)=18.56 |
| dung tích | S6R-PTA | 6×2 / 30×1† / 24.5×2† / 18.6×1 | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #191 Displacement(L)=29.96; #321 Displacement(L)=24.5 |
| dung tích | S6R2-PTA | 6×2 / 30×2† / 14.6×1 | 2 nguồn lệch | chưa rõ | #320 Displacement(L)=29.96 |
| dung tích | S6R2-PTAA | 6×2 / 30×1† / 18.6×1 | 2 nguồn lệch | chưa rõ | #319 Displacement(L)=29.96 |
| dung tích | SC10E380D2 | 8.8×1 / 11.8×1† / 10.4×2 | 2 nguồn lệch | chưa rõ | #286 Displacement(L)=11.8 |
| dung tích | SC12E460D2 | 12.9×3 / 11.8×14† | 0 không do depco | số đông 11.8 (gồm depco) | #282 Displacement(L)=11.8; #284 Displacement(L)=11.8 |
| dung tích | SC13G420D2 | 12.9×15† / 12.8×1 | 3 khác (làm tròn) | số đông 12.9 (gồm depco); làm tròn (lệch 0.8%) | #285 Displacement(L)=12.88 |
| dung tích | SC25G690D2 | 25.8×16† / 16.8×1 | 0 không do depco | số đông 25.8 (gồm depco) | #275 Displacement(L)=25.8 |
| dung tích | SC27G755D2 | 25.8×4 / 26.6×14† | 0 không do depco | số đông 26.6 (gồm depco) | #272 Displacement(L)=26.6 |
| dung tích | SC27G830D2 | 26.6×15† / 25.8×2 | 0 không do depco | số đông 26.6 (gồm depco) | #270 Displacement(L)=26.6 |
| dung tích | SC7H205D2 | 6.5×3 / 6.4×2† | 3 khác (làm tròn) | chưa rõ; làm tròn (lệch 1.6%) | #294 Displacement(L)=6.44 |
| dung tích | SC7H220D2 | 6.4×1† / 6.5×2 | 3 khác (làm tròn) (mới) | chưa rõ; làm tròn (lệch 1.6%) | #296 Displacement(L)=6.44 |
| dung tích | SC7H230D2 | 6.5×14 / 6.4×1† | 3 khác (làm tròn) (mới) | số đông 6.5 (depco lệch); làm tròn (lệch 1.6%) | #295 Displacement(L)=6.44; #297 Displacement(L)=6.44 |
| dung tích | SC7H250D2 | 6.5×16 / 6.4×1† | 3 khác (làm tròn) (mới) | số đông 6.5 (depco lệch); làm tròn (lệch 1.6%) | #293 Displacement(L)=6.44 |
| dung tích | SC9D310D2 | 8.8×15† / 8.9×2 | 3 khác (làm tròn) | số đông 8.8 (gồm depco); làm tròn (lệch 1.1%) | #289 Displacement(L)=8.82 |
| dung tích | TCD8.0 | 7.8×2† / 11.9×1 | 2 nguồn lệch | chưa rõ | #437 Displacement(L)=7.8 |
| dung tích | WP10D200E200 | 9.7×12† / 6.8×1 / 6.3×1 | 0 không do depco | số đông 9.7 (gồm depco) | #155 Displacement(L)=9.726 |
| dung tích | WP10D238E200 | 9.7×14† / 6.3×1 | 0 không do depco | số đông 9.7 (gồm depco) | #154 Displacement(L)=9.726 |
| dung tích | WP10D264E200 | 9.7×11† / 6.3×1 | 0 không do depco | số đông 9.7 (gồm depco) | #153 Displacement(L)=9.726 |
| dung tích | WP10D320E200 | 9.7×9† / 12.5×1 | 0 không do depco | số đông 9.7 (gồm depco) | #152 Displacement(L)=9.726 |
| dung tích | WP12D317E200 | 11.6×6 / 9.7×1† / 6.3×1 | 2 nguồn lệch | số đông 11.6 (depco lệch) | #151 Displacement(L)=9.726 |
| dung tích | WP13D385E200 | 12.5×14† / 6.3×1 | 0 không do depco | số đông 12.5 (gồm depco) | #150 Displacement(L)=12.54 |
| dung tích | WP13D510E311 | 15.9×1 / 12.5×3† | 0 không do depco | số đông 12.5 (gồm depco) | #86 Displacement(L)=12.54; #87 Displacement(L)=12.54 |
| dung tích | WP2.3D25E200 | 2.3×7† / 2.5×1 | 0 không do depco | số đông 2.3 (gồm depco) | #620 Displacement(L)=2.3 |
| dung tích | WP2.3D33E200 | 2.3×8† / 2.5×1 | 0 không do depco | số đông 2.3 (gồm depco) | #619 Displacement(L)=2.3 |
| dung tích | WP2.3D40E200 | 2.3×7† / 2.5×1 | 0 không do depco | số đông 2.3 (gồm depco) | #618 Displacement(L)=2.3 |
| dung tích | WP2.3D48E200 | 2.3×6† / 3.1×1 / 2.5×1 | 0 không do depco | số đông 2.3 (gồm depco) | #617 Displacement(L)=2.3 |
| dung tích | WP4.1D100E200 | 4.1×4† / 6.8×1 / 4.5×2 | 2 nguồn lệch | chưa rõ | #159 Displacement(L)=4.087 |
| dung tích | WP4.1D66E200 | 4.1×7† / 4.8×1 / 4.5×1 | 0 không do depco | số đông 4.1 (gồm depco) | #616 Displacement(L)=4.087 |
| dung tích | WP4.1D80E200 | 4.1×7† / 4.8×1 / 4.5×1 | 0 không do depco | số đông 4.1 (gồm depco) | #615 Displacement(L)=4.087 |
| dung tích | WP6D132E200 | 6.8×10† / 4.5×1 / 6.3×1 | 0 không do depco | số đông 6.8 (gồm depco) | #158 Displacement(L)=6.75 |
| dung tích | WP6D132E201 | 6.8×4† / 6.3×1 | 0 không do depco | số đông 6.8 (gồm depco) | #96 Displacement(L)=6.75 |
| dung tích | WP6D152E200 | 6.8×11† / 6.3×1 | 0 không do depco | số đông 6.8 (gồm depco) | #157 Displacement(L)=6.75 |
| dung tích | WP6D158E201 | 6.8×4† / 6.3×1 | 0 không do depco | số đông 6.8 (gồm depco) | #95 Displacement(L)=6.75 |
| dung tích | WP6D180E201 | 6.8×3† / 6.3×1 | 0 không do depco | số đông 6.8 (gồm depco) | #94 Displacement(L)=6.75 |
| dung tích | Y4100D | 3.7×4† / 2.5×1 | 0 không do depco | số đông 3.7 (gồm depco) | #628 Displacement(L)=3.707 |
| dung tích | Y4102ZD | 3.9×3† / 4.1×1 | 0 không do depco | số đông 3.9 (gồm depco) | #625 Displacement(L)=3.875 |
| dung tích | Y4102ZLD | 3.9×3† / 4.1×1 | 0 không do depco | số đông 3.9 (gồm depco) | #624 Displacement(L)=3.875 |
| dung tích | Y4105ZLD | 4.1×4† / 3.9×1 | 0 không do depco | số đông 4.1 (gồm depco) | #623 Displacement(L)=4.1 |
| dung tích | Y4110ZLD | 4.5×1† / 4.3×1 / 4.1×1 / 4.4×1 | 2 nguồn lệch | chưa rõ | #621 Displacement(L)=4.484 |
| dung tích | YD380D | 1.4×5† / 1.5×1 | 0 không do depco | số đông 1.4 (gồm depco) | #635 Displacement(L)=1.357 |
| dung tích | YD480D | 1.8×5† / 1.5×1 | 0 không do depco | số đông 1.8 (gồm depco) | #633 Displacement(L)=1.809 |
| dung tích | YD4EZLD | 4.1×4† / 3.9×1 | 0 không do depco | số đông 4.1 (gồm depco) | #622 Displacement(L)=4.1 |
| dung tích | YM6H4L-D | 8.8×2† / 11.6×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #111 Displacement(L)=8.822; #130 Displacement(L)=11.596 |
| dung tích | YM6S9L-D | 12.6×1 / 11.6×1† | 2 nguồn lệch (mới) | chưa rõ | #107 Displacement(L)=11.596; #126 Displacement(L)=11.596 |
| dung tích | YM6S9L-DB | 12.6×1 / 11.6×1† | 2 nguồn lệch (mới) | chưa rõ | #106 Displacement(L)=11.596; #125 Displacement(L)=11.596 |
| dung tích | YM6S9LF-D | 12.6×1 / 11.6×1† | 2 nguồn lệch (mới) | chưa rõ | #105 Displacement(L)=11.596; #124 Displacement(L)=11.596 |
| dung tích | YM6S9LF-DA | 12.6×1 / 11.6×1† | 2 nguồn lệch (mới) | chưa rõ | #104 Displacement(L)=11.596; #123 Displacement(L)=11.596 |
| dung tích | YT3B2-D | 3.3×2† / 3.1×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #122 Displacement(L)=3.3; #614 Displacement(L)=3.12 |
| bore×stroke | 1103A-33G | 105x127×12† / 105x128×1 | 0 không do depco | số đông 105x127 (gồm depco) | #506 Bore and Stroke(mm)=105 X 127; #685 Bore and Stroke(mm)=105 X 127 |
| bore×stroke | 1104C-44TAG1 | 105x127×3† / 100x127×3 | 2 nguồn lệch | chưa rõ | #502 Bore and Stroke(mm)=105 X 127 |
| bore×stroke | 1104C-44TAG2 | 105x127×10† / 100x127×2 | 0 không do depco | số đông 105x127 (gồm depco) | #500 Bore and Stroke(mm)=105 X 127 |
| bore×stroke | 1106A-70TG1 | 105x135×9† / 100x127×1 / 100x120×2 | 0 không do depco | số đông 105x135 (gồm depco) | #499 Bore and Stroke(mm)=105 X 135; #593 Bore and Stroke(mm)=105 X 135 |
| bore×stroke | 403A-15G1 | 84x90×5† / 77x81×1 | 0 không do depco | số đông 84x90 (gồm depco) | #713 Bore and Stroke(mm)=84 X 90 |
| bore×stroke | 403A-15G2 | 84x90×6† / 77x81×1 | 0 không do depco | số đông 84x90 (gồm depco) | #712 Bore and Stroke(mm)=84 X 90 |
| bore×stroke | 403D-15G | 84x90×9† / 74x100×1 | 0 không do depco | số đông 84x90 (gồm depco) | #509 Bore and Stroke(mm)=84 X 90; #710 Bore and Stroke(mm)=84 X 90 |
| bore×stroke | 404D-22G | 84x100×11† / 74x100×1 | 0 không do depco | số đông 84x100 (gồm depco) | #508 Bore and Stroke(mm)=84 X 100; #709 Bore and Stroke(mm)=84 X 100 |
| bore×stroke | 4DW81-23D | 85x100×3† / 85x90×1 / 80x90×1 | 0 không do depco | số đông 85x100 (gồm depco) | #658 Bore and Stroke(mm)=85 X 100 |
| bore×stroke | 4DW81-28D | 85x100×1† / 80x90×1 / 85x95×1 | 2 nguồn lệch (mới) | chưa rõ | #386 Bore and Stroke(mm)=85 X 100; #387 Bore and Stroke(mm)=85 X 100 |
| bore×stroke | 6CTA8.3-G2 | 114x135×9† / 102x120×1 | 0 không do depco | số đông 114x135 (gồm depco) | #541 Bore and Stroke(mm)=114 X 135; #542 Bore and Stroke(mm)=114 X 135; #602 Bore and Stroke(mm)=114 X 135 |
| bore×stroke | 6DTAA8.9-G23 | 114x144×2† / 126x130×1 | 2 nguồn lệch (mới) | chưa rõ | #220 Bore and Stroke(mm)=114 X 144; #287 Bore and Stroke(mm)=114 X 144 |
| bore×stroke | 6DTAA8.9-G24 | 114x144×2† / 126x130×1 | 2 nguồn lệch (mới) | chưa rõ | #221 Bore and Stroke(mm)=114 X 144; #290 Bore and Stroke(mm)=114 X 144 |
| bore×stroke | 6ETAA11.8-G21 | 128x153×2† / 126x155×1 | 2 nguồn lệch (mới) | chưa rõ | #217 Bore and Stroke(mm)=128 X 153; #283 Bore and Stroke(mm)=128 X 153 |
| bore×stroke | 6ETAA11.8-G31 | 128x153×3† / 135x165×1† | 2 nguồn lệch (mới) | số đông 128x153 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #216 Bore and Stroke(mm)=128 X 153; #279 Bore and Stroke(mm)=128 X 153; #280 Bore and Stroke(mm)=135 X 165 |
| bore×stroke | 6LTAA8.9-G2 | 114x145×9† / 114x135×4† | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #539 Bore and Stroke(mm)=114 X 135; #599 Bore and Stroke(mm)=114 X 145 |
| bore×stroke | 6LTAA8.9-G3 | 114x145×7† / 140x152×1 | 0 không do depco | số đông 114x145 (gồm depco) | #538 Bore and Stroke(mm)=114 X 145; #580 Bore and Stroke(mm)=114 X 145; #598 Bore and Stroke(mm)=114 X 145 |
| bore×stroke | 6LTAA9.5-G1 | 140x152×1† / 114x145×2 / 116x148×3 / 117x148×2 | 2 nguồn lệch | chưa rõ | #578 Bore and Stroke(mm)=140 X 152 |
| bore×stroke | 6LTAA9.5-G3 | 117x148×2 / 140x152×2† / 114x145×1 / 116x148×2 | 2 nguồn lệch | chưa rõ | #581 Bore and Stroke(mm)=140 X 152 |
| bore×stroke | 6M33D572E200 | 127x165×1† / 150x185×6 | 2 nguồn lệch (mới) | số đông 150x185 (depco lệch) | #146 Bore and Stroke(mm)=127 X 165 |
| bore×stroke | 8M33G1000/5 | 150x150×1† / 150x185×2 | 2 nguồn lệch (mới) | chưa rõ | #476 Bore and Stroke(mm)=150 X 150 |
| bore×stroke | 8M33G800/6 | 150x150×1† / 150x185×2 | 2 nguồn lệch (mới) | chưa rõ | #452 Bore and Stroke(mm)=150 X 150 |
| bore×stroke | BF4M2012 | 98x105×1† / 101x126×3† | 2 nguồn lệch (mới) | số đông 101x126 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #416 Bore and Stroke(mm)=98 X 105; #667 Bore and Stroke(mm)=101 X 126 |
| bore×stroke | BF6M1015C-LA G1A | 110x136×1† / 132x145×2 | 2 nguồn lệch (mới) | chưa rõ | #436 Bore and Stroke(mm)=110 X 136 |
| bore×stroke | CA4DF2-12D | 102x118×1 / 110x125×1† | 2 nguồn lệch (mới) | chưa rõ | #650 Bore and Stroke(mm)=110 X 125 |
| bore×stroke | DP126LB | 123x155×3† / 128x142×2† | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #172 Bore and Stroke(mm)=128 X 142; #252 Bore and Stroke(mm)=123 X 155 |
| bore×stroke | KTA19-G2 | 159x159×4† / 135x169×1 / 140x152×1 | 0 không do depco | số đông 159x159 (gồm depco) | #533 Bore and Stroke(mm)=159 X 159; #571 Bore and Stroke(mm)=159 X 159 |
| bore×stroke | KTA19-G3 | 159x159×11† / 159x153×1† | 2 nguồn lệch (mới) | số đông 159x159 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #530 Bore and Stroke(mm)=159 X 159; #566 Bore and Stroke(mm)=159 X 153 |
| bore×stroke | KTA19-G4 | 159x159×6† / 130x163×1† | 2 nguồn lệch (mới) | số đông 159x159 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #528 Bore and Stroke(mm)=159 X 159; #564 Bore and Stroke(mm)=130 X 163 |
| bore×stroke | KTA50-G8 | 108x130×1 / 159x159×7† | 0 không do depco | số đông 159x159 (gồm depco) | #706 Bore and Stroke(mm)=159 X 159 |
| bore×stroke | LR4B3Z-D | 110x125×1 / 108x120×1† / 108x125×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #118 Bore and Stroke(mm)=108 X 120; #610 Bore and Stroke(mm)=108 X 125 |
| bore×stroke | LR4B5-D | 108x135×2† / 105x120×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #120 Bore and Stroke(mm)=105 X 120; #612 Bore and Stroke(mm)=108 X 135 |
| bore×stroke | LR4N5LP-D | 110x125×1 / 112x135×1† | 2 nguồn lệch (mới) | chưa rõ | #115 Bore and Stroke(mm)=112 X 135 |
| bore×stroke | LR6A3L-D | 105x125×2† / 110x125×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #114 Bore and Stroke(mm)=105 X 125; #133 Bore and Stroke(mm)=110 X 125 |
| bore×stroke | LR6B3L-D | 108x125×1 / 105x125×1† / 110x125×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #113 Bore and Stroke(mm)=105 X 125; #132 Bore and Stroke(mm)=110 X 125 |
| bore×stroke | NTA855-G1A | 140x152×6† / 125x147×1 | 0 không do depco | số đông 140x152 (gồm depco) | #577 Bore and Stroke(mm)=140 X 152; #579 Bore and Stroke(mm)=140 X 152 |
| bore×stroke | NTA855-G1B | 140x152×7† / 125x147×1 | 0 không do depco | số đông 140x152 (gồm depco) | #576 Bore and Stroke(mm)=140 X 152 |
| bore×stroke | NTAA855-G7A | 140x152×5† / 159x159×1 | 0 không do depco | số đông 140x152 (gồm depco) | #568 Bore and Stroke(mm)=140 X 152 |
| bore×stroke | S12A2-PTA | 150x160×2† / 156x160×1 | 2 nguồn lệch | chưa rõ | #190 Bore and Stroke(mm)=150 X 160; #318 Bore and Stroke(mm)=150 X 160 |
| bore×stroke | S12H-PTA | 150x160×1† / 150x175×2† / 156x175×1 | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #188 Bore and Stroke(mm)=150 X 160; #315 Bore and Stroke(mm)=150 X 175 |
| bore×stroke | S6R-PTA | 170x220×1† / 170x180×2† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #191 Bore and Stroke(mm)=170 X 220; #321 Bore and Stroke(mm)=170 X 180 |
| bore×stroke | SC13G420D2 | 135x150×9† / 128x153×1 / 135x165×1 | 0 không do depco | số đông 135x150 (gồm depco) | #285 Bore and Stroke(mm)=135 X 150 |
| bore×stroke | SC15G500D2 | 135x165×10† / 135x150×2 | 0 không do depco | số đông 135x165 (gồm depco) | #281 Bore and Stroke(mm)=135 X 165 |
| bore×stroke | SC25G610D2 | 135x150×11† / 135x155×1 | 0 không do depco | số đông 135x150 (gồm depco) | #277 Bore and Stroke(mm)=135 X 150 |
| bore×stroke | SC25G690D2 | 135x150×10† / 135x155×1 | 0 không do depco | số đông 135x150 (gồm depco) | #275 Bore and Stroke(mm)=135 X 150 |
| bore×stroke | SC27G755D2 | 135x150×1† / 135x155×11 | 2 nguồn lệch (mới) | số đông 135x155 (depco lệch) | #272 Bore and Stroke(mm)=135 X 150 |
| bore×stroke | SC4H180D2 | 105x124×11† / 135x150×2 | 0 không do depco | số đông 105x124 (gồm depco) | #301 Bore and Stroke(mm)=105 X 124; #302 Bore and Stroke(mm)=105 X 124 |
| bore×stroke | SC4H95D2 | 105x124×11† / 135x140×1 | 0 không do depco | số đông 105x124 (gồm depco) | #649 Bore and Stroke(mm)=105 X 124 |
| bore×stroke | SC7H250D2 | 105x124×10† / 114x135×1 | 0 không do depco | số đông 105x124 (gồm depco) | #293 Bore and Stroke(mm)=105 X 124 |
| bore×stroke | WP10D320E200 | 126x130×9† / 127x165×1 | 0 không do depco | số đông 126x130 (gồm depco) | #152 Bore and Stroke(mm)=126 X 130 |
| bore×stroke | WP12D317E200 | 126x130×2† / 126x155×3 / 125x155×1 | 2 nguồn lệch | chưa rõ | #151 Bore and Stroke(mm)=126 X 130 |
| bore×stroke | WP12D317E201 | 126x155×1† / 125x155×1 | 2 nguồn lệch (mới) | chưa rõ | #89 Bore and Stroke(mm)=126 X 155 |
| bore×stroke | WP13D385E200 | 127x165×8† / 126x155×1 | 0 không do depco | số đông 127x165 (gồm depco) | #150 Bore and Stroke(mm)=127 X 165 |
| bore×stroke | WP2.3D25E200 | 89x92×6† / 90x100×2 | 0 không do depco | số đông 89x92 (gồm depco) | #620 Bore and Stroke(mm)=89 X 92 |
| bore×stroke | WP2.3D33E200 | 89x92×9† / 102x118×1 | 0 không do depco | số đông 89x92 (gồm depco) | #619 Bore and Stroke(mm)=89 X 92 |
| bore×stroke | WP2.3D40E200 | 89x92×6† / 105x125×1 | 0 không do depco | số đông 89x92 (gồm depco) | #618 Bore and Stroke(mm)=89 X 92 |
| bore×stroke | WP2.3D48E200 | 89x92×8† / 105x125×1 | 0 không do depco | số đông 89x92 (gồm depco) | #617 Bore and Stroke(mm)=89 X 92 |
| bore×stroke | WP4.1D100E200 | 105x118×4† / 105x130×2 | 2 nguồn lệch | chưa rõ | #159 Bore and Stroke(mm)=105 X 118 |
| bore×stroke | WP4.1D66E200 | 105x118×10† / 105x130×1 | 0 không do depco | số đông 105x118 (gồm depco) | #616 Bore and Stroke(mm)=105 X 118 |
| bore×stroke | WP4.1D80E200 | 105x118×8† / 105x130×1 | 0 không do depco | số đông 105x118 (gồm depco) | #615 Bore and Stroke(mm)=105 X 118 |
| bore×stroke | WP6D167E200 | 105x130×6† / 126x130×1 | 0 không do depco | số đông 105x130 (gồm depco) | #156 Bore and Stroke(mm)=105 X 130 |
| bore×stroke | Y4100D | 100x118×1† / 90x100×1 | 2 nguồn lệch (mới) | chưa rõ | #628 Bore and Stroke(mm)=100 X 118 |
| bore×stroke | Y4105ZLD | 105x118×2† / 102x118×1 | 2 nguồn lệch | chưa rõ | #623 Bore and Stroke(mm)=105 X 118 |
| bore×stroke | YD380D | 80x90×3† / 85x90×1 | 0 không do depco | số đông 80x90 (gồm depco) | #635 Bore and Stroke(mm)=80 X 90 |
| bore×stroke | YD480D | 80x90×3† / 85x90×1 | 0 không do depco | số đông 80x90 (gồm depco) | #633 Bore and Stroke(mm)=80 X 90 |
| bore×stroke | YD4EZLD | 105x118×1† / 102x118×1 | 2 nguồn lệch (mới) | chưa rõ | #622 Bore and Stroke(mm)=105 X 118 |
| bore×stroke | YM6H4L-D | 120x130×2† / 126x130×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #111 Bore and Stroke(mm)=120 X 130; #130 Bore and Stroke(mm)=126 X 130 |
| bore×stroke | YT3A2Z-D | 105x120×2† / 108x120×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #121 Bore and Stroke(mm)=105 X 120; #613 Bore and Stroke(mm)=108 X 120 |
| tỉ số nén | 1104C-44TAG2 | 18.2×5† / 18.3×1 | 0 không do depco | số đông 18.2 (gồm depco) | #500 Compression ratio=18.23:1 |
| tỉ số nén | 1106A-70TAG2 | 16×4† / 18.2×1† / 6×1 / 17×1 | 2 nguồn lệch | số đông 16 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #498 Compression ratio=16.0:1; #590 Compression ratio=18.2:1; #591 Compression ratio=18.2:1 |
| tỉ số nén | 1106A-70TAG3 | 16.5×1† / 16×4 | 2 nguồn lệch (mới) | số đông 16 (depco lệch) | #497 Compression ratio=16.5:1 |
| tỉ số nén | 1106A-70TG1 | 18.2×4† / 17×1 | 0 không do depco | số đông 18.2 (gồm depco) | #499 Compression ratio=18.2:1; #593 Compression ratio=18.2:1 |
| tỉ số nén | 4008-30TAG3 | 13.1×2† / 13×1 | 2 nguồn lệch | chưa rõ | #516 Compression ratio=13.1:1 |
| tỉ số nén | 4012-46TAG2A | 13.1×1† / 13×2 / 13.6×2 | 2 nguồn lệch | chưa rõ | #514 Compression ratio=13.1:1 |
| tỉ số nén | 4012-46TAG3A | 13.1×1† / 13×1 / 13.6×2 | 2 nguồn lệch | chưa rõ | #513 Compression ratio=13.1:1 |
| tỉ số nén | 4012-46TWG2A | 13.1×1† / 13×2 / 13.6×2 | 2 nguồn lệch | chưa rõ | #515 Compression ratio=13.1:1 |
| tỉ số nén | 4016TAG1A | 13.1×1† / 13.6×4 | 2 nguồn lệch (mới) | số đông 13.6 (depco lệch) | #512 Compression ratio=13.1:1 |
| tỉ số nén | 4B3.9-G1 | 18×2 / 17.3×2† | 2 nguồn lệch | chưa rõ | #65 Compression ratio=17.3:1; #719 Compression ratio=17.3:1 |
| tỉ số nén | 4B3.9-G2 | 18×5† / 17.3×1† / 17.5×1 | 2 nguồn lệch | số đông 18 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #552 Compression ratio=17.3:1; #718 Compression ratio=18.0:1 |
| tỉ số nén | 4BT3.9-G1 | 18×2 / 17.3×2† | 2 nguồn lệch | chưa rõ | #716 Compression ratio=17.3:1 |
| tỉ số nén | 4BT3.9-G2 | 18×5† / 17.3×1† | 2 nguồn lệch (mới) | số đông 18 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #551 Compression ratio=17.3:1; #717 Compression ratio=18.0:1 |
| tỉ số nén | 4BTA3.9-G2 | 18×2 / 17.3×3† / 16.5×1 / 17.5×1 | 2 nguồn lệch | chưa rõ | #66 Compression ratio=17.3:1; #68 Compression ratio=17.3:1; #549 Compression ratio=17.3:1 |
| tỉ số nén | 6BTAA5.9-G2 | 17.3×4† / 16.5×1 | 0 không do depco | số đông 17.3 (gồm depco) | #544 Compression ratio=17.3:1; #604 Compression ratio=17.3:1 |
| tỉ số nén | 6CTA8.3-G2 | 17.3×4† / 16.5×1 | 0 không do depco | số đông 17.3 (gồm depco) | #541 Compression ratio=17.3:1; #542 Compression ratio=17.3:1; #602 Compression ratio=17.3:1 |
| tỉ số nén | 6CTAA8.3-G2 | 18×4† / 16.5×1 | 0 không do depco | số đông 18 (gồm depco) | #540 Compression ratio=18.0:1; #601 Compression ratio=18.0:1 |
| tỉ số nén | 6LTAA8.9-G2 | 16.6×5† / 18×1† / 16.5×1 | 2 nguồn lệch | số đông 16.6 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #539 Compression ratio=18.0:1; #599 Compression ratio=16.6:1 |
| tỉ số nén | 6LTAA8.9-G3 | 16.6×4† / 17.3×1† | 2 nguồn lệch (mới) | số đông 16.6 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #538 Compression ratio=17.3:1; #580 Compression ratio=16.6:1; #598 Compression ratio=16.6:1 |
| tỉ số nén | 6LTAA9.5-G1 | 14×1† / 16.6×1 | 2 nguồn lệch (mới) | chưa rõ | #578 Compression ratio=14.0:1 |
| tỉ số nén | 6LTAA9.5-G3 | 16.6×2 / 14.5×1† | 2 nguồn lệch (mới) | chưa rõ | #581 Compression ratio=14.5:1 |
| tỉ số nén | BF4M1013FC | 19×1† / 18.1×1 | 2 nguồn lệch (mới) | chưa rõ | #411 Compression ratio=19.0 : 1; #443 Compression ratio=19.0:1 |
| tỉ số nén | BF4M2012 | 19×2† / 18.4×1 | 2 nguồn lệch | chưa rõ | #416 Compression ratio=19.0 : 1; #667 Compression ratio=19.0:1 |
| tỉ số nén | CA4DF2-12D | 17×1 / 17.5×1† | 2 nguồn lệch (mới) | chưa rõ | #650 Compression ratio=17.5:1 |
| tỉ số nén | DP086LA | 16.7×2† / 16.4×1† | 2 nguồn lệch (mới) | chưa rõ; depco tự lệch giữa các bảng cùng model | #177 Compression ratio=16.4:1; #256 Compression ratio=16.7:1 |
| tỉ số nén | DP222CB | 15×1† / 17.3×1 | 2 nguồn lệch (mới) | chưa rõ | #161 Compression ratio=15.0:1; #243 Compression ratio=15.0:1 |
| tỉ số nén | KTA19-G2 | 17×1† / 14.5×2† / 13.9×1 | 2 nguồn lệch | chưa rõ; depco tự lệch giữa các bảng cùng model | #533 Compression ratio=17.0:1; #571 Compression ratio=14.5:1 |
| tỉ số nén | KTA19-G4 | 13.9×4† / 17×1† | 2 nguồn lệch (mới) | số đông 13.9 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #528 Compression ratio=13.9:1; #564 Compression ratio=17.0:1 |
| tỉ số nén | KTA38-G5 | 13.9×2 / 14.5×3† | 2 nguồn lệch | chưa rõ | #553 Compression ratio=14.5:1 |
| tỉ số nén | KTA50-G8 | 13.9×1† / 14.9×3 | 2 nguồn lệch (mới) | số đông 14.9 (depco lệch) | #706 Compression ratio=13.9:1 |
| tỉ số nén | KTA50-GS8 | 15×1 / 13.9×1† / 14.9×4 | 2 nguồn lệch | số đông 14.9 (depco lệch) | #708 Compression ratio=13.9:1 |
| tỉ số nén | KTAA19-G5 | 13.9×1† / 13.5×2 | 2 nguồn lệch (mới) | chưa rõ | #527 Compression ratio=13.9:1; #563 Compression ratio=13.9:1 |
| tỉ số nén | KTAA19-G6 | 13.9×1† / 13.5×2 | 2 nguồn lệch (mới) | chưa rõ | #562 Compression ratio=13.9:1 |
| tỉ số nén | KTAA19-G6A | 13.9×3† / 13×1 | 0 không do depco | số đông 13.9 (gồm depco) | #526 Compression ratio=13.9:1; #560 Compression ratio=13.9:1 |
| tỉ số nén | NTA855-G1 | 14×1† / 14.5×3† | 2 nguồn lệch (mới) | số đông 14.5 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #537 Compression ratio=14.0:1; #595 Compression ratio=14.5:1 |
| tỉ số nén | NTA855-G1A | 14×1† / 14.5×4† | 2 nguồn lệch (mới) | số đông 14.5 (depco có cả giá trị khác); depco tự lệch giữa các bảng cùng model | #577 Compression ratio=14.0:1; #579 Compression ratio=14.5:1 |
| tỉ số nén | NTA855-G1B | 14×4† / 14.5×1 | 0 không do depco | số đông 14 (gồm depco) | #576 Compression ratio=14.0:1 |
| tỉ số nén | YD385D | 18×1† / 17.3×1 | 2 nguồn lệch (mới) | chưa rõ | #634 Compression ratio=18.0:1 |

## Đề xuất cách sửa

**Nhóm (1) code đọc sai: không có ca nào**, nên không cần sửa `web/spec-norm.js` / `catalog.js` cho riêng depco. Ca 4006-23TAG3A là nguồn gõ "8L" (bảng #705), không phải lỗi đọc.

Nhóm gần nhất với (1), gom theo kiểu lỗi (sửa ở dữ liệu / luật, không ở bộ đọc):

1. **depco chép nhầm khối xi lanh / bore giữa các dòng cùng hãng** (loại 2, mới): dãy WP10/WP12/WP13/WP6D (ghi 4, thật 6; dung tích 9.726 L và 126×130 suy ra 6 xi lanh, đủ để thấy tự mâu thuẫn), BF8M1015 (ghi 6, số đông 8), 6M33G660/6 (ghi 12, số đông 6), CA6DF2-18D/16D (ghi 4, NCC khác 6), P086TI. Đề xuất: thêm kiểm tra nội bộ trong `quality.mjs`/bước nhập: nếu `cyl × π/4 × bore² × stroke` lệch dung tích >5% thì đánh dấu dòng depco "tự mâu thuẫn" và không đếm vào mâu thuẫn giữa NCC (hoặc giữ giá trị suy ra làm bằng chứng phụ).
2. **depco tự lệch giữa hai bảng cùng model** (4B3.9-G2, 4BT3.9-G2, 6LTAA8.9-G2/G3, KTA19-G2/G4, NTA855-G1/G1A, 1106A-70TAG2, DP086LA, BF6M1013EC-G1, BF8M1015CP-LA G1A): một NCC chiếm hai giá trị nên đếm thành mâu thuẫn. Đề xuất: trong `catalog.js`, khi gộp theo NCC, một NCC chỉ được một phiếu cho mỗi trường (lấy giá trị trùng với số đông, hoặc không phiếu nếu hai giá trị khác nhau), thay vì cộng cả hai.
3. **Mâu thuẫn không do depco (loại 0, 134 ca)**: depco cùng phía số đông, người lệch là NCC khác (vd. fdk-energy compr "6", bdadl-shanghai cyl 8). Đề xuất: luật số đông đã đủ ≥3 NCC và ≥3×; `quality --check` nên bỏ các ca đã có người thắng theo luật khỏi con số mâu thuẫn.
4. **Làm tròn dung tích (loại 3, 41 ca)**: 22.9/23, 3.9/4.0, … lệch ≤2%. Đề xuất: dung sai so sánh disp 2% trong `normCanon` (đã có `disp-tol.test.mjs`, cần xem phiên sửa `catalog.js` có gộp chưa).

Ghi chú ngoài phạm vi: số liệu lệch từ NCC khác thấy khi dò (fdk-energy compr "6" ở 1106A-70TAG2; một NCC ghi disp 458 ở 4012-46TAG2A; 149 ở 403D-15G) có vẻ là lỗi đọc/đơn vị nên nên kiểm riêng.
Chưa kiểm: không đo lại được con số "130" (đã thử so dữ liệu depco trước #806: ra y hệt hiện tại vì bộ nhớ đệm của `catalog.js` theo id NCC); đối chiếu từng bảng đã lưu chỉ làm cho các ca mẫu (WP10D264E201, 6M33G660/6, 4006-23TAG3A).
