import React, { useState } from 'react';
import { Play, RotateCcw, Terminal, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  onExecute: (intent: string) => void;
  onClear: () => void;
  isRunning: boolean;
}

export function ControlPanel({ onExecute, onClear, isRunning }: ControlPanelProps) {
  const [intent, setIntent] = useState('');

  const handleExecute = () => {
    if (!intent.trim()) return;
    onExecute(intent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-400">
        <Terminal size={14} />
        <span className="text-[10px] font-orbitron tracking-widest">COMMAND INTERFACE</span>
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="absolute left-3 top-3 text-cyan-500 font-mono text-sm select-none">›</div>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Describe your campaign intent..."
          className="w-full h-24 bg-black/60 border border-gray-800 focus:border-cyan-500/50 rounded-lg pl-7 pr-4 py-3 text-gray-200 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExecute}
          disabled={isRunning || !intent.trim()}
          className={`flex-1 py-2.5 px-4 font-orbitron text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all duration-300 rounded ${
            isRunning 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 cursor-wait' 
              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none'
          }`}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>EXECUTING...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>EXECUTE</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => {
            setIntent('');
            onClear();
          }}
          disabled={isRunning}
          className="px-4 py-2.5 border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Hint */}
      <div className="text-[10px] text-gray-600 font-mono text-center">
        Press Enter to execute • Shift+Enter for new line
      </div>
    </div>
  );
}
