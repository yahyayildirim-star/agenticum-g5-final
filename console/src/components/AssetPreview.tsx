import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GeneratedAsset } from '../lib/types';
import { Download, Info, Eye, Zap } from 'lucide-react';
import { NeuralDecryption } from './NeuralDecryption';

interface AssetPreviewProps {
  asset: GeneratedAsset;
}

export function AssetPreview({ asset }: AssetPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'metadata'>('preview');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const hasImage = !!(asset.imageData?.url || asset.imageData?.base64);

  const handleExport = () => {
    const content = activeTab === 'metadata' ? JSON.stringify({ ...asset, system_metadata: { substrate: 'Antigravity G5', engine: 'Gemini 3', validation: 'Forensic' } }, null, 2) : asset.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.replace(/\s+/g, '_')}_${activeTab}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (activeTab === 'code') {
      return (
        <div className="w-full max-w-4xl bg-black/40 border border-white/5 rounded-xl p-6 font-mono text-[11px] text-[#34A853] overflow-auto max-h-[60vh]">
          <pre className="whitespace-pre-wrap">{asset.content}</pre>
          {hasImage && asset.imageData && (
            <div className="mt-4 border-t border-white/5 pt-4 text-[#9AA0A6]">
              <div className="mb-2 uppercase text-[9px] font-bold">Image Logic Fragment</div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(asset.imageData, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'metadata') {
      const metaItems = [
        { label: 'Asset ID', value: asset.id },
        { label: 'Type', value: asset.type.toUpperCase() },
        { label: 'Generator', value: asset.generatedBy },
        { label: 'Timestamp', value: new Date(asset.createdAt).toISOString() },
        { label: 'Substrate', value: 'Google Stack (Gemini 3)' },
        { label: 'Integrity', value: 'Forensic Link Established' },
        { label: 'Mime-Type', value: hasImage ? 'image/png' : 'text/markdown' },
      ];

      return (
        <div className="w-full max-w-2xl space-y-2">
          {metaItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F6368]">{item.label}</span>
              <span className="text-xs font-mono text-[#E8EAED]">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }

    // Default: Preview
    return hasImage ? (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative group"
      >
        <div className="absolute inset-0 bg-[#4285F4]/10 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" />
        <img 
          src={asset.imageData!.url || `data:${asset.imageData!.mimeType};base64,${asset.imageData!.base64}`}
          alt={asset.title}
          className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl relative z-10"
          crossOrigin="anonymous"
        />
        <div className="mt-6 space-y-4 relative z-10">
          <h2 className="text-xl font-display font-bold text-[#E8EAED]">{asset.title}</h2>
          <p className="text-sm text-[#9AA0A6] leading-relaxed italic">
            "{asset.imageData!.prompt}"
          </p>
        </div>
      </motion.div>
    ) : (
      <div className="w-full max-w-3xl bg-[#1A1D23] border border-white/5 rounded-2xl p-8 font-mono text-sm text-[#E8EAED] whitespace-pre-wrap leading-relaxed relative overflow-hidden">
        {!isDecrypted && (
          <div className="absolute inset-0 bg-[#4285F4]/5 animate-pulse pointer-events-none" />
        )}
        <NeuralDecryption 
          text={asset.content} 
          speed={20} 
          onComplete={() => setIsDecrypted(true)} 
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0F1115]">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/2">
        <div className="flex items-center gap-4">
           {(['preview', 'code', 'metadata'] as const).map(tab => (
             <button 
               key={tab} 
               onMouseDown={(e) => { 
                 e.preventDefault();
                 e.stopPropagation(); 
                 setActiveTab(tab); 
               }}
               className={`text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer hover:scale-105 active:scale-95 ${activeTab === tab ? 'text-[#4285F4]' : 'text-[#5F6368] hover:text-[#9AA0A6]'}`}
             >
                {tab}
             </button>
           ))}
        </div>
        <div className="flex items-center gap-3">
            <button 
             onMouseDown={(e) => { 
               e.preventDefault();
               e.stopPropagation(); 
               handleExport(); 
             }}
             className="flex items-center gap-2 px-3 py-1.5 bg-[#4285F4]/10 text-[#4285F4] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#4285F4]/20 transition-all cursor-pointer active:scale-95 active:bg-[#4285F4]/30"
            >
               <Download size={12} />
               Export
            </button>
            <button 
             onMouseDown={async (e) => { 
               e.preventDefault();
               e.stopPropagation(); 
               
               // TTS Implementation
               try {
                 const ttsUrl = import.meta.env.VITE_TTS_URL || "https://tts-4pucruljfa-uc.a.run.app";
                 const response = await fetch(ttsUrl, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({ text: asset.content.substring(0, 3000) })
                 });
                 if (!response.ok) throw new Error("TTS failed");
                 const data = await response.json();
                 if (data.audioUrl) {
                   const audio = new Audio(data.audioUrl);
                   audio.play();
                 }
               } catch (err) {
                 console.error("TTS Error:", err);
               }
             }}
             className="flex items-center gap-2 px-3 py-1.5 bg-[#34A853]/10 text-[#34A853] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#34A853]/20 transition-all cursor-pointer active:scale-95 active:bg-[#34A853]/30"
            >
               <Zap size={12} />
               Listen
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-10 flex flex-col items-center">
        {renderContent()}
      </div>

      {/* Footer Info */}
      <div className="h-10 border-t border-white/5 px-6 flex items-center justify-between bg-black/20">
         <div className="flex items-center gap-4 text-[9px] font-mono text-[#5F6368]">
            <div className="flex items-center gap-1"><Info size={10} /> ID: {asset.id}</div>
            <div className="flex items-center gap-1"><Eye size={10} /> CREATED: {new Date(asset.createdAt).toLocaleTimeString()}</div>
         </div>
         <div className="text-[9px] text-[#4285F4] font-bold uppercase tracking-widest">
            Substrate Verified • AI Powered
         </div>
      </div>
    </div>
  );
}
