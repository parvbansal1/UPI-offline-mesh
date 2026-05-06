import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Wifi, Globe, Lock, Cpu, Zap, Signal } from 'lucide-react';

const BASE_NODES = [
  { id: 'sender',   x: 10, y: 50, label: 'Sender',   type: 'offline', icon: Smartphone },
  { id: 'node1',    x: 25, y: 25, label: 'Node A',   type: 'offline', icon: Smartphone },
  { id: 'node2',    x: 28, y: 75, label: 'Node B',   type: 'offline', icon: Smartphone },
  { id: 'node3',    x: 45, y: 45, label: 'Node C',   type: 'offline', icon: Smartphone },
  { id: 'node4',    x: 48, y: 15, label: 'Node D',   type: 'offline', icon: Smartphone },
  { id: 'node5',    x: 52, y: 80, label: 'Node E',   type: 'offline', icon: Smartphone },
  { id: 'node6',    x: 65, y: 35, label: 'Node F',   type: 'offline', icon: Smartphone },
  { id: 'node7',    x: 68, y: 65, label: 'Node G',   type: 'offline', icon: Smartphone },
  { id: 'bridge',   x: 82, y: 50, label: 'Bridge',   type: 'online',  icon: Signal },
  { id: 'internet', x: 94, y: 20, label: 'Internet', type: 'cloud',   icon: Globe },
];

const BASE_EDGES = [
  { source: 'sender', target: 'node1' },
  { source: 'sender', target: 'node2' },
  { source: 'node1',  target: 'node3' },
  { source: 'node1',  target: 'node4' },
  { source: 'node2',  target: 'node3' },
  { source: 'node2',  target: 'node5' },
  { source: 'node3',  target: 'node6' },
  { source: 'node4',  target: 'node6' },
  { source: 'node5',  target: 'node7' },
  { source: 'node6',  target: 'bridge' },
  { source: 'node7',  target: 'bridge' },
  { source: 'bridge', target: 'internet' },
];

