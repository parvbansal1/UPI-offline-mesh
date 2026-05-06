import React from 'react';
import { Send, RefreshCw, Radio, CheckCircle, Lock, ChevronRight, RotateCcw } from 'lucide-react';
import { Spinner, StatusBadge } from './ui';

const STEPS = [
  {
    id: 0,
    key: 'idle',
    icon: Send,
    label: 'Step 1 — Inject into Mesh',
    desc: 'Encrypt payment & hand to sender\'s phone in the mesh',
    btnLabel: 'Inject Payment',
    btnIcon: Send,
    color: 'brand',
  },
  {
    id: 1,
    key: 'injected',
    icon: RefreshCw,
    label: 'Step 2 — Run Gossip Round',
    desc: 'Broadcast packet device-to-device (Bluetooth simulation)',
    btnLabel: 'Run Gossip Round',
    btnIcon: RefreshCw,
    color: 'purple',
  },
  {
    id: 2,
    key: 'gossiped',
    icon: Radio,
    label: 'Step 3 — Bridge Uploads',
    desc: 'Bridge walks outside, gets 4G, POSTs to backend',
    btnLabel: 'Bridge Upload to Backend',
    btnIcon: Radio,
    color: 'amber',
  },
  {
    id: 3,
    key: 'done',
    icon: CheckCircle,
    label: 'Step 4 — Settled',
    desc: 'Payment decrypted, verified, and written to ledger',
    btnLabel: null,
    color: 'emerald',
  },
];

const COLOR = {
  brand:   { ring: 'ring-brand-500/40',   bg: 'bg-brand-500/15',   border: 'border-brand-500/30',   text: 'text-brand-300',   btn: 'bg-brand-600/20 border-brand-500 text-brand-300 hover:bg-brand-600/35 shadow-[0_0_14px_rgba(99,102,241,0.4)]' },
  purple:  { ring: 'ring-purple-500/40',  bg: 'bg-purple-500/15',  border: 'border-purple-500/30',  text: 'text-purple-300',  btn: 'bg-purple-600/20 border-purple-500 text-purple-300 hover:bg-purple-600/35 shadow-[0_0_14px_rgba(139,92,246,0.4)]' },
  amber:   { ring: 'ring-amber-500/40',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   text: 'text-amber-300',   btn: 'bg-amber-600/20 border-amber-500 text-amber-300 hover:bg-amber-600/35 shadow-[0_0_14px_rgba(245,158,11,0.4)]' },
  emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', btn: '' },
};

