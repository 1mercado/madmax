import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  Grid,
  Lock,
  Moon,
  PiggyBank,
  Plus,
  QrCode,
  Receipt,
  Rocket,
  Send,
  Sliders,
  Sparkles,
  Smartphone,
  Star,
  Sun,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { DigiCashLogo } from '../common/DigiCashLogo';
import { GlassCard } from '../common/GlassCard';
import { USER_TIERS } from '../../data/mockData';
import { Transaction } from '../../types';

export const HomeScreen: React.FC = () => {
  const {
    userProfile,
    transactions,
    savingsGoals,
    budgetCategories,
    cashIn,
    navigateTo,
    setBottomTab,
    openReceipt,
    theme,
    toggleTheme,
    unreadNotificationCount,
    setIsNotificationCenterOpen,
    pushSettings,
  } = useDigiCash();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedActivityFilter, setSelectedActivityFilter] = useState('All');
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [customCashInAmount, setCustomCashInAmount] = useState('1000');
  const [selectedCashInChannel, setSelectedCashInChannel] = useState('BPI Direct Online');

  const currentTierConfig = USER_TIERS[userProfile.tier] || USER_TIERS.BASIC;

  // Filter activities
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedActivityFilter === 'Inflow') return tx.direction === 'INCOMING';
    if (selectedActivityFilter === 'Outflow') return tx.direction === 'OUTGOING';
    if (selectedActivityFilter === 'Commissions') return tx.type === 'REFERRAL_COMMISSION';
    if (selectedActivityFilter === 'Bills') return tx.type === 'PAY_BILLS';
    return true;
  });

  // Calculate stats
  const totalInflow = transactions
    .filter((tx) => tx.direction === 'INCOMING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutflow = transactions
    .filter((tx) => tx.direction === 'OUTGOING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavings = savingsGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const topGoal = savingsGoals.length > 0
    ? savingsGoals.reduce((prev, curr) =>
        curr.currentAmount / curr.targetAmount > (prev ? prev.currentAmount / prev.targetAmount : 0)
          ? curr
          : prev,
        savingsGoals[0]
      )
    : null;

  const totalBudgetLimit = budgetCategories.reduce((acc, c) => acc + c.monthlyLimit, 0);
  const totalBudgetSpent = budgetCategories.reduce((acc, c) => acc + c.spent, 0);
  const remainingBudget = totalBudgetLimit - totalBudgetSpent;
  const budgetPercentUsed = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100)) : 0;

  return (
    <div className="w-full space-y-5 pb-24 pt-2">
      {/* 1. Header with Brand, Greeting, and 3D Globe Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DigiCashLogo size={42} showGlow={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold text-base">Digi</span>
              <span className="text-[#00f5a0] font-extrabold text-base">Cash</span>
              <span className="text-[9px] font-bold text-[#00e5ff] tracking-widest uppercase bg-[#00e5ff]/15 px-1.5 py-0.5 rounded">
                WORLDWIDE
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center flex-wrap gap-1">
              <span>Good day, <span className="text-white font-semibold">{userProfile.name}</span>!</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-[#00f5a0] font-bold bg-[#00f5a0]/15 px-1.5 py-0.5 rounded-full border border-[#00f5a0]/30">
                ✓ ₱500 GCash Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Browser Push Notification Center Bell */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className={`relative p-2 rounded-full border transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                : 'bg-[#0f2647] border-[#00e5ff]/35 text-[#00e5ff] hover:bg-[#143460]'
            }`}
            title="Browser Push Notifications & Background Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#00f5a0] text-[#00222b] text-[9px] font-black flex items-center justify-center shadow">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
            {pushSettings.enabled && unreadNotificationCount === 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00f5a0]" />
            )}
          </button>

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                : 'bg-[#0f2647] border-[#00e5ff]/30 text-amber-300 hover:bg-[#143460]'
            }`}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to High-Contrast Light Theme'}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* User Tier Avatar */}
          <div
            onClick={() => setBottomTab('PROFILE')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0f2647] border border-[#00e5ff]/30 cursor-pointer hover:bg-[#143460] transition-colors"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-black"
              style={{ backgroundColor: currentTierConfig.badgeColor }}
            >
              {userProfile.name.charAt(0)}
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTierConfig.badgeColor }}
            >
              {currentTierConfig.title}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Wallet & Tier Status Dashboard Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f2b52] to-[#081830] border border-[#00e5ff]/40 shadow-2xl p-5 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#00e5ff]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Wallet Balance</span>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="text-[#00e5ff] hover:text-white"
            >
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Tier Status Badge */}
          <div
            onClick={() => navigateTo('BUILDER_UPGRADE')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all border"
            style={{
              backgroundColor: `${currentTierConfig.badgeColor}22`,
              borderColor: `${currentTierConfig.badgeColor}66`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTierConfig.badgeColor }}
            />
            <span
              className="text-[11px] font-black uppercase tracking-wider"
              style={{ color: currentTierConfig.badgeColor }}
            >
              {currentTierConfig.title}
            </span>
            {userProfile.tier === 'BASIC' && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#ffb300] text-black">
                UPGRADE
              </span>
            )}
          </div>
        </div>

        {/* Amount with Quick Cash In */}
        <div className="flex items-center justify-between my-2">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isBalanceHidden ? '••••••••' : `₱${userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <button
            onClick={() => setShowCashInModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] text-xs font-black shadow-lg shadow-[#00e5ff]/20 hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Cash In</span>
          </button>
        </div>

        {/* Tier Perks Ribbon */}
        <div
          onClick={() => navigateTo('BUILDER_UPGRADE')}
          className="w-full px-3 py-2 rounded-xl bg-[#071c38] border border-[#00e5ff]/20 flex items-center justify-between cursor-pointer hover:border-[#00e5ff]/60 transition-colors my-3"
        >
          <div className="flex items-center gap-2 text-xs truncate mr-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00f5a0] shrink-0" />
            <span className="text-slate-200 truncate text-[11px]">
              {userProfile.tier === 'BASIC'
                ? 'Levels 1–3 Active • Upgrade to Builder Subscriber to unlock Levels 4–10'
                : 'Builder Subscriber Active • All 10 Levels Unlocked'}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        <div className="border-t border-[#00e5ff]/20 my-3" />

        {/* Today's Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-left">
          <div>
            <div className="text-[10px] text-slate-400">Today's Inflow</div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#00f5a0] mt-0.5">
              <ArrowDown className="w-3 h-3" />
              <span>+₱{totalInflow.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Today's Outflow</div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#ff8a80] mt-0.5">
              <ArrowUp className="w-3 h-3" />
              <span>-₱{totalOutflow.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Referral Total</div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#ffb300] mt-0.5">
              <Star className="w-3 h-3" />
              <span>₱{userProfile.totalEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00e5ff]/20 to-[#00f5a0]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                Quick Actions
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold tracking-wide text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/25">
            One-Tap Shortcuts
          </span>
        </div>

        {/* Primary Featured Shortcuts: Send Money, Load, QR Pay */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Send Money */}
          <button
            onClick={() => navigateTo('SEND_MONEY')}
            className="group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-b from-[#0a274c]/90 to-[#071a35]/90 border border-[#00e5ff]/35 hover:border-[#00e5ff] transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-lg shadow-[#00e5ff]/5"
          >
            <div className="absolute top-0 right-0 w-14 h-14 bg-[#00e5ff]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#00e5ff]/20 transition-colors" />
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/50 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform shadow-sm shadow-[#00e5ff]/30">
                <Send className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-[#00e5ff]/20 text-[#00e5ff] px-1.5 py-0.5 rounded">
                Send
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors leading-tight">
                Send Money
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Bank & e-wallets</div>
            </div>
          </button>

          {/* Load */}
          <button
            onClick={() => navigateTo('TOP_UP')}
            className="group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-b from-[#0a274c]/90 to-[#071a35]/90 border border-[#40c4ff]/35 hover:border-[#40c4ff] transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-lg shadow-[#40c4ff]/5"
          >
            <div className="absolute top-0 right-0 w-14 h-14 bg-[#40c4ff]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#40c4ff]/20 transition-colors" />
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#40c4ff]/20 border border-[#40c4ff]/50 flex items-center justify-center text-[#40c4ff] group-hover:scale-110 transition-transform shadow-sm shadow-[#40c4ff]/30">
                <Smartphone className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-[#40c4ff]/20 text-[#40c4ff] px-1.5 py-0.5 rounded">
                Load
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#40c4ff] transition-colors leading-tight">
                Buy Load
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Smart • Globe • DITO • TNT</div>
            </div>
          </button>

          {/* QR Pay */}
          <button
            onClick={() => navigateTo('QR_SCANNER')}
            className="group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-b from-[#0a2e38]/90 to-[#071e28]/90 border border-[#00f5a0]/40 hover:border-[#00f5a0] transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-lg shadow-[#00f5a0]/10"
          >
            <div className="absolute top-0 right-0 w-14 h-14 bg-[#00f5a0]/15 rounded-full blur-xl pointer-events-none group-hover:bg-[#00f5a0]/25 transition-colors" />
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f5a0] to-[#00e5ff] flex items-center justify-center text-[#00222b] group-hover:scale-110 transition-transform shadow-md shadow-[#00f5a0]/30 font-bold">
                <QrCode className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-[#00f5a0]/20 text-[#00f5a0] px-1.5 py-0.5 rounded">
                QR Ph
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#00f5a0] transition-colors leading-tight">
                QR Pay
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Scan to pay 0% fee</div>
            </div>
          </button>
        </div>

        {/* Secondary Quick Action Row */}
        <div className="grid grid-cols-4 gap-2 pt-0.5">
          <button
            onClick={() => navigateTo('PAY_BILLS')}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#092244]/60 border border-[#b06ab3]/25 hover:border-[#b06ab3]/60 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#b06ab3]/20 flex items-center justify-center text-[#d69ee6] group-hover:scale-105 transition-transform flex-shrink-0">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">Pay Bills</div>
              <div className="text-[9px] text-slate-400 truncate">Utilities</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('RECEIVE_MONEY')}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#092244]/60 border border-[#80d8ff]/25 hover:border-[#80d8ff]/60 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#80d8ff]/20 flex items-center justify-center text-[#80d8ff] group-hover:scale-105 transition-transform flex-shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">Receive</div>
              <div className="text-[9px] text-slate-400 truncate">My QR</div>
            </div>
          </button>

          <button
            onClick={() => setShowCashInModal(true)}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#092244]/60 border border-[#00e5ff]/25 hover:border-[#00e5ff]/60 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] group-hover:scale-105 transition-transform flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">Cash In</div>
              <div className="text-[9px] text-slate-400 truncate">Add funds</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('REWARDS')}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#092244]/60 border border-[#ffb300]/25 hover:border-[#ffb300]/60 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#ffb300]/20 flex items-center justify-center text-[#ffb300] group-hover:scale-105 transition-transform flex-shrink-0">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">Rewards</div>
              <div className="text-[9px] text-slate-400 truncate">Earn 60%</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Scan to Pay with QR Ph Banner */}
      <div
        onClick={() => navigateTo('QR_SCANNER')}
        className="rounded-2xl bg-gradient-to-r from-[#092547] to-[#0d3460] border border-[#00f5a0]/30 p-3.5 flex items-center justify-between cursor-pointer hover:border-[#00f5a0] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f5a0] to-[#00e5ff] flex items-center justify-center text-[#00222b]">
            <QrCode className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Scan to Pay with QR Ph</span>
              <span className="text-[9px] font-extrabold bg-[#00f5a0]/20 text-[#00f5a0] px-1.5 py-0.5 rounded">
                0% FEE
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Pay merchants & transfer to any Philippine bank or e-wallet
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
      </div>

      {/* 5. Quick Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-white">Quick Services</h3>
          <button
            onClick={() => setBottomTab('SERVICES')}
            className="text-xs text-[#00e5ff] font-semibold hover:underline"
          >
            All Services
          </button>
        </div>

        <GlassCard className="p-4">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            <button
              onClick={() => navigateTo('TOP_UP')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 flex items-center justify-center text-[#00e5ff] group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Load</span>
            </button>

            <button
              onClick={() => navigateTo('PAY_BILLS')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#b06ab3]/15 border border-[#b06ab3]/35 flex items-center justify-center text-[#b06ab3] group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Bills</span>
            </button>

            <button
              onClick={() => navigateTo('REWARDS')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ffb300]/15 border border-[#ffb300]/35 flex items-center justify-center text-[#ffb300] group-hover:scale-105 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Rewards</span>
            </button>

            <button
              onClick={() => navigateTo('REFERRALS')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00f5a0]/15 border border-[#00f5a0]/35 flex items-center justify-center text-[#00f5a0] group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Referrals</span>
            </button>

            <button
              onClick={() => navigateTo('BUILDER_UPGRADE')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 flex items-center justify-center text-[#00e5ff] group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Builder</span>
            </button>

            <button
              onClick={() => navigateTo('VIP_TIERS')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ffb300]/15 border border-[#ffb300]/35 flex items-center justify-center text-[#ffb300] group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">VIP Club</span>
            </button>

            <button
              onClick={() => navigateTo('SAVINGS_VAULT')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00f5a0]/15 border border-[#00f5a0]/35 flex items-center justify-center text-[#00f5a0] group-hover:scale-105 transition-transform">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">Savings</span>
            </button>

            <button
              onClick={() => setBottomTab('SERVICES')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-white">More</span>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 6. Budget Planner & Savings Vault (Side-by-side on wide/full screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget Planner Card with Remaining Balance Progress Bar */}
        <GlassCard
          onClick={() => navigateTo('BUDGET_PLANNER')}
          className="p-4 border-[#00e5ff]/35 hover:border-[#00e5ff] cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Budget Planner</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        remainingBudget < 0
                          ? 'bg-[#ff5252]/20 text-[#ff5252]'
                          : budgetPercentUsed >= 80
                          ? 'bg-[#ffb300]/20 text-[#ffb300]'
                          : 'bg-[#00f5a0]/20 text-[#00f5a0]'
                      }`}
                    >
                      {remainingBudget < 0 ? 'OVER LIMIT' : `${budgetPercentUsed}% SPENT`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {remainingBudget < 0 ? '-₱' : '₱'}
                    {Math.abs(remainingBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining of ₱{totalBudgetLimit.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00e5ff] flex items-center gap-0.5">
                Plan Limits <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="rounded-xl bg-[#071930] p-2.5 mt-1 border border-[#00e5ff]/15">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-300">Spent: ₱{totalBudgetSpent.toLocaleString()}</span>
                <span
                  className={`font-bold ${
                    remainingBudget < 0
                      ? 'text-[#ff5252]'
                      : budgetPercentUsed >= 80
                      ? 'text-[#ffb300]'
                      : 'text-[#00e5ff]'
                  }`}
                >
                  {remainingBudget < 0 ? 'Over Limit' : `₱${remainingBudget.toLocaleString()} left`}
                </span>
              </div>
              <div className="w-full h-2 bg-[#0c233f] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    remainingBudget < 0
                      ? 'bg-gradient-to-r from-[#ff8a80] to-[#ff5252]'
                      : budgetPercentUsed >= 80
                      ? 'bg-gradient-to-r from-[#ffb300] to-[#ff9100]'
                      : 'bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-[#40c4ff]'
                  }`}
                  style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Savings Vault Card (High-Yield 6.0% P.A.) */}
        <GlassCard
          onClick={() => navigateTo('SAVINGS_VAULT')}
          className="p-4 border-[#00f5a0]/30 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0]">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Savings Vault</span>
                    <span className="text-[9px] font-black bg-[#00f5a0]/20 text-[#00f5a0] px-1.5 py-0.5 rounded">
                      6.0% P.A.
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Total Saved: ₱{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00e5ff] flex items-center gap-0.5">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Top Goal Preview */}
            {topGoal ? (
              <div className="rounded-xl bg-[#071930] p-2.5 mt-2">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-white font-medium">{topGoal.title}</span>
                  <span className="text-[#00e5ff] font-bold">
                    {Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100)}% (₱{topGoal.currentAmount.toLocaleString()} / ₱{topGoal.targetAmount.toLocaleString()})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#0f2642] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] rounded-full"
                    style={{ width: `${Math.min(100, Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#071930] p-2.5 mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">No active goals yet</span>
                <span className="text-[#00f5a0] font-bold">+ Create First Goal</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 7. Builder Pack Upgrade Promotional Banner */}
      <div
        onClick={() => navigateTo('BUILDER_UPGRADE')}
        className="rounded-2xl bg-gradient-to-r from-[#092142] to-[#0e2a52] border border-[#00e5ff]/50 p-4 cursor-pointer hover:border-[#00e5ff] transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#00e5ff] tracking-wider uppercase">
              BUILDER PACK ₱5,000
            </span>
            <span className="text-[9px] font-bold bg-[#00f5a0]/20 text-[#00f5a0] px-1.5 py-0.5 rounded">
              40% REBATE
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xs">
            Unlock Levels 4 to 10 Unilevel commissions + instant ₱2,000 wallet cashback!
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#00e5ff] flex items-center justify-center text-[#00222b] shrink-0 ml-2">
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      </div>

      {/* 8. Recent Financial Activities Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Activities</h3>
            <span className="text-[11px] text-slate-400">
              {filteredTransactions.length} transactions recorded
            </span>
          </div>
          <button
            onClick={() => setBottomTab('TRANSACTIONS')}
            className="text-xs font-bold text-[#00e5ff] flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
          {['All', 'Inflow', 'Outflow', 'Commissions', 'Bills'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedActivityFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedActivityFilter === filter
                  ? 'bg-[#00e5ff] text-[#00222b] font-bold'
                  : 'bg-[#0c2442] text-slate-300 border border-[#00e5ff]/20 hover:border-[#00e5ff]/40'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Transaction Cards */}
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 text-[#00e5ff] flex items-center justify-center mx-auto mb-2.5">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">No Transactions Recorded Yet</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4">
                Your verified DigiCash wallet is clean and ready. Add funds to send money, buy load, or pay utilities.
              </p>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  onClick={() => setShowCashInModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                >
                  + Cash In Funds
                </button>
                <button
                  onClick={() => navigateTo('RECEIVE_MONEY')}
                  className="px-4 py-2 rounded-xl bg-[#082245] border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-bold hover:bg-[#0c3160] transition-colors"
                >
                  Receive QR
                </button>
              </div>
            </GlassCard>
          ) : (
            filteredTransactions.slice(0, 5).map((tx) => (
              <GlassCard
                key={tx.id}
                onClick={() => openReceipt(tx)}
                className="p-3.5 flex items-center justify-between hover:border-[#00e5ff]/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.direction === 'INCOMING'
                        ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                        : 'bg-[#00e5ff]/15 text-[#00e5ff]'
                    }`}
                  >
                    {tx.direction === 'INCOMING' ? (
                      <ArrowDown className="w-5 h-5" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{tx.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {tx.subtitle} • {tx.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold ${
                      tx.direction === 'INCOMING' ? 'text-[#00f5a0]' : 'text-white'
                    }`}
                  >
                    {tx.direction === 'INCOMING' ? '+ ₱' : '- ₱'}
                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[#00f5a0] font-medium">{tx.status}</div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* ===================== QUICK CASH IN MODAL ===================== */}
      {showCashInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081f3c] border border-[#00e5ff]/50 p-6 text-white text-left shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Cash In to DigiCash</h3>
              </div>
              <button
                onClick={() => setShowCashInModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Instantly credit your wallet using verified Philippine banking partners or e-wallets.
            </p>

            {/* Preset Amounts */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Amount
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['500', '1000', '5000', '10000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomCashInAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      customCashInAmount === amt
                        ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
                        : 'bg-[#091f3a] text-white border-[#00e5ff]/30 hover:border-[#00e5ff]'
                    }`}
                  >
                    ₱{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  ₱
                </span>
                <input
                  type="number"
                  value={customCashInAmount}
                  onChange={(e) => setCustomCashInAmount(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#06152b] border border-[#00e5ff]/30 text-white text-xs font-bold focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
            </div>

            {/* Channels */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Deposit Channel
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {[
                  { name: 'BPI Direct Online', fee: 'Free' },
                  { name: 'BDO Unibank Online', fee: 'Free' },
                  { name: 'UnionBank of the Philippines', fee: 'Free' },
                  { name: 'GCash Express', fee: 'Free' },
                  { name: 'Maya Account Link', fee: 'Free' },
                  { name: '7-Eleven CLiQQ Barcode', fee: 'Free' },
                ].map((channel) => (
                  <div
                    key={channel.name}
                    onClick={() => setSelectedCashInChannel(channel.name)}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      selectedCashInChannel === channel.name
                        ? 'bg-[#00f5a0]/15 border-[#00f5a0] text-white font-bold'
                        : 'bg-[#091f3a] border-white/5 text-slate-300 hover:border-[#00e5ff]/30'
                    }`}
                  >
                    <span>{channel.name}</span>
                    <span className="text-[10px] text-[#00f5a0] font-bold">{channel.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                const amt = parseFloat(customCashInAmount);
                if (isNaN(amt) || amt <= 0) return;
                cashIn(amt, selectedCashInChannel);
                setShowCashInModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] font-bold text-sm shadow-lg hover:opacity-95"
            >
              Confirm Cash In of ₱{parseFloat(customCashInAmount || '0').toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
