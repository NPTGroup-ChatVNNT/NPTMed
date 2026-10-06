const fs = require('fs');
let code = fs.readFileSync('src/components/AssistantView.tsx', 'utf8');

if (!code.includes('personalApiKey')) {
  code = code.replace(
    'const [isTyping, setIsTyping] = useState(false);',
    'const [isTyping, setIsTyping] = useState(false);\n  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem("nptmed_gemini_key") || "");\n  const [showSettings, setShowSettings] = useState(false);'
  );

  code = code.replace(
    'const chatInputId = useId();',
    `const chatInputId = useId();\n\n  useEffect(() => {\n    localStorage.setItem("nptmed_gemini_key", personalApiKey);\n  }, [personalApiKey]);`
  );

  code = code.replace(
    'availableVideos: videos.map(v => v.title)',
    'availableVideos: videos.map(v => v.title),\n          personalApiKey'
  );

  code = code.replace(
    '<div className="flex items-center gap-3">',
    `<div className="flex items-center gap-3">`
  );
  
  code = code.replace(
    '<h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">',
    `<h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">`
  );
  
  code = code.replace(
    '</div>\n      </div>\n\n      {/* Chat History */}',
    `<button onClick={() => setShowSettings(!showSettings)} className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">\n          {showSettings ? \'Đóng cài đặt\' : \'Cài đặt API Key cá nhân\'}\n        </button>\n      </div>\n      </div>\n\n      {showSettings && (\n        <div className="bg-slate-50 p-4 border-b border-slate-200">\n          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gemini API Key Cá Nhân</label>\n          <input \n            type="password" \n            placeholder="Nhập API Key của bạn để tránh nghẽn mạng..." \n            value={personalApiKey} \n            onChange={(e) => setPersonalApiKey(e.target.value)} \n            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all mb-2"\n          />\n          <p className="text-xs text-slate-500">Vì web được truy cập công khai, hãy sử dụng API Key cá nhân từ Google AI Studio để có trải nghiệm ổn định và riêng tư hơn.</p>\n        </div>\n      )}\n\n      {/* Chat History */}`
  );

  fs.writeFileSync('src/components/AssistantView.tsx', code);
}
