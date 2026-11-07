# Tài nguyên giao diện tích hợp

Nguồn tải: https://uplocket.io.vn/ và các tệp công khai được trang đó tham chiếu.

`asset-manifest.json` ghi URL gốc, đường dẫn lưu và SHA-256 cho từng tệp nhập. Bộ tích hợp gồm ảnh trang chủ, sticker, icon, logo, phông Fredoka, Lenis và 78 khung PNG không trùng nội dung. `frames.json` và `frames.js` là danh mục khung được dựng từ các tệp đã tải.

Trang dùng JavaScript độc lập tại `../visuals.js` cho đổi ảnh, chuyển động, thư viện khung và tìm kiếm. Chỉ tệp Lenis là JS gốc được chạy trực tiếp; các chunk Next.js của website nguồn cần runtime/backend riêng nên không được chèn vào trang hiện tại. Không thêm beacon phân tích, API tài khoản, thanh toán, API hồ sơ riêng hoặc phông SF Pro vào website.

`Lenis-LICENSE.txt` là giấy phép MIT của Lenis. `Fredoka-OFL.txt` là giấy phép SIL Open Font License của Fredoka. Quyền đối với các hình ảnh/khung và thương hiệu gốc thuộc chủ sở hữu tương ứng; việc ghi nguồn không phải xác nhận quan hệ hợp tác hoặc quyền cấp Locket Gold.
