## Gói năm và chuyển khoản

**20.000đ/năm**. Vietcombank · **Tạ Anh Phương** · **1032313945**. Nội dung chuyển khoản: `UPLOCKET <username>`, hiển thị sau khi nhập link. Đối soát, cấp gói và xác nhận ngày bắt đầu thủ công. Chưa có tích hợp ngân hàng, quản lý đơn hoặc gia hạn tự động.

`UpLocket.mobileconfig` và `UpLocket-CA.cer` là hồ sơ và chứng chỉ mới từ người dùng. Hồ sơ chưa ký số, vẫn dùng token DNS riêng của bản gốc; chưa xác minh hỗ trợ mọi tài khoản. Tệp tải công khai, chưa chặn tải theo thanh toán hay tự thu hồi sau 1 năm. Metadata: `assets/uplocket-profile-info.json`. Phần này thay thế mô tả giá và việc không thu tiền trong tài liệu cũ bên dưới.

# Locket Gold · by AnhhPhuongg

Trang tải hồ sơ cấu hình của AnhhPhuongg với giao diện kem–vàng lấy cảm hứng từ Uplocket: điện thoại minh họa, ảnh và sticker nổi, ba thẻ tải xuống, xem thử khung viền và hướng dẫn cài đặt. Phần đầu trang dùng tỉ lệ điện thoại 393/852, lớp nền mờ dần, avatar/caption theo ảnh và nhãn icon. Widget xuất hiện sau 1,2 giây và đổi ảnh mỗi 3,4 giây khi đang trong vùng nhìn; chuyển cảnh, trôi nhẹ và tản ảnh khi cuộn dùng các lớp riêng. Bố cục điện thoại chỉ giữ hai sticker; mã QR dẫn đến chính website AnhhPhuongg.

**Website:** https://AnhhPhuong06.github.io/LocketGold/

**Tool quản lý lời mời:** https://AnhhPhuong06.github.io/LocketGold/tool.html

## Tra cứu tài khoản qua Uplocket

Backend trong `backend/lookup-worker.mjs` gọi endpoint tra cứu công khai của Uplocket và chỉ trả các trường cần hiển thị. Không trả UID, token, mã kích hoạt, thông tin holder hoặc nguyên bản phản hồi. API đã được mở cho khách website theo yêu cầu ai cũng dùng được; cấu hình frontend nằm ở `assets/lookup-config.js`. Không có khóa backend hoặc token Sites trong mã trình duyệt.

Khi bật, nút kiểm tra gửi username đến Uplocket và giao diện ghi rõ nguồn. Cờ `is_gold=true/false` hiển thị “Đã có Gold” hoặc “Chưa có Gold” **theo Uplocket**, không được mô tả là xác nhận thuê bao chính thức từ Locket. Nếu API lỗi hoặc không trả cờ boolean, trạng thái vẫn chưa xác định. Gói vừa chọn, gói trong dữ liệu Uplocket và hạn Uplocket trả về là các trường riêng. Nút chính tải hồ sơ DNS từ chính website cho cả trạng thái có Gold, chưa có Gold và chưa xác định; không mở tab hoặc chuyển sang Uplocket. Website này không tự đặt đơn hoặc cấp gói; trạng thái chỉ thay đổi khi API tra cứu trả dữ liệu mới.

Cửa sổ có ba bước: nhập link → xác nhận tài khoản → hướng dẫn cài DNS. Thẻ xác nhận giữ tên, ảnh, trạng thái, gói và hạn ở phần chính; các chi tiết khác thu gọn. Nút “Cài lại DNS” tra cứu gói hiện có mà không chọn một gói mới. Người dùng có thể sao chép username (có phương án sao chép thủ công), tải DNS và kiểm tra lại trạng thái ngay trong cửa sổ. Hướng dẫn cài nằm trong cùng cửa sổ và không đánh dấu thiết bị đã cài thành công chỉ vì tải tệp.

Xem `backend/README.md` để chạy preview, kiểm thử và cấu hình triển khai.

## Tool quản lý lời mời Gold

Mở `tool.html` qua website hoặc máy chủ xem thử cục bộ. Tool hỗ trợ lưu link mời và mẫu tin nhắn, thêm/sửa/xóa lời mời, hoàn tác xóa, tìm kiếm không dấu, lọc trạng thái và nhập/xuất JSON. Nhập JSON sẽ gộp các mã lời mời mới và giữ nguyên bản ghi đang có; không ghi đè bản ghi trùng.

Dữ liệu nằm trong `localStorage` trên trình duyệt và tên miền bạn đang dùng. Không đồng bộ giữa GitHub Pages và Sites; dùng xuất/nhập JSON nếu muốn chuyển dữ liệu. Khi trình duyệt không cho lưu, trang sẽ báo đang dùng bộ nhớ tạm. Dữ liệu lưu hỏng được giữ nguyên đến khi người dùng tải bản gốc; tool không tự xóa bản lưu đó.

