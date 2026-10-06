import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, Lock, User, ShieldCheck, UserCircle, Upload, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { auth } from '../firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const emailInputId = useId();
  const passInputId = useId();
  const nameInputId = useId();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError('');
        // Fetch user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        const user = auth.signInWithGoogle(userInfo.email, userInfo.name, userInfo.picture);
        onSuccess(user);
        onClose();
      } catch (err: any) {
        setError('Đăng nhập Google thất bại.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Đăng nhập Google thất bại.'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        if (!email || !password || !displayName) {
          setError('Vui lòng điền đầy đủ thông tin.');
          setIsLoading(false);
          return;
        }
        const user = await auth.signUpWithEmail(email, password, displayName);
        onSuccess(user);
        onClose();
      } else if (mode === 'login') {
        if (!email || !password) {
          setError('Vui lòng nhập email và mật khẩu.');
          setIsLoading(false);
          return;
        }
        const user = await auth.signInWithEmail(email, password);
        onSuccess(user);
        onClose();
      } else if (mode === 'forgot_password') {
        if (!email) {
          setError('Vui lòng nhập email.');
          setIsLoading(false);
          return;
        }
        await auth.sendPasswordResetEmail(email);
        setSuccess('Mã OTP đã được gửi đến email (kiểm tra console hoặc dùng 123456 để test).');
        setMode('reset_password');
      } else if (mode === 'reset_password') {
        if (!email || !otp || !password) {
          setError('Vui lòng nhập đầy đủ thông tin.');
          setIsLoading(false);
          return;
        }
        await auth.resetPasswordWithOTP(email, otp, password);
        setSuccess('Đặt lại mật khẩu thành công!');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                {mode === 'register' ? 'Tạo tài khoản NPTMed' : 
                 mode === 'forgot_password' ? 'Khôi phục mật khẩu' :
                 mode === 'reset_password' ? 'Đặt lại mật khẩu' : 'Đăng nhập NPTMed'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                {mode === 'register' ? 'Tạo tài khoản để lưu trữ tài liệu và đồng bộ' : 
                 mode === 'forgot_password' ? 'Nhập email để nhận mã xác nhận (OTP)' :
                 mode === 'reset_password' ? 'Nhập mã OTP đã được gửi đến email của bạn' : 'Đăng nhập để tải lên tài liệu học tập và sử dụng công cụ y khoa.'}
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start gap-2 border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {(mode === 'register') && (
                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Họ & Tên
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id={nameInputId}
                      type="text"
                      required={mode === 'register'}
                      placeholder="Nguyễn Phi Trường"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {['login', 'register', 'forgot_password', 'reset_password'].includes(mode) && (
                <div>
                  <label htmlFor={emailInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id={emailInputId}
                      type="email"
                      required
                      disabled={mode === 'reset_password'}
                      autoComplete="email"
                      placeholder="TenCuaBan@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {mode === 'reset_password' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mã OTP (kiểm tra email)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Nhập 6 số OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {['login', 'register', 'reset_password'].includes(mode) && (
                <div>
                  <label htmlFor={passInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {mode === 'reset_password' ? 'Mật khẩu mới' : 'Mật khẩu'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id={passInputId}
                      type="password"
                      required
                      autoComplete={mode === 'register' ? "new-password" : "current-password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none disabled:opacity-70"
              >
                {isLoading ? 'Đang xử lý...' : (
                  mode === 'register' ? 'Tạo tài khoản' : 
                  mode === 'login' ? 'Đăng nhập' : 
                  mode === 'forgot_password' ? 'Gửi mã OTP' : 'Đặt lại mật khẩu'
                )}
              </button>
            </form>

            <div className="mt-4 text-center space-y-2 flex flex-col">
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setError(''); setSuccess(''); }}
                  className="text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 py-2.5 px-3 text-sm font-semibold text-slate-700 transition-all focus:outline-none shadow-sm disabled:opacity-70"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </button>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
