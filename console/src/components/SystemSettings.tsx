import { motion } from 'framer-motion';
import { Settings, Shield, Cpu, Zap, Database, Sliders, Save, X, Globe } from 'lucide-react';
import { useState } from 'react';

interface SettingGroupProps {
  icon: any;
  title: string;
  children: React.ReactNode;
}

function SettingGroup({ icon: Icon, title, children }: SettingGroupProps) {
  return (
    <div className="bg-[#1A1D23] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#4285F4]/10 rounded-lg text-[#4285F4]">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#E8EAED]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function SystemSettings({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'security' | 'visuals'>('general');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-[#0F1115]/90 backdrop-blur-2xl"
    >
      <div className="w-full max-w-5xl h-full bg-[#14171C] border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/2">
          <div className="flex items-center gap-3">
            <Settings className="text-[#4285F4]" size={20} />
            <span className="text-lg font-display font-bold text-[#E8EAED]">SYSTEM CONFIGURATION <span className="text-[#5F6368] font-mono text-xs ml-2">v5.0.1-STABLE</span></span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-[#5F6368] hover:text-[#E8EAED] transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 p-4 space-y-1 bg-black/20">
            {[
              { id: 'general', icon: Sliders, label: 'Core Prefs' },
              { id: 'ai', icon: Cpu, label: 'Neural Engine' },
              { id: 'security', icon: Shield, label: 'Security & Auth' },
              { id: 'visuals', icon: Zap, label: 'Visual Interface' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20' 
                    : 'text-[#5F6368] hover:text-[#9AA0A6] hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {activeTab === 'general' && (
              <>
                <SettingGroup icon={Sliders} title="Enterprise Identity">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-[#5F6368] uppercase font-bold">System Name</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#E8EAED] focus:border-[#4285F4]/50 outline-none" defaultValue="AGENTICUM G5 OS" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-[#5F6368] uppercase font-bold">Organization ID</label>
                        <input className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-[#E8EAED]" defaultValue="G5-ALPHA-992" readOnly />
                    </div>
                  </div>
                </SettingGroup>

                <SettingGroup icon={Globe} title="Regional & Sync">
                   <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold">Cloud Sync</span>
                         <span className="text-[10px] text-[#5F6368]">Automatic state backup to Firestore Cluster</span>
                      </div>
                      <div className="w-10 h-5 bg-[#34A853] rounded-full relative p-1 cursor-pointer">
                         <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                      </div>
                   </div>
                </SettingGroup>
              </>
            )}

            {activeTab === 'ai' && (
              <>
                <SettingGroup icon={Cpu} title="Inference Overrides">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-[#9AA0A6]">Thinking Mode Intensity</span>
                         <span className="text-[10px] text-[#4285F4] font-mono">ADAPTIVE</span>
                      </div>
                      <input type="range" className="w-full accent-[#4285F4]" />
                   </div>
                </SettingGroup>

                <SettingGroup icon={Database} title="Memory Substrate">
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Short Term', value: '45.2 GB', usage: 12 },
                        { label: 'Vector Cache', value: '1.2 TB', usage: 88 },
                        { label: 'Brand DNA', value: '8.4 MB', usage: 5 },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 bg-black/40 rounded-xl border border-white/5">
                           <div className="text-[8px] text-[#5F6368] uppercase mb-1">{stat.label}</div>
                           <div className="text-sm font-bold">{stat.value}</div>
                           <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#4285F4]" style={{ width: `${stat.usage}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </SettingGroup>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-white/5 flex items-center justify-between px-8 bg-white/1 shrink-0">
           <div className="flex items-center gap-2 text-[10px] text-[#5F6368] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
              ALL SYSTEMS ONLINE
           </div>
           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-[#E8EAED] hover:bg-white/5 rounded-lg transition-all"
              >
                DISCARD
              </button>
              <button className="px-6 py-2 bg-[#4285F4] text-white text-xs font-bold rounded-lg shadow-[0_0_20px_rgba(66,133,244,0.3)] hover:scale-105 transition-all flex items-center gap-2">
                <Save size={14} />
                APPLY CONFIG
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
