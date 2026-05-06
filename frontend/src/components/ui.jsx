import React from 'react';
import { TrendingUp } from 'lucide-react';

// ── Toast Notification ──────────────────────────────────────────────────────
export function Toast({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-toast-in flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-card
            backdrop-blur-xl max-w-xs w-full
            ${t.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : t.type === 'error'   ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            : t.type === 'info'    ? 'bg-brand-500/15 border-brand-500/30 text-brand-300'
            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'}`}
        >
          <span className="text-lg leading-none mt-0.5">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'info' ? 'ℹ' : '⚠'}
          </span>
          <div>
            <p className="font-semibold text-sm">{t.title}</p>
            {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <svg className={`animate-spin-slow ${s} ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-90" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4 text-2xl text-white/30">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white/50 mb-1">{title}</h3>
      <p className="text-xs text-white/30 max-w-[200px]">{description}</p>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'brand', trend }) {
  const colours = {
    brand:   { bg: 'bg-brand-500/10',   icon: 'text-brand-500',   border: 'border-brand-500/20',   grad: 'from-brand-500/20 to-transparent' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', border: 'border-emerald-500/20', grad: 'from-emerald-500/20 to-transparent' },
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-500',   border: 'border-amber-500/20', grad: 'from-amber-500/20 to-transparent' },
    rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-500',    border: 'border-rose-500/20', grad: 'from-rose-500/20 to-transparent' },
  };
  const c = colours[color];
  return (
    <div className="glass-card-hover p-6 relative overflow-hidden group border-white/[0.03]">
      {/* Background Gradient Glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${c.grad} blur-3xl opacity-30 pointer-events-none group-hover:scale-150 transition-transform duration-700`} />
      
      <div className="flex items-start justify-between relative z-10 mb-5">
        <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center ${c.icon} shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-40">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
          {color === 'brand' && <span className="text-[10px] font-mono text-brand-500/60 font-bold uppercase">Volume</span>}
        </div>
        {sub && <p className="text-[11px] text-white/30 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-500',
                  'from-rose-500 to-pink-600', 'from-indigo-500 to-blue-600'];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  const s = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm';
  return (
    <div className={`${s} rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    SETTLED:          { cls: 'badge-success', dot: 'bg-emerald-400', label: 'Settled' },
    SUCCESS:          { cls: 'badge-success', dot: 'bg-emerald-400', label: 'Success' },
    PENDING:          { cls: 'badge-pending', dot: 'bg-amber-400',   label: 'Pending' },
    ACCEPTED:         { cls: 'badge-info',    dot: 'bg-brand-400',   label: 'Processing' },
    REJECTED:         { cls: 'badge-failed',  dot: 'bg-rose-400',    label: 'Rejected' },
    FAILED:           { cls: 'badge-failed',  dot: 'bg-rose-400',    label: 'Failed' },
    DUPLICATE_DROPPED:{ cls: 'badge-pending', dot: 'bg-amber-400',   label: 'Duplicate' },
    INVALID:          { cls: 'badge-failed',  dot: 'bg-rose-400',    label: 'Invalid' },
  };
  const cfg = map[status] || { cls: 'badge-info', dot: 'bg-brand-400', label: status };
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
