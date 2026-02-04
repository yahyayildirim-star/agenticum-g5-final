import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, ShieldAlert, Check } from 'lucide-react';

interface ProtocolLockProps {
  onSuccess: () => void;
  onCancel: () => void;
  actionName: string;
}

export function ProtocolLock({ onSuccess, onCancel, actionName }: ProtocolLockProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'denied'>('idle');
  const [progress, setProgress] = useState(0);

  const startVerification = () => {
    setStatus('verifying');
    setProgress(0);
  };

  useEffect(() => {
    if (status === 'verifying') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStatus('success');
            setTimeout(onSuccess, 1000);
            return 100;
          }
          return p + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [status, onSuccess]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0F1115]/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-[400px] bg-[#1A1D23] border border-[#4285F4]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(66,133,244,0.15)] flex flex-col items-center gap-6"
      >
        <div className="relative">
           <div className={`p-4 rounded-full transition-all duration-500 ${
             status === 'success' ? 'bg-[#34A853]/10 text-[#34A853]' :
             status === 'denied' ? 'bg-[#EA4335]/10 text-[#EA4335]' :
             'bg-[#4285F4]/10 text-[#4285F4]'
           }`}>
              {status === 'success' ? <Check size={32} /> : 
               status === 'idle' ? <Shield size={32} /> : 
               status === 'verifying' ? <Fingerprint size={32} className="animate-pulse" /> : <ShieldAlert size={32} />}
           </div>
           {status === 'verifying' && (
             <svg className="absolute inset-[-4px] w-12 h-12 -rotate-90">
                <circle 
                  cx="24" cy="24" r="22" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-[#4285F4]/20"
                />
                <circle 
                  cx="24" cy="24" r="22" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeDasharray={138}
                  strokeDashoffset={138 - (138 * progress) / 100}
                  className="text-[#4285F4] transition-all duration-100"
                />
             </svg>
           )}
        </div>

        <div className="text-center space-y-2">
           <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#E8EAED]">
              Security Protocol L3
           </h3>
           <p className="text-[10px] text-[#5F6368] uppercase tracking-wider">
              Verification required for: <span className="text-[#4285F4] font-bold">{actionName.replace(/_/g, ' ')}</span>
           </p>
        </div>

        <div className="w-full space-y-3">
           {status === 'idle' ? (
             <>
               <button 
                 onClick={startVerification}
                 className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3"
               >
                 <Fingerprint size={16} />
                 Initialize Biometric Sync
               </button>
               <button 
                 onClick={onCancel}
                 className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#5F6368] hover:text-[#E8EAED] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
               >
                 Abort Request
               </button>
             </>
           ) : (
             <div className="space-y-4 py-4 text-center">
                <div className="text-[10px] font-mono text-[#9AA0A6] animate-pulse">
                   {status === 'verifying' ? `ENCRYPTING SUBSTRATE... ${progress}%` : 
                    status === 'success' ? 'PROTOCOL GRANTED' : 'ACCESS DENIED'}
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     className={`h-full ${status === 'success' ? 'bg-[#34A853]' : 'bg-[#4285F4]'}`}
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                   />
                </div>
             </div>
           )}
        </div>

        <div className="flex items-center gap-2 text-[9px] text-[#5F6368] font-mono">
           <Lock size={10} />
           <span>RSA-4096 ENCRYPTED SYNC</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
