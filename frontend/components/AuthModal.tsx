
import React from 'react';
import AuthView from './AuthView';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-in zoom-in fade-in duration-500">
        {/* <button 
          onClick={onClose}
          className="absolute -top-14 right-0 text-gray-400 flex items-center gap-2 hover:text-white transition-all group"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-black group-hover:tracking-[0.4em] transition-all">Đóng</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button> */}
        <AuthView onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;