export default function MeshGraph({ step, gossipCount }) {
  // Step mapping: 0=idle, 1=injected, 2=gossiped/flush, 3=settled
  
  const isInternetVisible = true;
  const isInternetActive = step >= 2;
  const isSettled = step === 3;
  const isGossiping = step === 1;

  const displayNodes = useMemo(() => {
    const limit = 6 + Math.min(gossipCount * 2, 2); 
    const nodes = BASE_NODES.filter(n => n.type !== 'cloud').slice(0, limit);
    nodes.push(BASE_NODES.find(n => n.type === 'cloud'));
    return nodes;
  }, [gossipCount]);

  const displayEdges = useMemo(() => {
    const nodeIds = displayNodes.map(n => n.id);
    return BASE_EDGES.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target));
  }, [displayNodes]);

  const [activePath, setActivePath] = useState([]);
  
  useEffect(() => {
    if (step === 0) setActivePath([]);
    if (step === 1) setActivePath(['sender']);
    if (step === 2) {
      if (gossipCount === 0) setActivePath(['sender', 'node1', 'node2']);
      if (gossipCount === 1) setActivePath(['sender', 'node1', 'node3', 'node4']);
      if (gossipCount >= 2) setActivePath(['sender', 'node1', 'node3', 'node6', 'bridge']);
    }
    if (step === 3) setActivePath(['sender', 'node1', 'node3', 'node6', 'bridge', 'internet']);
  }, [step, gossipCount]);

  return (
    <div className="relative w-full h-[400px] glass-card overflow-hidden bg-[#0b0d15]/50 border-white/[0.05]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-mesh-grid opacity-30" />
      
      {/* Header Info */}
      <div className="absolute top-4 left-5 z-20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Mesh Network Topology</h3>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            {step === 3 ? 'Status: Data Reached Cloud' : activePath.length > 0 ? 'Status: Propagation Active' : 'Status: Waiting for Injection'}
          </p>
        </div>
      </div>

      {/* Connection Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {displayEdges.map((edge, i) => {
          const s = BASE_NODES.find(n => n.id === edge.source);
          const t = BASE_NODES.find(n => n.id === edge.target);
          const isActive = activePath.includes(edge.source) && activePath.includes(edge.target);
          
          return (
            <g key={i}>
              <line
                x1={`${s.x}%`} y1={`${s.y}%`}
                x2={`${t.x}%`} y2={`${t.y}%`}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1.5"
              />
              {/* Forward Path (Request) */}
              {isActive && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  x1={`${s.x}%`} y1={`${s.y}%`}
                  x2={`${t.x}%`} y2={`${t.y}%`}
                  stroke="var(--brand-500)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  style={{ stroke: 'url(#edgeGradient)' }}
                />
              )}

              {/* Reverse Path (Settlement Sync) */}
              {isSettled && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  x1={`${t.x}%`} y1={`${t.y}%`}
                  x2={`${s.x}%`} y2={`${s.y}%`}
                  stroke="var(--emerald-500)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 8"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {displayNodes.map((node) => {
        const isActive = activePath.includes(node.id);
        const Icon = node.icon;
        
        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <motion.div
              layout
              initial={false}
              animate={{ 
                scale: node.type === 'cloud' && !isInternetActive ? 0.9 : isActive ? 1.1 : 1,
                opacity: node.type === 'cloud' && !isInternetActive ? 0.3 : 1,
                borderColor: isSettled && isActive
                  ? 'rgba(16,185,129,0.5)' // Emerald
                  : node.type === 'cloud' 
                  ? (isInternetActive ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.05)')
                  : isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                backgroundColor: isSettled && isActive
                  ? 'rgba(16,185,129,0.15)' // Emerald
                  : node.type === 'cloud'
                  ? (isInternetActive ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)')
                  : isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)'
              }}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 shadow-lg backdrop-blur-md relative`}
            >
              <Icon className={`w-5 h-5 
                ${isSettled && isActive
                  ? 'text-emerald-400'
                  : node.type === 'cloud' 
                  ? (isInternetActive ? 'text-sky-400' : 'text-white/10')
                  : isActive ? 'text-brand-400' : 'text-white/20'}`} />
              
              {/* Decision Radar (Scanning) */}
              {isActive && isGossiping && (
                <div className="absolute inset-0 rounded-2xl border border-brand-500/50 animate-ping opacity-20" />
              )}
              
              {/* Active Pulse */}
              {isActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute inset-0 rounded-2xl ${node.type === 'cloud' ? 'bg-sky-500/20' : 'bg-brand-500/20'}`}
                />
              )}

              {/* Internet connection rays */}
              {node.type === 'cloud' && isInternetActive && (
                <div className="absolute -inset-4 bg-sky-500/5 blur-2xl rounded-full animate-pulse -z-10" />
              )}
            </motion.div>
            
            {/* Decision Metrics Label */}
            {isActive && isGossiping && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-[-25px] whitespace-nowrap bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono text-brand-400"
              >
                RSSI: -{Math.floor(Math.random() * 20) + 60}dBm · EVALUATING
              </motion.div>
            )}
            
            <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-500
              ${isActive ? 'text-white/80' : 'text-white/20'}`}>
              {node.label}
            </p>
          </div>
        );
      })}

      {/* Floating Data Packet */}
      <AnimatePresence mode='wait'>
        {step > 0 && step < 3 && (
          <motion.div
            key={`packet-${activePath[activePath.length-1]}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${BASE_NODES.find(n => n.id === activePath[activePath.length-1])?.x ?? 15}%`,
              top: `${BASE_NODES.find(n => n.id === activePath[activePath.length-1])?.y ?? 50}%`,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-brand-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.8)] z-30"
          >
            <Lock className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend / Status Info */}
      <div className="absolute bottom-4 right-5 text-right space-y-1">
        <div className="flex items-center justify-end gap-2">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Protocol</span>
          <div className="px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-[9px] text-brand-400 font-mono">RSA-OAEP</div>
        </div>
        <p className="text-[9px] text-white/20 font-medium">Hops: {activePath.length > 0 ? activePath.length - 1 : 0} nodes traversed</p>
      </div>
    </div>
  );
}
