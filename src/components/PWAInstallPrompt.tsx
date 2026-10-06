import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { BRANDING } from '../branding';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check dismissed time (dismiss for 24h)
    const dismissedTime = localStorage.getItem('nptmed_pwa_dismissed_at');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 86400000) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 2.5s before showing to avoid disturbing initial page view
      setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari, show prompt after 3s if not standalone
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('nptmed_pwa_dismissed_at', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50"
      >
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 backdrop-blur-md space-y-3.5 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 p-0.5 overflow-hidden shrink-0 shadow-2xs">
              <img
                src={BRANDING.logoUrl}
                alt="NPTMed App"
                className="h-full w-full object-contain rounded-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                Đề Xuất Cài Đặt Web App
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                Cài Đặt NPTMed Về Màn Hình Chính
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mở ứng dụng mượt mà hơn, tra cứu học liệu tức thì mà không cần qua trình duyệt.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Download className="h-4 w-4" />
              {isIOS ? 'Xem Cách Thêm Vào MH Chính' : 'Cài Đặt Ứng Dụng Ngay'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Để sau
            </button>
          </div>

          {/* iOS Guide Popup inside */}
          {showIOSGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2"
            >
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                Hướng dẫn cài đặt trên iPhone / iPad (Safari):
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>
                  Bấm vào nút <strong>Chia sẻ (Share <Share className="inline h-3 w-3 text-blue-600" />)</strong> ở thanh dưới cùng của Safari.
                </li>
                <li>
                  Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (<PlusSquare className="inline h-3 w-3 text-slate-700" /> Add to Home Screen)</strong>.
                </li>
                <li>
                  Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
                </li>
              </ol>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
