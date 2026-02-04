import { useState, useRef, useEffect } from 'react';
import { Search, Play, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (intent: string) => void;
  onClear: () => void;
  isRunning: boolean;
}

export function CommandBar({ isOpen, onClose, onExecute, onClear, isRunning }: CommandBarProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!input.trim() || isRunning) return;
    onExecute(input);
    setInput('');
    onClose();
  };

  const suggestions = [
    { label: 'Create viral campaign for AI startup', icon: '🚀' },
    { label: 'Analyze competitor: OpenAI', icon: '🔍' },
    { label: 'Generate video concept for product launch', icon: '🎬' },
    { label: 'Design brand identity for fintech', icon: '🎨' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
          >
            <div className="glass-dark rounded-xl shadow-2xl overflow-hidden">
              
              {/* Input Row */}
              <div className="flex items-center gap-3 p-4 border-b border-[rgba(255,255,255,0.08)]">
                <Search size={18} className="text-[#5F6368]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') onClose();
                  }}
                  placeholder="What do you want to create?"
                  className="flex-1 bg-transparent text-[#E8EAED] text-base outline-none placeholder:text-[#5F6368]"
                  disabled={isRunning}
                />
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded-md text-[#5F6368] hover:text-[#E8EAED] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Suggestions */}
              {!input && (
                <div className="p-2">
                  <div className="text-[10px] text-[#5F6368] uppercase tracking-wider px-2 py-1">
                    Suggestions
                  </div>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s.label);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-left transition-all group"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-sm text-[#9AA0A6] group-hover:text-[#E8EAED]">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              {input && (
                <div className="flex items-center justify-between p-3 border-t border-[rgba(255,255,255,0.08)]">
                  <button
                    onClick={onClear}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#5F6368] hover:text-[#EA4335] transition-all"
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning || !input.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-[#5a95f5] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play size={14} />
                    Execute
                  </button>
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="text-center mt-3 text-[11px] text-[#5F6368]">
              Press <kbd className="px-1.5 py-0.5 bg-[#22262E] rounded text-[10px]">Enter</kbd> to execute • <kbd className="px-1.5 py-0.5 bg-[#22262E] rounded text-[10px]">Esc</kbd> to close
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
