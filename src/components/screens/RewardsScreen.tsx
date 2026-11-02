import React, { useState } from 'react';
import { Activity, ArrowLeft, Award, Check, CheckCircle2, Gift, Lock, Sparkles, Star } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { LEVEL_PERCENTAGES, isLevelUnlocked } from '../../data/mockData';
import { RewardItem } from '../../types';

export const RewardsScreen: React.FC = () => {
  const {
    userProfile,
    rewardsCatalog,
    claimDailyPoints,
    redeemReward,
    navigateTo,
  } = useDigiCash();

  const [activeTab, setActiveTab] = useState<'UNILEVEL' | 'VOUCHERS'>('UNILEVEL');
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);
  const [duplicateFactor, setDuplicateFactor] = useState(3);
  const [packageType, setPackageType] = useState<'500' | '5000'>('500');

  const packageAmount = packageType === '500' ? 500.0 : 5000.0;

  // Calculate unilevel projections
  let runningMembers = 1;
  const levelProjections = LEVEL_PERCENTAGES.map((item) => {
    runningMembers *= duplicateFactor;
    const projectedMembers = Math.min(runningMembers, 2000000); // safety cap
    const commissionPerMember = packageAmount * (item.percentage / 100.0);
    const potentialTotal = projectedMembers * commissionPerMember;
    const isUnlocked = isLevelUnlocked(item.level, userProfile.tier);

    return {
      level: item.level,
      percentage: item.percentage,
      projectedMembers,
      commissionPerMember,
      potentialTotal,
      isUnlocked,
    };
  });

  const unlockedEarnings = levelProjections
    .filter((p) => p.isUnlocked)
    .reduce((sum, p) => sum + p.potentialTotal, 0);

  const lockedEarnings = levelProjections
    .filter((p) => !p.isUnlocked)
    .reduce((sum, p) => sum + p.potentialTotal, 0);

  const handleClaim = () => {
    if (!hasClaimedDaily) {
      claimDailyPoints();
      setHasClaimedDaily(true);
    }
  };

  const handleRedeem = (item: RewardItem) => {
    const res = redeemReward(item);
    if (!res.success) {
      alert(res.error || 'Failed to redeem reward.');
    }
  };

  return (
    <div className="w-full space-y-5 pb-24 pt-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('MAIN')}
          className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Rewards & Commissions</h2>
      </div>

      {/* Segmented Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#091f3a] border border-[#00e5ff]/20">
        <button
          onClick={() => setActiveTab('UNILEVEL')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'UNILEVEL'
              ? 'bg-[#00e5ff] text-[#00222b] shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Unilevel Structure</span>
        </button>
        <button
          onClick={() => setActiveTab('VOUCHERS')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'VOUCHERS'
              ? 'bg-[#00e5ff] text-[#00222b] shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Loyalty Vouchers</span>
        </button>
      </div>

      {/* Tab 0: UNILEVEL STRUCTURE */}
      {activeTab === 'UNILEVEL' && (
        <div className="space-y-4">
          {/* Active Potential Overview Card */}
          <div className="rounded-3xl bg-gradient-to-b from-[#0c2448] to-[#07172f] border border-[#00e5ff]/40 p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                <span className="text-xs font-bold text-[#00e5ff] tracking-wide">
                  Unilevel Rewards Potential
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[10px] font-black text-[#00e5ff] uppercase">
                {userProfile.tier}
              </span>
            </div>

            <div className="text-xs text-slate-300">Your Active Potential Earnings</div>
            <div className="text-3xl font-black text-[#00f5a0] tracking-tight my-1">
              ₱{unlockedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {userProfile.tier === 'BASIC' ? (
              <div className="rounded-2xl bg-[#2a151d] border border-[#ff5252]/50 p-3.5 mt-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff8a80]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Levels 4–10 Locked!</span>
                  </div>
                  <div className="text-[11px] text-white font-medium mt-0.5">
                    To unlock 4th level across 10th level, upgrade to Builder Subscriber.
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Missed Potential: ₱{lockedEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('BUILDER_UPGRADE')}
                  className="px-3 py-2 rounded-xl bg-[#ffb300] text-[#241500] text-xs font-bold hover:bg-[#ffc107] shrink-0 ml-2 shadow"
                >
                  Upgrade to Builder
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-[#00f5a0]/15 border border-[#00f5a0]/30 px-3 py-2 mt-3 flex items-center gap-2 text-xs font-bold text-[#00f5a0]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>100% Unilevel Depth Unlocked (Levels 1 to 10 Active)</span>
              </div>
            )}
          </div>

          {/* Interactive Calculator Matrix */}
          <GlassCard className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-white">Potential Earnings Calculator Matrix</h4>

            {/* Package Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPackageType('500')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  packageType === '500'
                    ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
                    : 'bg-[#0f2c52] border-[#00e5ff]/20 text-white'
                }`}
              >
                ₱500 Basic
              </button>
              <button
                type="button"
                onClick={() => setPackageType('5000')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  packageType === '5000'
                    ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
                    : 'bg-[#0f2c52] border-[#00e5ff]/20 text-white'
                }`}
              >
                ₱5,000 Builder
              </button>
            </div>

            {/* Duplication Power */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5">
                Assumed Team Duplication (Each Member Refers):
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 3, 4, 5].map((factor) => (
                  <button
                    type="button"
                    key={factor}
                    onClick={() => setDuplicateFactor(factor)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      duplicateFactor === factor
                        ? 'bg-[#00f5a0] text-[#00222b] border-[#00f5a0]'
                        : 'bg-[#0e2545] border-[#00e5ff]/20 text-slate-300'
                    }`}
                  >
                    Power of {factor}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* 10-Level List */}
          <GlassCard className="p-4 space-y-2.5">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-bold text-white">10-Level Unilevel Commission Breakdown</h4>
              <span className="text-[11px] text-[#00e5ff] font-semibold">
                {userProfile.tier === 'BASIC' ? '3/10 Active' : '10/10 Active'}
              </span>
            </div>

            <div className="space-y-2">
              {levelProjections.map((p) => (
                <div
                  key={p.level}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    p.isUnlocked
                      ? 'bg-[#0d2444]/80 border-[#00e5ff]/25 text-white'
                      : 'bg-[#071526]/50 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        p.isUnlocked ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      L{p.level}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>Level {p.level} ({p.percentage}%)</span>
                        {!p.isUnlocked && <Lock className="w-3 h-3 text-[#ff8a80]" />}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₱{p.commissionPerMember.toFixed(2)}/member • {p.projectedMembers.toLocaleString()} members
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        p.isUnlocked ? 'text-[#00f5a0]' : 'text-[#ff8a80]'
                      }`}
                    >
                      ₱{p.potentialTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {p.isUnlocked ? 'Active' : 'Builder Req.'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 60% VIP Global Pool Split Callout */}
          <div className="rounded-2xl bg-[#0c2449] border border-[#ffb300]/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ffb300]">
                <Award className="w-4 h-4" />
                <span>60% VIP Global Pool Split (To Infinity)</span>
              </div>
              <span className="text-[10px] font-bold text-[#00f5a0] bg-[#00f5a0]/15 px-2 py-0.5 rounded border border-[#00f5a0]/30">
                40% Cashback Rebate
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Upon subscription, <strong>60% goes up and splits to VIP 1, 2 and 3</strong> (20% each) and <strong>40% will remain to the subscriber</strong> as an instant wallet rebate. <strong>To unlock 4th level across 10th level, the subscriber must upgrade to Builder Subscriber</strong>.
            </p>
            <div className="rounded-xl bg-white p-2.5 flex items-center justify-center border border-[#00e5ff]/30 shadow-inner">
              <img
                src="/assets/aistudio/download_226d6164.png"
                alt="Subscriber Distribution Architecture: 60% to VIP 1, 2, 3 (20% each) and 40% to Subscriber Wallet"
                className="w-full max-w-md object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: LOYALTY VOUCHERS & POINTS */}
      {activeTab === 'VOUCHERS' && (
        <div className="space-y-4">
          {/* Points Card */}
          <div className="rounded-3xl bg-[#0c2449] border border-[#ffb300]/30 p-6 text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ffb300] to-[#ffd54f] mx-auto flex items-center justify-center text-black mb-3 shadow-lg shadow-[#ffb300]/20">
              <Star className="w-7 h-7 fill-black" />
            </div>
            <div className="text-xs text-slate-400">Your Reward Points Balance</div>
            <div className="text-3xl font-black text-white my-1">
              {userProfile.points.toLocaleString()} pts
            </div>
            <p className="text-[11px] text-slate-300 mb-4">
              Earn loyalty points on every fund transfer, bill payment, and reload.
            </p>

            <button
              onClick={handleClaim}
              disabled={hasClaimedDaily}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                hasClaimedDaily
                  ? 'bg-[#132f52] text-slate-400 cursor-not-allowed'
                  : 'bg-[#00f5a0] text-[#00222b] hover:bg-[#00e5ff]'
              }`}
            >
              {hasClaimedDaily ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{hasClaimedDaily ? 'Claimed Today (+50 pts)' : 'Daily Check-in Bonus (+50 pts)'}</span>
            </button>
          </div>

          {/* Catalog */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white">Available Vouchers & Rewards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewardsCatalog.map((reward) => {
              const canAfford = userProfile.points >= reward.pointsCost;
              return (
                <GlassCard key={reward.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ffb300]/15 border border-[#ffb300]/30 flex items-center justify-center text-[#ffb300]">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{reward.title}</h5>
                      <p className="text-xs text-slate-400">{reward.description}</p>
                      <span className="text-xs font-bold text-[#ffb300]">
                        {reward.pointsCost} points
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-[#00e5ff] text-[#00222b] hover:bg-[#00f5a0]'
                        : 'bg-[#132f52] text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem' : 'Need Pts'}
                  </button>
                </GlassCard>
              );
            })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
