import type { LogEntry } from '../lib/types';
import { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function ConsoleLog({ logs, onClear }: ConsoleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyles = (level: string, source: string) => {
    const baseSource = source.startsWith('SN') ? 'text-purple-400' : 
                       source.startsWith('SP') ? 'text-cyan-400' :
                       source.startsWith('RA') ? 'text-yellow-400' :
                       source.startsWith('CC') ? 'text-pink-400' :
                       source.startsWith('DA') ? 'text-orange-400' :
                       'text-gray-400';
    
    let messageColor = 'text-gray-300';
    if (level === 'success') messageColor = 'text-green-400';
    if (level === 'error') messageColor = 'text-red-400';
    if (level === 'warning') messageColor = 'text-yellow-400';
    if (level === 'system') messageColor = 'text-gray-400';

    return { sourceColor: baseSource, messageColor };
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e14]/80 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2 text-gray-500">
          <Terminal size={12} />
          <span className="font-orbitron text-[10px] tracking-widest">SYSTEM LOG</span>
          <span className="text-[10px] text-gray-600">({logs.length} entries)</span>
        </div>
        <button 
          onClick={onClear} 
          className="p-1 text-gray-600 hover:text-red-400 transition-colors"
          title="Clear logs"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Log Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-gray-700 mb-1">System ready.</div>
              <div className="text-[10px]">Waiting for orchestration...</div>
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const { sourceColor, messageColor } = getLogStyles(log.level, log.source);
            return (
              <div 
                key={log.id} 
                className="flex gap-2 py-0.5 px-1 hover:bg-white/5 rounded transition-colors"
              >
                <span className="text-gray-600 w-16 shrink-0">{formatTime(log.timestamp)}</span>
                <span className={`w-14 shrink-0 font-bold ${sourceColor}`}>[{log.source}]</span>
                <span className={`${messageColor} break-words flex-1`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
