# Locket Gold · by AnhhPhuongg

Trang tải hồ sơ cấu hình của AnhhPhuongg với giao diện kem–vàng lấy cảm hứng từ Uplocket: điện thoại minh họa, ảnh và sticker nổi, ba thẻ tải xuống, xem thử khung viền và hướng dẫn cài đặt. Bố cục thích ứng trên điện thoại và máy tính.

**Website:** https://AnhhPhuong06.github.io/LocketGold/

**Tool quản lý lời mời:** https://AnhhPhuong06.github.io/LocketGold/tool.html

## Tool quản lý lời mời Gold

Mở `tool.html` qua website hoặc máy chủ xem thử cục bộ. Tool hỗ trợ lưu link mời và mẫu tin nhắn, thêm/sửa/xóa lời mời, hoàn tác xóa, tìm kiếm không dấu, lọc trạng thái và nhập/xuất JSON. Nhập JSON sẽ gộp các mã lời mời mới và giữ nguyên bản ghi đang có; không ghi đè bản ghi trùng.

Dữ liệu nằm trong `localStorage` trên trình duyệt và tên miền bạn đang dùng. Không đồng bộ giữa GitHub Pages và Sites; dùng xuất/nhập JSON nếu muốn chuyển dữ liệu. Khi trình duyệt không cho lưu, trang sẽ báo đang dùng bộ nhớ tạm. Dữ liệu lưu hỏng được giữ nguyên đến khi người dùng tải bản gốc; tool không tự xóa bản lưu đó.

