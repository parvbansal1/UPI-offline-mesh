import React from 'react';
import { motion } from 'framer-motion';
import { Database, Lock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

const STEPS = [
  { id: 'hash', label: 'Hash Ciphertext', icon: Lock },
  { id: 'redis', label: 'Redis Idempotency', icon: Database },
  { id: 'decrypt', label: 'KMS Decrypt', icon: ShieldCheck },
  { id: 'settle', label: 'PG Settle', icon: CheckCircle },
];

export default function BackendPipeline({ activeStep, packetStatus }) {
  return (
    <div className="w-full glass-card p-6 mt-6">
      <h2 className="text-xl font-bold mb-6 neon-text-purple flex items-center gap-2">
        <Database className="w-5 h-5 text-neonPurple" />
        Backend Pipeline
      </h2>
      
      <div className="flex justify-between items-center relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 z-0 rounded" />
        
        {/* Active Line Progress */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neonPurple z-0 shadow-[0_0_10px_rgba(176,38,255,0.8)]"
          initial={{ width: '0%' }}
          animate={{ width: `${(Math.max(0, activeStep) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {STEPS.map((step, idx) => {
          let Icon = step.icon;
          const isActive = activeStep === idx;
          const isCompleted = activeStep > idx;
          
          let statusColor = "text-gray-400";
          let bgClass = "bg-[#0f111a] border-gray-600";
          
          if (isActive) {
            bgClass = "bg-neonPurple/20 border-neonPurple neon-shadow-purple";
            statusColor = "text-neonPurple";
          } else if (isCompleted) {
            bgClass = "bg-neonGreen/20 border-neonGreen";
            statusColor = "text-neonGreen";
          }

          // Handle rejection state
          if (packetStatus === 'REJECTED' && isActive) {
            bgClass = "bg-neonRed/20 border-neonRed";
            statusColor = "text-neonRed";
            Icon = XCircle;
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                className={cn(
                  "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                  bgClass
                )}
              >
                <Icon className={cn("w-6 h-6", statusColor)} />
              </motion.div>
              <span className={cn(
                "text-sm font-semibold whitespace-nowrap transition-colors",
                isActive ? "text-white" : "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
