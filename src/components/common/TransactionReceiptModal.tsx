import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, Share2, X } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  onDismiss: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onDismiss,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `DigiCash Receipt\nRef: ${transaction.referenceNumber}\nAmount: ₱${transaction.amount.toFixed(2)}\nTitle: ${transaction.title}\nDate: ${transaction.date} ${transaction.time}`;
    if (navigator.share) {
      navigator.share({ title: 'DigiCash Receipt', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Receipt details copied to clipboard!');
    }
  };

  const isIncoming = transaction.direction === 'INCOMING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0a203f] border border-[#00e5ff]/40 shadow-2xl p-6 text-white text-center">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0]" />
            <span className="text-[11px] font-bold text-[#00e5ff] tracking-wider uppercase">
              DigiCash Official Receipt
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#0d2b52] text-[10px] font-bold text-[#00f5a0] tracking-wider">
            {transaction.status.toUpperCase()}
          </span>
        </div>

        {/* Glowing Checkmark Badge */}
        <div className="mx-auto my-3 w-16 h-16 rounded-full bg-gradient-to-tr from-[#88f953] via-[#00f5a0] to-[#00e5ff] flex items-center justify-center shadow-lg shadow-[#00f5a0]/30">
          <Check className="w-9 h-9 text-[#012920] stroke-[3]" />
        </div>

        <h3 className="text-xl font-bold text-white mb-0.5">Transaction Successful!</h3>
        <p className="text-xs text-slate-400">{transaction.title}</p>

        {/* Amount */}
        <div className="my-4">
          <span
            className={`text-3xl font-black tracking-tight ${
              isIncoming ? 'text-[#00f5a0]' : 'text-white'
            }`}
          >
            {isIncoming ? '+ ₱' : '₱'}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Dotted Divider */}
        <div className="border-t border-dashed border-[#00e5ff]/25 my-4" />

        {/* Transaction Reference ID with Copy Button */}
        <div
          onClick={handleCopy}
          className="w-full rounded-xl bg-[#081a33] border border-[#00e5ff]/30 p-3 mb-4 flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider">
              TRANSACTION REFERENCE ID
            </div>
            <div className="text-xs font-mono font-semibold text-[#00e5ff] mt-0.5">
              {transaction.referenceNumber}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              copied
                ? 'bg-[#00f5a0]/20 text-[#00f5a0]'
                : 'bg-[#00e5ff]/15 text-[#00e5ff] group-hover:bg-[#00e5ff]/25'
            }`}
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-2.5 text-xs text-left mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time</span>
            <span className="font-medium text-white">{transaction.date} • {transaction.time}</span>
          </div>
          {transaction.recipientOrBiller && (
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient / Biller</span>
              <span className="font-bold text-white">{transaction.recipientOrBiller}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Source</span>
            <span className="font-medium text-white">DigiCash Wallet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Service Fee</span>
            <span className="font-bold text-[#00f5a0]">
              {transaction.fee > 0 ? `₱${transaction.fee.toFixed(2)}` : 'FREE'}
            </span>
          </div>
          {transaction.breakdownNote && (
            <div className="flex justify-between text-right">
              <span className="text-slate-400">Breakdown Note</span>
              <span className="font-medium text-[#00e5ff] max-w-[65%]">{transaction.breakdownNote}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00e5ff]/60 text-[#00e5ff] font-semibold text-xs hover:bg-[#00e5ff]/10 active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={onDismiss}
            className="flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-[#88f953] via-[#00f5a0] to-[#00e5ff] text-[#01242e] font-bold text-xs hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
