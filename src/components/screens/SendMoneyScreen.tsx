import React, { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Contact, QrCode, Send, Smartphone, Wallet } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';

export const SendMoneyScreen: React.FC = () => {
  const { userProfile, sendMoney, transactions, navigateTo } = useDigiCash();

  const [activeTab, setActiveTab] = useState<'Mobile' | 'Bank' | 'GCash' | 'Maya'>('Mobile');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [bankName, setBankName] = useState('BDO Unibank');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = ['100', '500', '1000', '2500'];

  // Recent recipients from previous outgoing transactions
  const recentRecipients = transactions
    .filter((tx) => tx.direction === 'OUTGOING' && tx.recipientOrBiller)
    .map((tx) => tx.recipientOrBiller)
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .slice(0, 3);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanRecipient = recipient.trim();
    const cleanName = recipientName.trim();
    const parsedAmount = parseFloat(amount);

    if (!cleanName) {
      setError('Please enter the recipient or account name.');
      return;
    }

    if (activeTab === 'Bank') {
      if (cleanRecipient.length < 8) {
        setError('Please enter a valid bank account number (at least 8 digits).');
        return;
      }
    } else {
      // Mobile, GCash, Maya validation
      const sanitizedPhone = cleanRecipient.replace(/\s+/g, '');
      if (!/^(09|\+639)\d{9}$/.test(sanitizedPhone)) {
        setError('Please enter a valid 11-digit Philippine mobile number (e.g. 09171234567).');
        return;
      }
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₱0.00.');
      return;
    }
    if (parsedAmount > userProfile.balance) {
      setError(`Insufficient wallet balance. You have ₱${userProfile.balance.toFixed(2)}.`);
      return;
    }

    const channelName = activeTab === 'Bank' ? `${bankName}` : `${activeTab} Express`;
    const targetRecipient = `${cleanName} (${cleanRecipient})`;
    const res = sendMoney(targetRecipient, parsedAmount, channelName, note);
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
            <h2 className="text-xl font-bold text-white">Send Money</h2>
            <p className="text-[11px] text-slate-300">Instant transfer with 0% fee</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('QR_SCANNER')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/25 transition-all shadow-md"
        >
          <QrCode className="w-4 h-4 text-[#00f5a0]" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Channel Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#091f3a] border border-[#00e5ff]/20">
        {(['Mobile', 'Bank', 'GCash', 'Maya'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#00e5ff] text-[#00222b] shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Balance Indicator */}
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-slate-400">Available Wallet Balance:</span>
        <span className="font-bold text-[#00e5ff]">
          ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Main Form */}
      <GlassCard className="p-5">
        <form onSubmit={handleSend} className="space-y-3.5">
          {activeTab === 'Bank' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Destination Bank
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="BDO Unibank">BDO Unibank (Banco de Oro)</option>
                <option value="BPI (Bank of the Philippine Islands)">BPI (Bank of the Philippine Islands)</option>
                <option value="Metrobank">Metrobank (Metropolitan Bank)</option>
                <option value="UnionBank of the Philippines">UnionBank of the Philippines</option>
                <option value="Land Bank of the Philippines">Land Bank of the Philippines</option>
                <option value="Security Bank">Security Bank</option>
                <option value="RCBC (Rizal Commercial Banking)">RCBC</option>
                <option value="PNB (Philippine National Bank)">PNB</option>
                <option value="China Banking Corporation">China Bank</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Account / Recipient Full Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              placeholder="e.g. Juan dela Cruz"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {activeTab === 'Bank' ? 'Bank Account Number' : `${activeTab} Mobile Number`}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              placeholder={activeTab === 'Bank' ? 'e.g. 1092837461' : '09XX XXX XXXX'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount</label>
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

            {/* Quick Chips */}
            <div className="grid grid-cols-4 gap-2 mt-2">
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
                  ₱{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Message / Purpose (Optional)</label>
              <span className="text-[10px] text-slate-400">{note.length}/50</span>
            </div>
            <input
              type="text"
              maxLength={50}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
              placeholder="What is this transfer for?"
            />
          </div>

          {error && <div className="text-xs text-[#ff5252] font-semibold">{error}</div>}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white font-bold text-sm shadow-lg shadow-[#0072ff]/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Send className="w-4 h-4" />
            <span>Send ₱{amount || '0.00'} Now</span>
          </button>
        </form>
      </GlassCard>

      {/* Recent Recipients Quick Select */}
      {recentRecipients.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300">Recent Recipients</div>
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
                className="px-3 py-1.5 rounded-xl bg-[#0b203c] border border-[#00e5ff]/20 text-xs text-white hover:border-[#00e5ff] whitespace-nowrap"
              >
                {rec}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
