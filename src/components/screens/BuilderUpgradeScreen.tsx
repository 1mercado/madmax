import React from 'react';
import { ArrowLeft, CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';

export const BuilderUpgradeScreen: React.FC = () => {
  const { userProfile, upgradeToBuilder, navigateTo } = useDigiCash();

  const isAlreadyBuilder = userProfile.tier !== 'BASIC';

  const handleUpgrade = () => {
    const res = upgradeToBuilder();
    if (!res.success) {
      alert(res.error || 'Upgrade failed.');
    } else {
      navigateTo('MAIN');
    }
  };

  return (
    <div className="w-full space-y-5 pb-24 pt-2 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('MAIN')}
          className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Builder Subscriber Upgrade</h2>
      </div>

      {/* Hero Builder Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#092040] to-[#06162d] border border-[#00e5ff] p-6 shadow-2xl text-center space-y-4">
        <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#00e5ff] to-[#00f5a0] mx-auto flex items-center justify-center shadow-lg shadow-[#00e5ff]/30 p-4">
          <Rocket className="w-10 h-10 text-[#00222b] stroke-[2.5]" />
        </div>

        <div>
          <div className="text-sm font-extrabold tracking-widest text-[#00e5ff] uppercase">
            BUILDER SUBSCRIBER
          </div>
          <div className="text-4xl font-black text-white tracking-tight my-1">
            ₱5,000.00
          </div>
          <div className="text-xs text-slate-300 max-w-md mx-auto">
            To unlock the <strong>4th level across the 10th level</strong>, the subscriber must upgrade to <strong>Builder Subscriber</strong>.
          </div>
        </div>

        <div className="border-t border-[#00e5ff]/25 my-4" />

        {/* Benefits Checklist */}
        <div className="space-y-3 text-left">
          {[
            'Unlocks 4th level across 10th level commissions (3% down to 0.25%)',
            'Upon upgrade, 60% (₱3,000.00) goes up & splits equally to VIP 1, 2, and 3',
            '40% (₱2,000.00) remains to the subscriber as instant wallet cashback rebate',
            'Earn from every downline subscriber and builder upgrade across 10 levels',
            'Exclusive Builder status badge & priority customer assistance',
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-white">
              <CheckCircle2 className="w-4 h-4 text-[#00e5ff] shrink-0" />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Balance Verification */}
      <GlassCard className="p-4 flex items-center justify-between">
        <span className="text-xs text-slate-300">Your Wallet Balance:</span>
        <span
          className={`text-sm font-bold ${
            userProfile.balance >= 5000.0 ? 'text-[#00f5a0]' : 'text-[#ff5252]'
          }`}
        >
          ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </GlassCard>

      {/* Action Button */}
      <div className="pt-2">
        {isAlreadyBuilder ? (
          <button
            disabled
            className="w-full py-4 rounded-2xl bg-[#00f5a0]/20 text-[#00f5a0] font-bold text-sm cursor-default"
          >
            Active Builder Subscriber (Levels 4–10 Unlocked)
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] font-bold text-base shadow-xl shadow-[#00e5ff]/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-[#00222b]" />
            <span>Upgrade to Builder Subscriber (₱5,000)</span>
          </button>
        )}
        <p className="text-center text-xs text-slate-400 mt-2">
          Your current tier: <span className="font-bold text-[#00e5ff]">{userProfile.tier}</span>
        </p>
      </div>
    </div>
  );
};
