import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GeneratedAsset } from '../lib/types';
import { Download, Info, Eye } from 'lucide-react';
import { NeuralDecryption } from './NeuralDecryption';

interface AssetPreviewProps {
  asset: GeneratedAsset;
}

export function AssetPreview({ asset }: AssetPreviewProps) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const hasImage = !!(asset.imageData?.url || asset.imageData?.base64);

  return (
    <div className="h-full flex flex-col bg-[#0F1115]">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/2">
        <div className="flex items-center gap-4">
           {['Preview', 'Code', 'MetaData'].map(tab => (
             <button key={tab} className={`text-[10px] font-bold uppercase tracking-widest ${tab === 'Preview' ? 'text-[#4285F4]' : 'text-[#5F6368] hover:text-[#9AA0A6]'}`}>
                {tab}
             </button>
           ))}
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4285F4]/10 text-[#4285F4] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#4285F4]/20 transition-all">
              <Download size={12} />
              Export
           </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-10 flex flex-col items-center">
        {hasImage ? (
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
        )}
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
