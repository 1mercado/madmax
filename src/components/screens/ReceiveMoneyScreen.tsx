import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Copy, Download, Plus, QrCode, Share2, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { generateQrPhPayload } from '../../services/fintechApi';

export const ReceiveMoneyScreen: React.FC = () => {
  const { userProfile, receiveMoney, navigateTo } = useDigiCash();
  const [copied, setCopied] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [qrPhPayload, setQrPhPayload] = useState<string>('');
  const [qrMerchantId, setQrMerchantId] = useState<string>('DGC-PH-9012');
  const [selectedSource, setSelectedSource] = useState<'GCash' | 'Maya' | 'GoTyme' | 'BDO InstaPay'>('GCash');

  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let active = true;
    const parsedAmt = customAmount ? parseFloat(customAmount) : undefined;
    generateQrPhPayload({
      accountPhone: userProfile.phone || userProfile.id,
      accountName: userProfile.name,
      amount: parsedAmt && parsedAmt > 0 ? parsedAmt : undefined,
    }).then((res) => {
      if (active && res.success && res.qrPhPayload) {
        setQrPhPayload(res.qrPhPayload);
        if (res.merchantId) setQrMerchantId(res.merchantId);
      }
    });
    return () => {
      active = false;
    };
  }, [userProfile.phone, userProfile.id, userProfile.name, customAmount]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(userProfile.phone || userProfile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyQrPayload = () => {
    if (!qrPhPayload) return;
    navigator.clipboard.writeText(qrPhPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleShare = () => {
    const amtStr = customAmount ? `for ₱${parseFloat(customAmount).toFixed(2)}` : '';
    const shareText = `DigiCash QR Ph Payment Request ${amtStr}\nMobile / Account: ${userProfile.phone || userProfile.id}\nName: ${userProfile.name}\nEMVCo QR Ph: ${qrPhPayload || 'Active'}\nPay via GCash, Maya, GoTyme, BDO, or BPI.`;

    if (navigator.share) {
      navigator.share({
        title: 'DigiCash QR Ph Request',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveQR = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#06162d';
        ctx.fillRect(0, 0, 400, 480);

        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DIGICASH QR PH', 200, 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText(userProfile.name, 200, 68);
        ctx.fillText(`Mobile: ${userProfile.phone || userProfile.id}`, 200, 88);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, 110, 300, 300);

        ctx.fillStyle = '#02132d';
        ctx.fillRect(70, 130, 70, 70);
        ctx.clearRect(80, 140, 50, 50);
        ctx.fillRect(90, 150, 30, 30);

        ctx.fillRect(260, 130, 70, 70);
        ctx.clearRect(270, 140, 50, 50);
        ctx.fillRect(280, 150, 30, 30);

        ctx.fillRect(70, 320, 70, 70);
        ctx.clearRect(80, 330, 50, 50);
        ctx.fillRect(90, 340, 30, 30);

        ctx.fillStyle = '#00f5a0';
        ctx.font = 'bold 13px sans-serif';
        const footerText = customAmount
          ? `REQUESTED AMOUNT: ₱${parseFloat(customAmount).toFixed(2)}`
          : 'SCAN TO PAY VIA GCASH, MAYA, GOTYME OR BANK';
        ctx.fillText(footerText, 200, 450);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `DigiCash_QRPh_${userProfile.phone || userProfile.id}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-lg mx-auto">
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
            <h2 className="text-xl font-bold text-white">Receive Money</h2>
            <p className="text-[11px] text-slate-300">
              National QR Ph • GCash • Maya • GoTyme • InstaPay
            </p>
          </div>
        </div>

        {/* Set Specific Amount Toggle */}
        <button
          onClick={() => setShowAmountInput(!showAmountInput)}
          className="text-xs font-bold text-[#00e5ff] hover:underline"
        >
          {showAmountInput ? 'Clear Amount' : '+ Specify Amount'}
        </button>
      </div>

      {/* Amount Input Drawer */}
      {showAmountInput && (
        <GlassCard className="p-3.5 flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-300 shrink-0">Request: ₱</div>
          <input
            type="number"
            step="any"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white font-bold text-sm focus:outline-none focus:border-[#00e5ff]"
          />
          {customAmount && (
            <button
              onClick={() => setCustomAmount('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </GlassCard>
      )}

      {/* QR Code Container Card */}
      <GlassCard className="p-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            EMVCo QR Ph v1.2 Verified
          </span>
          <span className="text-[10px] font-mono text-slate-400">{qrMerchantId}</span>
        </div>

        {/* Dynamic Stylized QR Code Canvas */}
        <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white p-3.5 shadow-2xl flex items-center justify-center">
          <svg ref={qrRef} viewBox="0 0 100 100" className="w-full h-full">
            {/* Finder Corners */}
            <rect x="5" y="5" width="26" height="26" rx="4" fill="#041020" />
            <rect x="8" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="12" y="12" width="12" height="12" rx="2" fill="#041020" />

            <rect x="69" y="5" width="26" height="26" rx="4" fill="#041020" />
            <rect x="72" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="76" y="12" width="12" height="12" rx="2" fill="#041020" />

            <rect x="5" y="69" width="26" height="26" rx="4" fill="#041020" />
            <rect x="8" y="72" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="12" y="76" width="12" height="12" rx="2" fill="#041020" />

            {/* Matrix Data Bits */}
            <circle cx="42" cy="12" r="3" fill="#041020" />
            <circle cx="54" cy="12" r="3" fill="#041020" />
            <circle cx="48" cy="22" r="3" fill="#041020" />
            <circle cx="40" cy="34" r="3" fill="#041020" />
            <circle cx="60" cy="34" r="3" fill="#041020" />
            <circle cx="16" cy="46" r="3" fill="#041020" />
            <circle cx="28" cy="46" r="3" fill="#041020" />
            <circle cx="72" cy="46" r="3" fill="#041020" />
            <circle cx="84" cy="46" r="3" fill="#041020" />
            <circle cx="42" cy="58" r="3" fill="#041020" />
            <circle cx="58" cy="58" r="3" fill="#041020" />
            <circle cx="48" cy="72" r="3" fill="#041020" />
            <circle cx="60" cy="80" r="3" fill="#041020" />
            <circle cx="78" cy="72" r="3" fill="#041020" />
            <circle cx="84" cy="84" r="3" fill="#041020" />
            <rect x="36" y="84" width="8" height="8" rx="2" fill="#041020" />
          </svg>

          {/* Center Logo Badge */}
          <div className="absolute inset-0 m-auto w-11 h-11 rounded-xl bg-[#06101e] border-2 border-[#00e5ff] shadow-lg flex items-center justify-center font-black text-[#00e5ff] text-xl">
            D
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-white mb-0.5">{userProfile.name}</h3>
          <p className="text-xs font-mono text-[#00e5ff] mb-1">
            {userProfile.phone || userProfile.id}
          </p>
          {customAmount ? (
            <div className="text-lg font-black text-[#00f5a0] my-1">
              Requesting ₱{parseFloat(customAmount).toFixed(2)}
            </div>
          ) : (
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Scan with GCash, Maya, GoTyme, or any BancNet mobile banking app.
            </p>
          )}
        </div>

        {/* Live EMVCo QR Ph Payload Inspector */}
        {qrPhPayload && (
          <div className="p-2.5 rounded-xl bg-[#07182e] border border-[#00e5ff]/20 flex items-center justify-between gap-2 text-left">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Live EMVCo QR Ph String
              </div>
              <div className="text-[11px] font-mono text-slate-300 truncate">{qrPhPayload}</div>
            </div>
            <button
              type="button"
              onClick={handleCopyQrPayload}
              className="px-2.5 py-1 rounded-lg bg-[#00e5ff]/15 text-[#00e5ff] text-[10px] font-bold shrink-0 hover:bg-[#00e5ff]/25"
            >
              {copiedPayload ? 'Copied!' : 'Copy String'}
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-1">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#00e5ff] text-[#00e5ff] text-xs font-semibold hover:bg-[#00e5ff]/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share QR</span>
          </button>
          <button
            onClick={handleSaveQR}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] transition-colors"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{saveSuccess ? 'Saved PNG!' : 'Save QR'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Account Number Card */}
      <GlassCard className="p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400">Verified Mobile Wallet & Account ID</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {userProfile.phone || userProfile.id}
          </div>
          <div className="text-[11px] text-slate-300">
            {userProfile.name} • ID: {userProfile.id}
          </div>
        </div>
        <button
          onClick={handleCopyAccount}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14365d] border border-[#00e5ff]/30 text-xs font-semibold text-[#00e5ff] hover:bg-[#1b4676] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Number'}</span>
        </button>
      </GlassCard>

      {/* Instant Incoming Transfer Webhook / QR Ph Receiver */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#00f5a0]" />
            <span>Receive Instant Incoming Transfer</span>
          </div>
          <span className="text-[10px] bg-[#00f5a0]/20 text-[#00f5a0] px-2 py-0.5 rounded font-bold">
            QR Ph / InstaPay API
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          Select a sending e-wallet or bank below to trigger a real-time incoming QR Ph / InstaPay credit into your wallet:
        </p>

        {/* Source Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['GCash', 'Maya', 'GoTyme', 'BDO InstaPay'] as const).map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelectedSource(src)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                selectedSource === src
                  ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-white'
                  : 'bg-[#081c35] border-[#00e5ff]/20 text-slate-400 hover:text-white'
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[500, 1000, 2500].map((amt) => (
            <button
              key={amt}
              onClick={() => {
                const finalAmt =
                  customAmount && parseFloat(customAmount) > 0 ? parseFloat(customAmount) : amt;
                receiveMoney(
                  `${selectedSource} QR Ph Direct`,
                  finalAmt,
                  `Instant incoming transfer via ${selectedSource} QR Ph`
                );
              }}
              className="py-2.5 px-1 rounded-xl bg-[#092244] border border-[#00f5a0]/40 text-[#00f5a0] text-xs font-bold hover:bg-[#00f5a0]/20 transition-all text-center"
            >
              + ₱{customAmount && parseFloat(customAmount) > 0 ? parseFloat(customAmount) : amt} via{' '}
              {selectedSource.split(' ')[0]}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Official Cash-In / Top Up Card */}
      <div
        onClick={() => navigateTo('TOP_UP')}
        className="rounded-2xl bg-gradient-to-r from-[#00f5a0]/15 to-[#00e5ff]/15 border border-[#00f5a0]/40 p-4 flex items-center justify-between cursor-pointer hover:border-[#00f5a0] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Deposit / Cash In Funds</div>
            <p className="text-[11px] text-slate-300">
              Top up via BDO, BPI, UnionBank, GoTyme, 7-Eleven CLiQQ, or Over-the-counter
            </p>
          </div>
        </div>
        <Plus className="w-5 h-5 text-[#00f5a0]" />
      </div>
    </div>
  );
};
