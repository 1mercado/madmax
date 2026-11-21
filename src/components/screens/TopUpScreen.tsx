import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  QrCode,
  Smartphone,
  Wallet,
  Search,
  Zap,
  Clock,
  ShieldCheck,
  Flame,
  Signal,
  X,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';
import {
  TELCO_BRANDS,
  PROMO_CATEGORIES,
  MOBILE_LOAD_PROMOS,
  TelcoId,
  PromoCategory,
  MobileLoadPromo,
  detectTelcoFromPhone,
} from '../../data/mobileLoadPromos';
import { lookupTelcoSubscriber, TelcoLookupResult } from '../../services/fintechApi';

export const TopUpScreen: React.FC = () => {
  const { userProfile, buyLoad, cashIn, navigateTo } = useDigiCash();

  const [activeTab, setActiveTab] = useState<'Mobile' | 'E-Wallet' | 'Games'>('Mobile');
  const [selectedTelco, setSelectedTelco] = useState<TelcoId>('Smart');
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phone || '09171234567');
  const [selectedCategory, setSelectedCategory] = useState<PromoCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<MobileLoadPromo | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autoDetectedNotice, setAutoDetectedNotice] = useState<string | null>(null);
  const [hlrLookup, setHlrLookup] = useState<TelcoLookupResult | null>(null);

  // Regular Airtime Load state (₱10 - ₱1,000)
  const [regularLoadAmount, setRegularLoadAmount] = useState<string>('50');

  // E-Wallet Cash-In states
  const [cashInAmount, setCashInAmount] = useState<string>('1000');
  const [error, setError] = useState<string | null>(null);

  const telcos: TelcoId[] = ['Smart', 'Globe', 'DITO', 'TNT'];
  const regularDenominations = [15, 30, 50, 100, 150, 200, 300, 500, 1000];

  // Detect network locally & query live Telco HLR API when phone number changes
  useEffect(() => {
    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (clean.length >= 4) {
      const detected = detectTelcoFromPhone(clean);
      if (detected && detected !== selectedTelco) {
        setSelectedTelco(detected);
        setAutoDetectedNotice(`Switched to ${detected} based on number prefix`);
      }
      const timer = setTimeout(async () => {
        const res = await lookupTelcoSubscriber(clean);
        if (res && res.success) {
          setHlrLookup(res);
          if (res.telco && res.telco !== selectedTelco) {
            setSelectedTelco(res.telco);
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setHlrLookup(null);
    }
  }, [phoneNumber]);

  // Filter promos based on telco, category, and search query
  const filteredPromos = useMemo(() => {
    return MOBILE_LOAD_PROMOS.filter((p) => {
      if (p.telco !== selectedTelco) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesPrice = p.price.toString().includes(q);
        const matchesData = p.dataAllowance.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesDesc && !matchesPrice && !matchesData) {
          return false;
        }
      }
      return true;
    });
  }, [selectedTelco, selectedCategory, searchQuery]);

  const activeTelcoInfo = TELCO_BRANDS[selectedTelco];

  const cashInChannels = [
    { name: 'BPI Online / Vybe', desc: 'Instant transfer via BPI App (0% Fee)' },
    { name: 'BDO Pay / Online', desc: 'Online banking cash-in (0% Fee)' },
    { name: 'GoTyme Bank Direct', desc: 'Free InstaPay cash-in from GoTyme account' },
    { name: 'UnionBank Online', desc: 'Instant 24/7 bank deposit (0% Fee)' },
    { name: '7-Eleven CLiQQ', desc: 'Barcode cash-in over the counter' },
    { name: 'Over the Counter', desc: 'Cebuana, Palawan & SM Bills Payment' },
  ];

  const gameTitles = [
    { title: 'Mobile Legends: 100 💎', price: 100 },
    { title: 'Valorant: 1,000 VP', price: 400 },
    { title: 'Steam Wallet ₱500', price: 500 },
    { title: 'Roblox: 800 Robux', price: 500 },
    { title: 'Genshin Impact: Blessing of the Welkin Moon', price: 249 },
  ];

  const handleSelectPromo = (promo: MobileLoadPromo) => {
    setError(null);
    setSelectedPromo(promo);
    setShowConfirmModal(true);
  };

  const handleBuyRegularLoad = () => {
    setError(null);
    const amt = parseFloat(regularLoadAmount);
    if (isNaN(amt) || amt < 10 || amt > 1000) {
      setError('Regular load amount must be between ₱10 and ₱1,000.');
      return;
    }
    const regularPromoObj: MobileLoadPromo = {
      id: `REG-${selectedTelco}-${amt}`,
      telco: selectedTelco,
      code: `REG ${amt}`,
      name: `${selectedTelco} Regular Load ₱${amt}`,
      price: amt,
      validity: '365 Days',
      dataAllowance: `₱${amt} Regular Airtime`,
      description: `Direct ${selectedTelco} regular airtime load credit valid for calls, texts, or promo registration.`,
      category: 'All',
      highlights: ['Instant HLR Top-Up', '1 Year Validity', '0% Convenience Fee'],
    };
    setSelectedPromo(regularPromoObj);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedPromo) return;
    setError(null);

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!/^(09|\+639|639)\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 11-digit Philippine mobile number (e.g. 0918 123 4567).');
      setShowConfirmModal(false);
      return;
    }

    if (userProfile.balance < selectedPromo.price) {
      setError(`Insufficient wallet balance. You have ₱${userProfile.balance.toFixed(2)}.`);
      setShowConfirmModal(false);
      return;
    }

    const res = buyLoad(cleanPhone, selectedPromo.telco, selectedPromo.price, selectedPromo.name);
    if (!res.success) {
      setError(res.error || 'Failed to buy load promo.');
      setShowConfirmModal(false);
    } else {
      setShowConfirmModal(false);
      navigateTo('MAIN');
    }
  };

  const handleFillMyNumber = () => {
    const myPhone = userProfile.phone || '09171234567';
    setPhoneNumber(myPhone);
  };

  const handleCashIn = (channel: string) => {
    setError(null);
    const parsedAmt = parseFloat(cashInAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }
    cashIn(parsedAmt, channel);
    navigateTo('MAIN');
  };

  const handleBuyGame = (game: { title: string; price: number }) => {
    setError(null);
    if (userProfile.balance < game.price) {
      setError(`Insufficient balance to purchase ${game.title}.`);
      return;
    }
    buyLoad(userProfile.phone || '09171234567', 'Gaming Pins', game.price, game.title);
    navigateTo('MAIN');
  };

  return (
    <div className="w-full space-y-4 pb-28 pt-1 max-w-3xl mx-auto px-1 sm:px-2">
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Top Up & Load</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                Direct Telco E-Load API
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Wallet Balance:{' '}
              <span className="font-bold text-[#00f5a0]">
                ₱{userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs (Mobile Load, Cash In Funds, Gaming Pins) */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#0a1f3a] border border-[#00e5ff]/20">
        {[
          { id: 'Mobile', label: 'Buy Load & Promos', icon: Smartphone },
          { id: 'E-Wallet', label: 'Cash In Funds', icon: Wallet },
          { id: 'Games', label: 'Gaming Pins', icon: Gamepad2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'Mobile' | 'E-Wallet' | 'Games');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#00e5ff] text-[#00222b] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MOBILE LOAD & PROMOS TAB */}
      {activeTab === 'Mobile' && (
        <div className="space-y-4">
          {/* Telco Selector with Authentic Brand Badges */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-[#00e5ff]" />
                Select Mobile Telco
              </label>
              <span className="text-[11px] text-slate-400">
                Active: <strong className="text-white">{activeTelcoInfo.name}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {telcos.map((t) => {
                const info = TELCO_BRANDS[t];
                const isSelected = selectedTelco === t;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setSelectedTelco(t);
                      setError(null);
                    }}
                    className={`py-2.5 px-1.5 rounded-2xl border text-center transition-all relative overflow-hidden flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-transparent shadow-lg scale-[1.02]'
                        : 'bg-[#091c35] border-[#00e5ff]/20 text-slate-300 hover:border-[#00e5ff]/50'
                    }`}
                    style={
                      isSelected
                        ? {
                            background: `linear-gradient(135deg, ${info.brandColor}33, #091c35)`,
                            borderColor: info.brandColor,
                            boxShadow: `0 0 15px ${info.brandColor}30`,
                          }
                        : {}
                    }
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mb-1"
                      style={{ backgroundColor: info.brandColor }}
                    />
                    <span className="text-xs font-black tracking-wide text-white">
                      {info.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {t === 'Smart'
                        ? 'Magic Data'
                        : t === 'Globe'
                        ? 'Go+ Promos'
                        : t === 'DITO'
                        ? 'Level Up'
                        : 'SurfSaya'}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: info.brandColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone Number Input Card with Auto-Prefix & Live HLR Detection */}
          <GlassCard className="p-3.5 space-y-2 border-[#00e5ff]/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00e5ff]" />
                Mobile Recipient Number
              </label>
              <button
                type="button"
                onClick={handleFillMyNumber}
                className="text-[11px] font-bold text-[#00e5ff] hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Load My Number
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold px-2 py-1 rounded bg-[#00e5ff]/15 text-[#00e5ff]">
                  +63
                </span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-16 pr-10 py-2.5 rounded-xl bg-[#07192f] border border-[#00e5ff]/30 text-white text-sm font-semibold tracking-wide placeholder:text-slate-500 focus:outline-none focus:border-[#00e5ff]"
                placeholder="0918 123 4567"
              />
              {phoneNumber && (
                <button
                  type="button"
                  onClick={() => setPhoneNumber('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {hlrLookup && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#00f5a0] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{hlrLookup.networkName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-300">
                  Prefix {hlrLookup.prefix} • {hlrLookup.hlrStatus}
                </span>
              </div>
            )}

            {autoDetectedNotice && !hlrLookup && (
              <div className="text-[11px] font-medium text-[#00f5a0] flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>{autoDetectedNotice}</span>
              </div>
            )}
          </GlassCard>

          {/* Regular Airtime Load Card (GCash / Maya / GoTyme Regular Load) */}
          <GlassCard className="p-4 space-y-3 border-[#00f5a0]/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00f5a0]" />
                  <span>Buy {selectedTelco} Regular Airtime Load</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Instant regular load credit (₱10 – ₱1,000) valid for 1 year
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0]">
                0% Fee
              </span>
            </div>

            {/* Quick Regular Load Denomination Chips */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
              {regularDenominations.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRegularLoadAmount(amt.toString())}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    regularLoadAmount === amt.toString()
                      ? 'bg-[#00f5a0] text-[#00222b] border-[#00f5a0] shadow-md'
                      : 'bg-[#081c36] border-[#00e5ff]/20 text-slate-300 hover:border-[#00e5ff]'
                  }`}
                >
                  ₱{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input + Instant Buy Button */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#00f5a0] font-bold text-sm">
                  ₱
                </span>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={regularLoadAmount}
                  onChange={(e) => setRegularLoadAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#07192f] border border-[#00e5ff]/30 text-white font-bold text-sm focus:outline-none focus:border-[#00f5a0]"
                  placeholder="Enter amount (10 - 1000)"
                />
              </div>
              <button
                type="button"
                onClick={handleBuyRegularLoad}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] text-xs font-black hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <span>Load ₱{regularLoadAmount || '0'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>

          {/* Telco Branding Banner */}
          <div
            className="rounded-2xl p-3 border flex items-center justify-between"
            style={{
              backgroundColor: activeTelcoInfo.accentBg,
              borderColor: `${activeTelcoInfo.brandColor}40`,
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md text-white"
                  style={{ backgroundColor: activeTelcoInfo.brandColor }}
                >
                  {activeTelcoInfo.name}
                </span>
                <span className="text-xs font-bold text-white">{activeTelcoInfo.fullName}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">{activeTelcoInfo.tagline}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-300">
                {filteredPromos.length} Data & Unli Promos
              </span>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedTelco} promos (e.g. Magic Data, Go50, Level Up, 99)...`}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#091f3a] border border-[#00e5ff]/20 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#00e5ff]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PROMO_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#00e5ff] text-[#00222b] font-bold shadow-md'
                        : 'bg-[#081d38] border border-[#00e5ff]/20 text-slate-300 hover:text-white hover:border-[#00e5ff]/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Promos Grid / List */}
          <div className="space-y-2.5">
            {filteredPromos.length === 0 ? (
              <GlassCard className="p-8 text-center space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-sm font-semibold text-white">No promos found</p>
                <p className="text-xs text-slate-400">
                  Try adjusting your search keyword or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-xs text-[#00e5ff] underline font-bold mt-2"
                >
                  Reset all filters
                </button>
              </GlassCard>
            ) : (
              filteredPromos.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => handleSelectPromo(promo)}
                  className="p-3.5 rounded-2xl bg-[#091e3b]/90 border border-[#00e5ff]/20 hover:border-[#00e5ff] transition-all cursor-pointer hover:shadow-lg hover:shadow-[#00e5ff]/10 group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-white tracking-wide group-hover:text-[#00e5ff] transition-colors">
                          {promo.code}
                        </span>
                        {promo.badge && (
                          <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-amber-400" />
                            {promo.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00e5ff]" />
                          {promo.validity}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200">{promo.name}</h4>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {promo.description}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {promo.highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#0d2a4f] text-slate-300 border border-[#00e5ff]/15 font-medium"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-between items-end self-stretch">
                      <div>
                        <div className="text-base font-black text-[#00f5a0]">₱{promo.price}</div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {promo.dataAllowance}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="mt-2 px-3 py-1.5 rounded-xl bg-[#00e5ff] text-[#00222b] text-xs font-bold shadow-md shadow-[#00e5ff]/20 group-hover:bg-[#00f5a0] transition-colors flex items-center gap-1"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && selectedPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0a1f3a] border border-[#00e5ff]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#00e5ff]/20">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeTelcoInfo.brandColor }}
                />
                <h3 className="text-base font-bold text-white">Review & Confirm E-Load</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-[#06162a] p-3.5 rounded-2xl border border-[#00e5ff]/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Recipient Phone:</span>
                <span className="font-mono font-bold text-white">
                  {phoneNumber || 'Not entered'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Network Provider:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeTelcoInfo.brandColor }}
                  />
                  {selectedPromo.telco}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Product / Promo:</span>
                <span className="font-bold text-[#00e5ff]">{selectedPromo.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Validity Period:</span>
                <span className="font-medium text-slate-300">{selectedPromo.validity}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#092244] border border-[#00e5ff]/20 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Inclusions & Benefits:
              </div>
              <p className="text-xs text-slate-300">{selectedPromo.description}</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Load Amount:</span>
                <span className="font-bold text-white">₱{selectedPromo.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Convenience Fee:</span>
                <span className="font-bold text-[#00f5a0]">FREE (₱0.00)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Loyalty Points to Earn:</span>
                <span className="font-bold text-[#ffb300]">
                  +{Math.max(2, Math.floor(selectedPromo.price / 20))} Points
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#00e5ff]/20">
                <span>Total Wallet Deduction:</span>
                <span className="text-lg font-black text-[#00f5a0]">
                  ₱{selectedPromo.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-[#061528] p-2.5 rounded-xl flex items-center justify-between">
              <span>Your Current Balance:</span>
              <span className="font-bold text-white">₱{userProfile.balance.toFixed(2)}</span>
            </div>

            {userProfile.balance < selectedPromo.price && (
              <div className="text-xs text-rose-400 font-semibold p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                Insufficient wallet balance. Please Cash In funds first.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={userProfile.balance < selectedPromo.price}
                onClick={handleConfirmPurchase}
                className={`py-3 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                  userProfile.balance >= selectedPromo.price
                    ? 'bg-gradient-to-r from-[#00f5a0] to-[#00e5ff] text-[#00222b] shadow-[#00e5ff]/25 hover:opacity-95 active:scale-[0.98]'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Pay ₱{selectedPromo.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASH IN / E-WALLET TAB */}
      {activeTab === 'E-Wallet' && (
        <div className="space-y-3.5">
          <div
            onClick={() => navigateTo('QR_SCANNER')}
            className="rounded-2xl bg-gradient-to-r from-[#00f5a0]/15 to-[#00e5ff]/15 border border-[#00f5a0]/40 p-3.5 flex items-center justify-between cursor-pointer hover:border-[#00f5a0] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/20 flex items-center justify-center text-[#00f5a0]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Scan Barcode / QR for Cash-In</div>
                <p className="text-[11px] text-slate-300">
                  Scan 7-Eleven CLiQQ receipt barcode or bank deposit QR
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
          </div>

          <GlassCard className="p-4 space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Amount to Deposit / Cash In
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#00e5ff] font-bold text-base">
                ₱
              </span>
              <input
                type="number"
                step="any"
                value={cashInAmount}
                onChange={(e) => setCashInAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#091f3a] border border-[#00e5ff]/30 text-white font-bold text-base focus:outline-none focus:border-[#00e5ff]"
                placeholder="1000"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['500', '1000', '2500', '5000'].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setCashInAmount(amt)}
                  className={`py-1 rounded-lg text-xs font-semibold border ${
                    cashInAmount === amt
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                      : 'bg-[#0f2b4d] border-[#00e5ff]/20 text-slate-300'
                  }`}
                >
                  ₱{amt}
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="text-xs text-slate-300 pt-1">Select Bank or Cash-In Partner:</div>
          {cashInChannels.map((channel) => (
            <GlassCard
              key={channel.name}
              onClick={() => handleCashIn(channel.name)}
              className="p-3.5 flex items-center justify-between hover:border-[#00f5a0] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/15 flex items-center justify-center text-[#00f5a0]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{channel.name}</h4>
                  <p className="text-xs text-slate-400">{channel.desc}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00f5a0] px-3 py-1.5 rounded-lg bg-[#00f5a0]/15">
                Deposit ₱{cashInAmount || '1,000'}
              </span>
            </GlassCard>
          ))}
        </div>
      )}

      {/* GAMING PINS TAB */}
      {activeTab === 'Games' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-300">Popular Gaming Pins & Game Credits:</div>
          {gameTitles.map((game) => (
            <GlassCard
              key={game.title}
              onClick={() => handleBuyGame(game)}
              className="p-4 flex items-center justify-between hover:border-[#00e5ff] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b06ab3]/20 flex items-center justify-center text-[#b06ab3]">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{game.title}</h4>
                  <p className="text-xs text-slate-400">Instant Voucher & Serial Pin Delivery</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00e5ff] px-3 py-1.5 rounded-lg bg-[#00e5ff]/15">
                Buy ₱{game.price}
              </span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
