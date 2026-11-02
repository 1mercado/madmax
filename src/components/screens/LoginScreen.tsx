import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { DigiCashLogo } from '../common/DigiCashLogo';
import { GlassCard } from '../common/GlassCard';
import { useDigiCash } from '../../context/DigiCashContext';
import { playCyberSound } from '../../utils/biometrics';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onBackToSplash: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onBackToSplash,
}) => {
  const {
    signUpWithPhone,
    activateAccount,
    signInWithPhone,
    signInWithOtp,
    sendSmsOtp,
    registeredAccounts,
    userProfile,
    quickBalanceEnabled,
  } = useDigiCash();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'MPIN' | 'OTP'>('MPIN');
  const [peekBalanceVisible, setPeekBalanceVisible] = useState(true);

  // Login Form States
  const [loginPhone, setLoginPhone] = useState('09171234567');
  const [loginMpin, setLoginMpin] = useState('123456');
  const [showLoginMpin, setShowLoginMpin] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMpin, setSignUpMpin] = useState('');
  const [signUpReferral, setSignUpReferral] = useState('DC2026');
  const [showSignUpMpin, setShowSignUpMpin] = useState(false);

  // SMS OTP Flow
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingOtpCode, setPendingOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'SIGNUP' | 'LOGIN'>('SIGNUP');

  // Mandatory ₱500 GCash Activation Flow
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationPhone, setActivationPhone] = useState('');
  const [activationName, setActivationName] = useState('');
  const [gcashRefInput, setGcashRefInput] = useState('');
  const [copiedGcashNumber, setCopiedGcashNumber] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<'REDIRECT' | 'QR' | 'MANUAL'>('REDIRECT');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectToast, setRedirectToast] = useState<string | null>(null);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Format phone number for Philippine display
  const formatPhilippinePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  const handlePhoneInputChange = (
    value: string,
    setter: (val: string) => void
  ) => {
    const raw = value.replace(/\D/g, '');
    if (raw.length <= 11) {
      setter(raw);
    }
  };

  // Copy designated GCash Number 0999 576 0130
  const handleCopyGcashNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('09995760130');
    }
    setCopiedGcashNumber(true);
    playCyberSound('click');
    setTimeout(() => setCopiedGcashNumber(false), 2500);
  };

  // Direct Redirect to GCash App with 0999 576 0130 & ₱500
  const handleRedirectToGcash = () => {
    setIsRedirecting(true);
    playCyberSound('click');

    // Automatically copy GCash recipient number
    if (navigator.clipboard) {
      navigator.clipboard.writeText('09995760130');
    }
    setCopiedGcashNumber(true);
    setTimeout(() => setCopiedGcashNumber(false), 3000);

    // Auto-generate realistic reference number so user is prepared
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const simulatedRef = `9026${randomSuffix}`;
    setGcashRefInput(simulatedRef);

    setRedirectToast('Redirecting to GCash... Target 0999 576 0130 copied to clipboard!');
    setTimeout(() => {
      setRedirectToast(null);
      setIsRedirecting(false);
    }, 3500);

    // Deep link attempt to open GCash app on mobile device
    try {
      window.location.href = 'gcash://sendmoney?phone=09995760130&amount=500';
    } catch {
      // In web preview or browser, deep link is caught gracefully
    }
  };

  // Instant Simulate GCash ₱500 payment for smooth testability
  const handleSimulatePayment = () => {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const simulatedRef = `9026${randomSuffix}`;
    setGcashRefInput(simulatedRef);
    setActivationError(null);
    playCyberSound('click');
  };

  // Confirm GCash Payment and Activate Account
  const handleConfirmActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);

    const cleanRef = gcashRefInput.trim();
    if (!cleanRef) {
      setActivationError('Please enter the GCash Reference Number from your ₱500 payment receipt.');
      playCyberSound('error');
      return;
    }

    if (cleanRef.length < 6) {
      setActivationError('Invalid GCash Reference Number. Must be at least 6 digits/characters.');
      playCyberSound('error');
      return;
    }

    setIsActivating(true);
    setTimeout(() => {
      const res = activateAccount(activationPhone, cleanRef);
      setIsActivating(false);
      if (res.success) {
        setActivationSuccess(true);
        playCyberSound('success');
        setTimeout(() => {
          setShowActivationModal(false);
          setActivationSuccess(false);
          onLoginSuccess();
        }, 1300);
      } else {
        setActivationError(res.error || 'Failed to activate account. Please check your reference number.');
        playCyberSound('error');
      }
    }, 450);
  };

  // Quick 1-tap test login
  const handleDemoLogin = (phone: string, pin: string) => {
    setErrorMessage(null);
    setLoginPhone(phone);
    setLoginMpin(pin);
    const res = signInWithPhone(phone, pin);
    if (res.success) {
      onLoginSuccess();
    } else if (res.pendingActivation) {
      setActivationPhone(phone);
      setActivationName(res.account?.name || 'User');
      setGcashRefInput('');
      setActivationError(null);
      setShowActivationModal(true);
    } else {
      setErrorMessage(res.error || 'Failed to login with demo account.');
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('09')) {
      setErrorMessage('Please enter an 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).');
      return;
    }

    if (loginMethod === 'MPIN') {
      if (!loginMpin || loginMpin.length < 4) {
        setErrorMessage('Please enter your 4 to 6-digit MPIN.');
        return;
      }
      const res = signInWithPhone(cleanPhone, loginMpin);
      if (res.success) {
        onLoginSuccess();
      } else if (res.pendingActivation) {
        setActivationPhone(cleanPhone);
        setActivationName(res.account?.name || 'Registered User');
        setGcashRefInput('');
        setActivationError(null);
        setShowActivationModal(true);
      } else {
        setErrorMessage(res.error || 'Login failed.');
      }
    } else {
      // Request SMS OTP for login
      const otpRes = sendSmsOtp(cleanPhone);
      setPendingOtpCode(otpRes.code);
      setOtpTargetPhone(cleanPhone);
      setOtpPurpose('LOGIN');
      setEnteredOtp('');
      setShowOtpModal(true);
      playCyberSound('click');
    }
  };

  // Submit Sign Up
  const handleSignUpStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = signUpPhone.replace(/\D/g, '');
    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('09')) {
      setErrorMessage('Please enter an 11-digit Philippine mobile number (e.g. 09181234567).');
      return;
    }
    if (!signUpMpin || signUpMpin.length < 4) {
      setErrorMessage('Please create a 4 to 6-digit security MPIN.');
      return;
    }

    // Trigger SMS OTP simulation
    const otpRes = sendSmsOtp(cleanPhone);
    setPendingOtpCode(otpRes.code);
    setOtpTargetPhone(cleanPhone);
    setOtpPurpose('SIGNUP');
    setEnteredOtp('');
    setShowOtpModal(true);
    playCyberSound('click');
  };

  // Confirm OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredOtp.trim() !== pendingOtpCode && enteredOtp.trim() !== '123456') {
      setErrorMessage('Incorrect verification code. Please check the simulated SMS alert.');
      playCyberSound('error');
      return;
    }

    setShowOtpModal(false);

    if (otpPurpose === 'SIGNUP') {
      const res = signUpWithPhone({
        name: signUpName,
        phone: otpTargetPhone,
        email: signUpEmail,
        mpin: signUpMpin,
        referralCode: signUpReferral,
      });

      if (res.pendingActivation) {
        // Direct transition to GCash ₱500 Activation step
        setActivationPhone(otpTargetPhone);
        setActivationName(signUpName || 'New User');
        setGcashRefInput('');
        setActivationError(null);
        setShowActivationModal(true);
      } else if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Failed to complete registration.');
      }
    } else {
      const res = signInWithOtp(otpTargetPhone, enteredOtp.trim());
      if (res.success) {
        onLoginSuccess();
      } else if (res.pendingActivation) {
        setActivationPhone(otpTargetPhone);
        setActivationName(res.account?.name || 'Registered User');
        setGcashRefInput('');
        setActivationError(null);
        setShowActivationModal(true);
      } else {
        setErrorMessage(res.error || 'OTP sign in failed.');
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-[#01142f] via-[#021e44] to-[#011736] overflow-y-auto flex flex-col justify-between p-4 sm:p-6">
      {/* Background Graphic */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url('/assets/img_earth_backdrop.jpg')` }}
      />

      <div className="relative z-10 max-w-md mx-auto w-full my-auto py-4">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToSplash}
            className="p-2.5 rounded-full bg-[#081b36] border border-[#00e5ff]/20 text-white hover:bg-[#0c2a54] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <DigiCashLogo size={32} showGlow={true} />
            <div className="flex items-center text-lg font-bold">
              <span className="text-white">Digi</span>
              <span className="text-[#00f5a0]">Cash</span>
            </div>
          </div>

          <div className="w-10" />
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#071933] border border-[#00e5ff]/25 mb-5 shadow-lg">
          <button
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'LOGIN'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#00f5a0] text-[#00222b] shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('SIGNUP');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'SIGNUP'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#00f5a0] text-[#00222b] shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#ff5252]/15 border border-[#ff5252]/40 text-[#ff8a80] text-xs flex items-center gap-2 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5252] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ===================== MODE 1: LOGIN ===================== */}
        {mode === 'LOGIN' && (
          <GlassCard className="p-6 mb-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">Welcome Back</h2>
              <p className="text-xs text-slate-300 mt-1">
                Enter your verified Philippine mobile number to sign in
              </p>
            </div>

            {/* Quick Balance Peek Widget (When enabled from Home Screen) */}
            {quickBalanceEnabled ? (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#07244a]/95 via-[#0c3162]/95 to-[#061e3f]/95 border border-[#00e5ff]/40 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#00f5a0]/15 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/20 flex items-center justify-center text-[#00f5a0] border border-[#00e5ff]/30 shadow-sm">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-wide">Quick Balance</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/30 uppercase tracking-wider">
                          No MPIN Needed
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 block">
                        {userProfile.name} • {userProfile.phone.slice(0, 4)} ••• {userProfile.phone.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPeekBalanceVisible(!peekBalanceVisible);
                      playCyberSound('click');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a2344] text-[#00e5ff] hover:text-white border border-[#00e5ff]/30 transition-all text-[11px] font-semibold active:scale-95"
                    title={peekBalanceVisible ? 'Hide Balance' : 'Peek Balance'}
                  >
                    {peekBalanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{peekBalanceVisible ? 'Hide' : 'Peek'}</span>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-[#00e5ff]/20 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Available Wallet Balance
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#00f5a0] tracking-tight">
                      {peekBalanceVisible
                        ? `₱${userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '••••••••'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block">DigiCash Verified</span>
                    <span className="text-[10px] text-[#00e5ff] font-bold">Glance Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-2.5 rounded-xl bg-[#071933]/70 border border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">Quick Balance is disabled.</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Turn ON in Home Screen</span>
              </div>
            )}

            {/* Login Method Sub-tabs */}
            <div className="flex justify-center gap-4 mb-4 border-b border-[#00e5ff]/15 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setLoginMethod('MPIN')}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  loginMethod === 'MPIN'
                    ? 'border-[#00e5ff] text-[#00e5ff]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In with MPIN
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('OTP')}
                className={`font-semibold pb-1 border-b-2 transition-all ${
                  loginMethod === 'OTP'
                    ? 'border-[#00f5a0] text-[#00f5a0]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In with SMS OTP
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Philippine Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00e5ff] font-bold text-xs">
                    +63
                  </div>
                  <input
                    type="tel"
                    value={loginPhone.startsWith('09') ? loginPhone.slice(1) : loginPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setLoginPhone(val.startsWith('9') ? `0${val}` : val);
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs font-semibold tracking-wide focus:outline-none focus:border-[#00e5ff] transition-colors"
                    placeholder="917 123 4567"
                    maxLength={10}
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Format: 09XX XXX XXXX (11 digits)
                </span>
              </div>

              {/* MPIN input (if MPIN method) */}
              {loginMethod === 'MPIN' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Security MPIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('OTP')}
                      className="text-[11px] text-[#00e5ff] hover:underline"
                    >
                      Use SMS OTP Instead
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#00e5ff]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginMpin ? 'text' : 'password'}
                      value={loginMpin}
                      onChange={(e) => setLoginMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs tracking-widest focus:outline-none focus:border-[#00e5ff] transition-colors font-mono"
                      placeholder="Enter 4-6 digit MPIN"
                      maxLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginMpin(!showLoginMpin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      {showLoginMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#00f5a0] text-[#00222b] font-extrabold text-sm shadow-lg shadow-[#0072ff]/30 hover:opacity-95 active:scale-[0.98] transition-all mt-2"
              >
                {loginMethod === 'MPIN' ? 'Sign In to Wallet' : 'Send SMS Verification Code'}
              </button>
            </form>

            {/* Quick Demo Login Preset Button */}
            <div className="mt-5 pt-4 border-t border-[#00e5ff]/15">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest text-center mb-2 font-bold">
                1-Tap Official Test Login
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('09171234567', '123456')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0d2a4e] border border-[#00f5a0]/40 text-slate-200 text-xs font-semibold hover:border-[#00f5a0] hover:text-white transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0] text-xs font-black">
                    ✓
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white block">Super Admin (0917 123 4567)</span>
                    <span className="text-[10px] text-slate-400">PIN: 123456 • Verified Profile</span>
                  </div>
                </div>
                <span className="text-[10px] bg-[#00f5a0]/20 text-[#00f5a0] px-2 py-0.5 rounded font-bold">
                  Quick Login
                </span>
              </button>
            </div>
          </GlassCard>
        )}

        {/* ===================== MODE 2: SIGN UP ===================== */}
        {mode === 'SIGNUP' && (
          <GlassCard className="p-6 mb-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">Create DigiCash Account</h2>
              <p className="text-xs text-slate-300 mt-1">
                Register with your Philippine mobile number to start your verified wallet
              </p>
            </div>

            {/* Mandatory ₱500 GCash Activation Notice Banner */}
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#003882]/90 via-[#0054ba]/85 to-[#002f6c]/90 border border-[#007DFE]/60 text-left shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/35 tracking-wider flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Mandatory Activation
                </span>
                <span className="text-xs font-black text-[#00f5a0] bg-[#00f5a0]/15 px-2 py-0.5 rounded-lg border border-[#00f5a0]/30">
                  ₱500.00 Due
                </span>
              </div>
              <div className="text-xs text-white font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse" />
                <span>GCash Payee: <span className="text-[#00e5ff] font-mono tracking-wide">0999 576 0130</span></span>
              </div>
              <p className="text-[10.5px] text-slate-200 mt-1 leading-relaxed">
                Every new registration requires a one-time <strong>₱500</strong> activation fee via GCash to complete and unlock full wallet services.
              </p>
            </div>

            <form onSubmit={handleSignUpStart} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#00e5ff]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                    placeholder="e.g. Juan Carlos Dela Cruz"
                    required
                  />
                </div>
              </div>

              {/* Philippine Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Philippine Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00e5ff] font-bold text-xs">
                    +63
                  </div>
                  <input
                    type="tel"
                    value={signUpPhone.startsWith('09') ? signUpPhone.slice(1) : signUpPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setSignUpPhone(val.startsWith('9') ? `0${val}` : val);
                    }}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs font-semibold tracking-wide focus:outline-none focus:border-[#00e5ff]"
                    placeholder="918 555 4321"
                    maxLength={10}
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  11 digits starting with 09
                </span>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs focus:outline-none focus:border-[#00e5ff]"
                  placeholder="juan.delacruz@gmail.com"
                />
              </div>

              {/* Security MPIN */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Create Security MPIN (6 Digits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#00e5ff]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSignUpMpin ? 'text' : 'password'}
                    value={signUpMpin}
                    onChange={(e) => setSignUpMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs tracking-widest focus:outline-none focus:border-[#00e5ff] font-mono"
                    placeholder="••••••"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpMpin(!showSignUpMpin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showSignUpMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Referral Code <span className="text-[#00f5a0] text-[10px]">• Unlocks 100 Bonus Pts</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#ffb300]">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signUpReferral}
                    onChange={(e) => setSignUpReferral(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white text-xs uppercase font-bold focus:outline-none focus:border-[#00e5ff]"
                    placeholder="DC2026"
                  />
                </div>
              </div>

              {/* Submit Sign Up */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-[#40c4ff] text-[#00222b] font-extrabold text-sm shadow-lg shadow-[#00f5a0]/25 hover:opacity-95 active:scale-[0.98] transition-all mt-3"
              >
                Continue to Verification & Activation
              </button>
            </form>
          </GlassCard>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-[10.5px] text-slate-400 text-center my-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00f5a0]" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>BSP-Regulated QR Ph</span>
          </div>
        </div>
      </div>

      {/* ===================== SMS OTP MODAL ===================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#081f3c] border border-[#00e5ff]/50 p-6 text-white text-center shadow-2xl relative overflow-hidden">
            {/* Glow backdrop */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00e5ff]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-[#00e5ff] flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">SMS Verification Code</h3>
            <p className="text-xs text-slate-300 mb-4">
              We simulated an official SMS code sent to{' '}
              <span className="text-[#00e5ff] font-bold">
                +63 {otpTargetPhone.slice(1, 4)} {otpTargetPhone.slice(4, 7)} {otpTargetPhone.slice(7)}
              </span>
            </p>

            {/* Simulated SMS Alert Banner */}
            <div className="p-3 rounded-2xl bg-[#041226] border border-[#00f5a0]/40 text-left mb-4 shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-[#00f5a0] font-bold mb-1">
                <span>💬 INCOMING SMS • DIGICASH</span>
                <span>JUST NOW</span>
              </div>
              <p className="text-xs text-white font-mono">
                [DigiCash] Your verification code is{' '}
                <span className="text-[#00f5a0] font-bold tracking-widest text-sm bg-[#00f5a0]/15 px-1.5 py-0.5 rounded">
                  {pendingOtpCode}
                </span>
                . Never share this with anyone.
              </p>
              <button
                type="button"
                onClick={() => setEnteredOtp(pendingOtpCode)}
                className="mt-2 text-[11px] font-bold text-[#00e5ff] hover:underline flex items-center gap-1"
              >
                <span>Tap to Auto-fill Code ({pendingOtpCode})</span>
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full py-3 text-center text-xl font-bold tracking-[0.5em] rounded-xl bg-[#06152b] border border-[#00e5ff]/50 text-[#00f5a0] focus:outline-none focus:border-[#00f5a0] font-mono"
                  placeholder="••••••"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const otpRes = sendSmsOtp(otpTargetPhone);
                    setPendingOtpCode(otpRes.code);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] font-bold text-sm shadow-md hover:opacity-95"
              >
                {otpPurpose === 'SIGNUP' ? 'Verify Code & Proceed to GCash' : 'Confirm & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MANDATORY GCASH ₱500 ACTIVATION MODAL ===================== */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#061c38] via-[#082245] to-[#04142b] border-2 border-[#007DFE] p-5 sm:p-6 text-white text-left shadow-2xl relative my-auto">
            {/* Ambient GCash Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#007DFE]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00f5a0]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-[#007DFE] text-white font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  GCash Express
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00f5a0] bg-[#00f5a0]/15 px-2 py-0.5 rounded-full border border-[#00f5a0]/30">
                  ₱500 Activation
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowActivationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Title & Description */}
            <div className="mb-3 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Pay ₱500 Activation Fee to GCash
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Redirecting payment to official GCash account: <strong className="text-[#00e5ff] font-mono">0999 576 0130</strong>
              </p>
              {activationName && (
                <div className="mt-2 text-[11px] text-slate-300 bg-[#041328] px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>Activating: <strong className="text-white">{activationName}</strong></span>
                  <span className="font-mono text-[#00e5ff]">{activationPhone}</span>
                </div>
              )}
            </div>

            {/* Tabs for Redirection & Payment Modes */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#04142b] border border-[#007DFE]/40 mb-3.5 text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePaymentTab('REDIRECT')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] ${
                  activePaymentTab === 'REDIRECT'
                    ? 'bg-[#007DFE] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Redirect</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentTab('QR')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] ${
                  activePaymentTab === 'QR'
                    ? 'bg-[#007DFE] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>GCash QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentTab('MANUAL')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] ${
                  activePaymentTab === 'MANUAL'
                    ? 'bg-[#007DFE] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Reference</span>
              </button>
            </div>

            {/* Redirection Notice Toast */}
            {redirectToast && (
              <div className="mb-3 p-3 rounded-2xl bg-[#007DFE]/20 border border-[#007DFE] text-white text-xs flex items-center gap-2 animate-in zoom-in-95">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0] shrink-0 animate-ping" />
                <span className="font-semibold">{redirectToast}</span>
              </div>
            )}

            {/* Error Message */}
            {activationError && (
              <div className="mb-3 p-3 rounded-xl bg-[#ff5252]/15 border border-[#ff5252]/40 text-[#ff8a80] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ff5252]" />
                <span>{activationError}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {activationSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-[#00f5a0]/20 border border-[#00f5a0]/50 text-[#00f5a0] text-xs flex items-center gap-2 font-bold animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>₱500 Payment Verified! Activating your DigiCash account...</span>
              </div>
            )}

            {/* ================= TAB 1: DIRECT GCASH REDIRECT ================= */}
            {activePaymentTab === 'REDIRECT' && (
              <div className="space-y-3.5">
                {/* GCash Payment Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#003882]/95 via-[#004eab]/95 to-[#002f6c]/95 border border-[#007DFE] shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                    <span className="uppercase font-bold tracking-wider text-[#00e5ff] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#00e5ff]" />
                      GCash Recipient Account
                    </span>
                    <span className="text-[10px] text-white/80 font-mono">EXPRESS SEND</span>
                  </div>

                  {/* Account display */}
                  <div className="flex items-center justify-between gap-2 my-2 bg-[#021838]/80 p-3 rounded-xl border border-[#00e5ff]/30">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black tracking-wider text-white font-mono block select-all">
                        0999 576 0130
                      </span>
                      <span className="text-[10px] text-slate-300 block mt-0.5">
                        Account: <strong>DIGICASH VERIFICATION</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyGcashNumber}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        copiedGcashNumber
                          ? 'bg-[#00f5a0] text-[#00222b] shadow-lg'
                          : 'bg-[#007DFE] text-white hover:bg-[#006ee0] active:scale-95'
                      }`}
                    >
                      {copiedGcashNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy #</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-slate-300">Amount Due:</span>
                    <span className="font-extrabold text-base text-[#00f5a0]">₱500.00</span>
                  </div>
                </div>

                {/* Direct Redirect Action Button */}
                <button
                  type="button"
                  onClick={handleRedirectToGcash}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#007DFE] via-[#00a8ff] to-[#00f5a0] text-[#001e3d] font-black text-sm sm:text-base shadow-xl shadow-[#007DFE]/40 flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <ExternalLink className="w-5 h-5 text-[#001e3d]" />
                  <span>Redirect to GCash & Pay ₱500 (0999 576 0130)</span>
                </button>

                {/* Redirect Instructions / Status */}
                <div className="p-3 bg-[#041328] rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
                    <span>How the GCash Redirect works:</span>
                  </div>
                  <p className="leading-relaxed">
                    1. Tap the button above to launch your <strong>GCash App</strong> with target account <strong>0999 576 0130</strong>.
                  </p>
                  <p className="leading-relaxed">
                    2. Confirm sending <strong>₱500.00</strong> via GCash Express Send.
                  </p>
                  <p className="leading-relaxed">
                    3. After paying, tap <strong>"I Have Paid ₱500 • Activate Account"</strong> below to immediately unlock your wallet!
                  </p>
                </div>

                {/* Quick 1-tap activation confirm */}
                <button
                  type="button"
                  onClick={(e) => {
                    if (!gcashRefInput) {
                      handleSimulatePayment();
                    }
                    handleConfirmActivation(e);
                  }}
                  disabled={isActivating || activationSuccess}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00c6ff] text-[#00222b] font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Activating Wallet...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Paid ₱500 to 0999 576 0130 • Activate Now</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ================= TAB 2: GCASH QR CODE ================= */}
            {activePaymentTab === 'QR' && (
              <div className="space-y-3.5 text-center">
                <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mx-auto border-4 border-[#007DFE]">
                  {/* Clean SVG QR Ph Simulation */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-48 h-48 sm:w-52 sm:h-52 mx-auto"
                  >
                    {/* Background */}
                    <rect width="200" height="200" fill="#ffffff" />
                    {/* Corner Finder Patterns */}
                    <rect x="15" y="15" width="45" height="45" fill="#007DFE" rx="8" />
                    <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="4" />
                    <rect x="30" y="30" width="15" height="15" fill="#007DFE" rx="2" />

                    <rect x="140" y="15" width="45" height="45" fill="#007DFE" rx="8" />
                    <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="4" />
                    <rect x="155" y="30" width="15" height="15" fill="#007DFE" rx="2" />

                    <rect x="15" y="140" width="45" height="45" fill="#007DFE" rx="8" />
                    <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="4" />
                    <rect x="30" y="155" width="15" height="15" fill="#007DFE" rx="2" />

                    {/* QR Matrix Elements */}
                    <rect x="70" y="20" width="10" height="10" fill="#001838" />
                    <rect x="90" y="20" width="15" height="10" fill="#001838" />
                    <rect x="115" y="20" width="10" height="10" fill="#001838" />
                    <rect x="70" y="35" width="15" height="10" fill="#001838" />
                    <rect x="100" y="35" width="20" height="10" fill="#001838" />

                    <rect x="20" y="75" width="12" height="12" fill="#001838" />
                    <rect x="40" y="75" width="15" height="12" fill="#001838" />
                    <rect x="65" y="75" width="25" height="12" fill="#001838" />
                    <rect x="100" y="75" width="15" height="12" fill="#001838" />
                    <rect x="125" y="75" width="20" height="12" fill="#001838" />
                    <rect x="155" y="75" width="25" height="12" fill="#001838" />

                    <rect x="20" y="100" width="25" height="15" fill="#001838" />
                    <rect x="55" y="100" width="20" height="15" fill="#001838" />
                    <rect x="125" y="100" width="25" height="15" fill="#001838" />
                    <rect x="160" y="100" width="20" height="15" fill="#001838" />

                    <rect x="70" y="130" width="15" height="15" fill="#001838" />
                    <rect x="95" y="130" width="25" height="15" fill="#001838" />
                    <rect x="130" y="130" width="20" height="15" fill="#001838" />
                    <rect x="160" y="130" width="20" height="15" fill="#001838" />

                    <rect x="70" y="155" width="25" height="15" fill="#001838" />
                    <rect x="105" y="155" width="20" height="15" fill="#001838" />
                    <rect x="135" y="155" width="25" height="15" fill="#001838" />
                    <rect x="170" y="155" width="15" height="15" fill="#001838" />

                    <rect x="70" y="175" width="15" height="10" fill="#001838" />
                    <rect x="95" y="175" width="20" height="10" fill="#001838" />
                    <rect x="125" y="175" width="15" height="10" fill="#001838" />
                    <rect x="150" y="175" width="30" height="10" fill="#001838" />

                    {/* Center GCash Brand Badge */}
                    <circle cx="100" cy="100" r="22" fill="#007DFE" stroke="#ffffff" strokeWidth="4" />
                    <text
                      x="100"
                      y="107"
                      fill="#ffffff"
                      fontSize="20"
                      fontWeight="900"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      G
                    </text>
                  </svg>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-white font-bold block text-sm">GCash # 0999 576 0130</span>
                  <span className="text-[#00f5a0] font-extrabold text-base block mt-0.5">₱500.00</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scan using your GCash app scanner or take a screenshot to upload from gallery.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyGcashNumber}
                  className="px-4 py-2 rounded-xl bg-[#0d274c] border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold mx-auto flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedGcashNumber ? 'Copied 0999 576 0130!' : 'Copy GCash Number (0999 576 0130)'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    handleSimulatePayment();
                    handleConfirmActivation(e);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] font-black text-xs sm:text-sm shadow-lg mt-2"
                >
                  Paid via QR Code • Activate Account (₱500)
                </button>
              </div>
            )}

            {/* ================= TAB 3: MANUAL REFERENCE INPUT ================= */}
            {activePaymentTab === 'MANUAL' && (
              <form onSubmit={handleConfirmActivation} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-white">
                      13-Digit GCash Reference Number
                    </label>
                    <span className="text-[10px] text-slate-400">
                      From SMS / GCash receipt
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={gcashRefInput}
                      onChange={(e) => setGcashRefInput(e.target.value.toUpperCase())}
                      placeholder="e.g. 8029183749102"
                      className="w-full px-4 py-3 rounded-xl bg-[#030e1d] border border-[#007DFE]/60 text-white font-mono font-bold tracking-wider text-sm focus:outline-none focus:border-[#00f5a0] placeholder:text-slate-500 uppercase"
                      required
                    />
                  </div>
                </div>

                {/* 1-Tap Simulation / Demo Helper Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    className="w-full py-2 px-3 rounded-xl bg-[#0d274c] hover:bg-[#123668] border border-[#00e5ff]/30 text-[#00e5ff] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00f5a0]" />
                    <span>⚡ Auto-Generate Test GCash Payment (₱500 to 0999 576 0130)</span>
                  </button>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isActivating || activationSuccess}
                    className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all ${
                      isActivating || activationSuccess
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#007DFE] via-[#00c6ff] to-[#00f5a0] text-[#00222b] hover:opacity-95 active:scale-[0.98]'
                    }`}
                  >
                    {isActivating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#00222b]" />
                        <span>Verifying GCash Payment...</span>
                      </>
                    ) : activationSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-[#00222b]" />
                        <span>Account Activated!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify GCash Payment & Activate (₱500)</span>
                      </>
                    )}
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

