import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ExternalLink, Filter, ChevronRight } from 'lucide-react';
import { StatusBadge, Avatar, EmptyState } from './ui';

function formatAgo(isoOrMs) {
  if (!isoOrMs) return '—';
  const ms = typeof isoOrMs === 'number' ? isoOrMs : new Date(isoOrMs).getTime();
  const diff = Date.now() - ms;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ms).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function ExpandedRow({ tx }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 pb-4 pt-0">
        <div className="bg-dark-900/60 border border-white/[0.06] rounded-xl p-4 mt-1 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Packet Hash</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-mono text-white/60 truncate max-w-[120px]">{tx.hash?.slice(0, 16)}…</p>
              <button
                onClick={() => navigator.clipboard.writeText(tx.hash || '')}
                className="text-white/30 hover:text-brand-400 transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Bridge Node</p>
            <p className="text-xs text-white/60 font-mono">{tx.bridgeNodeId || 'phone-bridge'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Hop Count</p>
            <p className="text-xs text-white/60">{tx.hopCount ?? '—'} hops</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Settled At</p>
            <p className="text-xs text-white/60">{tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString('en-IN') : '—'}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function TransactionLedger({ transactions, newIds = [] }) {
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState('ALL');
  const [search,   setSearch]   = useState('');

  const FILTERS = ['ALL', 'SETTLED', 'PENDING', 'REJECTED', 'DUPLICATE_DROPPED'];

  const filtered = transactions.filter(tx => {
    const matchFilter = filter === 'ALL' || tx.status === filter;
    const matchSearch = !search ||
      tx.sender?.toLowerCase().includes(search.toLowerCase()) ||
      tx.receiver?.toLowerCase().includes(search.toLowerCase()) ||
      String(tx.id)?.includes(search);
    return matchFilter && matchSearch;
  });

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="glass-card flex flex-col overflow-hidden border-white/[0.03]">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Transaction Ledger</h3>
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Monitoring {transactions.length} records in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ledger..."
                className="text-xs bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white/80 placeholder-white/20 focus:border-brand-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-brand-500/10 transition-all w-48 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all duration-300
                  ${isActive
                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-400 shadow-[0_5px_15px_-5px_rgba(99,102,241,0.3)]'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.05] hover:border-white/10'}`}
              >
                {f === 'DUPLICATE_DROPPED' ? 'Duplicate' : f.charAt(0) + f.slice(1).toLowerCase()}
                {f !== 'ALL' && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-brand-500/20' : 'bg-white/5 opacity-60'}`}>
                    {transactions.filter(t => t.status === f).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No transactions yet"
            description="Send a payment to see it appear here in real-time"
          />
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[#121421]/95 backdrop-blur-md z-10 border-b border-white/[0.04]">
              <tr>
                <th className="table-header-cell pl-6">ID</th>
                <th className="table-header-cell">From → To</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Timestamp</th>
                <th className="table-header-cell w-8 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filtered.map(tx => {
                const isNew = newIds.includes(tx.id);
                const isExp = expanded === tx.id;
                return (
                  <React.Fragment key={tx.id}>
                    <tr
                      onClick={() => toggle(tx.id)}
                      className={`${isNew ? 'table-row-new' : 'table-row'} ${isExp ? 'bg-white/[0.04]' : ''} group`}
                    >
                      {/* ID */}
                      <td className="table-cell pl-6">
                        <span className="font-mono text-[11px] font-bold text-white/50 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.05] group-hover:border-white/10 transition-colors">
                          #{tx.id}
                        </span>
                      </td>

                      {/* From → To */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Avatar name={tx.sender?.split('@')[0]} size="sm" />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white/90 truncate max-w-[100px]">
                              {tx.sender?.split('@')[0]}
                            </p>
                            <div className="text-[10px] text-white/30 truncate max-w-[100px] flex items-center gap-1.5 mt-0.5">
                              <span className="px-1 py-0.5 rounded bg-white/5 font-mono text-[9px]">SENDER</span>
                              <ChevronRight className="w-2.5 h-2.5 text-brand-500/50" />
                              <span className="text-white/50">{tx.receiver?.split('@')[0]}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="table-cell">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${tx.status === 'SETTLED' ? 'text-emerald-400' : 'text-white/70'}`}>
                            ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">INR</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="table-cell">
                        <StatusBadge status={tx.status} />
                      </td>

                      {/* Time */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-xs font-medium">{formatAgo(tx.settledAt || tx.signedAt)}</span>
                        </div>
                      </td>

                      {/* Expand */}
                      <td className="table-cell text-right pr-6">
                        <div className={`inline-flex p-1.5 rounded-lg border transition-all duration-300
                          ${isExp ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-white/[0.03] border-white/[0.05] text-white/20 group-hover:border-white/20 group-hover:text-white/50'}`}>
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </td>
                    </tr>
                    {isExp && <ExpandedRow tx={tx} />}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
