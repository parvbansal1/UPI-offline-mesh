import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import { Avatar, EmptyState } from './ui';

function BalanceBar({ balance, maxBalance }) {
  const pct = maxBalance > 0 ? (balance / maxBalance) * 100 : 0;
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function AccountPanel({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="glass-card h-full flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <h3 className="font-bold text-white text-base">Account Balances</h3>
          <p className="text-xs text-white/40 mt-0.5">Live wallet snapshot</p>
        </div>
        <EmptyState icon="💳" title="No accounts" description="Accounts will appear once the backend connects" />
      </div>
    );
  }

  const total = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const maxBalance = Math.max(...accounts.map(a => Number(a.balance || 0)));

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Account Balances</h3>
            <p className="text-xs text-white/40 mt-0.5">Live wallet snapshot</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <Wallet className="w-3 h-3" />
            <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Account list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2">
        {accounts.map((acc, i) => {
          const bal = Number(acc.balance || 0);
          return (
            <div
              key={acc.id}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]
                         hover:bg-white/[0.06] hover:border-white/[0.10] transition-all duration-200 cursor-pointer group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Avatar name={acc.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/85">{acc.name}</p>
                  <p className={`text-sm font-bold ${bal > 1000 ? 'text-emerald-400' : bal > 200 ? 'text-amber-400' : 'text-rose-400'}`}>
                    ₹{bal.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-white/30 font-mono">{acc.id}</p>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${bal > 1000 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                    {bal > 1000 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.round((bal / total) * 100)}%
                  </span>
                </div>
                <BalanceBar balance={bal} maxBalance={maxBalance} />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-400 transition-colors flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] text-white/25 font-medium">Auto-refreshes every 2s</p>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </div>
  );
}
