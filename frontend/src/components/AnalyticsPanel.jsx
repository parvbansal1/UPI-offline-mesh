import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function AnalyticsPanel({ data }) {
  return (
    <div className="w-full glass-card p-6">
      <h2 className="text-xl font-bold mb-4 neon-text-purple flex items-center gap-2">
        <Activity className="w-5 h-5 text-neonPurple" />
        System Load (TPS)
      </h2>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b026ff" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#b026ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 17, 26, 0.9)', border: '1px solid #b026ff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="tps" 
              stroke="#b026ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTps)" 
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-white/5 rounded-lg p-3 text-center border border-white/10">
          <p className="text-xs text-gray-400">Total Settled</p>
          <p className="text-xl font-bold text-neonGreen">1,492</p>
        </div>
        <div className="flex-1 bg-white/5 rounded-lg p-3 text-center border border-white/10">
          <p className="text-xs text-gray-400">Dup Rejected</p>
          <p className="text-xl font-bold text-yellow-500">34</p>
        </div>
      </div>
    </div>
  );
}
