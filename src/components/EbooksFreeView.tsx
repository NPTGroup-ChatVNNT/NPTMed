import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  Mail, 
  HardDrive, 
  UploadCloud, 
  Search, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { Ebook, UserProfile } from '../types';
import { CURATED_FREE_EBOOKS } from '../Ebook';

interface EbooksFreeViewProps {
  user: UserProfile | null;
  ebooks: Ebook[];
  onAddEbook: (ebook: Ebook) => void;
  onDeleteEbook: (id: string) => void;
  onOpenAuth: () => void;
}

export default function EbooksFreeView({ user, ebooks, onAddEbook, onDeleteEbook, onOpenAuth }: EbooksFreeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDrivePreviewOpen, setIsDrivePreviewOpen] = useState(false);
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(true);

  // Combine curated ebooks from src/Ebook with any free ebooks uploaded
  const allFreeEbooks: Ebook[] = React.useMemo(() => {
    const list = [...CURATED_FREE_EBOOKS];
    // Add non-duplicate free ebooks from DB
    if (Array.isArray(ebooks)) {
      ebooks.forEach(b => {
        if (!b.isPro && !list.some(item => item.id === b.id || item.title.toLowerCase() === b.title.toLowerCase())) {
          list.push(b);
        }
      });
    }
    return list;
  }, [ebooks]);

  // Categories extraction
  const categories = ['all', ...Array.from(new Set(allFreeEbooks.map(b => b.category)))];

  // Filtering
  const filteredEbooks = allFreeEbooks.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Đề Mục Ebook Miễn Phí */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            Ebook Miễn Phí
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Hệ thống giáo trình, chuyên khảo và sách Y khoa mở do Nguyễn Phi Trường trực tiếp tuyển chọn và nạp vào thư viện.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Được kiểm duyệt bởi NPTMed</span>
        </div>
      </div>

      {/* 2. Tuyên Bố Bản Quyền & Miễn Trừ Trách Nhiệm (ĐƯỢC ĐƯA LÊN TRÊN NGAY DƯỚI ĐỀ MỤC) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4" id="copyright-disclaimer-section">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsCopyrightOpen(!isCopyrightOpen)}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                Tuyên Bố Bản Quyền & Miễn Trừ Trách Nhiệm
              </h2>
              <p className="text-xs text-slate-500">
                Chính sách lưu trữ, quyền tác giả và quy định sử dụng tài liệu học tập
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Thu gọn / Mở rộng"
          >
            {isCopyrightOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {isCopyrightOpen && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <p><strong className="text-slate-800">1. Mục đích phi lợi nhuận:</strong> NPTMed hoạt động với tư cách là nền tảng chia sẻ học liệu và liên kết giáo dục phi lợi nhuận. Chúng tôi KHÔNG quét (scan), sao chép hay kinh doanh thương mại bất kỳ tài liệu có bản quyền nào.</p>
              <p><strong className="text-slate-800">2. Nguồn tài liệu:</strong> Toàn bộ sách và tài liệu được thu thập từ các nguồn chia sẻ công khai trên internet hoặc do cộng đồng y khoa tự nguyện đóng góp phục vụ mục đích nghiên cứu.</p>
              <p><strong className="text-slate-800">3. Trách nhiệm người dùng:</strong> Tài liệu chỉ phục vụ mục đích tự học và nghiên cứu cá nhân. Nghiêm cấm sử dụng cho mục đích thương mại hoặc in ấn mua bán trái phép.</p>
              <p><strong className="text-slate-800">4. Tôn trọng sở hữu trí tuệ:</strong> Chúng tôi tôn trọng quyền tác giả và nhà xuất bản. Nếu quý tác giả/đơn vị phát hành yêu cầu gỡ bỏ tài liệu, vui lòng bấm nút gửi khiếu nại bên dưới để được xử lý ngay lập tức.</p>
            </div>

            {/* Báo cáo vi phạm bản quyền trực tiếp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-xs font-semibold text-rose-900">
                  Báo cáo vi phạm bản quyền hoặc yêu cầu gỡ bỏ tài liệu:
                </span>
              </div>
              <a 
                href="mailto:nguyenphitruong1973@gmail.com?subject=Báo%20cáo%20vi%20phạm%20bản%20quyền%20trên%20NPTMed"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Mail className="h-3.5 w-3.5" />
                Gửi Mail Đến nguyenphitruong1973@gmail.com
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. Nút Chức Năng Nổi Bật: GỬI EBOOK TẠI ĐÂY ĐỂ NHÀ PHÁT HÀNH KIỂM DUYỆT VÀ ĐĂNG TẢI (Ngay dưới tuyên bố bản quyền) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wide uppercase backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Đóng Góp Tài Liệu Y Khoa
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Gửi Ebook Tại Đây Để Nhà Phát Hành Kiểm Duyệt Và Đăng Tải
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl">
              Bạn có tài liệu hoặc sách y khoa hay muốn chia sẻ? Tải trực tiếp lên thư mục Google Drive của NPTMed để được Nguyễn Phi Trường thẩm định và đăng tải công khai cho cộng đồng.
            </p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1abrV75_TR1da2BM4YXzuT98oYJVuD8if"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="h-4.5 w-4.5 text-emerald-600" />
            Tải Lên Thư Mục Drive Ngay
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 4. Danh Sách Các File Sách Ebook Miễn Phí (Được nạp trực tiếp vào code src/Ebook) */}
      <div className="space-y-4">
        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tên sách, tác giả hoặc từ khóa y khoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả chuyên khoa' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lưới sách hiển thị */}
        {filteredEbooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEbooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col group"
              >
                {/* Ảnh bìa */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img 
                    src={book.coverUrl || 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80'} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[10px] font-black tracking-wide uppercase backdrop-blur-xs">
                    {book.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-black backdrop-blur-xs">
                    {book.year}
                  </span>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-[11px] font-semibold text-emerald-200 truncate">
                      {book.author}
                    </p>
                  </div>
                </div>

                {/* Nội dung sách */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  {/* Nút hành động */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Bởi: {book.uploadedByName || book.author}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={book.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Đọc Online hoặc Tải về từ Google Drive"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Đọc / Tải Về
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Không tìm thấy sách phù hợp</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả chuyên khoa".
            </p>
          </div>
        )}
      </div>

      {/* 5. CÁC NỀN TẢNG LIÊN KẾT ĐƯỢC ĐƯA XUỐNG DƯỚI */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-emerald-600" />
            Các Nền Tảng Thư Viện Liên Kết Của NPTMed
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Các kho lưu trữ bổ sung được đồng bộ với hệ thống học liệu NPT
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="https://sites.google.com/view/ebooknptythuquan/trang-ch%E1%BB%A7?authuser=0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                Mở Y Thư Quán
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Kho sách Google Sites Y Thư Quán với hàng ngàn đầu sách y khoa chất lượng.
              </p>
            </div>
          </a>

          <a 
            href="https://romantic-grenadilla-78a.notion.site/Kho-H-c-Li-u-NPTMed-3c79d64a5c408088978aeaefc2a3605b?source=copy_link" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                Mở Kho Thư Viện NPTMed (Notion)
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Thư viện Notion sắp xếp bài bản theo phân môn và chuyên đề học phần.
              </p>
            </div>
          </a>
        </div>

        {/* Khung Nhúng Trực Tiếp Drive (Tùy chọn Mở rộng / Thu gọn) */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDrivePreviewOpen(!isDrivePreviewOpen)}>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4.5 w-4.5 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Khung Xem Trực Tiếp Thư Mục Google Drive
              </h4>
            </div>
            <button 
              type="button" 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              {isDrivePreviewOpen ? 'Thu gọn' : 'Xem trực tiếp trên web'}
              {isDrivePreviewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {isDrivePreviewOpen && (
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 mt-2">
              <iframe 
                src="https://drive.google.com/embeddedfolderview?id=1abrV75_TR1da2BM4YXzuT98oYJVuD8if#grid" 
                className="absolute top-0 left-0 w-full h-full border-none"
                title="Kho Tài Liệu NPTMed Drive"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
