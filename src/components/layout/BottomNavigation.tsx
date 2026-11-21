import React from 'react';
import { ArrowLeftRight, Grid, Home, User } from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { BottomNavTab } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { selectedBottomTab, setBottomTab, currentDestination, isAuthenticated, theme } = useDigiCash();

  // Hide bottom nav when not logged in or on full-screen flows (Splash, Login, Scanner)
  if (
    !isAuthenticated ||
    currentDestination === 'SPLASH' ||
    currentDestination === 'LOGIN' ||
    currentDestination === 'QR_SCANNER'
  ) {
    return null;
  }

  const isLight = theme === 'light';

  const tabs: Array<{ id: BottomNavTab; label: string; icon: React.ElementType }> = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'SERVICES', label: 'Services', icon: Grid },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md md:max-w-xl mx-auto px-3 sm:px-4 pointer-events-none"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div
        className={`rounded-2xl shadow-2xl backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-around pointer-events-auto border transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-300 text-slate-700 shadow-slate-300/40'
            : 'bg-[#081c38]/95 border-[#00e5ff]/35 text-slate-400'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedBottomTab === tab.id && currentDestination === 'MAIN';
          return (
            <button
              key={tab.id}
              onClick={() => setBottomTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isSelected
                  ? isLight
                    ? 'text-sky-700 font-bold scale-105'
                    : 'text-[#00e5ff] font-bold scale-105'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isSelected
                    ? isLight
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-[#00e5ff]/20 text-[#00e5ff]'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
