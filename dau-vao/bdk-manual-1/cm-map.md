# So check đã lưu (không chạy lại agent)
Giống hệt: true

- 6M31G825/5 + DSE7320 MKII (điểm 0,0,0,36,8,0,1): Khởi động, dừng, tự động cấp điện (AMF)|unclear|4/5 ; Đo lường, hiển thị|unclear|3/12 ; Cảnh báo, nhật ký sự kiện|unclear|0/8 ; Bảo vệ, dừng máy|unclear|1/13
- V20 TE2 + DSE7320 MKII (điểm 0,0,0,38,7,0,1): Khởi động, dừng, tự động cấp điện (AMF)|unclear|4/5 ; Đo lường, hiển thị|unclear|3/12 ; Cảnh báo, nhật ký sự kiện|unclear|0/8 ; Bảo vệ, dừng máy|unclear|1/13

# Phần → dòng manual [1016] (dự kiến khi agent chạy lại)

| Mục | Phần | Kết luận | Dòng |
|---|---|---|---|
| Đo lường | Số giờ vận hành máy | dat | `Engine Run Time` |
| Đo lường | Số lần khởi động máy | dat | `Number of Starts \| 1,000,000 (1 Million)` |
| Đo lường | Công suất tác dụng, công suất biểu kiến | dat | `Generator Total Load (kW)`<br>`Generator Total Load (kVA)` |
| Đo lường | Hệ số công suất | dat | `Generator Power Factor Average` |
| Đo lường | Tốc độ động cơ | dat | `Engine Speed` |
| Đo lường | Nhiệt độ nước làm mát | dat | `Coolant Temperature` |
| Đo lường | Điện áp acquy | dat | `Engine Battery Volts` |
| Đo lường | Mức nhiên liệu trong thùng chứa | dat | `Engine Fuel Level`<br>`Flexible: Configured for Fuel Level Sensor in the DSE default` |
| Đo lường | Nhiệt độ, áp suất bôi trơn | xac nhan: áp suất có sẵn; Oil Temperature* có dấu * (ECU) | `Oil Pressure` |
| Cảnh báo | Nhật ký lỗi | dat | `The module maintains a log of past alarms and/or selected status changes.` |
| Cảnh báo | Nhiệt độ nước làm mát cao | dat | `Coolant Temp High \| The module detected that the engine coolant temperature had` |
| Cảnh báo | Áp lực dầu nhớt thấp | dat | `Oil Pressure Low \| the Low Oil Pressure Pre-Alarm Trip level after the Safety On` |
| Cảnh báo | Sự cố cảm biến áp suất nhớt | dat | `Oil Press Sender Fault` |
| Cảnh báo | Sự cố cảm biến nhiệt độ | dat | `Coolant Sender O/C` |
| Cảnh báo | Ắc quy yếu / điện áp DC cao/thấp | dat | `DC Battery High Voltage \| The module detected that its DC supply voltage had risen above`<br>`DC Battery Low Voltage \| The module detected that its DC supply voltage had fallen below` |
| Cảnh báo | Quá dòng / cắt tải khi quá tải | dat | `Gen Over Current \| NOTE: For more details, see section 7.7 entitled Over`<br>`kW Overload \| The module detected that the generator output kW had risen` |
| Cảnh báo | Mức nhiên liệu thấp / hết nhiên liệu | xac nhan: có Fuel Level Low, manual không ghi hết nhiên liệu | `Fuel Level Low \| The module detected that the engine fuel level had fallen below` |
| Bảo vệ | Nhiệt độ nước làm mát cao | dat | `Coolant Temp High \| The module detected that the engine coolant temperature had` |
| Bảo vệ | Áp lực dầu nhớt thấp | dat | `Oil Pressure Low \| the Low Oil Pressure Shutdown Trip level after the Safety On` |
| Bảo vệ | Vượt tốc | dat | `Engine Over Speed \| The module detected that the engine speed had risen above the` |
| Bảo vệ | Tần số quá cao/quá thấp | dat | `Gen Over Frequency \| risen above the Over Frequency Pre-Alarm Trip level for the`<br>`Gen Under Frequency \| fallen below the Under Frequency Pre-Alarm Trip level for the` |
| Bảo vệ | Điện áp AC quá cao/quá thấp | dat | `Gen Over Voltage \| The module detected that the generator output voltage had risen`<br>`Gen Under Voltage \| The module detected that the generator output voltage had fallen` |
| Bảo vệ | Quá dòng | dat | `Gen Over Current \| NOTE: For more details, see section 7.7 entitled Over` |
| Bảo vệ | Vượt công suất | dat | `kW Overload \| The module detected that the generator output kW had risen` |
| Bảo vệ | Phát ngược công suất | dat | `Gen Reverse Power \| The module detected that the generator output kW had fallen` |
| Bảo vệ | Ngắn mạch | dat | `Gen Short Circuit \| Circuit IDMT Alarm in this document.` |
| Bảo vệ | Mức nước làm mát thấp | giu chua ro: Low Coolant Warning là nhiệt độ thấp; Engine Coolant Level* qua ECU |  |
| Bảo vệ | Sai lệch điện áp AC giữa các pha | giu chua ro: manual chỉ nêu mất cân bằng DÒNG (Negative Phase Sequence) |  |
| Bảo vệ | Lệch pha | giu chua ro: có Gen Phase Seq Wrong (thứ tự pha), Negative Phase Sequence (dòng); cần chốt nghĩa |  |
| AMF | Cài đặt, hiệu chỉnh tần số qua hệ thống điều tốc | xac nhan: Frequency Adjust ở Running Editor, manual ghi có thể không có tuỳ cấu hình |  |

Dòng không tìm thấy: 0
