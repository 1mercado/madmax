import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Laptop, PiggyBank, Plane, Plus, ShieldCheck, TrendingUp, X } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { SavingsGoal } from '../../types';

export const SavingsVaultScreen: React.FC = () => {
  const {
    userProfile,
    savingsGoals,
    createSavingsGoal,
    depositToGoal,
    withdrawFromGoal,
    navigateTo,
  } = useDigiCash();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [activeWithdrawGoal, setActiveWithdrawGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SavingsGoal['category']>('General');
  const [newTarget, setNewTarget] = useState('10000');
  const [newInitial, setNewInitial] = useState('1000');
  const [createError, setCreateError] = useState<string | null>(null);

  const [actionAmount, setActionAmount] = useState('500');
  const [actionError, setActionError] = useState<string | null>(null);

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const dailyInterest = (totalSaved * 0.06) / 365;

  const getCategoryIcon = (cat: SavingsGoal['category']) => {
    switch (cat) {
      case 'Emergency': return <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />;
      case 'Investment': return <TrendingUp className="w-4 h-4 text-[#00f5a0]" />;
      case 'Travel': return <Plane className="w-4 h-4 text-[#ffb300]" />;
      case 'Gadget': return <Laptop className="w-4 h-4 text-[#b06ab3]" />;
      default: return <PiggyBank className="w-4 h-4 text-[#00e5ff]" />;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const target = parseFloat(newTarget);
    const initial = parseFloat(newInitial) || 0;
    if (!newTitle.trim()) {
      setCreateError('Please enter a goal title.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setCreateError('Enter a valid target amount.');
      return;
    }
    if (initial > userProfile.balance) {
      setCreateError('Initial deposit exceeds your wallet balance.');
      return;
    }

    const res = createSavingsGoal(newTitle, newCategory, target, initial);
    if (!res.success) {
      setCreateError(res.error || 'Failed to create goal.');
    } else {
      setShowCreateModal(false);
      setNewTitle('');
    }
  };

  const handleDeposit = () => {
    if (!activeDepositGoal) return;
    setActionError(null);
    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Enter a valid deposit amount.');
      return;
    }
    if (amt > userProfile.balance) {
      setActionError('Insufficient wallet balance.');
      return;
    }
    const res = depositToGoal(activeDepositGoal.id, amt);
    if (!res.success) {
      setActionError(res.error || 'Deposit failed.');
    } else {
      setActiveDepositGoal(null);
    }
  };

  const handleWithdraw = () => {
    if (!activeWithdrawGoal) return;
    setActionError(null);
    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Enter a valid withdrawal amount.');
      return;
    }
    if (amt > activeWithdrawGoal.currentAmount) {
      setActionError('Amount exceeds goal balance.');
      return;
    }
    const res = withdrawFromGoal(activeWithdrawGoal.id, amt);
    if (!res.success) {
      setActionError(res.error || 'Withdrawal failed.');
    } else {
      setActiveWithdrawGoal(null);
    }
  };

  return (
    <div className="w-full space-y-5 pb-24 pt-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('MAIN')}
            className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Savings Vault</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#00f5a0]/15 border border-[#00f5a0]/50 text-xs font-black text-[#00f5a0]">
          6.0% P.A.
        </span>
      </div>

      {/* Total Vault Savings Overview */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0f2c54] to-[#081830] border border-[#00e5ff]/40 p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-300">Total Vault Savings</span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00f5a0]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+₱{dailyInterest.toFixed(2)} / day</span>
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight my-2">
          ₱{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {/* Overall Completion Bar */}
        <div className="space-y-1.5 my-3">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Overall Goal Completion</span>
            <span className="font-bold text-[#00e5ff]">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0f2b4d] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
          <div className="flex items-center justify-center px-3 rounded-xl bg-[#0d2545] border border-[#00e5ff]/20 text-xs text-slate-300">
            Wallet: ₱{userProfile.balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Goals List Header */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="text-sm font-bold text-white">Your Specific Goals ({savingsGoals.length})</h3>
        <span className="text-xs text-slate-400">Tap to manage</span>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {savingsGoals.length === 0 ? (
          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 text-[#00e5ff] flex items-center justify-center mx-auto mb-2.5">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Active Goals Yet</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4">
              Set up an Emergency Fund, Travel, Gadget, or Investment goal to earn 6.0% p.a. daily interest.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] text-xs font-bold shadow-md hover:opacity-90"
            >
              + Create First Savings Goal
            </button>
          </GlassCard>
        ) : (
          savingsGoals.map((goal) => {
            const progressPct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isReached = goal.currentAmount >= goal.targetAmount;
            return (
              <GlassCard key={goal.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                    <p className="text-[11px] text-slate-400">{goal.category} • 6.0% p.a.</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isReached ? 'bg-[#00f5a0]/20 text-[#00f5a0]' : 'bg-[#00e5ff]/15 text-[#00e5ff]'
                  }`}
                >
                  {isReached ? 'REACHED 🎉' : `${progressPct}%`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-[#071930] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: goal.colorHex || '#00e5ff',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-300 pt-0.5">
                  <span className="font-bold text-white">₱{goal.currentAmount.toLocaleString()}</span>
                  <span>Target: ₱{goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveWithdrawGoal(goal);
                    setActionAmount(goal.currentAmount.toString());
                    setActionError(null);
                  }}
                  className="py-1.5 rounded-lg border border-[#00e5ff]/30 text-white text-xs font-medium hover:bg-white/5"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => {
                    setActiveDepositGoal(goal);
                    setActionAmount('500');
                    setActionError(null);
                  }}
                  className="py-1.5 rounded-lg bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0]"
                >
                  Deposit
                </button>
              </div>
            </GlassCard>
          );
        }))}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081c38] border border-[#00e5ff]/40 p-6 text-white text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-[#00e5ff]" />
                <span>Create Savings Goal</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="e.g. New Laptop, Japan Trip"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Amount (₱)
                </label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Initial Deposit (₱) (Optional)
                </label>
                <input
                  type="number"
                  value={newInitial}
                  onChange={(e) => setNewInitial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Emergency', 'Investment', 'Travel', 'Gadget', 'General'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        newCategory === cat
                          ? 'bg-[#00e5ff] text-[#00222b]'
                          : 'bg-[#0f2e54] text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {createError && <p className="text-xs text-[#ff5252] font-semibold">{createError}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0]"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081c38] border border-[#00e5ff]/40 p-6 text-white text-left">
            <h3 className="text-base font-bold text-white mb-2">
              Deposit to {activeDepositGoal.title}
            </h3>
            <p className="text-xs text-[#00e5ff] mb-4">
              Wallet Balance: ₱{userProfile.balance.toLocaleString()}
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="number"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white font-bold text-sm"
                placeholder="Amount (₱)"
              />
              {actionError && <p className="text-xs text-[#ff5252]">{actionError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0]"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeWithdrawGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081c38] border border-[#00e5ff]/40 p-6 text-white text-left">
            <h3 className="text-base font-bold text-white mb-2">
              Withdraw from {activeWithdrawGoal.title}
            </h3>
            <p className="text-xs text-[#00f5a0] mb-4">
              Saved in Goal: ₱{activeWithdrawGoal.currentAmount.toLocaleString()}
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="number"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white font-bold text-sm"
                placeholder="Amount (₱)"
              />
              {actionError && <p className="text-xs text-[#ff5252]">{actionError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveWithdrawGoal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-2.5 rounded-xl bg-[#00f5a0] text-[#00222b] text-xs font-bold hover:bg-[#00e5ff]"
              >
                Withdraw to Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
