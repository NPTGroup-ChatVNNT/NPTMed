import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Upload, CheckCircle2, Copy, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface ProKeyModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSaveKey?: (key: string) => void;
}

export default function ProKeyModal({ isOpen, user, onClose, onSaveKey }: ProKeyModalProps) {
  const [proKeyInput, setProKeyInput] = useState(() => localStorage.getItem('nptmed_gemini_key') || '');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [userEmailInput, setUserEmailInput] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  const userEmail = userEmailInput.trim().toLowerCase();

  // Bank Info
  const bankInfo = {
    bankName: "MB Bank (Ngân hàng Quân Đội)",
    accountNumber: "1224682222",
    accountName: "NGUYEN PHI TRUONG",
    amount: "20.000 VNĐ / 1 tháng",
    transferContent: userEmail || "Gmail của bạn",
  };

  const vietQrUrl = `https://img.vietqr.io/image/MB-1224682222-compact2.png?amount=20000&addInfo=${encodeURIComponent(userEmail || 'GoiProNPTMed')}&accountName=NGUYEN%20PHI%20TRUONG`;

  useEffect(() => {
    if (user?.email) {
      setUserEmailInput(user.email);
      fetchUserOrders(user.email);
    }
  }, [user]);

  const fetchUserOrders = (emailStr: string) => {
    if (!emailStr) return;
    fetch(`/api/key-orders/user/${encodeURIComponent(emailStr.trim().toLowerCase())}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUserOrders(data);
          // If approved with issuedKey, auto set in localStorage
          const approved = data.find((o) => o.status === 'approved' && o.issuedKey);
          if (approved?.issuedKey) {
            localStorage.setItem('nptmed_gemini_key', approved.issuedKey);
            setProKeyInput(approved.issuedKey);
            if (onSaveKey) onSaveKey(approved.issuedKey);
          }
        }
      })
      .catch(console.error);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("Dung lượng ảnh vượt quá 8MB. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      alert("Vui lòng nhập Email để Nhà phát hành kích hoạt Key!");
      return;
    }
    if (!proofImage) {
      alert("Vui lòng tải ảnh minh chứng chuyển khoản!");
      return;
    }

    setIsSubmitting(true);
    fetch('/api/key-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        proofImage,
        amount: 20000,
        note: 'Đăng ký Key Pro 20k/tháng',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSubmitting(false);
        if (data.success) {
          setSubmitSuccess(true);
          setProofImage(null);
          fetchUserOrders(userEmail);
        } else {
          alert(data.error || "Không thể gửi minh chứng. Vui lòng thử lại!");
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.error(err);
        alert("Lỗi kết nối máy chủ. Vui lòng thử lại!");
      });
  };

  const handleSaveProKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proKeyInput.trim()) {
      localStorage.removeItem('nptmed_gemini_key');
      if (onSaveKey) onSaveKey('');
      alert("Đã xóa Key Pro.");
      return;
    }
    localStorage.setItem('nptmed_gemini_key', proKeyInput.trim());
    if (onSaveKey) onSaveKey(proKeyInput.trim());
    alert("Đã lưu Key Pro thành công! Phiên làm việc đã mở khóa không giới hạn.");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Crown className="h-7 w-7 text-amber-200" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">Đăng Ký Key Pro Không Giới Hạn</h3>
                <p className="text-xs text-amber-100 mt-0.5 font-medium">
                  Phí duy trì chỉ 20.000đ / tháng • Hỗ trợ độc quyền bởi Nhà Phát Hành NPTMed
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Status Warning / Active Notice */}
            {proKeyInput ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Bạn Đã Kích Hoạt Key Bản Pro Tốc Độ Cao</p>
                    <p className="text-[11px] text-emerald-700">Tận hưởng trò chuyện AI Y Khoa không hạn ngạch tin nhắn.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(proKeyInput, 'prokey')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  {copiedField === 'prokey' ? 'Đã sao chép' : 'Sao chép Key'}
                </button>
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold text-amber-950">Lưu ý từ Nhà phát hành NPTMed:</strong>
                  <p className="mt-0.5 text-[11px] text-amber-800">
                    Hệ thống chỉ chấp nhận Key bản Pro được cấp bởi Nhà Phát Hành. Vui lòng thanh toán 20.000đ/tháng và tải ảnh chụp màn hình minh chứng chuyển khoản bên dưới.
                  </p>
                </div>
              </div>
            )}

            {/* Existing User Orders Status */}
            {userOrders.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Lịch Sử Đăng Ký Của Bạn ({userOrders.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {userOrders.map((ord) => (
                    <div key={ord.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{ord.createdAtStr}</p>
                        <p className="text-[11px] text-slate-500">{ord.note}</p>
                      </div>
                      <div>
                        {ord.status === 'pending' && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                            ⏳ Chờ xác nhận
                          </span>
                        )}
                        {ord.status === 'approved' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            ✅ Đã duyệt Pro
                          </span>
                        )}
                        {ord.status === 'rejected' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                            ❌ Từ chối
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 1: Thanh Toán Tự Động VietQR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              {/* VietQR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Quét Mã VietQR Chuyển Khoản</p>
                <img
                  src={vietQrUrl}
                  alt="Mã QR Chuyển Khoản 20k NPTMed"
                  className="w-44 h-44 object-contain rounded-xl border border-slate-100 shadow-xs"
                />
                <span className="text-[10px] text-emerald-600 font-bold mt-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Tự động điền 20.000 VNĐ & Email
                </span>
              </div>

              {/* Bank Details Text */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Ngân Hàng</span>
                  <p className="font-extrabold text-slate-900">{bankInfo.bankName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Số Tài Khoản</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-base text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                      {bankInfo.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(bankInfo.accountNumber, 'stk')}
                      className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors"
                      title="Sao chép STK"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {copiedField === 'stk' && <span className="text-[10px] text-emerald-600 font-bold">Đã chép!</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Tên Chủ Tài Khoản</span>
                  <p className="font-bold text-slate-900 uppercase">{bankInfo.accountName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Số Tiền</span>
                  <p className="font-extrabold text-amber-600 text-sm">{bankInfo.amount}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Nội Dung Chuyển Khoản</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 break-all">
                      {bankInfo.transferContent}
                    </span>
                    <button
                      onClick={() => handleCopy(bankInfo.transferContent, 'nd')}
                      className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors shrink-0"
                      title="Sao chép nội dung"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Upload Proof Image Form */}
            <form onSubmit={handleSubmitProof} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-amber-600" />
                Tải Ảnh Minh Chứng Chuyển Khoản (Xác Thực Tự Động)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Đăng Nhập Của Bạn</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: user@gmail.com"
                    value={userEmailInput}
                    onChange={(e) => setUserEmailInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn Ảnh Chuyển Khoản</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview image */}
              {proofImage && (
                <div className="relative w-full max-h-48 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                  <img src={proofImage} alt="Minh chứng chuyển khoản" className="max-h-44 object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Đã gửi ảnh minh chứng thành công! Nhà Phát Hành NPTMed sẽ kiểm tra và kích hoạt Key Pro cho email <strong>{userEmail}</strong>.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !proofImage}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Đang tải lên hệ thống...'
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Gửi Minh Chứng Chuyển Khoản Cho Nhà Phát Hành
                  </>
                )}
              </button>
            </form>

            {/* Section 3: Enter Issued Key Pro */}
            <form onSubmit={handleSaveProKey} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Nhập Key Pro Được Cấp Tới Email Của Bạn
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Dán Key Pro được Nhà phát hành cấp tại đây..."
                  value={proKeyInput}
                  onChange={(e) => setProKeyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Lưu Key Pro
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Lưu ý: Chỉ sử dụng Key do Nhà Phát Hành NPTMed trực tiếp cung cấp sau khi đã gửi minh chứng 20.000đ.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
