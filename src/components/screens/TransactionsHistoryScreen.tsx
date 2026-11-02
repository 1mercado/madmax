import React, { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Filter, Search } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';

export const TransactionsHistoryScreen: React.FC = () => {
  const { transactions, openReceipt, navigateTo } = useDigiCash();

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    // Filter type
    if (selectedFilter === 'Incoming' && tx.direction !== 'INCOMING') return false;
    if (selectedFilter === 'Outgoing' && tx.direction !== 'OUTGOING') return false;
    if (selectedFilter === 'Commission' && tx.type !== 'REFERRAL_COMMISSION') return false;
    if (selectedFilter === 'Bills' && tx.type !== 'PAY_BILLS') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.subtitle.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.recipientOrBiller.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('MAIN')}
          className="p-2 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by recipient, reference, biller..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#081f3a] border border-[#00e5ff]/25 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Incoming', 'Outgoing', 'Commission', 'Bills'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === filter
                ? 'bg-[#00e5ff] text-[#00222b] font-bold shadow-md'
                : 'bg-[#0c2442] text-slate-300 border border-[#00e5ff]/20 hover:border-[#00e5ff]/40'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/35 text-[#00e5ff] flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Transactions Found</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4">
              Your official wallet history is currently empty. Cash in funds or make a transfer to view records here.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => navigateTo('TOP_UP')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] text-xs font-bold shadow-md hover:opacity-90"
              >
                + Cash In Funds
              </button>
              <button
                onClick={() => navigateTo('SEND_MONEY')}
                className="px-4 py-2 rounded-xl bg-[#0d2a4e] border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-bold hover:bg-[#123663]"
              >
                Send Money
              </button>
            </div>
          </GlassCard>
        ) : (
          filtered.map((tx) => (
            <GlassCard
              key={tx.id}
              onClick={() => openReceipt(tx)}
              className="p-3.5 flex items-center justify-between hover:border-[#00e5ff]"
            >
              <div className="flex items-center gap-3 truncate mr-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
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
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{tx.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {tx.subtitle} • {tx.date} {tx.time}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
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
  );
};
