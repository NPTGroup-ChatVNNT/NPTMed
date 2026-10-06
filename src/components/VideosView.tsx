import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  Search, 
  Plus, 
  Play, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  BookmarkCheck, 
  Loader2, 
  X, 
  Link, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { VideoItem, UserProfile } from '../types';

interface VideosViewProps {
  user: UserProfile | null;
  videos: VideoItem[];
  onAddVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: string) => void;
  onOpenAuth: () => void;
}

// Curated high-yield Vietnamese medical lectures for instant recommendations
const SUGGESTED_MEDICAL_VIDEOS = [
  {
    title: 'Giải Phẫu Tim và Hệ Tuần Hoàn 3D Toàn Diện',
    channel: 'Y Khoa Lâm Sàng',
    desc: 'Chi tiết cấu trúc 4 buồng tim, các van tim nhĩ thất, hệ thống động mạch vành và chu chuyển tim.',
    id: 'dBandS_4vbg',
    category: 'anatomy' as const,
  },
  {
    title: 'Quy Trình Khám Lâm Sàng Tim Mạch (Nhìn - Sờ - Gõ - Nghe)',
    channel: 'Thực Hành Lâm Sàng',
    desc: 'Thao tác khám tim mạch thực tế trên bệnh nhân, nhận diện tiếng T1, T2 và các âm thổi bệnh lý tim mạch.',
    id: 'F0SIdvL0wos',
    category: 'clinical' as const,
  },
  {
    title: 'Sinh Lý Học Điện Tâm Đồ (ECG/EKG) Cơ Bản Dễ Hiểu',
    channel: 'Bài Giảng Y Khoa',
    desc: 'Cơ chế phát sinh dòng điện tim, phân tích các sóng P-QRS-T và các bước đọc điện tâm đồ chuẩn.',
    id: 'xIZQRjkwV9Q',
    category: 'lecture' as const,
  },
  {
    title: 'Kỹ Thuật Hồi Sức Tim Phổi CPR Nâng Cao Theo Chuẩn AHA',
    channel: 'Cấp Cứu Ban Đầu',
    desc: 'Hướng dẫn hồi sức tim phổi ngừng tuần hoàn, ép tim đúng tần số, dùng máy khử rung tim tự động AED.',
    id: 'cosVBV96E2g',
    category: 'clinical' as const,
  },
  {
    title: 'Giải Phẫu Hệ Thần Kinh Trung Ương & 12 Đôi Dây Thần Kinh Sọ',
    channel: 'Giải Phẫu 3D Y Khoa',
    desc: 'Khám phá bán cầu đại não, thân não, tiểu não và đường đi của 12 đôi dây thần kinh sọ não.',
    id: '7o2WvI_W9Lg',
    category: 'anatomy' as const,
  },
  {
    title: 'Hướng Dẫn Tiếp Cận & Đọc X-Quang Phổi Thẳng Cơ Bản',
    channel: 'Chẩn Đoán Hình Ảnh',
    desc: 'Các bước đọc phim X-quang lồng ngực ABCDE: Khí quản, xương, bóng tim, rốn phổi và nhu mô phổi.',
    id: '9M8PzF-bQ-c',
    category: 'lecture' as const,
  }
];

const QUICK_TOPICS = [
  'Khám tim mạch',
  'Khám phổi',
  'Hồi sức cấp cứu',
  'Giải phẫu tim',
  'Điện tâm đồ',
  'Khí máu động mạch',
  'Đặt nội khí quản',
  'Ngoại tiêu hóa'
];

