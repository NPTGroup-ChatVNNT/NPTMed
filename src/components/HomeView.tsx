import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Send, GraduationCap, ArrowRight, Library, BookOpen, ExternalLink, HelpCircle, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Ebook, VideoItem, UserProfile } from '../types';
import { BRANDING } from '../branding';

interface HomeViewProps {
  user: UserProfile | null;
  ebooks: Ebook[];
  videos: VideoItem[];
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export default function HomeView({ user, ebooks, videos, onNavigate, onOpenAuth }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'pubmed' | 'scholar' | 'cochrane'>('all');
  const searchInputId = useId();


  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let finalQuery = searchQuery.trim();
    if (searchScope === 'pubmed') {
      finalQuery += ' site:pubmed.ncbi.nlm.nih.gov OR site:ncbi.nlm.nih.gov';
    } else if (searchScope === 'scholar') {
      finalQuery += ' site:scholar.google.com';
    } else if (searchScope === 'cochrane') {
      finalQuery += ' site:cochranelibrary.com';
    }

    const url = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };



  return (
    <div className="space-y-12">
      {/* Hero Intro Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-700 to-indigo-900 text-white p-8 md:p-12 shadow-xl" id="home-intro-banner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_40%)]" />
        <div className="relative max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <GraduationCap className="h-4.5 w-4.5 text-emerald-300" />
            <span>Thành lập & Điều hành bởi Nguyễn Phi Trường</span>
          </div>

          <div className="flex items-center gap-4">
            <img 
              src={BRANDING.logoUrl} 
              alt={BRANDING.appName} 
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-lg object-contain shrink-0" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight" id="intro-title">
              Thư Viện Học Liệu <br />
              <span className="text-emerald-300">Y Khoa NPTMed</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-emerald-50 font-medium leading-relaxed max-w-2xl" id="intro-desc">
            "Thư Viện Học Liệu Y Khoa Do Nguyễn Phi Trường sáng lập và điều hành, là nơi chia sẻ kiến thức y khoa, cùng nhau nghiên cứu và học tập."
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onNavigate('ebooks-free')}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-900 shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
              id="intro-btn-free"
            >
              <Library className="h-4.5 w-4.5" />
              Tài Liệu Miễn Phí
            </button>
            <button
              onClick={() => onNavigate('ebooks-pro')}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500/30 transition-all cursor-pointer"
              id="intro-btn-pro"
            >
              <BookOpen className="h-4.5 w-4.5 text-emerald-300" />
              Ebook Pro Cao Cấp
            </button>
          </div>
        </div>
      </section>

      {/* Google Quick Search Integration Widget */}
      <section className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8" id="quick-search-section">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2" id="search-widget-title">
              <Search className="h-5 w-5 text-emerald-600 animate-pulse" />
              Tra Cứu Tài Liệu Y Học Nhanh
            </h2>
            <p className="text-xs text-slate-500">
              Nhập từ khóa lâm sàng hoặc danh từ chuyên môn để tra cứu trực tiếp qua thuật toán Google thông minh.
            </p>
          </div>

          <form onSubmit={handleGoogleSearch} className="space-y-4">
            {/* Search inputs */}
            <div className="relative flex items-center">
              <input
                id={searchInputId}
                type="text"
                placeholder="Ví dụ: nhồi máu cơ tim cấp phác đồ, giải phẫu dây thần kinh sọ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-5 pr-14 text-sm text-slate-900 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-600 hover:bg-emerald-700 p-2.5 text-white shadow-xs transition-all cursor-pointer"
                id="search-execute-btn"
                aria-label="Tìm kiếm"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scope selectors */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-slate-400 font-medium mr-1">Phạm vi:</span>
              <button
                type="button"
                onClick={() => setSearchScope('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${searchScope === 'all' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Google Web
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('pubmed')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${searchScope === 'pubmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                PubMed / NCBI
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('scholar')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${searchScope === 'scholar' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Google Scholar
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('cochrane')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${searchScope === 'cochrane' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Cochrane Library
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}
