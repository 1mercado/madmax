import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { DigiCashProvider, useDigiCash } from './context/DigiCashContext';
import { SplashScreen } from './components/screens/SplashScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { SendMoneyScreen } from './components/screens/SendMoneyScreen';
import { ReceiveMoneyScreen } from './components/screens/ReceiveMoneyScreen';
import { QrScannerScreen } from './components/screens/QrScannerScreen';
import { PayBillsScreen } from './components/screens/PayBillsScreen';
import { TopUpScreen } from './components/screens/TopUpScreen';
import { SavingsVaultScreen } from './components/screens/SavingsVaultScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import { ReferralScreen } from './components/screens/ReferralScreen';
import { VipTiersScreen } from './components/screens/VipTiersScreen';
import { BuilderUpgradeScreen } from './components/screens/BuilderUpgradeScreen';
import { TransactionsHistoryScreen } from './components/screens/TransactionsHistoryScreen';
import { ServicesHubScreen } from './components/screens/ServicesHubScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BudgetPlannerScreen } from './components/screens/BudgetPlannerScreen';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { TransactionReceiptModal } from './components/common/TransactionReceiptModal';
import { SimulationResultModal } from './components/common/SimulationResultModal';

const AppContent: React.FC = () => {
  const {
    currentDestination,
    selectedBottomTab,
    navigateTo,
    activeReceiptTransaction,
    dismissReceipt,
    activeSimulationResult,
    dismissSimulation,
    theme,
    toggleTheme,
  } = useDigiCash();

  // Render active destination
  const renderScreen = () => {
    switch (currentDestination) {
      case 'SPLASH':
      case 'LOGIN':
        return (
          <SplashScreen
            onLoginSuccess={() => navigateTo('MAIN')}
            onGetStarted={() => navigateTo('MAIN')}
            onLoginClick={() => navigateTo('MAIN')}
          />
        );
      case 'SEND_MONEY':
        return <SendMoneyScreen />;
      case 'RECEIVE_MONEY':
        return <ReceiveMoneyScreen />;
      case 'QR_SCANNER':
        return <QrScannerScreen />;
      case 'PAY_BILLS':
        return <PayBillsScreen />;
      case 'TOP_UP':
        return <TopUpScreen />;
      case 'BUDGET_PLANNER':
        return <BudgetPlannerScreen />;
      case 'SAVINGS_VAULT':
        return <SavingsVaultScreen />;
      case 'REWARDS':
        return <RewardsScreen />;
      case 'REFERRALS':
        return <ReferralScreen />;
      case 'VIP_TIERS':
        return <VipTiersScreen />;
      case 'BUILDER_UPGRADE':
        return <BuilderUpgradeScreen />;
      case 'TRANSACTIONS_FULL':
        return <TransactionsHistoryScreen />;
      case 'MAIN':
      default:
        switch (selectedBottomTab) {
          case 'TRANSACTIONS':
            return <TransactionsHistoryScreen />;
          case 'SERVICES':
            return <ServicesHubScreen />;
          case 'PROFILE':
            return <ProfileScreen />;
          case 'HOME':
          default:
            return <HomeScreen />;
        }
    }
  };

  const isSplashOrScanner =
    currentDestination === 'SPLASH' ||
    currentDestination === 'LOGIN' ||
    currentDestination === 'QR_SCANNER';

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-[100dvh] w-full relative overflow-x-hidden flex flex-col justify-between selection:bg-[#00e5ff] selection:text-[#00222b] transition-colors duration-200 ${
        isLight ? 'bg-slate-100 text-[#090d16]' : 'bg-[#020712] text-white'
      }`}
    >
      {/* Dynamic Ambient Gradient Backdrop Layers */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isLight
            ? `
              radial-gradient(circle at 15% 15%, rgba(2, 132, 199, 0.10) 0%, transparent 45%),
              radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.10) 0%, transparent 45%),
              linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
            `
            : `
              radial-gradient(circle at 15% 15%, rgba(0, 229, 255, 0.20) 0%, transparent 45%),
              radial-gradient(circle at 85% 30%, rgba(0, 245, 160, 0.16) 0%, transparent 45%),
              radial-gradient(circle at 20% 85%, rgba(124, 77, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 85% 85%, rgba(0, 180, 216, 0.14) 0%, transparent 45%),
              linear-gradient(180deg, #020712 0%, #05142d 50%, #010610 100%)
            `,
        }}
      />

      {/* Floating luminous glow orbs */}
      {!isLight && (
        <>
          <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#00e5ff]/10 rounded-full blur-[130px] pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] right-[15%] w-[450px] h-[450px] bg-[#00f5a0]/10 rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      )}

      {/* Discreet Desktop Top Theme Quick Toggle */}
      {!isSplashOrScanner && (
        <div className="hidden lg:flex fixed top-3 right-6 z-40 items-center">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-md backdrop-blur-md ${
              isLight
                ? 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white'
                : 'bg-[#081f3d]/90 text-[#00e5ff] border-[#00e5ff]/40 hover:bg-[#0e2a52]'
            }`}
            title={isLight ? 'Switch to Dark Cyber Theme' : 'Switch to High-Contrast Light Theme'}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Borderless Responsive Screen Container (100% edge-to-edge on mobile, fluid responsive on tablet/desktop) */}
      <main
        className="w-full flex-1 relative z-10 flex flex-col border-0 m-0 p-0"
        style={{
          paddingTop: isSplashOrScanner
            ? '0px'
            : 'max(0.25rem, env(safe-area-inset-top, 0.25rem))',
          paddingBottom: isSplashOrScanner
            ? '0px'
            : 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
        }}
      >
        <div
          className={`w-full flex-1 flex flex-col ${
            isSplashOrScanner
              ? 'w-full p-0'
              : 'w-full max-w-2xl lg:max-w-3xl mx-auto px-3.5 sm:px-6 pb-24'
          }`}
        >
          <div className="flex-1 w-full">{renderScreen()}</div>
        </div>

        {/* Persistent Bottom Bar for Navigation */}
        <BottomNavigation />

        {/* Global Modals */}
        <TransactionReceiptModal
          transaction={activeReceiptTransaction}
          onDismiss={dismissReceipt}
        />

        <SimulationResultModal
          result={activeSimulationResult}
          onDismiss={dismissSimulation}
          onOpenBuilderUpgrade={() => navigateTo('BUILDER_UPGRADE')}
        />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <DigiCashProvider>
      <AppContent />
    </DigiCashProvider>
  );
}
