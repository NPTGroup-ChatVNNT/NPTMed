import { Ebook } from '../types';

/**
 * =====================================================================
 * KHO EBOOK MIỄN PHÍ NPTMED - DANH MỤC SÁCH DO NGUYỄN PHI TRƯỜNG NẠP VÀO
 * =====================================================================
 * 
 * HƯỚNG DẪN DÀNH CHO ANH TRƯỜNG ĐỂ NẠP SÁCH MỚI VÀO MÃ NGUỒN:
 * 
 * Anh chỉ cần thêm một mục mới vào mảng `CURATED_FREE_EBOOKS` bên dưới theo mẫu:
 * {
 *   id: 'ebook-' + Date.now(),
 *   title: 'Tên sách y khoa',
 *   author: 'Tên tác giả / Chủ biên',
 *   year: '2024',
 *   category: 'Nội khoa', // 'Nội khoa' | 'Ngoại khoa' | 'Sản khoa' | 'Nhi khoa' | 'Giải phẫu' | 'Dược lý' | 'Hồi sức cấp cứu' | 'Cận lâm sàng' | 'Ung thư học'
 *   description: 'Mô tả ngắn gọn về nội dung sách...',
 *   isPro: false,
 *   price: 0,
 *   // Link Google Drive hoặc link file PDF trực tiếp (KHUYÊN DÙNG):
 *   fileUrl: 'https://drive.google.com/file/d/.../view?usp=sharing', 
 *   // Link ảnh bìa (hoặc bỏ trống để dùng bìa mặc định theo chuyên khoa):
 *   coverUrl: 'https://images.unsplash.com/...',
 *   uploadedBy: 'Nguyễn Phi Trường',
 *   uploadedByName: 'Nguyễn Phi Trường 2003',
 *   createdAt: Date.now()
 * }
 */

export const CURATED_FREE_EBOOKS: Ebook[] = [
  {
    id: 'free-calle-s-2024',
    title: 'Chiến Lược Điều Trị Ung Thư CaLLE-S Toàn Diện',
    author: 'Nguyễn Phi Trường',
    year: '2024',
    category: 'Ung thư học',
    description: 'Chuyên khảo ứng dụng cơ chế tế bào, tín hiệu tăng sinh và đáp ứng miễn dịch trong kiểm soát khối u ác tính.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường 2003',
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'free-harrisons-internal',
    title: 'Harrison Nguyên Lý Nội Khoa (Bản Tóm Lược Lâm Sàng)',
    author: 'Kasper, Fauci, Hauser, Longo, Jameson, Loscalzo',
    year: '2023',
    category: 'Nội khoa',
    description: 'Cẩm nang nội khoa gối đầu giường dành cho sinh viên Y và bác sĩ nội trú, tổng hợp cơ chế và chẩn đoán điều trị.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: Date.now() - 86400000 * 20
  },
  {
    id: 'free-schwartz-surgery',
    title: 'Schwartz Nguyên Lý Ngoại Khoa Căn Bản',
    author: 'F. Charles Brunicardi & Cộng sự',
    year: '2022',
    category: 'Ngoại khoa',
    description: 'Giáo trình ngoại khoa kinh điển, cập nhật các kỹ thuật phẫu thuật nội soi, cấp cứu bụng ngoại khoa và chấn thương.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'free-netter-anatomy',
    title: 'Atlas Giải Phẫu Người - Frank H. Netter',
    author: 'Frank H. Netter, MD',
    year: '2023',
    category: 'Giải phẫu',
    description: 'Bộ hình vẽ giải phẫu người trực quan và chi tiết nhất thế giới, hỗ trợ đắc lực việc học lý thuyết và thực hành lâm sàng.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: Date.now() - 86400000 * 40
  },
  {
    id: 'free-guyton-physiology',
    title: 'Guyton and Hall Sinh Lý Học Y Khoa',
    author: 'John E. Hall, Michael E. Hall',
    year: '2022',
    category: 'Sinh lý học',
    description: 'Giải thích rõ ràng cơ chế vận hành của cơ thể người ở cấp độ tế bào và hệ cơ quan, nền tảng của mọi bệnh học.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: Date.now() - 86400000 * 50
  },
  {
    id: 'free-katzung-pharmacology',
    title: 'Katzung Dược Lý Học Cơ Bản & Lâm Sàng',
    author: 'Bertram G. Katzung, Todd W. Vanderah',
    year: '2023',
    category: 'Dược lý',
    description: 'Tổng hợp cơ chế tác dụng, chỉ định, chống chỉ định và tương tác thuốc cần thiết cho kê đơn và điều trị an toàn.',
    isPro: false,
    price: 0,
    fileUrl: 'https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if',
    coverUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'nguyenphitruong1973@gmail.com',
    uploadedByName: 'Nguyễn Phi Trường',
    createdAt: Date.now() - 86400000 * 60
  }
];

export const getCuratedFreeEbooks = (): Ebook[] => {
  return CURATED_FREE_EBOOKS;
};
