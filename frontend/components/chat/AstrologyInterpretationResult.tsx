import React from 'react';
import { formatText } from "../../utils/formatText";
import { Download, Star, Orbit } from "lucide-react";

interface Props {
  content?: string;
  analysis?: string;
  answer?: string;
  chart_svg?: string;
  chartSummary?: any;
}

// 🔥 mapping zodiac
const zodiacFullName: Record<string, string> = {
  Ari: "Aries",
  Tau: "Taurus",
  Gem: "Gemini",
  Can: "Cancer",
  Leo: "Leo",
  Vir: "Virgo",
  Lib: "Libra",
  Sco: "Scorpio",
  Sag: "Sagittarius",
  Cap: "Capricorn",
  Aqu: "Aquarius",
  Pis: "Pisces"
};

const AstrologyInterpretationResult: React.FC<Props> = ({
  content,
  analysis,
  answer,
  chart_svg,
  chartSummary
}) => {

  let safeContent = analysis || content || "";
  let safeAnswer = answer || "";

  // 🔥 FOLLOWUP toggle
  const [showDetail, setShowDetail] = React.useState(false);
  const isFollowUp = !!safeAnswer;

  // 🔥 DOWNLOAD
  const downloadChart = () => {
    if (!chart_svg) return;

    const blob = new Blob([chart_svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "astrology-chart.svg";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-700">

      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* 🔮 CHART */}
        {chart_svg && (
          <div className="w-full max-w-5xl mx-auto group">
            <div className="relative bg-[#0d0d16]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.6)] transition duration-500 group-hover:shadow-[0_0_140px_rgba(100,0,255,0.3)]">

              {/* DOWNLOAD */}
              <button
                onClick={downloadChart}
                className="absolute top-5 right-5 z-20 p-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl text-blue-300 transition-all hover:scale-105"
              >
                <Download className="w-5 h-5" />
              </button>

              <div 
                className="astrology-chart-svg w-full flex justify-center mt-6 transition duration-500 group-hover:scale-[1.03]"
                dangerouslySetInnerHTML={{ __html: chart_svg }} 
              />
            </div>
          </div>
        )}

        {/* 🔥 CHART SUMMARY */}
        {chartSummary && (
          <div className="w-full max-w-4xl space-y-3">

            {[
              { label: "Mặt Trời", value: chartSummary.sun },
              { label: "Mặt Trăng", value: chartSummary.moon },
              { label: "Cung Mọc", value: chartSummary.ascendant }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center"
              >
                <div className="text-sm text-gray-300">{item.label}</div>
                <div className="text-sm font-semibold text-purple-300">
                  {zodiacFullName[item.value] || item.value}
                </div>
              </div>
            ))}

          </div>
        )}

        {/* 🔵 ANSWER (BỰ NHƯ LOVE) */}
        {safeAnswer && (
          <div className="w-full max-w-4xl mx-auto 
                          p-8 md:p-12 
                          bg-gradient-to-br from-[#1a1a2e]/80 via-[#16213e]/80 to-[#0f3460]/80
                          border border-white/10 
                          rounded-[2rem] 
                          shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.02)]
                          backdrop-blur-2xl 
                          transition duration-500 hover:shadow-[0_0_100px_rgba(120,0,255,0.1)]
                          relative overflow-hidden group">
            
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700"></div>

            <div className="flex items-center gap-3 mb-8 opacity-60">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-purple-400"></div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-purple-300">
                Lời nhắn từ Vũ trụ
              </span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-purple-400"></div>
            </div>

            <div className="relative z-10 text-gray-100">
              {formatText(safeAnswer)}
            </div>
          </div>
        )}

        {/* 🔥 TOGGLE (CHỈ FOLLOWUP) */}
        {isFollowUp && (
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="group relative px-8 py-3 rounded-full overflow-hidden transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all"></div>
            <div className="absolute inset-0 border border-white/10 rounded-full"></div>
            <span className="relative z-10 text-sm font-bold text-white tracking-widest flex items-center gap-2">
              {showDetail ? "▲ THU GỌN" : "▼ XEM CHI TIẾT GIẢI MÃ"}
            </span>
          </button>
        )}

        {/* 🟣 ANALYSIS */}
        {(!isFollowUp || showDetail) && (
          <div className={`w-full max-w-5xl mx-auto p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-[#050508]/60 backdrop-blur-xl transition-all duration-1000 ${showDetail ? 'animate-in fade-in slide-in-from-top-8' : ''}`}>

            <div className="flex items-center gap-4 mb-10">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Star className="w-5 h-5 text-white fill-white" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Giải Mã Bản Đồ Sao</h3>
                  <div className="h-1 w-12 bg-purple-500 mt-1 rounded-full opacity-50"></div>
               </div>
            </div>

            <div className="pro-text text-gray-200/90 font-light tracking-wide leading-relaxed">
              {formatText(
                (safeContent || "")
                  .replace(/```json/g, "")
                  .replace(/```/g, "")
                  .replace(/\*\*\*/g, "")
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-white/30 uppercase tracking-[0.2em] font-medium">
                <Orbit className="w-3 h-3" />
                Dữ liệu dựa trên vị trí thực của các hành tinh
              </div>
              <div className="text-[11px] text-white/20 italic">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AstrologyInterpretationResult;