const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

const items = [
  ["hung_vuong_portrait", "Chân Dụng Vua Hùng", "#D4AF37", "Quốc Tổ Văn Lang"],
  ["banh_chung", "Bánh Chưng Bánh Giầy", "#4CAF50", "Triết lý Vuông Tròn"],
  ["co_loa_map", "Sơ Đồ Thành Cổ Loa", "#CD7F32", "Thành Xoáy Ốc 9 Vòng"],
  ["no_than", "Nỏ Thần Liên Châu", "#FF9800", "Lẫy Đồng Cao Lỗ"],
  ["hai_ba_trung", "Hai Bà Trưng Cưỡi Voi", "#E91E63", "Khởi Nghĩa Mê Linh 40"],
  ["ba_trieu", "Bà Triệu Ra Trận", "#9C27B0", "Cưỡi Voi Trắng Đánh Ngô"],
  ["bach_dang_938", "Trận Bạch Đằng 938", "#00BCD4", "Ngô Quyền Phá Nam Hán"],
  ["co_lau", "Cờ Lau Tập Trận", "#FFEB3B", "Đinh Bộ Lĩnh Niên Thiếu"],
  ["long_bao", "Dương Vân Nga Trao Long Bào", "#FF5722", "Khai Mở Triều Tiền Lê"],
  ["chieu_doi_do", "Chiếu Dời Đô 1010", "#FFD700", "Lý Thái Tổ Định Đô"],
  ["van_mieu", "Văn Miếu Quốc Tử Giám", "#795548", "Đại Học Đầu Tiên"],
  ["tran_hung_dao", "Hưng Đạo Vương Trần Quốc Tuấn", "#F44336", "Hịch Tướng Sĩ 1288"],
  ["bop_cam", "Trần Quốc Toản Bóp Nát Quả Cam", "#FF9800", "Bến Bình Than 1282"],
  ["thanh_nha_ho", "Cổng Vòm Thành Nhà Hồ", "#607D8B", "Di Sản Đá Kiên Cố"],
  ["nguyen_trai", "Nguyễn Trãi Viết Bình Ngô Đại Cáo", "#FF5722", "Thiên Cổ Hùng Văn"],
  ["ho_hoan_kiem", "Sự Tích Trả Gươm Hồ Hoàn Kiếm", "#0288D1", "Rùa Vàng & Lê Lợi"],
  ["quang_trung", "Vua Quang Trung Tiến Quân", "#D32F2F", "Đại Phá 29 Vạn Quân Thanh"],
  ["ngo_mon_hue", "Ngọ Môn - Đại Nội Huế", "#FFA000", "Cố Đô Triều Nguyễn"],
  ["dien_bien_phu", "Chiến Thắng Điện Biên Phủ", "#388E3C", "Lừng Lẫy Năm Châu"],
  ["dinh_doc_lap", "Xe Tăng Tiến Vào Dinh Độc Lập", "#C62828", "Giải Phóng Miền Nam 1975"],
  ["ha_noi_hien_dai", "Hà Nội - Thành Phố Hòa Bình", "#00ACC1", "Việt Nam Vươn Tầm"]
];

items.forEach(([name, title, accent, sub]) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1e28"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <radialGradient id="cardGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#cardGrad)" rx="16"/>
  <rect width="800" height="600" fill="url(#cardGlow)" rx="16"/>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="8 6" opacity="0.5"/>
  
  <g filter="url(#shadow)">
    <circle cx="400" cy="240" r="110" fill="none" stroke="${accent}" stroke-width="4"/>
    <circle cx="400" cy="240" r="85" fill="${accent}" opacity="0.2"/>
    <path d="M 370 240 L 400 190 L 430 240 L 400 290 Z" fill="${accent}"/>
    <circle cx="400" cy="240" r="15" fill="#FFFFFF"/>
  </g>

  <text x="400" y="440" text-anchor="middle" fill="#FFFFFF" font-family="'Cinzel', serif" font-size="28" font-weight="bold" letter-spacing="2">${title}</text>
  <text x="400" y="480" text-anchor="middle" fill="${accent}" font-family="'Be Vietnam Pro', sans-serif" font-size="16" letter-spacing="1">${sub}</text>
  <line x1="250" y1="510" x2="550" y2="510" stroke="${accent}" stroke-width="1.5" opacity="0.6"/>
  <text x="400" y="540" text-anchor="middle" fill="#A0A0A0" font-family="'Be Vietnam Pro', sans-serif" font-size="13">LỊCH SỬ VIỆT NAM • ĐIỆN ẢNH BẢO TÀNG SỐ</text>
</svg>`;
  fs.writeFileSync(path.join(imgDir, `${name}.svg`), svg, 'utf8');
});

console.log('21 Gallery SVG files written successfully!');
