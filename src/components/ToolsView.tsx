import React, { useState, useMemo, useRef } from 'react';
import { 
  Hammer, 
  Scale, 
  Activity, 
  Droplet, 
  BrainCircuit, 
  ActivitySquare, 
  User, 
  TestTube, 
  Syringe, 
  Wind, 
  Search, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Heart,
  Stethoscope,
  Upload,
  Camera,
  Loader2,
  FileText,
  Volume2,
  ArrowRightLeft,
  Clock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ToolDef {
  id: string;
  title: string;
  category: 'emergency' | 'lab' | 'clinical';
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

export default function ToolsView() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toolsList: ToolDef[] = [
    {
      id: 'ecg-ai',
      title: 'Phân Tích Điện Tim (ECG AI)',
      category: 'emergency',
      description: 'Tải ảnh điện tim 12 chuyển đạo để AI phân tích nhịp, trục, ST-T và tổn thương',
      badge: 'Trí Tuệ Nhân Tạo',
      icon: <Heart className="h-6 w-6 text-rose-500" />
    },
    {
      id: 'lung-exam',
      title: 'Hướng Dẫn Vị Trí Nghe Phổi',
      category: 'clinical',
      description: 'Bản đồ vị trí nghe phổi trước & sau, rì rào phế nang, ran ẩm, ran rít, ran ngáy',
      badge: 'Mô hình lâm sàng',
      icon: <Stethoscope className="h-6 w-6 text-cyan-600" />
    },
    {
      id: 'heart-exam',
      title: 'Hướng Dẫn Vị Trí Nghe Tim',
      category: 'clinical',
      description: '5 ổ nghe tim kinh điển: ĐMC, ĐMP, Erb, 3 lá, 2 lá & các tiếng thổi bệnh lý',
      badge: 'Mô hình lâm sàng',
      icon: <Activity className="h-6 w-6 text-rose-600" />
    },
    {
      id: 'syringe',
      title: 'Tính Liều Bơm Tiêm Điện',
      category: 'emergency',
      description: 'Tính 2 chiều: Liều ➔ mL/h hoặc Truy ngược từ mL/h ➔ Liều thực nhận',
      badge: 'Tính 2 chiều',
      icon: <Syringe className="h-6 w-6 text-indigo-500" />
    },
    {
      id: 'fluid',
      title: 'Tính Tốc Độ Truyền Dịch',
      category: 'emergency',
      description: 'Tính 2 chiều: mL & giờ ➔ Giọt/phút hoặc Truy ngược số giọt ➔ Thời gian hết dịch',
      badge: 'Tính 2 chiều',
      icon: <Droplet className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'abg',
      title: 'Khí Máu Động Mạch (ABG)',
      category: 'emergency',
      description: 'Phân tích toan kiềm, bù trừ hô hấp/chuyển hóa, Anion Gap và PaO2',
      badge: 'Lâm sàng ICU',
      icon: <Wind className="h-6 w-6 text-amber-500" />
    },
    {
      id: 'cbc',
      title: 'Phân Tích Công Thức Máu (CBC)',
      category: 'lab',
      description: 'Đánh giá hồng cầu (MCV, MCH), bạch cầu phân dòng (NEU, LYM), tiểu cầu PLT',
      badge: 'Huyết học chi tiết',
      icon: <TestTube className="h-6 w-6 text-emerald-500" />
    },
    {
      id: 'bmi',
      title: 'Tính Chỉ Số BMI',
      category: 'clinical',
      description: 'Chỉ số khối cơ thể và phân loại cân nặng theo chuẩn IDI & WHO châu Á',
      icon: <Scale className="h-6 w-6 text-teal-500" />
    },
    {
      id: 'gcs',
      title: 'Thang Điểm Hôn Mê Glasgow (GCS)',
      category: 'emergency',
      description: 'Đánh giá mức độ tri giác: Mắt (E) - Lời nói (V) - Vận động (M)',
      icon: <BrainCircuit className="h-6 w-6 text-amber-500" />
    },
    {
      id: 'gestational',
      title: 'Tính Tuổi Thai & Dự Kiến Sinh',
      category: 'clinical',
      description: 'Tính theo ngày kinh chót (Naegele) hoặc theo kết quả siêu âm quý 1',
      icon: <ActivitySquare className="h-6 w-6 text-pink-500" />
    },
    {
      id: 'glucose',
      title: 'Quy Đổi Chỉ Số Glucose',
      category: 'lab',
      description: 'Chuyển đổi nồng độ đường huyết giữa mmol/L và mg/dL',
      icon: <Activity className="h-6 w-6 text-orange-500" />
    },
    {
      id: 'anatomy3d',
      title: 'Mô Hình Giải Phẫu 3D',
      category: 'clinical',
      description: 'Khám phá trực quan hệ xương, cơ và cơ quan nội tạng tương tác',
      icon: <User className="h-6 w-6 text-purple-500" />
    }
  ];

  const filteredTools = useMemo(() => {
    return toolsList.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Hammer className="h-6 w-6 text-emerald-600" />
            Công Cụ Y Khoa Lâm Sàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bộ công cụ lâm sàng chuyên sâu: Phân tích điện tim AI, nghe tim phổi, bơm tiêm điện 2 chiều, ABG và CBC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Tổng cộng: {toolsList.length} công cụ
          </span>
        </div>
      </div>

      {/* Tìm Công Cụ & Bộ Lọc Thể Loại */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm nhanh công cụ: điện tim, nghe phổi, nghe tim, bơm tiêm, truyền dịch, khí máu, CBC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({toolsList.length})
          </button>
          <button
            onClick={() => setSelectedCategory('emergency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'emergency'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Hồi sức & Cấp cứu
          </button>
          <button
            onClick={() => setSelectedCategory('clinical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'clinical'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
            }`}
          >
            Thăm khám lâm sàng
          </button>
          <button
            onClick={() => setSelectedCategory('lab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'lab'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Xét nghiệm & Cận lâm sàng
          </button>
        </div>
      </div>

      {/* Grid danh sách công cụ */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div 
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              {tool.badge && (
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  tool.badge === 'Trí Tuệ Nhân Tạo' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  tool.badge.includes('2 chiều') ? 'bg-indigo-100 text-indigo-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {tool.badge}
                </span>
              )}

              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-white transition-all shadow-2xs">
                  {tool.icon}
                </div>
                <div className="pr-6">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                <span>Mở công cụ tính</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Hammer className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy công cụ phù hợp</h4>
          <p className="text-xs text-slate-400">
            Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bấm nút "Tất cả" để xem danh sách đầy đủ.
          </p>
        </div>
      )}

      {/* Modal Tool Popup */}
      <AnimatePresence>
        {activeTool && (
          <ToolModal toolId={activeTool} onClose={() => setActiveTool(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// TOOL MODAL DIALOG COMPONENT
// ==========================================
function ToolModal({ toolId, onClose }: { toolId: string; onClose: () => void }) {
  // 1. ECG AI Analysis State
  const [ecgImage, setEcgImage] = useState<string | null>(null);
  const [ecgNotes, setEcgNotes] = useState('');
  const [isAnalyzingEcg, setIsAnalyzingEcg] = useState(false);
  const [ecgAnalysisResult, setEcgAnalysisResult] = useState<string | null>(null);
  const [ecgError, setEcgError] = useState<string | null>(null);
  const ecgFileInputRef = useRef<HTMLInputElement>(null);

  // 2. Lung Exam State
  const [lungSide, setLungSide] = useState<'anterior' | 'posterior'>('anterior');
  const [selectedLungPoint, setSelectedLungPoint] = useState<string>('apex');

  // 3. Heart Exam State
  const [selectedHeartPoint, setSelectedHeartPoint] = useState<string>('mitral');

  // 4. Syringe Pump Calculator State (2-way)
  const [syringeMode, setSyringeMode] = useState<'forward' | 'reverse'>('forward');
  const [syringeDrug, setSyringeDrug] = useState('noradrenaline');
  const [patientWeight, setPatientWeight] = useState('60');
  const [drugDosePrescribed, setDrugDosePrescribed] = useState('0.1'); // mcg/kg/min
  const [totalDrugAmount, setTotalDrugAmount] = useState('4'); // mg
  const [syringeVolume, setSyringeVolume] = useState('50'); // mL
  const [currentMachineRate, setCurrentMachineRate] = useState('3.75'); // mL/h in reverse mode
  const [syringeResult, setSyringeResult] = useState<any>(null);

  // 5. Fluid Infusion Calculator State (2-way)
  const [fluidMode, setFluidMode] = useState<'forward' | 'reverse'>('forward');
  const [fluidVol, setFluidVol] = useState('500');
  const [fluidTime, setFluidTime] = useState('8');
  const [dropFactor, setDropFactor] = useState(20);
  const [currentDropRate, setCurrentDropRate] = useState('21'); // drops/min for reverse mode
  const [fluidResult, setFluidResult] = useState<any>(null);

  // Other Tools (BMI, GCS, Gestational, Glucose, CBC, ABG)
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<any>(null);

  const [gcsEye, setGcsEye] = useState<number>(4);
  const [gcsVerbal, setGcsVerbal] = useState<number>(5);
  const [gcsMotor, setGcsMotor] = useState<number>(6);

  const [lmpDate, setLmpDate] = useState('');
  const [gestationalAge, setGestationalAge] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);

  const [glucoseVal, setGlucoseVal] = useState('');
  const [glucoseUnit, setGlucoseUnit] = useState<'mmol' | 'mg'>('mmol');
  const [convertedGlucose, setConvertedGlucose] = useState<string | null>(null);

  const [abgPh, setAbgPh] = useState('');
  const [abgPaco2, setAbgPaco2] = useState('');
  const [abgHco3, setAbgHco3] = useState('');
  const [abgPao2, setAbgPao2] = useState('');
  const [abgNa, setAbgNa] = useState('');
  const [abgCl, setAbgCl] = useState('');
  const [abgResult, setAbgResult] = useState<any>(null);

  const [cbcRbc, setCbcRbc] = useState('');
  const [cbcHb, setCbcHb] = useState('');
  const [cbcHct, setCbcHct] = useState('');
  const [cbcMcv, setCbcMcv] = useState('');
  const [cbcMch, setCbcMch] = useState('');
  const [cbcMchc, setCbcMchc] = useState('');
  const [cbcRdw, setCbcRdw] = useState('');
  const [cbcWbc, setCbcWbc] = useState('');
  const [cbcNeu, setCbcNeu] = useState('');
  const [cbcLym, setCbcLym] = useState('');
  const [cbcPlt, setCbcPlt] = useState('');
  const [cbcResult, setCbcResult] = useState<any>(null);

  // ===================== LOGIC CALCULATORS =====================
  // Handle ECG Image Upload
  const handleEcgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEcgImage(event.target?.result as string);
      setEcgAnalysisResult(null);
      setEcgError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeEcg = async () => {
    if (!ecgImage && !ecgNotes.trim()) {
      alert('Vui lòng tải lên hình ảnh điện tim hoặc nhập thông số ghi nhận!');
      return;
    }

    setIsAnalyzingEcg(true);
    setEcgError(null);
    setEcgAnalysisResult(null);

    try {
      const personalKey = localStorage.getItem('nptmed_gemini_key') || '';
      const response = await fetch('/api/gemini/ecg-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: ecgImage,
          notes: ecgNotes,
          personalApiKey: personalKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi xử lý điện tim');
      }

      setEcgAnalysisResult(data.text);
    } catch (err: any) {
      setEcgError(err.message || 'Không thể phân tích điện tim lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsAnalyzingEcg(false);
    }
  };

  // Syringe Pump Calculator (2-WAY)
  const calculateSyringe = () => {
    const weight = parseFloat(patientWeight);
    const totalMg = parseFloat(totalDrugAmount);
    const vol = parseFloat(syringeVolume);

    if (!weight || !totalMg || !vol) {
      alert('Vui lòng nhập đủ Cân nặng, Tổng lượng thuốc và Thể tích bơm');
      return;
    }

    const totalMcg = totalMg * 1000;
    const concentrationMcgPerMl = totalMcg / vol;
    const concentrationMgPerMl = totalMg / vol;

    if (syringeMode === 'forward') {
      // Forward: Dose -> Rate (mL/h)
      const dose = parseFloat(drugDosePrescribed);
      if (isNaN(dose)) {
        alert('Vui lòng nhập liều chỉ định');
        return;
      }

      let rateMlPerHour = 0;
      let unitLabel = 'mcg/kg/phút';

      if (['noradrenaline', 'adrenaline', 'dopamine', 'dobutamine'].includes(syringeDrug)) {
        const totalMcgPerHour = dose * weight * 60;
        rateMlPerHour = +(totalMcgPerHour / concentrationMcgPerMl).toFixed(2);
        unitLabel = 'mcg/kg/phút';
      } else if (syringeDrug === 'nitroglycerin') {
        const totalMcgPerHour = dose * 60;
        rateMlPerHour = +(totalMcgPerHour / concentrationMcgPerMl).toFixed(2);
        unitLabel = 'mcg/phút';
      } else if (syringeDrug === 'propofol') {
        const totalMgPerHour = dose * weight;
        rateMlPerHour = +(totalMgPerHour / concentrationMgPerMl).toFixed(2);
        unitLabel = 'mg/kg/giờ';
      } else {
        const totalMcgPerHour = dose * weight * 60;
        rateMlPerHour = +(totalMcgPerHour / concentrationMcgPerMl).toFixed(2);
        unitLabel = 'mcg/kg/phút';
      }

      const durationHours = +(vol / rateMlPerHour).toFixed(1);

      setSyringeResult({
        mode: 'forward',
        rateMlPerHour,
        unitLabel,
        concentrationMcgPerMl: concentrationMcgPerMl.toFixed(1),
        concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
        durationHours,
        dose
      });
    } else {
      // Reverse: Machine Rate (mL/h) -> Dose
      const rate = parseFloat(currentMachineRate);
      if (isNaN(rate) || rate <= 0) {
        alert('Vui lòng nhập tốc độ đang chạy trên máy (mL/h)');
        return;
      }

      const deliveredMcgPerHour = rate * concentrationMcgPerMl;
      const deliveredMgPerHour = rate * concentrationMgPerMl;

      let calculatedDose = 0;
      let unitLabel = 'mcg/kg/phút';

      if (['noradrenaline', 'adrenaline', 'dopamine', 'dobutamine'].includes(syringeDrug)) {
        // dose = totalMcgPerHour / (weight * 60)
        calculatedDose = +(deliveredMcgPerHour / (weight * 60)).toFixed(3);
        unitLabel = 'mcg/kg/phút';
      } else if (syringeDrug === 'nitroglycerin') {
        calculatedDose = +(deliveredMcgPerHour / 60).toFixed(2);
        unitLabel = 'mcg/phút';
      } else if (syringeDrug === 'propofol') {
        calculatedDose = +(deliveredMgPerHour / weight).toFixed(2);
        unitLabel = 'mg/kg/giờ';
      } else {
        calculatedDose = +(deliveredMcgPerHour / (weight * 60)).toFixed(3);
        unitLabel = 'mcg/kg/phút';
      }

      const durationHours = +(vol / rate).toFixed(1);

      setSyringeResult({
        mode: 'reverse',
        rateMlPerHour: rate,
        calculatedDose,
        unitLabel,
        concentrationMcgPerMl: concentrationMcgPerMl.toFixed(1),
        concentrationMgPerMl: concentrationMgPerMl.toFixed(2),
        durationHours,
        deliveredMgPerHour: deliveredMgPerHour.toFixed(2)
      });
    }
  };

  // Fluid Infusion Calculator (2-WAY)
  const calculateFluid = () => {
    const vol = parseFloat(fluidVol);
    if (!vol || vol <= 0) {
      alert('Vui lòng nhập Tổng thể tích dịch (mL)');
      return;
    }

    if (fluidMode === 'forward') {
      // Forward: Vol + Time -> Drop rate (drops/min)
      const hrs = parseFloat(fluidTime);
      if (!hrs || hrs <= 0) {
        alert('Vui lòng nhập thời gian truyền (giờ)');
        return;
      }
      const rate = Math.round((vol * dropFactor) / (hrs * 60));
      const mlPerHour = +(vol / hrs).toFixed(1);
      setFluidResult({
        mode: 'forward',
        dropRate: rate,
        mlPerHour,
        hrs
      });
    } else {
      // Reverse: Vol + Drop rate -> Time to finish
      const dropsPerMin = parseFloat(currentDropRate);
      if (!dropsPerMin || dropsPerMin <= 0) {
        alert('Vui lòng nhập tốc độ giọt/phút đếm được');
        return;
      }

      // total minutes = (vol * dropFactor) / dropsPerMin
      const totalMinutes = Math.round((vol * dropFactor) / dropsPerMin);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const mlPerHour = +((dropsPerMin * 60) / dropFactor).toFixed(1);

      // Finish time from now
      const now = new Date();
      now.setMinutes(now.getMinutes() + totalMinutes);
      const finishTimeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      setFluidResult({
        mode: 'reverse',
        totalMinutes,
        hours,
        minutes,
        mlPerHour,
        finishTimeString,
        dropsPerMin
      });
    }
  };

  // BMI Calculator
  const calculateBMI = () => {
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmi = +(w / (h * h)).toFixed(1);
    let classification = '';
    if (bmi < 18.5) classification = 'Thiếu cân (Gầy)';
    else if (bmi < 23) classification = 'Bình thường (Chuẩn châu Á IDI&WPRO)';
    else if (bmi < 25) classification = 'Thừa cân (Tiền béo phì)';
    else if (bmi < 30) classification = 'Béo phì độ I';
    else classification = 'Béo phì độ II trở lên';

    const minWeight = +(18.5 * h * h).toFixed(1);
    const maxWeight = +(22.9 * h * h).toFixed(1);

    setBmiResult({ bmi, classification, idealRange: `${minWeight} - ${maxWeight} kg` });
  };

  // Gestational Calculator
  const calculateGestational = () => {
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return;
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    setGestationalAge(`${weeks} tuần ${days} ngày`);
    const due = new Date(lmp);
    due.setDate(due.getDate() + 280);
    setDueDate(due.toLocaleDateString('vi-VN'));
  };

  // Glucose Calculator
  const handleGlucoseConvert = (val: string, unit: 'mmol' | 'mg') => {
    setGlucoseVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setConvertedGlucose(null);
      return;
    }
    if (unit === 'mmol') {
      setConvertedGlucose(`${(num * 18.0182).toFixed(1)} mg/dL`);
    } else {
      setConvertedGlucose(`${(num / 18.0182).toFixed(2)} mmol/L`);
    }
  };

  // ABG Calculator
  const calculateABG = () => {
    const pH = parseFloat(abgPh);
    const paco2 = parseFloat(abgPaco2);
    const hco3 = parseFloat(abgHco3);
    const pao2 = parseFloat(abgPao2);
    const na = parseFloat(abgNa);
    const cl = parseFloat(abgCl);

    if (isNaN(pH) || isNaN(paco2) || isNaN(hco3)) {
      alert('Vui lòng nhập tối thiểu pH, PaCO2 và HCO3-');
      return;
    }

    let acidBase = '';
    if (pH < 7.35) acidBase = 'Nhiễm toan (Acidemia)';
    else if (pH > 7.45) acidBase = 'Nhiễm kiềm (Alkalemia)';
    else acidBase = 'pH trong giới hạn bình thường (7.35 - 7.45)';

    let primaryDisorder = '';
    let compensation = '';

    if (pH < 7.35) {
      if (paco2 > 45 && hco3 < 22) {
        primaryDisorder = 'Toan hỗn hợp (Toan hô hấp kết hợp Toan chuyển hóa)';
      } else if (paco2 > 45) {
        primaryDisorder = 'Toan hô hấp (Respiratory Acidosis)';
        const delta = paco2 - 40;
        compensation = `Bù trừ: Toan hô hấp cấp HCO3 dự đoán ~${(24 + (delta / 10) * 1).toFixed(1)} mEq/L; Mạn ~${(24 + (delta / 10) * 3.5).toFixed(1)} mEq/L`;
      } else if (hco3 < 22) {
        primaryDisorder = 'Toan chuyển hóa (Metabolic Acidosis)';
        const expected = 1.5 * hco3 + 8;
        compensation = `Công thức Winter: PaCO2 bù trừ dự kiến = ${expected.toFixed(1)} ± 2 mmHg (Hiện tại: ${paco2})`;
      } else {
        primaryDisorder = 'Nhiễm toan có bù trừ một phần';
      }
    } else if (pH > 7.45) {
      if (paco2 < 35 && hco3 > 26) {
        primaryDisorder = 'Kiềm hỗn hợp (Kiềm hô hấp kết hợp Kiềm chuyển hóa)';
      } else if (paco2 < 35) {
        primaryDisorder = 'Kiềm hô hấp (Respiratory Alkalosis)';
        const delta = 40 - paco2;
        compensation = `Bù trừ: Kiềm hô hấp cấp HCO3 dự đoán ~${(24 - (delta / 10) * 2).toFixed(1)} mEq/L`;
      } else if (hco3 > 26) {
        primaryDisorder = 'Kiềm chuyển hóa (Metabolic Alkalosis)';
        const expected = 40 + 0.7 * (hco3 - 24);
        compensation = `Bù trừ: PaCO2 dự đoán bù trừ ~${expected.toFixed(1)} ± 2 mmHg`;
      } else {
        primaryDisorder = 'Nhiễm kiềm có bù trừ một phần';
      }
    } else {
      primaryDisorder = (paco2 > 45 && hco3 > 26) || (paco2 < 35 && hco3 < 22) 
        ? 'Rối loạn toan kiềm đã được bù trừ hoàn toàn' 
        : 'Khí máu động mạch cân bằng bình thường';
    }

    let anionGapText = null;
    if (!isNaN(na) && !isNaN(cl)) {
      const ag = na - (cl + hco3);
      let agDesc = ag > 16 
        ? 'Tăng Anion Gap (> 16): Gặp trong toan Lactic, toan Ceton, suy thận, ngộ độc...'
        : ag < 8 
        ? 'Anion Gap thấp (< 8): Do giảm albumin máu...' 
        : 'Anion Gap bình thường (8 - 16): Mất kiềm qua tiêu hóa (tiêu chảy), toan ống thận...';
      anionGapText = { ag: ag.toFixed(1), agDesc };
    }

    let oxyText = null;
    if (!isNaN(pao2)) {
      oxyText = pao2 >= 80 ? 'Oxy máu bình thường (PaO2 ≥ 80 mmHg)' :
                pao2 >= 60 ? 'Giảm oxy máu mức độ nhẹ (PaO2 60 - 79 mmHg)' :
                pao2 >= 40 ? 'Giảm oxy máu mức độ vừa (PaO2 40 - 59 mmHg) - Cần oxy liệu pháp' :
                'Giảm oxy máu nặng (PaO2 < 40 mmHg) - Nguy kịch!';
    }

    setAbgResult({ acidBase, primaryDisorder, compensation, anionGapText, oxyText });
  };

  // CBC Evaluator
  const evaluateCBC = () => {
    const hb = parseFloat(cbcHb);
    const mcv = parseFloat(cbcMcv);
    const wbc = parseFloat(cbcWbc);
    const neu = parseFloat(cbcNeu);
    const lym = parseFloat(cbcLym);
    const plt = parseFloat(cbcPlt);

    if (isNaN(hb) && isNaN(wbc) && isNaN(plt)) {
      alert('Vui lòng nhập ít nhất Hb, WBC hoặc PLT');
      return;
    }

    let anemiaSummary = '';
    if (!isNaN(hb)) {
      anemiaSummary = hb < 8 ? 'Thiếu máu mức độ NẶNG (Hb < 8 g/dL) - Cân nhắc truyền máu' :
                      hb < 10 ? 'Thiếu máu mức độ VỪA (Hb 8 - 10 g/dL)' :
                      hb < 12 ? 'Thiếu máu mức độ NHẸ (Hb 10 - 12 g/dL)' :
                      hb > 17.5 ? 'Đa hồng cầu (Hb > 17.5 g/dL)' :
                      'Hemoglobin trong giới hạn bình thường (12 - 16 g/dL)';
    }

    let morphology = '';
    if (!isNaN(mcv)) {
      morphology = mcv < 80 ? 'Hồng cầu nhỏ (MCV < 80 fL): Thường do Thiếu sắt, Thalassemia, bệnh mạn tính...' :
                   mcv > 100 ? 'Hồng cầu to (MCV > 100 fL): Thiếu B12, Acid Folic, bệnh gan, nghiện rượu...' :
                   'Hồng cầu đẳng bào (MCV 80 - 100 fL): Mất máu cấp, tán huyết, suy tủy...';
    }

    let wbcSummary = '';
    if (!isNaN(wbc)) {
      if (wbc > 10.5) {
        wbcSummary = (!isNaN(neu) && neu > 75) ? 'Bạch cầu tăng ưu thế NEU: Gợi ý nhiễm trùng vi khuẩn cấp tính.' :
                     (!isNaN(lym) && lym > 45) ? 'Bạch cầu tăng ưu thế LYM: Gợi ý nhiễm virus hoặc bệnh bạch cầu lympho.' :
                     'Bạch cầu tăng (WBC > 10.5 G/L): Có phản ứng viêm tăng sinh.';
      } else if (wbc < 4.0) {
        wbcSummary = 'Bạch cầu giảm (< 4.0 G/L): Suy giảm miễn dịch, ức chế tủy, nhiễm virus nặng...';
      } else {
        wbcSummary = 'Tổng số lượng bạch cầu bình thường (4.0 - 10.0 G/L).';
      }
    }

    let pltSummary = '';
    if (!isNaN(plt)) {
      pltSummary = plt < 20 ? 'Tiểu cầu giảm CỰC KỲ NẶNG (< 20 G/L): Nguy cơ xuất huyết tự nhiên cao!' :
                   plt < 50 ? 'Tiểu cầu giảm NẶNG (20 - 50 G/L): Nguy cơ chảy máu khi làm thủ thuật.' :
                   plt < 150 ? 'Tiểu cầu giảm NHẸ (50 - 149 G/L): Cần theo dõi (Dengue, xơ gan, thuốc...).' :
                   plt > 450 ? 'Tăng tiểu cầu (> 450 G/L): Phản ứng viêm hoặc tăng sinh tủy.' :
                   'Số lượng tiểu cầu bình thường (150 - 450 G/L).';
    }

    setCbcResult({ anemiaSummary, morphology, wbcSummary, pltSummary });
  };

  // Lung Points Data
  const lungPointsData: { [key: string]: any } = {
    apex: {
      name: 'Vùng Đỉnh Phổi (Lung Apices)',
      location: 'Hố trên đòn (mặt trước) hoặc ngang gai đốt sống C7 - T1 (mặt sau)',
      normalSound: 'Tiếng thở phế quản - phế nang (Bronchovesicular): Âm sắc trung bình, thì thở vào bằng thì thở ra.',
      pathological: 'Vùng ưa thích của tổn thương Lao phổi (thường tạo hang đỉnh phổi), viêm thùy trên, tiếng ran nổ đỉnh phổi gợi ý lao tiến triển.'
    },
    upper: {
      name: 'Thùy Trên Phổi (Upper Lobes)',
      location: 'Khoang liên sườn 2 - 3 đường giữa đòn (Mặt trước) hoặc liên gai cột sống T2 - T4 (Mặt sau)',
      normalSound: 'Tiếng thở phế quản - phế nang hoặc rì rào phế nang êm dịu.',
      pathological: 'Ran rít, ran ngáy trong hen phế quản; ran ẩm, ran nổ do đông đặc phổi hoặc viêm phế quản cấp.'
    },
    middle: {
      name: 'Thùy Giữa Phổi Phải / Lưỡi Phổi Trái (Middle Lobe & Lingula)',
      location: 'Khoang liên sườn 4 - 5 bờ phải xương ức (Thùy giữa) và ngang mức mỏm tim (Lưỡi phổi trái)',
      normalSound: 'Rì rào phế nang (Vesicular): Êm dịu như gió thổi qua ngọn cây, thì thở vào dài hơn thì thở ra.',
      pathological: 'Hội chứng thùy giữa: Viêm thùy giữa do hẹp phế quản, xẹp thùy giữa phổi phải, ran ẩm nhỏ hạt.'
    },
    base: {
      name: 'Vùng Đáy Phổi (Lung Bases)',
      location: 'Khoang liên sườn 6 - 8 đường nách trước hoặc khoang liên sườn 8 - 10 phía sau cạnh cột sống',
      normalSound: 'Rì rào phế nang thanh mảnh, rõ nhất ở thì thở vào sâu.',
      pathological: 'Ran nổ đáy phổi (Velcro crackles) trong xơ phổi vô căn; Ran ẩm 2 đáy phổi trong suy tim ứ huyết, phù phổi cấp; Mất rì rào phế nang trong tràn dịch hoặc tràn khí màng phổi.'
    },
    axillary: {
      name: 'Vùng Nách & Đường Nách Giữa (Axillary Region)',
      location: 'Khoang liên sườn 4 - 6 trên đường nách giữa',
      normalSound: 'Rì rào phế nang bình thường.',
      pathological: 'Rất nhạy để phát hiện Tiếng cọ màng phổi (Pleural friction rub) trong viêm màng phổi cấp (tiếng thô ráp như chà hai miếng da vào nhau).'
    }
  };

  // Heart Points Data
  const heartPointsData: { [key: string]: any } = {
    mitral: {
      name: 'Ổ Van Hai Lá (Mỏm Tim / Mitral Area)',
      location: 'Khoang liên sườn 5 trên đường trung đòn trái (vị trí mỏm tim đập)',
      normalSound: 'Tiếng T1 nghe rõ và trầm hơn T2 (đóng van 2 lá & 3 lá lúc bắt đầu tâm thu).',
      pathological: '• Thổi tâm thu (hở van 2 lá): Lan ra hố nách trái, âm sắc êm dịu như hơi nước xì.\n• Rung tâm trương (hẹp van 2 lá): Kèm clack mở van, rung trầm rù rì như tiếng vê dùi trống.\n• Tiếng T3 (ngựa phi tâm thất trong suy tim), T4 (tâm nhĩ thu trong phì đại thất).'
    },
    aortic: {
      name: 'Ổ Van Động Mạch Chủ (Aortic Area)',
      location: 'Khoang liên sườn 2 bờ PHẢI xương ức',
      normalSound: 'Tiếng T2 đanh rõ (đóng van tổ chim ĐMC & ĐMP lúc bắt đầu tâm trương).',
      pathological: '• Thổi tâm thu tống máu (Hẹp van ĐMC): Âm sắc thô ráp dạng hình thoi (crescendo-decrescendo), lan lên động mạch cảnh 2 bên cổ.\n• T2 mờ hoặc mất trong hẹp van ĐMC nặng vôi hóa.'
    },
    pulmonic: {
      name: 'Ổ Van Động Mạch Phổi (Pulmonic Area)',
      location: 'Khoang liên sườn 2 bờ TRÁI xương ức',
      normalSound: 'Tiếng T2 tách đôi sinh lý (nghe rõ nhất ở thì hít vào sâu do máu về thất phải nhiều làm van phổi đóng chậm).',
      pathological: '• T2 tách đôi cố định (Thông liên nhĩ - ASD).\n• T2 đanh mạnh (Tăng áp lực động mạch phổi).\n• Thổi tâm thu hẹp van ĐMP.'
    },
    erb: {
      name: 'Ổ Erb (Điểm ĐMC Thứ Hai / Erb\'s Point)',
      location: 'Khoang liên sườn 3 bờ TRÁI xương ức',
      normalSound: 'Nghe cân bằng cả tiếng T1 và T2.',
      pathological: '• Thổi tâm trương êm dịu (Hở van ĐMC): Âm sắc cao, nghe rõ nhất khi bệnh nhân ngồi cúi người ra trước, thở ra hết cỡ rồi nín thở.'
    },
    tricuspid: {
      name: 'Ổ Van Ba Lá (Tricuspid Area)',
      location: 'Khoang liên sườn 4 - 5 bờ TRÁI xương ức sát mũi kiếm',
      normalSound: 'Tiếng T1 rõ.',
      pathological: '• Thổi tâm thu (Hở van 3 lá): Nghiệm pháp Carvallo dương tính (tiếng thổi tăng lên khi bệnh nhân hít sâu vào).'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 z-10 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Hammer className="h-4.5 w-4.5 text-emerald-600" />
            Chi Tiết Công Cụ Lâm Sàng
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. PHÂN TÍCH ĐIỆN TIM (ECG AI) */}
          {toolId === 'ecg-ai' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Heart className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Phân Tích Điện Tâm Đồ Bằng AI (ECG/EKG)</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  Nguyên tắc an toàn y khoa bắt buộc:
                </p>
                <p className="leading-relaxed">
                  Để đảm bảo tính chính xác, ảnh tải lên phải <strong>rõ nét, không rung mờ, thấy rõ lưới mm và các sóng</strong>. Nếu ảnh quá mờ hoặc thiếu chuyển đạo, AI sẽ từ chối đọc và yêu cầu chụp lại ảnh khác rõ hơn để tránh chẩn đoán sai.
                </p>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={ecgFileInputRef} 
                  onChange={handleEcgFileSelect} 
                  className="hidden" 
                />

                {ecgImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-1">
                    <img src={ecgImage} alt="Bản ghi ECG" className="w-full max-h-60 object-contain rounded-xl mx-auto" />
                    <button
                      onClick={() => setEcgImage(null)}
                      className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs font-bold"
                    >
                      ✕ Chọn ảnh khác
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => ecgFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                  >
                    <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Tải lên hình ảnh giấy đo Điện tim (12 chuyển đạo)</p>
                    <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG, ảnh chụp trực tiếp từ điện thoại</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700">Thông tin ca bệnh / Ghi chú lâm sàng kèm theo (Tùy chọn):</label>
                  <textarea
                    rows={2}
                    value={ecgNotes}
                    onChange={e => setEcgNotes(e.target.value)}
                    placeholder="Ví dụ: Bệnh nhân nam 58 tuổi, đau ngực trái dữ dội lan lên vai, tiền sử THA..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs mt-1 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleAnalyzeEcg}
                  disabled={isAnalyzingEcg}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isAnalyzingEcg ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI Đang Phân Tích Điện Tim...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Bắt Đầu Phân Tích Điện Tim
                    </>
                  )}
                </button>
              </div>

              {ecgError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{ecgError}</span>
                </div>
              )}

              {ecgAnalysisResult && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mt-4 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Kết Quả Phân Tích Sơ Bộ Của AI:</span>
                  </div>
                  <div className="prose prose-xs max-w-none text-slate-800 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{ecgAnalysisResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. HƯỚNG DẪN VỊ TRÍ NGHE PHỔI */}
          {toolId === 'lung-exam' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Stethoscope className="h-5 w-5 text-cyan-600" />
                <h3 className="text-base font-black text-slate-900">Hướng Dẫn Vị Trí Nghe Phổi Lâm Sàng</h3>
              </div>

              {/* Toggle Anterior / Posterior */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLungSide('anterior')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    lungSide === 'anterior' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Mặt Trước Lồng Ngực (Anterior)
                </button>
                <button
                  onClick={() => setLungSide('posterior')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    lungSide === 'posterior' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Mặt Sau Lưng (Posterior)
                </button>
              </div>

              {/* Interactive Points Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'apex', label: '1. Đỉnh phổi (Apices)' },
                  { id: 'upper', label: '2. Thùy trên (Upper)' },
                  { id: 'middle', label: '3. Thùy giữa / Lưỡi' },
                  { id: 'base', label: '4. Đáy phổi (Bases)' },
                  { id: 'axillary', label: '5. Vùng nách (Axillary)' }
                ].map(point => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedLungPoint(point.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      selectedLungPoint === point.id
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-900 ring-2 ring-cyan-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {point.label}
                  </button>
                ))}
              </div>

              {/* Point Detail Card */}
              {lungPointsData[selectedLungPoint] && (
                <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Vị trí giải phẫu:</span>
                    <h4 className="text-sm font-bold text-slate-900">{lungPointsData[selectedLungPoint].name}</h4>
                    <p className="text-slate-600 mt-0.5">{lungPointsData[selectedLungPoint].location}</p>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-cyan-100 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-emerald-700">
                      <Volume2 className="h-4 w-4" /> Âm thanh sinh lý bình thường nghe được:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{lungPointsData[selectedLungPoint].normalSound}</p>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-cyan-100 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-rose-700">
                      <AlertTriangle className="h-4 w-4" /> Các âm bệnh lý thường gặp & Ý nghĩa:
                    </span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{lungPointsData[selectedLungPoint].pathological}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">💡 Kỹ thuật nghe phổi chuẩn lâm sàng:</span>
                <p>1. Đặt màng ống nghe áp sát thành ngực, không đè qua áo.</p>
                <p>2. Bảo bệnh nhân há miệng thở sâu và chậm.</p>
                <p>3. Nghe theo hình bậc thang (ziczac) đối xứng 2 bên để so sánh âm phế bào bên phải và bên trái.</p>
              </div>
            </div>
          )}

          {/* 3. HƯỚNG DẪN VỊ TRÍ NGHE TIM */}
          {toolId === 'heart-exam' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Activity className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Hướng Dẫn 5 Ổ Nghe Tim Kinh Điển</h3>
              </div>
              <p className="text-xs text-slate-500">
                Chọn ổ nghe tim bên dưới để xem mốc giải phẫu, tiếng T1, T2 và các tiếng thổi bệnh lý:
              </p>

              {/* 5 Cardiac Valve Area Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'mitral', label: '1. Ổ Van 2 Lá (Mỏm tim)' },
                  { id: 'aortic', label: '2. Ổ Van ĐM Chủ' },
                  { id: 'pulmonic', label: '3. Ổ Van ĐM Phổi' },
                  { id: 'erb', label: '4. Ổ Erb (ĐMC thứ 2)' },
                  { id: 'tricuspid', label: '5. Ổ Van 3 Lá' }
                ].map(point => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedHeartPoint(point.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      selectedHeartPoint === point.id
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {point.label}
                  </button>
                ))}
              </div>

              {/* Cardiac Area Detail Card */}
              {heartPointsData[selectedHeartPoint] && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Mốc khám lâm sàng:</span>
                    <h4 className="text-sm font-bold text-slate-900">{heartPointsData[selectedHeartPoint].name}</h4>
                    <p className="text-slate-600 mt-0.5">{heartPointsData[selectedHeartPoint].location}</p>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-rose-100 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-emerald-700">
                      <Volume2 className="h-4 w-4" /> Tiếng tim bình thường (Sinh lý):
                    </span>
                    <p className="text-slate-700 leading-relaxed">{heartPointsData[selectedHeartPoint].normalSound}</p>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-rose-100 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-rose-700">
                      <AlertTriangle className="h-4 w-4" /> Các tiếng tim bệnh lý & Tiếng thổi:
                    </span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{heartPointsData[selectedHeartPoint].pathological}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">💡 Tư thế thăm khám tối ưu:</span>
                <p>• Van 2 lá: Bệnh nhân nằm nghiêng trái, dùng chuông ống nghe đặt tại mỏm tim để nghe rung tâm trương.</p>
                <p>• Van ĐMC: Bệnh nhân ngồi cúi người ra trước, thở ra hết cỡ rồi nín thở để phát hiện thổi tâm trương hở van ĐMC.</p>
              </div>
            </div>
          )}

          {/* 4. TÍNH LIỀU BƠM TIÊM ĐIỆN (2 CHIỀU: XUÔI & NGƯỢC) */}
          {toolId === 'syringe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">Tính Liều Bơm Tiêm Điện (2 Chiều)</h3>
                </div>
              </div>

              {/* Toggle Mode: Xuôi vs Ngược */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSyringeMode('forward'); setSyringeResult(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    syringeMode === 'forward' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Tính Xuôi: Liều Kê Đơn ➔ Tốc Độ (mL/h)
                </button>
                <button
                  onClick={() => { setSyringeMode('reverse'); setSyringeResult(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    syringeMode === 'reverse' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Tính Ngược: Tốc Độ (mL/h) ➔ Liều Thực Nhận
                </button>
              </div>

              {/* Shared parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Thuốc truyền</label>
                  <select 
                    value={syringeDrug} 
                    onChange={e => {
                      setSyringeDrug(e.target.value);
                      if (e.target.value === 'noradrenaline' || e.target.value === 'adrenaline') {
                        setTotalDrugAmount('4');
                        setDrugDosePrescribed('0.1');
                      } else if (e.target.value === 'dopamine' || e.target.value === 'dobutamine') {
                        setTotalDrugAmount('200');
                        setDrugDosePrescribed('5');
                      } else if (e.target.value === 'nitroglycerin') {
                        setTotalDrugAmount('25');
                        setDrugDosePrescribed('10');
                      } else if (e.target.value === 'propofol') {
                        setTotalDrugAmount('500');
                        setDrugDosePrescribed('2');
                      }
                    }} 
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="noradrenaline">Noradrenaline (Norepinephrine)</option>
                    <option value="adrenaline">Adrenaline (Epinephrine)</option>
                    <option value="dopamine">Dopamine</option>
                    <option value="dobutamine">Dobutamine</option>
                    <option value="nitroglycerin">Nitroglycerin</option>
                    <option value="propofol">Propofol 1%</option>
                    <option value="custom">Thuốc khác (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Cân nặng bệnh nhân (kg)</label>
                  <input type="number" value={patientWeight} onChange={e => setPatientWeight(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 focus:border-indigo-500 focus:outline-none" placeholder="60" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Lượng thuốc pha trong bơm (mg)</label>
                  <input type="number" step="0.1" value={totalDrugAmount} onChange={e => setTotalDrugAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 focus:border-indigo-500 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Thể tích bơm tiêm (mL)</label>
                  <select value={syringeVolume} onChange={e => setSyringeVolume(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 bg-white focus:border-indigo-500 focus:outline-none">
                    <option value="50">50 mL (Bơm 50cc chuẩn)</option>
                    <option value="20">20 mL</option>
                    <option value="10">10 mL</option>
                  </select>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {syringeMode === 'forward' ? (
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Liều chỉ định ({['noradrenaline', 'adrenaline', 'dopamine', 'dobutamine', 'custom'].includes(syringeDrug) ? 'mcg/kg/phút' : syringeDrug === 'nitroglycerin' ? 'mcg/phút' : 'mg/kg/giờ'})
                  </label>
                  <input type="number" step="0.01" value={drugDosePrescribed} onChange={e => setDrugDosePrescribed(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 focus:border-indigo-500 focus:outline-none" />
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <label className="text-xs font-bold text-indigo-900 block">
                    Tốc độ đang chạy trên máy bơm tiêm điện (mL/h) *
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={currentMachineRate} 
                    onChange={e => setCurrentMachineRate(e.target.value)} 
                    className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-sm mt-1 focus:border-indigo-500 focus:outline-none font-bold text-indigo-700" 
                    placeholder="Ví dụ: 3.75" 
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nhập tốc độ máy đang hiển thị để tính ngược lại liều bệnh nhân đang nhận.
                  </p>
                </div>
              )}

              <button onClick={calculateSyringe} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-sm">
                {syringeMode === 'forward' ? 'Tính Tốc Độ Bơm Tiêm Điện (mL/h)' : 'Tính Ngược Lại Liều Thực Nhận'}
              </button>

              {syringeResult && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-center space-y-2 mt-4">
                  {syringeResult.mode === 'forward' ? (
                    <>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cài đặt tốc độ máy bơm:</span>
                      <p className="text-3xl font-black text-indigo-700">
                        {syringeResult.rateMlPerHour} <span className="text-base font-bold">mL/giờ</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Liều bệnh nhân đang thực nhận:</span>
                      <p className="text-3xl font-black text-indigo-700">
                        {syringeResult.calculatedDose} <span className="text-base font-bold">{syringeResult.unitLabel}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Tương đương truyền: <strong className="text-slate-800">{syringeResult.deliveredMgPerHour} mg/giờ</strong>
                      </p>
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-indigo-100">
                    <div>Nồng độ: <strong className="text-slate-800">{syringeResult.concentrationMcgPerMl} mcg/mL</strong></div>
                    <div>Hết 1 bơm sau: <strong className="text-slate-800">~{syringeResult.durationHours} giờ</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. TÍNH TỐC ĐỘ TRUYỀN DỊCH (2 CHIỀU: XUÔI & NGƯỢC) */}
          {toolId === 'fluid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">Tính Tốc Độ Truyền Dịch (2 Chiều)</h3>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setFluidMode('forward'); setFluidResult(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    fluidMode === 'forward' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Tính Xuôi: Thể Tích & Giờ ➔ Giọt/Phút
                </button>
                <button
                  onClick={() => { setFluidMode('reverse'); setFluidResult(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    fluidMode === 'reverse' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Tính Ngược: Số Giọt ➔ Thời Gian Hết Dịch
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tổng thể tích chai dịch (mL)</label>
                  <input type="number" value={fluidVol} onChange={e => setFluidVol(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Hệ số dây truyền</label>
                  <select value={dropFactor} onChange={e => setDropFactor(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1 bg-white">
                    <option value={20}>20 giọt/mL (Dây truyền người lớn thông thường)</option>
                    <option value={15}>15 giọt/mL (Dây truyền máu / cao phân tử)</option>
                    <option value={60}>60 giọt/mL (Dây truyền nhi / vi giọt)</option>
                  </select>
                </div>

                {fluidMode === 'forward' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700">Thời gian muốn truyền hết (giờ)</label>
                    <input type="number" step="0.5" value={fluidTime} onChange={e => setFluidTime(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="8" />
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <label className="text-xs font-bold text-blue-900 block">
                      Tốc độ đếm được thực tế (giọt/phút) *
                    </label>
                    <input 
                      type="number" 
                      value={currentDropRate} 
                      onChange={e => setCurrentDropRate(e.target.value)} 
                      className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-sm mt-1 font-bold text-blue-700" 
                      placeholder="Ví dụ: 21" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nhập số giọt nhỏ trong 1 phút để tính khi nào truyền hết chai dịch.
                    </p>
                  </div>
                )}

                <button onClick={calculateFluid} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 text-sm">
                  {fluidMode === 'forward' ? 'Tính Tốc Độ Nhỏ Giọt (giọt/phút)' : 'Tính Thời Gian Truyền Hết Dịch'}
                </button>

                {fluidResult && (
                  <div className="p-4 bg-blue-50 rounded-2xl text-center space-y-2">
                    {fluidResult.mode === 'forward' ? (
                      <>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Tốc độ nhỏ giọt:</span>
                        <p className="text-3xl font-black text-blue-700">{fluidResult.dropRate} <span className="text-sm font-bold">giọt/phút</span></p>
                        <p className="text-xs text-slate-600">Tương đương: <strong>{fluidResult.mlPerHour} mL/giờ</strong></p>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Thời gian truyền hết chai dịch:</span>
                        <p className="text-3xl font-black text-blue-700">
                          {fluidResult.hours} <span className="text-base font-bold">giờ</span> {fluidResult.minutes} <span className="text-base font-bold">phút</span>
                        </p>
                        <div className="pt-2 border-t border-blue-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>Tốc độ mL: <strong>{fluidResult.mlPerHour} mL/giờ</strong></div>
                          <div>Dự kiến xong lúc: <strong className="text-blue-900">{fluidResult.finishTimeString}</strong></div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. KHÍ MÁU ĐỘNG MẠCH (ABG) */}
          {toolId === 'abg' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Wind className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">Phân Tích Khí Máu Động Mạch (ABG)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">pH máu *</label>
                  <input type="number" step="0.01" value={abgPh} onChange={e => setAbgPh(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="7.35 - 7.45" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">PaCO2 (mmHg) *</label>
                  <input type="number" step="0.1" value={abgPaco2} onChange={e => setAbgPaco2(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="35 - 45" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">HCO3- (mEq/L) *</label>
                  <input type="number" step="0.1" value={abgHco3} onChange={e => setAbgHco3(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="22 - 26" />
                </div>
              </div>
              <button onClick={calculateABG} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs text-sm">
                Phân Tích Khí Máu
              </button>
              {abgResult && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <p className="text-sm font-black text-amber-900">{abgResult.acidBase}</p>
                  <p className="text-xs font-bold text-slate-800">{abgResult.primaryDisorder}</p>
                  {abgResult.compensation && <p className="text-slate-600">{abgResult.compensation}</p>}
                </div>
              )}
            </div>
          )}

          {/* 7. CÔNG THỨC MÁU (CBC) */}
          {toolId === 'cbc' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <TestTube className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Phân Tích Công Thức Máu (CBC)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Hb (g/dL) *</label>
                  <input type="number" step="0.1" value={cbcHb} onChange={e => setCbcHb(e.target.value)} placeholder="12 - 16" className="w-full rounded-xl border border-slate-200 p-2 text-xs mt-0.5" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">MCV (fL) *</label>
                  <input type="number" step="0.1" value={cbcMcv} onChange={e => setCbcMcv(e.target.value)} placeholder="80 - 100" className="w-full rounded-xl border border-slate-200 p-2 text-xs mt-0.5" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">WBC (G/L) *</label>
                  <input type="number" step="0.1" value={cbcWbc} onChange={e => setCbcWbc(e.target.value)} placeholder="4.0 - 10.0" className="w-full rounded-xl border border-slate-200 p-2 text-xs mt-0.5" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">PLT (G/L) *</label>
                  <input type="number" step="1" value={cbcPlt} onChange={e => setCbcPlt(e.target.value)} placeholder="150 - 450" className="w-full rounded-xl border border-slate-200 p-2 text-xs mt-0.5" />
                </div>
              </div>
              <button onClick={evaluateCBC} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm">
                Phân Tích Chi Tiết
              </button>
              {cbcResult && (
                <div className="p-4 bg-emerald-50 rounded-2xl space-y-2 text-xs">
                  {cbcResult.anemiaSummary && <p className="font-bold text-emerald-900">{cbcResult.anemiaSummary}</p>}
                  {cbcResult.morphology && <p className="text-slate-700">{cbcResult.morphology}</p>}
                  {cbcResult.wbcSummary && <p className="text-slate-700">{cbcResult.wbcSummary}</p>}
                  {cbcResult.pltSummary && <p className="text-slate-700">{cbcResult.pltSummary}</p>}
                </div>
              )}
            </div>
          )}

          {/* 8. BMI */}
          {toolId === 'bmi' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-teal-600" /> Tính Chỉ Số Khối Cơ Thể (BMI)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Chiều cao (cm)</label>
                  <input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="170" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Cân nặng (kg)</label>
                  <input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" placeholder="65" />
                </div>
              </div>
              <button onClick={calculateBMI} className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl hover:bg-teal-700 text-sm">Tính toán</button>
              {bmiResult && (
                <div className="p-4 bg-teal-50 rounded-2xl text-center space-y-1">
                  <p className="text-3xl font-black text-teal-700">{bmiResult.bmi}</p>
                  <p className="text-sm font-bold text-slate-800">{bmiResult.classification}</p>
                  <p className="text-xs text-slate-500">Cân nặng lý tưởng: {bmiResult.idealRange}</p>
                </div>
              )}
            </div>
          )}

          {/* 9. GCS */}
          {toolId === 'gcs' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-amber-600" /> Thang Điểm Glasgow (GCS)
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Mắt (E): {gcsEye} điểm</label>
                  <select value={gcsEye} onChange={e => setGcsEye(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-2 mt-1 bg-white">
                    <option value={4}>4 - Mở mắt tự nhiên</option>
                    <option value={3}>3 - Mở mắt khi gọi</option>
                    <option value={2}>2 - Mở mắt khi kích thích đau</option>
                    <option value={1}>1 - Không mở mắt</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Lời nói (V): {gcsVerbal} điểm</label>
                  <select value={gcsVerbal} onChange={e => setGcsVerbal(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-2 mt-1 bg-white">
                    <option value={5}>5 - Trả lời đúng, nhanh</option>
                    <option value={4}>4 - Lẫn lộn</option>
                    <option value={3}>3 - Từ không phù hợp</option>
                    <option value={2}>2 - Kêu rên vô nghĩa</option>
                    <option value={1}>1 - Không phát âm</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Vận động (M): {gcsMotor} điểm</label>
                  <select value={gcsMotor} onChange={e => setGcsMotor(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-2 mt-1 bg-white">
                    <option value={6}>6 - Đúng y lệnh</option>
                    <option value={5}>5 - Gạt đúng chỗ đau</option>
                    <option value={4}>4 - Co tay khi đau</option>
                    <option value={3}>3 - Gấp cứng mất vỏ</option>
                    <option value={2}>2 - Duỗi cứng mất não</option>
                    <option value={1}>1 - Không đáp ứng</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl text-center">
                <p className="text-3xl font-black text-amber-700">{gcsEye + gcsVerbal + gcsMotor} / 15</p>
              </div>
            </div>
          )}

          {/* 10. TUỔI THAI */}
          {toolId === 'gestational' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-pink-600" /> Tính Tuổi Thai & Dự Sinh
              </h3>
              <div>
                <label className="text-xs font-bold text-slate-700">Ngày đầu kỳ kinh cuối (LMP)</label>
                <input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm mt-1" />
              </div>
              <button onClick={calculateGestational} className="w-full bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm">Tính toán</button>
              {gestationalAge && (
                <div className="p-4 bg-pink-50 rounded-2xl text-center space-y-1">
                  <p className="text-2xl font-black text-pink-700">{gestationalAge}</p>
                  <p className="text-sm font-bold text-slate-800">Dự sinh: {dueDate}</p>
                </div>
              )}
            </div>
          )}

          {/* 11. GLUCOSE */}
          {toolId === 'glucose' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" /> Quy Đổi Glucose
              </h3>
              <div className="flex gap-2">
                <button onClick={() => { setGlucoseUnit('mmol'); handleGlucoseConvert(glucoseVal, 'mmol'); }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${glucoseUnit === 'mmol' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  mmol/L ➔ mg/dL
                </button>
                <button onClick={() => { setGlucoseUnit('mg'); handleGlucoseConvert(glucoseVal, 'mg'); }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${glucoseUnit === 'mg' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  mg/dL ➔ mmol/L
                </button>
              </div>
              <input type="number" step="0.1" value={glucoseVal} onChange={e => handleGlucoseConvert(e.target.value, glucoseUnit)} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm" placeholder="Nhập giá trị" />
              {convertedGlucose && (
                <div className="p-4 bg-orange-50 rounded-2xl text-center">
                  <p className="text-3xl font-black text-orange-700">{convertedGlucose}</p>
                </div>
              )}
            </div>
          )}

          {/* 12. 3D ANATOMY */}
          {toolId === 'anatomy3d' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" /> Mô Hình Giải Phẫu 3D Tương Tác
              </h3>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200">
                <iframe title="3D Anatomy" className="w-full h-full border-none" src="https://sketchfab.com/models/2f7bb7fa58d44200b345a278dff2a76f/embed?autostart=1&ui_controls=1" allow="autoplay; fullscreen; xr-spatial-tracking" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Disclaimer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400 text-center italic shrink-0">
          * Các công cụ chỉ nhằm mục đích tham khảo và hỗ trợ học tập, không thay thế cho quyết định lâm sàng của bác sĩ điều trị.
        </div>
      </motion.div>
    </div>
  );
}
