import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { lookupRecipient, RecipientLookupResult } from '../../services/fintechApi';

type TransferChannel = 'DigiCash' | 'GCash' | 'Maya' | 'GoTyme' | 'Bank';

export const SendMoneyScreen: React.FC = () => {
  const { userProfile, sendMoney, transactions, navigateTo } = useDigiCash();

  const [activeTab, setActiveTab] = useState<TransferChannel>('DigiCash');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [bankName, setBankName] = useState('BDO Unibank');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Real-time API recipient verification state
  const [lookupResult, setLookupResult] = useState<RecipientLookupResult | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const quickAmounts = ['100', '500', '1000', '2500', '5000'];

  // Recent recipients from previous outgoing transactions
  const recentRecipients = transactions
    .filter((tx) => tx.direction === 'OUTGOING' && tx.recipientOrBiller)
    .map((tx) => tx.recipientOrBiller!)
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .slice(0, 4);

  // Live API Lookup when recipient identifier changes
  useEffect(() => {
    const clean = recipient.replace(/\s+/g, '');
    const minLen = activeTab === 'Bank' ? 8 : 11;
    if (clean.length < minLen) {
      setLookupResult(null);
      return;
    }

    let cancelled = false;
    setIsLookingUp(true);
    const timer = setTimeout(async () => {
      const res = await lookupRecipient({
        identifier: clean,
        channel: activeTab,
        bankName: activeTab === 'Bank' ? bankName : undefined,
      });
      if (!cancelled) {
        setIsLookingUp(false);
        setLookupResult(res.verified ? res : null);
        if (res.verified && res.accountName && !recipientName.trim()) {
          setRecipientName(res.accountName);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [recipient, activeTab, bankName]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanRecipient = recipient.trim().replace(/\s+/g, '');
    const cleanName = recipientName.trim();
    const parsedAmount = parseFloat(amount);

    if (!cleanName) {
      setError('Please enter the recipient or account holder name.');
      return;
    }

    if (activeTab === 'Bank') {
      if (cleanRecipient.length < 8) {
        setError('Please enter a valid bank account number (8 to 16 digits).');
        return;
      }
    } else {
      if (!/^(09|\+639|639)\d{9}$/.test(cleanRecipient)) {
        setError('Please enter a valid 11-digit Philippine mobile number (e.g. 09171234567).');
        return;
      }
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid transfer amount greater than ₱0.00.');
      return;
    }
    if (parsedAmount > userProfile.balance) {
      setError(`Insufficient wallet balance. You have ₱${userProfile.balance.toFixed(2)}.`);
      return;
    }

    setIsSending(true);
    const railName = parsedAmount > 50000 ? 'PESONet' : 'InstaPay';
    const channelName =
      activeTab === 'Bank'
        ? `${bankName} (${railName})`
        : activeTab === 'DigiCash'
        ? 'DigiCash P2P Express'
        : `${activeTab} (${railName})`;

    const targetRecipient = `${cleanName} (${cleanRecipient})`;
    const res = sendMoney(targetRecipient, parsedAmount, channelName, note);
    setIsSending(false);

    if (!res.success) {
      setError(res.error || 'Failed to send money.');
    } else {
      navigateTo('MAIN');
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-3xl mx-auto">
      {/* Header with Scan QR button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('MAIN')}
            className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Send Money</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30">
                InstaPay • QR Ph
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Real-time transfers to DigiCash, GCash, Maya, GoTyme & Banks (0% Fee)
            </p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('QR_SCANNER')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/25 transition-all shadow-md"
        >
          <QrCode className="w-4 h-4 text-[#00f5a0]" />
          <span>Scan QR Ph</span>
        </button>
      </div>

      {/* 5-Channel Selector Tabs (DigiCash, GCash, Maya, GoTyme, Bank) */}
      <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-[#091f3a] border border-[#00e5ff]/20">
        {(['DigiCash', 'GCash', 'Maya', 'GoTyme', 'Bank'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#00f5a0] text-[#00222b] shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Balance & Clearing Rail Indicator */}
      <div className="flex justify-between items-center text-xs px-1">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-[#00f5a0]" />
          <span>
            Rail:{' '}
            <strong className="text-white">
              {activeTab === 'DigiCash'
                ? 'DigiCash P2P Core Ledger'
                : parseFloat(amount || '0') > 50000
                ? 'PESONet Clearing'
                : 'BancNet InstaPay Real-Time'}
            </strong>
          </span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">Balance:</span>
          <span className="font-bold text-[#00f5a0]">
            ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Transfer Form */}
      <GlassCard className="p-5">
        <form onSubmit={handleSend} className="space-y-3.5">
          {activeTab === 'Bank' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>Destination InstaPay / PESONet Bank</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="BDO Unibank">BDO Unibank (Banco de Oro)</option>
                <option value="BPI (Bank of the Philippine Islands)">BPI (Bank of the Philippine Islands)</option>
                <option value="GoTyme Bank">GoTyme Bank Corporation</option>
                <option value="Maya Bank">Maya Bank, Inc.</option>
                <option value="Metrobank">Metrobank (Metropolitan Bank)</option>
                <option value="UnionBank of the Philippines">UnionBank of the Philippines</option>
                <option value="SeaBank Philippines">SeaBank Philippines (Maribank)</option>
                <option value="CIMB Bank Philippines">CIMB Bank Philippines</option>
                <option value="Land Bank of the Philippines">Land Bank of the Philippines</option>
                <option value="Security Bank">Security Bank</option>
                <option value="RCBC">RCBC (Rizal Commercial Banking)</option>
                <option value="PNB">PNB (Philippine National Bank)</option>
                <option value="China Bank">China Banking Corporation</option>
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                {activeTab === 'Bank'
                  ? 'Bank Account Number (8–16 Digits)'
                  : `${activeTab} Mobile Number (11 Digits)`}
              </label>
              {isLookingUp && (
                <span className="text-[10px] text-[#00e5ff] animate-pulse">
                  Verifying on {activeTab} rail...
                </span>
              )}
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs font-mono focus:outline-none focus:border-[#00e5ff]"
              placeholder={activeTab === 'Bank' ? 'e.g. 1092837461' : '0917 234 5678'}
              required
            />

            {/* Live API Verification Banner */}
            {lookupResult && lookupResult.verified && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/35 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00f5a0] shrink-0" />
                  <div>
                    <div className="font-bold text-[#00f5a0] flex items-center gap-1.5">
                      <span>Verified: {lookupResult.maskedName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00f5a0]/20 text-white font-mono">
                        {lookupResult.rail}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300">{lookupResult.institution}</div>
                  </div>
                </div>
                {lookupResult.accountName && recipientName !== lookupResult.accountName && (
                  <button
                    type="button"
                    onClick={() => setRecipientName(lookupResult.accountName!)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#00f5a0] text-[#00222b] hover:opacity-90 shrink-0"
                  >
                    Use Name
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Account / Recipient Full Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              placeholder="Enter recipient full name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Transfer Amount</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#00e5ff] font-bold text-sm">
                ₱
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-base font-bold focus:outline-none focus:border-[#00e5ff]"
                placeholder="0.00"
                required
              />
            </div>

            {/* Quick Denomination Chips */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    amount === amt
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                      : 'bg-[#0f2b4d] border-[#00e5ff]/20 text-slate-300 hover:border-[#00e5ff]/50'
                  }`}
                >
                  ₱{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Message / Notes (Optional)</label>
              <span className="text-[10px] text-slate-400">{note.length}/50</span>
            </div>
            <input
              type="text"
              maxLength={50}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              placeholder="Allowance, payment, shared bill, etc."
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-[#0099ff] text-[#00222b] font-black text-sm shadow-lg shadow-[#00e5ff]/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSending
                ? 'Clearing via InstaPay...'
                : `Send ₱${amount ? Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'} via ${activeTab}`}
            </span>
          </button>
        </form>
      </GlassCard>

      {/* Recent Recipients Quick Select */}
      {recentRecipients.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Recent Transfer Recipients</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentRecipients.map((rec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRecipientName(rec.split(' (')[0] || rec);
                  const phoneMatch = rec.match(/\((.*?)\)/);
                  if (phoneMatch) setRecipient(phoneMatch[1]);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0b203c] border border-[#00e5ff]/20 text-xs text-white hover:border-[#00e5ff] whitespace-nowrap flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-[#00f5a0]" />
                <span>{rec}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
