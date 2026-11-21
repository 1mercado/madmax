import React, { useState } from 'react';
import { Activity, ArrowLeft, Check, Copy, Gift, Lock, Share2, Sparkles, UserPlus, Users } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { LEVEL_PERCENTAGES, isLevelUnlocked } from '../../data/mockData';

export const ReferralScreen: React.FC = () => {
  const {
    userProfile,
    networkMembers,
    simulateNewSubscriber,
    simulateDownlineBuilderUpgrade,
    navigateTo,
  } = useDigiCash();

  const [copied, setCopied] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [memberLevel, setMemberLevel] = useState(1);
  const [memberName, setMemberName] = useState('');
  const [packageChoice, setPackageChoice] = useState<'500' | '5000'>('500');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(userProfile.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Join my DigiCash Worldwide team and earn 10 levels of unilevel commissions!\nReferral link: ${userProfile.referralLink}\nCode: ${userProfile.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'DigiCash Referral', text }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleEnrollMember = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = memberName.trim() || `Team Partner L${memberLevel}`;
    if (packageChoice === '500') {
      simulateNewSubscriber(memberLevel, finalName);
    } else {
      simulateDownlineBuilderUpgrade(memberLevel, finalName);
    }
    setShowRegisterModal(false);
    setMemberName('');
  };

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('MAIN')}
            className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Referral Program</h2>
            <p className="text-[11px] text-slate-300">10-Tier Global Unilevel Network</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/30 text-[#00e5ff] hover:bg-[#00e5ff]/25"
          title="Share Referral"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Invite Friends Banner */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0c2448] to-[#07172f] border border-[#00e5ff]/40 p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Gift className="w-5 h-5 text-[#ffb300]" />
            <span>Invite Friends & Earn Unilevel Commissions</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] text-[10px] font-bold border border-[#00f5a0]/30">
            60/40 Split Engine
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#07182f] border border-[#00e5ff]/20 space-y-1.5 text-xs">
          <p className="text-slate-200 leading-relaxed">
            Upon subscription, <strong>60% goes up and splits equally to VIP 1, 2 and 3</strong> (20% each), and <strong>40% remains to the subscriber</strong> as an instant wallet cashback.
          </p>
          <p className="text-[#00e5ff] font-medium leading-relaxed">
            To unlock the <strong>4th level across the 10th level</strong>, the subscriber must upgrade to <strong>Builder Subscriber</strong>.
          </p>
        </div>

        {/* Link Box */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            YOUR OFFICIAL REFERRAL LINK
          </span>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-xs">
            <span className="font-semibold text-[#00e5ff] truncate mr-2 font-mono">
              {userProfile.referralLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 rounded-lg bg-[#00e5ff] text-[#00222b] font-bold text-xs hover:bg-[#00f5a0] transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="text-xs text-slate-400">Total Team Members</div>
          <div className="text-2xl font-black text-white mt-1">
            {networkMembers.length.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Enrolled downlines</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs text-slate-400">Total Unilevel Earnings</div>
          <div className="text-2xl font-black text-[#00f5a0] mt-1">
            ₱{userProfile.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#00f5a0] mt-0.5">Direct & downline payouts</div>
        </GlassCard>
      </div>

      {/* Enroll / Compensation Engine Action Button */}
      <button
        onClick={() => setShowRegisterModal(true)}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] font-bold text-xs shadow-lg shadow-[#00e5ff]/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>Register Downline Partner</span>
      </button>

      {/* Builder Upgrade Callout if Basic */}
      {userProfile.tier === 'BASIC' && (
        <div
          onClick={() => navigateTo('BUILDER_UPGRADE')}
          className="rounded-2xl bg-[#2c1e0a] border border-[#ffb300] p-4 flex items-center justify-between cursor-pointer hover:bg-[#38260d] transition-colors"
        >
          <div className="space-y-0.5 max-w-[70%]">
            <div className="text-xs font-bold text-[#ffb300]">Unlock 4th Level Across 10th Level!</div>
            <p className="text-[11px] text-slate-300">
              To unlock 4th level across 10th level, upgrade to Builder Subscriber (₱5,000). Basic tier currently earns on Levels 1 to 3.
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-[#ffb300] text-black text-xs font-bold hover:bg-[#ffc107]">
            Upgrade to Builder
          </button>
        </div>
      )}

      {/* 10-Level Breakdown Header */}
      <div className="flex justify-between items-center pt-1">
        <h3 className="text-sm font-bold text-white">Your Referral Levels (10-Tier)</h3>
        <span
          className={`text-xs font-bold ${
            userProfile.tier === 'BASIC' ? 'text-[#00e5ff]' : 'text-[#00f5a0]'
          }`}
        >
          {userProfile.tier === 'BASIC' ? 'Levels 1–3 Active' : 'All 10 Levels Active'}
        </span>
      </div>

      {/* 10-Level Cards */}
      <div className="space-y-2">
        {LEVEL_PERCENTAGES.map((item) => {
          const isUnlocked = isLevelUnlocked(item.level, userProfile.tier);
          const countAtLevel = networkMembers.filter((m) => m.level === item.level).length;
          return (
            <div
              key={item.level}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                isUnlocked
                  ? 'bg-[#0d2444]/80 border-[#00e5ff]/25 text-white'
                  : 'bg-[#0b1729]/50 border-white/10 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isUnlocked ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  L{item.level}
                </span>
                <div>
                  <div className="font-semibold text-white">Level {item.level}</div>
                  <div className="text-[10px] text-slate-400">
                    {isUnlocked ? `${countAtLevel} active members` : 'Requires Builder Subscriber Upgrade'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isUnlocked ? 'text-[#00f5a0]' : 'text-slate-500'}`}>
                  {item.percentage}%
                </span>
                {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Network Downline */}
      <div className="space-y-2 pt-1">
        <h3 className="text-sm font-bold text-white">Team Network Directory</h3>
        {networkMembers.length === 0 ? (
          <GlassCard className="p-6 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-7 h-7 mx-auto text-slate-500" />
            <p>No team members enrolled yet.</p>
            <p className="text-[11px] text-slate-300">
              Share your referral link or tap "Enroll Downline Member" above to register partners.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {networkMembers.map((member) => (
              <GlassCard key={member.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{member.name}</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff]">
                      {member.tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Level {member.level} • Joined {member.joinedDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#00f5a0]">
                    +₱{member.earningsGenerated.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">Commission</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Enroll Partner Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#091c36] border border-[#00e5ff]/40 p-6 text-white text-left space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#00e5ff]">Enroll Downline Member</h3>
              <p className="text-xs text-slate-300">
                Register a member into your unilevel tree and execute the 60/40 split engine:
              </p>
            </div>

            <form onSubmit={handleEnrollMember} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Partner Full Name</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Enter partner full name"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Package Tier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPackageChoice('500')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      packageChoice === '500'
                        ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
                        : 'bg-[#0f2c52] border-[#00e5ff]/20 text-white'
                    }`}
                  >
                    ₱500 Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageChoice('5000')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      packageChoice === '5000'
                        ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
                        : 'bg-[#0f2c52] border-[#00e5ff]/20 text-white'
                    }`}
                  >
                    ₱5,000 Builder
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Downline Level in Tree (1 to 10)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setMemberLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        memberLevel === lvl
                          ? 'bg-[#00f5a0] text-[#00222b] border-[#00f5a0]'
                          : 'bg-[#132f52] text-white border-transparent'
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00f5a0] text-[#00222b] text-xs font-bold hover:bg-[#00e5ff]"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