export default function VideosView({ user, videos, onAddVideo, onDeleteVideo, onOpenAuth }: VideosViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [category, setCategory] = useState<'clinical' | 'lecture' | 'anatomy' | 'other'>('clinical');
  const [description, setDescription] = useState('');
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // YouTube Live Search State
  const [ytModalSearch, setYtModalSearch] = useState('');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'Tất cả chủ đề' },
    { value: 'anatomy', label: 'Giải phẫu học' },
    { value: 'clinical', label: 'Thực hành lâm sàng' },
    { value: 'lecture', label: 'Bài giảng lý thuyết' },
    { value: 'other', label: 'Khác' }
  ];

  const filteredVideos = videos.filter(vid => {
    const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vid.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vid.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const clean = url.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) return clean;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
    const match = clean.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Perform Live YouTube Search via Server API
  const handlePerformLiveSearch = async (term: string) => {
    const q = term.trim();
    if (!q) return;

    setIsSearchingLive(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveSearchResults(data);
        } else {
          // Fallback to client filter if server returned 0
          const localFiltered = SUGGESTED_MEDICAL_VIDEOS.filter(s =>
            s.title.toLowerCase().includes(q.toLowerCase()) ||
            s.desc.toLowerCase().includes(q.toLowerCase())
          );
          setLiveSearchResults(localFiltered);
        }
      } else {
        throw new Error('Lỗi máy chủ tìm kiếm');
      }
    } catch (err: any) {
      console.warn('Live search error, falling back to local list:', err);
      const localFiltered = SUGGESTED_MEDICAL_VIDEOS.filter(s =>
        s.title.toLowerCase().includes(q.toLowerCase()) ||
        s.desc.toLowerCase().includes(q.toLowerCase())
      );
      setLiveSearchResults(localFiltered);
      if (localFiltered.length === 0) {
        setSearchError('Không thể kết nối YouTube trực tiếp lúc này. Bạn có thể dán link video trực tiếp bên dưới.');
      }
    } finally {
      setIsSearchingLive(false);
    }
  };

  // Auto fetch video details from YouTube API when URL is entered or pasted
  const autoFetchYoutubeDetails = async (inputUrl: string) => {
    const ytid = extractYoutubeId(inputUrl);
    if (!ytid) return;

    setYoutubeId(ytid);
    setIsAutoFetching(true);
    setFetchSuccess(false);

    try {
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(inputUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setTitle(data.title);
          setDescription(data.desc || `Bài giảng từ kênh: ${data.channel}. Trích dẫn học liệu chất lượng cao.`);
          setFetchSuccess(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Error fetching via server info API, trying fallback', e);
    }

    // Client fallback
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytid}`)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setTitle(data.title);
          setDescription(data.author_name ? `Bài giảng bởi kênh: ${data.author_name}. Trích dẫn học liệu chất lượng cao.` : 'Trích dẫn học liệu y khoa từ YouTube.');
          setFetchSuccess(true);
          return;
        }
      }
    } catch (e) {}

    if (!title) {
      setTitle(`Bài Giảng Y Khoa (Mã: ${ytid})`);
      setDescription('Video học tập y khoa trích dẫn từ YouTube.');
    }
    setIsAutoFetching(false);
  };

  const handleSelectVideo = (item: any) => {
    const vId = item.id || item.youtubeId;
    setYoutubeId(vId);
    setYoutubeUrl(`https://www.youtube.com/watch?v=${vId}`);
    setTitle(item.title);
    setDescription(item.desc || item.description || 'Bài giảng y khoa trích dẫn từ YouTube.');
    if (item.category) setCategory(item.category);
    setFetchSuccess(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setYoutubeUrl('');
    setYoutubeId('');
    setCategory('clinical');
    setDescription('');
    setFetchSuccess(false);
    setYtModalSearch('');
    setLiveSearchResults([]);
    setSearchError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = youtubeId || extractYoutubeId(youtubeUrl);
    if (!finalId) {
      alert('Vui lòng chọn hoặc nhập đường link YouTube hợp lệ!');
      return;
    }

    const finalTitle = title.trim() || `Học Liệu Y Khoa (${finalId})`;
    const finalUrl = `https://www.youtube.com/watch?v=${finalId}`;

    const newVideo: VideoItem = {
      id: editingId || ('vid-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)),
      title: finalTitle,
      description: description || 'Học liệu y khoa trích dẫn từ YouTube.',
      youtubeUrl: finalUrl,
      youtubeId: finalId,
      category,
      addedBy: user?.displayName || user?.email || 'Nguyễn Phi Trường',
      createdAt: editingId ? (videos.find(v => v.id === editingId)?.createdAt || Date.now()) : Date.now()
    };

    onAddVideo(newVideo);
    resetForm();
    setShowAddModal(false);
  };

  // Video list to display in modal (either live results or curated suggestions)
  const displayList = liveSearchResults.length > 0 ? liveSearchResults : SUGGESTED_MEDICAL_VIDEOS;

  return (
    <div className="space-y-8">
      {/* Header and CTA */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Youtube className="h-6 w-6 text-rose-600" />
            Trang Video Học Liệu Y Khoa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp video thực hành lâm sàng, bài giảng chuyên sâu được trích dẫn và đồng bộ trực tiếp từ YouTube.
          </p>
        </div>

        {user ? (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 shadow-sm transition-all cursor-pointer text-sm shrink-0 hover:scale-105 active:scale-95"
            id="btn-add-video"
          >
            <Plus className="h-4.5 w-4.5" />
            Trích Dẫn Video Mới
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 transition-all cursor-pointer text-sm shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            Đăng Nhập Để Trích Dẫn Video
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm video học liệu theo tiêu đề hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-rose-400 transition-all flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                onClick={() => setActiveVideo(video)}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                  YouTube
                </span>

                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wide backdrop-blur-xs">
                  {categories.find(c => c.value === video.category)?.label || 'Y khoa'}
                </span>
              </div>

              {/* Video Info */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 
                    onClick={() => setActiveVideo(video)}
                    className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[150px]">
                    Ghim bởi: {video.addedBy}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveVideo(video)}
                      className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700"
                    >
                      <Play className="h-3 w-3 fill-current" /> Xem ngay
                    </button>
                    {(user?.role === 'admin' || user?.email === video.addedBy) && (
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa video trích dẫn này khỏi thư viện?')) {
                            onDeleteVideo(video.id);
                          }
                        }}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                        title="Xóa video"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Youtube className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Chưa có video nào trong danh mục này</h4>
          <p className="text-xs text-slate-400">
            Hãy bấm nút "Trích Dẫn Video Mới" để tìm và ghim bài giảng YouTube hữu ích vào thư viện!
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 z-10"
            >
              {/* Header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <Youtube className="h-4 w-4" />
                  Đang phát học liệu y khoa
                </span>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* YouTube Iframe */}
              <div className="aspect-video w-full bg-slate-950">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Info panel */}
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {activeVideo.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trích dẫn bởi: {activeVideo.addedBy}</span>
                  <a
                    href={activeVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-rose-600 hover:underline font-bold"
                  >
                    Xem trên YouTube <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trích Dẫn Video Modal: TÌM KIẾM TRỰC TIẾP & TỰ ĐỘNG ĐIỀN */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Youtube className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Trích Dẫn Video Học Liệu YouTube
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tìm trực tiếp trên YouTube hoặc dán link — Tiêu đề & mô tả tự động trích xuất!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* 1. KHU VỰC TÌM KIẾM TRỰC TIẾP VIDEO Y KHOA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-rose-500" />
                      Tìm Kiếm Video Y Khoa Trực Tiếp Trên YouTube
                    </label>
                    <span className="text-[11px] text-slate-400">Nhấn để tự điền</span>
                  </div>

                  {/* Thanh tìm kiếm trực tiếp + Nút bấm Tìm */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePerformLiveSearch(ytModalSearch);
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Gõ từ khóa: giải phẫu tim, khám phổi, ECG, cấp cứu..."
                        value={ytModalSearch}
                        onChange={(e) => setYtModalSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingLive}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSearchingLive ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Đang tìm...
                        </>
                      ) : (
                        <>
                          <Search className="h-3.5 w-3.5" />
                          Tìm YouTube
                        </>
                      )}
                    </button>
                  </form>

                  {/* Từ khóa gợi ý nhanh */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 shrink-0">Chủ đề nhanh:</span>
                    {QUICK_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setYtModalSearch(topic);
                          handlePerformLiveSearch(topic);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold whitespace-nowrap transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>

                  {searchError && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{searchError}</span>
                    </div>
                  )}

                  {/* Danh sách kết quả video tìm được */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {displayList.map((item) => {
                      const vId = item.id || item.youtubeId;
                      const isSelected = youtubeId === vId;
                      return (
                        <div
                          key={vId}
                          onClick={() => handleSelectVideo(item)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-2.5 items-center group ${
                            isSelected
                              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
                              : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative h-14 w-20 bg-slate-900 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={`https://img.youtube.com/vi/${vId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="h-4 w-4 text-white fill-current" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.channel || 'YouTube'}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-rose-600">
                              {isSelected ? '✓ Đã chọn trích dẫn' : '+ Nhấn để trích dẫn'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hoặc Dán Đường Link YouTube Bất Kỳ
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* 2. DÁN LINK YOUTUBE */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Đường dẫn YouTube *
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        autoFetchYoutubeDetails(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:border-rose-500 focus:outline-none transition-all"
                    />
                    {isAutoFetching && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-spin" />
                    )}
                    {fetchSuccess && !isAutoFetching && (
                      <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * Hệ thống sẽ tự động lấy tiêu đề & tóm tắt video ngay khi bạn dán link.
                  </p>
                </div>

                {/* 3. THÔNG TIN TỰ ĐỘNG ĐIỀN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Tiêu đề video (Tự động) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tiêu đề sẽ tự động xuất hiện khi chọn hoặc dán link..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Phân loại bài giảng *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
                    >
                      <option value="clinical">Thực hành lâm sàng</option>
                      <option value="anatomy">Giải phẫu học</option>
                      <option value="lecture">Bài giảng lý thuyết</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mô tả / Tóm tắt nội dung video *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn nội dung để người xem nắm bắt trước khi xem..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <span className="text-[11px] text-slate-500">
                  Video sau khi ghim sẽ được đồng bộ chung cho toàn bộ thành viên.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <BookmarkCheck className="h-4 w-4" />
                    Ghim Trích Dẫn Vào Thư Viện
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
