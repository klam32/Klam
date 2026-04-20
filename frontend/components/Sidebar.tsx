import React from "react"
import { User, View, Conversation } from "../types"
import { API_ROOT, api } from "../api"
import { Sparkles, DollarSign, Shield, Star, User as UserIcon, Trash, Calendar, Zap, Pin, Edit2, Check, X } from "lucide-react"
import ConfirmModal from "./ConfirmModal"
import Toast from "./Toast"

interface SidebarProps {
  user: User | null
  currentView: View
  onViewChange: (view: View) => void
  onLogout: () => void
  siteConfig?: { logo_url: string; site_title: string }

  conversations?: Conversation[]
  setChatHistory?: React.Dispatch<any>
  setCurrentConversationId?: (id: number | null) => void
  currentConversationId?: number | null
  createNewChat?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentView,
  onViewChange,
  onLogout,
  siteConfig,
  conversations,
  setChatHistory,
  setCurrentConversationId,
  currentConversationId,
  createNewChat,
}) => {
  const [imgError, setImgError] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("")
  const toastTimeout = React.useRef<any>(null)

  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editingTitle, setEditingTitle] = React.useState("")
  const [contextMenuId, setContextMenuId] = React.useState<number | null>(null)

  const navItems = [
    { id: "landing" as View, label: "Trang Chủ", icon: Star },
    { id: "chat" as View, label: "Chiêm Tinh", icon: Star },
    { id: "calendar" as View, label: "Lịch Cát Tường", icon: Calendar },
    { id: "prediction" as View, label: "Vận Trình Ngày", icon: Zap },
    { id: "payment" as View, label: "Nạp Điểm", icon: DollarSign },
    ...(user?.is_admin
      ? [
          {
            id: "admin" as View,
            label: "ADMIN",
            icon: Shield,
          },
        ]
      : []),
    { id: "profile" as View, label: "Hồ Sơ", icon: UserIcon },
  ]

  // =========================
  // LOAD CONVERSATION
  // =========================

  const loadConversation = async (convId: number) => {
    try {
      const res = await api.getChatHistory()

      const filtered = res.history
        .filter((m: any) => m.conversation_id === convId)
        .map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))

      setChatHistory?.(filtered)
      setCurrentConversationId?.(convId)
      
      // 🔥 KIỂM TRA TIÊU ĐỀ ĐỂ CHỌN VIEW PHÙ HỢP
      const conv = conversations?.find(c => c.id === convId)
      if (conv?.title?.startsWith("[Lịch Cát Tường]")) {
        onViewChange("calendar")
      } else if (conv?.title?.startsWith("[Vận Trình Ngày]")) {
        onViewChange("prediction")
      } else {
        onViewChange("chat")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePin = async (e: React.MouseEvent, convId: number, currentPinned: boolean) => {
    e.stopPropagation()
    try {
      await api.toggleConversationPin(convId, !currentPinned)
      window.dispatchEvent(new Event("reload_conversations"))
      setToastMessage(!currentPinned ? "Đã ghim đoạn chat" : "Đã bỏ ghim đoạn chat")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const startEditing = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditingTitle(conv.title)
  }

  const saveTitle = async (e: React.MouseEvent | React.KeyboardEvent, convId: number) => {
    if (e.type === "click" || (e as React.KeyboardEvent).key === "Enter") {
      try {
        await api.updateConversationTitle(convId, editingTitle)
        setEditingId(null)
        window.dispatchEvent(new Event("reload_conversations"))
        setToastMessage("Đã đổi tên đoạn chat")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
  }

  const handleContextMenu = (e: React.MouseEvent, convId: number) => {
    e.preventDefault()
    setContextMenuId(contextMenuId === convId ? null : convId)
  }

  // Click outside to hide context menu
  React.useEffect(() => {
    const handleClick = () => setContextMenuId(null)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  return (
    <aside className="hidden md:flex w-[260px] bg-[#0f0f11] border-r border-white/10 flex-col h-screen">

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden px-3 py-4">

        {/* HEADER */}
        <div className="flex items-center gap-2 px-2 mb-4">

          {siteConfig?.logo_url ? (
            <img
              src={
                siteConfig.logo_url.startsWith("/")
                  ? `${API_ROOT}${siteConfig.logo_url}`
                  : siteConfig.logo_url
              }
              className="w-8 h-8 rounded-md"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          )}

          <h1 className="text-sm font-semibold text-white tracking-wide">
            {siteConfig?.site_title || "Zodiac Whisper"}
          </h1>

        </div>

        {/* NEW CHAT */}
        {user && (
          <button
            onClick={() => {
              setChatHistory?.([])
              setCurrentConversationId?.(null)
              onViewChange("chat")
              // 🔥 RESET UI CHATVIEW
              window.dispatchEvent(new Event("NEW_CHAT_RESET"))
              createNewChat?.()
            }}
            className="flex items-center gap-2 w-full px-3 py-2 mb-3 text-sm text-white bg-[#1f1f23] hover:bg-[#2a2a30] rounded-lg transition"
          >
            <Sparkles size={16} />
            Đoạn chat mới
          </button>
        )}

        {/* NAVIGATION */}
        <nav className="space-y-1 mb-4">

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition ${
                currentView === item.id
                  ? "bg-[#2a2a30] text-white"
                  : "text-gray-400 hover:bg-[#1f1f23] hover:text-white"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <item.icon size={25} />
              </svg>

              {item.label}
            </button>
          ))}

        </nav>

        {/* CONVERSATION HISTORY */}
        {conversations && conversations.length > 0 && (
          <div className="flex flex-col flex-1 min-h-0">

            <p className="text-xs text-gray-500 px-3 mb-2">
              Các đoạn chat của bạn
            </p>

            <div className="flex-1 overflow-y-auto space-y-1 px-1">

              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onContextMenu={(e) => handleContextMenu(e, conv.id)}
                  className={`flex items-center justify-between group rounded-lg transition px-2 ${
                    currentConversationId === conv.id ? "bg-[#2a2a30] shadow-sm" : "hover:bg-[#1f1f23]"
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1 w-full py-1">
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => saveTitle(e, conv.id)}
                        className="flex-1 bg-[#0f0f11] text-sm text-white px-2 py-1 rounded border border-blue-500 outline-none"
                      />
                      <button onClick={(e) => saveTitle(e, conv.id)} className="text-green-400 hover:text-green-300">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEditing} className="text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => loadConversation(conv.id)}
                        className={`flex-1 text-left px-1 py-2 text-sm truncate transition flex items-center gap-2 ${
                          currentConversationId === conv.id
                            ? "text-white font-medium"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        {!!conv.is_pinned && <Pin size={12} className="text-yellow-500 fill-yellow-500" />}
                        <span className="truncate">
                          {(() => {
                            const t = (conv.title || "").trim().toLowerCase()
                            if (!t || t === "mới") return "Đoạn chat mới"
                            return conv.title
                          })()}
                        </span>
                      </button>

                      {contextMenuId === conv.id && (
                        <div className="flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => handlePin(e, conv.id, !!conv.is_pinned)}
                            className={`${conv.is_pinned ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"}`}
                            title={conv.is_pinned ? "Bỏ ghim" : "Ghim"}
                          >
                            <Pin size={16} />
                          </button>
                          <button
                            onClick={(e) => startEditing(e, conv)}
                            className="text-gray-500 hover:text-blue-400"
                            title="Đổi tên"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteId(conv.id)
                            }}
                            className="text-gray-500 hover:text-red-500"
                            title="Xóa"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

            </div>

          </div>
        )}
      </div>

      {/* USER FOOTER */}
      <div className="border-t border-white/10 p-3">

        {user ? (
          <>
            <div
              onClick={() => onViewChange("profile")}
              className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-[#1f1f23] p-2 rounded-lg"
            >

              {user.picture_url && !imgError ? (
                <img
                  src={user.picture_url}
                  className="w-8 h-8 rounded-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                  {(user.username || "U")[0].toUpperCase()}
                </div>
              )}

              <div className="flex-1">

                <p className="text-sm text-white">
                  {user.full_name || user.username}
                </p>

                <p className="text-xs text-gray-400">
                  {user.is_admin
                    ? ""
                    : (user.token_balance ?? 0).toFixed(2) + " Tokens"}
                </p>

              </div>

            </div>

            <button
              onClick={onLogout}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <div className="text-center">

            <p className="text-xs text-gray-500 mb-2">
              Đăng nhập để lưu lịch sử
            </p>

            <button
              onClick={() => onViewChange("profile")}
              className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm"
            >
              Bắt đầu ngay
            </button>

          </div>
        )}

      </div>
      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return

          await api.deleteConversation(deleteId)

          // 🔥 FIX 1 (THÊM VÀO ĐÂY)
          setCurrentConversationId?.(null)
          setChatHistory?.([])

          setDeleteId(null)

          window.dispatchEvent(new Event("reload_conversations"))

          setToastMessage("Đã xóa đoạn chat")
          setShowToast(true)

          if (toastTimeout.current) {
            clearTimeout(toastTimeout.current)
          }

          toastTimeout.current = setTimeout(() => {
            setShowToast(false)
          }, 2500)
        }}
        title="Xóa lịch sử?"
        description="Bạn có chắc muốn xóa toàn bộ lịch sử?"
      />
    <Toast message={toastMessage} show={showToast} />
    </aside>
  )
}

export default Sidebar