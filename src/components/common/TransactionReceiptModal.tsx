import React, { useState } from 'react';
import { CheckCircle2, Copy, Share2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../../types';
import { LottieSuccessAnimation } from './LottieSuccessAnimation';

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isIncoming = transaction.direction === 'INCOMING';

  const getHeaderLabel = () => {
    switch (transaction.type) {
      case 'SEND_MONEY':
        return 'Funds Transferred!';
      case 'RECEIVE_MONEY':
        return 'Funds Received!';
      case 'PAY_BILLS':
        return 'Bill Payment Complete!';
      case 'TOP_UP_LOAD':
        return 'Load Top-Up Delivered!';
      case 'VAULT_DEPOSIT':
      case 'VAULT_WITHDRAW':
        return 'Vault Transfer Complete!';
      case 'REFERRAL_COMMISSION':
      case 'SUBSCRIPTION_REBATE':
        return 'Reward Credited!';
      default:
        return 'Transaction Successful!';
    }
  };

  const animationVariant = isIncoming
    ? 'incoming'
    : transaction.type === 'SEND_MONEY'
    ? 'transfer'
    : 'payment';

  return (
    <AnimatePresence>
      <motion.div
        key={transaction.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0a203f] border border-[#00e5ff]/40 shadow-2xl p-6 text-white text-center overflow-hidden"
        >
          {/* Subtle Top Ambient Shimmer */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-36 bg-[#00f5a0]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Tag */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0] animate-pulse" />
              <span className="text-[11px] font-bold text-[#00e5ff] tracking-wider uppercase">
                DigiCash Official Receipt
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#0d2b52] border border-[#00f5a0]/30 text-[10px] font-bold text-[#00f5a0] tracking-wider">
              {transaction.status.toUpperCase()}
            </span>
          </div>

          {/* Lottie-Style Vector Success Animation */}
          <div className="my-2">
            <LottieSuccessAnimation size={88} variant={animationVariant} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.32 }}
          >
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/25 text-[#00f5a0] text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Instant Ledger Verified</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-0.5">{getHeaderLabel()}</h3>
            <p className="text-xs text-slate-400">{transaction.title}</p>
          </motion.div>

          {/* Animated Amount Reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 20 }}
            className="my-4"
          >
            <span
              className={`text-3xl font-black tracking-tight ${
                isIncoming ? 'text-[#00f5a0]' : 'text-white'
              }`}
            >
              {isIncoming ? '+ ₱' : '₱'}
              {transaction.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </motion.div>

          {/* Dotted Divider */}
          <div className="border-t border-dashed border-[#00e5ff]/25 my-4" />

          {/* Transaction Reference ID with Copy Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.3 }}
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
          </motion.div>

          {/* Breakdown Details */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.3 }}
            className="space-y-2.5 text-xs text-left mb-6"
          >
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-medium text-white">
                {transaction.date} • {transaction.time}
              </span>
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
            {transaction.gatewayProvider && (
              <div className="flex justify-between">
                <span className="text-slate-400">Clearing Gateway</span>
                <span className="font-bold text-[#00f5a0] text-right max-w-[65%] truncate">
                  {transaction.gatewayProvider}
                </span>
              </div>
            )}
            {transaction.signatureHash && (
              <div className="flex justify-between">
                <span className="text-slate-400">Key Signature</span>
                <span className="font-mono text-[10.5px] text-slate-300">
                  {transaction.signatureHash}
                </span>
              </div>
            )}
            {transaction.breakdownNote && (
              <div className="flex justify-between text-right">
                <span className="text-slate-400">Breakdown Note</span>
                <span className="font-medium text-[#00e5ff] max-w-[65%]">
                  {transaction.breakdownNote}
                </span>
              </div>
            )}
          </motion.div>

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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
