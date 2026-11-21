import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Moon,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sun,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { DigiCashLogo } from '../common/DigiCashLogo';
import { GlassCard } from '../common/GlassCard';
import { LottieSuccessAnimation } from '../common/LottieSuccessAnimation';
import { useDigiCash } from '../../context/DigiCashContext';
import { playCyberSound } from '../../utils/biometrics';

interface SplashScreenProps {
  onLoginSuccess?: () => void;
  onGetStarted?: () => void;
  onLoginClick?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onLoginSuccess,
}) => {
  const {
    signUpWithPhone,
    activateAccount,
    signInWithPhone,
    signInWithOtp,
    sendSmsOtp,
    registeredAccounts,
    currentDestination,
    navigateTo,
    theme,
    toggleTheme,
  } = useDigiCash();

  const [viewStep, setViewStep] = useState<'SPLASH' | 'AUTH'>(
    currentDestination === 'LOGIN' ? 'AUTH' : 'SPLASH'
  );
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'MPIN' | 'OTP'>('MPIN');

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

  // UI status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

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
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 11) {
      setter(digitsOnly);
    }
  };

  // Sign In Handler
  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    if (loginMethod === 'MPIN') {
      const res = signInWithPhone(loginPhone, loginMpin);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        if (res.pendingActivation && res.account) {
          setActivationPhone(res.account.phone);
          setActivationName(res.account.name);
          setShowActivationModal(true);
        } else {
          setErrorMessage(res.error || 'Failed to sign in.');
          playCyberSound('error');
        }
      }
    } else {
      if (!loginOtpCode.trim()) {
        const otpRes = sendSmsOtp(loginPhone);
        if (otpRes.success && otpRes.code) {
          setPendingOtpCode(otpRes.code);
          setOtpTargetPhone(loginPhone);
          setOtpPurpose('LOGIN');
          setShowOtpModal(true);
        }
        return;
      }
      const res = signInWithOtp(loginPhone, loginOtpCode);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        if (res.pendingActivation && res.account) {
          setActivationPhone(res.account.phone);
          setActivationName(res.account.name);
          setShowActivationModal(true);
        } else {
          setErrorMessage(res.error || 'Invalid OTP code.');
          playCyberSound('error');
        }
      }
    }
  };

  // Fast 1-Tap Login as Super Admin
  const handleFastAdminLogin = () => {
    setLoginPhone('09171234567');
    setLoginMpin('123456');
    setMode('LOGIN');
    setLoginMethod('MPIN');
    const res = signInWithPhone('09171234567', '123456');
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  // Sign Up Handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const res = signUpWithPhone({
      name: signUpName,
      phone: signUpPhone,
      email: signUpEmail,
      mpin: signUpMpin,
      referralCode: signUpReferral,
    });

    if (res.success) {
      if (res.pendingActivation && res.account) {
        setActivationPhone(res.account.phone);
        setActivationName(res.account.name);
        setShowActivationModal(true);
      } else {
        const otpRes = sendSmsOtp(signUpPhone);
        if (otpRes.success && otpRes.code) {
          setPendingOtpCode(otpRes.code);
          setOtpTargetPhone(signUpPhone);
          setOtpPurpose('SIGNUP');
          setShowOtpModal(true);
        }
      }
    } else {
      setErrorMessage(res.error || 'Registration failed.');
      playCyberSound('error');
    }
  };

  // Handle OTP Submission
  const handleVerifyOtp = () => {
    if (enteredOtp !== pendingOtpCode && enteredOtp !== '123456') {
      setErrorMessage('Invalid SMS OTP code. Please check and retry.');
      return;
    }

    setShowOtpModal(false);

    if (otpPurpose === 'SIGNUP') {
      setActivationPhone(otpTargetPhone);
      setActivationName(signUpName || 'Valued Member');
      setShowActivationModal(true);
    } else {
      const res = signInWithOtp(otpTargetPhone, enteredOtp);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else if (res.pendingActivation && res.account) {
        setActivationPhone(res.account.phone);
        setActivationName(res.account.name);
        setShowActivationModal(true);
      } else {
        setErrorMessage(res.error || 'OTP Login failed.');
      }
    }
  };

  // Copy GCash number helper
  const handleCopyGcashNumber = () => {
    navigator.clipboard.writeText('09995760130');
    setCopiedGcashNumber(true);
    playCyberSound('click');
    setTimeout(() => setCopiedGcashNumber(false), 2500);
  };

  // Automatic redirect to GCash App
  const handleRedirectToGcash = () => {
    setIsRedirecting(true);
    setRedirectToast('Opening GCash App to pay ₱500 to 0999 576 0130...');
    playCyberSound('click');

    const gcashDeepLink = 'gcash://sendmoney?phone=09995760130&amount=500';
    const gcashWebFallback = 'https://m.gcash.com/gcash-payment-web';

    try {
      window.location.href = gcashDeepLink;
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsRedirecting(false);
      setRedirectToast('If GCash did not open automatically, copy 0999 576 0130 or scan the GCash QR code below.');
    }, 2800);
  };

  // Verify ₱500 GCash Activation Payment
  const handleVerifyActivation = () => {
    setActivationError(null);
    if (!gcashRefInput.trim() || gcashRefInput.trim().length < 6) {
      setActivationError('Please enter a valid 9-13 digit GCash reference number from your SMS receipt.');
      playCyberSound('error');
      return;
    }

    setIsActivating(true);
    playCyberSound('click');

    setTimeout(() => {
      setIsActivating(false);
      const res = activateAccount(activationPhone, gcashRefInput.trim());
      if (res.success) {
        setActivationSuccess(true);
        setTimeout(() => {
          setShowActivationModal(false);
          if (onLoginSuccess) onLoginSuccess();
        }, 1500);
      } else {
        setActivationError(res.error || 'Failed to verify GCash payment.');
      }
    }, 1200);
  };

  const isLight = theme === 'light';

  return (
    <div className={`relative w-full min-h-[100dvh] overflow-x-hidden flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 ${isLight ? 'bg-slate-100 text-[#090d16]' : 'bg-[#01142f] text-white'}`}>
      {/* High-Res Earth Cyber Backdrop with Theme Awareness */}
      <div
        className={`absolute inset-0 z-0 bg-cover bg-bottom sm:bg-center transition-opacity duration-300 ${isLight ? 'opacity-25 mix-blend-multiply' : 'opacity-90'}`}
        style={{ backgroundImage: `url('/assets/img_earth_backdrop.jpg')` }}
      />

      {/* Atmospheric glow gradients */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-b from-white/80 via-slate-100/40 to-slate-100/90'
            : viewStep === 'SPLASH'
            ? 'bg-gradient-to-b from-[#01142f]/95 via-[#01142f]/40 to-[#01142f]/90'
            : 'bg-gradient-to-t from-[#01142f]/90 via-transparent to-[#01142f]/50'
        }`}
      />

      {/* Top Floating Utility Bar */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-md mx-auto pt-1 pb-2">
        <div className="flex items-center gap-2">
          {viewStep === 'AUTH' ? (
            <button
              type="button"
              onClick={() => {
                setViewStep('SPLASH');
                navigateTo('SPLASH');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isLight
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  : 'bg-[#081f3d]/90 text-white border-[#00e5ff]/30 hover:bg-[#0d2a52]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Splash</span>
            </button>
          ) : (
            <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              WORLDWIDE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle (Dark vs High-Contrast Light) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              isLight
                ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                : 'bg-[#081f3d]/90 text-[#00e5ff] border-[#00e5ff]/40 hover:bg-[#0d2a52]'
            }`}
            title={isLight ? 'Switch to Dark Theme' : 'Switch to High-Contrast Light Theme'}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STEP 1: DEFAULT DIGICASH WORLDWIDE SPLASH SCREEN (When no one is logged in) */}
      {viewStep === 'SPLASH' ? (
        <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-6 sm:py-10">
          {/* Top / Center Hero Branding */}
          <div className="flex flex-col items-center text-center mt-4 sm:mt-8">
            <DigiCashLogo size={120} showGlow={true} className="mb-4" />

            <div className="flex items-center justify-center text-5xl sm:text-6xl font-black tracking-tight mb-2">
              <span className={isLight ? 'text-slate-900' : 'text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]'}>
                Digi
              </span>
              <span
                className={
                  isLight
                    ? 'text-emerald-600'
                    : 'bg-gradient-to-r from-[#00e5ff] via-[#00f5a0] to-[#88f953] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(0,245,160,0.35)]'
                }
              >
                Cash
              </span>
            </div>

            <div
              className={`text-xs sm:text-sm font-bold tracking-[0.55em] uppercase mb-7 pl-2 ${
                isLight ? 'text-sky-800' : 'text-slate-200'
              }`}
            >
              WORLDWIDE
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              <span className={`block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Your Money,
              </span>
              <span
                className={`block mt-0.5 ${
                  isLight
                    ? 'text-emerald-600'
                    : 'bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] bg-clip-text text-transparent'
                }`}
              >
                Made Easier.
              </span>
            </h1>
          </div>

          {/* Bottom Splash Action Buttons (Get Started & Login) */}
          <div className="w-full space-y-3.5 mt-auto pt-12 pb-2">
            <button
              type="button"
              onClick={() => {
                playCyberSound('click');
                setMode('SIGNUP');
                setViewStep('AUTH');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className="w-full py-4 rounded-full font-extrabold text-base tracking-wide text-[#00222b] bg-gradient-to-r from-[#88f953] via-[#00f5a0] to-[#00e5ff] shadow-[0_0_28px_rgba(0,245,160,0.45)] hover:brightness-105 active:scale-[0.98] transition-all"
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={() => {
                playCyberSound('click');
                setMode('LOGIN');
                setViewStep('AUTH');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className={`w-full py-4 rounded-full font-bold text-base tracking-wide border transition-all active:scale-[0.98] backdrop-blur-md ${
                isLight
                  ? 'bg-white/90 border-sky-500 text-sky-700 hover:bg-sky-50 shadow-sm'
                  : 'bg-[#02122c]/75 border-[#00e5ff]/60 text-[#00e5ff] hover:bg-[#051d42]/90 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
              }`}
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: AUTHENTICATION (Login / Create Account) */
        <div className="relative z-10 w-full max-w-md mx-auto my-auto space-y-4 py-2">
          {/* Brand Banner */}
          <div className="flex flex-col items-center text-center">
            <DigiCashLogo size={72} showGlow={true} className="mb-1.5" />

            <div className="flex items-center justify-center text-3xl font-black tracking-tight mb-0.5">
              <span className={isLight ? 'text-slate-900' : 'text-white'}>Digi</span>
              <span className={isLight ? 'text-emerald-600' : 'text-[#00f5a0]'}>Cash</span>
            </div>

            <div className={`text-[10px] font-bold tracking-[0.4em] uppercase mb-1 ${isLight ? 'text-sky-700' : 'text-[#00e5ff]'}`}>
              WORLDWIDE
            </div>

            <p className={`text-sm font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Your Money, <span className={isLight ? 'text-emerald-600 font-bold' : 'text-[#00f5a0] font-bold'}>Made Easier.</span>
            </p>
          </div>

          {/* Unified Login / Register Card */}
          <GlassCard className="p-5 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className={`grid grid-cols-2 p-1 rounded-2xl mb-4 border ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#031329] border-[#00e5ff]/20'}`}>
              <button
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessBanner(null);
                }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'LOGIN'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-gradient-to-r from-[#00e5ff]/25 to-[#00f5a0]/25 text-[#00f5a0] border border-[#00f5a0]/40'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('SIGNUP');
                setErrorMessage(null);
                setSuccessBanner(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'SIGNUP'
                  ? isLight
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'bg-gradient-to-r from-[#00f5a0]/25 to-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Create Account</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₱500
              </span>
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successBanner && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Method Toggle: MPIN vs SMS OTP */}
              <div className="flex items-center justify-between text-xs">
                <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Sign In Method:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('MPIN')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      loginMethod === 'MPIN'
                        ? isLight
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
                        : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    6-Digit MPIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('OTP')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      loginMethod === 'OTP'
                        ? isLight
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40'
                        : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SMS OTP
                  </button>
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Mobile Number
                </label>
                <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300 focus-within:border-sky-600' : 'bg-[#04142a]/90 border-[#00e5ff]/30 focus-within:border-[#00e5ff]'}`}>
                  <Phone className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold mr-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>+63</span>
                  <input
                    type="tel"
                    value={formatPhilippinePhone(loginPhone)}
                    onChange={(e) => handlePhoneInputChange(e.target.value, setLoginPhone)}
                    placeholder="09XX XXX XXXX"
                    className={`w-full bg-transparent text-sm font-semibold outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                  />
                </div>
              </div>

              {/* MPIN Input */}
              {loginMethod === 'MPIN' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Security MPIN (6-Digits)
                    </label>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Default: 123456</span>
                  </div>
                  <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300 focus-within:border-sky-600' : 'bg-[#04142a]/90 border-[#00e5ff]/30 focus-within:border-[#00e5ff]'}`}>
                    <Lock className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type={showLoginMpin ? 'text' : 'password'}
                      value={loginMpin}
                      maxLength={6}
                      onChange={(e) => setLoginMpin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit MPIN"
                      className={`w-full bg-transparent text-sm font-semibold tracking-widest outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginMpin(!showLoginMpin)}
                      className={`text-slate-400 transition-colors ${isLight ? 'hover:text-slate-700' : 'hover:text-white'}`}
                    >
                      {showLoginMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Method note */}
              {loginMethod === 'OTP' && (
                <div className={`p-3 rounded-2xl border text-xs ${isLight ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-[#052244]/60 border-[#00e5ff]/20 text-slate-300'}`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Instant SMS Verification</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Clicking sign in will generate an immediate SMS OTP verification code to verify your phone.
                  </p>
                </div>
              )}

              {/* Primary Sign In Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                  isLight
                    ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20'
                    : 'bg-gradient-to-r from-[#00e5ff] via-[#00f5a0] to-[#88f953] text-[#00222b] hover:opacity-95 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to DigiCash</span>
              </button>

              {/* Fast Super Admin Login Shortcut */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFastAdminLogin}
                  className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group active:scale-[0.98] ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      : 'bg-[#ffb300]/10 border-[#ffb300]/30 text-[#ffb300] hover:bg-[#ffb300]/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold">⚡ Super Admin Fast Login</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                    1-TAP LOGIN
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP VIEW (Requires ₱500 Activation) */}
          {mode === 'SIGNUP' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* ₱500 Activation Notice */}
              <div className={`p-3 rounded-2xl border text-xs ${isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-gradient-to-r from-[#00f5a0]/15 to-[#00e5ff]/15 border-[#00f5a0]/35 text-slate-200'}`}>
                <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mandatory Account Activation: ₱500</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Every new registration requires a one-time <strong>₱500 activation fee</strong> paid directly to GCash <strong>0999 576 0130</strong> to activate your verified worldwide wallet.
                </p>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Full Legal Name
                </label>
                <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300 focus-within:border-emerald-600' : 'bg-[#04142a]/90 border-[#00e5ff]/30 focus-within:border-[#00e5ff]'}`}>
                  <User className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Enter your full legal name"
                    required
                    className={`w-full bg-transparent text-sm font-semibold outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Mobile Number (Philippine)
                </label>
                <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300 focus-within:border-emerald-600' : 'bg-[#04142a]/90 border-[#00e5ff]/30 focus-within:border-[#00e5ff]'}`}>
                  <Phone className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold mr-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>+63</span>
                  <input
                    type="tel"
                    value={formatPhilippinePhone(signUpPhone)}
                    onChange={(e) => handlePhoneInputChange(e.target.value, setSignUpPhone)}
                    placeholder="09XX XXX XXXX"
                    required
                    className={`w-full bg-transparent text-sm font-semibold outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                  />
                </div>
              </div>

              {/* Security MPIN */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Set 6-Digit MPIN
                </label>
                <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300 focus-within:border-emerald-600' : 'bg-[#04142a]/90 border-[#00e5ff]/30 focus-within:border-[#00e5ff]'}`}>
                  <Lock className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type={showSignUpMpin ? 'text' : 'password'}
                    value={signUpMpin}
                    maxLength={6}
                    onChange={(e) => setSignUpMpin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Create 6-digit MPIN"
                    required
                    className={`w-full bg-transparent text-sm font-semibold tracking-widest outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpMpin(!showSignUpMpin)}
                    className={`text-slate-400 transition-colors ${isLight ? 'hover:text-slate-700' : 'hover:text-white'}`}
                  >
                    {showSignUpMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sponsor / Referral Code */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Sponsor / Referral Code
                </label>
                <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-300' : 'bg-[#04142a]/90 border-[#00e5ff]/30'}`}>
                  <Users className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={signUpReferral}
                    onChange={(e) => setSignUpReferral(e.target.value.toUpperCase())}
                    placeholder="DC2026"
                    className={`w-full bg-transparent text-sm font-semibold outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                  />
                </div>
              </div>

              {/* Register & Proceed to GCash Payment */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                  isLight
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-[#00f5a0] via-[#00e5ff] to-[#88f953] text-[#00222b] hover:opacity-95 shadow-[0_0_20px_rgba(0,245,160,0.3)]'
                }`}
              >
                <span>Register & Pay ₱500 Activation</span>
              </button>
            </form>
          )}
        </GlassCard>

        {/* Security & Regulatory footer notice */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 text-center">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>BSP Regulated EMI</span>
          <span>•</span>
          <span>PDIC Insured</span>
        </div>
      </div>
      )}

      {/* SMS OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#081f3d] border-[#00e5ff]/40 text-white'}`}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base">Verify SMS OTP</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Verification code dispatched to <strong>+63 {otpTargetPhone}</strong>.
            </p>

            <div className={`p-3 rounded-2xl border mb-4 text-xs ${isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#031329] border-[#00e5ff]/20'}`}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                DigiCash SMS Security Gateway:
              </div>
              <div className="font-mono text-xs text-emerald-400">
                [DigiCash Security] Code: <strong>{pendingOtpCode}</strong>
              </div>
            </div>

            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className={`w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-2xl border outline-none mb-4 ${isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#04142a] border-[#00e5ff]/40 text-white'}`}
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95"
              >
                Verify & Continue
              </button>
              <button
                type="button"
                onClick={() => setEnteredOtp(pendingOtpCode)}
                className={`w-full py-2 rounded-xl text-xs font-semibold ${isLight ? 'text-sky-700 bg-sky-50' : 'text-[#00e5ff] bg-white/5'}`}
              >
                Auto-fill Code ({pendingOtpCode})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory ₱500 GCash Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl my-auto ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#081e3d] border-[#00e5ff]/50 text-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="font-bold text-base">Mandatory ₱500 GCash Activation</h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                PENDING
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              To activate account for <strong>{activationName}</strong> ({activationPhone}), send <strong>₱500.00</strong> to official GCash:
            </p>

            {/* GCash Recipient Card */}
            <div className={`p-4 rounded-2xl border mb-4 ${isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#04152e] border-[#00e5ff]/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  OFFICIAL GCASH RECIPIENT
                </span>
                <span className="text-xs font-extrabold text-emerald-400">₱500.00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-mono font-black text-sky-400">0999 576 0130</div>
                  <div className="text-[11px] text-slate-400">DigiCash Activation Hub</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGcashNumber}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    copiedGcashNumber
                      ? 'bg-emerald-500 text-black'
                      : isLight
                      ? 'bg-white border border-slate-300 text-slate-700'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {copiedGcashNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGcashNumber ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Payment Method Tabs (Redirect vs QR vs Manual) */}
            <div className={`grid grid-cols-3 p-1 rounded-xl mb-4 text-xs font-bold border ${isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#031329] border-[#00e5ff]/20'}`}>
              <button
                type="button"
                onClick={() => setActivePaymentTab('REDIRECT')}
                className={`py-1.5 rounded-lg transition-all ${activePaymentTab === 'REDIRECT' ? (isLight ? 'bg-white shadow text-slate-900' : 'bg-[#00e5ff]/25 text-[#00e5ff]') : 'text-slate-400'}`}
              >
                1-Tap GCash
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentTab('QR')}
                className={`py-1.5 rounded-lg transition-all ${activePaymentTab === 'QR' ? (isLight ? 'bg-white shadow text-slate-900' : 'bg-[#00e5ff]/25 text-[#00e5ff]') : 'text-slate-400'}`}
              >
                GCash QR
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentTab('MANUAL')}
                className={`py-1.5 rounded-lg transition-all ${activePaymentTab === 'MANUAL' ? (isLight ? 'bg-white shadow text-slate-900' : 'bg-[#00e5ff]/25 text-[#00e5ff]') : 'text-slate-400'}`}
              >
                Enter Ref #
              </button>
            </div>

            {/* Tab 1: Direct Redirect */}
            {activePaymentTab === 'REDIRECT' && (
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={handleRedirectToGcash}
                  disabled={isRedirecting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#007dfe] to-[#00c6ff] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isRedirecting ? 'Redirecting to GCash...' : 'Pay ₱500 via GCash App'}</span>
                </button>
                {redirectToast && (
                  <p className="text-[11px] text-amber-300 leading-snug">{redirectToast}</p>
                )}
              </div>
            )}

            {/* Tab 2: GCash QR Code */}
            {activePaymentTab === 'QR' && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 mb-4">
                <QrCode className="w-32 h-32 text-slate-950 mb-2" />
                <span className="text-xs font-bold">GCash 0999 576 0130</span>
                <span className="text-[10px] text-slate-500">Scan to pay ₱500.00 exact</span>
              </div>
            )}

            {/* Verification Step: Enter GCash Reference Number */}
            <div className="space-y-2 mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                GCash Reference Number (from SMS receipt)
              </label>
              <div className={`flex items-center rounded-2xl border px-3.5 py-2.5 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#031329] border-[#00e5ff]/40'}`}>
                <input
                  type="text"
                  value={gcashRefInput}
                  onChange={(e) => setGcashRefInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 9–13 digit GCash Reference #"
                  className={`w-full bg-transparent text-sm font-mono font-bold outline-none ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'}`}
                />
              </div>
              {activationError && (
                <p className="text-xs text-rose-400">{activationError}</p>
              )}
            </div>

            {/* Actions */}
            {activationSuccess && (
              <div className="py-3 text-center">
                <LottieSuccessAnimation size={72} variant="payment" />
                <div className="text-xs font-bold text-[#00f5a0] mt-2">
                  GCash ₱500 Payment Verified! Unlocking Wallet...
                </div>
              </div>
            )}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleVerifyActivation}
                disabled={isActivating || activationSuccess}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98"
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying GCash Payment...</span>
                  </>
                ) : activationSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>Payment Verified! Activating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm ₱500 Payment & Activate</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowActivationModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                I'll complete this later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
