import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Edit3,
  Film,
  HeartPulse,
  Info,
  Package,
  PiggyBank,
  Plus,
  RotateCcw,
  Send,
  ShoppingBag,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { BudgetCategory } from '../../types';

// Map icon names to Lucide icons
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Utensils':
      return Utensils;
    case 'Zap':
      return Zap;
    case 'Send':
      return Send;
    case 'Smartphone':
      return Smartphone;
    case 'ShoppingBag':
      return ShoppingBag;
    case 'Car':
      return Car;
    case 'Film':
      return Film;
    case 'HeartPulse':
      return HeartPulse;
    default:
      return Package;
  }
};

export const BudgetPlannerScreen: React.FC = () => {
  const {
    budgetCategories,
    updateCategoryLimit,
    logBudgetExpense,
    resetBudgetToDefaults,
    navigateTo,
  } = useDigiCash();

  // Modals state
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<BudgetCategory | null>(null);
  const [editLimitInput, setEditLimitInput] = useState<string>('');
  
  const [selectedCategoryForExpense, setSelectedCategoryForExpense] = useState<BudgetCategory | null>(null);
  const [expenseAmountInput, setExpenseAmountInput] = useState<string>('');
  const [expenseNoteInput, setExpenseNoteInput] = useState<string>('');
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState<string>('');

  const [activeFilter, setActiveFilter] = useState<'All' | 'OverBudget' | 'NearLimit'>('All');

  // Compute overall budget metrics
  const totalMonthlyLimit = budgetCategories.reduce((acc, cat) => acc + cat.monthlyLimit, 0);
  const totalSpent = budgetCategories.reduce((acc, cat) => acc + cat.spent, 0);
  const remainingTotal = totalMonthlyLimit - totalSpent;
  const overallPercentage = totalMonthlyLimit > 0 ? Math.min(100, Math.round((totalSpent / totalMonthlyLimit) * 100)) : 0;
  const isOverBudgetOverall = totalSpent > totalMonthlyLimit;

  // Calendar calculations
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const dailySafeBudget = remainingTotal > 0 ? Math.floor(remainingTotal / daysRemaining) : 0;

  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Open edit modal
  const handleOpenEdit = (cat: BudgetCategory) => {
    setSelectedCategoryForEdit(cat);
    setEditLimitInput(cat.monthlyLimit.toString());
  };

  const handleSaveEditLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryForEdit) return;
    const num = parseFloat(editLimitInput);
    if (!isNaN(num) && num >= 0) {
      updateCategoryLimit(selectedCategoryForEdit.id, num);
      setSelectedCategoryForEdit(null);
    }
  };

  // Open expense modal
  const handleOpenExpense = (cat: BudgetCategory) => {
    setSelectedCategoryForExpense(cat);
    setExpenseAmountInput('');
    setExpenseNoteInput('');
    setExpenseSuccessMsg('');
  };

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryForExpense) return;
    const amount = parseFloat(expenseAmountInput);
    if (!isNaN(amount) && amount > 0) {
      logBudgetExpense(selectedCategoryForExpense.id, amount, expenseNoteInput || selectedCategoryForExpense.name);
      setExpenseSuccessMsg(`Recorded ₱${amount.toLocaleString()} in ${selectedCategoryForExpense.name}`);
      setTimeout(() => {
        setSelectedCategoryForExpense(null);
        setExpenseSuccessMsg('');
      }, 700);
    }
  };

  // Filter categories
  const filteredCategories = budgetCategories.filter((cat) => {
    const isOver = cat.spent > cat.monthlyLimit;
    const isNear = !isOver && cat.monthlyLimit > 0 && cat.spent / cat.monthlyLimit >= 0.75;
    if (activeFilter === 'OverBudget') return isOver;
    if (activeFilter === 'NearLimit') return isNear;
    return true;
  });

  const overBudgetCount = budgetCategories.filter((c) => c.spent > c.monthlyLimit).length;
  const nearLimitCount = budgetCategories.filter((c) => c.spent <= c.monthlyLimit && c.spent / c.monthlyLimit >= 0.75).length;

  return (
    <div className="w-full space-y-4 pb-24 pt-1 max-w-4xl mx-auto">
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
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Budget Planner</span>
              <span className="text-[10px] font-bold text-[#00e5ff] uppercase bg-[#00e5ff]/15 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                MONTHLY
              </span>
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>{currentMonthName}</span>
              <span className="text-slate-500">•</span>
              <span>{daysRemaining} days left</span>
            </p>
          </div>
        </div>

        <button
          onClick={resetBudgetToDefaults}
          title="Reset to recommended defaults"
          className="p-2 rounded-xl bg-[#092244] border border-[#00e5ff]/30 text-slate-300 hover:text-[#00e5ff] hover:bg-[#0d305e] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Monthly Overview Card with Visual Progress Bar */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0c264a] via-[#081b38] to-[#040e1f] border border-[#00e5ff]/40 p-5 shadow-2xl overflow-hidden">
        {/* Glow corner ambient */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#00e5ff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#00f5a0]/12 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: Total Limit vs Status */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              Monthly Budget Progress
            </div>
            <div
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isOverBudgetOverall
                  ? 'bg-[#ff5252]/20 text-[#ff5252] border-[#ff5252]/40'
                  : overallPercentage >= 80
                  ? 'bg-[#ffb300]/20 text-[#ffb300] border-[#ffb300]/40'
                  : 'bg-[#00f5a0]/20 text-[#00f5a0] border-[#00f5a0]/40'
              }`}
            >
              {isOverBudgetOverall
                ? 'OVER BUDGET'
                : overallPercentage >= 80
                ? 'NEARING LIMIT'
                : 'ON TRACK'}
            </div>
          </div>

          {/* Primary Remaining Balance Callout */}
          <div>
            <div className="text-xs text-slate-400">Remaining Spending Allowance</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isOverBudgetOverall ? 'text-[#ff5252]' : 'text-white'
                }`}
              >
                {remainingTotal < 0 ? '-₱' : '₱'}
                {Math.abs(remainingTotal).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                left of ₱{totalMonthlyLimit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Main Visual Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Spent: <strong className="text-white">₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              <span
                className={`font-bold ${
                  isOverBudgetOverall
                    ? 'text-[#ff5252]'
                    : overallPercentage >= 80
                    ? 'text-[#ffb300]'
                    : 'text-[#00e5ff]'
                }`}
              >
                {overallPercentage}% Used
              </span>
            </div>

            {/* Visual Bar Track */}
            <div className="w-full h-3.5 bg-[#051428] rounded-full overflow-hidden p-0.5 border border-[#00e5ff]/25 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudgetOverall
                    ? 'bg-gradient-to-r from-[#ff8a80] to-[#ff5252]'
                    : overallPercentage >= 80
                    ? 'bg-gradient-to-r from-[#ffb300] to-[#ff9100]'
                    : 'bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-[#40c4ff]'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>

            {/* Threshold Milestones */}
            <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 px-0.5">
              <span>₱0</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% (₱{totalMonthlyLimit.toLocaleString()})</span>
            </div>
          </div>

          {/* Sub-metrics Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#00e5ff]/15">
            <div className="p-2.5 rounded-xl bg-[#06172d]/80 border border-[#00e5ff]/15">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-[#00f5a0]" />
                <span>Safe Daily Spending Pace</span>
              </div>
              <div className="text-sm font-bold text-[#00f5a0] mt-0.5">
                ₱{dailySafeBudget.toLocaleString()} / day
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#06172d]/80 border border-[#00e5ff]/15">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <PiggyBank className="w-3 h-3 text-[#00e5ff]" />
                <span>Categories on Track</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {budgetCategories.length - overBudgetCount} of {budgetCategories.length} categories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Action Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'All'
                ? 'bg-[#00e5ff] text-[#00222b] shadow-md'
                : 'bg-[#081f3b] text-slate-300 border border-[#00e5ff]/20 hover:border-[#00e5ff]/40'
            }`}
          >
            All Categories ({budgetCategories.length})
          </button>

          {overBudgetCount > 0 && (
            <button
              onClick={() => setActiveFilter('OverBudget')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'OverBudget'
                  ? 'bg-[#ff5252] text-white shadow-md'
                  : 'bg-[#081f3b] text-[#ff8a80] border border-[#ff5252]/30 hover:border-[#ff5252]/60'
              }`}
            >
              Over Limit ({overBudgetCount})
            </button>
          )}

          {nearLimitCount > 0 && (
            <button
              onClick={() => setActiveFilter('NearLimit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'NearLimit'
                  ? 'bg-[#ffb300] text-black shadow-md'
                  : 'bg-[#081f3b] text-[#ffb300] border border-[#ffb300]/30 hover:border-[#ffb300]/60'
              }`}
            >
              Near Limit ({nearLimitCount})
            </button>
          )}
        </div>
      </div>

      {/* Category Spending Limits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredCategories.map((cat) => {
          const Icon = getCategoryIcon(cat.iconName);
          const percent = cat.monthlyLimit > 0 ? Math.min(100, Math.round((cat.spent / cat.monthlyLimit) * 100)) : 0;
          const remainingCatBalance = cat.monthlyLimit - cat.spent;
          const isOver = cat.spent > cat.monthlyLimit;
          const isNear = !isOver && percent >= 75;

          return (
            <GlassCard key={cat.id} className="p-4 space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${cat.color}22`,
                      borderColor: `${cat.color}55`,
                      color: cat.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                    <div className="text-[11px] text-slate-300">
                      Limit: <span className="font-semibold text-white">₱{cat.monthlyLimit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Remaining Balance Indicator */}
                <div className="text-right">
                  <div
                    className={`text-xs font-black ${
                      isOver ? 'text-[#ff5252]' : isNear ? 'text-[#ffb300]' : 'text-[#00f5a0]'
                    }`}
                  >
                    {remainingCatBalance < 0 ? '-₱' : '₱'}
                    {Math.abs(remainingCatBalance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isOver ? 'over limit' : 'remaining'}
                  </div>
                </div>
              </div>

              {/* Category Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">
                    Spent: <span className="text-white font-medium">₱{cat.spent.toLocaleString()}</span>
                  </span>
                  <span
                    className={`font-bold ${
                      isOver ? 'text-[#ff5252]' : isNear ? 'text-[#ffb300]' : 'text-slate-300'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Visual Bar */}
                <div className="w-full h-2.5 bg-[#06172d] rounded-full overflow-hidden border border-[#00e5ff]/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-gradient-to-r from-[#ff8a80] to-[#ff5252]'
                        : isNear
                        ? 'bg-gradient-to-r from-[#ffb300] to-[#ff9100]'
                        : 'bg-gradient-to-r from-[#00f5a0] to-[#00e5ff]'
                    }`}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isOver ? undefined : isNear ? undefined : cat.color,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons for Category: Adjust Limit & Log Expense */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#00e5ff]/10">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#092244] border border-[#00e5ff]/25 text-[#00e5ff] text-xs font-semibold hover:bg-[#0c2d58] transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Set Limit</span>
                </button>

                <button
                  onClick={() => handleOpenExpense(cat)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#00f5a0]/15 border border-[#00f5a0]/30 text-[#00f5a0] text-xs font-semibold hover:bg-[#00f5a0]/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Spend</span>
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Financial Health Advice Card */}
      <GlassCard className="p-4 flex items-start gap-3 border-[#00e5ff]/30">
        <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/15 flex items-center justify-center text-[#00e5ff] shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-slate-300">
          <span className="font-bold text-white block">Auto-Sync with DigiCash Transactions</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Bill payments, Send Money transfers, and Mobile Load purchases automatically increment category spending and adjust remaining balances in real time.
          </p>
        </div>
      </GlassCard>

      {/* Modal: Set Monthly Spending Limit */}
      {selectedCategoryForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#091f3c] border border-[#00e5ff]/50 p-6 text-white text-left shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#00e5ff]" />
                <h3 className="text-base font-bold text-white">Set Monthly Limit</h3>
              </div>
              <button
                onClick={() => setSelectedCategoryForEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Category: <strong className="text-[#00e5ff]">{selectedCategoryForEdit.name}</strong>
              <br />
              Current Spent: <strong className="text-white">₱{selectedCategoryForEdit.spent.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleSaveEditLimit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  MONTHLY SPENDING LIMIT (PHP)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editLimitInput}
                    onChange={(e) => setEditLimitInput(e.target.value)}
                    required
                    placeholder="Enter limit e.g. 5000"
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#06172d] border border-[#00e5ff]/30 text-white font-bold text-base focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1000, 3000, 5000, 8000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditLimitInput(preset.toString())}
                    className="px-2.5 py-1 rounded-lg bg-[#0c274d] text-xs font-semibold text-slate-200 border border-[#00e5ff]/20 hover:border-[#00e5ff]"
                  >
                    ₱{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryForEdit(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#00e5ff] text-[#00222b] text-xs font-black shadow-lg shadow-[#00e5ff]/25 hover:opacity-90"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Manual Spend in Category */}
      {selectedCategoryForExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#091f3c] border border-[#00f5a0]/50 p-6 text-white text-left shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00f5a0]" />
                <h3 className="text-base font-bold text-white">Log Category Spend</h3>
              </div>
              <button
                onClick={() => setSelectedCategoryForExpense(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Target Category: <strong className="text-[#00f5a0]">{selectedCategoryForExpense.name}</strong>
            </p>

            {expenseSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-[#00f5a0]/15 border border-[#00f5a0]/40 text-[#00f5a0] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{expenseSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleLogExpense} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    AMOUNT SPENT (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={expenseAmountInput}
                      onChange={(e) => setExpenseAmountInput(e.target.value)}
                      required
                      placeholder="e.g. 250"
                      className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#06172d] border border-[#00f5a0]/30 text-white font-bold text-base focus:outline-none focus:border-[#00f5a0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    NOTE / DESCRIPTION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={expenseNoteInput}
                    onChange={(e) => setExpenseNoteInput(e.target.value)}
                    placeholder="e.g. Lunch meal, gas top up"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#06172d] border border-[#00f5a0]/30 text-white text-xs focus:outline-none focus:border-[#00f5a0]"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[100, 250, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExpenseAmountInput(preset.toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#0c274d] text-xs font-semibold text-slate-200 border border-[#00f5a0]/20 hover:border-[#00f5a0]"
                    >
                      +₱{preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryForExpense(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-[#00f5a0] text-[#00222b] text-xs font-black shadow-lg shadow-[#00f5a0]/25 hover:opacity-90"
                  >
                    Confirm Spend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
