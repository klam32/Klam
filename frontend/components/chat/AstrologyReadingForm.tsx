import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, User, Send } from 'lucide-react';

interface AstrologyReadingFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
}

const FIELDS = [
  { id: 'Tổng quan vận mệnh', label: 'Tổng quan vận mệnh' },
  { id: 'Tính cách & Phẩm chất', label: 'Tính cách & Phẩm chất' },
  { id: 'Tình cảm & Mối quan hệ', label: 'Tình cảm & Mối quan hệ' },
  { id: 'Sự nghiệp & Công danh', label: 'Sự nghiệp & Công danh' },
  { id: 'Sức khỏe & Bình an', label: 'Sức khỏe & Bình an' },
];

const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const AstrologyReadingForm: React.FC<AstrologyReadingFormProps> = ({ onSubmit, isLoading, isLoggedIn, onAuthRequired }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    city: 'Hà Nội',
    country: 'VN',
    field: 'Tổng quan vận mệnh',
    context: ''
  });

  const [partnerData, setPartnerData] = useState({
    name: '',
    date: '',
    time: '',
    city: 'Hà Nội'
  });

  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setIsStarted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.city) {
      alert("Vui lòng nhập đầy đủ thông tin ngày giờ sinh.");
      return;
    }

    const [year, month, day] = formData.date.split('-').map(Number);
    const [hour, minute] = formData.time.split(':').map(Number);

    let partner = null;
    if (formData.field === "Tình cảm & Mối quan hệ" && partnerData.name && partnerData.date) {
        const [pY, pM, pD] = partnerData.date.split('-').map(Number);
        const [pH, pMi] = (partnerData.time || "00:00").split(':').map(Number);
        partner = {
            name: partnerData.name,
            year: pY,
            month: pM,
            day: pD,
            hour: pH,
            minute: pMi,
            city: partnerData.city,
            country: 'VN'
        };
    }

    onSubmit({
      name: formData.name,
      year,
      month,
      day,
      hour,
      minute,
      city: formData.city,
      country: formData.country,
      field: formData.field,
      context: formData.context,
      partner
    });
  };

  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-5 text-center bg-[#0d0d16]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.15)] animate-in fade-in zoom-in duration-1000 ">
        <div className="relative inline-block mb-10">
           <div className="absolute inset-0 bg-purple-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
           <Sparkles className="w-16 h-16 text-amber-500 relative z-10 animate-spin-slow" />
        </div>
        <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 bg-clip-text text-transparent leading-tight tracking-tighter">
          Zodiac Whisper
        </h1>
        <p className="text-xl text-purple-200/60 mb-12 font-medium leading-relaxed max-w-md mx-auto">
          Lắng nghe lời thì thầm từ các vì sao. Khám phá bản đồ sao cá nhân để thấu hiểu vận mệnh của chính mình.
        </p>
        <button
          onClick={handleStart}
          className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-xl text-white shadow-[0_15px_40px_rgba(168,85,247,0.4)] hover:shadow-purple-500/60 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>

            <span className="relative z-10 flex items-center justify-center gap-2 
                            font-semibold tracking-[0.08em] text-white 
                            leading-none whitespace-nowrap">

              <span className="block text-center">
                XEM BẢN ĐỒ SAO
              </span>

              <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

            </span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-[#0d0d16]/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 mb-2 tracking-tight">
          Thông Tin Bản Đồ Sao
        </h2>
        <p className="text-purple-200/50 font-medium">Vui lòng cung cấp chính xác ngày giờ sinh để AI tính toán chính xác nhất</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3 ml-1">
              <User className="w-3 h-3" /> Họ và tên
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3 ml-1">
              <Calendar className="w-3 h-3" /> Ngày sinh
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Birth Time */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3 ml-1">
              <Clock className="w-3 h-3" /> Giờ sinh
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* City */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3 ml-1">
              <MapPin className="w-3 h-3" /> Nơi sinh
            </label>
            <div className="relative">
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#0a0a14] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Chọn tỉnh/thành phố --</option>
                {VIETNAM_PROVINCES.map(province => (
                  <option key={province} value={province} className="bg-[#0a0a14] text-white">
                    {province}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Field */}
          <div>
            <label className="text-xs font-black text-purple-400 uppercase tracking-widest mb-3 ml-1 block">
              Lĩnh vực luận giải
            </label>
            <div className="grid grid-cols-1 gap-3">
              {FIELDS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormData({...formData, field: f.id})}
                  className={`px-4 py-3 rounded-lg text-sm border text-left transition-all duration-300 ${formData.field === f.id ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                >
                  <span className="text-sm font-bold">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Context or Partner Info */}
          {formData.field === 'Tình cảm & Mối quan hệ' && (
            <div className="pt-4 border-t border-white/10 mt-4 space-y-4 animate-in slide-in-from-top duration-500">
               <h3 className="text-sm font-bold text-pink-400 flex items-center gap-2 mb-2">
                 <Sparkles className="w-4 h-4" /> Thông tin đối phương
               </h3>
               
               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Tên đối phương"
                      value={partnerData.name}
                      onChange={(e) => setPartnerData({...partnerData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={partnerData.date}
                      onChange={(e) => setPartnerData({...partnerData, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all [color-scheme:dark]"
                    />
                    <input
                      type="time"
                      value={partnerData.time}
                      onChange={(e) => setPartnerData({...partnerData, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all [color-scheme:dark]"
                    />
                  </div>

                  <select
                    value={partnerData.city}
                    onChange={(e) => setPartnerData({...partnerData, city: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#0a0a14] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Nơi sinh đối phương --</option>
                    {VIETNAM_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
               </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="relative flex items-center justify-center gap-4 text-xl tracking-wider">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ĐANG GIẢI MÃ CÁC VÌ SAO...
                </>
              ) : (
                <>
                  KHAI MỞ VẬN MỆNH
                  <Sparkles className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .font-title {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default AstrologyReadingForm;
