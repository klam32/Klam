import React from "react"

interface Props {
  message: string
  show: boolean
}

const Toast: React.FC<Props> = ({ message, show }) => {
  if (!show) return null

  return (
    <div className="fixed top-5 right-5 z-50 bg-white shadow-lg px-4 py-3 rounded-xl flex items-center gap-2 border animate-in slide-in-from-top">
      <span className="text-green-500">✔</span>
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  )
}

export default Toast