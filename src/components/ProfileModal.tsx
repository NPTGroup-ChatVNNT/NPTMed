import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCircle, Key, LogOut, CheckCircle, Upload, Crown } from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUpdateAvatar: (url: string) => void;
  onSignOut: () => void;
}

export default function ProfileModal({ isOpen, user, onClose, onUpdateAvatar, onSignOut }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'pro'>('profile');
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [proKey, setProKey] = useState(() => localStorage.getItem("nptmed_gemini_key") || "");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync avatar state
  React.useEffect(() => {
    if (user) {
      setAvatarUrl(user.photoURL || '');
    }
  }, [user]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl) return;
    try {
      setIsLoading(true);
      await auth.updateProfile({ photoURL: avatarUrl });
      onUpdateAvatar(avatarUrl);
      setSuccess('Cập nhật Avatar thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPassword) return;

    try {
      setIsLoading(true);
      await auth.changePassword(oldPassword, newPassword);
      setSuccess('Thay đổi mật khẩu thành công. Ở lần đăng nhập sau hãy dùng mật khẩu mới!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Lỗi thay đổi mật khẩu');
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
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 z-10"
          >
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <UserCircle className="h-4 w-4" />
                Thông Tin
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${activeTab === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Key className="h-4 w-4" />
                Mật Khẩu
              </button>
              <button
                onClick={() => setActiveTab('pro')}
                className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${activeTab === 'pro' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/40' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Crown className="h-4 w-4 text-amber-500" />
                Gói Pro API
              </button>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-600 text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-600 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={avatarUrl || user.photoURL} 
                      alt="Avatar" 
                      className="h-20 w-20 rounded-full border-4 border-slate-50 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName)}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tải Ảnh Đại Diện</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Upload className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên hiển thị</label>
                    <input
                      type="text"
                      disabled
                      value={user.displayName}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-sm font-bold text-white shadow-sm transition-all flex justify-center mt-6"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Cập Nhật Avatar'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { onClose(); onSignOut(); }}
                    className="w-full rounded-xl bg-white border border-rose-200 hover:bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition-all flex justify-center items-center gap-2 mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng Xuất
                  </button>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mật khẩu cũ</label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Bỏ qua nếu bạn đăng nhập bằng Google.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-sm font-bold text-white shadow-sm transition-all flex justify-center mt-6"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                  </button>
                </form>
              )}

              {activeTab === 'pro' && (
                <div className="space-y-5 text-xs">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium leading-relaxed flex items-start gap-3 shadow-xs">
                    <Crown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-950 text-sm mb-1">
                        Gói Pro AI Y Khoa Không Giới Hạn (Phí 20.000đ/tháng)
                      </p>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        NPTMed cung cấp Key bản Pro tốc độ cao giúp bạn trò chuyện không giới hạn với AI Trợ Lý Y Khoa, loại bỏ hoàn toàn hạn ngạch 120 tin/ngày.
                      </p>
                    </div>
                  </div>

                  {/* Bank Details & QR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 items-center">
                    <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Mã Quét VietQR 20.000đ</p>
                      <img
                        src={`https://img.vietqr.io/image/MB-1224682222-compact2.png?amount=20000&addInfo=${encodeURIComponent(user?.email || 'GoiProNPTMed')}&accountName=NGUYEN%20PHI%20TRUONG`}
                        alt="Mã VietQR Thanh Toán"
                        className="w-36 h-36 object-contain rounded-lg"
                      />
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Ngân hàng</span>
                        <p className="font-bold text-slate-900">MB Bank (Ngân Hàng Quân Đội)</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Số tài khoản</span>
                        <p className="font-extrabold text-emerald-700 text-sm">1224682222</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Tên tài khoản</span>
                        <p className="font-bold text-slate-900 uppercase">NGUYEN PHI TRUONG</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Nội dung chuyển khoản</span>
                        <p className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block break-all">
                          {user?.email || 'Email của bạn'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Proof */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      Tải Ảnh Minh Chứng Chuyển Khoản
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            fetch('/api/key-orders', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                email: user?.email || 'user@nptmed.com',
                                proofImage: reader.result as string,
                                amount: 20000,
                                note: 'Đăng ký Key Pro từ Profile',
                              }),
                            })
                              .then((res) => res.json())
                              .then(() => {
                                setSuccess('Đã gửi ảnh minh chứng! Nhà phát hành sẽ kiểm tra và kích hoạt cho bạn.');
                              });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gemini API Key Pro Được Cấp</label>
                    <input
                      type="password"
                      placeholder="Dán Gemini Key Pro được Nhà phát hành cấp tại đây..."
                      value={proKey}
                      onChange={(e) => {
                        setProKey(e.target.value);
                        localStorage.setItem('nptmed_gemini_key', e.target.value);
                        setSuccess('Đã lưu API Key Pro thành công!');
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Chỉ sử dụng Key do Nhà phát hành NPTMed trực tiếp cung cấp để kích hoạt tính năng Pro.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
