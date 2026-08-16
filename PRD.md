# PRD - Đề Án Ứng Dụng Giả Lập Cảnh Báo Lừa Đảo (Anti-Scam Trainer - Zalo Version)

> Delivery status and next-phase implementation are tracked in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

## 1. Mục Tiêu Sản Phẩm (Product Objectives)
Xây dựng ứng dụng web giả lập tình huống lừa đảo trực quan dành cho **người cao tuổi Việt Nam** dựa trên thói quen sử dụng ứng dụng **Zalo**:
- **Logo chính thức**: Sử dụng logo Zalo xanh chuẩn ([/zalo-logo.svg](file:///Users/vothanhthong/Documents/unesco/app/public/zalo-logo.svg)) làm biểu tượng chính cho ứng dụng, header, và biểu tượng cài đặt app trên màn hình điện thoại.
- **Giao diện Zalo mô phỏng (Learner Interface)**: Tái tạo chính xác giao diện nhắn tin Zalo (Header, bong bóng chat, thẻ xem trước link lừa đảo, mascot Zalo, thanh nhập liệu), giúp người già có cảm giác chân thực nhất khi luyện tập.
- **Trang điều khiển kịch bản phong phú (`/trigger`)**: Cung cấp **10+ tình huống lừa đảo phổ biến tại Việt Nam** (Tin nhắn Zalo, Cuộc gọi Video Call Deepfake, Giả danh công an/bệnh viện, Phạt nguội, Tuyển CTV, Đầu tư tài chính...).
- **Route mặc định (`/`)**: Truy cập thẳng vào màn hình Zalo của thiết bị Người học (Người cao tuổi), tự động sinh mã kết nối 4 số.
- **Biểu tượng (Icon)**: Thư viện `lucide-react` kết hợp với phong cách chuẩn Zalo. 100% Giao diện Tiếng Việt.

---

## 2. Kiến Trúc Tuyến Đường (URL Architecture)

| Đường dẫn (URL) | Đối tượng | Giao diện & Chức năng |
|---|---|---|
| `/` (Mặc định) | **Người học (Learner)** | **Mô phỏng Zalo App**: Sử dụng logo Zalo chuẩn. Hiển thị mã kết nối 4 số, khung chat Zalo nhận tin nhắn/cuộc gọi lừa đảo, bấm nút Xóa/Báo cáo hoặc Bấm vào link để kích hoạt Cảnh báo Sập bẫy. |
| `/trigger` | **Người hướng dẫn (Instructor)** | Bảng điều khiển chọn **10+ Kịch bản lừa đảo** (chia nhóm: SMS/Zalo, Video Call Deepfake, Đầu tư/CTV...), tùy chỉnh nội dung & gửi tới thiết bị học viên thời gian thực. |
| `/learner` | *Tương thích* | Chuyển hướng (Redirect) về `/`. |
| `/toolkit` | *Tương thích* | Chuyển hướng (Redirect) về `/trigger`. |

---

## 3. Danh Sách 10+ Kịch Bản Lừa Đảo (Scenario Placeholders)

### Nhóm A: Lừa đảo qua Tin nhắn Zalo & SMS
1. 🚗 **Phạt Nguội Giao Thông**: Giả danh Cục CSGT thông báo vi phạm giao thông, yêu cầu bấm link `phatnguoicontrol.gov.vn` để nộp phạt.
2. 🏦 **Khóa Tài Khoản Ngân Hàng**: Giả danh Ngân hàng cảnh báo tài khoản bị xâm nhập, yêu cầu truy cập link giả lập để xác minh OTP.
3. 🎁 **Trúng Thưởng Zalo / Tri Ân**: Thông báo trúng xe máy/điện thoại iPhone, yêu cầu nộp trước phí làm hồ sơ 500k.
4. 📦 **Bưu Kiện Hỏa Tốc Bị Giữ**: Giả danh Viettel Post/GHTK thông báo hàng chứa chất cấm, yêu cầu chuyển khoản tiền xác minh.
5. 👤 **Mượn Tiền Giả Danh Con Cháu**: Kẻ gian hack/tạo Zalo giống hệt con cháu nhắn tin: *"Mẹ ơi chuyển gấp cho con 5 triệu mua đồ..."*.

### Nhóm B: Lừa đảo qua Cuộc gọi Video Call / Deepfake
6. 🎥 **Deepfake Video Call Công An**: Giả lập cuộc gọi Video Call khuôn mặt công an đứng tại trụ sở, yêu cầu chuyển tiền vào tài khoản tạm giữ để điều tra.
7. 🚑 **Cuộc Gọi Cấp Cứu Khẩn Cấp**: Giả danh bác sĩ/bệnh viện gọi điện báo con em bị tai nạn cấp cứu, đòi nộp gấp tiền viện phí.

### Nhóm C: Lừa đảo Đầu tư & Việc làm Online
8. 💻 **Tuyển Cộng Tác Viên Chốt Đơn**: Mời người già làm việc nhẹ nhàng tại nhà, chốt đơn Shopee/Lazada hưởng hoa hồng 20%.
9. 📈 **Tư Vấn Đầu Tư Tài Chính Siêu Lợi Nhuận**: Mời vào nhóm Zalo tư vấn chứng khoán/tiền số với cam kết lãi 10%/ngày.
10. 🧧 **Trợ Cấp Xã Hội / Quỹ Từ Thiện**: Giả danh Hội Chữ thập đỏ thông báo người cao tuổi được nhận trợ cấp 2 triệu, yêu cầu nộp phí duy trì.

---

## 4. Luồng Trải Nghiệm Chi Tiết (Detailed User Flow)

### Step 1: Kết Nối Thiết Bị
- Tại `/`: Học viên thấy mã 4 chữ số trên giao diện Zalo (VD: `8899`) và biểu tượng App Zalo chuẩn.
- Tại `/trigger`: Người hướng dẫn nhập `8899` để kết nối.

### Step 2: Chọn Kịch Bản Lừa Đảo (Trigger)
- Người hướng dẫn chọn 1 trong 10 kịch bản ở màn hình `/trigger`.
- Với kịch bản Tin nhắn Zalo: Gửi nội dung tin nhắn + link lừa đảo.
- Với kịch bản Video Call / Cuộc gọi: Gửi tín hiệu kích hoạt màn hình cuộc gọi Zalo đến (Zalo Video Call UI).

### Step 3: Phản Ứng Trên Giao Diện Zalo (Learner)
- Màn hình Zalo hiển thị tin nhắn/cuộc gọi đến.
- **Xử lý Đúng (Phát hiện lừa đảo)**: Bấm **Xóa tin nhắn / Tháo chạy / Báo xấu** → Hiện Modal **Chúc Mừng (Xanh)**: *"Tuyệt vời! Bạn đã nhận diện lừa đảo thành công."*
- **Xử lý Sai (Bị mắc bẫy)**: Bấm vào link lừa đảo / Chấp nhận chuyển khoản → Hiện Modal **CẢNH BÁO LỪA ĐẢO (Đỏ rực)**: *"⚠️ BẠN ĐÃ BỊ LỪA ĐẢO! Đây là bài tập giả lập..."*

---

## 5. Quy Chuẩn Giao Diện Zalo Mô Phỏng
- **Logo App**: Sử dụng file [/zalo-logo.svg](file:///Users/vothanhthong/Documents/unesco/app/public/zalo-logo.svg) làm logo ứng dụng.
- **Header**: Nút quay lại (`<`), Avatar & Tên liên hệ ("Cẩm Bình", "Bộ Công An",...), Icon Gọi điện, Icon Video Call, Icon Menu `...`.
- **Thân chat (Chat Body)**:
  - Background màu xanh xám nhạt Zalo đặc trưng (`#e5effa`).
  - Bong bóng tin nhắn trắng (người gửi) và xanh dương nhạt (người nhận).
  - Thẻ Xem trước Liên kết (Link Preview Card) đẹp mắt chứa tiêu đề & link bấm lừa đảo.
- **Footer**: Mascot Zalo icon, ô nhập "Tin nhắn", icon Micro, icon Hình ảnh, icon Tùy chọn `...`.
