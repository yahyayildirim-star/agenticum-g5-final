import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Server, Zap, Globe, Shield, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { LucideIcon } from 'lucide-react';

export interface SystemTelemetry {
  cpuUsage?: number;
  cpuLatency?: string;
  gpuMemory?: string;
  dbOps?: string;
  bandwidth?: string;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

function MetricCard({ label, value, subValue, icon: Icon, color, trend }: MetricCardProps) {
  const [width, setWidth] = useState('0%');

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomWidth = Math.random() * 60 + 20;
      setWidth(`${randomWidth}%`);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#1A1D23] border border-white/5 rounded-xl p-4 flex flex-col gap-3 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
         <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={16} />
         </div>
         <div className={`text-[10px] font-mono ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-[#5F6368]'}`}>
            {trend === 'up' ? '↑ LIVE' : trend === 'down' ? '↓ BUSY' : '• IDLE'}
         </div>
      </div>
      <div>
         <div className="text-[10px] text-[#5F6368] uppercase tracking-tighter mb-1">{label}</div>
         <div className="text-xl font-display font-bold text-[#E8EAED]">{value}</div>
         <div className="text-[10px] text-[#5F6368] font-mono">{subValue}</div>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width }}
           transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
           className="h-full"
           style={{ backgroundColor: color }}
         />
      </div>
    </div>
  );
}

export function TelemetryDashboard() {
  const [heatmapData, setHeatmapData] = useState<{duration: number, delay: number, type: string}[]>([]);

  useEffect(() => {
    // Generate static data once on mount
    const data = Array.from({ length: 64 }).map(() => ({
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2,
      type: Math.random() > 0.8 ? 'primary' : Math.random() > 0.6 ? 'secondary' : 'off'
    }));
    setHeatmapData(data);
  }, []);

  if (heatmapData.length === 0) return null;

  return (
    <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-display font-bold text-[#E8EAED] flex items-center gap-3">
               <Activity className="text-[#34A853]" size={24} />
               OS Telemetry Mesh
            </h2>
            <p className="text-sm text-[#9AA0A6] mt-1 uppercase tracking-widest text-[10px]">Real-time Component Integrity & Usage</p>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#E8EAED] rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
            <RefreshCw size={12} />
            Full Node Scan
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard label="CPU Latency" value="4ms" subValue="Vertex AI Cluster" icon={Cpu} color="#4285F4" trend="stable" />
         <MetricCard label="GPU Memory" value="12.4 GB" subValue="Imagen Inference" icon={Zap} color="#FBBC04" trend="up" />
         <MetricCard label="DB Ops" value="1,240/s" subValue="Firestore Real-time" icon={Database} color="#34A853" trend="stable" />
         <MetricCard label="Bandwidth" value="2.8 GB/s" subValue="Subsubstrate Stream" icon={Globe} color="#EA4335" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-6">
         <div className="col-span-2 bg-[#1A1D23] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#5F6368] flex items-center gap-2">
               <Server size={14} />
               Infrastructure Topology & Agent Sync
            </h3>
            
            <div className="grid grid-cols-2 gap-6 flex-1">
               <div className="h-full min-h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/20">
                   <div className="text-center space-y-4">
                       <div className="relative">
                           <div className="w-16 h-16 rounded-full border-2 border-[#4285F4] animate-ping absolute inset-0 opacity-20" />
                           <div className="w-16 h-16 rounded-full bg-[#4285F4]/20 border border-[#4285F4]/50 flex items-center justify-center text-[#4285F4]">
                              <Server size={32} />
                           </div>
                       </div>
                       <div>
                           <div className="text-xs font-bold font-mono text-[#E8EAED]">CENTRAL-CORE-01</div>
                           <div className="text-[10px] text-[#5F6368]">US-CENTRAL1-A • V3_TPU</div>
                       </div>
                   </div>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider font-mono">Agent Sync Heatmap</span>
                     <span className="text-[10px] font-mono text-[#34A853]">92% DENSITY</span>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden group">
                     <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full">
                        {heatmapData.map((d, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0.1 }}
                              animate={{ opacity: [0.1, 0.4, 0.2] }}
                              transition={{ 
                                 duration: d.duration, 
                                 repeat: Infinity,
                                 delay: d.delay
                              }}
                              className={`rounded-sm ${
                                 d.type === 'primary' ? 'bg-[#4285F4]' : 
                                 d.type === 'secondary' ? 'bg-[#00E5FF]' : 'bg-white/5'
                              }`}
                           />
                        ))}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-[#1A1D23] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#5F6368] mb-6 flex items-center gap-2">
               <Shield size={14} />
               Security Matrix
            </h3>
            <div className="space-y-4">
               {[
                 { label: 'Firewall', status: 'Active', color: '#34A853' },
                 { label: 'RBAC Integrity', status: 'Verified', color: '#4285F4' },
                 { label: 'Audit Log System', status: 'Writing', color: '#34A853' },
                 { label: 'Intrusion Detection', status: 'Scanning', color: '#FBBC04' },
               ].map(item => (
                 <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-[10px] font-bold text-[#9AA0A6]">{item.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: `${item.color}15` }}>{item.status}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
