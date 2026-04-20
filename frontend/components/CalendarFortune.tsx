import React, { useState, useRef } from 'react';
import { formatText } from '../utils/formatText';
import { Download, Star, AlertCircle, Info, Calendar as CalendarIcon, User as UserIcon, MapPin, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CATEGORIES = [
  "Tổng quan vận mệnh",
  "Tình cảm & Mối quan hệ",
  "Sự nghiệp & Công danh",
  "Sức khỏe & Bình an",
  "Tài lộc & Kinh doanh"
];

interface DayData {
  day: number;
  quality: 'good' | 'bad' | 'neutral';
  reason: string;
}

interface CalendarFortuneProps {
  user: User | null;
  onBalanceUpdate: (b: number) => void;
  conversationId?: number | null;
  history?: any[];
}

const CalendarFortune: React.FC<CalendarFortuneProps> = ({ user, onBalanceUpdate, conversationId, history }) => {
  const [view, setView] = useState<'input' | 'result'>('input');
  const [selectedField, setSelectedField] = useState(CATEGORIES[0]);
  const [birthInfo, setBirthInfo] = useState({
    name: user?.full_name || '',
    day: 1,
    month: 1,
    year: 1990,
    city: ''
  });
  const [targetDate, setTargetDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 🔥 LOAD DATA TỪ LỊCH SỬ (HISTORY RECALL)
  React.useEffect(() => {
    if (conversationId && history && history.length > 0) {
      // Tìm tin nhắn chứa dữ liệu lịch cấu trúc
      const calendarMsg = history.find(m => m.chart === 'calendar' || m.chart_summary);
      if (calendarMsg && calendarMsg.chart_summary) {
        const data = calendarMsg.chart_summary;
        setCalendarData(data.days || []);
        setSummary(data.summary || '');
        setSelectedField(data.field || CATEGORIES[0]);
        setTargetDate({
          month: data.month || targetDate.month,
          year: data.year || targetDate.year
        });
        if (data.birth_info) {
          setBirthInfo(data.birth_info);
        }
        setView('result');
      }
    }
  }, [conversationId, history]);

  const fetchCalendarData = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem lịch.");
      return;
    }

    if (!birthInfo.name || !birthInfo.city) {
      toast.error("Vui lòng nhập đầy đủ thông tin người dùng.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.getGoodBadDays({
        month: targetDate.month,
        year: targetDate.year,
        field: selectedField,
        birth_info: birthInfo,
        conversation_id: conversationId ? Number(conversationId) : undefined
      });
      setCalendarData(res.days);
      setSummary(res.summary || '');
      onBalanceUpdate(res.user_token_balance);
      setView('result');
      
      // 🔥 CẬP NHẬT SIDEBAR NGAY LẬP TỨC
      window.dispatchEvent(new Event("reload_conversations"));
      
      toast.success("Đã bói xong lịch cát tường của bạn!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!calendarRef.current) return;
    setIsLoading(true);
    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Page 1
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Subsequent pages if content is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Lich_Cat_Tuong_${birthInfo.name}_T${targetDate.month}_${targetDate.year}.pdf`);
      toast.success("Đã tải lịch về máy.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Lỗi khi tải PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = new Date(targetDate.year, targetDate.month, 0).getDate();
  const firstDayOfMonth = new Date(targetDate.year, targetDate.month - 1, 1).getDay();

  if (view === 'input') {
    return (
      <div className="flex-1 p-6 overflow-y-auto bg-black/40 backdrop-blur-md text-white">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Lịch Cát Tường
            </h1>
            <p className="text-gray-400">Nhập thông tin để AI tính toán ngày tốt xấu dành riêng cho bạn</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <UserIcon size={16} className="text-orange-500" /> Họ và tên
                </label>
                <input
                  type="text"
                  value={birthInfo.name}
                  onChange={e => setBirthInfo({ ...birthInfo, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <MapPin size={16} className="text-orange-500" /> Nơi sinh
                </label>
                <input
                  type="text"
                  value={birthInfo.city}
                  onChange={e => setBirthInfo({ ...birthInfo, city: e.target.value })}
                  placeholder="Ví dụ: Hà Nội"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition"
                />
              </div>

              {/* Birth Date */}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <CalendarIcon size={16} className="text-orange-500" /> Ngày sinh (Dương lịch)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <select
                    value={birthInfo.day}
                    onChange={e => setBirthInfo({ ...birthInfo, day: parseInt(e.target.value) })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition appearance-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-900 text-white">Ngày {i + 1}</option>
                    ))}
                  </select>
                  <select
                    value={birthInfo.month}
                    onChange={e => setBirthInfo({ ...birthInfo, month: parseInt(e.target.value) })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-900 text-white">Tháng {i + 1}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={birthInfo.year}
                    onChange={e => setBirthInfo({ ...birthInfo, year: parseInt(e.target.value) })}
                    placeholder="Năm"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">Chọn thời điểm muốn xem lịch</label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={targetDate.month}
                  onChange={e => setTargetDate({ ...targetDate, month: parseInt(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition appearance-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-gray-900 text-white">Tháng {i + 1}</option>
                  ))}
                </select>
                <select
                  value={targetDate.year}
                  onChange={e => setTargetDate({ ...targetDate, year: parseInt(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition appearance-none"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y} className="bg-gray-900 text-white">Năm {y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">Chọn lĩnh vực quan tâm</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedField(cat)}
                    className={`px-4 py-2 rounded-full text-xs transition ${
                      selectedField === cat 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchCalendarData}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {isLoading ? "Đang bói lịch..." : "Xem Lịch Cát Tường"}
            </button>
            
            <p className="text-center text-[10px] text-gray-500">
              * Hệ thống sẽ tiêu tốn một lượng nhỏ token để AI phân tích chi tiết dựa trên lá số tử vi của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-black/40 backdrop-blur-md text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('input')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Kết Quả Lịch Cát Tường
              </h1>
              <p className="text-gray-400">Dành cho {birthInfo.name} - Tháng {targetDate.month}/{targetDate.year}</p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
          >
            <Download size={20} />
            Tải về PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <Info size={18} className="text-blue-400" />
                <h3 className="font-medium">Phân tích cho lĩnh vực: {selectedField}</h3>
             </div>
             <p className="text-sm text-gray-400">
                Lịch đã được tinh chỉnh dựa trên thông tin sinh của bạn ({birthInfo.day}/{birthInfo.month}/{birthInfo.year}). Các ngày màu đỏ là ngày đại cát, hãy tận dụng!
             </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span className="text-sm">Ngày Tốt (Đại Cát)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-black border border-white/20"></div>
              <span className="text-sm">Ngày Xấu/Bình thường</span>
            </div>
          </div>
        </div>

        {/* Container for PDF Export */}
        <div ref={calendarRef} className="space-y-8 bg-[#0a0a0f] p-4 rounded-3xl">
          {/* Calendar View */}
          <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />
            
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Tháng {targetDate.month} / {targetDate.year}</h2>
               <p className="text-orange-500 text-xs mt-1">Lịch Cát Tường Chiêm Tinh</p>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 py-2 border-b border-white/5">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const data = calendarData.find(d => d.day === day);
                const isGood = data?.quality === 'good';
                const isBad = data?.quality === 'bad';

                return (
                  <div 
                    key={day}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer group ${
                      isGood 
                      ? 'bg-red-500/20 border-red-500/50 text-red-100 hover:bg-red-500/30 ring-1 ring-red-500/20' 
                      : isBad
                      ? 'bg-black/60 border-white/5 text-gray-400 hover:bg-white/5'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl font-bold">{day}</span>
                    {isGood && <Star size={14} className="text-yellow-400 fill-yellow-400 mt-1 animate-pulse" />}
                    {isBad && <AlertCircle size={14} className="text-gray-600 mt-1" />}
                    
                    {/* Tooltip */}
                    {data?.reason && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center leading-relaxed">
                        <div className="text-orange-400 font-bold mb-1">Luận giải:</div>
                        {data.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center border-t border-white/5 pt-6">
               <p className="text-[10px] text-gray-600 italic">Dữ liệu được phân tích bởi AI Chiêm Tinh - {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* 📝 MONTH SUMMARY SECTION IN PDF */}
          {summary && (
            <div className="bg-[#0f0f15] border border-white/10 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-yellow-400" size={24} />
                <h2 className="text-xl font-bold text-orange-400 uppercase tracking-wider">
                  Luận giải chi tiết tháng {targetDate.month}
                </h2>
              </div>
              
              <div className="prose prose-invert max-w-none mb-8">
                <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {summary}
                </div>
              </div>

              {/* 🌟 SPECIFIC DAYS LIST IN PDF */}
              <div className="space-y-4 border-t border-white/10 pt-8">
                <h3 className="text-lg font-bold text-white mb-4">Chi tiết các ngày đặc biệt:</h3>
                <div className="grid grid-cols-1 gap-4">
                  {calendarData.filter(d => d.quality !== 'neutral').map(d => (
                    <div key={d.day} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        d.quality === 'good' ? 'bg-red-500/20 border-red-500/50 text-red-100' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}>
                        <span className="text-lg font-bold">{d.day}</span>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold mb-1 ${d.quality === 'good' ? 'text-red-400' : 'text-gray-400'}`}>
                          {d.quality === 'good' ? '✨ Ngày Đại Cát' : '⚠️ Ngày Cần Lưu Ý'}
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{d.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <div className="flex items-start gap-4">
                  <Info className="text-orange-400 mt-1 flex-shrink-0" size={20} />
                  <p className="text-sm text-orange-200/80 italic">
                    Lưu ý: Các dự báo trên mang tính chất tham khảo dựa trên lá số cá nhân của bạn. Hãy luôn giữ tinh thần lạc quan và chủ động trong mọi quyết định.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-orange-500/20 rounded-full"></div>
                <div className="absolute top-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-orange-500 text-xl font-bold animate-pulse">Đang bói lịch cát tường...</p>
                <p className="text-gray-400 text-sm">AI đang quét lá số và vị trí các vì sao</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarFortune;
