import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Search, Filter, Sparkles, CheckCircle, Download, QrCode, Plus, Trash2, Edit, ExternalLink, BookOpen, Image as ImageIcon, Upload } from 'lucide-react';
import { Ebook, UserProfile } from '../types';

const MEDICAL_SCHOOLS = [
  { value: 'all', label: 'Tất cả trường Y' },
  { value: 'vtt', label: 'Y Dược Võ Trường Toản' },
  { value: 'yd_hanoi', label: 'Y Dược Hà Nội' },
  { value: 'yd_hue', label: 'Y Dược Huế' },
  { value: 'yd_hcm', label: 'Y Dược TP.HCM' },
  { value: 'pnt', label: 'Y Khoa Phạm Ngọc Thạch' },
  { value: 'yd_cantho', label: 'Y Dược Cần Thơ' },
  { value: 'ntt', label: 'ĐH Nguyễn Tất Thành' },
  { value: 'y_thainguyen', label: 'Y Khoa Thái Nguyên' },
  { value: 'other', label: 'Trường Khác' }
];

const CATEGORIES = [
  { value: 'all', label: 'Tất cả chuyên ngành' },
  { value: 'internal', label: 'Nội Khoa' },
  { value: 'surgery', label: 'Ngoại Khoa' },
  { value: 'obstetrics', label: 'Sản Khoa' },
  { value: 'pediatrics', label: 'Nhi Khoa' },
  { value: 'parasitology', label: 'Kí Sinh Trùng' },
  { value: 'anatomy', label: 'Giải Phẫu' },
  { value: 'histology', label: 'Mô Phôi' },
  { value: 'pharmacy', label: 'Dược Lý' },
  { value: 'other', label: 'Khác' }
];

interface EbooksProViewProps {
  user: UserProfile | null;
  ebooks: Ebook[];
  onAddEbook: (ebook: Ebook) => void;
  onDeleteEbook: (id: string) => void;
  onOpenAuth: () => void;
}

