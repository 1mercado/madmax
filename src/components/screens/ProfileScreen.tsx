import React, { useState } from 'react';
import {
  BellRing,
  Check,
  ChevronRight,
  HelpCircle,
  History,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Star,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { USER_TIERS } from '../../data/mockData';
export const ProfileScreen: React.FC = () => {
  const {
    userProfile,
    setBottomTab,
    navigateTo,
    isBiometricsEnabled,
    toggleBiometrics,
    lockApp,
    platformSensorName,
    biometricType,
    mpin,
    unlockHistory,
    signOut,
    theme,
    toggleTheme,
    pushSettings,
    unreadNotificationCount,
    setIsNotificationCenterOpen,
  } = useDigiCash();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const tierConfig = USER_TIERS[userProfile.tier] || USER_TIERS.BASIC;

  return (
    <div className="w-full space-y-5 pb-24 pt-2 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">My Profile</h2>
      </div>

      {/* User Info Hero Card */}
      <GlassCard className="p-5 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-black shrink-0"
          style={{ backgroundColor: tierConfig.badgeColor }}
        >
          {userProfile.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">{userProfile.name}</h3>
          <p className="text-xs text-slate-300">{userProfile.email}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded border"
              style={{
                color: tierConfig.badgeColor,
                backgroundColor: `${tierConfig.badgeColor}22`,
                borderColor: tierConfig.badgeColor,
              }}
            >
              {tierConfig.title} Tier
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-[#00f5a0]/40 bg-[#00f5a0]/15 text-[#00f5a0] flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              GCash ₱500 Activated
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Settings & Options Card */}
      <GlassCard className="p-2 divide-y divide-[#00e5ff]/10">
        <div
          onClick={() => setShowAccountModal(true)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <div className="text-xs font-semibold text-white">Account Information</div>
              <div className="text-[11px] text-slate-400">View ID & verified phone</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => setShowSecurityModal(true)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#00f5a0]" />
            <div>
              <div className="text-xs font-semibold text-white">Security & PIN</div>
              <div className="text-[11px] text-slate-400">6-Digit MPIN & Account Protection</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Browser Push Notifications & Background Alerts */}
        <div
          onClick={() => setIsNotificationCenterOpen(true)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Browser Push Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#00f5a0] text-[#00222b] text-[9px] font-black">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Incoming transfers & completed bills (Background Push{' '}
                {pushSettings.enabled ? 'Active' : 'Off'})
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigateTo('BUILDER_UPGRADE')}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-[#ffb300]" />
            <div>
              <div className="text-xs font-semibold text-white">Membership & Upgrade</div>
              <div className="text-[11px] text-[#ffb300]">
                {tierConfig.title} • Tap to view perks
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => setBottomTab('TRANSACTIONS')}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-[#80d8ff]" />
            <div>
              <div className="text-xs font-semibold text-white">Transaction History</div>
              <div className="text-[11px] text-slate-400">Complete statement of activity</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigateTo('REFERRALS')}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <div className="text-xs font-semibold text-white">Referral Program</div>
              <div className="text-[11px] text-slate-400">10 Levels • ₱500 Sub • ₱5,000 Builder</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Theme Preference Setting */}
        <div
          onClick={toggleTheme}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <div className="text-xs font-semibold text-white">Display Theme</div>
              <div className="text-[11px] text-slate-400">
                {theme === 'light' ? 'High-Contrast Light Theme (Active)' : 'Dark Cyberpunk Theme (Active)'}
              </div>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
            {theme === 'light' ? 'LIGHT ☀️' : 'DARK 🌙'}
          </div>
        </div>

        <div
          onClick={() => setShowHelpModal(true)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-300" />
            <div>
              <div className="text-xs font-semibold text-white">Help & Support</div>
              <div className="text-[11px] text-slate-400">24/7 DigiCash Assistance</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </GlassCard>

      {/* Logout Button */}
      <button
        onClick={() => signOut()}
        className="w-full py-3.5 rounded-2xl border border-[#ff5252]/40 text-[#ff5252] text-xs font-bold hover:bg-[#ff5252]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>

      {/* Account Info Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#091f3c] border border-[#00e5ff]/40 p-6 text-white text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Account Information</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div>
                <span className="text-slate-400 block text-[10px]">NAME</span>
                <span className="font-bold text-white text-sm">{userProfile.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DIGICASH ID</span>
                <span className="font-bold text-[#00e5ff] text-sm">{userProfile.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">REGISTERED PHONE</span>
                <span className="font-medium text-white">{userProfile.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EMAIL ADDRESS</span>
                <span className="font-medium text-white">{userProfile.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT MEMBERSHIP</span>
                <span className="font-bold text-[#00f5a0]">{tierConfig.title} Tier</span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className="text-slate-400 block text-[10px]">ACCOUNT ACTIVATION</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-[#00f5a0] text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Activated & Verified
                  </span>
                  <span className="text-[10px] bg-[#007DFE]/25 text-[#00e5ff] px-2 py-0.5 rounded-full border border-[#007DFE]/40 font-mono font-bold">
                    ₱500 Paid
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-1 font-mono">
                  GCash # <span className="text-[#00e5ff] font-bold">0999 576 0130</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Ref: {userProfile.activationPayment?.referenceNumber || 'GCASH-VERIFIED-500'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAccountModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#091f3c] border border-[#00e5ff]/40 p-6 text-white text-left">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00e5ff]" />
                <h3 className="text-base font-bold text-white">Security & PIN Settings</h3>
              </div>
              <button onClick={() => setShowSecurityModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-200 mb-6">
              {/* 6-Digit MPIN Status */}
              <div className="p-4 rounded-2xl bg-[#06172d] border border-[#00e5ff]/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">6-Digit Transaction MPIN</span>
                  <span className="text-[10px] text-[#00f5a0] font-bold bg-[#00f5a0]/15 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300">
                  Your secure MPIN is active and required for confirming fund transfers, load purchases, and bill payments.
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Current MPIN: <span className="text-[#00e5ff] font-bold tracking-widest">{mpin}</span>
                </div>
              </div>

              {/* Phone OTP Verification */}
              <div className="p-4 rounded-2xl bg-[#06172d] border border-[#00e5ff]/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">SMS OTP Verification</span>
                  <span className="text-[10px] text-[#00f5a0] font-bold bg-[#00f5a0]/15 px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Linked Phone: <span className="text-white font-medium">{userProfile.phone}</span>
                </p>
                <p className="text-[10.5px] text-slate-400">
                  One-time passcodes are automatically generated and sent to this number during secure logins.
                </p>
              </div>

              {/* Zero-Trust Architecture & Applied Public/Secret Keys */}
              <div className="p-4 rounded-2xl bg-[#06172d] border border-[#00e5ff]/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Fintech Public & Secret Keys</span>
                  <span className="text-[10px] text-[#00f5a0] font-bold bg-[#00f5a0]/15 px-2 py-0.5 rounded">
                    7/7 APPLIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  All client Public Keys and server Secret Keys (DigiCash Core, PayMongo GCash/QR Ph, Maya Bank, GoTyme InstaPay, Xendit Bank Rails, Telco Direct E-Load, and BancNet Billers) are bound and signed with HMAC-SHA256.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#091f3c] border border-[#00e5ff]/40 p-6 text-white text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">DigiCash 24/7 Support</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300 mb-6">
              <p>Need assistance with subscriptions, rewards, or transfers?</p>
              <div>Email: <span className="font-bold text-[#00e5ff]">support@digicash.ph</span></div>
              <div>Hotline: <span className="font-bold text-white">(02) 8888-DIGI</span></div>
              <div>Live Agent: <span className="font-bold text-[#00f5a0]">Available 24/7 in-app</span></div>
              <div className="p-3 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[#00f5a0] text-[11px] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Priority channel active • Estimated reply: Under 1 minute</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
