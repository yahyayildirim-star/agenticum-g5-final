import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, ShieldCheck, Zap, Layout, Type, Image as ImageIcon } from 'lucide-react';

export function BrandHub() {
  const [dna, setDna] = useState(() => localStorage.getItem('g5_brand_dna') || "");
  const [colors, setColors] = useState({
    primary: localStorage.getItem('g5_brand_primary') || '#4285F4',
    secondary: localStorage.getItem('g5_brand_secondary') || '#00E5FF'
  });
  const [saving, setSaving] = useState(false);

  // Apply colors to CSS variables in real-time
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', colors.primary);
    document.documentElement.style.setProperty('--brand-secondary', colors.secondary);
    document.documentElement.style.setProperty('--brand-glow', `${colors.primary}66`); // 40% opacity
  }, [colors]);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('g5_brand_dna', dna);
    localStorage.setItem('g5_brand_primary', colors.primary);
    localStorage.setItem('g5_brand_secondary', colors.secondary);
    
    // Simulate cloud sync
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 h-full flex flex-col gap-6 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#4285F4]/10 rounded-lg text-[#00E5FF]">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#E8EAED] uppercase tracking-widest">Visual DNA & Perception Hub</h2>
            <p className="text-[10px] text-[#5F6368] uppercase tracking-wider">Configure agent identity and OS substrate aesthetics</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-lg transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(66,133,244,0.3)]"
        >
          <Save size={14} />
          {saving ? "SYNCING..." : "COMMIT CONFIGURATION"}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* ─── Left: Identity Configuration ─── */}
        <div className="col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#5F6368] font-bold flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#34A853]" />
              Core Identity & Cognitive Anchoring
            </label>
            <textarea 
              value={dna}
              onChange={(e) => setDna(e.target.value)}
              placeholder="Describe your brand's core mission, tone of voice, and value patterns..."
              className="w-full h-64 bg-black/40 border border-white/5 rounded-xl p-4 text-[11px] text-[#E8EAED] font-mono leading-relaxed focus:border-[#4285F4]/50 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#9AA0A6] uppercase">
                   <Type size={14} className="text-[#A855F7]" /> Language Pattern
                </div>
                <div className="flex gap-2">
                   {['Formal', 'Bold', 'Scientific', 'Human'].map(p => (
                     <button key={p} className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-[#5F6368] hover:text-[#E8EAED] transition-all">
                        {p}
                     </button>
                   ))}
                </div>
             </div>
             <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#9AA0A6] uppercase">
                   <ImageIcon size={14} className="text-[#FBBC04]" /> Asset Aesthetic
                </div>
                <div className="flex gap-2">
                   {['Photoreal', 'Cyberpunk', 'Minimal', 'Raw'].map(a => (
                     <button key={a} className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-[#5F6368] hover:text-[#E8EAED] transition-all">
                        {a}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* ─── Right: Visual Substrate Control ─── */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-5 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#5F6368] font-bold flex items-center gap-2">
               <Layout size={14} /> Chromatic Substrate
            </h3>
            
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[9px] font-bold text-[#9AA0A6] uppercase mb-2">Primary DNA Color</div>
                  <div className="flex items-center gap-3">
                     <input 
                        type="color" 
                        value={colors.primary} 
                        onChange={(e) => setColors(prev => ({ ...prev, primary: e.target.value }))}
                        className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                     />
                     <div className="flex-1 font-mono text-[10px] text-[#E8EAED] bg-white/5 px-3 py-2 rounded border border-white/5 uppercase">
                        {colors.primary}
                     </div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-[9px] font-bold text-[#9AA0A6] uppercase mb-2">Secondary Accent</div>
                  <div className="flex items-center gap-3">
                     <input 
                        type="color" 
                        value={colors.secondary} 
                        onChange={(e) => setColors(prev => ({ ...prev, secondary: e.target.value }))}
                        className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                     />
                     <div className="flex-1 font-mono text-[10px] text-[#E8EAED] bg-white/5 px-3 py-2 rounded border border-white/5 uppercase">
                        {colors.secondary}
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[9px] uppercase font-bold text-[#5F6368]">
                   <span>Perception Depth</span>
                   <span className="text-[#E8EAED]">89%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#4285F4] to-[#00E5FF]" style={{ width: '89%' }}></div>
                 </div>
               </div>
               
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                   <span className="text-[9px] font-mono text-[#34A853]">NEURAL ANCHORING ACTIVE</span>
                 </div>
                 <div className="flex items-center gap-2 opacity-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#5F6368]" />
                   <span className="text-[9px] font-mono text-[#5F6368]">VECTOR SYNC READY</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-white/3 flex items-center justify-between group cursor-help">
             <div className="flex items-center gap-3">
                <Zap size={14} className="text-[#FBBC04]" />
                <span className="text-[10px] font-bold text-[#9AA0A6] uppercase">Agent Sync</span>
             </div>
             <div className="text-[10px] font-mono text-[#5F6368] group-hover:text-[#E8EAED] transition-all">v2.44-STABLE</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
