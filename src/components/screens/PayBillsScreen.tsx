import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building, CheckCircle2, ChevronRight, Droplet, Lightbulb, QrCode, Receipt, Tv, Wifi } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { Biller } from '../../types';

export const PayBillsScreen: React.FC = () => {
  const { billers, userProfile, payBill, navigateTo } = useDigiCash();

  const categories = ['All', 'Electricity', 'Water', 'Internet', 'Cable TV', 'Government', 'Loans'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBiller, setActiveBiller] = useState<Biller | null>(null);

  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredBillers = selectedCategory === 'All'
    ? billers
    : billers.filter((b) => b.category === selectedCategory);

  const getBillerIcon = (cat: string) => {
    switch (cat) {
      case 'Electricity': return <Lightbulb className="w-5 h-5 text-[#ffb300]" />;
      case 'Water': return <Droplet className="w-5 h-5 text-[#00e5ff]" />;
      case 'Internet': return <Wifi className="w-5 h-5 text-[#00f5a0]" />;
      case 'Cable TV': return <Tv className="w-5 h-5 text-[#b06ab3]" />;
      case 'Government': return <Building className="w-5 h-5 text-[#64b5f6]" />;
      default: return <Receipt className="w-5 h-5 text-[#00e5ff]" />;
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBiller) return;
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (!accountNumber.trim()) {
      setError('Please enter your account number.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (parsedAmount + activeBiller.fee > userProfile.balance) {
      setError('Insufficient wallet balance for this bill payment.');
      return;
    }

    const res = payBill(activeBiller, accountNumber, parsedAmount);
    if (!res.success) {
      setError(res.error || 'Payment failed.');
    } else {
      setActiveBiller(null);
      navigateTo('MAIN');
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-3xl mx-auto">
      {/* Header with Scan Bill QR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('MAIN')}
            className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Pay Bills</h2>
        </div>
        <button
          onClick={() => navigateTo('QR_SCANNER')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-xs font-bold text-[#00e5ff] hover:bg-[#00e5ff]/25 transition-all"
        >
          <QrCode className="w-4 h-4 text-[#ffb300]" />
          <span>Scan Bill QR</span>
        </button>
      </div>

      {/* 1-Tap Scan Bill Statement Banner */}
      <div
        onClick={() => navigateTo('QR_SCANNER')}
        className="rounded-2xl bg-gradient-to-r from-[#0d2a4d] to-[#071c36] border border-[#00e5ff]/40 p-3.5 flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffb300]/20 flex items-center justify-center text-[#ffb300]">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Scan Statement Barcode or QR</div>
            <p className="text-[11px] text-slate-300">
              Auto-fills Meralco, Maynilad, PLDT account number and amount
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#00e5ff] text-[#00222b] font-bold shadow-md'
                : 'bg-[#0c2442] text-slate-300 border border-[#00e5ff]/20 hover:border-[#00e5ff]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Billers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredBillers.map((biller) => (
          <GlassCard
            key={biller.id}
            onClick={() => {
              setActiveBiller(biller);
              setAccountNumber('');
              setAmount('');
              setError(null);
            }}
            className="p-4 flex items-center justify-between hover:border-[#00e5ff]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#091f3a] border border-[#00e5ff]/25 flex items-center justify-center">
                {getBillerIcon(biller.category)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{biller.name}</h4>
                <p className="text-xs text-slate-400">{biller.description}</p>
                {biller.fee > 0 && (
                  <span className="text-[10px] text-slate-400">Fee: ₱{biller.fee.toFixed(2)}</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </GlassCard>
        ))}
      </div>

      {/* Pay Bill Modal */}
      {activeBiller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081c38] border border-[#00e5ff]/40 p-6 text-white text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#091f3a] border border-[#00e5ff]/30 flex items-center justify-center">
                {getBillerIcon(activeBiller.category)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{activeBiller.name}</h3>
                <span className="text-xs text-[#00e5ff] font-medium">{activeBiller.category}</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-3.5 mb-5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Available Balance:</span>
                <span className="font-bold text-[#00e5ff]">
                  ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Account / Reference Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="e.g. 109283746"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bill Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#00e5ff] font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white font-bold text-sm focus:outline-none focus:border-[#00e5ff]"
                    placeholder="0.00"
                    required
                  />
                </div>
                {activeBiller.fee > 0 && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Convenience fee: ₱{activeBiller.fee.toFixed(2)}
                  </p>
                )}
              </div>

              {error && <p className="text-xs text-[#ff5252] font-semibold">{error}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveBiller(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0]"
                >
                  Pay Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
