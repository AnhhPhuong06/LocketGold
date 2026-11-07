# Locket Gold · by AnhhPhuongg

Trang tải hồ sơ cấu hình với giao diện kem–vàng, bố cục thích ứng trên điện thoại và máy tính.

**Website:** https://AnhhPhuong06.github.io/LocketGold/

## Nội dung

- Khung iPhone minh họa; nhấn ảnh để đổi giữa hai khoảnh khắc.
- Hướng dẫn cài đặt với ba bước tương tác.
- Câu hỏi thường gặp dùng `details` của trình duyệt.
- Tải trực tiếp `AnhhPhuongg.mobileconfig`, sao chép link và nút tải cố định trên điện thoại.
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
- `assets/styles.css`: giao diện, kích thước màn hình và chuyển động.
- `assets/app.js`: menu, đổi ảnh, chọn bước, sao chép link và nút tải trên điện thoại.
- `AnhhPhuongg.mobileconfig`: hồ sơ đang cung cấp để tải.

Khi thay hồ sơ, cập nhật kích thước, ngày và mô tả trong `index.html` cho khớp. Không đặt khóa riêng, mật khẩu hay token trong repo công khai.

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

Website có bổ sung xử lý khoảng cách flex và tỷ lệ ảnh cho Safari 14, cùng xử lý thay đổi kích thước màn hình qua `MediaQueryList.addListener` khi API mới chưa có. Đây là sửa tương thích giao diện, không mở rộng hỗ trợ DNS của hệ điều hành.

Nguồn: [định nghĩa payload do Apple công bố](https://github.com/apple/device-management/blob/release/mdm/profiles/com.apple.dnsSettings.managed.yaml), [cấu hình địa chỉ máy chủ DNS](https://developer.apple.com/documentation/devicemanagement/dnssettings/dnssettings-data.dictionary).

### Giới hạn sử dụng

Đây là bản thử tương thích mạng, gồm DNS qua HTTPS và chứng chỉ gốc LocketGold. Tệp không thực hiện mua hoặc cấp gói Gold chính thức. Chưa xác nhận hồ sơ giải quyết lỗi không hiện Gold trên mọi thiết bị. Chỉ cài và tin cậy chứng chỉ gốc nếu bạn tin nhà cung cấp dịch vụ.

Đây là dự án độc lập, không phải website chính thức của Locket. Khung điện thoại và ảnh trên trang là minh họa, không phải ảnh chụp ứng dụng hay bằng chứng tính năng Gold đã được kích hoạt.

## Tài nguyên bên thứ ba

- Ảnh chó: [Jesse Collins / Unsplash](https://unsplash.com/photos/XCHhSPhXsiI), dùng theo [Unsplash License](https://unsplash.com/license).
- Ảnh biển: [Joel Vodell / Unsplash](https://unsplash.com/photos/8Ogfqvw15Rg), dùng theo Unsplash License.
- Phông Manrope: [Google Fonts](https://fonts.google.com/specimen/Manrope), SIL Open Font License; bản giấy phép nằm tại `assets/Manrope-OFL.txt`.
