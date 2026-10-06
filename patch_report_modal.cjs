const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

const reportModal = `
      {/* Report Modal */}
      <AnimatePresence>
        {reportingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="h-5 w-5 text-rose-500" />
                  Báo cáo vi phạm bản quyền
                </h3>
                <button onClick={() => setReportingBook(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                alert("Cảm ơn bạn đã báo cáo. Đội ngũ NPTMed sẽ xác minh và xử lý yêu cầu của bạn trong thời gian sớm nhất.");
                setReportingBook(null);
              }} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tên tài liệu</label>
                  <input type="text" value={reportingBook.title} disabled className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm bg-slate-50 text-slate-500" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chủ sở hữu bản quyền</label>
                  <input type="text" required value={reportForm.owner} onChange={e => setReportForm({...reportForm, owner: e.target.value})} placeholder="Tên tác giả hoặc đơn vị phát hành..." className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-rose-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email liên hệ</label>
                  <input type="email" required value={reportForm.email} onChange={e => setReportForm({...reportForm, email: e.target.value})} placeholder="Email để chúng tôi phản hồi..." className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-rose-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bằng chứng sở hữu</label>
                  <input type="text" required value={reportForm.evidence} onChange={e => setReportForm({...reportForm, evidence: e.target.value})} placeholder="Đường link bài đăng gốc, link giấy phép..." className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-rose-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Yêu cầu xử lý</label>
                  <textarea required value={reportForm.request} onChange={e => setReportForm({...reportForm, request: e.target.value})} placeholder="Ví dụ: Yêu cầu gỡ bỏ tài liệu, hoặc thêm trích dẫn..." rows={3} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-rose-500 focus:outline-none resize-none" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setReportingBook(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    Hủy
                  </button>
                  <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors">
                    Gửi báo cáo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(
  '        )}\n      </AnimatePresence>\n    </div>\n  );\n}',
  '        )}\n      </AnimatePresence>\n\n' + reportModal + '\n    </div>\n  );\n}'
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
