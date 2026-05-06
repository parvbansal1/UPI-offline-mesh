import React, { useState } from 'react';
import { Send, ChevronDown, Lock, User, IndianRupee, ArrowRight } from 'lucide-react';
import { Spinner, Avatar } from './ui';

const USERS = [
  { vpa: 'alice@demo', name: 'Alice' },
  { vpa: 'bob@demo',   name: 'Bob'   },
  { vpa: 'carol@demo', name: 'Carol' },
  { vpa: 'dave@demo',  name: 'Dave'  },
];
const QUICK = [100, 250, 500, 1000, 2500];

export default function SendPaymentPanel({ accounts, onInject, loading, disabled }) {
  const [sender,   setSender]   = useState('alice@demo');
  const [receiver, setReceiver] = useState('bob@demo');
  const [amount,   setAmount]   = useState('');
  const [pin,      setPin]      = useState('');

  const senderAcc   = accounts.find(a => a.id === sender);
  const receiverAcc = accounts.find(a => a.id === receiver);
  const sameUser    = sender === receiver;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || sameUser) return;
    onInject({ senderVpa: sender, receiverVpa: receiver, amount: Number(amount), pin: pin || '1234' });
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
          <Send className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Compose Payment</h3>
          <p className="text-xs text-white/40">Fill details, then follow the steps below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-900/50 border border-white/[0.06]">
          <div className="flex-1 text-center">
            <Avatar name={senderAcc?.name || 'S'} size="md" />
            <p className="text-xs font-semibold text-white/80 mt-1.5">{senderAcc?.name}</p>
            {senderAcc?.balance != null && (
              <p className="text-[10px] text-emerald-400 font-semibold">₹{Number(senderAcc.balance).toLocaleString('en-IN')}</p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-brand-400" />
            </div>
            {amount && <span className="text-[10px] font-bold text-brand-300 mt-1">₹{Number(amount).toLocaleString('en-IN')}</span>}
          </div>
          <div className="flex-1 text-center">
            <Avatar name={receiverAcc?.name || 'R'} size="md" />
            <p className="text-xs font-semibold text-white/80 mt-1.5">{receiverAcc?.name}</p>
            {receiverAcc?.balance != null && (
              <p className="text-[10px] text-emerald-400 font-semibold">₹{Number(receiverAcc.balance).toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>

        {/* From */}
        <div>
          <label className="input-label flex items-center gap-1.5"><User className="w-3 h-3" /> From</label>
          <div className="relative">
            <select value={sender} onChange={e => setSender(e.target.value)}
              className="input-field appearance-none pr-10 cursor-pointer" disabled={disabled}>
              {USERS.map(u => <option key={u.vpa} value={u.vpa} className="bg-[#161928]">{u.name} — {u.vpa}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* To */}
        <div>
          <label className="input-label flex items-center gap-1.5"><User className="w-3 h-3" /> To</label>
          <div className="relative">
            <select value={receiver} onChange={e => setReceiver(e.target.value)}
              className={`input-field appearance-none pr-10 cursor-pointer ${sameUser ? 'border-rose-500/50' : ''}`} disabled={disabled}>
              {USERS.map(u => <option key={u.vpa} value={u.vpa} className="bg-[#161928]">{u.name} — {u.vpa}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          {sameUser && <p className="text-xs text-rose-400 mt-1">⚠ Same sender and receiver</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="input-label flex items-center gap-1.5"><IndianRupee className="w-3 h-3" /> Amount</label>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {QUICK.map(a => (
              <button key={a} type="button" onClick={() => setAmount(String(a))} disabled={disabled}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  ${Number(amount) === a ? 'bg-brand-500/25 border-brand-500/50 text-brand-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80'}`}>
                ₹{a.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount" min="1" className="input-field pl-8" required disabled={disabled} />
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="input-label flex items-center gap-1.5"><Lock className="w-3 h-3" /> UPI PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)}
            placeholder="Default: 1234" maxLength={6} className="input-field tracking-widest" disabled={disabled} />
        </div>

        <button type="submit" disabled={loading || !amount || Number(amount) <= 0 || sameUser || disabled}
          className="btn-primary w-full py-3 text-sm">
          {loading ? <><Spinner size="sm" /> Encrypting…</> : <><Send className="w-4 h-4" /> Step 1: Inject into Mesh</>}
        </button>

        <p className="text-[10px] text-white/20 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" /> RSA-OAEP + AES-256-GCM end-to-end encryption
        </p>
      </form>
    </div>
  );
}
