import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, BrainCircuit, Maximize2, RefreshCw, Crown, MessageSquare, Plus, Trash2, Sidebar, PanelLeftClose, PanelLeftOpen, ImagePlus, Camera, X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserProfile, Ebook, VideoItem } from '../types';
import ProKeyModal from './ProKeyModal';

interface AssistantViewProps {
  user: UserProfile | null;
  ebooks: Ebook[];
  videos: VideoItem[];
}

type ChatMessage = { role: 'user' | 'model'; text: string; image?: string };
type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const DEFAULT_WELCOME_MSG: ChatMessage = { 
  role: 'model', 
  text: 'Xin chào! Tôi là **Trợ Lý Học Tập Y Khoa NPTMed**.\n\n💡 **Thông báo:** Truy cập **[NPTMedAI](https://nptmedai.ai.studio)** để sử dụng tối ưu toàn bộ chức năng của Trợ Lý AI Y khoa.\n\nTôi được huấn luyện với các kiến thức chuẩn y khoa (Evidence-Based Medicine) để hỗ trợ bạn trong quá trình học tập và tra cứu lâm sàng. Bạn cần tôi phân tích ca lâm sàng, giải đáp cơ chế bệnh sinh, hay tìm kiếm tài liệu nào hôm nay?' 
};

export default function AssistantView({ user, ebooks, videos }: AssistantViewProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('nptmed_chat_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const oldSaved = localStorage.getItem('nptmed_chat_history');
    if (oldSaved) {
       try {
         const parsed = JSON.parse(oldSaved);
         if (parsed.length > 1) { 
            const initialSession: ChatSession = {
              id: 'sess_' + Date.now(),
              title: parsed[1].text.substring(0, 30) + '...',
              updatedAt: Date.now(),
              messages: parsed
            };
            return [initialSession];
         }
       } catch(e) {}
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
     if (sessions && sessions.length > 0) return sessions[0].id;
     return null;
  });

  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem("nptmed_gemini_key") || "");
  const [showProModal, setShowProModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 768);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const [imageUploadCount, setImageUploadCount] = useState(() => {
    const stored = localStorage.getItem('nptmed_image_upload_stats');
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

  useEffect(() => {
    localStorage.setItem("nptmed_gemini_key", personalApiKey);
  }, [personalApiKey]);

  useEffect(() => {
    localStorage.setItem('nptmed_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentChatHistory = activeSessionId 
    ? (sessions.find(s => s.id === activeSessionId)?.messages || [DEFAULT_WELCOME_MSG])
    : [DEFAULT_WELCOME_MSG];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatHistory, isTyping]);

  const addMessageToSession = (userText: string, modelMsg: ChatMessage) => {
    const sessionToUpdate = activeSessionId || 'sess_' + Date.now();
    let updatedSessions = [...sessions];
    
    if (!activeSessionId) {
      setActiveSessionId(sessionToUpdate);
      const newSession: ChatSession = {
        id: sessionToUpdate,
        title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
        updatedAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG, { role: 'user', text: userText }, modelMsg]
      };
      updatedSessions.unshift(newSession);
    } else {
      updatedSessions = updatedSessions.map(s => 
        s.id === sessionToUpdate
          ? { ...s, updatedAt: Date.now(), messages: [...s.messages, { role: 'user', text: userText }, modelMsg] }
          : s
      );
    }
    setSessions(updatedSessions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!personalApiKey && imageUploadCount >= 5) {
      alert("Bạn đã sử dụng hết 5 lượt tải ảnh miễn phí hôm nay. Vui lòng nâng cấp Key Pro để tiếp tục.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPendingImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !pendingImage) return;

    if (messageCount >= 120 && !personalApiKey) {
      const sysMsg: ChatMessage = { role: 'model', text: '⚠️ **Đã đạt giới hạn 120 tin nhắn/ngày.**\n\n**Để sở hữu Key bản Pro không giới hạn (phí 20.000đ/tháng)**, vui lòng nhấn nút **[Đăng Ký Key Pro 20k]** bên trên để quét mã VietQR và gửi ảnh minh chứng chuyển khoản cho Nhà Phát Hành NPTMed!' };
      addMessageToSession(chatMessage || 'Tải ảnh lên', sysMsg);
      setChatMessage('');
      setPendingImage(null);
      return;
    }

    const newMsg = chatMessage;
    const currentImage = pendingImage;
    setChatMessage('');
    setPendingImage(null);
    setIsTyping(true);

    const snapshotHistory = [...currentChatHistory];
    
    const sessionToUpdate = activeSessionId || 'sess_' + Date.now();
    let updatedSessions = [...sessions];
    
    const userMessage: ChatMessage = { role: 'user', text: newMsg, image: currentImage || undefined };

    if (!activeSessionId) {
      setActiveSessionId(sessionToUpdate);
      const newSession: ChatSession = {
        id: sessionToUpdate,
        title: (newMsg || 'Tra cứu hình ảnh').substring(0, 30) + (newMsg.length > 30 ? '...' : ''),
        updatedAt: Date.now(),
        messages: [DEFAULT_WELCOME_MSG, userMessage]
      };
      updatedSessions.unshift(newSession);
    } else {
      updatedSessions = updatedSessions.map(s => 
        s.id === sessionToUpdate
          ? { ...s, updatedAt: Date.now(), messages: [...s.messages, userMessage] }
          : s
      );
    }
    setSessions(updatedSessions);

    if (currentImage && !personalApiKey) {
      const newImageCount = imageUploadCount + 1;
      setImageUploadCount(newImageCount);
      localStorage.setItem('nptmed_image_upload_stats', JSON.stringify({ date: new Date().toDateString(), count: newImageCount }));
    }

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMsg, 
          history: snapshotHistory,
          availableEbooks: ebooks.map(e => e.title),
          availableVideos: videos.map(v => v.title),
          personalApiKey,
          image: currentImage
        })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Lỗi kết nối');
      
      setSessions(prevSessions => prevSessions.map(s => 
        s.id === sessionToUpdate
          ? { ...s, messages: [...s.messages, { role: 'model', text: data.text }] }
          : s
      ));

      if (!personalApiKey) {
        const newCount = messageCount + 1;
        setMessageCount(newCount);
        localStorage.setItem('nptmed_chat_stats', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
      }
    } catch (error: any) {
      setSessions(prevSessions => prevSessions.map(s => 
        s.id === sessionToUpdate
          ? { ...s, messages: [...s.messages, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra: ' + (error.message || 'Vui lòng thử lại sau.') }] }
          : s
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full bg-white overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between bg-emerald-600 px-4 sm:px-6 py-4 text-white shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-emerald-700 rounded-lg transition-colors md:hidden">
            <Sidebar className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Trợ Lý AI NPTMed
              {personalApiKey && (
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Key Pro
                </span>
              )}
            </h2>
            <p className="text-xs text-emerald-100 font-medium hidden sm:block">Hỗ trợ tra cứu & Quyết định lâm sàng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProModal(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đăng Ký Key Pro 20k</span>
          </button>
          <button onClick={handleNewChat} className="p-2 rounded-lg bg-emerald-700/50 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Chat mới</span>
          </button>
        </div>
      </div>

      {/* Notice Banner: Truy cập NPTMedAI */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs shrink-0 z-20 border-b border-indigo-900/50">
        <div className="flex items-center gap-2 text-xs text-center sm:text-left">
          <Sparkles className="h-4 w-4 text-amber-300 shrink-0 animate-pulse" />
          <span>
            Truy cập <strong className="text-amber-300 font-extrabold text-sm">NPTMedAI</strong> để sử dụng tối ưu toàn bộ chức năng của Trợ Lý AI Y khoa.
          </span>
        </div>
        <a
          href="https://nptmedai.ai.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
        >
          Mở NPTMedAI
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between shrink-0 z-20">
        <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 truncate">
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="truncate">Sử dụng phiên bản Pro tốc độ cao không giới hạn tin nhắn?</span>
        </p>
        <button
          onClick={() => setShowProModal(true)}
          className="text-xs font-bold px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors shrink-0 ml-2"
        >
          {personalApiKey ? 'Key Pro Kích Hoạt' : 'Thanh Toán & Nâng Cấp'}
        </button>
      </div>

      {/* Main Content (Sidebar + Chat Area) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay */}
        {showSidebar && (
          <div className="md:hidden absolute inset-0 bg-slate-900/20 z-20" onClick={() => setShowSidebar(false)} />
        )}
        
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden z-30 absolute md:relative h-full shadow-2xl md:shadow-none"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Lịch Sử Trò Chuyện
                </h3>
                <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <PanelLeftClose className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.length === 0 ? (
                   <p className="text-xs text-slate-400 text-center py-6">Chưa có lịch sử trò chuyện.</p>
                ) : (
                  sessions.map(sess => (
                    <div 
                      key={sess.id}
                      onClick={() => { setActiveSessionId(sess.id); if(window.innerWidth < 768) setShowSidebar(false); }}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeSessionId === sess.id ? 'bg-emerald-100/50 border border-emerald-200' : 'hover:bg-slate-100 border border-transparent'}`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-sm font-medium truncate ${activeSessionId === sess.id ? 'text-emerald-900' : 'text-slate-700'}`}>{sess.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(sess.updatedAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area & Input Container */}
        <div className="flex-1 flex flex-col relative w-full h-full min-w-0 bg-white">
          {!showSidebar && (
            <button onClick={() => setShowSidebar(true)} className="absolute top-4 left-4 z-10 p-2 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 transition-colors hidden md:block">
              <PanelLeftOpen className="h-4 w-4 text-slate-600" />
            </button>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
            {currentChatHistory.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-900/10' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="User upload" className="max-w-[200px] w-full rounded-lg mb-3 border border-emerald-400/30 object-cover" />
                  )}
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-emerald'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium ml-1">AI đang phân tích...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            {pendingImage && (
              <div className="max-w-4xl mx-auto mb-3">
                <div className="relative inline-block">
                  <img src={pendingImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" />
                  <button onClick={() => setPendingImage(null)} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-center gap-2">
              <label htmlFor={chatInputId} className="sr-only">Nhập câu hỏi y khoa</label>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors disabled:opacity-50 relative group"
                  title="Tải ảnh lên"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isTyping}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors disabled:opacity-50 relative group"
                  title="Chụp ảnh trực tiếp"
                >
                  <Camera className="h-5 w-5" />
                  {!personalApiKey && (
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                      {5 - imageUploadCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  id={chatInputId}
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Mô tả triệu chứng, hỏi về chẩn đoán, hoặc đính kèm ảnh..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={(!chatMessage.trim() && !pendingImage) || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400">Trợ lý AI NPTMed có thể mắc lỗi. Vui lòng kiểm chứng thông tin y khoa với bác sĩ chuyên môn và các phác đồ chuẩn.</p>
            </div>
          </div>
        </div>
      </div>

      <ProKeyModal
        isOpen={showProModal}
        user={user}
        onClose={() => setShowProModal(false)}
        onSaveKey={(k) => setPersonalApiKey(k)}
      />
    </div>
  );
}
