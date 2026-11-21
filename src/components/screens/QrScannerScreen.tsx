import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Download,
  Flashlight,
  FlashlightOff,
  Image as ImageIcon,
  Keyboard,
  Lightbulb,
  QrCode,
  Receipt,
  Share2,
  Store,
  User,
  Wallet,
  Zap,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import { playCyberSound } from '../../utils/biometrics';

type QrActionType = 'MERCHANT_PAY' | 'TRANSFER_P2P' | 'BILL_PAY' | 'WALLET_CASH_IN' | 'RECEIVE_QR';

interface ScannedQrData {
  type: QrActionType;
  title: string;
  subtitle: string;
  identifier: string;
  suggestedAmount: number;
  note: string;
  billerCode?: string;
  categoryLabel: string;
}

export const QrScannerScreen: React.FC = () => {
  const {
    userProfile,
    billers,
    sendMoney,
    payBill,
    cashIn,
    receiveMoney,
    navigateTo,
    openReceipt,
  } = useDigiCash();

  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'MERCHANT' | 'P2P' | 'BILLS' | 'CASH_IN' | 'MY_QR'>('ALL');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeScannedData, setActiveScannedData] = useState<ScannedQrData | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('0919 888 7766');
  const [manualAmount, setManualAmount] = useState('500');
  const [manualType, setManualType] = useState<QrActionType>('TRANSFER_P2P');

  // Confirmation dialog inputs
  const [confirmAmount, setConfirmAmount] = useState('');
  const [confirmNote, setConfirmNote] = useState('');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize live camera stream via WebRTC
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        }
      } catch (err: any) {
        console.warn('Camera stream fallback active:', err);
        setCameraError('Optical viewfinder ready. Select a QR Ph target or upload a QR image below.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Torch control
  const toggleTorch = async () => {
    const nextTorch = !torchOn;
    setTorchOn(nextTorch);
    try {
      if (mediaStreamRef.current) {
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities?.() as any;
        if (capabilities && capabilities.torch) {
          await (videoTrack as any).applyConstraints({
            advanced: [{ torch: nextTorch }],
          });
        }
      }
    } catch {
      // Ignore if torch not supported on hardware
    }
  };

  // Comprehensive QR Targets covering ALL Paying and Receiving Features
  const allQrTargets: ScannedQrData[] = [
    // 1. Merchant / Store Payments
    {
      type: 'MERCHANT_PAY',
      title: 'Starbucks Coffee (QR Ph)',
      subtitle: 'BGC High Street Branch',
      identifier: 'MER-SBUX-9821',
      suggestedAmount: 215.0,
      note: 'Venti Iced Americano',
      categoryLabel: 'Merchant Store',
    },
    {
      type: 'MERCHANT_PAY',
      title: '7-Eleven Store #412',
      subtitle: 'Ayala Ave, Makati',
      identifier: 'MER-711-0941',
      suggestedAmount: 145.0,
      note: 'Snacks & Beverages',
      categoryLabel: 'Merchant Store',
    },
    {
      type: 'MERCHANT_PAY',
      title: 'Jollibee Express QR Ph',
      subtitle: 'Fastfood Order #104',
      identifier: 'MER-JB-7729',
      suggestedAmount: 320.0,
      note: 'Chickenjoy 2pc Meal',
      categoryLabel: 'Merchant Store',
    },
    {
      type: 'MERCHANT_PAY',
      title: 'SM Supermarket QR Ph',
      subtitle: 'Grocery Terminal #14',
      identifier: 'MER-SM-8841',
      suggestedAmount: 1250.0,
      note: 'Weekly Grocery Items',
      categoryLabel: 'Merchant Store',
    },

    // 2. Peer-to-Peer & E-Wallet QR Ph Transfers
    {
      type: 'TRANSFER_P2P',
      title: 'GCash Express QR Ph',
      subtitle: 'National QR Ph P2P Transfer',
      identifier: '09995760130',
      suggestedAmount: 500.0,
      note: 'QR Ph Instant Transfer',
      categoryLabel: 'Peer-to-Peer',
    },
    {
      type: 'TRANSFER_P2P',
      title: 'Maya Wallet QR Ph',
      subtitle: 'InstaPay QR Ph Clearing',
      identifier: '09171234567',
      suggestedAmount: 1000.0,
      note: 'Maya QR Ph Transfer',
      categoryLabel: 'Peer-to-Peer',
    },
    {
      type: 'TRANSFER_P2P',
      title: 'GoTyme Bank QR Ph',
      subtitle: 'GoTyme Direct InstaPay',
      identifier: '09171234567',
      suggestedAmount: 1500.0,
      note: 'GoTyme QR Ph Transfer',
      categoryLabel: 'Peer-to-Peer',
    },

    // 3. Bill Payments
    {
      type: 'BILL_PAY',
      title: 'Meralco Electric Bill Statement',
      subtitle: 'Account #109283746',
      identifier: '109283746',
      suggestedAmount: 2850.0,
      note: 'Due: Oct 30, 2026',
      billerCode: 'MER',
      categoryLabel: 'Utility Bill',
    },
    {
      type: 'BILL_PAY',
      title: 'Maynilad Water Bill Statement',
      subtitle: 'Account #882736192',
      identifier: '882736192',
      suggestedAmount: 840.0,
      note: 'Water consumption charge',
      billerCode: 'MYN',
      categoryLabel: 'Utility Bill',
    },
    {
      type: 'BILL_PAY',
      title: 'PLDT Home Fiber Statement',
      subtitle: 'Account #PLDT-98214',
      identifier: 'PLDT-98214',
      suggestedAmount: 1899.0,
      note: 'Fiber Unli Plan 1899',
      billerCode: 'PLDT',
      categoryLabel: 'Utility Bill',
    },
    {
      type: 'BILL_PAY',
      title: 'SSS Monthly Contribution',
      subtitle: 'Account #SSS-09182',
      identifier: 'SSS-09182',
      suggestedAmount: 1120.0,
      note: 'Voluntary SSS payment',
      billerCode: 'SSS',
      categoryLabel: 'Utility Bill',
    },

    // 4. Wallet Cash-In / Top Up
    {
      type: 'WALLET_CASH_IN',
      title: '7-Eleven CLiQQ Barcode Cash-In',
      subtitle: 'Over-the-counter scan',
      identifier: 'CLQQ-711-2026',
      suggestedAmount: 1000.0,
      note: 'Instant ₱1,000 Wallet Cash-In',
      categoryLabel: 'Wallet Cash-In',
    },
    {
      type: 'WALLET_CASH_IN',
      title: 'BPI Instant QR Cash-In',
      subtitle: 'Online Bank Deposit',
      identifier: 'BPI-DEP-4902',
      suggestedAmount: 2000.0,
      note: 'Instant ₱2,000 Wallet Cash-In',
      categoryLabel: 'Wallet Cash-In',
    },
  ];

  // Filtered list based on active tab
  const filteredQrTargets = allQrTargets.filter((item) => {
    if (activeFilterTab === 'ALL') return true;
    if (activeFilterTab === 'MERCHANT') return item.type === 'MERCHANT_PAY';
    if (activeFilterTab === 'P2P') return item.type === 'TRANSFER_P2P';
    if (activeFilterTab === 'BILLS') return item.type === 'BILL_PAY';
    if (activeFilterTab === 'CASH_IN') return item.type === 'WALLET_CASH_IN';
    return true;
  });

  // Select and trigger scan
  const handleSelectQr = (qr: ScannedQrData) => {
    playCyberSound('scan');
    setActiveScannedData(qr);
    setConfirmAmount(qr.suggestedAmount.toString());
    setConfirmNote(qr.note);
    setConfirmAccountNo(qr.identifier);
    setConfirmError(null);
  };

  // Image Upload Scanner Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playCyberSound('scan');
      // Randomly resolve to one of the targets as if decoded from QR image
      const decodedTarget = allQrTargets[Math.floor(Math.random() * allQrTargets.length)];
      handleSelectQr(decodedTarget);
    }
  };

  // Confirm and Execute the specific feature action
  const handleExecutePayment = () => {
    if (!activeScannedData) return;
    setConfirmError(null);
    const parsedAmount = parseFloat(confirmAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setConfirmError('Please enter a valid amount.');
      return;
    }

    if (activeScannedData.type === 'WALLET_CASH_IN') {
      // Cash In Action: Add funds to wallet
      const tx = cashIn(parsedAmount, activeScannedData.title);
      setActiveScannedData(null);
      openReceipt(tx);
      navigateTo('MAIN');
      return;
    }

    // For Outgoing Payments, verify wallet balance
    if (parsedAmount > userProfile.balance) {
      setConfirmError('Insufficient wallet balance for this payment.');
      return;
    }

    if (activeScannedData.type === 'BILL_PAY') {
      // Pay Utility Bill Action
      const targetBiller = billers.find((b) => b.code === activeScannedData.billerCode) || billers[0];
      const res = payBill(targetBiller, confirmAccountNo || activeScannedData.identifier, parsedAmount);
      if (!res.success) {
        setConfirmError(res.error || 'Payment failed.');
      } else {
        setActiveScannedData(null);
        navigateTo('MAIN');
      }
    } else {
      // Merchant Pay or P2P Transfer Action
      const channelLabel = activeScannedData.type === 'MERCHANT_PAY' ? 'QR Ph Merchant' : 'QR Ph Instant';
      const res = sendMoney(activeScannedData.title, parsedAmount, channelLabel, confirmNote);
      if (!res.success) {
        setConfirmError(res.error || 'Payment failed.');
      } else {
        setActiveScannedData(null);
        navigateTo('MAIN');
      }
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 pt-2 max-w-lg mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('MAIN')}
          className="p-2.5 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4 text-[#00f5a0]" />
            <span>Universal QR Ph Scanner</span>
          </h2>
          <span className="text-[10px] text-slate-400">Merchant • P2P • Bills • Cash-In</span>
        </div>
        <button
          onClick={toggleTorch}
          className={`p-2.5 rounded-full border transition-all ${
            torchOn
              ? 'bg-[#00e5ff] text-[#00222b] border-[#00e5ff]'
              : 'bg-[#081b36] text-white border-[#00e5ff]/20'
          }`}
          title="Toggle Torch / Flashlight"
        >
          {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Targets' },
          { id: 'MERCHANT', label: 'Pay Merchant' },
          { id: 'P2P', label: 'Send to Person' },
          { id: 'BILLS', label: 'Pay Utility Bill' },
          { id: 'CASH_IN', label: 'Cash-In QR' },
          { id: 'MY_QR', label: 'My QR Ph Code' },
        ].map((tab) => {
          const isSelected = activeFilterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#00e5ff] text-[#00222b] font-bold shadow-md shadow-[#00e5ff]/20'
                  : 'bg-[#0c2442] text-slate-300 border border-[#00e5ff]/20 hover:border-[#00e5ff]/40'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW A: IF 'MY_QR' TAB IS SELECTED -> INSTANT RECEIVE QR PH */}
      {activeFilterTab === 'MY_QR' ? (
        <GlassCard className="p-6 text-center space-y-4">
          <div className="relative mx-auto w-52 h-52 rounded-2xl bg-white p-3.5 shadow-2xl flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#041020" />
              <rect x="8" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
              <rect x="12" y="12" width="12" height="12" rx="2" fill="#041020" />
              <rect x="69" y="5" width="26" height="26" rx="4" fill="#041020" />
              <rect x="72" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
              <rect x="76" y="12" width="12" height="12" rx="2" fill="#041020" />
              <rect x="5" y="69" width="26" height="26" rx="4" fill="#041020" />
              <rect x="8" y="72" width="20" height="20" rx="2" fill="#FFFFFF" />
              <rect x="12" y="76" width="12" height="12" rx="2" fill="#041020" />
              <circle cx="45" cy="20" r="3" fill="#041020" />
              <circle cx="55" cy="35" r="3" fill="#041020" />
              <circle cx="20" cy="50" r="3" fill="#041020" />
              <circle cx="80" cy="50" r="3" fill="#041020" />
              <circle cx="50" cy="70" r="3" fill="#041020" />
              <rect x="35" y="80" width="10" height="10" rx="2" fill="#041020" />
            </svg>
            <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-[#06101e] border-2 border-[#00e5ff] shadow-lg flex items-center justify-center font-black text-[#00e5ff] text-lg">
              D
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Personal QR Ph Code</h3>
            <p className="text-xs text-slate-300">
              DigiCash ID: <span className="font-mono font-bold text-[#00e5ff]">{userProfile.id}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Have friends or merchants scan this code to pay you directly.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(userProfile.id);
                alert('DigiCash ID copied to clipboard!');
              }}
              className="py-2.5 rounded-xl border border-[#00e5ff] text-[#00e5ff] font-bold text-xs hover:bg-[#00e5ff]/10"
            >
              Copy My ID
            </button>
            <button
              onClick={() => {
                navigateTo('RECEIVE_MONEY');
              }}
              className="py-2.5 rounded-xl bg-[#00f5a0] text-[#00222b] font-bold text-xs hover:bg-[#00e5ff]"
            >
              Open Full QR Page
            </button>
          </div>
        </GlassCard>
      ) : (
        /* VIEW B: ACTIVE CAMERA VIEWFINDER & PHOTO UPLOAD */
        <div className="space-y-4">
          {/* Viewfinder Framing Canvas with Live Camera Stream */}
          <div className="relative mx-auto w-72 h-72 rounded-3xl bg-black/80 border border-[#00e5ff]/40 overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Live Camera Video element */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
              autoPlay
              playsInline
              muted
            />

            {/* Viewfinder Corner Brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#00e5ff] rounded-tl-lg z-10" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#00e5ff] rounded-tr-lg z-10" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#00e5ff] rounded-bl-lg z-10" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#00e5ff] rounded-br-lg z-10" />

            {/* Target Reticle Box */}
            <div className="relative z-10 w-48 h-48 rounded-2xl border border-dashed border-[#00e5ff]/50 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
              <Camera className="w-6 h-6 text-[#00e5ff]/80 mb-1" />
              <p className="text-[10px] font-medium text-white/90">
                Point camera at any QR Ph, bill barcode, or merchant standee
              </p>
            </div>

            {/* Animated Sweeping Laser Line */}
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#00f5a0] to-transparent shadow-[0_0_12px_#00f5a0] animate-bounce z-10" />
          </div>

          {/* Action Tools: Upload QR from Photos & Enter Code Manually */}
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-[#0a2344] border border-[#00e5ff]/30 text-white text-xs font-semibold hover:border-[#00e5ff] transition-all flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-[#00f5a0]" />
              <span>Upload QR Image</span>
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="py-2.5 px-3 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] transition-all flex items-center justify-center gap-2"
            >
              <Keyboard className="w-4 h-4" />
              <span>Enter Manually</span>
            </button>
          </div>

          {/* Instant QR Targets Grid covering All Features */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Featured Partners & Bill Invoices (Auto-scan):</span>
              <span className="text-[11px] text-[#00e5ff]">{filteredQrTargets.length} targets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredQrTargets.map((target, idx) => {
                const getIcon = () => {
                  switch (target.type) {
                    case 'MERCHANT_PAY': return <Store className="w-4 h-4 text-[#b06ab3]" />;
                    case 'TRANSFER_P2P': return <User className="w-4 h-4 text-[#00e5ff]" />;
                    case 'BILL_PAY': return <Receipt className="w-4 h-4 text-[#ffb300]" />;
                    case 'WALLET_CASH_IN': return <Wallet className="w-4 h-4 text-[#00f5a0]" />;
                    default: return <QrCode className="w-4 h-4 text-[#00e5ff]" />;
                  }
                };

                return (
                  <GlassCard
                    key={idx}
                    onClick={() => handleSelectQr(target)}
                    className="p-3 flex items-center justify-between hover:border-[#00e5ff] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <div className="w-8 h-8 rounded-xl bg-[#081a33] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getIcon()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{target.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{target.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-[#00f5a0]">
                        ₱{target.suggestedAmount.toFixed(0)}
                      </div>
                      <span className="text-[9px] text-[#00e5ff] uppercase font-bold">
                        {target.categoryLabel}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#091c36] border border-[#00e5ff]/40 p-5 text-white text-left space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Manual QR Ph Decoder</h3>
              <p className="text-xs text-slate-300">
                Type merchant code, utility biller, or peer number:
              </p>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#07172e] text-[11px] font-semibold text-center">
              {[
                { id: 'TRANSFER_P2P', label: 'To Person' },
                { id: 'MERCHANT_PAY', label: 'Merchant' },
                { id: 'BILL_PAY', label: 'Utility Bill' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setManualType(t.id as any)}
                  className={`py-1.5 rounded-lg transition-all ${
                    manualType === t.id ? 'bg-[#00e5ff] text-[#00222b] font-bold' : 'text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Target Code / Account</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="e.g. 0917 XXX XXXX or SBUX-9821"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Amount (₱)</label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-sm font-bold focus:outline-none focus:border-[#00e5ff]"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amt = parseFloat(manualAmount) || 100;
                  handleSelectQr({
                    type: manualType,
                    title: manualCode,
                    subtitle: 'Manual Entry',
                    identifier: manualCode,
                    suggestedAmount: amt,
                    note: 'Manual QR Ph entry',
                    categoryLabel: manualType === 'BILL_PAY' ? 'Utility Bill' : 'Direct Payment',
                  });
                  setShowManualModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0]"
              >
                Decode Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment / Action Confirmation Modal */}
      {activeScannedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081c38] border border-[#00e5ff]/40 p-6 text-white text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff]">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{activeScannedData.title}</h3>
                <span className="text-[11px] text-[#00f5a0] font-bold uppercase tracking-wider">
                  {activeScannedData.categoryLabel}
                </span>
              </div>
            </div>

            {/* Wallet balance info */}
            <div className="flex justify-between text-xs text-slate-300">
              <span>Your Wallet Balance:</span>
              <span className="font-bold text-[#00e5ff]">
                ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-3">
              {activeScannedData.type === 'BILL_PAY' ? (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Biller Statement Account #
                  </label>
                  <input
                    type="text"
                    value={confirmAccountNo}
                    onChange={(e) => setConfirmAccountNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs font-semibold focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  {activeScannedData.type === 'WALLET_CASH_IN' ? 'Cash-In Amount' : 'Payment Amount'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#00e5ff] font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={confirmAmount}
                    onChange={(e) => setConfirmAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white font-bold text-base focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Note / Description</label>
                <input
                  type="text"
                  value={confirmNote}
                  onChange={(e) => setConfirmNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07172e] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0c2b4d] text-[#00f5a0] text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {activeScannedData.type === 'WALLET_CASH_IN'
                    ? 'Instant wallet credit with 0% cash-in fee'
                    : 'Zero transfer fee via National QR Ph standard'}
                </span>
              </div>

              {confirmError && <p className="text-xs text-[#ff5252] font-semibold">{confirmError}</p>}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setActiveScannedData(null)}
                className="flex-1 py-3 rounded-xl border border-slate-500 text-slate-300 text-xs font-semibold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayment}
                className="flex-1 py-3 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold hover:bg-[#00f5a0] shadow-lg shadow-[#00e5ff]/20"
              >
                {activeScannedData.type === 'WALLET_CASH_IN' ? 'Confirm Cash In' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
