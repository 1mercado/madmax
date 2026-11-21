import React from 'react';
import { Activity, Lock, X } from 'lucide-react';
import { SimulationResult } from '../../types';
import { LottieSuccessAnimation } from './LottieSuccessAnimation';

interface SimulationResultModalProps {
  result: SimulationResult | null;
  onDismiss: () => void;
  onOpenBuilderUpgrade: () => void;
}

export const SimulationResultModal: React.FC<SimulationResultModalProps> = ({
  result,
  onDismiss,
  onOpenBuilderUpgrade,
}) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[#071830] border border-[#00e5ff]/40 shadow-2xl p-6 text-white text-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="text-sm font-bold text-[#00e5ff] tracking-wide">
              Official Compensation Statement
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Badge */}
        <div className="inline-block px-3.5 py-1.5 rounded-xl bg-[#0e284d] text-xs font-semibold text-white mb-4">
          {result.eventName} by {result.subscriberName}
        </div>

        {/* Commission Status Card */}
        {result.isUnlocked && result.commissionEarned > 0 ? (
          <div className="rounded-2xl bg-gradient-to-r from-[#00382b] to-[#00523c] border border-[#00e676]/50 p-4 mb-4">
            <div className="mb-2">
              <LottieSuccessAnimation size={64} variant="reward" />
            </div>
            <div className="text-[11px] font-bold text-[#00d294] tracking-wider uppercase mb-1">
              YOU EARNED LEVEL {result.level} COMMISSION
            </div>
            <div className="text-3xl font-black text-[#00e676] mb-1">
              + ₱{result.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-300">
              Directly credited to your DigiCash wallet balance!
            </p>
          </div>
        ) : !result.isUnlocked ? (
          <div className="rounded-2xl bg-[#2c161d] border border-[#ff5252]/50 p-4 mb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#ff5252] mb-1">
              <Lock className="w-4 h-4" />
              <span>Level {result.level} Commission Locked!</span>
            </div>
            <p className="text-xs text-[#ffb3b3] mb-3 leading-relaxed">
              Basic subscribers earn commissions on Levels 1 to 3. <strong>To unlock 4th level across 10th level, the subscriber must upgrade to Builder Subscriber</strong>.
            </p>
            <button
              onClick={() => {
                onDismiss();
                onOpenBuilderUpgrade();
              }}
              className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] transition-colors"
            >
              Upgrade to Builder Subscriber
            </button>
          </div>
        ) : null}

        {/* 60 / 40 Split Mechanics Card */}
        <div className="text-left mb-2">
          <span className="text-xs font-medium text-slate-400">
            60 / 40 Split & VIP Distribution Mechanics
          </span>
        </div>
        <div className="rounded-2xl bg-[#0b203e] p-4 text-xs space-y-2.5 text-left mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white">Total Event Amount:</span>
            <span className="font-bold text-[#00e5ff]">₱{result.split.totalAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-[#00e5ff]/20 my-1" />

          <div className="flex justify-between items-center">
            <span className="text-[#00d294] font-medium">40% Subscriber Wallet Rebate:</span>
            <span className="font-bold text-[#00e676]">₱{result.split.subscriberCashback.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#ffb300] font-medium">60% VIP 1, 2, 3 Split Pool:</span>
            <span className="font-bold text-[#ffb300]">₱{result.split.vipPoolTotal.toFixed(2)}</span>
          </div>

          {/* 3 VIP Shares */}
          <div className="pl-3 border-l-2 border-[#ffb300]/40 space-y-1 text-[11px] text-slate-300">
            <div>• VIP 1 Pool Share: ₱{result.split.vip1Share.toFixed(2)}</div>
            <div>• VIP 2 Pool Share: ₱{result.split.vip2Share.toFixed(2)}</div>
            <div>• VIP 3 Pool Share: ₱{result.split.vip3Share.toFixed(2)}</div>
            <div className="text-[#00f5a0] font-semibold text-[10px] mt-1">
              ✓ VIP Unilevel Depth: Infinity Worldwide
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl bg-[#14365d] hover:bg-[#1b487c] text-white font-semibold text-xs transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
