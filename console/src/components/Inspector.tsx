import type { GeneratedAsset, NodeState } from '../lib/types';
import { X, FileText, Film, Award, Palette, Copy, Check, BarChart2, Info, Code, Zap, Hash, Database, Clock, RefreshCw, XCircle, Eye, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ABTestResults, type ABEvaluationResult } from './ABTestResults';
import type { LucideIcon } from 'lucide-react';
import { runABEvaluation } from '../lib/api';

interface InspectorProps {
  selectedNode: NodeState | null;
  assets: GeneratedAsset[];
  onClose: () => void;
  onOpenAsset?: (asset: GeneratedAsset) => void;
  onRegenerateNode?: (nodeId: string, feedback: string) => void;
}

type MainTab = 'content' | 'data';
type InspectTab = 'preview' | 'forensics' | 'source' | 'actions';

export function Inspector({ selectedNode, assets, onClose, onOpenAsset, onRegenerateNode }: InspectorProps) {
  const [activeTab, setActiveTab] = useState<MainTab>('content');
  const [abTestTarget, setAbTestTarget] = useState<GeneratedAsset | null>(null);
  const [evaluationData, setEvaluationData] = useState<ABEvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [inspectTab, setInspectTab] = useState<InspectTab>('preview');
  const [interventionPrompt, setInterventionPrompt] = useState('');
  const [isIntervening, setIsIntervening] = useState(false);

  const startTest = async (target: GeneratedAsset) => {
    setAbTestTarget(target);
    setEvaluating(true);
    setEvaluationData(null);
    try {
      const otherAsset = assets.find(a => a.id !== target.id) || target;
      const result = await runABEvaluation(target, otherAsset);
      setEvaluationData(result);
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  const nodeAssets = selectedNode 
    ? assets.filter(a => a.generatedBy === selectedNode.id)
    : [];

  if (!selectedNode && assets.length === 0) {
    return (
      <aside className="w-80 border-l border-[rgba(255,255,255,0.08)] bg-[#1A1D23] flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-[#5F6368] text-sm mb-1">No Selection</div>
          <p className="text-[10px] text-[#5F6368] uppercase tracking-widest">Awaiting node telemetry</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-[rgba(255,255,255,0.08)] bg-[#1A1D23] flex flex-col z-40 overflow-hidden">
      
      {/* Header & Main Tabs */}
      <div className="flex flex-col border-b border-[rgba(255,255,255,0.08)] shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[10px] font-mono text-[#5F6368] uppercase tracking-widest">Inspector Control</span>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-[#5F6368] hover:text-[#E8EAED]">
            <X size={14} />
          </button>
        </div>
        <div className="flex px-2 pb-1 gap-1">
          <button 
            onClick={() => { setActiveTab('content'); setAbTestTarget(null); }}
            className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-tighter rounded transition-all ${activeTab === 'content' ? 'bg-white/5 text-[#E8EAED]' : 'text-[#5F6368] hover:text-[#9AA0A6]'}`}
          >
            Assets
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-tighter rounded transition-all ${activeTab === 'data' ? 'bg-white/5 text-[#E8EAED]' : 'text-[#5F6368] hover:text-[#9AA0A6]'}`}
          >
            Telemetry
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        
        {activeTab === 'data' && selectedNode && (
          <div className="p-4 space-y-6">
            {/* Sub-Tabs for Deep Inspection */}
            <div className="flex border-b border-white/5 mb-6">
              {[
                { id: 'preview', icon: Eye, label: 'Trace' },
                { id: 'forensics', icon: Info, label: 'Stats' },
                { id: 'source', icon: Code, label: 'JSON' },
                { id: 'actions', icon: Zap, label: 'Cmds' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInspectTab(tab.id as InspectTab)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[8px] font-bold uppercase tracking-widest border-b-2 transition-all ${
                    inspectTab === tab.id 
                      ? 'border-[#4285F4] text-[#4285F4] bg-[#4285F4]/5' 
                      : 'border-transparent text-[#5F6368] hover:text-[#9AA0A6]'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>

            {inspectTab === 'preview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <div className="text-[9px] text-[#5F6368] uppercase font-mono mb-2">Node Identity</div>
                  <div className="p-3 bg-white/3 rounded-lg border border-white/5">
                     <div className="text-xs font-mono text-[#E8EAED]">{selectedNode.id}</div>
                     <div className="text-[10px] text-[#9AA0A6] mt-1 italic">Authorized Interaction</div>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-[#5F6368] uppercase font-mono mb-2">Neural Progress</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-[#9AA0A6]">
                      <span>COMPLETION</span>
                      <span>{selectedNode.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedNode.progress}%` }}
                        className="h-full bg-[#00E5FF]"
                       />
                    </div>
                  </div>
                </div>

                {selectedNode.output && (
                  <div>
                    <div className="text-[9px] text-[#5F6368] uppercase font-mono mb-2">Thinking Trace</div>
                    <div className="p-3 bg-black/40 rounded-lg font-mono text-[9px] text-[#34A853] leading-relaxed max-h-40 overflow-auto border border-[#34A853]/20">
                      {selectedNode.output}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {inspectTab === 'forensics' && (
              <div className="space-y-6">
                 <div className="p-4 rounded-xl bg-[#4285F4]/5 border border-[#4285F4]/20 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] text-[#5F6368] uppercase font-bold">Inference Integrity</span>
                       <span className="text-xs font-mono text-[#34A853]">98.1%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-[#34A853]" style={{ width: '98.1%' }} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <ForensicItem icon={Clock} label="Processed Time" value="0.84s" />
                    <ForensicItem icon={Database} label="Vector Recall" value="12 Pointers" />
                    <ForensicItem icon={Hash} label="Generated Tokens" value="240 t/s" />
                 </div>
              </div>
            )}

            {inspectTab === 'source' && (
               <div className="bg-black/90 rounded-xl p-4 font-mono text-[9px] text-[#34A853]/80 border border-white/5 overflow-auto max-h-96">
                  <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
               </div>
            )}

            {inspectTab === 'actions' && (
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 space-y-3">
                    <div className="flex items-center gap-2 text-[#00E5FF]">
                       <Zap size={14} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Neural Override</span>
                    </div>
                    <textarea 
                      value={interventionPrompt}
                      onChange={(e) => setInterventionPrompt(e.target.value)}
                      placeholder="Enter corrective feedback for this node..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-[10px] font-mono text-[#E8EAED] placeholder:text-[#5F6368] focus:border-[#00E5FF]/50 outline-none transition-all resize-none h-24"
                    />
                    <button 
                      disabled={!interventionPrompt || isIntervening}
                      onClick={async () => {
                         if (!selectedNode) return;
                         setIsIntervening(true);
                         try {
                           await onRegenerateNode?.(selectedNode.id, interventionPrompt);
                           setInterventionPrompt('');
                         } finally {
                           setIsIntervening(false);
                         }
                      }}
                      className="w-full py-2 bg-[#00E5FF] hover:bg-[#00D0E8] disabled:opacity-50 disabled:hover:bg-[#00E5FF] text-black text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isIntervening ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      Trigger Partial Sync
                    </button>
                 </div>

                 <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-[#4285F4]/50 transition-all group">
                       <div className="flex items-center gap-3">
                          <RefreshCw size={12} className="text-[#4285F4]" />
                          <div className="text-left">
                             <div className="text-[9px] font-bold text-[#E8EAED]">RE-INDEX CACHE</div>
                          </div>
                       </div>
                       <ChevronRight size={12} className="text-[#5F6368] group-hover:text-[#4285F4]" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl bg-[#EA4335]/5 border border-[#EA4335]/10 hover:border-[#EA4335]/40 transition-all group">
                       <div className="flex items-center gap-3">
                          <XCircle size={12} className="text-[#EA4335]" />
                          <div className="text-left">
                             <div className="text-[9px] font-bold text-[#EA4335]">TERMINATE</div>
                          </div>
                       </div>
                       <ChevronRight size={12} className="text-[#5F6368] group-hover:text-[#EA4335]" />
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="p-4 space-y-4">
             {abTestTarget ? (
               <div className="space-y-4">
                 <button 
                  onClick={() => setAbTestTarget(null)}
                  className="text-[10px] text-[#5F6368] hover:text-[#E8EAED] flex items-center gap-1"
                 >
                   <X size={10} /> Back to Assets
                 </button>
                 <ABTestResults 
                  assetA={abTestTarget} 
                  assetB={assets.find(a => a.id !== abTestTarget.id) || abTestTarget} 
                  data={evaluationData}
                  loading={evaluating}
                 />
               </div>
             ) : (
               (selectedNode ? nodeAssets : assets).map(asset => (
                 <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onStartAB={() => startTest(asset)} 
                  onView={() => onOpenAsset?.(asset)}
                 />
               ))
             )}
          </div>
        )}
      </div>
    </aside>
  );
}

function AssetCard({ asset, onStartAB, onView }: { asset: GeneratedAsset, onStartAB: () => void, onView: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="p-3 rounded-lg bg-[#22262E] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start gap-2 mb-2">
        <div className="p-1.5 rounded bg-white/5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] text-[#5F6368] font-mono uppercase">{asset.generatedBy}</div>
          <div className="text-xs text-[#E8EAED] font-medium truncate">{asset.title}</div>
        </div>
      </div>

      <p className="text-[10px] text-[#9AA0A6] line-clamp-2 mb-3">
        {hasImage ? asset.imageData!.prompt : asset.content.slice(0, 100)}...
      </p>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] bg-white/5 hover:bg-white/10 rounded font-bold text-[#E8EAED] transition-all"
        >
          <Eye size={10} /> VIEW
        </button>
        <button 
          onClick={onStartAB}
          className="px-2 py-1.5 bg-[#34A853]/20 hover:bg-[#34A853]/30 rounded text-[#34A853] transition-all flex items-center justify-center"
          title="A/B Test"
        >
          <BarChart2 size={10} />
        </button>
        <button 
          onClick={handleCopy}
          className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[#9AA0A6] transition-all flex items-center justify-center"
        >
          {copied ? <Check size={10} className="text-[#34A853]" /> : <Copy size={10} />}
        </button>
      </div>
    </div>
  );
}

function ForensicItem({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-white/5">
       <div className="flex items-center gap-2">
          <Icon size={12} className="text-[#5F6368]" />
          <span className="text-[9px] text-[#9AA0A6] uppercase">{label}</span>
       </div>
       <span className="text-[9px] font-mono text-[#E8EAED]">{value}</span>
    </div>
  );
}
