# Quy tắc chống AI Slop cho Dashboard UI

Tài liệu tham khảo chuyên biệt chống các thói quen xấu làm giao diện dashboard lộ ngay ra là do AI sinh ngẫu nhiên.

---

## 1. Màu sắc & Gradient (Anti AI Palette)

- **Cấm màu tím-xanh mặc định:** Cấm dùng gradient tím-sang-xanh (`blue-to-purple`, `purple-to-pink`), dải màu cầu vồng, hoặc quầng sáng tròn (`radial glow orb`) mờ mờ sau bảng điều khiển.
- **Tuân thủ Tokens:** Toàn bộ màu nền, chữ, viền, trạng thái phải đọc từ `tokens.css` (`--bg-surface`, `--text-primary`, `--border`, `--primary`, `--chart-fill`).
- Gradient chỉ được dùng nếu thương hiệu quy định rõ, hoặc để phân cấp độ sâu cụ thể. Không dùng gradient làm nền cho toàn bộ trang app.

## 2. Bố cục & Lưới (No Unstyled Bento Grid)

- **Không tự ý bento-hóa:** Cấm tự động biến mọi màn hình quản trị thành lưới ô mosaic kiểu Apple/Bento nếu nghiệp vụ chỉ cần danh sách phẳng, bảng biểu tabular, hoặc lưới số liệu đồng nhất.
- Bố cục của dashboard phải phục vụ thông lượng đọc dữ liệu (data density và scannability), không phải để trưng bày nghệ thuật.

## 3. Bóng mờ & Phân tầng độ cao (Elevation Discipline)

- **Cấm soft shadow trôi nổi khắp nơi:** Không gắn bóng mờ quá to, lan tỏa mềm (`blur 20px+`) lên tất cả các thẻ card và bảng biểu khiến toàn bộ giao diện như đang bồng bềnh trên mây.
- Đa số bề mặt trong dashboard nằm phẳng (`flat`); shadow chỉ dùng có chừng mực cho các lớp nổi thực sự (Modal, Popover, Dropdown menu).

## 4. Kiểm soát hiệu ứng kính mờ (Glassmorphism Dose Cap)

- **Tối đa 1–2 thành phần:** Không bao giờ áp dụng `backdrop-filter: blur()` đồng thời lên cả Sidebar, Header, KPI Cards, Bảng dữ liệu và Modal.
- Giao diện app cần độ tương phản sắc nét để thao tác; lạm dụng kính mờ làm mất trật tự thị giác và khiến chữ khó đọc.

## 5. Biểu tượng nghiệp vụ (Relevant Icons)

- **Cấm icon AI sáo rỗng:** Cấm nhét icon ngôi sao lấp lánh (sparkle ✨), phép thuật (magic), tia sét, robot vào các tính năng dashboard thông thường (như bộ lọc, xuất file, phân quyền).
- Icon phải phản ánh chính xác nghiệp vụ thực tế hoặc lược bỏ nếu nhãn chữ đã đủ rõ nghĩa.

## 6. Bo góc có kỷ luật (Border Radius Consistency)

- **Không pill-shape toàn bộ:** Không biến mọi nút, ô nhập, card và modal thành hình con nhộng bo tròn tuyệt đối.
- Tuân thủ nghiêm ngặt Luật chốt #10 (`locked-rules.md`): thành phần cao từ $40\text{px}$ trở lên bo tối thiểu $12\text{px}$, dưới $40\text{px}$ bo $8\text{px}$.

## 7. Ranh giới tương thích với Luật Chốt của Hệ Thống

- **Vòng Focus:** Giữ nguyên Luật chốt #16 (`locked-rules.md`) — không tự ý vẽ thêm vòng focus ở nút, link, tab trừ khi đề yêu cầu accessibility.
- **Logic tương tác:** Giữ nguyên định hướng của skill — chỉ dựng giao diện và các trạng thái trực quan, để handler rỗng (`onClick`, `onPageChange`) cho lập trình viên tự kết nối, không tự bịa logic backend.
