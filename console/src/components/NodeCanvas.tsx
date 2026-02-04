import type { NodeState } from '../lib/types';
import { BrainCircuit, Search, Video, Zap, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeCanvasProps {
  nodes: Record<string, NodeState>;
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
  isRunning: boolean;
}

const NODE_CONFIG: Record<string, { 
  name: string; 
  icon: typeof BrainCircuit; 
  description: string;
  capability: string;
  color: string;
}> = {
  'SN-00': { 
    name: 'Orchestrator', 
    icon: BrainCircuit, 
    description: 'Central AI Controller',
    capability: 'Thinking Mode',
    color: '#A855F7'
  },
  'SP-01': { 
    name: 'Strategist', 
    icon: Search, 
    description: 'Campaign Strategy',
    capability: 'Search Grounding',
    color: '#4285F4'
  },
  'RA-01': { 
    name: 'Auditor', 
    icon: Zap, 
    description: 'Competitive Analysis',
    capability: 'Search Grounding',
    color: '#FBBC04'
  },
  'CC-06': { 
    name: 'Video Director', 
    icon: Video, 
    description: 'Video Concepts',
    capability: 'Multimodal',
    color: '#EA4335'
  },
  'DA-03': { 
    name: 'Design Architect', 
    icon: Palette, 
    description: 'Visual Identity',
    capability: 'Creative AI',
    color: '#34A853'
  },
};

const DEFAULT_CONFIG = {
  name: 'Agent',
  icon: BrainCircuit,
  description: 'AI Agent',
  capability: 'AI',
  color: '#5F6368'
};

export function NodeCanvas({ nodes, selectedNode, onSelectNode, isRunning }: NodeCanvasProps) {
  const sn00 = nodes['SN-00'] || { id: 'SN-00', status: 'idle', progress: 0 };
  const agents = ['SP-01', 'RA-01', 'CC-06', 'DA-03'].map(id => 
    nodes[id] || { id, status: 'idle', progress: 0 }
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Orchestrator Card */}
        <OrchestratorCard 
          node={sn00} 
          config={NODE_CONFIG['SN-00'] || DEFAULT_CONFIG}
          isSelected={selectedNode === 'SN-00'}
          onClick={() => onSelectNode('SN-00')}
        />

        {/* Connection Line */}
        <div className="flex justify-center">
          <div className={`w-0.5 h-8 ${isRunning ? 'bg-gradient-to-b from-[#A855F7] to-[#4285F4]' : 'bg-[rgba(255,255,255,0.1)]'}`} />
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents.map(node => (
            <AgentCard 
              key={node.id}
              node={node}
              config={NODE_CONFIG[node.id] || DEFAULT_CONFIG}
              isSelected={selectedNode === node.id}
              onClick={() => onSelectNode(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrchestratorCard({ 
  node, 
  config,
  isSelected,
  onClick 
}: { 
  node: NodeState; 
  config: typeof NODE_CONFIG['SN-00'];
  isSelected: boolean;
  onClick: () => void;
}) {
  const isRunning = node.status === 'running';
  const isCompleted = node.status === 'completed';
  const Icon = config?.icon || BrainCircuit;

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-[#A855F7] bg-[#A855F7]/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
          : isRunning 
            ? 'border-[#00E5FF]/50 bg-[#00E5FF]/5' 
            : isCompleted 
              ? 'border-[#34A853]/50 bg-[#34A853]/5' 
              : 'border-[rgba(255,255,255,0.08)] bg-[#1A1D23] hover:border-[rgba(255,255,255,0.15)]'
      }`}
    >
      {/* Running Animation */}
      {isRunning && (
        <div className="absolute inset-0 rounded-xl border-2 border-[#00E5FF]/30 animate-pulse" />
      )}

      <div className="flex items-center gap-5">
        {/* Icon */}
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={28} style={{ color: config.color }} />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
              {node.id}
            </span>
            <span className={`text-[10px] font-mono uppercase ${
              isRunning ? 'text-[#00E5FF]' : isCompleted ? 'text-[#34A853]' : 'text-[#5F6368]'
            }`}>
              {node.status}
            </span>
          </div>
          <h3 className="text-lg font-display text-[#E8EAED]">{config.name}</h3>
          <p className="text-xs text-[#9AA0A6] mt-0.5">{config.description}</p>
        </div>

        {/* Progress Ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90">
            <circle 
              cx="32" cy="32" r="28" 
              className="fill-none stroke-[rgba(255,255,255,0.1)]" 
              strokeWidth="4"
            />
            <motion.circle 
              cx="32" cy="32" r="28"
              className="fill-none"
              stroke={isCompleted ? '#34A853' : config.color}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 176' }}
              animate={{ strokeDasharray: `${node.progress * 1.76} 176` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-mono font-medium">{node.progress}%</span>
          </div>
        </div>
      </div>

      {/* Capability Badge */}
      <div className="mt-4 flex gap-2">
        <span className="text-[10px] px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-[#9AA0A6]">
          ✦ {config.capability}
        </span>
      </div>
    </motion.div>
  );
}

function AgentCard({ 
  node, 
  config,
  isSelected,
  onClick
}: { 
  node: NodeState; 
  config: typeof NODE_CONFIG['SN-00'];
  isSelected: boolean;
  onClick: () => void;
}) {
  const isRunning = node.status === 'running';
  const isCompleted = node.status === 'completed';
  const Icon = config?.icon || Palette;

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? `border-[${config.color}] bg-[${config.color}]/10` 
          : isRunning 
            ? 'border-[#00E5FF]/50 bg-[#00E5FF]/5' 
            : isCompleted 
              ? 'border-[#34A853]/50 bg-[#34A853]/5' 
              : 'border-[rgba(255,255,255,0.08)] bg-[#1A1D23] hover:border-[rgba(255,255,255,0.15)]'
      }`}
      style={isSelected ? { borderColor: config.color, backgroundColor: `${config.color}10` } : {}}
    >
      {/* Status Dot */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
        isRunning ? 'bg-[#00E5FF] animate-pulse' : isCompleted ? 'bg-[#34A853]' : 'bg-[#5F6368]'
      }`} />

      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon size={18} style={{ color: config.color }} />
      </div>

      {/* Info */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-mono" style={{ color: config.color }}>{node.id}</span>
      </div>
      <h4 className="text-sm font-medium text-[#E8EAED]">{config.name}</h4>

      {/* Progress Bar */}
      <div className="mt-3 h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isCompleted ? '#34A853' : config.color }}
          initial={{ width: 0 }}
          animate={{ width: `${node.progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Capability */}
      <div className="mt-2">
        <span className={`text-[9px] ${isCompleted ? 'text-[#34A853]' : 'text-[#5F6368]'}`}>
          ✦ {config.capability}
        </span>
      </div>
    </motion.div>
  );
}
