import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Target } from 'lucide-react';

export interface ABEvaluationResult {
  winner: 'A' | 'B';
  metricsA: { ctr: number; engagement: number; conversion: number };
  metricsB: { ctr: number; engagement: number; conversion: number };
  confidence: number;
  roiLift: number;
}

interface ABTestProps {
  assetA: { title: string; type: string };
  assetB: { title: string; type: string };
  data: ABEvaluationResult | null;
  loading: boolean;
}

export function ABTestResults({ assetA, assetB, data, loading }: ABTestProps) {
  if (loading) {
    return (
      <div className="p-8 rounded-xl bg-black/40 border border-[#34A853]/20 mt-4 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#34A853]/30 border-t-[#34A853] rounded-full animate-spin" />
        <span className="text-[10px] text-[#34A853] font-mono animate-pulse">CONDUCTING ARTIFICIAL AUDIT...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 rounded-xl bg-black/40 border border-[#34A853]/20 mt-4">
      <div className="flex items-center gap-2 mb-6 text-[#34A853]">
        <BarChart2 size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">A/B Intelligence Report</span>
      </div>

      <div className="grid grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1A1D23] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#5F6368] z-10">VS</div>
        
        {/* Variant A */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#E8EAED]">VARIANT A</span>
            <span className="text-[10px] text-[#5F6368] truncate ml-2 opacity-50">{assetA.title}</span>
          </div>
          <div className="space-y-3">
             <MetricBar label="CTR" value={data.metricsA.ctr} color="#34A853" max={10} />
             <MetricBar label="Engagement" value={data.metricsA.engagement} color="#4285F4" max={100} />
             <MetricBar label="Conversion" value={data.metricsA.conversion} color="#FBBC04" max={5} />
          </div>
        </div>

        {/* Variant B */}
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-between flex-row-reverse">
            <span className={`text-[10px] font-bold ${data.winner === 'B' ? 'text-[#34A853]' : 'text-[#E8EAED]'}`}>
              VARIANT B {data.winner === 'B' && '(WINNER)'}
            </span>
            <span className="text-[10px] text-[#5F6368] truncate mr-2 opacity-50">{assetB.title}</span>
          </div>
          <div className="space-y-3">
             <MetricBar label="CTR" value={data.metricsB.ctr} color="#34A853" max={10} reverse />
             <MetricBar label="Engagement" value={data.metricsB.engagement} color="#4285F4" max={100} reverse />
             <MetricBar label="Conversion" value={data.metricsB.conversion} color="#FBBC04" max={5} reverse />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
        <StatItem icon={<Users size={12} />} label="Confidence" value={`${data.confidence}%`} />
        <StatItem icon={<Target size={12} />} label="Dominance" value={data.winner === 'A' ? 'VARIANT A' : 'VARIANT B'} />
        <StatItem icon={<TrendingUp size={12} />} label="ROI Lift" value={`+${data.roiLift}%`} />
      </div>
    </div>
  );
}

function MetricBar({ label, value, color, max, reverse = false }: { label: string, value: number, color: string, max: number, reverse?: boolean }) {
  const percentage = (value / max) * 100;
  return (
    <div className={`space-y-1 ${reverse ? 'flex flex-col items-end' : ''}`}>
      <div className="flex items-center justify-between w-full text-[9px] font-mono">
        {!reverse && <span className="text-[#5F6368]">{label}</span>}
        <span style={{ color }}>{value}{label === 'Engagement' || label === 'Confidence' ? '%' : ''}</span>
        {reverse && <span className="text-[#5F6368]">{label}</span>}
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[#5F6368]">{icon}</div>
      <div>
        <div className="text-[8px] text-[#5F6368] uppercase tracking-tighter">{label}</div>
        <div className="text-[10px] font-mono font-bold text-[#E8EAED]">{value}</div>
      </div>
    </div>
  );
}
