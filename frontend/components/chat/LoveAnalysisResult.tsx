
import React from "react"
import { Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { formatText } from "../../utils/formatText";
const LoveAnalysisResult = ({
  chart1,
  chart2,
  percent,
  label,
  interpretation,
  name1,
  name2
}: any) => {

  const safePercent = percent ?? 0

  // ✅ VALIDATE SVG (FIX CRASH)
  const isValidSVG = (svg: string) =>
    typeof svg === "string" && svg.includes("<svg")

  // 🔥 DOWNLOAD FUNCTION
  const downloadChart = (svg: string, name: string) => {
    if (!isValidSVG(svg)) return

    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${name}-${Date.now()}.svg`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">

      {/* 💘 HEADER */}
      <div className="text-center">
        <h2 className="text-3xl font-title font-bold text-pink-400 tracking-wide">
          💖 Độ tương hợp: {safePercent}%
        </h2> 
        {label && (
          <p className="text-gray-400 mt-1 text-sm tracking-wide">
            {label}
          </p>
        )}
      </div>

      {/* 🌌 2 CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* PERSON 1 */}
        <div className="chart-card-blue relative">

          {isValidSVG(chart1) && (
            <button
              onClick={() => downloadChart(chart1, "chart-ban")}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 
              bg-blue-500/20 hover:bg-blue-500/40 
              border border-blue-400/30 
              text-blue-300 text-xs font-bold uppercase tracking-wider
              rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Tải
            </button>
          )}

          <h3 className="chart-title-blue">
            🌌 Bản đồ sao của bạn {name1}
          </h3>

          {isValidSVG(chart1) ? (
            <div
              className="chart-wrapper"
              dangerouslySetInnerHTML={{ __html: chart1 }}
            />
          ) : (
            <p className="chart-empty">Không có dữ liệu biểu đồ</p>
          )}
        </div>

        {/* PERSON 2 */}
        <div className="chart-card-pink relative">

          {isValidSVG(chart2) && (
            <button
              onClick={() => downloadChart(chart2, "chart-nguoi-kia")}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 
              bg-pink-500/20 hover:bg-pink-500/40 
              border border-pink-400/30 
              text-pink-300 text-xs font-bold uppercase tracking-wider
              rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Tải
            </button>
          )}

          <h3 className="chart-title-pink">
            🌙 Bản đồ sao của nữa kia {name2}
          </h3>

          {isValidSVG(chart2) ? (
            <div
              className="chart-wrapper"
              dangerouslySetInnerHTML={{ __html: chart2 }}
            />
          ) : (
            <p className="chart-empty">Không có dữ liệu biểu đồ</p>
          )}
        </div>

      </div>

      {/* 📊 BAR */}
      <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 transition-all duration-700"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      {/* 📜 AI TEXT */}
      {interpretation && (
        <div className="bg-[#0a0a14]/70 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
          <h3 className="text-white text-lg font-semibold mb-4">
            Phân tích chi tiết
          </h3>

          <div className="bg-[#0d0d16]/90 border rounded-2xl p-6">
            {formatText((interpretation || "").replace(/\*\*\*/g, ""))}
          </div>
        </div>
      )}

    </div>
  )
}

export default LoveAnalysisResult