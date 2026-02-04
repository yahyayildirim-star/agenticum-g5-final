import type { LogEntry } from '../lib/types';
import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  collapsed: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export function Terminal({ logs, collapsed, onToggle, onClear }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, collapsed]);

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

  return (
    <div className={`border-t border-[rgba(255,255,255,0.08)] bg-[#0F1115] transition-all duration-300 ${collapsed ? 'h-9' : 'h-48'}`}>
      
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-[rgba(255,255,255,0.05)] bg-[#1A1D23]/50">
        <button 
          onClick={onToggle}
          className="flex items-center gap-2 text-[#5F6368] hover:text-[#E8EAED] transition-all"
        >
          <TerminalIcon size={12} />
          <span className="text-[10px] font-mono uppercase tracking-wider">Terminal</span>
          <span className="text-[10px] text-[#5F6368]">({logs.length})</span>
          {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

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
        <div ref={scrollRef} className="h-[calc(100%-36px)] overflow-y-auto p-2 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#5F6368]">
              <span>Awaiting orchestration...</span>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex gap-2 py-0.5 px-1 hover:bg-[rgba(255,255,255,0.02)] rounded">
                <span className="text-[#5F6368] shrink-0 w-16">
                  {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`shrink-0 w-16 font-semibold ${getSourceColor(log.source)}`}>
                  [{log.source}]
                </span>
                <span className={getLogColor(log.level)}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
