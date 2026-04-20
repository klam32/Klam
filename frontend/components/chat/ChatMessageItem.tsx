
import React from 'react';
import { ChatMessage } from '../../types';
import { User } from 'lucide-react';
import AstrologyInterpretationResult from './AstrologyInterpretationResult';
import LoveAnalysisResult from './LoveAnalysisResult';

interface ChatMessageItemProps {
  msg: ChatMessage;
  userAvatar?: string;
  botAvatar?: string;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg, userAvatar, botAvatar }) => {
  const [imgError, setImgError] = React.useState(false);
  const avatar = msg.role === 'user' ? userAvatar : botAvatar;
  const username = msg.role === 'user' ? 'Gia chủ' : 'Bậc thầy Chiêm tinh';

  const isLove = !!(msg as any).partner_chart_svg;

  if (isLove) {
    return (
      <LoveAnalysisResult
        chart1={(msg as any).chart_svg}
        chart2={(msg as any).partner_chart_svg}
        label={(msg as any).label}
        interpretation={
          (msg as any).analysis ||
          (msg as any).chart ||
          (msg as any).answer ||
          ""
        }
        percent={Number((msg as any).compatibility || 0)}
      />
    );
  }

  // 🔮 ASTROLOGY
  if (msg.role === 'assistant') {
    return (
      <AstrologyInterpretationResult 
        content={(msg as any).analysis || (msg as any).chart || msg.content}    
        analysis={(msg as any).analysis} 
        answer={(msg as any).answer}
        chartSummary={(msg as any).chart_summary} 
        chart_svg={(msg as any).chart_svg}
      />
    );  
  }

  // 👤 USER
  return (
    <div className="flex flex-col items-center gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
        {avatar && !imgError ? (
          <img 
            src={avatar} 
            alt={username} 
            className="w-6 h-6 rounded-full border border-purple-500/30 object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <User className="w-4 h-4 text-purple-400" />
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200/50">
          Yêu cầu từ {username}
        </span>
        <div className="w-1 h-1 rounded-full bg-white/20"></div>
        <span className="text-[10px] font-medium text-white/30">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="max-w-2xl text-center">
        <p className="text-xl font-medium text-purple-100/80 italic leading-relaxed">
          {msg.content || msg.answer}
        </p>
      </div>
    </div>
  );
};

export default React.memo(ChatMessageItem);