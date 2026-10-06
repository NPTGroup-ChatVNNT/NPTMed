import { Ebook, ShopProduct, VideoItem } from './types';

export const INITIAL_EBOOKS: Ebook[] = [
  {
    id: 'free-anatomy-atlas',
    title: 'Atlas Giải Phẫu Người - Frank H. Netter (Bản dịch tiếng Việt)',
    author: 'Frank H. Netter, MD',
    year: '2020',
    category: 'anatomy',
    description: 'Cuốn sách gối đầu giường của mọi sinh viên y khoa. Bản dịch tiếng Việt chuẩn xác giúp học viên dễ dàng nắm bắt cấu trúc giải phẫu của cơ thể người qua các hình ảnh minh họa vẽ tay tuyệt đẹp.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/file/d/1AtlasNetterFreeDemo/view',
    aiSummary: 'Đây là tài liệu tham khảo hàng đầu thế giới về giải phẫu học cơ thể người. Sách hệ thống hóa các vùng cơ thể thông qua hình vẽ chi tiết của bác sĩ Frank Netter, bao gồm xương, cơ, mạch máu và thần kinh liên quan.',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: 1720000000000
  },
  {
    id: 'free-other-guyton',
    title: 'Sinh Lý Học Y Khoa - Guyton & Hall (Tóm tắt trọng tâm)',
    author: 'Guyton and Hall',
    year: '2021',
    category: 'other',
    description: 'Bản tóm tắt súc tích các chương sinh lý học tuần hoàn, hô hấp, tiêu hóa và thần kinh. Thích hợp cho ôn thi lý thuyết và thực hành lâm sàng nhanh chóng.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/file/d/1GuytonPhysiologyFree/view',
    aiSummary: 'Tài liệu tóm tắt tập trung vào cơ chế điều hòa môi trường trong của cơ thể (homeostasis). Giải thích chi tiết hoạt động của tim, thận và hệ thống thần kinh tự chủ bằng sơ đồ dễ hiểu.',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: 1720100000000
  },
  {
    id: 'free-internal-med-pocket',
    title: 'Sổ tay Lâm sàng Nội khoa Pocket Medicine',
    author: 'Marc S. Sabatine',
    year: '2022',
    category: 'internal',
    description: 'Sổ tay bỏ túi cực kỳ tiện lợi cho các bác sĩ nội trú và sinh viên đi lâm sàng bệnh viện. Hướng dẫn chẩn đoán và điều trị nhanh chóng các bệnh lý tim mạch, hô hấp, tiêu hóa.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/file/d/1PocketMedicineViet/view',
    aiSummary: 'Cung cấp phác đồ xử trí nhanh dựa trên chứng cứ (evidence-based medicine) cho các bệnh lý thường gặp tại phòng cấp cứu và khoa nội tổng quát.',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: 1720200000000
  }
];

export const INITIAL_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-stethoscope-classic',
    name: 'Ống nghe Y tế Littmann Classic III - Bản Đặc Biệt',
    description: 'Ống nghe chất lượng cao dành cho bác sĩ nội khoa, sinh viên đi lâm sàng. Khả năng lọc âm xuất sắc giúp nghe rõ tiếng tim T1, T2, tiếng thổi và ran phổi.',
    price: 1850000,
    category: 'equipment',
    imageUrl: 'stethoscope',
    linkUrl: 'https://littmann.vn/littmann-classic-iii',
    isExternal: true
  },
  {
    id: 'prod-anatomy-app-3d',
    name: 'Ứng dụng Giải phẫu 3D - Human Anatomy Atlas (Bản quyền 1 năm)',
    description: 'Phần mềm mô phỏng giải phẫu 3D trực quan sinh động trên điện thoại và máy tính. Giúp bạn bóc tách từng lớp cơ, xương, dây thần kinh một cách trực quan.',
    price: 350000,
    category: 'app',
    imageUrl: 'layout-grid',
    linkUrl: 'https://www.visiblebody.com/anatomy-images-software/human-anatomy-atlas',
    isExternal: true
  },
  {
    id: 'prod-nptmed-clinical-calc',
    name: 'Phần mềm tra cứu chỉ số Lâm sàng NPTMed Pro',
    description: 'Ứng dụng tính toán các thang điểm lâm sàng (Glasgow, CURB-65, GFR, Child-Pugh, CHA2DS2-VASc) nhanh chóng, chính xác. Thiết kế tối ưu cho bác sĩ Việt Nam.',
    price: 120000,
    category: 'app',
    imageUrl: 'calculator',
    linkUrl: '#buy-nptmed-app',
    isExternal: false
  },
  {
    id: 'prod-pulse-oximeter',
    name: 'Máy Đo SpO2 Cầm Tay Beurer PO30',
    description: 'Thiết bị đo nồng độ oxy trong máu và nhịp tim nhỏ gọn, độ chính xác cao. Đạt tiêu chuẩn y tế châu Âu, phù hợp đi trực cấp cứu.',
    price: 650000,
    category: 'equipment',
    imageUrl: 'heart-pulse',
    linkUrl: 'https://beurer.vn/may-do-spo2-beurer-po30',
    isExternal: true
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-anatomy-heart',
    title: 'Giải Phẫu Tim và Hệ Tuần Hoàn (3D Anatomy)',
    description: 'Video mô tả trực quan cấu trúc các buồng tim, van tim, các mạch máu lớn đi vào và đi ra khỏi tim cùng chu kỳ hoạt động của tim.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dBandS_4vbg',
    youtubeId: 'dBandS_4vbg',
    category: 'anatomy',
    addedBy: 'nguyenphitruong1973@gmail.com',
    createdAt: 1720000000000
  },
  {
    id: 'vid-clinical-examination',
    title: 'Hướng dẫn Thăm khám Tim mạch Lâm sàng chuẩn quốc tế',
    description: 'Quy trình 4 bước Nhìn, Sờ, Gõ, Nghe trong khám tim mạch lâm sàng thực tế trên bệnh nhân, nhận biết các tiếng tim sinh lý và bệnh lý.',
    youtubeUrl: 'https://www.youtube.com/watch?v=F0SIdvL0wos',
    youtubeId: 'F0SIdvL0wos',
    category: 'clinical',
    addedBy: 'nguyenphitruong1973@gmail.com',
    createdAt: 1720100000000
  },
  {
    id: 'vid-other-ecg',
    title: 'Sinh lý học Điện tâm đồ (ECG/EKG) cơ bản dễ hiểu',
    description: 'Giải thích cơ chế hình thành các sóng P, Q, R, S, T trên điện tâm đồ dựa trên hoạt động điện thế màng của tế bào cơ tim.',
    youtubeUrl: 'https://www.youtube.com/watch?v=xIZQRjkwV9Q',
    youtubeId: 'xIZQRjkwV9Q',
    category: 'lecture',
    addedBy: 'nguyenphitruong1973@gmail.com',
    createdAt: 1720200000000
  }
];
