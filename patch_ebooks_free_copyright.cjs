const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

const banner = `
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700 text-sm">
             TUYÊN BỐ BẢN QUYỀN & MIỄN TRỪ TRÁCH NHIỆM
             <span className="transition group-open:rotate-180">
               <svg fill="none" height="20" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
             </span>
          </summary>
          <div className="text-xs text-slate-600 mt-3 space-y-2 leading-relaxed">
             <p>Thư viện Ebook của NPTMed – Thư Viện Y Khoa Mở được xây dựng với mục tiêu hỗ trợ học tập, nghiên cứu và chia sẻ tri thức y khoa đến cộng đồng.</p>
             <p>Các tài liệu trong thư viện có thể đến từ:<br/>- Nguồn công khai trên Internet.<br/>- Tài liệu do cộng đồng người dùng chia sẻ.<br/>- Tài liệu do chính tác giả hoặc đơn vị sở hữu cho phép đăng tải.</p>
             <p>NPTMed không tuyên bố quyền sở hữu đối với những tài liệu không do nền tảng trực tiếp biên soạn hoặc phát hành.</p>
             <p>Nếu bạn là tác giả hoặc chủ sở hữu bản quyền và cho rằng một tài liệu trên NPTMed đã được đăng tải khi chưa có sự cho phép, vui lòng liên hệ với chúng tôi kèm theo các thông tin xác minh quyền sở hữu. Sau khi tiếp nhận và xác minh, NPTMed sẽ xem xét chỉnh sửa, ghi nguồn hoặc gỡ bỏ tài liệu trong thời gian sớm nhất.</p>
             <p>Người dùng khi tải lên tài liệu chịu trách nhiệm về tính hợp pháp, nguồn gốc và quyền chia sẻ của nội dung mình đăng tải. Việc đăng tải tài liệu vi phạm bản quyền hoặc quyền sở hữu trí tuệ của bên thứ ba là hoàn toàn thuộc trách nhiệm của người đăng.</p>
             <p>NPTMed luôn tôn trọng quyền sở hữu trí tuệ và mong muốn hợp tác với các tác giả, nhà xuất bản và đơn vị phát hành nhằm xây dựng một thư viện học thuật lành mạnh, minh bạch và bền vững.</p>
          </div>
        </details>
      </div>

      {/* Search and Filters */}`;

code = code.replace('{/* Search and Filters */}', banner);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
