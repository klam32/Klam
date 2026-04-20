import React from "react"
import { AlertTriangle } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
}

const ConfirmModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "Xóa lịch sử?",
  description = "Bạn có chắc muốn xóa toàn bộ lịch sử?"
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">

      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] text-white rounded-2xl px-6 py-6 w-[360px] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95">

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full border border-orange-400 flex items-center justify-center">
            <AlertTriangle className="text-orange-400" size={26} />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-center text-xl font-semibold mb-2">
          {title}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-center text-sm text-gray-400 mb-6">
          {description}
        </p>

        {/* BUTTONS */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
          >
            Xác nhận xóa
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition"
          >
            Quay lại
          </button>
        </div>

      </div>
    </div>
  )
}

export default ConfirmModal