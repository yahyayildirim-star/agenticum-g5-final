import type { NodeState } from '../lib/types';
import { BrainCircuit, Search, Video, Zap, Palette, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeGridProps {
  nodes: Record<string, NodeState>;
}

const NODE_CONFIG = {
  'SN-00': { name: 'Orchestrator', icon: BrainCircuit, description: 'Thinking Mode Analysis', capability: 'Deep Reasoning' },
  'SP-01': { name: 'Strategist', icon: Search, description: 'Market Intelligence', capability: 'Search Grounding' },
  'RA-01': { name: 'Auditor', icon: Zap, description: 'Competitive Analysis', capability: 'Search Grounding' },
  'CC-06': { name: 'Video Director', icon: Video, description: 'Veo Prompt Generation', capability: 'Multimodal' },
  'DA-03': { name: 'Design Architect', icon: Palette, description: 'Visual Identity', capability: 'Creative AI' },
};

export function NodeGrid({ nodes }: NodeGridProps) {
  const sn00 = nodes['SN-00'] || { id: 'SN-00', status: 'idle', progress: 0 };
  const agents = ['SP-01', 'RA-01', 'CC-06', 'DA-03'].map(id => 
    nodes[id] || { id, status: 'idle', progress: 0 }
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {/* ORCHESTRATOR - Central Node */}
      <div className="flex-shrink-0">
        <OrchestratorCard node={sn00} />
      </div>

      {/* AGENT NODES */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {agents.map((node) => (
          <AgentCard key={node.id} node={node} config={NODE_CONFIG[node.id as keyof typeof NODE_CONFIG]} />
        ))}
      </div>
    </div>
  );
}

function OrchestratorCard({ node }: { node: NodeState }) {
  const isRunning = node.status === 'running';
  const isCompleted = node.status === 'completed';
  const isError = node.status === 'error';

  return (
    <motion.div 
      layout
      className={`relative p-6 rounded-xl border transition-all duration-500 ${
        isRunning ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_40px_rgba(0,240,255,0.15)]' :
        isCompleted ? 'border-green-500/50 bg-green-500/5' :
        isError ? 'border-red-500/50 bg-red-500/5' :
        'border-gray-800 bg-gray-900/30'
      }`}
    >
      {/* Animated border on running */}
      {isRunning && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl animate-pulse" />
        </div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
          isRunning ? 'bg-cyan-500/20 text-cyan-400' :
          isCompleted ? 'bg-green-500/20 text-green-400' :
          isError ? 'bg-red-500/20 text-red-400' :
          'bg-gray-800 text-gray-400'
        }`}>
          <BrainCircuit size={32} />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">SN-00</span>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${
              isRunning ? 'text-cyan-400' :
              isCompleted ? 'text-green-400' :
              isError ? 'text-red-400' :
              'text-gray-500'
            }`}>
              {node.status}
            </span>
          </div>
          <h3 className="font-orbitron text-lg font-bold text-white">ORCHESTRATOR</h3>
          <p className="text-xs text-gray-400 mt-0.5">Central Intelligence • Thinking Mode</p>
        </div>

        {/* Progress Circle */}
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="24" className="stroke-gray-800" strokeWidth="3" fill="none" />
            <motion.circle 
              cx="28" 
              cy="28" 
              r="24" 
              className={isCompleted ? 'stroke-green-400' : 'stroke-cyan-400'}
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 150' }}
              animate={{ strokeDasharray: `${node.progress * 1.5} 150` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs font-bold">{node.progress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AgentCard({ node, config }: { node: NodeState; config: typeof NODE_CONFIG['SN-00'] }) {
  const isRunning = node.status === 'running';
  const isCompleted = node.status === 'completed';
  const isError = node.status === 'error';
  const Icon = config?.icon || Shield;

  return (
    <motion.div 
      layout
      className={`relative p-4 rounded-lg border transition-all duration-500 ${
        isRunning ? 'border-cyan-500/50 bg-cyan-500/5' :
        isCompleted ? 'border-green-500/50 bg-green-500/5' :
        isError ? 'border-red-500/50 bg-red-500/5' :
        'border-gray-800 bg-gray-900/30 hover:border-gray-700'
      }`}
    >
      {/* Status LED */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
        isRunning ? 'bg-cyan-400 animate-pulse' :
        isCompleted ? 'bg-green-400' :
        isError ? 'bg-red-400' :
        'bg-gray-600'
      }`} />

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
        isRunning ? 'bg-cyan-500/20 text-cyan-400' :
        isCompleted ? 'bg-green-500/20 text-green-400' :
        isError ? 'bg-red-500/20 text-red-400' :
        'bg-gray-800 text-gray-400'
      }`}>
        <Icon size={20} />
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[10px] text-cyan-400">{node.id}</span>
      </div>
      <h4 className="font-orbitron text-sm font-bold text-white mb-0.5">{config?.name || 'Agent'}</h4>
      <p className="text-[10px] text-gray-500 mb-3">{config?.description || ''}</p>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${isCompleted ? 'bg-green-400' : 'bg-cyan-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${node.progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Capability Badge */}
      <div className="mt-3">
        <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full ${
          isCompleted ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-400'
        }`}>
          ✦ {config?.capability || 'AI'}
        </span>
      </div>
    </motion.div>
  );
}
