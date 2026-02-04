import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Instagram, Linkedin, Twitter, Globe, 
  TrendingUp, Users, MessageSquare, Heart, 
  Zap, Shield, RefreshCw, BarChart2, Hash, Plus
} from 'lucide-react';

interface Interaction {
  id: string;
  user: string;
  platform: 'instagram' | 'linkedin' | 'twitter';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: number;
}

export function DistributionHub() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [metrics, setMetrics] = useState({
    impressions: 42500,
    engagement: 12.4,
    sentiment: 88,
    reach: 18200
  });

  // Simulation logic for live social feed
  useEffect(() => {
    const users = ['nexus_operator', 'digital_nomad', 'tech_guru', 'ai_visionary', 'quantum_dev'];
    const comments = [
      'The G5 orchestration is flawless.',
      'Incredible depth in the design blueprint!',
      'Finally, an OS that scales with human intent.',
      'Substrate persistence is a game changer.',
      'Neural mesh visuals are stunning.'
    ];

    const interval = setInterval(() => {
      const newInteraction: Interaction = {
        id: Math.random().toString(36).substr(2, 9),
        user: users[Math.floor(Math.random() * users.length)],
        platform: ['instagram', 'linkedin', 'twitter'][Math.floor(Math.random() * 3)] as any,
        text: comments[Math.floor(Math.random() * comments.length)],
        sentiment: 'positive',
        timestamp: Date.now()
      };

      setInteractions(prev => [newInteraction, ...prev].slice(0, 10));
      setMetrics(prev => ({
        ...prev,
        impressions: prev.impressions + Math.floor(Math.random() * 50),
        reach: prev.reach + Math.floor(Math.random() * 20),
        sentiment: Math.min(100, prev.sentiment + (Math.random() - 0.45))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
      {/* ─── Header Section ─── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#E8EAED] flex items-center gap-3">
            <Share2 className="text-[#00E5FF]" size={24} />
            Command & Distribution Hub
          </h2>
          <p className="text-[10px] text-[#5F6368] uppercase tracking-[0.2em] mt-1">Live Multi-Channel Campaign Oversight</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[8px] text-[#5F6368] uppercase">Substrate Sync</span>
             <span className="text-[10px] font-mono text-[#34A853]">99.8% STABLE</span>
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#E8EAED] hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* ─── Left: Platform Integrity ─── */}
        <div className="col-span-3 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
           <PlatformCard name="Instagram" icon={Instagram} color="#E4405F" status="ACTIVE" load={65} />
           <PlatformCard name="LinkedIn" icon={Linkedin} color="#0A66C2" status="SYNCED" load={42} />
           <PlatformCard name="Twitter / X" icon={Twitter} color="#1DA1F2" status="ACTIVE" load={28} />
           <PlatformCard name="Global CDN" icon={Globe} color="#34A853" status="HEALTHY" load={12} />

           <div className="p-4 rounded-xl border border-white/5 bg-black/20 mt-6">
              <h3 className="text-[10px] uppercase tracking-widest text-[#5F6368] mb-4 flex items-center gap-2">
                 <Shield size={12} /> Distribution Security
              </h3>
              <div className="space-y-2">
                 <SecurityItem label="Bot Mitigation" status="SHIELDED" color="#34A853" />
                 <SecurityItem label="Geo-Compliance" status="REGION-LOCK" color="#4285F4" />
                 <SecurityItem label="Asset DRM" status="ENCRYPTED" color="#A855F7" />
              </div>
           </div>
        </div>

        {/* ─── Center: Live Impact Simulation ─── */}
        <div className="col-span-6 flex flex-col gap-4 overflow-hidden">
           <div className="flex-1 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.1),transparent_70%)]" />
              </div>
              
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#00E5FF]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8EAED]">Internal Live Impact Stream</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-pulse" />
                    <span className="text-[9px] font-mono text-[#EA4335]">LIVE</span>
                 </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                 <AnimatePresence initial={false}>
                    {interactions.map((interaction) => (
                      <motion.div
                        key={interaction.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#4285F4] to-[#A855F7] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                 {interaction.user[0]}
                              </div>
                              <span className="text-[11px] font-bold text-[#E8EAED]">@{interaction.user}</span>
                           </div>
                           <div className="text-[10px] text-[#5F6368]">
                              {interaction.platform === 'instagram' && <Instagram size={12} />}
                              {interaction.platform === 'linkedin' && <Linkedin size={12} />}
                              {interaction.platform === 'twitter' && <Twitter size={12} />}
                           </div>
                        </div>
                        <p className="text-xs text-[#9AA0A6] leading-relaxed mb-3">{interaction.text}</p>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 text-[9px] text-[#34A853]">
                              <Heart size={10} fill="currentColor" /> 1.2k
                           </div>
                           <div className="flex items-center gap-1 text-[9px] text-[#4285F4]">
                              <MessageSquare size={10} /> 42
                           </div>
                           <div className="ml-auto text-[8px] font-mono text-[#222E3A] px-1.5 py-0.5 rounded bg-[#34A853]/10 text-[#34A853]">
                              POSITIVE SENTIMENT
                           </div>
                        </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* ─── Right: Hard Stats & Heatmap ─── */}
        <div className="col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
           <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Impressions" value={metrics.impressions.toLocaleString()} icon={Users} color="#4285F4" />
              <StatBlock label="Engagement" value={`${metrics.engagement}%`} icon={Zap} color="#FBBC04" />
              <StatBlock label="Sentiment" value={`${metrics.sentiment.toFixed(1)}%`} icon={Heart} color="#EA4335" />
              <StatBlock label="Network Reach" value={metrics.reach.toLocaleString()} icon={Globe} color="#34A853" />
           </div>

           <div className="p-4 rounded-xl border border-white/5 bg-black/20">
              <h3 className="text-[10px] uppercase tracking-widest text-[#5F6368] mb-4 flex items-center gap-2">
                 <BarChart2 size={12} /> Global Impact Map
              </h3>
              <div className="aspect-square rounded-lg bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(66,133,244,0.15),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(52,168,83,0.1),transparent_50%)]" />
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF] animate-pulse absolute top-1/3 left-1/4" />
                  <div className="w-3 h-3 rounded-full bg-[#A855F7] shadow-[0_0_15px_#A855F7] animate-pulse absolute top-1/2 left-2/3" />
                  <span className="text-[10px] font-mono text-[#5F6368] opacity-20 uppercase font-bold text-center px-4">Satellite Substrate Active</span>
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368]">CAMPAIGN TAGS</span>
                <Plus size={10} className="text-[#5F6368]" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                 {['#G5_OS', '#AI_LEAP', '#AG_SUBSTRATE', '#NEXUS'].map(tag => (
                   <span key={tag} className="text-[9px] font-bold text-[#4285F4] bg-[#4285F4]/10 border border-[#4285F4]/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <Hash size={8} /> {tag}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PlatformCard({ name, icon: Icon, color, status, load }: any) {
  return (
    <div className="p-4 rounded-xl border border-white/5 bg-black/20 group hover:border-white/10 transition-all overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-5">
        <Icon size={40} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
           <Icon size={16} />
        </div>
        <div>
           <div className="text-[11px] font-bold text-[#E8EAED]">{name}</div>
           <div className="text-[9px] font-mono opacity-50 uppercase tracking-tighter" style={{ color }}>{status}</div>
        </div>
      </div>
      <div className="space-y-1.5">
         <div className="flex justify-between text-[8px] font-mono text-[#5F6368]">
            <span>ENGINE LOAD</span>
            <span>{load}%</span>
         </div>
         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${load}%` }}
               className="h-full"
               style={{ backgroundColor: color }}
            />
         </div>
      </div>
    </div>
  );
}

function SecurityItem({ label, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-transparent hover:border-white/5">
       <span className="text-[9px] font-bold text-[#9AA0A6] uppercase tracking-tight">{label}</span>
       <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>{status}</span>
    </div>
  );
}

function StatBlock({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-3 rounded-xl border border-white/5 bg-black/20">
       <div className="flex items-center justify-between mb-2">
          <Icon size={12} style={{ color }} />
          <div className="w-1 h-1 rounded-full bg-[#5F6368] opacity-30" />
       </div>
       <div className="text-sm font-display font-bold text-[#E8EAED]">{value}</div>
       <div className="text-[8px] text-[#5F6368] uppercase tracking-tighter mt-0.5">{label}</div>
    </div>
  );
}
