import type { NodeState, GeneratedAsset } from '../lib/types';
import { X, FileText, Film, Award, Palette, Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface InspectorProps {
  selectedNode: NodeState | null;
  assets: GeneratedAsset[];
  onClose: () => void;
}

export function Inspector({ selectedNode, assets, onClose }: InspectorProps) {
  // Find assets for selected node
  const nodeAssets = selectedNode 
    ? assets.filter(a => a.generatedBy === selectedNode.id)
    : [];

  if (!selectedNode && assets.length === 0) {
    return (
      <aside className="w-72 border-l border-[rgba(255,255,255,0.08)] bg-[#1A1D23] flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-[#5F6368] text-sm mb-1">No Selection</div>
          <p className="text-[10px] text-[#5F6368]">Click a node to inspect</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-[rgba(255,255,255,0.08)] bg-[#1A1D23] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
        <span className="text-xs font-display text-[#9AA0A6] uppercase tracking-wider">Inspector</span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#22262E] rounded text-[#5F6368] hover:text-[#E8EAED]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Node Details */}
        {selectedNode && (
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-[#5F6368] uppercase tracking-wider mb-1">Node</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[#4285F4]">{selectedNode.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedNode.status === 'running' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                  selectedNode.status === 'completed' ? 'bg-[#34A853]/20 text-[#34A853]' :
                  'bg-[rgba(255,255,255,0.1)] text-[#5F6368]'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#5F6368] uppercase tracking-wider mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4285F4] rounded-full transition-all"
                    style={{ width: `${selectedNode.progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-[#E8EAED]">{selectedNode.progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Assets */}
        {nodeAssets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-[#5F6368] uppercase tracking-wider">Output Assets</div>
            {nodeAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}

        {/* All Assets (if no node selected) */}
        {!selectedNode && assets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] text-[#5F6368] uppercase tracking-wider">All Assets</div>
            {assets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function AssetCard({ asset }: { asset: GeneratedAsset }) {
  const [copied, setCopied] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (asset.imageData?.url) {
      // Open image URL in new tab
      window.open(asset.imageData.url, '_blank');
    } else if (asset.imageData?.base64) {
      // Legacy: Download base64 image
      const link = document.createElement('a');
      link.href = `data:${asset.imageData.mimeType};base64,${asset.imageData.base64}`;
      link.download = `${asset.title.replace(/\s+/g, '_')}.png`;
      link.click();
    } else {
      // Download text
      const blob = new Blob([asset.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.title.replace(/\s+/g, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getIcon = () => {
    switch (asset.type) {
      case 'strategy': return <Award size={14} className="text-[#A855F7]" />;
      case 'video_prompt': return <Film size={14} className="text-pink-400" />;
      case 'design_blueprint': return <Palette size={14} className="text-orange-400" />;
      default: return <FileText size={14} className="text-[#4285F4]" />;
    }
  };

  const hasImage = !!(asset.imageData?.url || asset.imageData?.base64);

  return (
    <div className="p-3 rounded-lg bg-[#22262E] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all group">
      <div className="flex items-start gap-2 mb-2">
        <div className="p-1.5 rounded bg-[rgba(255,255,255,0.05)]">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-[#5F6368] font-mono">{asset.generatedBy}</div>
          <div className="text-xs text-[#E8EAED] font-medium truncate">{asset.title}</div>
        </div>
        {hasImage && (
          <span className="text-[9px] px-1.5 py-0.5 bg-[#34A853]/20 text-[#34A853] rounded">
            🖼️ IMAGE
          </span>
        )}
      </div>

      {/* Image Preview */}
      {hasImage && (
        <div className="mb-2">
          <button 
            onClick={() => setShowImage(!showImage)}
            className="text-[10px] text-[#4285F4] hover:underline"
          >
            {showImage ? 'Hide Image' : 'Show Image Preview'}
          </button>
          {showImage && (
            <div className="mt-2 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
              <img 
                src={asset.imageData!.url || `data:${asset.imageData!.mimeType};base64,${asset.imageData!.base64}`}
                alt={asset.title}
                className="w-full h-auto"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>
      )}
      
      <p className="text-[11px] text-[#9AA0A6] line-clamp-3 mb-2">
        {hasImage ? asset.imageData!.prompt.slice(0, 120) : asset.content.slice(0, 120)}...
      </p>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded text-[#9AA0A6] transition-all"
        >
          {copied ? <Check size={10} className="text-[#34A853]" /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1 px-2 py-1 text-[10px] bg-[#4285F4]/20 hover:bg-[#4285F4]/30 rounded text-[#4285F4] transition-all"
        >
          <Download size={10} />
          {hasImage ? 'Save Image' : 'Download'}
        </button>
      </div>
    </div>
  );
}
