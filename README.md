# Alokio – Âm Thanh Việt · Website thương mại điện tử (bản HTML tĩnh)

Đồ án môn học Thiết kế website thương mại điện tử. Đây không phải website kinh doanh thật: mọi đơn hàng, thanh toán và tài khoản đều là **dữ liệu giả lập**.

## Cách mở

- **Trên máy tính:** bấm đúp vào `index.html`. Website mở bằng trình duyệt (khuyên dùng Chrome hoặc Edge bản mới). Không cần cài gì, không cần mạng, không cần máy chủ hay database.
- **Trên GitHub Pages:** đưa nguyên thư mục này lên một repository, vào *Settings → Pages*, chọn nhánh `main` và thư mục `/ (root)`. Vài phút sau website có link dạng `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Tài khoản demo

| Vai trò | Vào từ đâu | Email / mật khẩu |
|---|---|---|
| Khách hàng | Trang **Đăng nhập** → nút *Dùng tài khoản demo* | khach@alokio.vn / Alokio@123 |
| Quản trị viên | Trang Đăng nhập thành viên → **nút tím nhỏ ở góc trái dưới** → nút *Dùng tài khoản demo* | admin@alokio.vn / Admin@123 |
| Nhân viên bán hàng | Trang đăng nhập quản trị → *Thử vai trò khác* | nhanvien@alokio.vn / Staff@123 |
| Nhân viên kho | Trang đăng nhập quản trị → *Thử vai trò khác* | kho@alokio.vn / Kho@123 |

Thẻ thanh toán thử nghiệm: `4111 1111 1111 1111`, hạn bất kỳ trong tương lai, CVC bất kỳ, **OTP 123456**.

## Tính năng chính

- Trang chủ (landing page) với cảnh 3D mặt nước rung theo nhạc, loa nổi trên mặt nước. Kéo chuột hoặc vuốt để xoay mọi mô hình 3D.
- Showroom 3D, cửa hàng, bộ lọc, so sánh, yêu thích, giỏ hàng, mã giảm giá, flash sale, blog, tra cứu đơn.
- Thanh toán: COD, VietQR động, ví điện tử (MoMo, ZaloPay, ShopeePay, VNPAY, Viettel Money) qua QR, thẻ + OTP, trả góp. Cổng thanh toán là sandbox giả lập.
- Thanh điều khiển cố định ở cạnh phải: âm lượng, menu nhạc nền (Interstellar, Smooth Bossa Nova, Kabuki Phonk, Alokio Bass tổng hợp), nút lên đầu trang.
- Nền vẩy sơn nghệ thuật (tranh pouring xanh pastel, nhũ vàng, sơn trắng trên nền navy), tự sinh cho từng trang.
- Trang quản trị gồm 14 mục: tổng quan, **phân tích chuyên sâu** (hơn 15 biểu đồ), đơn hàng (bảng và Kanban), giao dịch, sản phẩm (xem 3D), kho, khách hàng, chat, mã giảm giá, flash sale, đánh giá, nội dung, cài đặt, nhân viên. Có chế độ tối.
- Khi mở trang quản trị, cứ 20–50 giây lại có một đơn hàng giả "nhảy" vào kèm tiếng *ting*. Mở cửa hàng ở tab khác để đặt hàng thì trang quản trị cũng nhận đơn ngay.
- Giao diện tự co giãn trên điện thoại, máy tính bảng và máy tính.

## Dữ liệu giả lập

- Toàn bộ dữ liệu (sản phẩm, khoảng 760 đơn mẫu trong 6 tháng, khách hàng, đánh giá…) được tạo tự động ở lần mở đầu tiên và lưu trong **localStorage** của trình duyệt.
- Muốn làm lại từ đầu: vào **Quản trị → Cài đặt → Khôi phục dữ liệu demo** (hoặc xoá dữ liệu duyệt web).
- Dữ liệu của mỗi máy và mỗi trình duyệt là riêng. Các tab trên cùng trình duyệt tự đồng bộ với nhau.

## Cấu trúc thư mục

```
index.html, cua-hang.html, san-pham.html, … (mỗi trang của website là một file .html)
san-pham--<mã>.html  trang từng sản phẩm, HTML xuất sẵn lúc build (đọc được cả khi chưa chạy JavaScript)
bai-viet--<mã>.html  trang từng bài viết cẩm nang, cũng xuất sẵn
sitemap.xml, robots.txt  cho công cụ tìm kiếm
admin*.html          các trang quản trị
css/                 giao diện (site.css, admin.css)
js/alokio.js         toàn bộ mã chạy website (3D, giỏ hàng, thanh toán, quản trị, dữ liệu giả lập)
js/nhac-*.js         nhạc nền (chỉ tải khi bật nhạc)
img/, fonts/         hình ảnh sản phẩm (render từ mô hình 3D), phông chữ
img/og/              ảnh xem trước khi chia sẻ link (Facebook, Zalo, Messenger) cho từng trang
img/tex/             texture 3D dựng sẵn (gỗ, trai, bo mạch…), tải thay vì vẽ lại trên máy người xem
ma-nguon.zip         mã nguồn gốc dễ đọc (không cần để chạy website)
```

## Ghi chú

- Dòng **Alokio Luxe** là sản phẩm ý tưởng của đồ án. Dòng loa kéo karaoke là sản phẩm thật của Alokio.
- Nhạc nền: *Interstellar – Main Theme* (Hans Zimmer), *Smooth Bossa Nova* (Osamu Fukuzawa), *Samurai Beats · Kabuki Phonk* (trích 5 phút). Các bài này dùng cho mục đích học tập. Nếu đưa repository lên GitHub ở chế độ công khai, nên cân nhắc vấn đề bản quyền âm nhạc.
- Phông chữ Be Vietnam Pro và Playfair Display dùng giấy phép SIL OFL. Thư viện three.js dùng giấy phép MIT.
