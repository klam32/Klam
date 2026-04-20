import React, { useState } from 'react';
import { Sparkles, Calendar as CalendarIcon, User as UserIcon, MapPin, ArrowLeft, Star, Heart, Briefcase, Zap, Shield } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';
import toast from 'react-hot-toast';
import { formatText } from '../utils/formatText';

const CATEGORIES = [
  { id: 'Tổng quan', name: 'Tổng quan vận trình', icon: <Star className="w-5 h-5" /> },
  { id: 'Tình cảm', name: 'Tình cảm & Mối quan hệ', icon: <Heart className="w-5 h-5" /> },
  { id: 'Sự nghiệp', name: 'Sự nghiệp & Tài lộc', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'Sức khỏe', name: 'Sức khỏe & Năng lượng', icon: <Zap className="w-5 h-5" /> },
];

interface DailyPredictionProps {
  user: User | null;
  onBalanceUpdate: (balance: number) => void;
  conversationId?: number | null;
  history?: any[];
}

const DailyPrediction: React.FC<DailyPredictionProps> = ({ user, onBalanceUpdate, conversationId, history }) => {
  const [view, setView] = useState<'input' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedField, setSelectedField] = useState(CATEGORIES[0].id);
  const [prediction, setPrediction] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    date: '', // Ngày sinh
    time: '12:00',
    city: 'Hà Nội',
    targetDate: new Date().toISOString().split('T')[0] // Ngày cần dự đoán
  });

  // 🔥 LOAD DATA TỪ LỊCH SỬ (HISTORY RECALL)
  React.useEffect(() => {
    if (conversationId && history && history.length > 0) {
      // Tìm tin nhắn chứa dữ liệu dự đoán cấu trúc
      const predictionMsg = history.find(m => m.chart === 'prediction' || m.chart_summary);
      if (predictionMsg && predictionMsg.chart_summary) {
        const data = predictionMsg.chart_summary;
        setPrediction(data.prediction);
        setSelectedField(data.field || CATEGORIES[0].id);
        
        // Khôi phục form data nếu có
        if (data.date || data.birth_info) {
           setFormData(prev => ({
             ...prev,
             targetDate: data.date || prev.targetDate,
             name: data.birth_info?.name || prev.name,
             city: data.birth_info?.city || prev.city
           }));
        }
        
        setView('result');
      }
    }
  }, [conversationId, history]);

  const handlePredict = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }

    if (!formData.name || !formData.date || !formData.targetDate) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setIsLoading(true);
    try {
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hour, minute] = formData.time.split(':').map(Number);

      const res = await api.getDailyPrediction({
        date: formData.targetDate,
        field: selectedField,
        conversation_id: conversationId ? Number(conversationId) : undefined,
        birth_info: {
          name: formData.name,
          year, month, day,
          hour, minute,
          city: formData.city
        }
      });

      setPrediction(res.prediction);
      onBalanceUpdate(res.user_token_balance);
      setView('result');
      
      // 🔥 CẬP NHẬT SIDEBAR NGAY LẬP TỨC
      window.dispatchEvent(new Event("reload_conversations"));
      
      toast.success("Đã luận giải xong vận trình ngày mới của bạn!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lấy dự đoán");
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'result' && prediction) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full h-[calc(100vh-60px)] flex flex-col animate-in fade-in slide-in-from-bottom duration-500">
        <button
          onClick={() => setView('input')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors group flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>

        <div className="flex-1 min-h-0 bg-[#0d0d16]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col">
          {/* Header Result - FIXED */}
          <div className="relative h-40 flex items-center justify-center overflow-hidden flex-shrink-0 border-b border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40"></div>
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative z-10 text-center">
              <div className="text-6xl font-black text-white mb-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{prediction.score}</div>
              <div className="text-purple-300 uppercase tracking-[0.2em] text-[10px] font-bold">Chỉ số năng lượng</div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                {CATEGORIES.find(c => c.id === selectedField)?.icon}
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Dự đoán ngày {formData.targetDate}</h2>
            </div>

            <div className="pro-text mb-10 text-gray-300 leading-relaxed text-left text-base md:text-lg">
              {formatText(prediction.content)}
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 italic text-center text-purple-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="w-6 h-6 mx-auto mb-4 text-amber-400 relative z-10" />
              <p className="relative z-10 text-lg leading-relaxed">"{prediction.cosmic_message}"</p>
            </div>

            {/* Bottom Padding for smooth scroll */}
            <div className="h-10"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide p-4 md:p-6 animate-in fade-in duration-700 pb-20">
      <div className="min-h-full w-full flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Vận Trình Ngày Mới
          </h2>
          <p className="text-purple-300/80 italic font-medium max-w-md mx-auto leading-relaxed">
            Khám phá năng lượng vũ trụ dành riêng cho bạn trong 24h tới.
          </p>
        </div>

        <div className="bg-[#0d0d16]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="space-y-6">
            {/* Birth Info Section */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3">
                  <UserIcon className="w-3 h-3" /> Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3">
                    <CalendarIcon className="w-3 h-3" /> Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3">
                    <CalendarIcon className="w-3 h-3" /> Ngày dự đoán
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-white [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 block">
                Chọn lĩnh vực dự đoán
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedField(cat.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${selectedField === cat.id
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                  >
                    {cat.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-white shadow-xl hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  XEM LUẬN GIẢI NGAY
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DailyPrediction;
