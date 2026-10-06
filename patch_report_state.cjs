const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

code = code.replace(
  'const [editingId, setEditingId] = useState<string | null>(null);',
  'const [editingId, setEditingId] = useState<string | null>(null);\n  const [reportingBook, setReportingBook] = useState<Ebook | null>(null);\n  const [reportForm, setReportForm] = useState({ owner: \'\', email: \'\', evidence: \'\', request: \'\' });'
);

code = code.replace(
  '{/* Footer metadata */}\n                  <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-slate-400">',
  `{/* Footer metadata */}
                  <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-slate-400">`
);

code = code.replace(
  '</button>\n                      </div>\n                    )}\n                  </div>\n                </div>\n              </motion.div>',
  `</button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setReportingBook(book);
                        setReportForm({ owner: '', email: '', evidence: '', request: '' });
                      }}
                      className="flex items-center gap-1 text-[10px] font-medium text-rose-500 hover:text-rose-700 transition-colors w-full"
                    >
                      <Flag className="h-3 w-3" />
                      Báo cáo vi phạm bản quyền
                    </button>
                  </div>
                </div>
              </motion.div>`
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
