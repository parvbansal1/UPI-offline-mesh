import React from 'react';
import {
  LayoutDashboard, Send, History, Wifi, WifiOff,
  ChevronRight, Zap, Shield, Cpu, Activity, Info, RotateCcw
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'send',      label: 'Send Payment', icon: Send },
  { id: 'history',   label: 'Transactions', icon: History },
];

export default function Sidebar({ active, onNavigate, backendOnline, nodeCount, onReset }) {
  return (
    <aside className="w-64 h-full flex flex-col bg-[#0b0d15] relative overflow-hidden border-r border-white/[0.03]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-20px] w-48 h-48 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Logo Section */}
      <div className="px-6 py-8 relative">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)] transform hover:rotate-6 transition-transform duration-300 group">
            <Zap className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              UPI <span className="text-brand-400">Mesh</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex h-1.5 w-1.5 rounded-full shadow-[0_0_8px] transition-colors duration-500
                ${backendOnline ? 'bg-emerald-500 shadow-emerald-500/80' : 'bg-rose-500 shadow-rose-500/80 animate-pulse'}`} />
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500
                ${backendOnline ? 'text-white/40' : 'text-rose-400/80'}`}>
                {backendOnline ? 'Core Linked' : 'Core Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 px-4 mb-5">Main Menu</p>
        
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-semibold transition-all duration-300
                ${isActive 
                  ? 'text-white bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]' 
                  : 'text-white/60 hover:text-white/90 hover:bg-white/[0.03]'}`}
            >
              {isActive && (
                <div className="absolute left-[-4px] w-1.5 h-6 bg-brand-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
              )}
              <Icon className={`w-5 h-5 transition-all duration-300 
                ${isActive ? 'text-brand-400 scale-110' : 'text-white/30 group-hover:text-brand-400/70 group-hover:scale-105'}`} 
              />
              <span className="flex-1 text-left">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-white/20" />}
            </button>
          );
        })}

        {/* System Action Section */}
        <div className="mt-10 px-4 pt-6 border-t border-white/[0.03]">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-4">System Identity</p>
          <button
            onClick={() => {
              if (window.confirm('Reset full ledger, transaction volume, and account balances to zero?')) {
                onReset();
              }
            }}
            className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold 
                       text-rose-400/70 hover:text-rose-400 bg-rose-500/[0.03] hover:bg-rose-500/10 
                       border border-rose-500/10 hover:border-rose-500/20 transition-all duration-300"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <span>Zero Ledger & Volume</span>
          </button>
        </div>
      </nav>

      {/* Bottom Status Widgets */}
      <div className="p-4 space-y-3 relative z-10">
        <div className="glass-card p-4 overflow-hidden relative group border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${backendOnline ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <Activity className={`w-4 h-4 ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Network</span>
            </div>
            {backendOnline && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-bold font-mono uppercase">99.9%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/30 font-medium">Nodes Detected</span>
              <span className="text-white/80 font-bold font-mono">{backendOnline ? `${nodeCount} Active` : 'Disconnected'}</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${backendOnline ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 w-[85%]' : 'bg-rose-500/30 w-[10%]'}`} 
              />
            </div>
          </div>
        </div>

        {/* Global Connection Toggle */}
        <div className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border text-[11px] font-bold transition-all duration-500
          ${backendOnline
            ? 'bg-brand-500/[0.03] border-brand-500/20 text-brand-400 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.2)]'
            : 'bg-rose-500/[0.03] border-rose-500/20 text-rose-400'}`}>
          <div className="flex items-center gap-3">
            {backendOnline 
              ? <Wifi className="w-4 h-4 animate-pulse-slow" /> 
              : <WifiOff className="w-4 h-4" />}
            <span className="tracking-[0.1em] uppercase">
              {backendOnline ? 'Cloud Synced' : 'Offline Mode'}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-brand-400 animate-pulse' : 'bg-rose-400'}`} />
        </div>
      </div>
    </aside>
  );
}
