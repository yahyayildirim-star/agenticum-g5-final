import type { GeneratedAsset, VaultFile } from '../lib/types';
import {
  ChevronLeft, ChevronRight,
  FileText, Image, Video, Upload, Download, Award, Film, Palette,
  Terminal, Layout, Database, Vault, Shield, Share2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab: 'nodes' | 'terminal' | 'vault' | 'brand' | 'audit' | 'distribution' | 'telemetry';
  onTabChange: (tab: 'nodes' | 'terminal' | 'vault' | 'brand' | 'audit' | 'distribution' | 'telemetry') => void;
  onOpenSettings: () => void;
  assets: GeneratedAsset[];
  vaultFiles: VaultFile[];
  onFileUpload: (files: FileList) => void;
}

type Tab = 'nodes' | 'terminal' | 'vault' | 'brand' | 'audit' | 'distribution';

export function Sidebar({ collapsed, onToggle, activeTab, onTabChange, assets, vaultFiles, onFileUpload, onOpenSettings }: SidebarProps) {
  const tabs = [
    { id: 'nodes' as Tab, icon: Layout, label: 'Node Canvas' },
    { id: 'terminal' as Tab, icon: Terminal, label: 'Thinking Trace' },
    { id: 'vault' as Tab, icon: Vault, label: 'Asset Vault' },
    { id: 'brand' as Tab, icon: Database, label: 'Brand Hub' },
    { id: 'audit' as Tab, icon: Shield, label: 'Security & Audit' },
    { id: 'telemetry' as Tab, icon: Database, label: 'System Telemetry' },
    { id: 'distribution' as Tab, icon: Share2, label: 'Distribution' },
  ];

  return (
    <aside className={`bg-[#1A1D23] border-r border-[rgba(255,255,255,0.08)] flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      
      {/* Tab Bar (Vertical enforced) */}
      <nav className="flex flex-col border-b border-[rgba(255,255,255,0.08)] p-2 gap-1 px-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group ${
              activeTab === tab.id 
                ? 'text-[#E8EAED] bg-[#4285F4]/15 border border-[#4285F4]/30 shadow-[0_0_15px_rgba(66,133,244,0.1)]' 
                : 'text-[#5F6368] hover:text-[#9AA0A6] hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
            }`}
            title={tab.label}
          >
            <div className={`shrink-0 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#00E5FF]' : ''}`}>
              <tab.icon size={18} />
            </div>
            {!collapsed && (
              <span className="text-xs font-semibold tracking-tight uppercase truncate">
                {tab.label}
              </span>
            )}
          </button>
        ))}
      </nav>

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
              {activeTab === 'terminal' && <div className="text-[10px] text-[#5F6368] font-mono p-4">Telemetry Active...</div>}
              {activeTab === 'vault' && (
                <VaultPanel 
                  assets={assets} 
                  files={vaultFiles} 
                  onUpload={onFileUpload}
                />
              )}
              {activeTab === 'brand' && <div className="text-[10px] text-[#5F6368] font-mono p-4">Brand Hub Control Active...</div>}
              {activeTab === 'audit' && <div className="text-[10px] text-[#5F6368] font-mono p-4">Security Feed Subsubstrate Active...</div>}
              {activeTab === 'telemetry' && <div className="text-[10px] text-[#5F6368] font-mono p-4">Telemetry Stream Engaged...</div>}
              {activeTab === 'distribution' && <div className="text-[10px] text-[#5F6368] font-mono p-4">Distribution Engine Monitoring...</div>}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="flex flex-col border-t border-[rgba(255,255,255,0.08)]">
        <button 
          onClick={onOpenSettings}
          className="p-3 text-[#5F6368] hover:text-[#4285F4] hover:bg-[#22262E] transition-all flex items-center justify-center gap-3"
          title="System Settings"
        >
          <Settings size={18} />
          {!collapsed && <span className="text-xs font-medium">Settings</span>}
        </button>
        <button 
          onClick={onToggle}
          className="p-3 text-[#5F6368] hover:text-[#E8EAED] hover:bg-[#22262E] transition-all flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
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
      <div className="text-[10px] text-[#5F6368] uppercase tracking-wider mb-2 text-center border-b border-white/5 pb-1">Available Nodes</div>
      {nodes.map(node => (
        <div key={node.id} className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between group hover:border-[#34A853]/50 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#E8EAED]">{node.name}</span>
            <span className="text-[8px] text-[#5F6368] uppercase">{node.cluster}</span>
          </div>
          <span className="text-[9px] font-mono text-[#34A853] opacity-50 group-hover:opacity-100">{node.id}</span>
        </div>
      ))}
    </div>
  );
}

function VaultPanel({ assets, files, onUpload }: { assets: GeneratedAsset[], files: VaultFile[], onUpload: (f: FileList) => void }) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'image': return <Image size={10} />;
      case 'video': return <Video size={10} />;
      case 'strategy': return <Award size={10} />;
      case 'video_prompt': return <Film size={10} />;
      case 'design_blueprint': return <Palette size={10} />;
      default: return <FileText size={10} />;
    }
  };

  const allItems = [
    ...assets.map(a => ({ id: a.id, title: a.title, subtitle: `By ${a.generatedBy}`, type: a.type })),
    ...files.map(f => ({ id: f.id, title: f.name, subtitle: `Imported via ${f.source}`, type: f.type || 'file' }))
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] text-[#5F6368] uppercase tracking-wider">Vault Registry</span>
        <label className="p-1 hover:bg-white/5 rounded transition-all cursor-pointer">
          <Upload size={12} className="text-[#34A853]" />
          <input type="file" multiple className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files)} />
        </label>
      </div>
      <div className="space-y-2">
        {allItems.map(item => (
          <div key={item.id} className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center gap-2 group hover:border-[#34A853]/30 transition-all">
            <div className="p-1.5 rounded bg-[#34A853]/10 text-[#34A853]">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 truncate">
              <div className="text-[9px] font-bold text-[#E8EAED] truncate">{item.title}</div>
              <div className="text-[8px] text-[#5F6368] italic">{item.subtitle}</div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-[#5F6368] transition-all">
              <Download size={10} />
            </button>
          </div>
        ))}
        {allItems.length === 0 && (
          <div className="text-[10px] text-[#5F6368] text-center py-8 italic uppercase tracking-widest opacity-30">Registry Empty</div>
        )}
      </div>
    </div>
  );
}
