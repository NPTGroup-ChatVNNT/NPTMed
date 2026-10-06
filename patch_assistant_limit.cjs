const fs = require('fs');
let code = fs.readFileSync('src/components/AssistantView.tsx', 'utf8');

const counterCode = `
  const [messageCount, setMessageCount] = useState(() => {
    const stored = localStorage.getItem('nptmed_chat_stats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === new Date().toDateString()) {
          return parsed.count;
        }
      } catch (e) {}
    }
    return 0;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (messageCount >= 120 && !personalApiKey) {
      setChatHistory(prev => [...prev, { role: 'user', text: chatMessage }, { role: 'model', text: 'Vượt quá giới hạn 120 tin nhắn/ngày. Để mở khóa không giới hạn hoặc dùng API Key cá nhân, liên hệ Nhà Phát Hành qua Gmail: nguyenphitruong1973@gmail.com' }]);
      setChatMessage('');
      return;
    }
`;

code = code.replace(
  'const handleSendMessage = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!chatMessage.trim()) return;',
  counterCode
);

const updateCounterCode = `
      setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
      if (!personalApiKey) {
        const newCount = messageCount + 1;
        setMessageCount(newCount);
        localStorage.setItem('nptmed_chat_stats', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
      }
    } catch (error: any) {
`;

code = code.replace(
  "setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);\n    } catch (error: any) {",
  updateCounterCode
);

fs.writeFileSync('src/components/AssistantView.tsx', code);
