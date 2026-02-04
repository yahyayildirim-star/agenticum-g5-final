import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface PerformanceMetricsProps {
  stats?: {
    reach: string;
    engagement: string;
    roi: string;
    spendOpt: string;
    reachChange: string;
    engagementChange: string;
    roiChange: string;
    spendChange: string;
  }
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  const metrics = [
    { label: 'Projected Reach', value: stats?.reach || '0', change: stats?.reachChange || '+0%', icon: Users, color: '#4285F4' },
    { label: 'Engagement Rate', value: stats?.engagement || '0%', change: stats?.engagementChange || '+0%', icon: Activity, color: '#34A853' },
    { label: 'Estimated ROI', value: stats?.roi || '0x', change: stats?.roiChange || '+0%', icon: TrendingUp, color: '#FBBC04' },
    { label: 'Ad Spend Opt.', value: stats?.spendOpt || '0%', change: stats?.spendChange || '+0%', icon: DollarSign, color: '#EA4335' },
  ];

  return (
    <div className="p-4 bg-[#14171C] border border-[rgba(255,255,255,0.08)] rounded-xl mt-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-[#00E5FF]" />
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#9AA0A6]">Predictive Performance</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 bg-[#1A1D23] border border-[rgba(255,255,255,0.04)] rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded bg-[rgba(255,255,255,0.03)] text-[#5F6368]">
                <m.icon size={12} style={{ color: m.color }} />
              </div>
              <span className={`text-[9px] font-mono ${m.change.startsWith('+') ? 'text-[#34A853]' : 'text-red-400'}`}>
                {m.change}
              </span>
            </div>
            <div className="text-lg font-display font-bold text-[#E8EAED]">{m.value}</div>
            <div className="text-[9px] text-[#5F6368] uppercase tracking-tight">{m.label}</div>
            
            {/* Mini Sparkline Simulation */}
            <div className="mt-3 h-6 flex items-end gap-0.5">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1.0].map((h, j) => (
                <motion.div 
                  key={j}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 100}%` }}
                  transition={{ delay: (i*0.1) + (j * 0.05), duration: 0.8 }}
                  className="flex-1 rounded-t-[1px]"
                  style={{ backgroundColor: `${m.color}40` }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
