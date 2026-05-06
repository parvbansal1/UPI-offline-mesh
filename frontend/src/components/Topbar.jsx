import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';

export default function Topbar({ title, subtitle, darkMode, onToggleDark }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 glass-card rounded-2xl mb-0" style={{color:'var(--text-primary)'}}>
      <div>
        <h2 className="text-xl font-bold tracking-tight" style={{color:'var(--text-primary)'}}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5 font-medium" style={{color:'var(--text-muted)'}}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
          <input
            type="text"
            placeholder="Search transactions..."
            className="input-field pl-9 py-2 text-xs w-52"
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="btn-ghost w-9 h-9 p-0 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
          title="Toggle dark/light"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-white/60" />}
        </button>

        {/* Notifications */}
        <button className="btn-ghost w-9 h-9 p-0 rounded-xl flex items-center justify-center" style={{background:'var(--bg-hover)',border:'1px solid var(--border-card)'}}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
        </button>

        {/* Date */}
        <div className="hidden lg:block text-right">
          <p className="text-xs font-semibold" style={{color:'var(--text-secondary)'}}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <p className="text-[10px]" style={{color:'var(--text-muted)'}}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </header>
  );
}
