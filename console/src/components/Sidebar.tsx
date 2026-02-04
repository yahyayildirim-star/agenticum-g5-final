import { useState } from 'react';
import type { GeneratedAsset, VaultFile } from '../lib/types';
import { 
  ChevronLeft, ChevronRight, Layers, FolderOpen, Clock,
  FileText, Image, Video, Upload, Download, Award, Film, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  assets: GeneratedAsset[];
  vaultFiles: VaultFile[];
  onFileUpload: (files: FileList) => void;
}

type Tab = 'nodes' | 'vault' | 'history';

export function Sidebar({ collapsed, onToggle, assets, vaultFiles, onFileUpload }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('vault');

  const tabs = [
    { id: 'nodes' as Tab, icon: Layers, label: 'Nodes' },
    { id: 'vault' as Tab, icon: FolderOpen, label: 'Vault' },
    { id: 'history' as Tab, icon: Clock, label: 'History' },
  ];

  return (
    <aside className={`flex flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#1A1D23] transition-all duration-300 ${collapsed ? 'w-12' : 'w-64'}`}>
      
      {/* Tab Bar */}
      <div className={`flex items-center border-b border-[rgba(255,255,255,0.08)] ${collapsed ? 'flex-col py-2' : 'px-2 py-1'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !collapsed && setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              activeTab === tab.id && !collapsed
                ? 'bg-[#22262E] text-[#E8EAED]' 
                : 'text-[#5F6368] hover:text-[#9AA0A6]'
            } ${collapsed ? 'w-full justify-center' : ''}`}
          >
            <tab.icon size={16} />
            {!collapsed && <span className="text-xs">{tab.label}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!collapsed && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full overflow-y-auto p-3"
            >
              {activeTab === 'nodes' && <NodesPanel />}
              {activeTab === 'vault' && (
                <VaultPanel 
                  assets={assets} 
                  files={vaultFiles} 
                  onUpload={onFileUpload}
                />
              )}
              {activeTab === 'history' && <HistoryPanel />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={onToggle}
        className="p-2 border-t border-[rgba(255,255,255,0.08)] text-[#5F6368] hover:text-[#E8EAED] hover:bg-[#22262E] transition-all"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function NodesPanel() {
  const nodes = [
    { id: 'SN-00', name: 'Orchestrator', cluster: 'Core' },
    { id: 'SP-01', name: 'Strategist', cluster: 'Strategy' },
    { id: 'RA-01', name: 'Auditor', cluster: 'Adversarial' },
    { id: 'CC-06', name: 'Video Director', cluster: 'Content' },
    { id: 'DA-03', name: 'Design Architect', cluster: 'Design' },
  ];

  return (
    <div className="space-y-1">
      <div className="text-[10px] text-[#5F6368] uppercase tracking-wider mb-2">Available Nodes</div>
      {nodes.map(node => (
        <div 
          key={node.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#22262E] cursor-pointer group transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-[#34A853]" />
          <span className="text-xs font-mono text-[#4285F4]">{node.id}</span>
          <span className="text-xs text-[#9AA0A6] flex-1">{node.name}</span>
        </div>
      ))}
    </div>
  );
}

function VaultPanel({ assets, files, onUpload }: { 
  assets: GeneratedAsset[]; 
  files: VaultFile[];
  onUpload: (files: FileList) => void;
}) {
  const getIcon = (type: string) => {
    if (type === 'strategy') return <Award size={14} className="text-[#A855F7]" />;
    if (type === 'video_prompt') return <Film size={14} className="text-pink-400" />;
    if (type === 'design_blueprint') return <Palette size={14} className="text-orange-400" />;
    if (type === 'image') return <Image size={14} className="text-green-400" />;
    if (type === 'video') return <Video size={14} className="text-purple-400" />;
    return <FileText size={14} className="text-[#4285F4]" />;
  };

  const allFiles = [
    ...assets.map(a => ({ id: a.id, name: a.title, type: a.type, source: a.generatedBy })),
    ...files.map(f => ({ id: f.id, name: f.name, type: f.type, source: f.source }))
  ];

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[rgba(255,255,255,0.15)] rounded-lg cursor-pointer hover:border-[#4285F4]/50 hover:bg-[#4285F4]/5 transition-all">
        <Upload size={18} className="text-[#5F6368] mb-1" />
        <span className="text-[10px] text-[#5F6368]">Drop or click to upload</span>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
      </label>

      {/* File List */}
      <div className="space-y-1">
        <div className="text-[10px] text-[#5F6368] uppercase tracking-wider">
          {allFiles.length} Files
        </div>
        {allFiles.map(file => (
          <div 
            key={file.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#22262E] group transition-all"
          >
            {getIcon(file.type)}
            <span className="text-xs text-[#E8EAED] flex-1 truncate">{file.name}</span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#4285F4]/20 rounded transition-all">
              <Download size={12} className="text-[#4285F4]" />
            </button>
          </div>
        ))}
        {allFiles.length === 0 && (
          <div className="text-xs text-[#5F6368] text-center py-4">
            No files yet
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-[#5F6368] uppercase tracking-wider mb-2">Recent Sessions</div>
      <div className="text-xs text-[#5F6368] text-center py-4">
        No history yet
      </div>
    </div>
  );
}
