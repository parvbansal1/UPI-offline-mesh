import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800/95 border border-white/10 rounded-xl px-3 py-2.5 shadow-card backdrop-blur">
        <p className="text-[10px] text-white/40 mb-1">{label}</p>
        <p className="text-sm font-bold text-brand-300">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function ActivityChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + (d.tps || 0), 0);
  const peak  = Math.max(...data.map(d => d.tps || 0));

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
            <Activity className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Transaction Volume</h3>
            <p className="text-xs text-white/40">Live activity monitor</p>
          </div>
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Session Total</p>
            <p className="text-sm font-bold text-white">₹{total.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider">Peak</p>
            <p className="text-sm font-bold text-brand-300">₹{peak.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="tps"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#grad)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1', stroke: '#0d0f1a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
