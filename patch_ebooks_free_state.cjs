const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

code = code.replace(
  'const [isUploading, setIsUploading] = useState(false);',
  'const [isUploading, setIsUploading] = useState(false);\n  const [acceptedTerms, setAcceptedTerms] = useState(false);'
);

code = code.replace(
  'if (!title || !author || !fileUrl) {',
  'if (!acceptedTerms) {\n      alert("Vui lòng đồng ý với các điều khoản bản quyền.");\n      return;\n    }\n    if (!title || !author || !fileUrl) {'
);

code = code.replace(
  'category,\n      isPro: false,',
  'category: \'Tài Liệu Tham Khảo\',\n      isPro: false,'
);

code = code.replace(
  '<div className="pt-4 flex justify-end gap-3 border-t border-slate-100">',
  `<div className="pt-2 pb-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" required checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Bằng việc tải lên tài liệu, bạn xác nhận rằng mình có quyền chia sẻ tài liệu đó hoặc tài liệu thuộc phạm vi được phép phân phối. Bạn đồng ý chịu hoàn toàn trách nhiệm trước pháp luật đối với nội dung mình đăng tải. NPTMed có quyền từ chối hoặc gỡ bỏ bất kỳ tài liệu nào khi nhận được yêu cầu hợp lệ từ chủ sở hữu bản quyền hoặc khi phát hiện dấu hiệu vi phạm.
                    </span>
                  </label>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">`
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
