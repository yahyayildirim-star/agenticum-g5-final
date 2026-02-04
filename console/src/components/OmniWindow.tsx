import { motion } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import React, { useState } from 'react';

interface OmniWindowProps {
  id: string;
  title: string;
  zIndex: number;
  isActive: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

export function OmniWindow({ title, zIndex, isActive, onClose, onFocus, children }: OmniWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: isMaximized ? '100%' : '600px',
        height: isMaximized ? '100%' : '500px',
        top: isMaximized ? 0 : '15%',
        left: isMaximized ? 0 : '25%',
      }}
      style={{ zIndex, position: 'fixed' }}
      onPointerDown={onFocus}
      className={`bg-[#14171C] border ${isActive ? 'border-[#4285F4]/50 shadow-[0_0_40px_rgba(66,133,244,0.2)]' : 'border-white/10'} rounded-xl flex flex-col overflow-hidden transition-colors`}
    >
      {/* Window Header */}
      <div className={`h-10 border-b border-white/5 flex items-center justify-between px-3 cursor-move ${isActive ? 'bg-[#4285F4]/5' : 'bg-white/2'}`}>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#4285F4]' : 'bg-[#5F6368]'}`} />
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8EAED]">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/5 rounded text-[#5F6368] hover:text-[#E8EAED]">
            <Minus size={14} />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-white/5 rounded text-[#5F6368] hover:text-[#E8EAED]"
          >
            {isMaximized ? <Square size={12} /> : <Maximize2 size={12} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#EA4335]/20 rounded text-[#5F6368] hover:text-[#EA4335]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto p-0 bg-black/20">
        {children}
      </div>

      {/* Window Status Bar */}
      <div className="h-6 border-t border-white/5 bg-white/1 flex items-center px-3 justify-between">
         <div className="flex items-center gap-2">
            <span className="text-[8px] text-[#5F6368] font-mono">STATUS: OK</span>
            <div className="w-1 h-1 rounded-full bg-[#34A853]" />
         </div>
         <div className="text-[8px] text-[#5F6368] font-mono uppercase tracking-tighter">
            Antigravity OS Omni-Substrate
         </div>
      </div>
    </motion.div>
  );
}