Tool không đăng nhập Locket, không truy vấn trạng thái thuê bao, không gửi tin nhắn và không tự tạo tài khoản. Tất cả trạng thái thưởng do người dùng ghi nhận thủ công. Gold do Locket cấp theo [điều kiện chương trình chính thức](https://help.locket.com/en/articles/18178302-how-do-locket-gold-referrals-work-via-link). Link do người dùng nhập chỉ được kiểm tra định dạng HTTPS; tool không xác minh đây có phải lời mời hợp lệ hay không.

Chạy kiểm thử xử lý dữ liệu bằng Node.js 18 trở lên:

```sh
node --test tests/referral-core.test.cjs
```

## Nội dung

- Bảng giá tham khảo từ Uplocket: dùng thử miễn phí, 1 năm 20.000đ, trọn đời 30.000đ. Nút chọn mở cửa sổ nhập link, hiển thị gói đã chọn và kiểm tra định dạng HTTPS của link `locket.cam`. Thẻ kết quả có tên/ảnh từ dịch vụ tra cứu, gói vừa chọn, giá/thời hạn tham khảo, trạng thái/gói/hạn theo Uplocket và phần mở rộng thông tin hồ sơ DNS. Dữ liệu chưa được nguồn trả về vẫn hiển thị “Chưa có dữ liệu” hoặc “Chưa xác minh”; thời hạn gói vừa chọn không được dùng để tự suy ra hạn Gold. Ảnh công khai cục bộ được dùng dự phòng khi có; tài khoản không có ảnh dùng chữ viết tắt. Website không thu tiền, nhận đơn hoặc cấp Gold. Khi bấm kiểm tra, username được gửi đến Uplocket qua API trung gian; trình duyệt không lưu bền vững link nhập. Giá và điều kiện cần xác nhận tại bên cung cấp; tên gói trọn đời không phải cam kết từ Locket.
- Điện thoại và ảnh nổi minh họa trên đầu trang; không phải ảnh chụp ứng dụng thực tế.
- Xem thử ba màu khung và nhấn ảnh để đổi khoảnh khắc; không thay đổi ứng dụng Locket.
- Đã tích hợp ảnh, sticker, app icon và logo đã tải từ Uplocket; điện thoại có thể đổi ảnh bằng nút và tự chuyển khi bật chuyển động. Có nút tạm dừng và hỗ trợ giảm chuyển động.
- Thư viện 78 khung PNG cục bộ, không trùng nội dung: tìm theo tên, hiển thị toàn bộ khung, ảnh tải dần khi cuộn, xem thử trên ảnh minh họa và tải đúng tệp PNG đã chọn. Chọn khung không đổi ứng dụng Locket.
- Cuộn mượt bằng bản Lenis độc lập đã tải; tạm dừng cuộn nền khi mở cửa sổ nhập link. Không chạy các chunk Next.js, beacon theo dõi hoặc API của website nguồn.
- Hướng dẫn cài đặt với ba bước tương tác.
- Câu hỏi thường gặp dùng `details` của trình duyệt.
- Tải trực tiếp hồ sơ chính, hồ sơ IPv4 và chứng chỉ công khai `LocketGold-CA.cer`; sao chép link và nút tải cố định trên điện thoại.
- Xem dấu vân tay SHA-256, thời hạn chứng chỉ, URL DNS và phạm vi tên miền từ `assets/profile-info.json`.
- Phông chữ, ảnh và thư viện Lenis được phục vụ từ chính website; không có trình theo dõi.
- Hỗ trợ bàn phím, thông báo sao chép cho trình đọc màn hình và chế độ giảm chuyển động.

## Chạy tại máy

Ảnh công khai được lưu theo username trong `assets/public-profiles.json`; bản đầu có `anhhphuongg06`. Ngày lưu và trang nguồn được ghi trong danh mục, ảnh được phục vụ từ chính website. Đây là ảnh chụp dữ liệu công khai tại thời điểm nhập, không phải tra cứu trực tiếp mọi tài khoản. Có thể nhập hoặc làm mới một ảnh bằng `python scripts/import-public-profile.py USERNAME`; script chỉ đọc trang cá nhân công khai và tải ảnh từ CDN của Locket. Script không chạy mã của trang nguồn, không lấy tên hiển thị nếu trang không cung cấp và không kiểm tra Gold. Sau khi nhập ảnh mới, tăng phiên bản của `public-profiles.js` trong `index.html` và triển khai lại.

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
- `assets/checkout.css`: bảng giá, thẻ tài khoản và luồng ba bước trong cửa sổ 420px; nền mờ, bố cục điện thoại và hướng dẫn cài DNS. API chỉ tra cứu, không cấp Gold.
- `assets/visuals.css`, `assets/visuals.js`: bố trí tài nguyên gốc, chuyển động và thư viện khung.
- `assets/uplocket/`: ảnh và khung, Lenis, phông Fredoka, danh mục và bản kê URL nguồn/SHA-256. Xem README và giấy phép trong thư mục này.
- `scripts/import-uplocket-assets.py`: nhập lại tài nguyên từ bản tải cục bộ `D:\Locket_Gold\uplocket-public`; giữ nguyên tệp và loại khung trùng SHA-256.
- `assets/landing.js`: menu, xem thử khung, đổi ảnh, chọn bước và sao chép link.
- `assets/locket-link.js`: kiểm tra định dạng link trong cửa sổ chọn gói; kiểm thử bằng `node --test tests/locket-link.test.cjs`.
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
- Phông Nunito cho bảng giá và cửa sổ: [Google Fonts](https://fonts.google.com/specimen/Nunito), SIL Open Font License; bản giấy phép tại `assets/Nunito-OFL.txt`. Không phân phối phông SF Pro của Apple; dùng `ui-rounded` trên hệ thống hỗ trợ và Nunito dự phòng.
- Ảnh/sticker/khung tham khảo: [Uplocket](https://uplocket.io.vn/); URL từng tệp trong `assets/uplocket/asset-manifest.json`.
- Fredoka dùng SIL Open Font License; Lenis dùng MIT. Bản giấy phép nằm trong `assets/uplocket/`.
