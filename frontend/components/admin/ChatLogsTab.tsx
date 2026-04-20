import React from 'react';

interface ChatLogsTabProps {
  chatlogs: any[];
  onSelectChat: (log: any) => void;
}

const ChatLogsTab: React.FC<ChatLogsTabProps> = ({ chatlogs, onSelectChat }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in">
       <div className="overflow-x-auto">
         <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-left">Thời Gian</th>
                <th className="px-6 py-5 text-left">Người Hỏi</th>
                <th className="px-6 py-5 text-left">Câu Hỏi</th>
                <th className="px-6 py-5 text-right">Phí</th>
                <th className="px-6 py-5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {chatlogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 italic text-slate-300">Chưa có nhật ký luận giải nào được ghi lại...</td></tr>
              ) : chatlogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{log.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[400px] truncate italic text-slate-500">"{log.question}"</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">-{log.tokens_charged}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onSelectChat(log)} className="text-[10px] font-bold uppercase bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default ChatLogsTab;
