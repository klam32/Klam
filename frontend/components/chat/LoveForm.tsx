import React, { useState, useEffect } from "react"
import { User, Calendar, MapPin, Heart } from "lucide-react"

// =========================
// TYPES
// =========================
type Partner = {
  name: string
  year: number | null
  month: number | null
  day: number | null
  hour: number
  minute: number
  city: string
  country: string
}

type LoveFormProps = {
  onSubmit: (data: any) => void
  isLoading: boolean
  userData: any
}

// =========================
// DATA
// =========================
const VIETNAM_PROVINCES = [
  "An Giang","Bà Rịa - Vũng Tàu","Bạc Liêu","Bắc Giang","Bắc Kạn","Bắc Ninh",
  "Bến Tre","Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau",
  "Cao Bằng","Cần Thơ","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên",
  "Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh",
  "Hải Dương","Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa",
  "Kiên Giang","Kon Tum","Lai Châu","Lạng Sơn","Lào Cai","Lâm Đồng",
  "Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ",
  "Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị",
  "Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa",
  "Thừa Thiên Huế","Tiền Giang","TP. Hồ Chí Minh","Trà Vinh","Tuyên Quang",
  "Vĩnh Long","Vĩnh Phúc","Yên Bái"
]

// =========================
// COMPONENT
// =========================
const LoveForm: React.FC<LoveFormProps> = ({ onSubmit, isLoading, userData }) => {

  const [partner, setPartner] = useState<Partner>({
    name: "",
    year: null,
    month: null,
    day: null,
    hour: 0,
    minute: 0,
    city: "Hà Nội",
    country: "VN"
  })

  const [date, setDate] = useState<string>("")
  const [openCity, setOpenCity] = useState<boolean>(false)
  const [searchCity, setSearchCity] = useState<string>("")
  const [highlightIndex, setHighlightIndex] = useState<number>(0)
  const [timeInput, setTimeInput] = useState("00:00")
  const [openTime, setOpenTime] = useState(false)

  const filteredCities = VIETNAM_PROVINCES.filter(c =>
    c.toLowerCase().includes(searchCity.toLowerCase())
  )

  useEffect(() => {
    const close = () => setOpenCity(false)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [])

  // =========================
  // DATE HANDLE
  // =========================
  const handleDateChange = (value: string) => {
    setDate(value)

    if (!value) return

    const [year, month, day] = value.split("-")

    setPartner((prev: Partner) => ({
      ...prev,
      year: Number(year),
      month: Number(month),
      day: Number(day)
    }))
  }
  const handleTimeChange = (value: string) => {
    setTimeInput(value)

    const match = value.match(/^(\d{1,2}):(\d{1,2})$/)
    if (!match) return

    const h = Math.min(23, Math.max(0, Number(match[1])))
    const m = Math.min(59, Math.max(0, Number(match[2])))

    setPartner(prev => ({
      ...prev,
      hour: h,
      minute: m
    }))
  }
  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = () => {

    if (!userData) {
      alert("⚠️ Bạn phải nhập bản đồ sao trước!")
      return
    }

    if (!partner.name) {
      alert("⚠️ Vui lòng nhập tên người kia")
      return
    }

    if (!partner.year || !partner.month || !partner.day) {
      alert("⚠️ Vui lòng chọn ngày sinh hợp lệ")
      return
    }

    console.log("🔥 SEND PARTNER:", partner)

    onSubmit({
      ...userData,
      partner,
      field: "love",
      context: ""   
    })
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="mt-6 max-w-2xl mx-auto">

      <div className="bg-[#0d0d16]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-xl">

        {/* TITLE */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-pink-400 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5" /> Phân tích tình cảm
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Nhập thông tin người còn lại để xem độ tương hợp
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* NAME */}
          <div>
            <label className="label-love">
              <User className="icon-love" /> Tên người kia
            </label>
            <input
              className="input-love"
              placeholder="Ví dụ: Nguyễn Văn B"
              onChange={e =>
                setPartner({ ...partner, name: e.target.value })
              }
            />
          </div>

          {/* DATE */}
          <div>
            <label className="label-love">
              <Calendar className="icon-love" /> Ngày sinh
            </label>
            <input
              type="date"
              value={date}
              onChange={e => handleDateChange(e.target.value)}
              className="input-love [color-scheme:dark]"
            />
          </div>
          {/* TIME */}
          <div>
            <label className="label-love">
              🕐 Giờ sinh
            </label>

            <div className="flex gap-3">

              {/* HOUR */}
              <select
                value={partner.hour}
                onChange={(e) =>
                  setPartner({ ...partner, hour: Number(e.target.value) })
                }
                className="input-love"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")} giờ
                  </option>
                ))}
              </select>

              {/* MINUTE */}
              <select
                value={partner.minute}
                onChange={(e) =>
                  setPartner({ ...partner, minute: Number(e.target.value) })
                }
                className="input-love"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")} phút
                  </option>
                ))}
              </select>

            </div>
          </div>
          {/* CITY */}
          <div>
            <label className="label-love">
              <MapPin className="icon-love" /> Nơi sinh
            </label>

            <div className="relative">

              <input
                value={searchCity}
                onFocus={() => setOpenCity(true)}
                onChange={(e) => {
                  setSearchCity(e.target.value)
                  setOpenCity(true)
                  setHighlightIndex(0)
                }}
                onKeyDown={(e) => {
                  if (!openCity) return

                  if (e.key === "ArrowDown") {
                    setHighlightIndex(prev =>
                      Math.min(prev + 1, filteredCities.length - 1)
                    )
                  }

                  if (e.key === "ArrowUp") {
                    setHighlightIndex(prev =>
                      Math.max(prev - 1, 0)
                    )
                  }

                  if (e.key === "Enter") {
                    const selected = filteredCities[highlightIndex]
                    if (selected) {
                      setPartner({ ...partner, city: selected })
                      setSearchCity(selected)
                      setOpenCity(false)
                    }
                  }
                }}
                placeholder="Nhập tỉnh/thành..."
                className="input-love"
              />

              {openCity && (
                <div className="absolute z-50 mt-2 w-full bg-[#0a0a14] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">

                  {filteredCities.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Không tìm thấy
                    </div>
                  )}

                  {filteredCities.map((province, index) => (
                    <div
                      key={province}
                      onClick={() => {
                        setPartner({ ...partner, city: province })
                        setSearchCity(province)
                        setOpenCity(false)
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm transition-all
                        ${index === highlightIndex
                          ? "bg-pink-500/30 text-white"
                          : "hover:bg-pink-600/20"
                        }`}
                    >
                      {province}
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 w-full py-4 rounded-xl font-bold 
          bg-gradient-to-r from-pink-500 to-red-500 
          hover:opacity-90 transition-all 
          shadow-lg shadow-pink-500/20"
        >
          {isLoading ? "Đang phân tích..." : "Phân tích 💘"}
        </button>

      </div>
    </div>
  )
}

export default LoveForm