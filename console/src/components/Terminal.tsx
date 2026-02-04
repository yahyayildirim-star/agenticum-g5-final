import type { LogEntry } from '../lib/types';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, Trash2, MessageSquare, List } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  collapsed: boolean;
  onToggle: () => void;
  onClear: () => void;
}

interface DialogueMessage {
  id: string;
  agent: 'ORCHESTRATOR' | 'STRATEGIST' | 'AUDITOR';
  content: string;
  timestamp: number;
}

export function Terminal({ logs, collapsed, onToggle, onClear }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'logs' | 'dialogue'>('logs');

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, collapsed, viewMode]);

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-[#34A853]';
      case 'error': return 'text-[#EA4335]';
      case 'warning': return 'text-[#FBBC04]';
      case 'info': return 'text-[#4285F4]';
      default: return 'text-[#5F6368]';
    }
  };

  const getSourceColor = (source: string) => {
    if (source.startsWith('SN')) return 'text-[#A855F7]';
    if (source.startsWith('SP')) return 'text-[#4285F4]';
    if (source.startsWith('RA')) return 'text-[#FBBC04]';
    if (source.startsWith('CC')) return 'text-pink-400';
    if (source.startsWith('DA')) return 'text-[#34A853]';
    return 'text-[#00E5FF]';
  };

  // Convert certain logs to dialogue for visualization
  const dialogueMessages: DialogueMessage[] = logs
    .filter(l => l.level === 'info' && (l.source === 'ORCHESTRATOR' || l.source === 'STRATEGIST' || l.source === 'AUDITOR'))
    .map(l => ({
      id: l.id,
      agent: l.source as 'ORCHESTRATOR' | 'STRATEGIST' | 'AUDITOR',
      content: l.message,
      timestamp: l.timestamp
    }));

  return (
    <div className={`border-t border-[rgba(255,255,255,0.08)] bg-[#0F1115] transition-all duration-300 relative ${collapsed ? 'h-9' : 'h-64'}`}>
      
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-[rgba(255,255,255,0.05)] bg-[#1A1D23]/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggle}
            className="flex items-center gap-2 text-[#5F6368] hover:text-[#E8EAED] transition-all"
          >
            <TerminalIcon size={12} />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Terminal CNS</span>
            {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {!collapsed && (
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
              <button 
                onClick={() => setViewMode('logs')}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'logs' ? 'bg-[#4285F4] text-white shadow-lg' : 'text-[#5F6368] hover:text-[#E8EAED]'}`}
              >
                <List size={10} /> Raw Logs
              </button>
              <button 
                onClick={() => setViewMode('dialogue')}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'dialogue' ? 'bg-[#A855F7] text-white shadow-lg' : 'text-[#5F6368] hover:text-[#E8EAED]'}`}
              >
                <MessageSquare size={10} /> Neural Dialogue
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <kbd className="text-[9px] text-[#5F6368] bg-[#22262E] px-1.5 py-0.5 rounded">⌘J</kbd>
          <button 
            onClick={onClear}
            className="p-1 text-[#5F6368] hover:text-[#EA4335] transition-all"
            title="Clear terminal"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div ref={scrollRef} className="h-[calc(100%-36px)] overflow-y-auto p-4 font-mono text-[11px] custom-scrollbar">
          {viewMode === 'logs' ? (
            logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#5F6368] italic opacity-50 uppercase tracking-widest text-[10px]">
                <span>Awaiting neural pulse...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 py-0.5 px-1 hover:bg-white/5 rounded border-l-2 border-transparent hover:border-[#4285F4] transition-all">
                    <span className="text-[#5F6368] shrink-0 opacity-50">
                      {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`shrink-0 w-24 font-bold ${getSourceColor(log.source)}`}>
                      [{log.source.padEnd(10)}]
                    </span>
                    <span className={getLogColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
               {dialogueMessages.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-[#5F6368] italic opacity-50 uppercase tracking-widest text-[10px] mt-12">
                   <span>No active agent synergy detected.</span>
                 </div>
               ) : (
                 dialogueMessages.map((msg) => (
                   <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, x: msg.agent === 'ORCHESTRATOR' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col ${msg.agent === 'STRATEGIST' ? 'items-end' : 'items-start'}`}
                   >
                      <div className="flex items-center gap-2 mb-1 px-2">
                         <span className={`text-[9px] font-bold uppercase tracking-widest ${
                           msg.agent === 'ORCHESTRATOR' ? 'text-[#00E5FF]' : 
                           msg.agent === 'STRATEGIST' ? 'text-[#4285F4]' : 'text-[#FBBC04]'
                         }`}>
                           {msg.agent}
                         </span>
                         <span className="text-[8px] text-[#5F6368]">
                           {new Date(msg.timestamp).toLocaleTimeString()}
                         </span>
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[80%] text-[10px] leading-relaxed border ${
                        msg.agent === 'STRATEGIST' 
                        ? 'bg-[#4285F4]/10 border-[#4285F4]/20 rounded-tr-none text-[#E8EAED]' 
                        : msg.agent === 'AUDITOR'
                        ? 'bg-[#FBBC04]/10 border-[#FBBC04]/20 rounded-tl-none text-[#E8EAED]'
                        : 'bg-white/5 border-white/10 rounded-tl-none text-[#E8EAED]'
                      }`}>
                         {msg.content}
                      </div>
                   </motion.div>
                 ))
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
