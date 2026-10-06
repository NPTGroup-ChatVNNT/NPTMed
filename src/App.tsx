import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ShoppingBag, 
  Youtube, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LogIn,
  Sparkles,
  FileText,
  Hammer,
  Library,
  Activity,
  Database
} from 'lucide-react';

import { db, auth, initDB } from './firebase';
import { Ebook, ShopProduct, VideoItem, UserProfile } from './types';
import { BRANDING } from './branding';

// Subviews
import HomeView from './components/HomeView';
import EbooksFreeView from './components/EbooksFreeView';
import EbooksProView from './components/EbooksProView';
import ShopView from './components/ShopView';
import VideosView from './components/VideosView';
import AssessmentView from './components/AssessmentView';
import AuthModal from './components/AuthModal';
import ToolsView from './components/ToolsView';
import AssistantView from './components/AssistantView';
import AdminDashboardView from './components/AdminDashboardView';
import ProfileModal from './components/ProfileModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database lists
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [cart, setCart] = useState<{ product: ShopProduct; quantity: number }[]>([]);

  // Analytics Tracker
  useEffect(() => {
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email })
    }).catch(console.error);
  }, [user]);

  // Load state on mount
  useEffect(() => {
    const handleDbUpdated = () => {
      setEbooks(db.getEbooks());
      setProducts(db.getProducts());
      setVideos(db.getVideos());
    };

    window.addEventListener('db_updated', handleDbUpdated);

    initDB().then(() => {
      setUser(auth.getCurrentUser());
      setCart(db.getCart());
      
      // Initialize state with whatever is loaded immediately
      handleDbUpdated();
      setIsInitializing(false);
    });

    return () => {
      window.removeEventListener('db_updated', handleDbUpdated);
    };
  }, []);

  const handleSignInSuccess = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleSignOut = () => {
    auth.signOut();
    setUser(null);
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (user) {
      auth.updateProfile({ photoURL: newAvatarUrl });
      setUser({ ...user, photoURL: newAvatarUrl });
    }
  };

  const handleAddEbook = (book: Ebook) => {
    db.saveEbook(book);
    setEbooks(prev => {
      const index = prev.findIndex(b => b.id === book.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = book;
        return next;
      }
      return [book, ...prev];
    });
  };

  const handleDeleteEbook = (id: string) => {
    db.deleteEbook(id);
    setEbooks(prev => prev.filter(b => b.id !== id));
  };

  const handleAddVideo = (video: VideoItem) => {
    db.saveVideo(video);
    setVideos(prev => {
      const index = prev.findIndex(v => v.id === video.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = video;
        return next;
      }
      return [video, ...prev];
    });
  };

  const handleDeleteVideo = (id: string) => {
    db.deleteVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleAddProduct = (product: ShopProduct) => {
    db.saveProduct(product);
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = product;
        return next;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    db.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateCart = (newCart: { product: ShopProduct; quantity: number }[]) => {
    db.saveCart(newCart);
    setCart([...newCart]);
  };

  // Nav Links config
  const navLinks = [
    { id: 'home', label: 'Trang Chủ', icon: GraduationCap },
    { id: 'assistant', label: 'Trợ Lý AI', icon: Sparkles },
    { id: 'ebooks-free', label: 'Ebook Miễn Phí', icon: BookOpen },
    { id: 'ebooks-pro', label: 'Ebook Pro / Khóa Học', icon: ShieldCheck },
    { id: 'shop', label: 'Shop Y Khoa', icon: ShoppingBag },
    { id: 'videos', label: 'Video Học Liệu', icon: Youtube },
    { id: 'assessment', label: 'Kiểm Tra Đánh Giá', icon: FileText },
    { id: 'tools', label: 'Công Cụ', icon: Hammer },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Thống Kê Hệ Thống', icon: Activity }] : [])
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            user={user} 
            ebooks={ebooks} 
            videos={videos} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'admin':
        return <AdminDashboardView />;
      case 'assistant':
        return (
          <AssistantView
            user={user}
            ebooks={ebooks}
            videos={videos}
          />
        );
      case 'ebooks-free':
        return (
          <EbooksFreeView 
            user={user} 
            ebooks={ebooks} 
            onAddEbook={handleAddEbook} 
            onDeleteEbook={handleDeleteEbook} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'ebooks-pro':
        return (
          <EbooksProView 
            user={user} 
            ebooks={ebooks} 
            onAddEbook={handleAddEbook}
            onDeleteEbook={handleDeleteEbook}
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'shop':
        return (
          <ShopView 
            user={user} 
            products={products} 
            cart={cart} 
            onUpdateCart={handleUpdateCart} 
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'videos':
        return (
          <VideosView 
            user={user} 
            videos={videos} 
            onAddVideo={handleAddVideo} 
            onDeleteVideo={handleDeleteVideo} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'assessment':
        return (
          <AssessmentView 
            user={user} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        );
      case 'tools':
        return <ToolsView />;
      default:
        return <div className="text-center py-20 text-slate-500">Chức năng đang được cập nhật...</div>;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center p-1 overflow-hidden animate-pulse">
            <img 
              src={BRANDING.logoUrl} 
              alt={BRANDING.appName} 
              className="h-full w-full object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" id="app-container">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
            id="header-logo"
          >
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden p-0.5 group-hover:border-emerald-500 group-hover:shadow-sm transition-all">
              <img 
                src={BRANDING.logoUrl} 
                alt="NPTMed Logo" 
                className="h-full w-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                NPT<span className="text-emerald-600">Med</span>
              </span>
              <span className="text-xxs text-slate-400 font-bold uppercase tracking-wider block">Y Khoa Học Tập</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5" id="desktop-navbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-950'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* User Sign In and Admin Status */}
          <div className="hidden lg:flex items-center gap-3" id="desktop-auth-section">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-2.5 pr-4 rounded-xl">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="h-8 w-8 rounded-full border border-slate-200 cursor-pointer hover:opacity-80"
                  onClick={() => setIsProfileOpen(true)}
                  title="Tài khoản"
                />
                <div className="text-left space-y-0.5 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.displayName}</p>
                  <span className={`inline-block rounded-md px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {user.role === 'admin' ? 'Người Sáng Lập' : 'Học Viên'}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer ml-1"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-xs py-2 px-4 transition-all cursor-pointer"
                id="header-login-btn"
              >
                <LogIn className="h-4 w-4 text-slate-500" />
                Đăng Nhập
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-3">
            {user && (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="h-8 w-8 rounded-full border border-slate-200 cursor-pointer"
                onClick={() => setIsProfileOpen(true)}
              />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 bg-slate-50 border border-slate-100 text-slate-700"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-30 overflow-hidden"
            id="mobile-nav-panel"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {user ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs text-rose-600 font-bold"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
                  >
                    <LogIn className="h-4.5 w-4.5" /> Đăng nhập / Đăng ký
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'assistant' ? 'max-w-full px-0 py-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12'} ${activeTab === 'home' ? 'pb-20 md:pb-16' : ''}`} id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={activeTab === 'assistant' ? 'h-full flex flex-col' : ''}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer copyright section - Only on Home, fixed and compact */}
      {activeTab === 'home' && (
        <footer className="fixed bottom-0 w-full z-40 bg-slate-900 text-slate-400 py-3 border-t border-slate-800 shadow-lg" id="main-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img 
                src={BRANDING.logoUrl} 
                alt="NPTMed" 
                className="h-5 w-5 rounded object-contain bg-white/10 p-0.5" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-sm font-black text-white tracking-tight">NPT<span className="text-emerald-400">Med</span></span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300">v1.5</span>
              <p className="hidden md:block text-[10px] text-slate-500 ml-2">
                Thư Viện Học Liệu Y Khoa - Nguyễn Phi Trường
              </p>
            </div>
            <div className="text-[10px] text-slate-500">
              <p>© {new Date().getFullYear()} NPTMed. Dành riêng cho sự nghiệp Y học Việt Nam.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleSignInSuccess} 
      />

      {/* Global Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onUpdateAvatar={handleUpdateAvatar}
        onSignOut={handleSignOut}
      />

      {/* PWA Install Prompt Banner */}
      <PWAInstallPrompt />
    </div>
  );
}
