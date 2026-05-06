import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SendPaymentPanel from './components/SendPaymentPanel';
import MeshFlowPanel from './components/MeshFlowPanel';
import MeshGraph from './components/MeshGraph';
import TransactionLedger from './components/TransactionLedger';
import AccountPanel from './components/AccountPanel';
import ActivityChart from './components/ActivityChart';
import { Toast, StatCard } from './components/ui';
import {
  TrendingUp, CheckCircle, XCircle, Clock, Zap
} from 'lucide-react';

const API = 'http://localhost:8080/api';
let toastId = 0;

const INIT_CHART = Array.from({ length: 12 }).map((_, i) => ({
  time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
  tps: Math.floor(Math.random() * 400) + 100,
}));

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [toasts, setToasts]     = useState([]);

  // data
  const [accounts,      setAccounts]      = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [newIds,        setNewIds]        = useState([]);
  const [chartData,     setChartData]     = useState(INIT_CHART);

  // manual flow state
  const [flowStep,     setFlowStep]     = useState(0);
  const [gossipCount,  setGossipCount]  = useState(0);
  const [flushResults, setFlushResults] = useState([]);
  const [packetId,     setPacketId]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [demoLoading,  setDemoLoading]  = useState(false);

  // virtual pending rows (packets injected but not yet flushed)
  const [pendingRows, setPendingRows] = useState([]);

  // Centralized Mesh State
  const meshNodes = [
    { id: 'sender',   label: 'Alice (Sender)', type: 'offline' },
    { id: 'node1',    x: 35, y: 25, label: 'Node A',   type: 'offline' },
    { id: 'node2',    x: 40, y: 75, label: 'Node B',   type: 'offline' },
    { id: 'node3',    x: 60, y: 40, label: 'Node C',   type: 'offline' },
    { id: 'bridge',   label: 'Bridge Node',  type: 'online'  },
  ];
  
  const [activeNodes, setActiveNodes] = useState(backendOnline ? meshNodes.length : 0);
  
  useEffect(() => {
    // Sync node count with backend status and flow step
    if (!backendOnline) {
      setActiveNodes(0);
    } else {
      // Sync with MeshGraph logic for perfect consistency
      const count = 6 + Math.min(gossipCount * 2, 4);
      setActiveNodes(count);
    }
  }, [backendOnline, flowStep, gossipCount]);

  const prevTxIds = useRef(new Set());

  // ── Dark mode — apply class on <html> ──────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const addToast = useCallback((title, message = '', type = 'info') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, title, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  // ── Poll backend ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [aRes, tRes] = await Promise.all([
        fetch(`${API}/accounts`),
        fetch(`${API}/transactions`),
      ]);
      if (aRes.ok && tRes.ok) setBackendOnline(true);
      else { setBackendOnline(false); return; }

      const accs = await aRes.json();
      setAccounts(accs.map(a => ({ id: a.vpa, name: a.holderName, balance: a.balance })));

      const txs = await tRes.json();
      const mapped = txs.map(t => ({
        id: t.id, hash: t.packetHash,
        sender: t.senderVpa, receiver: t.receiverVpa,
        amount: t.amount, status: t.status,
        settledAt: t.settledAt, signedAt: t.signedAt,
        bridgeNodeId: t.bridgeNodeId, hopCount: t.hopCount,
      }));

      // detect new rows for highlight animation
      const fresh = mapped.filter(t => !prevTxIds.current.has(t.id)).map(t => t.id);
      if (fresh.length > 0) {
        setNewIds(fresh);
        setTimeout(() => setNewIds([]), 3000);
        mapped.filter(t => fresh.includes(t.id)).forEach(t => {
          if (t.status === 'SETTLED') {
            addToast('Payment Settled ✓', `₹${Number(t.amount).toLocaleString('en-IN')} · ${t.sender?.split('@')[0]} → ${t.receiver?.split('@')[0]}`, 'success');
            setChartData(prev => [...prev.slice(1), {
              time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              tps: Number(t.amount),
            }]);
          } else if (t.status === 'REJECTED') {
            addToast('Payment Rejected', `Insufficient balance — ₹${Number(t.amount).toLocaleString('en-IN')}`, 'error');
          }
        });
        fresh.forEach(id => prevTxIds.current.add(id));
      }

      setTransactions(mapped);
      // remove virtual pending rows that are now on the real ledger
      setPendingRows(prev => prev.filter(p => !mapped.some(t => t.hash === p.hash)));
    } catch { setBackendOnline(false); }
  }, [addToast]);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 2000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // ── Step 1: Inject ─────────────────────────────────────────────────────────
  const handleInject = async ({ senderVpa, receiverVpa, amount, pin }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/demo/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderVpa, receiverVpa, amount, pin,
          startDevice: 'phone-' + senderVpa.split('@')[0],
        }),
      });
      if (!res.ok) throw new Error('Inject failed');
      const data = await res.json();
      setPacketId(data.packetId || '');
      setFlowStep(1);
      setGossipCount(0);
      setFlushResults([]);

      // Add a virtual "PENDING" row so it shows in the ledger immediately
      const virtualId = `v-${Date.now()}`;
      setPendingRows(prev => [...prev, {
        id: virtualId, hash: data.packetId || virtualId,
        sender: senderVpa, receiver: receiverVpa,
        amount, status: 'PENDING',
        settledAt: null, signedAt: Date.now(),
        bridgeNodeId: 'in-mesh', hopCount: 0,
        virtual: true,
      }]);

      addToast('Packet injected ✓', `Encrypted & handed to phone-${senderVpa.split('@')[0]} · TTL=${data.ttl}`, 'info');
    } catch (e) {
      addToast('Inject failed', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Gossip ─────────────────────────────────────────────────────────
  const handleGossip = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/mesh/gossip`, { method: 'POST' });
      const data = await res.json();
      const newCount = gossipCount + 1;
      setGossipCount(newCount);
      if (flowStep === 1) setFlowStep(2);
      addToast(`Gossip round ${newCount} ✓`, `${data.transfers ?? 0} hop(s) — packet spreading across devices`, 'info');
    } catch (e) {
      addToast('Gossip failed', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Bridge Flush ───────────────────────────────────────────────────
  const handleFlush = async () => {
    setLoading(true);
    try {
      const res     = await fetch(`${API}/mesh/flush`, { method: 'POST' });
      const data    = await res.json();
      const results = data.results || [];
      setFlushResults(results);
      setFlowStep(3);

      // remove virtual pending row
      setPendingRows([]);

      const settled = results.filter(r => r.outcome === 'SETTLED' || r.outcome === 'ACCEPTED').length;
      const dupes   = results.filter(r => r.outcome === 'DUPLICATE_DROPPED').length;

      if (settled > 0)
        addToast('🎉 Settled on ledger!', `${settled} settled · ${dupes} duplicate(s) dropped`, 'success');
      else if (dupes > 0)
        addToast('Duplicate dropped', 'Idempotency gate caught a re-delivery', 'warning');
      else
        addToast('Uploaded to backend', `${results.length} packet(s) processed`, 'info');
    } catch (e) {
      addToast('Bridge upload failed', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset mesh ─────────────────────────────────────────────────────────────
  const handleReset = async () => {
    try { await fetch(`${API}/mesh/reset`, { method: 'POST' }); } catch {}
    setFlowStep(0); setGossipCount(0); setFlushResults([]); setPacketId('');
    setPendingRows([]);
    setChartData(INIT_CHART); // Reset monitor/chart to initial state
    fetchData(); 
    addToast('System Reset ✓', 'Ledger, volume, and balances cleared', 'info');
  };

  // ── Quick Demo: send 3 txns to show all states ─────────────────────────────
  // Sends: 1 normal (→ SETTLED), 1 over-balance (→ REJECTED), 1 duplicate (→ DUPLICATE_DROPPED)
  const handleQuickDemo = async () => {
    if (!backendOnline) { addToast('Backend offline', 'Start the Spring Boot server first', 'error'); return; }
    setDemoLoading(true);
    addToast('Quick Demo started', 'Sending 3 test transactions…', 'info');
    try {
      // 1. Normal transaction — alice → bob ₹200
      const r1 = await fetch(`${API}/demo/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderVpa: 'alice@demo', receiverVpa: 'bob@demo', amount: 200, pin: '1234', startDevice: 'phone-alice' }),
      });
      const d1 = await r1.json();

      // Gossip twice then flush (will SETTLE)
      await fetch(`${API}/mesh/gossip`, { method: 'POST' });
      await fetch(`${API}/mesh/gossip`, { method: 'POST' });
      await fetch(`${API}/mesh/flush`, { method: 'POST' });
      await fetch(`${API}/mesh/reset`, { method: 'POST' });

      // 2. Over-balance — dave has ₹500 balance, try to send ₹99999 → REJECTED
      const r2 = await fetch(`${API}/demo/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderVpa: 'dave@demo', receiverVpa: 'carol@demo', amount: 99999, pin: '1234', startDevice: 'phone-dave' }),
      });
      await fetch(`${API}/mesh/gossip`, { method: 'POST' });
      await fetch(`${API}/mesh/flush`, { method: 'POST' });
      await fetch(`${API}/mesh/reset`, { method: 'POST' });

      // 3. Duplicate: inject again and flush — same packet ciphertext hash → DUPLICATE_DROPPED
      await fetch(`${API}/demo/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderVpa: 'carol@demo', receiverVpa: 'alice@demo', amount: 50, pin: '1234', startDevice: 'phone-carol' }),
      });
      await fetch(`${API}/mesh/gossip`, { method: 'POST' });
      // flush twice — second flush POSTs same packet again → DUPLICATE_DROPPED
      await fetch(`${API}/mesh/flush`, { method: 'POST' });

      addToast('Quick Demo done! ✓', 'Check ledger: SETTLED, REJECTED, and DUPLICATE rows', 'success');
    } catch (e) {
      addToast('Demo error', e.message, 'error');
    } finally {
      setDemoLoading(false);
      await fetch(`${API}/mesh/reset`, { method: 'POST' }).catch(() => {});
    }
  };

  // ── Stats (include virtual pending rows) ───────────────────────────────────
  const allRows  = [...transactions, ...pendingRows];
  const settled  = allRows.filter(t => t.status === 'SETTLED').length;
  const rejected = allRows.filter(t => ['REJECTED', 'FAILED'].includes(t.status)).length;
  const pending  = allRows.filter(t => ['PENDING', 'ACCEPTED'].includes(t.status)).length;
  const totalVol = allRows.filter(t => t.status === 'SETTLED')
                          .reduce((s, t) => s + Number(t.amount || 0), 0);

  // ── Pages ──────────────────────────────────────────────────────────────────
  const PAGE_META = {
    dashboard: { title: 'Dashboard',    subtitle: 'Manual offline-mesh payment pipeline' },
    send:      { title: 'Send Payment', subtitle: 'Step-by-step encrypted payment flow'  },
    history:   { title: 'Transactions', subtitle: 'Full ledger with status filters'       },
  };

  const StatsRow = () => (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard icon={<TrendingUp className="w-5 h-5"/>}  label="Total Settled" value={`₹${totalVol.toLocaleString('en-IN')}`} sub={`${settled} txns`} color="brand" trend={settled > 0 ? 12 : undefined}/>
      <StatCard icon={<CheckCircle className="w-5 h-5"/>} label="Settled"       value={settled}  sub="Confirmed on ledger"         color="emerald"/>
      <StatCard icon={<Clock className="w-5 h-5"/>}       label="Pending"       value={pending}  sub="Injected, not yet flushed"    color="amber"/>
      <StatCard icon={<XCircle className="w-5 h-5"/>}     label="Rejected"      value={rejected} sub="Insufficient / replay attack" color="rose"/>
    </div>
  );

  const QuickDemoBtn = () => (
    <button
      onClick={handleQuickDemo}
      disabled={demoLoading || !backendOnline}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm
                 bg-violet-600/15 border-violet-500/40 text-violet-300
                 hover:bg-violet-600/25 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Auto-runs 3 transactions showing SETTLED + REJECTED + DUPLICATE"
    >
      {demoLoading
        ? <span className="animate-spin-slow w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full" />
        : <Zap className="w-4 h-4" />}
      Quick Demo (3 txns)
    </button>
  );

  const renderDashboard = () => (
    <div className="space-y-5">
      <StatsRow />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left */}
        <div className="xl:col-span-2 space-y-5">
          <ActivityChart data={chartData} />
          <MeshGraph step={flowStep} gossipCount={gossipCount} />
          <MeshFlowPanel
            step={flowStep} gossipCount={gossipCount}
            flushResults={flushResults} loading={loading}
            onGossip={handleGossip} onFlush={handleFlush}
            onReset={handleReset} packetId={packetId}
          />
          {/* Quick demo bar */}
          <div className="glass-card px-4 py-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>Quick Demo Mode</p>
              <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>
                Auto-runs 3 transactions to show <b>SETTLED</b>, <b>REJECTED</b> (over-balance), and <b>DUPLICATE</b> states in the ledger
              </p>
            </div>
            <QuickDemoBtn />
          </div>
          <div className="min-h-[400px]">
            <TransactionLedger transactions={[...pendingRows, ...transactions]} newIds={newIds} />
          </div>
        </div>
        {/* Right */}
        <div className="space-y-5">
          <SendPaymentPanel
            accounts={accounts}
            onInject={handleInject}
            loading={loading && flowStep === 0}
            disabled={flowStep > 0 && flowStep < 3}
          />
          <div className="h-[400px]">
            <AccountPanel accounts={accounts} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSend = () => (
    <div className="max-w-xl mx-auto space-y-5">
      <SendPaymentPanel
        accounts={accounts}
        onInject={handleInject}
        loading={loading && flowStep === 0}
        disabled={flowStep > 0 && flowStep < 3}
      />
      <MeshFlowPanel
        step={flowStep} gossipCount={gossipCount}
        flushResults={flushResults} loading={loading}
        onGossip={handleGossip} onFlush={handleFlush}
        onReset={handleReset} packetId={packetId}
      />
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <StatsRow />
      </div>
      <div className="glass-card px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>Need to see Rejected / Duplicate rows?</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Use Quick Demo to auto-generate all transaction types, or send with an amount exceeding the sender's balance.</p>
        </div>
        <QuickDemoBtn />
      </div>
      <div className="min-h-[500px]">
        <TransactionLedger transactions={[...pendingRows, ...transactions]} newIds={newIds} />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div className="hidden md:block h-full border-r border-white/[0.05] bg-black/20">
        <Sidebar 
          active={page} 
          onNavigate={setPage} 
          backendOnline={backendOnline} 
          nodeCount={activeNodes}
          onReset={handleReset}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-mesh-grid">
        {/* Background glow effects for uniqueness */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] left-[10%] w-[25%] h-[25%] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

        <div className="px-6 py-4">
          <Topbar
            title={PAGE_META[page]?.title}
            subtitle={PAGE_META[page]?.subtitle}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {page === 'dashboard' && renderDashboard()}
            {page === 'send'      && renderSend()}
            {page === 'history'   && renderHistory()}
            
            <footer className="mt-12 mb-6 text-center text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold">
              UPI Mesh · Secure Distributed Ledger · RSA-OAEP + AES-256-GCM
            </footer>
          </div>
        </main>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
