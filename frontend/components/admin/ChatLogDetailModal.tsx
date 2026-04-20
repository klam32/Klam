// import * as React from 'react';

// interface ChatLogDetailModalProps {
//   chat: any;
//   onClose: () => void;
// }

// const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
//          <div className="p-6 bg-indigo-900 text-white flex justify-between items-center shrink-0">
//             <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl">✨</div>
//                 <div>
//                     <h3 className="text-xl font-bold uppercase tracking-tight">Chi Tiết Bản Đồ Sao</h3>
//                     <p className="text-xs text-indigo-200">ID: #{chat.id} • Người dùng: {chat.username} ({chat.email})</p>
//                 </div>
//             </div>
//             <button onClick={onClose} className="text-white hover:rotate-90 transition-transform p-2 bg-white/10 rounded-lg">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//             </button>
//          </div>
         
//          <div className="flex-1 overflow-y-auto p-6 space-y-8">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left: Input & Interpretation */}
//                 <div className="space-y-6">
//                     <div className="space-y-2">
//                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yêu cầu từ người dùng</label>
//                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 italic text-sm">
//                             "{chat.question}"
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Luận giải chi tiết</label>
//                         <div className="prose prose-sm prose-slate max-w-none text-slate-600 bg-white border border-slate-100 p-4 rounded-xl shadow-sm max-h-[400px] overflow-y-auto">
//                             {chat.answer}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right: Chart Visual */}
//                 <div className="space-y-6">
//                     {chat.chart_svg ? (
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bản đồ sao đã tạo</label>
//                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-center items-center overflow-hidden">
//                                 <div 
//                                     className="admin-chart-svg-preview"
//                                     dangerouslySetInnerHTML={{ __html: chat.chart_svg }}
//                                     style={{ width: '100%', height: 'auto', maxWidth: '350px' }}
//                                 />
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl py-12">
//                             <p className="text-slate-300 text-xs italic">Không có dữ liệu bản đồ sao hình ảnh</p>
//                         </div>
//                     )}

//                     {chat.chart_summary && (
//                         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
//                              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3 block">Tóm tắt hành tinh</label>
//                              <div className="grid grid-cols-2 gap-2">
//                                 <div className="text-[10px]"><strong>Mặt Trời:</strong> {chat.chart_summary.sun}</div>
//                                 <div className="text-[10px]"><strong>Mặt Trăng:</strong> {chat.chart_summary.moon}</div>
//                                 <div className="text-[10px] col-span-2"><strong>Cung Mọc:</strong> {chat.chart_summary.ascendant}</div>
//                              </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div className="flex items-center justify-between pt-6 border-t border-slate-100 shrink-0">
//                 <div className="flex gap-8">
//                     <div className="text-center">
//                         <p className="text-[10px] text-slate-400 font-bold uppercase">Token sử dụng</p>
//                         <p className="text-xl font-black text-indigo-600">{chat.tokens_charged}</p>
//                     </div>
//                 </div>
//                 <div className="text-right text-xs text-slate-400 italic">
//                     Ghi nhận lúc {new Date(chat.created_at).toLocaleString()}
//                 </div>
//             </div>
//          </div>
//       </div>
//       <style>{`
//         .admin-chart-svg-preview svg {
//             width: 100% !important;
//             height: auto !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChatLogDetailModal;
import * as React from 'react';

interface ChatLogDetailModalProps {
  chat: any;
  onClose: () => void;
}

const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose }) => {

  // 🔥 HANDLE CONTENT (QUAN TRỌNG NHẤT)
  const renderContent = () => {
    if (chat.answer && chat.answer.trim() !== "") {
      return chat.answer;
    }

    if (chat.chart && chat.chart.trim() !== "") {
      return chat.chart;
    }

    return "Không có dữ liệu";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="p-6 bg-indigo-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl">✨</div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">
                Chi Tiết Bản Đồ Sao
              </h3>
              <p className="text-xs text-indigo-200">
                ID: #{chat.id} • Người dùng: {chat.username} ({chat.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:rotate-90 transition-transform p-2 bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT */}
            <div className="space-y-6">

              {/* QUESTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Yêu cầu từ người dùng
                </label>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 italic text-sm">
                  "{chat.question}"
                </div>
              </div>

              {/* ANSWER / CHART */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Luận giải chi tiết
                </label>

                <div className="prose prose-sm prose-slate max-w-none text-slate-600 bg-white border border-slate-100 p-4 rounded-xl shadow-sm max-h-[400px] overflow-y-auto">
                  {renderContent()}
                </div>
              </div>

            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {/* MAIN CHART */}
              {chat.chart_svg ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Bản đồ sao
                  </label>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-center items-center overflow-hidden">
                    <div
                      className="admin-chart-svg-preview"
                      dangerouslySetInnerHTML={{ __html: chat.chart_svg }}
                      style={{ width: '100%', maxWidth: '350px' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl py-12">
                  <p className="text-slate-300 text-xs italic">
                    Không có dữ liệu bản đồ sao
                  </p>
                </div>
              )}

              {/* 🔥 PARTNER CHART (LOVE FIX) */}
              {chat.partner_chart_svg && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                    Bản đồ người kia
                  </label>

                  <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex justify-center items-center overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{ __html: chat.partner_chart_svg }}
                      style={{ width: '100%', maxWidth: '350px' }}
                    />
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {chat.chart_summary && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3 block">
                    Tóm tắt hành tinh
                  </label>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><strong>Mặt Trời:</strong> {chat.chart_summary.sun}</div>
                    <div><strong>Mặt Trăng:</strong> {chat.chart_summary.moon}</div>
                    <div className="col-span-2"><strong>Cung Mọc:</strong> {chat.chart_summary.ascendant}</div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Token sử dụng
              </p>
              <p className="text-xl font-black text-indigo-600">
                {chat.tokens_charged}
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 italic">
              Ghi nhận lúc {new Date(chat.created_at).toLocaleString()}
            </div>
          </div>

        </div>
      </div>

      {/* FIX SVG SCALE */}
      <style>{`
        .admin-chart-svg-preview svg {
          width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
};

export default ChatLogDetailModal;