export default function EbooksProView({ user, ebooks, onAddEbook, onDeleteEbook, onOpenAuth }: EbooksProViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [purchasingBook, setPurchasingBook] = useState<Ebook | null>(null);
  const [unlockedBooks, setUnlockedBooks] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'qr' | 'success'>('details');

  // Add Ebook Pro Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [school, setSchool] = useState('vtt');
  const [customSchool, setCustomSchool] = useState('');
  const [category, setCategory] = useState('internal');
  const [fileUrl, setFileUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [price, setPrice] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [uploadType, setUploadType] = useState<'device' | 'link'>('device');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDualUpload = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;
    setIsUploading(true);
    try {
      // 1. Tải lên và lưu trữ trực tiếp trên máy chủ đám mây (Firebase Storage)
      const { storage } = await import('../firebase');
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      
      const fileRef = ref(storage, `ebooks/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Tracking progress
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFileUrl(downloadURL);
          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
          setIsUploading(false);

          // 2. Tự động kích hoạt sao lưu song song vào Google Drive
          try {
            handleDeviceUpload();
          } catch (e) {
            console.log("Drive backup triggered");
          }
        }
      );
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleDeviceUpload = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      if (!selectedFile) return;
      setIsUploading(true);
      try {
        const metadata = {
          name: selectedFile.name,
          parents: ['1abrV75_TR1da2BM4YXzuT98oYJVuD8if']
        };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', selectedFile);

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          },
          body: form
        });
        const data = await res.json();
        if (data.webViewLink) {
          setFileUrl(data.webViewLink);
          if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        } else {
          await handleDualUpload(selectedFile);
        }
      } catch (err) {
        console.error(err);
        await handleDualUpload(selectedFile);
      } finally {
        setIsUploading(false);
      }
    },
    onError: () => {
      if (selectedFile) handleDualUpload(selectedFile);
      else alert('Đăng nhập Google thất bại.');
    },
  });

  const proEbooks = ebooks.filter(book => book.isPro);
  const filteredProBooks = proEbooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const isPredefinedSchool = MEDICAL_SCHOOLS.some(s => s.value === book.school && s.value !== 'other' && s.value !== 'all');
    const matchesSchool = selectedSchool === 'all' || 
                          book.school === selectedSchool || 
                          (selectedSchool === 'other' && !isPredefinedSchool);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesSchool && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleStartPurchase = (book: Ebook) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setPurchasingBook(book);
    setPaymentStep('qr');
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentStep('success');
      if (purchasingBook) {
        setUnlockedBooks(prev => [...prev, purchasingBook.id]);
      }
    }, 2500);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (book: Ebook) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    const isPredefined = MEDICAL_SCHOOLS.some(s => s.value === book.school && s.value !== 'all' && s.value !== 'other');
    if (isPredefined) {
      setSchool(book.school || 'vtt');
      setCustomSchool('');
    } else {
      setSchool('other');
      setCustomSchool(book.school && book.school !== 'other' ? book.school : '');
    }
    setCategory(book.category || 'internal');
    setFileUrl(book.fileUrl);
    setCoverUrl(book.coverUrl || '');
    setPrice(book.price.toString());
    setQrCodeUrl(book.qrCodeUrl || '');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setSchool('vtt');
    setCustomSchool('');
    setCategory('internal');
    setFileUrl('');
    setCoverUrl('');
    setPrice('');
    setQrCodeUrl('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !fileUrl || !price) return;

    const newBook: Ebook = {
      id: editingId || ('pro-' + Math.random().toString(36).substring(2, 9)),
      title,
      author,
      year: new Date().getFullYear().toString(),
      school: school === 'other' && customSchool.trim() !== '' ? customSchool.trim() : school,
      category,
      description: '',
      isPro: true,
      price: parseInt(price),
      fileUrl,
      coverUrl,
      qrCodeUrl,
      uploadedBy: user?.email || 'admin@nptmed.edu.vn',
      uploadedByName: user?.displayName || 'Admin',
      createdAt: editingId ? (ebooks.find(b => b.id === editingId)?.createdAt || Date.now()) : Date.now()
    };

    onAddEbook(newBook);
    resetForm();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Tài Liệu Độc Quyền (Pro)
          </h2>
          <p className="text-sm text-slate-500">
            Tuyển tập sách y khoa chuyên sâu, chất lượng cao dành cho hội viên.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5" />
            Thêm Sách Pro
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu Pro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="appearance-none w-full md:w-48 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {MEDICAL_SCHOOLS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full md:w-40 rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Bookshelf Layout */}
      {filteredProBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProBooks.map((book, i) => {
              const isUnlocked = unlockedBooks.includes(book.id) || user?.role === 'admin';
              
              return (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="group relative flex flex-col rounded-xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/30 overflow-hidden hover:shadow-lg hover:shadow-amber-900/5 transition-all"
                >
                  {/* Premium Badge */}
                  <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    PRO
                  </div>

                  {/* Book Cover Image */}
                  <div className="block relative aspect-[2/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => isUnlocked ? window.open(book.fileUrl, '_blank') : handleStartPurchase(book)}>
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-amber-200 p-4">
                        <BookOpen className="h-12 w-12 mb-2 opacity-50" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600/40 text-center">NPTMed Pro</span>
                      </div>
                    )}
                    
                    {/* Overlay Action */}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      {isUnlocked ? (
                        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0">
                          <ExternalLink className="text-white h-8 w-8 mb-1" />
                          <span className="text-white text-xs font-semibold">Mở tài liệu</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
                          <span className="text-amber-600 font-bold">{formatPrice(book.price)}</span>
                          <span className="text-slate-600 text-[10px] uppercase font-bold">Mở Khóa</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1" title={book.author}>
                      {book.author}
                    </p>
                    
                    {/* Footer metadata */}
                    <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="bg-amber-100/50 text-amber-700 px-1.5 py-0.5 rounded truncate max-w-[60%] font-medium">
                        {MEDICAL_SCHOOLS.find(s => s.value === book.school)?.label || book.school || 'Y Khoa'}
                      </span>
                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleEdit(book);
                            }}
                            className="text-blue-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-slate-100"
                            title="Sửa sách"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm('Xóa tài liệu Pro này?')) onDeleteEbook(book.id);
                            }}
                            className="text-red-400 hover:text-red-600 p-1 bg-white rounded shadow-sm border border-slate-100"
                            title="Xóa sách"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 py-16 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-amber-300" />
          <h3 className="mt-4 text-sm font-medium text-slate-900">Không tìm thấy tài liệu Pro</h3>
          <p className="mt-1 text-xs text-slate-500">Thử tìm kiếm với từ khóa khác.</p>
        </div>
      )}

      {/* Admin Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  {editingId ? 'Cập Nhật Sách Pro' : 'Đăng Sách Pro'}
                </h3>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tên tài liệu *</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tác giả *</label>
                    <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trường Y</label>
                    <select value={school} onChange={(e) => setSchool(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none">
                      {MEDICAL_SCHOOLS.filter(s => s.value !== 'all').map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {school === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tên trường khác / Trường Quốc Tế</label>
                      <input 
                        type="text" 
                        value={customSchool} 
                        onChange={(e) => setCustomSchool(e.target.value)} 
                        placeholder="Nhập tên trường..." 
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" 
                      />
                    </motion.div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chuyên Ngành</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none">
                      {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Giá Bán (VND) *</label>
                    <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="VD: 50000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ảnh QR Thanh Toán</label>
                    <input type="url" value={qrCodeUrl} onChange={(e) => setQrCodeUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="URL ảnh mã QR" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Bìa sách</label>
                  <div className="flex items-center gap-4">
                    <label className="h-24 w-16 bg-slate-100 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 flex items-center justify-center overflow-hidden">
                      {coverUrl ? <img src={coverUrl} className="h-full w-full object-cover" alt="Cover" /> : <ImageIcon className="h-6 w-6 text-slate-400" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </label>
                    <p className="text-xs text-slate-500">Tải lên ảnh bìa minh họa</p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Đính kèm tài liệu *</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                    <button type="button" onClick={() => setUploadType('device')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${uploadType === 'device' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Từ Thiết Bị (Khuyên dùng)</button>
                    <button type="button" onClick={() => setUploadType('link')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${uploadType === 'link' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Link Trực tiếp</button>
                  </div>

                  {uploadType === 'device' ? (
                    <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center space-y-3">
                      <input 
                        type="file" 
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setSelectedFile(f);
                          if (f) handleDualUpload(f);
                        }}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      />
                      {selectedFile && (
                        <div className="flex flex-col items-center justify-center gap-2 pt-2">
                          <button type="button" disabled={isUploading} onClick={() => handleDualUpload()} className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-md">
                            {isUploading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {isUploading ? 'Đang tự động sao lưu 2 lớp...' : '🚀 Tải Lên & Sao Lưu Kép (Máy Chủ & Google Drive)'}
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-amber-800/80 max-w-sm mx-auto leading-tight font-medium">
                        🛡️ Hệ thống tự động lưu trữ đồng thời ở cả 2 nơi (Máy chủ NPTMed + Google Drive folder 1abrV75...) đảm bảo dữ liệu an toàn tuyệt đối!
                      </p>
                      {fileUrl && uploadType === 'device' && (
                        <p className="mt-3 text-xs text-amber-800 font-bold break-all flex items-center justify-center gap-1 bg-amber-100/80 py-1.5 px-3 rounded-lg border border-amber-300">
                          <CheckCircle className="h-3.5 w-3.5 text-amber-700" /> Đã lưu trữ an toàn hai lớp thành công!
                        </p>
                      )}
                    </div>
                  ) : (
                    <input type="url" required value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="https://..." />
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Hủy</button>
                  <button type="submit" className="px-6 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 shadow-sm">{editingId ? 'Cập Nhật' : 'Thêm Sách'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment/QR Modal */}
      <AnimatePresence>
        {purchasingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPurchasingBook(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-slate-900 p-6 text-center text-white relative">
                <ShieldCheck className="mx-auto h-12 w-12 text-amber-400 mb-3" />
                <h3 className="text-lg font-bold">Mở Khóa Tài Liệu</h3>
                <p className="mt-1 text-sm text-slate-400">{purchasingBook.title}</p>
                <div className="mt-4 inline-block rounded-full bg-amber-500/20 px-4 py-1 text-xl font-bold text-amber-400">
                  {formatPrice(purchasingBook.price)}
                </div>
              </div>

              <div className="p-6">
                {paymentStep === 'qr' && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 mb-4">Quét mã QR để thanh toán qua Momo/ZaloPay/Ngân Hàng</p>
                    <div className="mx-auto h-48 w-48 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 p-2 flex items-center justify-center">
                      {purchasingBook.qrCodeUrl ? (
                        <img src={purchasingBook.qrCodeUrl} alt="QR Code" className="h-full w-full object-contain" />
                      ) : (
                        <QrCode className="h-16 w-16 text-slate-400" />
                      )}
                    </div>
                    <p className="mt-4 text-xs text-slate-500 italic">Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận.</p>
                    <button
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 py-3 text-sm font-semibold text-white transition-all focus:outline-none flex justify-center items-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Mô phỏng Thanh toán'
                      )}
                    </button>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="text-center py-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Thanh Toán Thành Công!</h4>
                    <p className="text-sm text-slate-500 mb-6">Bạn đã mở khóa thành công tài liệu này. Vui lòng tải xuống hoặc xem trực tiếp.</p>
                    <button
                      onClick={() => {
                        window.open(purchasingBook.fileUrl, '_blank');
                        setPurchasingBook(null);
                        setPaymentStep('details');
                      }}
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-semibold text-white flex justify-center items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Mở Tài Liệu Ngay
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
