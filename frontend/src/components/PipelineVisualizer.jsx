import React from 'react';
import { Network, Cpu, Shield, Radio } from 'lucide-react';

const STEPS = [
  { id: 0, icon: Radio,   label: 'Bridge Upload',    desc: 'Bridge node POSTs packet to backend' },
  { id: 1, icon: Shield,  label: 'Idempotency Gate', desc: 'SHA-256 hash claim via Redis SETNX' },
  { id: 2, icon: Cpu,     label: 'Kafka → Decrypt',  desc: 'Consumer decrypts RSA-OAEP + AES-GCM' },
  { id: 3, icon: Network, label: 'Settlement',        desc: '@Transactional debit + credit + ledger' },
];

export default function PipelineVisualizer({ activeStep, packetStatus }) {
  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-sm">Backend Pipeline</h3>
          <p className="text-xs text-white/40 mt-0.5">Live processing stages</p>
        </div>
        {packetStatus && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border animate-bounce-in
            ${packetStatus === 'SETTLED'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>
            {packetStatus === 'SETTLED' ? '✓ Settled' : '✕ Failed'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive   = activeStep === step.id;
          const isComplete = activeStep > step.id && activeStep >= 0;
          const isDone     = packetStatus && activeStep === -1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500
                  ${isActive
                    ? 'bg-brand-500/25 border-brand-500/60 shadow-glow-brand animate-pulse-slow'
                    : isComplete || isDone
                    ? 'bg-emerald-500/15 border-emerald-500/30'
                    : 'bg-white/[0.04] border-white/[0.08]'}`}>
                  <Icon className={`w-4 h-4 transition-colors duration-300
                    ${isActive ? 'text-brand-300' : isComplete || isDone ? 'text-emerald-400' : 'text-white/25'}`} />
                </div>
                <p className={`text-[10px] font-semibold mt-2 text-center transition-colors duration-300 leading-tight
                  ${isActive ? 'text-brand-300' : isComplete || isDone ? 'text-emerald-400' : 'text-white/30'}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-white/20 text-center mt-0.5 hidden lg:block leading-tight max-w-[90px]">
                  {step.desc}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-700
                  ${activeStep > i ? 'bg-emerald-500/60' : activeStep === i ? 'bg-brand-500/40 animate-pulse' : 'bg-white/[0.06]'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
