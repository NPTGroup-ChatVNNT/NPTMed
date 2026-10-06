/**
 * =====================================================================
 * CẤU HÌNH LOGO & ICON CHO ỨNG DỤNG NPTMED
 * =====================================================================
 * 
 * Anh có thể thay đổi logo và icon bằng 2 cách rất đơn giản:
 * 
 * CÁCH 1: TẢI TRỰC TIẾP FILE ẢNH VÀO THƯ MỤC /public
 * - File Logo chính của web app: Tải đè lên file `/public/logo.png`
 * - File Icon trình duyệt & Mobile (Favicon/PWA): Tải đè lên file `/public/nptmed-icon.png`
 * (Hệ thống sẽ tự động cập nhật ngay trên toàn bộ giao diện)
 * 
 * CÁCH 2: DÙNG ĐƯỜNG LINK ẢNH TRỰC TUYẾN (ONLINE URL)
 * - Nếu anh đã có link ảnh trên Drive, Imgur, Cloudinary... 
 *   chỉ cần thay đổi giá trị của `logoUrl` hoặc `iconUrl` ở bên dưới:
 */

export const BRANDING = {
  appName: 'NPTMed',
  appSubname: 'Thư Viện Y Khoa Mở',
  tagline: 'Y Khoa Học Tập',
  
  // 1. LOGO CHÍNH CỦA ỨNG DỤNG (Hiển thị ở Thanh điều hướng Header, Banner Trang chủ, Màn hình Loading, Chân trang)
  logoUrl: '/nptmed_icon_1784429300954.jpg',

  // 2. ICON ỨNG DỤNG & FAVICON (Hiển thị trên tab trình duyệt, shortcut mobile, PWA)
  iconUrl: '/nptmed_icon_1784429300954.jpg',
};
