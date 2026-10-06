import React, { useState, useRef } from 'react';
import { FileText, CheckCircle, Clock, BookOpen, Plus, ExternalLink, Download, Upload, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface AssessmentViewProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export default function AssessmentView({ user, onOpenAuth }: AssessmentViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const [fileUrl, setFileUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Sync assessments on mount
  React.useEffect(() => {
    fetch('/api/assessments')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuizzes(data);
      })
      .catch(console.error);
  }, []);

  const processFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleEdit = (quiz: any) => {
    setEditingId(quiz.id);
    setTitle(quiz.title);
    setUploadType('link');
    setFileUrl(quiz.fileUrl);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xóa bài kiểm tra này?')) {
      setQuizzes(prev => prev.filter(q => q.id !== id));
      fetch(`/api/assessments/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then((data) => { if (Array.isArray(data)) setQuizzes(data); })
        .catch(console.error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFileUrl('');
    setPdfFile(null);
    setUploadType('link');
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalUrl = fileUrl;
    if (uploadType === 'file' && pdfFile) {
      finalUrl = await processFileUpload(pdfFile);
    }

    if (!finalUrl || !title) return;

    const newQuiz = {
      id: editingId || ('q' + Date.now()),
      title,
      questionsCount: 15,
      timeLimit: '20 phút',
      level: 'Tiêu chuẩn',
      fileUrl: finalUrl
    };

    // Save to server
    fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuiz)
    })
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data)) setQuizzes(data);
    })
    .catch(() => {
      if (editingId) {
        setQuizzes(quizzes.map(q => q.id === editingId ? newQuiz : q));
      } else {
        setQuizzes([newQuiz, ...quizzes]);
      }
    });

    setShowAddModal(false);
    resetForm();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Kiểm Tra & Đánh Giá Năng Lực
          </h2>
          <p className="text-sm text-slate-500">
            Hệ thống bài tập trắc nghiệm và đánh giá năng lực lâm sàng tự động. 
          </p>
        </div>

        {user ? (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 shadow-xs transition-all cursor-pointer text-sm shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            Tạo Bài Kiểm Tra
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 transition-all cursor-pointer text-sm shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            Đăng nhập để Tạo Đề Thi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="inline-flex rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 px-2 py-0.5 text-xxs font-bold uppercase tracking-wider">
                  Mức độ: {quiz.level}
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(quiz)} className="text-blue-400 hover:text-blue-600 p-1" title="Sửa bài kiểm tra">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(quiz.id)} 
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Xóa bài kiểm tra"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-3 line-clamp-2">{quiz.title}</h3>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>{quiz.questionsCount} câu hỏi</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{quiz.timeLimit}</span>
                </div>
              </div>
            </div>

            <a 
              href={quiz.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-4 transition-all text-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Tải / Xem Đề Thi
            </a>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  {editingId ? 'Cập Nhật Bài Kiểm Tra' : 'Tạo Bài Kiểm Tra'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">X</button>
              </div>

              <form onSubmit={handleCreateTest} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên bài kiểm tra *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                    placeholder="Nhập tên bài thi..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">File Đề Thi (PDF / Link) *</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setUploadType('link')}
                      className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold border ${uploadType === 'link' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Nhập Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('file')}
                      className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold border ${uploadType === 'file' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Tải PDF
                    </button>
                  </div>

                  {uploadType === 'link' ? (
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      />
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      {pdfFile ? (
                        <p className="text-sm font-semibold text-indigo-700">{pdfFile.name}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">Kéo thả tệp PDF hoặc</p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                          >
                            Chọn tệp
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-sm transition-all">
                    {editingId ? 'Cập Nhật' : 'Tạo Bài Thi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
