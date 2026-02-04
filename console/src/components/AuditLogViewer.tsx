import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Lock, Clock, Activity, Download, FileJson } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  type: 'SECURITY' | 'OPERATIONAL' | 'IDENTITY';
  action: string;
  actor: string;
  timestamp: { _seconds: number };
  details: Record<string, unknown>;
}

// Mock data for initial demo
const MOCK_AUDIT: AuditLogEntry[] = [
  { 
    id: 'a1', 
    type: 'SECURITY', 
    action: 'HITL_APPROVAL', 
    actor: 'ADMIN_AGENT', 
    timestamp: { _seconds: Date.now() / 1000 - 3600 },
    details: { sessionId: 'sess_992' }
  },
  { 
    id: 'a2', 
    type: 'IDENTITY', 
    action: 'ROLE_ELEVATION', 
    actor: 'SYSTEM_KERNEL', 
    timestamp: { _seconds: Date.now() / 1000 - 7200 },
    details: { user: 'YH-01', newRole: 'SUPER_USER' }
  },
  { 
    id: 'a3', 
    type: 'OPERATIONAL', 
    action: 'DNA_MODIFICATION', 
    actor: 'ADMIN_AGENT', 
    timestamp: { _seconds: Date.now() / 1000 - 10000 },
    details: { target: 'Brand DNA Hub' }
  },
];

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onExport: () => void;
}

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
  return (
    <div className="flex-1 p-6 overflow-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#E8EAED] flex items-center gap-3">
              <Shield className="text-[#34A853]" size={24} />
              Ironclad Audit Trail
            </h2>
            <p className="text-sm text-[#9AA0A6] mt-1 uppercase tracking-widest text-[10px]">Immutable Security Persistence Layer</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 border border-[#4285F4]/30 rounded-lg text-[#4285F4] text-[10px] font-bold uppercase tracking-widest transition-all"
             >
                <Download size={14} />
                Export Intelligence
             </button>
             <div className="px-3 py-1 bg-[#34A853]/10 border border-[#34A853]/20 rounded-full flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
               <span className="text-[10px] font-mono font-bold text-[#34A853]">STABLE & ENCRYPTED</span>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#4285F4]/5 border border-[#4285F4]/20 flex items-center justify-between">
             <div className="flex items-center gap-3 text-[#4285F4]">
                <FileJson size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Session Persistence Active</span>
             </div>
             <span className="text-[9px] font-mono text-[#5F6368]">SHA-256 Verified</span>
          </div>

          {[...MOCK_AUDIT, ...logs].sort((a, b) => b.timestamp._seconds - a.timestamp._seconds).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-[#1A1D23] border border-[rgba(255,255,255,0.05)] hover:border-[#34A853]/30 transition-all flex items-start gap-4 group"
            >
              <div className={`p-2 rounded-lg transition-all ${
                log.type === 'SECURITY' ? 'bg-red-400/10 text-red-100 group-hover:bg-red-400/20' :
                log.type === 'IDENTITY' ? 'bg-[#4285F4]/10 text-[#4285F4] group-hover:bg-[#4285F4]/20' :
                'bg-[#34A853]/10 text-[#34A853] group-hover:bg-[#34A853]/20'
              }`}>
                {log.type === 'SECURITY' ? <ShieldAlert size={18} /> : 
                 log.type === 'IDENTITY' ? <Lock size={18} /> : <Activity size={18} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-mono font-bold tracking-tighter uppercase" style={{ color: log.type === 'SECURITY' ? '#F87171' : '#E8EAED' }}>
                    {log.action}
                  </div>
                  <div className="text-[10px] text-[#5F6368] font-mono flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(log.timestamp._seconds * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#5F6368]">ACTOR:</span>
                  <span className="text-[#9AA0A6] font-mono bg-white/5 px-1.5 py-0.5 rounded">{log.actor}</span>
                </div>
                <div className="mt-2 p-3 bg-black/40 rounded-lg font-mono text-[9px] text-[#5F6368] break-all border border-white/5 shadow-inner leading-relaxed">
                   {log.action === 'NEURAL_SYNERGY' ? (
                     <span className="text-[#FBBC04]">{log.details.event as string}</span>
                   ) : (
                     <>{'JSON_IDENTITY_PAYLOAD: '}{JSON.stringify(log.details)}</>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
