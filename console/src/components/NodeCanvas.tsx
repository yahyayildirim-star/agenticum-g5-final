import type { NodeState } from '../lib/types';
import { BrainCircuit, Search, Video, Zap, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function NeuralRipple({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0 rounded-xl pointer-events-none border-2"
      style={{ borderColor: color }}
    />
  );
}

export function NodeCanvas({ nodes, selectedNode, onSelectNode, isRunning }: NodeCanvasProps) {
  const sn00 = nodes['SN-00'] || { id: 'SN-00', status: 'idle', progress: 0 };
  const agents = ['SP-01', 'RA-01', 'CC-06', 'DA-03'].map(id => 
    nodes[id] || { id, status: 'idle', progress: 0 }
  );

  return (
    <div className="flex-1 p-6 overflow-hidden relative bg-transparent">
      {/* ─── Living Mesh Background ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,133,244,0.1),transparent_70%)]" />
        <motion.div 
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Orchestrator Card */}
        <OrchestratorCard 
          node={sn00} 
          config={NODE_CONFIG['SN-00'] || DEFAULT_CONFIG}
          isSelected={selectedNode === 'SN-00'}
          onClick={() => onSelectNode('SN-00')}
        />

        {/* ─── Dynamic Visual Connections ─── */}
        <div className="relative h-20 -my-4 flex justify-center">
          <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
            <defs>
              <linearGradient id="connGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4285F4" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Dynamic Connecting Paths */}
            {agents.map((_node, i) => {
              // SVG paths require numeric values, not percentages
              // Using viewBox coordinates (0-100 range)
              const xStart = 50;
              const xEnd = 12.5 + i * 25;
              return (
                <g key={`path-${i}`}>
                   <motion.path
                    d={`M ${xStart} 0 Q ${xStart} 40, ${xEnd} 80`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  {isRunning && (
                    <motion.path
                      d={`M ${xStart} 0 Q ${xStart} 40, ${xEnd} 80`}
                      stroke="url(#connGradient)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      filter="url(#glow)"
                    />
                  )}
                </g>
              );
            })}
          </svg>
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
  const isAwaiting = node.status === 'awaiting_approval';
  const Icon = config?.icon || BrainCircuit;

  const getStatusColor = () => {
    if (isAwaiting) return '#FFD700';
    if (isRunning) return '#00E5FF';
    if (isCompleted) return '#34A853';
    return config.color;
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-[#1A1D23] shadow-[0_0_40px_rgba(168,85,247,0.15)]' 
          : 'bg-[#1A1D23]/80 backdrop-blur-md'
      }`}
      style={{ 
        borderColor: isSelected ? statusColor : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 20px ${statusColor}20` : 'none'
      }}
    >
      {/* Cinematic Glitch/Glow Layer */}
      <AnimatePresence>
        {isCompleted && (
          <NeuralRipple color={statusColor} />
        )}
      </AnimatePresence>
      
      {isRunning && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: `2px solid ${statusColor}40` }}
        />
      )}

      {isAwaiting && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: `2px solid ${statusColor}60`, boxShadow: `inset 0 0 20px ${statusColor}30` }}
        />
      )}

      <div className="flex items-center gap-5">
        {/* Icon with Glow */}
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <Icon size={28} style={{ color: statusColor }} />
          {isRunning && (
            <motion.div 
              animate={{ x: [-100, 100] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
              {node.id}
            </span>
            <span className={`text-[9px] font-mono uppercase tracking-widest ${
              isRunning ? 'text-[#00E5FF]' : isCompleted ? 'text-[#34A853]' : isAwaiting ? 'text-[#FFD700]' : 'text-[#5F6368]'
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
              className="fill-none stroke-[rgba(255,255,255,0.05)]" 
              strokeWidth="3"
            />
            <motion.circle 
              cx="32" cy="32" r="28"
              className="fill-none"
              stroke={statusColor}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 176' }}
              animate={{ strokeDasharray: `${node.progress * 1.76} 176` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-mono font-medium" style={{ color: statusColor }}>{node.progress}%</span>
          </div>
        </div>
      </div>

      {/* Capability Grid */}
      <div className="mt-4 flex gap-2">
        <span className="text-[9px] px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[#9AA0A6] border border-[rgba(255,255,255,0.05)]">
          ✦ {config.capability}
        </span>
        {isRunning && (
            <span className="text-[9px] px-2 py-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] animate-pulse">
              SYNCING NEURAL PATHWAYS...
            </span>
        )}
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
  config: typeof NODE_CONFIG['SP-01'];
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
      whileHover={{ y: -2 }}
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-[#1A1D23] shadow-[0_0_30px_rgba(255,255,255,0.02)]' 
          : 'bg-[#1A1D23]/60'
      }`}
      style={{ 
        borderColor: isSelected ? config.color : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 15px ${config.color}20` : 'none'
      }}
    >
      {/* Hologram Overlay (Running) */}
      {isRunning && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-t from-transparent via-[#00E5FF]/5 to-transparent"
        />
      )}

      {/* Status Dot */}
      <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${
        isRunning ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : isCompleted ? 'bg-[#34A853]' : 'bg-[#5F6368]'
      }`} />

      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon size={18} style={{ color: config.color }} />
      </div>

      {/* Info */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[9px] font-mono tracking-tighter" style={{ color: config.color }}>{node.id}</span>
      </div>
      <h4 className="text-[13px] font-semibold text-[#E8EAED] tracking-tight">{config.name}</h4>

      {/* Progress Bar (Futuristic) */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="h-[2px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: isCompleted ? '#34A853' : config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${node.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between items-center text-[8px] font-mono text-[#5F6368]">
            <span>STABLE</span>
            <span>{node.progress}%</span>
        </div>
      </div>
    </motion.div>
  );
}