Tool không đăng nhập Locket, không truy vấn trạng thái thuê bao, không gửi tin nhắn và không tự tạo tài khoản. Tất cả trạng thái thưởng do người dùng ghi nhận thủ công. Gold do Locket cấp theo [điều kiện chương trình chính thức](https://help.locket.com/en/articles/18178302-how-do-locket-gold-referrals-work-via-link). Link do người dùng nhập chỉ được kiểm tra định dạng HTTPS; tool không xác minh đây có phải lời mời hợp lệ hay không.

Chạy kiểm thử xử lý dữ liệu bằng Node.js 18 trở lên:

```sh
node --test tests/referral-core.test.cjs
```

## Nội dung

- Bảng giá tham khảo từ Uplocket: dùng thử miễn phí, 1 năm 15.000đ, trọn đời 25.000đ. Nút chọn mở website Uplocket; không thu tiền, nhận đơn hoặc cấp Gold trên trang này. Giá và điều kiện cần được xác nhận tại bên cung cấp; tên gói trọn đời không phải cam kết từ Locket. Không dùng giá này như bảng giá dịch vụ do AnhhPhuongg vận hành.
- Điện thoại và ảnh nổi minh họa trên đầu trang; không phải ảnh chụp ứng dụng thực tế.
- Xem thử ba màu khung và nhấn ảnh để đổi khoảnh khắc; không thay đổi ứng dụng Locket.
- Hướng dẫn cài đặt với ba bước tương tác.
- Câu hỏi thường gặp dùng `details` của trình duyệt.
- Tải trực tiếp hồ sơ chính, hồ sơ IPv4 và chứng chỉ công khai `LocketGold-CA.cer`; sao chép link và nút tải cố định trên điện thoại.
- Xem dấu vân tay SHA-256, thời hạn chứng chỉ, URL DNS và phạm vi tên miền từ `assets/profile-info.json`.
- Phông chữ và ảnh lưu cục bộ; không có trình theo dõi hoặc thư viện JavaScript bên ngoài.
- Hỗ trợ bàn phím, thông báo sao chép cho trình đọc màn hình và chế độ giảm chuyển động.

## Chạy tại máy

Không cần cài thư viện hoặc chạy build. Trong thư mục dự án:

```sh
python -m http.server 8000
```

Mở http://localhost:8000 để xem website. Tệp `_headers` cấu hình MIME của hồ sơ trên hosting hỗ trợ định dạng này; máy chủ Python đơn giản không đọc `_headers`.

## Triển khai

GitHub Pages dùng nhánh `main`, thư mục gốc `/`. Tệp `.nojekyll` giữ nguyên các tệp tĩnh. Các liên kết tài nguyên dùng đường dẫn tương đối để chạy cả dưới `/LocketGold/` lẫn tại gốc tên miền.

## Chỉnh sửa

- `index.html`: nội dung và các phần của trang.
- `assets/landing.css`: giao diện trang chủ, kích thước màn hình và chuyển động.
- `assets/landing.js`: menu, xem thử khung, đổi ảnh, chọn bước và sao chép link.
- `assets/styles.css`: giao diện chung của tool lời mời; trang chủ dùng CSS riêng.
- `assets/app.js`: mã trang chủ cũ, hiện không được tải.
- `AnhhPhuongg.mobileconfig`: hồ sơ đang cung cấp để tải.

Khi thay hồ sơ, cập nhật kích thước, ngày và mô tả trong `index.html` cho khớp. Không đặt khóa riêng, mật khẩu hay token trong repo công khai.

Chứng chỉ `.cer` được xuất nguyên vẹn từ payload CA trong hồ sơ chính, không tạo CA mới và không chứa khóa riêng. Hai hồ sơ DNS đã có CA này; không cần cài thêm bản riêng. Để xuất lại chứng chỉ và metadata sau khi cập nhật hồ sơ, dùng Python với thư viện `cryptography` rồi chạy `python scripts/export-certificate.py`. Chứng chỉ CA và hồ sơ được giữ nguyên nội dung trong lần thiết kế lại giao diện này.

## Về hồ sơ

### Phạm vi tương thích

Apple hỗ trợ payload `com.apple.dnsSettings.managed` từ **iOS 14**. iOS 13 trở xuống không hỗ trợ phần DNS này. Chưa có kiểm thử trên thiết bị thật cho từng phiên bản iOS; không có cam kết hoạt động trên tất cả iOS hoặc kích hoạt Gold.

- `AnhhPhuongg.mobileconfig`: bản chính, tìm địa chỉ máy chủ DNS qua tên miền.
- `AnhhPhuongg-IPv4.mobileconfig`: bản dự phòng có `ServerAddresses = 103.211.207.247`, để thử khi mạng không phân giải được tên miền máy chủ DNS. Địa chỉ này là IPv4 của nhà cung cấp trong bản gốc, không phải khả năng dự phòng sang một nhà cung cấp khác.

Hai bản dùng cùng định danh, chứng chỉ và danh sách tên miền. Chỉ cài một bản tại một thời điểm; khi đổi bản, dùng chức năng thay thế hồ sơ hoặc gỡ bản cũ này trước. Bản IPv4 không bảo đảm chạy trên mọi mạng, đặc biệt mạng chỉ có IPv6, và không khắc phục khác biệt trong phiên bản Locket hay xử lý của máy chủ.

Tạo lại bản IPv4 từ hồ sơ chính:

```sh
python scripts/create-ipv4-profile.py
```

Nếu nhà cung cấp đổi IP, xác nhận địa chỉ mới trước khi dùng `--ip`. Giữ nguyên chứng chỉ gốc nếu máy chủ vẫn dùng CA đó; không tự tạo CA mới và không đưa khóa riêng lên GitHub.

Hỗ trợ payload DNS của hệ điều hành không phải cam kết tương thích giao diện hoặc ứng dụng trên mọi phiên bản Safari/iOS. Chưa có kiểm thử cài hồ sơ trên iPhone thật trong lần cập nhật giao diện này.

Nguồn: [định nghĩa payload do Apple công bố](https://github.com/apple/device-management/blob/release/mdm/profiles/com.apple.dnsSettings.managed.yaml), [cấu hình địa chỉ máy chủ DNS](https://developer.apple.com/documentation/devicemanagement/dnssettings/dnssettings-data.dictionary).

### Giới hạn sử dụng

Đây là bản thử tương thích mạng, gồm DNS qua HTTPS và chứng chỉ gốc LocketGold. Tệp không thực hiện mua hoặc cấp gói Gold chính thức. Chưa xác nhận hồ sơ giải quyết lỗi không hiện Gold trên mọi thiết bị. Chỉ cài và tin cậy chứng chỉ gốc nếu bạn tin nhà cung cấp dịch vụ.

Đây là dự án độc lập, không phải website chính thức của Locket. Khung điện thoại và ảnh trên trang là minh họa, không phải ảnh chụp ứng dụng hay bằng chứng tính năng Gold đã được kích hoạt.

## Tài nguyên bên thứ ba

- Ảnh chó: [Jesse Collins / Unsplash](https://unsplash.com/photos/XCHhSPhXsiI), dùng theo [Unsplash License](https://unsplash.com/license).
- Ảnh biển: [Joel Vodell / Unsplash](https://unsplash.com/photos/8Ogfqvw15Rg), dùng theo Unsplash License.
- Phông Manrope: [Google Fonts](https://fonts.google.com/specimen/Manrope), SIL Open Font License; bản giấy phép nằm tại `assets/Manrope-OFL.txt`.
