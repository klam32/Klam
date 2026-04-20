import React from 'react';

interface UsersTabProps {
  users: any[];
  isLoading: boolean;
  onViewDetail: (userId: number) => void;
  onUpdateBalance: (userId: number, currentBalance: number) => void;
  onToggleAdmin: (userId: number, currentStatus: boolean) => void;
  onDeleteUser: (userId: number) => void;
}

const AvatarImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (error) return <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500 font-bold uppercase">{alt[0]}</div>;
  return <img src={src} alt={alt} className="w-8 h-8 rounded-lg object-cover shadow-sm" onError={() => setError(true)} />;
};

const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  isLoading, 
  onViewDetail, 
  onUpdateBalance, 
  onToggleAdmin, 
  onDeleteUser 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-left">Người Dùng</th>
              <th className="px-6 py-5 text-left">Email</th>
              <th className="px-6 py-5 text-right">Tokens</th>
              <th className="px-6 py-5 text-center">Vai Trò</th>
              <th className="px-6 py-5 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-20 italic text-slate-300">Đang tra cứu dữ liệu thiên văn...</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {u.picture_url ? (
                          <AvatarImage src={u.picture_url} alt={u.username} />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold uppercase">{u.username[0]}</div>
                        )}
                        <span className="font-bold text-slate-800">{u.username}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                <td className="px-6 py-4 text-right">
                    <span className={`font-black text-lg ${(u.token_balance ?? 0) < 5 ? 'text-rose-500' : 'text-indigo-600'}`}>
                        {(u.token_balance ?? 0).toFixed(2)}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap min-w-[90px] inline-block text-center ${
                      u.is_admin ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {u.is_admin ? "ADMIN" : "USER"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                   <button onClick={() => onViewDetail(u.id)} className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all">Chi tiết</button>
                   <button onClick={() => onUpdateBalance(u.id, u.token_balance)} className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-indigo-400 transition-all">Số dư</button>
                   
                   {/* Toggle Admin */}
                   <button 
                      onClick={() => onToggleAdmin(u.id, !!u.is_admin)} 
                      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${
                          u.is_admin 
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                          : 'bg-indigo-900 text-white hover:bg-indigo-800'
                      }`}
                   >
                       {u.is_admin ? 'Hạ cấp' : 'Thăng quản trị'}
                   </button>
 
                   {!u.is_admin && (
                      <button onClick={() => onDeleteUser(u.id)} className="text-[10px] font-bold uppercase bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Xóa</button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
