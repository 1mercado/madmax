import React from 'react';
import { ArrowLeft, Check, Crown, ShieldCheck, Star } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { UserTier } from '../../types';

export const VipTiersScreen: React.FC = () => {
  const { userProfile, navigateTo } = useDigiCash();

  // Super Admin account verification
  const isSuperAdmin =
    userProfile.role === 'SUPER_ADMIN' ||
    userProfile.name?.toLowerCase().includes('super admin') ||
    userProfile.email?.toLowerCase().includes('superadmin') ||
    userProfile.email?.toLowerCase().includes('vipbossceo');

  const vipTiers = [
    {
      tier: 'VIP_1' as UserTier,
      title: 'VIP 1',
      assignedName: 'Julis Hate',
      badgeColor: '#FFB300',
      perks: [
        'Higher commission unilevel structure',
        'Exclusive promotional campaigns',
        'Priority customer care',
        'VIP 1 Infinity Pool Share (20%)',
      ],
    },
    {
      tier: 'VIP_2' as UserTier,
      title: 'VIP 2',
      assignedName: 'Randy Andong',
      badgeColor: '#FF9100',
      perks: [
        'Bigger reward bonuses and gifts',
        'Higher unilevel commission cap',
        'Dedicated VIP executive support',
        'VIP 2 Infinity Pool Share (20%)',
      ],
    },
    {
      tier: 'VIP_3' as UserTier,
      title: 'VIP 3',
      assignedName: 'Elle Valenzona',
      badgeColor: '#FF3D00',
      perks: [
        'Maximum unilevel earnings & deep bonuses',
        'Private VIP networking & summits',
        'Personal dedicated account manager',
        'VIP 3 Infinity Pool Share (20%)',
      ],
    },
  ];

  return (
    <div className="w-full space-y-5 pb-24 pt-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('MAIN')}
          className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">VIP Membership Club</h2>
      </div>

      {/* Overview Card with Distribution Architecture */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0c2448] to-[#07172f] border border-[#ffb300]/50 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#ffb300]">
            <Crown className="w-5 h-5" />
            <span>VIP Infinity Pool Distribution (60% / 40% Smart Split)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] text-[10px] font-bold border border-[#00f5a0]/30">
            Real-Time Split
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Upon subscription, <strong>60% goes up and splits to VIP 1, 2 and 3</strong> (20% each to infinity depth) and <strong>40% will remain to the subscriber</strong> as an instant wallet rebate. <strong>To unlock 4th level across 10th level, the subscriber must upgrade to Builder Subscriber</strong>.
        </p>

        {/* User Distribution Architecture Diagram */}
        <div className="rounded-2xl bg-white p-3 sm:p-4 flex items-center justify-center shadow-inner overflow-hidden border border-[#00e5ff]/30">
          <img
            src="/assets/aistudio/download_226d6164.png"
            alt="Subscriber 60% Distributed Amount to VIP 1, VIP 2, VIP 3 and 40% Remaining Amount to Subscriber Wallet"
            className="w-full max-w-lg object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vipTiers.map((tierConfig) => {
          const isCurrentTier = userProfile.tier === tierConfig.tier;
          return (
            <GlassCard
              key={tierConfig.tier}
              className={`p-5 space-y-4 border ${
                isCurrentTier ? 'border-[#00f5a0]' : 'border-[#00e5ff]/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-black uppercase tracking-wider"
                    style={{ color: tierConfig.badgeColor }}
                  >
                    {tierConfig.title}
                  </h3>
                  <div className="text-2xl font-black text-white mt-0.5 tracking-tight">
                    {tierConfig.assignedName}
                  </div>
                  <div className="text-[11px] text-slate-400">Membership Club Leader</div>
                </div>

                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: `${tierConfig.badgeColor}22`,
                    borderColor: tierConfig.badgeColor,
                    color: tierConfig.badgeColor,
                  }}
                >
                  <Star className="w-7 h-7 fill-current" />
                </div>
              </div>

              <div className="border-t border-[#00e5ff]/20" />

              <div className="space-y-2">
                {tierConfig.perks.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-white">
                    <Check className="w-4 h-4 text-[#00f5a0] shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade to VIP button replaced with unclickable VERIFIED USER label, only shown to Super Admin User Account */}
              {isSuperAdmin && (
                <div
                  className="w-full py-3 px-4 rounded-xl font-black text-xs text-center uppercase tracking-wider select-none cursor-default bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,160,0.15)] pointer-events-none"
                  aria-label="Verified User"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00f5a0] shrink-0 stroke-[2.5]" />
                  <span>VERIFIED USER</span>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