export default function MeshFlowPanel({
  step,           // 0=idle,1=injected,2=gossiped,3=done
  gossipCount,
  flushResults,
  loading,
  onInject,
  onGossip,
  onFlush,
  onReset,
  packetId,
}) {
  return (
    <div className="glass-card p-6 animate-slide-up border-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight">Manual Transaction Flow</h3>
          <p className="text-xs text-white/40 mt-1">Drive the full offline-mesh pipeline step by step</p>
        </div>
        {step > 0 && (
          <button onClick={onReset} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <RotateCcw className="w-3 h-3" /> Reset Flow
          </button>
        )}
      </div>

      {/* Step track */}
      <div className="flex items-start gap-0 mb-8 px-2">
        {STEPS.map((s, i) => {
          const done    = step > s.id;
          const active  = step === s.id;
          const locked  = step < s.id;
          const c       = COLOR[s.color];
          const Icon    = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                  ${done   ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : active ? `${c.bg} ${c.border} ring-4 ${c.ring} scale-110 z-10`
                  :          'bg-white/[0.02] border-white/[0.05]'}`}>
                  {done
                    ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                    : locked
                    ? <Lock className="w-4 h-4 text-white/10" />
                    : <Icon className={`w-5 h-5 ${c.text} ${active && s.id === 1 && loading ? 'animate-spin' : ''}`} />}
                </div>
                <p className={`text-[9px] font-bold mt-3 text-center uppercase tracking-[0.15em] transition-all duration-500
                  ${done ? 'text-emerald-400 opacity-80' : active ? c.text : 'text-white/15'}`}>
                  {s.id === 1 && gossipCount > 0 ? `Gossip Round ${gossipCount}` : s.label.split('—')[0]}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mt-5.5 px-1 relative">
                  <div className="h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-emerald-500 to-brand-500 transition-all duration-1000 ease-out
                      ${step > i ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Step Card */}
      {step < 3 && (() => {
        const s = STEPS[step];
        const c = COLOR[s.color];
        const Icon = s.icon;
        return (
          <div className={`rounded-2xl border p-5 mb-6 ${c.bg} ${c.border} animate-fade-in relative overflow-hidden group`}>
            {/* Subtle glow background */}
            <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/[0.01] to-transparent group-hover:rotate-12 transition-transform duration-1000`} />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className={`w-5 h-5 ${c.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${c.text} tracking-tight`}>{s.label}</p>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{s.desc}</p>
                
                {step === 1 && gossipCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(gossipCount, 4))].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-[#1a1c2e] bg-purple-500 flex items-center justify-center scale-90">
                          <Radio className="w-2.5 h-2.5 text-white" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                      {gossipCount} hops propagated
                    </p>
                  </div>
                )}
                
                {step === 1 && packetId && (
                  <div className="mt-3 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-black/20 border border-white/5">
                    <span className="text-[9px] text-white/30 font-mono">PKT_{packetId.slice(0, 12)}...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {step === 0 && (
          <button
            onClick={onInject}
            disabled={loading}
            className={`group flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-sm
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
              bg-brand-600/10 border-brand-500/40 text-brand-400 hover:bg-brand-600/20 hover:border-brand-500 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.4)]`}
          >
            {loading ? <Spinner size="sm" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            Inject into Mesh
          </button>
        )}

        {step === 1 && (
          <>
            <button
              onClick={onGossip}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-sm
                transition-all duration-300 disabled:opacity-50
                bg-purple-600/10 border-purple-500/40 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.4)]`}
            >
              {loading ? <Spinner size="sm" /> : <RefreshCw className={`w-4 h-4 ${gossipCount > 0 ? 'animate-spin-slow' : ''}`} />}
              Run Gossip Round {gossipCount > 0 && `(x${gossipCount + 1})`}
            </button>
            <button
              onClick={onFlush}
              disabled={loading || gossipCount === 0}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-sm
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                bg-amber-600/10 border-amber-500/40 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)]`}
            >
              <Radio className="w-4 h-4" />
              Upload
            </button>
          </>
        )}

        {step === 2 && (
          <button
            onClick={onFlush}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-sm
              transition-all duration-300 disabled:opacity-50
              bg-amber-600/10 border-amber-500/40 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)]`}
          >
            {loading ? <Spinner size="sm" /> : <Radio className="w-4 h-4 animate-pulse" />}
            Initiate Bridge Upload
          </button>
        )}
      </div>

      {/* Results */}
      {flushResults && flushResults.length > 0 && (
        <div className="mt-6 space-y-2.5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-[1px] flex-1 bg-white/[0.05]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 whitespace-nowrap">Mesh Upload Results</p>
            <span className="h-[1px] flex-1 bg-white/[0.05]" />
          </div>
          {flushResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-brand-500 transition-colors" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-white/50">{r.bridgeNode}</span>
                  <ChevronRight className="w-3 h-3 text-white/10" />
                  <span className="text-[11px] font-mono text-white/30">PKT_{r.packetId}</span>
                </div>
              </div>
              <StatusBadge status={r.outcome} />
            </div>
          ))}
        </div>
      )}

      {/* Done state */}
      {step === 3 && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 animate-bounce-in relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-emerald-400 tracking-tight">Pipeline Settled Successfully</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">The mesh packet has been decrypted, validated, and recorded to the permanent distributed ledger.</p>
              <button 
                onClick={onReset} 
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all group/btn"
              >
                <RotateCcw className="w-3.5 h-3.5 group-hover/btn:rotate-[-45deg] transition-transform" />
                Start New Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
