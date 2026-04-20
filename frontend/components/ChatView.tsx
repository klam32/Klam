// 

import React, { useState, useRef, useEffect, useMemo, useCallback, useDeferredValue } from 'react'
import { User, ChatMessage } from '../types'
import { api, API_ROOT } from '../api'
import AuthModal from './AuthModal'
import toast from 'react-hot-toast'
import { confirmDestructive } from '../utils/swal'
import ChatMessageItem from './chat/ChatMessageItem'
import AstrologyReadingForm from './chat/AstrologyReadingForm'
import LoveForm from './chat/LoveForm'
import { Trash2, Orbit, Send } from 'lucide-react'

const FIELD_AGENT_MAP: Record<string, string> = {
  "Tổng quan vận mệnh": "astrology",
  "Tính cách & Phẩm chất": "personality",
  "Tình cảm & Mối quan hệ": "love",
  "Sự nghiệp & Công danh": "career",
  "Sức khỏe & Bình an": "daily"
}

interface ChatViewProps {
  user: User | null
  onAuthRequired: () => void
  history: ChatMessage[]
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  onBalanceUpdate: (balance: number) => void
  siteConfig?: { logo_url: string, site_title: string }

  conversationId?: number | null
  setConversationId?: (id: number | null) => void
}

const ChatView: React.FC<ChatViewProps> = ({
  user,
  history,
  setHistory,
  onBalanceUpdate,
  siteConfig,
  conversationId,
  setConversationId: externalSetConversationId
}) => {

  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [input, setInput] = useState("")
  const [selectedField, setSelectedField] = useState("Tổng quan vận mệnh")
  const [userBirthData, setUserBirthData] = useState<any>(null)
  const deferredInput = useDeferredValue(input)
  const [isLoveMode, setIsLoveMode] = useState(false)
  const [showLoveForm, setShowLoveForm] = useState(false)
  const loveFormRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, isLoading])

  useEffect(() => {
    if (!user) return
    if (conversationId) return
    loadLatestConversation()
  }, [user])

  useEffect(() => {
  const handleReset = () => {
    setSelectedField("Tổng quan vận mệnh")
    setIsLoveMode(false)
    setShowLoveForm(false)
    setUserBirthData(null)
    setInput("")
  }

  window.addEventListener("NEW_CHAT_RESET", handleReset)

  return () => {
    window.removeEventListener("NEW_CHAT_RESET", handleReset)
  }
}, [])
  const loadLatestConversation = async () => {
    try {
      const convRes = await api.getConversations()
      if (!convRes.conversations?.length) return
      const latest = convRes.conversations[0]
      externalSetConversationId?.(latest.id)
      loadConversationMessages(latest.id)
    } catch(err){
      console.error(err)
    }
  }

  const loadConversationMessages = async (convId:number)=>{
    try{
      const res = await api.getChatHistory()
      if(!res.history) return
      const filtered = res.history
        .filter((m:any)=>m.conversation_id === convId)
        .map((m:any)=>({
          ...m,
          analysis: m.analysis || m.chart,
        }))
      setHistory(filtered)
    }catch(err){
      console.error(err)
    }
  }

  const handleClearHistory = async () => {
    if (!user) return
    const confirmed = await confirmDestructive(
      "Xóa lịch sử?",
      "Bạn có chắc muốn xóa toàn bộ lịch sử?"
    )
    if (!confirmed) return

    try {
      await api.deleteChatHistory()
      setHistory([])
      externalSetConversationId?.(null)
      window.dispatchEvent(new Event("reload_conversations"))
      toast.success("Đã xóa đoạn chat", {
        icon: "✅",
        style: {
          background: "#111",
          color: "#fff",
          border: "1px solid #333"
        }
      })
    } catch(err:any){
      toast.error(err.message)
    }
  }

  // =========================
  // 🔥 FIRST MESSAGE
  // =========================
  const handleAstrologySubmit = async (data:any) => {
    if (isLoading) return
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setUserBirthData(data)
    if (data.partner) {
      setIsLoveMode(true)
    }
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Luận giải cho ${data.name}`,
      timestamp: new Date()
    }

    setHistory(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await api.sendMessage({
        ...data,
        field: FIELD_AGENT_MAP[data.field] || "astrology",
        conversation_id: conversationId ?? undefined
      })

      externalSetConversationId?.(response.conversation_id ?? null)

      const botMsg: ChatMessage = {
        id: (Date.now()+1).toString(),
        role: "assistant",

        // 🔥 FIX QUAN TRỌNG NHẤT
        content: response.chart || "",

        // 🔥 INIT không có answer → để rỗng
        answer: response.answer || "",

        chart: response.chart,
        timestamp: new Date(),
        tokens_charged: response.tokens_charged
      }

      if (response.sections && response.sections.length > 0) {
        (botMsg as any).sections = response.sections
      }

      if (response.chart_summary) (botMsg as any).chart_summary = response.chart_summary
      if (response.chart_svg) (botMsg as any).chart_svg = response.chart_svg
      if (response.partner_chart_svg) (botMsg as any).partner_chart_svg = response.partner_chart_svg

      // if (response.compatibility !== null && response.compatibility !== undefined) {
      // if (response.mode === "love") {
      //   (botMsg as any).compatibility = response.compatibility
      //   ;(botMsg as any).label = response.label
      //   ;(botMsg as any).partner_chart_svg = response.partner_chart_svg

      //   setShowLoveForm(false)
      // }
      if (response.partner_chart_svg) {
          (botMsg as any).compatibility = response.compatibility
          ;(botMsg as any).label = response.label
          ;(botMsg as any).partner_chart_svg = response.partner_chart_svg

          setShowLoveForm(false) // 🔥 CHẮC CHẮN CHẠY
        }

      setHistory(prev => [...prev, botMsg])
      onBalanceUpdate(response.user_token_balance)
      window.dispatchEvent(new Event("reload_conversations"))

    } catch(err:any){
      toast.error(err.message)
      setHistory(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setIsLoading(false)
    }
  }

  // =========================
  // 🔥 FOLLOW-UP (FIXED)
  // =========================
  const sendChat = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!conversationId) {
      toast.error("Chưa có cuộc trò chuyện")
      return
    }

    const message = input || "Phân tích thêm"

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message, // 🔥 FIX QUAN TRỌNG
      timestamp: new Date()
    }

    setHistory(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await api.sendChatFollowup({
        conversation_id: conversationId,
        field: FIELD_AGENT_MAP[selectedField] || "astrology",
        question: message
      })

      const botMsg: ChatMessage = {
        id: (Date.now()+1).toString(),
        role: "assistant",
        //content: null,
        content: response.analysis || response.answer || "",              
        answer: response.answer,   
        chart: null,          
        analysis: response.analysis,
        timestamp: new Date(),
        tokens_charged: response.tokens_charged
      }

      if (response.sections && response.sections.length > 0) {
        (botMsg as any).sections = response.sections
      }
      if (response.mode === "love") {
        (botMsg as any).compatibility = response.compatibility
        ;(botMsg as any).label = response.label
        ;(botMsg as any).partner_chart_svg = response.partner_chart_svg
      }

      setHistory(prev => [...prev, botMsg])
      onBalanceUpdate(response.user_token_balance)
      setInput("")
      window.dispatchEvent(new Event("reload_conversations"))

    } catch(err:any){
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }

  }, [input, selectedField, conversationId, user])

  // =========================
  // 🔥 TAB SELECT (CLEAN)
  // =========================
  const selectField = useCallback((field:string) => {
    setSelectedField(field)

    const isLove = field === "Tình cảm & Mối quan hệ"

    setIsLoveMode(isLove)
    setShowLoveForm(true)
    if (field !== "Tình cảm & Mối quan hệ") {
        setShowLoveForm(false)
      } else {
        setShowLoveForm(true)
      }
    if (isLove) {
      setTimeout(() => {
        loveFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })
      }, 100)
    }

  }, [])

  const filteredHistory = history.filter(msg => {
    if (!msg.sections) return true

    return msg.sections.some(s => 
      s.agent === FIELD_AGENT_MAP[selectedField]
    )
  })

  const renderedMessages = useMemo(() => {
    return filteredHistory.map(msg => (
      <ChatMessageItem
        key={msg.id}
        msg={msg}
        userAvatar={user?.picture_url}
        botAvatar={
          siteConfig?.logo_url
            ? (siteConfig.logo_url.startsWith("/")
              ? `${API_ROOT}${siteConfig.logo_url}`
              : siteConfig.logo_url)
            : undefined
        }
      />
    ))
  }, [filteredHistory])//[filteredHistory, user?.picture_url, siteConfig?.logo_url])

  return (
    // <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] text-white">
    <div className="flex-1 flex flex-col h-full bg-black/40 backdrop-blur-sm text-white">

      <header className="h-12 border-b border-white/10 bg-[#0d0d16] flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {siteConfig?.site_title || "Zodiac Whisper"}
        </h2>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-300">
              {(user.token_balance ?? 0).toFixed(2)} Tokens
            </span>

            <button
              onClick={handleClearHistory}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16}/>
            </button>
          </div>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">

        {!isLoveMode && history.length === 0 && (
          <AstrologyReadingForm
            onSubmit={handleAstrologySubmit}
            isLoading={isLoading}
            isLoggedIn={!!user}
            onAuthRequired={()=>setShowAuthModal(true)}
          />
        )}

        {renderedMessages}

        {isLoveMode && showLoveForm && (
          <div ref={loveFormRef} className="mt-6">
            <LoveForm
              onSubmit={handleAstrologySubmit}
              isLoading={isLoading}
              userData={userBirthData}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-16">
            <div className="w-20 h-20 border border-blue-500 rounded-full flex items-center justify-center">
              <Orbit className="animate-spin text-blue-300"/>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-white/5 bg-[#0d0d16]/80 backdrop-blur-xl p-4">
          
          {/* FIELD SELECTORS */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {[
              "Tổng quan vận mệnh",
              "Tình cảm & Mối quan hệ",
            ].map(field => (
              <button
                key={field}
                onClick={()=>selectField(field)}
                className={`px-4 py-1.5 text-[11px] font-medium rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedField === field
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5"
                }`}
              >
                {field}
              </button>
            ))}
          </div>

          {/* INPUT BOX */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            
            <div className="relative flex items-end gap-3 bg-[#0a0a14]/60 border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-blue-500/30 transition-all duration-300 shadow-2xl">
              
              <textarea
                rows={2}
                value={input}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false)
                  setInput(e.currentTarget.value)
                }}
                onChange={(e) => {
                  if (!isComposing) {
                    setInput(e.target.value)
                  }
                }}
                onKeyDown={(e) => {
                  if (isComposing) return
                  if (e.key === 'Enter') {
                    if (e.ctrlKey || e.shiftKey) return
                    e.preventDefault()
                    if (input.trim() && !isLoading) sendChat()
                  }
                }}
                placeholder="Hỏi AI về bản đồ sao của bạn..."
                className="flex-1 min-h-[48px] max-h-32 py-3 bg-transparent border-none text-sm text-gray-200 placeholder:text-gray-500 focus:ring-0 resize-none no-scrollbar"
              />

              <button
                onClick={sendChat}
                disabled={isLoading || !input.trim()}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-100 opacity-100"
                    : "bg-white/5 text-gray-600 scale-95 opacity-50 cursor-not-allowed"
                }`}
              >
                <Send className={`${isLoading ? "animate-pulse" : ""} w-5 h-5`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={()=>setShowAuthModal(false)}
          onSuccess={(userData,token)=>{
            setShowAuthModal(false)
            localStorage.setItem("access_token",token)
            window.location.reload()
          }}
        />
      )}

    </div>
  )
}

export default ChatView