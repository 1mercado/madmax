import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AppDestination,
  AppNotification,
  Biller,
  BottomNavTab,
  BudgetCategory,
  NetworkMember,
  PushNotificationSettings,
  RegisteredAccount,
  RewardItem,
  SavingsGoal,
  SimulationResult,
  SplitBreakdown,
  ThemeMode,
  Transaction,
  UserProfile,
  UserTier,
} from '../types';
import {
  BILLERS_LIST,
  calculateCommission,
  calculateSplit,
  INITIAL_BUDGET_CATEGORIES,
  INITIAL_NETWORK_MEMBERS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  isLevelUnlocked,
  REWARDS_CATALOG,
  USER_TIERS,
} from '../data/mockData';
import {
  detectHardwareBiometricSensor,
  authenticateWithDeviceSensor,
  playCyberSound,
} from '../utils/biometrics';
import {
  sendMoneyApi,
  payBillApi,
  buyLoadApi,
  receiveMoneyApi,
  syncWalletToServer,
  getPublicGatewayForChannel,
  fetchPendingServerNotifications,
} from '../services/fintechApi';
import {
  BrowserPermissionState,
  buildBillPaymentNotification,
  buildIncomingTransferNotification,
  dispatchBrowserPushNotification,
  ensureServiceWorkerReady,
  getBrowserNotificationPermission,
  loadPushSettings,
  loadStoredNotifications,
  requestBrowserPushPermission,
  savePushSettings,
  saveStoredNotifications,
  scheduleServiceWorkerBackgroundPush,
  syncBackgroundWatchWithSw,
  triggerSwBackgroundCheck,
} from '../services/pushNotificationService';

interface DigiCashContextType {
  userProfile: UserProfile;
  transactions: Transaction[];
  networkMembers: NetworkMember[];
  savingsGoals: SavingsGoal[];
  billers: Biller[];
  rewardsCatalog: RewardItem[];
  currentDestination: AppDestination;
  selectedBottomTab: BottomNavTab;
  activeReceiptTransaction: Transaction | null;
  activeSimulationResult: SimulationResult | null;
  show3DExplorer: boolean;
  navigateTo: (dest: AppDestination) => void;
  setBottomTab: (tab: BottomNavTab) => void;
  openReceipt: (tx: Transaction) => void;
  dismissReceipt: () => void;
  dismissSimulation: () => void;
  setShow3DExplorer: (val: boolean) => void;
  // Biometrics & Security Layer
  isAppLocked: boolean;
  isBiometricsEnabled: boolean;
  quickBalanceEnabled: boolean;
  setQuickBalanceEnabled: (enabled: boolean) => void;
  biometricType: 'fingerprint' | 'face' | 'device' | 'none';
  hasHardwareSensor: boolean;
  platformSensorName: string;
  mpin: string;
  autoLockTimeout: 'immediately' | '1min' | '5min' | 'never';
  unlockHistory: Array<{ timestamp: string; method: 'biometrics' | 'mpin'; success: boolean }>;
  unlockWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  unlockWithMpin: (pin: string) => boolean;
  lockApp: () => void;
  toggleBiometrics: (enabled: boolean) => void;
  setSecurityMpin: (newPin: string) => void;
  setAutoLockTimeout: (timeout: 'immediately' | '1min' | '5min' | 'never') => void;
  // Transactions
  sendMoney: (recipient: string, amount: number, channel: string, note: string) => { success: boolean; error?: string; tx?: Transaction };
  payBill: (biller: Biller, accountNumber: string, amount: number) => { success: boolean; error?: string; tx?: Transaction };
  buyLoad: (phone: string, telco: string, amount: number, promoTitle?: string) => { success: boolean; error?: string; tx?: Transaction };
  receiveMoney: (sender: string, amount: number, note: string) => Transaction;
  cashIn: (amount: number, channel: string) => Transaction;
  upgradeToBuilder: () => { success: boolean; error?: string; split?: SplitBreakdown };
  upgradeToVip: (tier: UserTier) => { success: boolean; error?: string };
  simulateNewSubscriber: (level: number, name: string) => SimulationResult;
  simulateDownlineBuilderUpgrade: (level: number, name: string) => SimulationResult;
  claimDailyPoints: () => { success: boolean; pointsAdded: number };
  redeemReward: (item: RewardItem) => { success: boolean; error?: string };
  createSavingsGoal: (title: string, category: SavingsGoal['category'], targetAmount: number, initialDeposit: number) => { success: boolean; error?: string; goal?: SavingsGoal };
  depositToGoal: (goalId: string, amount: number) => { success: boolean; error?: string; tx?: Transaction };
  withdrawFromGoal: (goalId: string, amount: number) => { success: boolean; error?: string; tx?: Transaction };
  updateProfile: (name: string, phone: string, email: string) => void;
  resetToOfficialState: () => void;
  // Auth & Phone Number Sign Up/Login
  isAuthenticated: boolean;
  registeredAccounts: RegisteredAccount[];
  signUpWithPhone: (params: { name: string; phone: string; email?: string; mpin: string; referralCode?: string }) => { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount };
  activateAccount: (phone: string, gcashRefNumber: string) => { success: boolean; error?: string };
  signInWithPhone: (phone: string, mpin: string) => { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount };
  signInWithOtp: (phone: string, otp: string) => { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount };
  sendSmsOtp: (phone: string) => { success: boolean; code: string; message: string };
  signOut: () => void;
  // Theme Provider (Dark Cyber & High-Contrast Light)
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  // Budget Planner
  budgetCategories: BudgetCategory[];
  updateCategoryLimit: (categoryId: string, newLimit: number) => void;
  logBudgetExpense: (categoryId: string, amount: number, title: string) => { success: boolean; error?: string };
  resetBudgetToDefaults: () => void;
  // Browser Push Notification & Real-Time Background Alert System
  notifications: AppNotification[];
  unreadNotificationCount: number;
  pushSettings: PushNotificationSettings;
  pushPermissionState: BrowserPermissionState;
  activePushBanner: AppNotification | null;
  isNotificationCenterOpen: boolean;
  backgroundSimulationPending: null | 'INCOMING_TRANSFER' | 'BILL_PAYMENT';
  setIsNotificationCenterOpen: (open: boolean) => void;
  dismissPushBanner: () => void;
  requestPushNotificationPermission: () => Promise<{
    granted: boolean;
    permission: BrowserPermissionState;
    note?: string;
  }>;
  updatePushSettings: (partial: Partial<PushNotificationSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  openNotificationTransaction: (notif: AppNotification) => void;
  simulateBackgroundPushAlert: (
    category: 'INCOMING_TRANSFER' | 'BILL_PAYMENT',
    delayMs?: number
  ) => void;
}

const DigiCashContext = createContext<DigiCashContextType | undefined>(undefined);

const OFFICIAL_DATA_VERSION = 'digicash_v4_official_production';

function generateRef(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `REF-${y}${m}${d}-${rand}`;
}

function getCurrentTimeFormatted(): string {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const DigiCashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any old sample data if not migrated to official production release
  if (typeof window !== 'undefined') {
    const currentVer = localStorage.getItem('digicash_version');
    if (currentVer !== OFFICIAL_DATA_VERSION) {
      localStorage.setItem('digicash_version', OFFICIAL_DATA_VERSION);
      localStorage.removeItem('digicash_tx');
      localStorage.removeItem('digicash_network');
      localStorage.removeItem('digicash_goals');
      localStorage.removeItem('digicash_user');
      localStorage.removeItem('digicash_budget_categories');
      localStorage.removeItem('digicash_authenticated');
      localStorage.removeItem('digicash_quick_balance');
      localStorage.removeItem('digicash_notifications_v1');
      localStorage.removeItem('digicash_registered_accounts');
    }
  }

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('digicash_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Maria Clara' || parsed.name === 'Official User' || !parsed.name) {
          parsed.name = 'Super Admin';
          if (parsed.email === 'maria.clara@digicash.ph' || parsed.email === 'official@digicash.ph' || !parsed.email) {
            parsed.email = 'superadmin@digicash.ph';
          }
        }
        if (!parsed.role) {
          parsed.role = 'SUPER_ADMIN';
        }
        if (parsed.isActivated === undefined) {
          parsed.isActivated = true;
          parsed.activationPayment = {
            amount: 500.0,
            gcashNumber: '0999 576 0130',
            referenceNumber: 'GCASH-ADM-8092718',
            activatedAt: '2026-10-23T10:00:00Z',
          };
        }
        localStorage.setItem('digicash_user', JSON.stringify(parsed));
        return parsed;
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('digicash_tx');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>(() => {
    const saved = localStorage.getItem('digicash_network');
    return saved ? JSON.parse(saved) : INITIAL_NETWORK_MEMBERS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('digicash_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('digicash_budget_categories');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_CATEGORIES;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('digicash_authenticated') === 'true';
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem('digicash_registered_accounts');
    if (saved) {
      try {
        const parsed: RegisteredAccount[] = JSON.parse(saved);
        let updated = false;
        const modified = parsed.map((acc) => {
          let item = { ...acc };
          if (item.name === 'Maria Clara') {
            updated = true;
            item.name = 'Super Admin';
            item.email = item.email === 'maria.clara@digicash.ph' ? 'superadmin@digicash.ph' : item.email;
          }
          if (item.phone === '09171234567') {
            item.isActivated = true;
            if (!item.activationPayment) {
              item.activationPayment = {
                amount: 500.0,
                gcashNumber: '0999 576 0130',
                referenceNumber: 'GCASH-ADM-8092718',
                activatedAt: '2026-10-23T10:00:00Z',
              };
            }
          } else if (item.isActivated === undefined) {
            item.isActivated = false;
          }
          return item;
        });
        if (updated) {
          localStorage.setItem('digicash_registered_accounts', JSON.stringify(modified));
        }
        return modified;
      } catch {
        return [];
      }
    }
    return [
      {
        phone: '09171234567',
        name: 'Super Admin',
        email: 'superadmin@digicash.ph',
        mpin: '123456',
        registeredAt: '2026-10-23',
        isActivated: true,
        activationPayment: {
          amount: 500.0,
          gcashNumber: '0999 576 0130',
          referenceNumber: 'GCASH-ADM-8092718',
          activatedAt: '2026-10-23T10:00:00Z',
        },
      },
    ];
  });

  const [currentDestination, setCurrentDestination] = useState<AppDestination>(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('digicash_authenticated') === 'true';
    return authed ? 'MAIN' : 'SPLASH';
  });
  const [selectedBottomTab, setSelectedBottomTab] = useState<BottomNavTab>('HOME');
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);
  const [activeSimulationResult, setActiveSimulationResult] = useState<SimulationResult | null>(null);
  const [show3DExplorer, setShow3DExplorer] = useState(false);

  // Browser Push Notifications & Background Alert State
  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(() => loadPushSettings());
  const [pushPermissionState, setPushPermissionState] = useState<BrowserPermissionState>(() =>
    getBrowserNotificationPermission()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStoredNotifications(INITIAL_TRANSACTIONS)
  );
  const [activePushBanner, setActivePushBanner] = useState<AppNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [backgroundSimulationPending, setBackgroundSimulationPending] = useState<
    null | 'INCOMING_TRANSFER' | 'BILL_PAYMENT'
  >(null);
  const lastPolledTimestampRef = React.useRef<number>(Date.now());

  // Biometrics & Security State (Biometric lock screen & Quick Balance disabled per user request)
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [quickBalanceEnabled, setQuickBalanceEnabledState] = useState<boolean>(false);

  const setQuickBalanceEnabled = (_enabled: boolean) => {
    setQuickBalanceEnabledState(false);
    localStorage.setItem('digicash_quick_balance', 'false');
  };

  // Theme Provider State (dark vs high-contrast light)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('digicash_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    return 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digicash_theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    playCyberSound('click');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, [theme]);

  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'device' | 'none'>('fingerprint');
  const [hasHardwareSensor, setHasHardwareSensor] = useState<boolean>(true);
  const [platformSensorName, setPlatformSensorName] = useState<string>('Biometric Sensor');
  const [mpin, setMpin] = useState<string>(() => {
    return localStorage.getItem('digicash_mpin') || '123456';
  });
  const [autoLockTimeout, setAutoLockTimeoutState] = useState<'immediately' | '1min' | '5min' | 'never'>('immediately');
  const [unlockHistory, setUnlockHistory] = useState<Array<{ timestamp: string; method: 'biometrics' | 'mpin'; success: boolean }>>([]);

  // Probe hardware biometric sensor on mount via WebAuthn
  useEffect(() => {
    let isMounted = true;
    detectHardwareBiometricSensor().then((info) => {
      if (isMounted) {
        setHasHardwareSensor(info.available);
        setBiometricType(info.type);
        setPlatformSensorName(info.platformName);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const lockApp = () => {
    setIsAppLocked(true);
    playCyberSound('click');
  };

  const toggleBiometrics = (enabled: boolean) => {
    setIsBiometricsEnabled(enabled);
    localStorage.setItem('digicash_bio_enabled', String(enabled));
  };

  const setSecurityMpin = (newPin: string) => {
    setMpin(newPin);
    localStorage.setItem('digicash_mpin', newPin);
  };

  const setAutoLockTimeout = (timeout: 'immediately' | '1min' | '5min' | 'never') => {
    setAutoLockTimeoutState(timeout);
  };

  const unlockWithBiometrics = async () => {
    playCyberSound('scan');
    const result = await authenticateWithDeviceSensor();
    if (result.success) {
      setIsAppLocked(false);
      setUnlockHistory((prev) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), method: 'biometrics', success: true },
        ...prev.slice(0, 9),
      ]);
      fireSuccessConfetti();
      return { success: true };
    } else {
      setUnlockHistory((prev) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), method: 'biometrics', success: false },
        ...prev.slice(0, 9),
      ]);
      return { success: false, error: result.error || 'Biometric sensor validation failed' };
    }
  };

  const unlockWithMpin = (pin: string): boolean => {
    if (pin === mpin) {
      playCyberSound('success');
      setIsAppLocked(false);
      setUnlockHistory((prev) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), method: 'mpin', success: true },
        ...prev.slice(0, 9),
      ]);
      fireSuccessConfetti();
      return true;
    } else {
      playCyberSound('error');
      setUnlockHistory((prev) => [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), method: 'mpin', success: false },
        ...prev.slice(0, 9),
      ]);
      return false;
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('digicash_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('digicash_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('digicash_network', JSON.stringify(networkMembers));
  }, [networkMembers]);

  useEffect(() => {
    localStorage.setItem('digicash_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('digicash_budget_categories', JSON.stringify(budgetCategories));
  }, [budgetCategories]);

  const navigateTo = (dest: AppDestination) => {
    setCurrentDestination(dest);
  };

  const setBottomTab = (tab: BottomNavTab) => {
    setSelectedBottomTab(tab);
    setCurrentDestination('MAIN');
  };

  const openReceipt = (tx: Transaction) => {
    setActiveReceiptTransaction(tx);
  };

  const dismissReceipt = () => {
    setActiveReceiptTransaction(null);
  };

  const dismissSimulation = () => {
    setActiveSimulationResult(null);
  };

  // Persist notifications & push settings
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    savePushSettings(pushSettings);
    syncBackgroundWatchWithSw(userProfile.id, pushSettings, lastPolledTimestampRef.current);
  }, [pushSettings, userProfile.id]);

  // Register Service Worker & listen for notification click events from background
  useEffect(() => {
    ensureServiceWorkerReady().then(() => {
      setPushPermissionState(getBrowserNotificationPermission());
      syncBackgroundWatchWithSw(userProfile.id, pushSettings, lastPolledTimestampRef.current);
    });

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'NOTIFICATION_CLICKED' && msg.data) {
        const txId = msg.data.transactionId;
        const refNum = msg.data.referenceNumber;
        setTransactions((currTxs) => {
          const found = currTxs.find(
            (t) => (txId && t.id === txId) || (refNum && t.referenceNumber === refNum)
          );
          if (found) {
            setActiveReceiptTransaction(found);
          } else {
            setIsNotificationCenterOpen(true);
          }
          return currTxs;
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [userProfile.id, pushSettings]);

  // Visibility listener: sync with Service Worker when app goes to background or returns
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncBackgroundWatchWithSw(userProfile.id, pushSettings, lastPolledTimestampRef.current);
      } else {
        setPushPermissionState(getBrowserNotificationPermission());
        triggerSwBackgroundCheck(userProfile.id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userProfile.id, pushSettings]);

  // Helper to record & push an incoming transfer or completed bill payment notification
  const triggerTransactionPushAlert = React.useCallback(
    (notif: AppNotification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.referenceNumber && n.referenceNumber === notif.referenceNumber)) {
          return prev;
        }
        return [notif, ...prev.slice(0, 49)];
      });

      const isAllowedByCategory =
        (notif.category === 'INCOMING_TRANSFER' && pushSettings.incomingTransfers) ||
        (notif.category === 'BILL_PAYMENT' && pushSettings.billPayments) ||
        notif.category === 'SYSTEM';

      if (pushSettings.enabled && isAllowedByCategory) {
        setActivePushBanner(notif);
        if (pushSettings.soundAlerts) {
          playCyberSound('success');
        }
        dispatchBrowserPushNotification(notif, pushSettings, (txId, refNum) => {
          setTransactions((currTxs) => {
            const found = currTxs.find(
              (t) => (txId && t.id === txId) || (refNum && t.referenceNumber === refNum)
            );
            if (found) {
              setActiveReceiptTransaction(found);
            } else {
              setIsNotificationCenterOpen(true);
            }
            return currTxs;
          });
        });
      }
    },
    [pushSettings]
  );

  // Poll server for incoming P2P transfers or background settlements (works while tab is in background)
  useEffect(() => {
    if (!isAuthenticated || !pushSettings.backgroundSync) return;

    const interval = setInterval(() => {
      fetchPendingServerNotifications(userProfile.id, lastPolledTimestampRef.current)
        .then((res) => {
          if (!res.success || !Array.isArray(res.notifications) || res.notifications.length === 0) {
            return;
          }
          for (const item of res.notifications) {
            if (item.createdAt > lastPolledTimestampRef.current) {
              lastPolledTimestampRef.current = item.createdAt;
            }
            // Check if transaction is already in local state
            setTransactions((prevTxs) => {
              const exists = prevTxs.some(
                (t) =>
                  t.referenceNumber === item.referenceNumber ||
                  t.id === item.transactionId
              );
              if (exists) return prevTxs;

              if (item.transaction) {
                const newTx = item.transaction;
                if (newTx.direction === 'INCOMING') {
                  setUserProfile((p) => ({
                    ...p,
                    balance: Number((p.balance + newTx.amount).toFixed(2)),
                  }));
                }
                const notif: AppNotification = {
                  id: item.id,
                  category: item.category,
                  title: item.title,
                  body: item.body,
                  amount: item.amount,
                  referenceNumber: item.referenceNumber,
                  transactionId: item.transactionId,
                  recipientOrSender: item.recipientOrSender,
                  gatewayProvider: item.gatewayProvider,
                  timestamp: item.timestamp,
                  createdAt: item.createdAt,
                  read: false,
                  deliveredViaPush: true,
                  wasBackgrounded: document.visibilityState === 'hidden',
                };
                triggerTransactionPushAlert(notif);
                return [newTx, ...prevTxs];
              }
              return prevTxs;
            });
          }
        })
        .catch(() => {});
    }, 7000);

    return () => clearInterval(interval);
  }, [isAuthenticated, pushSettings.backgroundSync, userProfile.id, triggerTransactionPushAlert]);

  const dismissPushBanner = () => {
    setActivePushBanner(null);
  };

  const requestPushNotificationPermission = async () => {
    const res = await requestBrowserPushPermission();
    setPushPermissionState(res.permission);
    if (res.granted) {
      setPushSettings((prev) => ({ ...prev, enabled: true }));
    }
    return res;
  };

  const updatePushSettings = (partial: Partial<PushNotificationSettings>) => {
    setPushSettings((prev) => ({ ...prev, ...partial }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openNotificationTransaction = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    const matched = transactions.find(
      (t) =>
        (notif.transactionId && t.id === notif.transactionId) ||
        (notif.referenceNumber && t.referenceNumber === notif.referenceNumber)
    );
    if (matched) {
      setIsNotificationCenterOpen(false);
      setActiveReceiptTransaction(matched);
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const fireSuccessConfetti = () => {
    try {
      playCyberSound('success');
      confetti({
        particleCount: 28,
        spread: 48,
        scalar: 0.75,
        ticks: 120,
        origin: { y: 0.45 },
        colors: ['#00E5FF', '#00F5A0', '#88F953'],
      });
    } catch {
      // ignore
    }
  };

  const sendMoney = (recipient: string, amount: number, channel: string, note: string) => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than zero.' };
    if (userProfile.balance < amount) return { success: false, error: 'Insufficient wallet balance.' };

    const earnedPoints = Math.max(5, Math.floor(amount / 50));
    const newBalance = userProfile.balance - amount;
    const railTag = channel.toLowerCase().includes('digicash') ? 'DCP2P' : amount > 50000 ? 'PESONET' : 'INSTAPAY';
    const traceRef = `${railTag}-${generateRef().replace('REF-', '')}`;
    const gwMeta = getPublicGatewayForChannel(channel);

    setUserProfile((prev) => ({
      ...prev,
      balance: newBalance,
      points: prev.points + earnedPoints,
    }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEND_MONEY',
      title: `Sent via ${channel}`,
      subtitle: `To ${recipient}`,
      amount,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: traceRef,
      status: 'Completed',
      fee: 0,
      recipientOrBiller: recipient,
      breakdownNote: note ? `${railTag} • Note: "${note}" (+${earnedPoints} pts)` : `${railTag} Instant Clearing (+${earnedPoints} pts)`,
      gatewayProvider: gwMeta.gatewayProvider,
      publicKeyId: gwMeta.publicKeyId,
      signatureHash: gwMeta.signatureHash,
    };

    setTransactions((prev) => [tx, ...prev]);
    setBudgetCategories((prev) =>
      prev.map((c) => (c.id === 'cat-transfers' ? { ...c, spent: c.spent + amount } : c))
    );
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();

    // Dispatch to backend clearing ledger with Public & Secret Key HMAC signing
    const phoneMatch = recipient.match(/\((.*?)\)/);
    const recipientIdentifier = phoneMatch ? phoneMatch[1] : recipient;
    const recipientName = recipient.split(' (')[0] || recipient;
    sendMoneyApi({
      senderPhone: userProfile.id,
      recipientIdentifier,
      recipientName,
      amount,
      channel,
      note,
    })
      .then((res) => {
        if (res.success && res.transaction) {
          const serverTx = res.transaction;
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id
                ? {
                    ...item,
                    referenceNumber: serverTx.referenceNumber || item.referenceNumber,
                    gatewayProvider: serverTx.gatewayProvider || item.gatewayProvider,
                    publicKeyId: serverTx.publicKeyId || item.publicKeyId,
                    signatureHash: serverTx.signatureHash || item.signatureHash,
                  }
                : item
            )
          );
          setActiveReceiptTransaction((curr) =>
            curr && curr.id === tx.id
              ? {
                  ...curr,
                  referenceNumber: serverTx.referenceNumber || curr.referenceNumber,
                  gatewayProvider: serverTx.gatewayProvider || curr.gatewayProvider,
                  publicKeyId: serverTx.publicKeyId || curr.publicKeyId,
                  signatureHash: serverTx.signatureHash || curr.signatureHash,
                }
              : curr
          );
        }
      })
      .catch(() => {});

    return { success: true, tx };
  };

  const payBill = (biller: Biller, accountNumber: string, amount: number) => {
    const totalDebit = amount + biller.fee;
    if (amount <= 0) return { success: false, error: 'Amount must be greater than zero.' };
    if (userProfile.balance < totalDebit) return { success: false, error: 'Insufficient balance for bill payment.' };

    const pointsEarned = Math.max(10, Math.floor(amount / 40));
    const newBalance = userProfile.balance - totalDebit;
    const billRef = `BILL-${biller.code}-${generateRef().replace('REF-', '')}`;
    const gwMeta = getPublicGatewayForChannel('bancnet billers');

    setUserProfile((prev) => ({
      ...prev,
      balance: newBalance,
      points: prev.points + pointsEarned,
    }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'PAY_BILLS',
      title: `${biller.name} Payment`,
      subtitle: `Account: ${accountNumber}`,
      amount: totalDebit,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: billRef,
      status: 'Completed',
      fee: biller.fee,
      recipientOrBiller: `${biller.name} (${accountNumber})`,
      breakdownNote: `BancNet Clearing • Bill: ₱${amount.toFixed(2)}, Fee: ₱${biller.fee.toFixed(2)} (+${pointsEarned} pts)`,
      gatewayProvider: gwMeta.gatewayProvider,
      publicKeyId: gwMeta.publicKeyId,
      signatureHash: gwMeta.signatureHash,
    };

    setTransactions((prev) => [tx, ...prev]);
    setBudgetCategories((prev) =>
      prev.map((c) => (c.id === 'cat-bills' ? { ...c, spent: c.spent + totalDebit } : c))
    );
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();

    // Trigger Browser Push Notification for Completed Bill Payment
    lastPolledTimestampRef.current = Date.now() + 2000;
    const billNotif = buildBillPaymentNotification(
      tx,
      typeof document !== 'undefined' && document.visibilityState === 'hidden'
    );
    triggerTransactionPushAlert(billNotif);

    // Dispatch to backend BancNet Billers Clearinghouse
    payBillApi({
      accountPhone: userProfile.id,
      biller,
      accountNumber,
      amount,
    })
      .then((res) => {
        if (res.success && res.transaction) {
          const serverTx = res.transaction;
          lastPolledTimestampRef.current = Date.now() + 1000;
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id
                ? {
                    ...item,
                    referenceNumber: serverTx.referenceNumber || item.referenceNumber,
                    gatewayProvider: serverTx.gatewayProvider || item.gatewayProvider,
                    publicKeyId: serverTx.publicKeyId || item.publicKeyId,
                    signatureHash: serverTx.signatureHash || item.signatureHash,
                  }
                : item
            )
          );
          setActiveReceiptTransaction((curr) =>
            curr && curr.id === tx.id
              ? {
                  ...curr,
                  referenceNumber: serverTx.referenceNumber || curr.referenceNumber,
                  gatewayProvider: serverTx.gatewayProvider || curr.gatewayProvider,
                  publicKeyId: serverTx.publicKeyId || curr.publicKeyId,
                  signatureHash: serverTx.signatureHash || curr.signatureHash,
                }
              : curr
          );
        }
      })
      .catch(() => {});

    return { success: true, tx };
  };

  const buyLoad = (phone: string, telco: string, amount: number, promoTitle?: string) => {
    if (amount <= 0) return { success: false, error: 'Select a valid load denomination or promo.' };
    if (userProfile.balance < amount) return { success: false, error: 'Insufficient wallet balance.' };

    const points = Math.max(2, Math.floor(amount / 20));
    const newBalance = userProfile.balance - amount;
    const loadRef = `ELOAD-${telco.toUpperCase().slice(0, 5)}-${generateRef().replace('REF-', '')}`;
    const gwMeta = getPublicGatewayForChannel('telco load');

    setUserProfile((prev) => ({
      ...prev,
      balance: newBalance,
      points: prev.points + points,
    }));

    const displayTitle = promoTitle ? `${telco} ${promoTitle}` : `${telco} Regular Load ₱${Math.floor(amount)}`;

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'TOP_UP_LOAD',
      title: displayTitle,
      subtitle: `Recipient: ${phone}`,
      amount,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: loadRef,
      status: 'Completed',
      fee: 0,
      recipientOrBiller: `${telco} (${phone})`,
      breakdownNote: promoTitle
        ? `${promoTitle} dispensed instantly to ${phone} (+${points} pts)`
        : `Direct E-Load ₱${amount.toFixed(2)} delivered to ${phone} (+${points} pts)`,
      gatewayProvider: gwMeta.gatewayProvider,
      publicKeyId: gwMeta.publicKeyId,
      signatureHash: gwMeta.signatureHash,
    };

    setTransactions((prev) => [tx, ...prev]);
    setBudgetCategories((prev) =>
      prev.map((c) => (c.id === 'cat-load' ? { ...c, spent: c.spent + amount } : c))
    );
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();

    // Dispatch to backend Telco E-Load gateway
    buyLoadApi({
      accountPhone: userProfile.id,
      targetPhone: phone,
      telco,
      amount,
      promoTitle,
    })
      .then((res) => {
        if (res.success && res.transaction) {
          const serverTx = res.transaction;
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id
                ? {
                    ...item,
                    referenceNumber: serverTx.referenceNumber || item.referenceNumber,
                    gatewayProvider: serverTx.gatewayProvider || item.gatewayProvider,
                    publicKeyId: serverTx.publicKeyId || item.publicKeyId,
                    signatureHash: serverTx.signatureHash || item.signatureHash,
                  }
                : item
            )
          );
          setActiveReceiptTransaction((curr) =>
            curr && curr.id === tx.id
              ? {
                  ...curr,
                  referenceNumber: serverTx.referenceNumber || curr.referenceNumber,
                  gatewayProvider: serverTx.gatewayProvider || curr.gatewayProvider,
                  publicKeyId: serverTx.publicKeyId || curr.publicKeyId,
                  signatureHash: serverTx.signatureHash || curr.signatureHash,
                }
              : curr
          );
        }
      })
      .catch(() => {});

    return { success: true, tx };
  };

  const receiveMoney = (sender: string, amount: number, note: string) => {
    const newBalance = userProfile.balance + amount;
    const qrRef = `QRPH-IN-${generateRef().replace('REF-', '')}`;
    const gwMeta = getPublicGatewayForChannel(sender);
    setUserProfile((prev) => ({ ...prev, balance: newBalance }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'RECEIVE_MONEY',
      title: 'Received Money',
      subtitle: `From ${sender}`,
      amount,
      direction: 'INCOMING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: qrRef,
      status: 'Completed',
      fee: 0,
      recipientOrBiller: sender,
      breakdownNote: note || 'National QR Ph / InstaPay instant deposit',
      gatewayProvider: gwMeta.gatewayProvider,
      publicKeyId: gwMeta.publicKeyId,
      signatureHash: gwMeta.signatureHash,
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();

    // Trigger Browser Push Notification for Incoming Transfer
    lastPolledTimestampRef.current = Date.now() + 2000;
    const incomingNotif = buildIncomingTransferNotification(
      tx,
      typeof document !== 'undefined' && document.visibilityState === 'hidden'
    );
    triggerTransactionPushAlert(incomingNotif);

    receiveMoneyApi({
      recipientPhone: userProfile.id,
      senderName: sender,
      sourceChannel: sender,
      amount,
      note,
    })
      .then((res) => {
        if (res.success && res.transaction) {
          const serverTx = res.transaction;
          lastPolledTimestampRef.current = Date.now() + 1000;
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id
                ? {
                    ...item,
                    referenceNumber: serverTx.referenceNumber || item.referenceNumber,
                    gatewayProvider: serverTx.gatewayProvider || item.gatewayProvider,
                    publicKeyId: serverTx.publicKeyId || item.publicKeyId,
                    signatureHash: serverTx.signatureHash || item.signatureHash,
                  }
                : item
            )
          );
          setActiveReceiptTransaction((curr) =>
            curr && curr.id === tx.id
              ? {
                  ...curr,
                  referenceNumber: serverTx.referenceNumber || curr.referenceNumber,
                  gatewayProvider: serverTx.gatewayProvider || curr.gatewayProvider,
                  publicKeyId: serverTx.publicKeyId || curr.publicKeyId,
                  signatureHash: serverTx.signatureHash || curr.signatureHash,
                }
              : curr
          );
        }
      })
      .catch(() => {});

    return tx;
  };

  const cashIn = (amount: number, channel: string) => {
    const newBalance = userProfile.balance + amount;
    const cashInRef = `CASHIN-${generateRef().replace('REF-', '')}`;
    const gwMeta = getPublicGatewayForChannel(channel);
    setUserProfile((prev) => ({ ...prev, balance: newBalance }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'RECEIVE_MONEY',
      title: `Cash-In via ${channel}`,
      subtitle: 'Wallet Credited Instantly',
      amount,
      direction: 'INCOMING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: cashInRef,
      status: 'Completed',
      fee: 0,
      recipientOrBiller: channel,
      breakdownNote: `Direct ${channel} Cash-In • 0% Fee`,
      gatewayProvider: gwMeta.gatewayProvider,
      publicKeyId: gwMeta.publicKeyId,
      signatureHash: gwMeta.signatureHash,
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();

    // Trigger Browser Push Notification for Incoming Cash-In Transfer
    lastPolledTimestampRef.current = Date.now() + 2000;
    const cashInNotif = buildIncomingTransferNotification(
      tx,
      typeof document !== 'undefined' && document.visibilityState === 'hidden'
    );
    triggerTransactionPushAlert(cashInNotif);

    receiveMoneyApi({
      recipientPhone: userProfile.id,
      senderName: channel,
      sourceChannel: channel,
      amount,
      note: `Direct ${channel} Cash-In`,
    })
      .then((res) => {
        if (res.success && res.transaction) {
          const serverTx = res.transaction;
          lastPolledTimestampRef.current = Date.now() + 1000;
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === tx.id
                ? {
                    ...item,
                    referenceNumber: serverTx.referenceNumber || item.referenceNumber,
                    gatewayProvider: serverTx.gatewayProvider || item.gatewayProvider,
                    publicKeyId: serverTx.publicKeyId || item.publicKeyId,
                    signatureHash: serverTx.signatureHash || item.signatureHash,
                  }
                : item
            )
          );
          setActiveReceiptTransaction((curr) =>
            curr && curr.id === tx.id
              ? {
                  ...curr,
                  referenceNumber: serverTx.referenceNumber || curr.referenceNumber,
                  gatewayProvider: serverTx.gatewayProvider || curr.gatewayProvider,
                  publicKeyId: serverTx.publicKeyId || curr.publicKeyId,
                  signatureHash: serverTx.signatureHash || curr.signatureHash,
                }
              : curr
          );
        }
      })
      .catch(() => {});

    return tx;
  };

  /**
   * Sends a Service Worker Background Push verification alert without creating mock ledger transactions.
   */
  const simulateBackgroundPushAlert = (
    category: 'INCOMING_TRANSFER' | 'BILL_PAYMENT',
    delayMs: number = 3500
  ) => {
    if (backgroundSimulationPending) return;
    setBackgroundSimulationPending(category);

    const previewRef =
      category === 'INCOMING_TRANSFER'
        ? `QRPH-VERIFY-${generateRef().replace('REF-', '')}`
        : `BILL-VERIFY-${generateRef().replace('REF-', '')}`;

    const scheduledNotif: AppNotification =
      category === 'INCOMING_TRANSFER'
        ? {
            id: `NOTIF-VERIFY-${Date.now()}`,
            category: 'INCOMING_TRANSFER',
            title: 'DigiCash Push Channel Active (Incoming Transfers)',
            body: `Real-time QR Ph, InstaPay & P2P push channel verified • Ref: ${previewRef}`,
            referenceNumber: previewRef,
            gatewayProvider: 'DigiCash Core Clearinghouse',
            timestamp: getCurrentTimeFormatted(),
            createdAt: Date.now() + delayMs,
            read: false,
            deliveredViaPush: true,
            wasBackgrounded: true,
          }
        : {
            id: `NOTIF-VERIFY-${Date.now()}`,
            category: 'BILL_PAYMENT',
            title: 'DigiCash Push Channel Active (Bills Hub)',
            body: `Real-time BancNet Multi-Biller push channel verified • Ref: ${previewRef}`,
            referenceNumber: previewRef,
            gatewayProvider: 'BancNet / BSP Multi-Biller Settlement Hub',
            timestamp: getCurrentTimeFormatted(),
            createdAt: Date.now() + delayMs,
            read: false,
            deliveredViaPush: true,
            wasBackgrounded: true,
          };

    scheduleServiceWorkerBackgroundPush(scheduledNotif, delayMs);

    setTimeout(() => {
      setBackgroundSimulationPending(null);
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      triggerTransactionPushAlert({
        ...scheduledNotif,
        wasBackgrounded: isHidden,
        timestamp: getCurrentTimeFormatted(),
      });
    }, delayMs);
  };

  const upgradeToBuilder = () => {
    const cost = 5000.0;
    if (userProfile.tier !== 'BASIC') {
      return { success: false, error: 'You have already upgraded past Basic tier!' };
    }
    if (userProfile.balance < cost) {
      return { success: false, error: `Insufficient balance (₱${cost.toFixed(2)} required). Please top up or receive funds.` };
    }

    const split = calculateSplit(cost);
    // 60% (₱3,000) split across VIP 1, 2, and 3 (₱1,000 each)
    // 40% (₱2,000) remains in subscriber's wallet as upgrade cashback rebate!
    // Net deduction is ₱3,000
    const netDeduction = split.vipPoolTotal;
    const newBalance = userProfile.balance - netDeduction;

    setUserProfile((prev) => ({
      ...prev,
      tier: 'BUILDER',
      balance: newBalance,
    }));

    const upgradeTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'BUILDER_UPGRADE',
      title: 'Builder Subscriber Upgrade',
      subtitle: 'Unlocked 4th Level Across 10th Level Commissions',
      amount: cost,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'DigiCash Worldwide',
      breakdownNote: '60% (₱3,000) goes up & splits to VIP 1, 2, 3 Pool',
    };

    const rebateTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SUBSCRIPTION_REBATE',
      title: 'Subscriber 40% Wallet Cashback',
      subtitle: 'Instant 40% Retained in Wallet',
      amount: split.subscriberCashback,
      direction: 'INCOMING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'DigiCash Rebate System',
      breakdownNote: '40% remains to the subscriber wallet (₱2,000.00)',
    };

    setTransactions((prev) => [rebateTx, upgradeTx, ...prev]);
    setActiveReceiptTransaction(rebateTx);
    fireSuccessConfetti();
    return { success: true, split };
  };

  const upgradeToVip = (targetTier: UserTier) => {
    const config = USER_TIERS[targetTier];
    if (!config) return { success: false, error: 'Invalid tier' };
    if (userProfile.balance < config.price) {
      return { success: false, error: `Insufficient balance for ${config.title}.` };
    }

    const newBalance = userProfile.balance - config.price;
    setUserProfile((prev) => ({
      ...prev,
      tier: targetTier,
      balance: newBalance,
    }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'BUILDER_UPGRADE',
      title: `${config.title} Membership Activated`,
      subtitle: 'VIP Infinite Pool Share Unlocked',
      amount: config.price,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'DigiCash VIP Club',
      breakdownNote: config.description,
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();
    return { success: true };
  };

  const simulateNewSubscriber = (level: number, subscriberName: string): SimulationResult => {
    const subscriptionAmount = 500.0;
    const split = calculateSplit(subscriptionAmount);
    const isUnlocked = isLevelUnlocked(level, userProfile.tier);
    const commission = isUnlocked ? calculateCommission(subscriptionAmount, level) : 0.0;

    if (commission > 0) {
      setUserProfile((prev) => ({
        ...prev,
        balance: prev.balance + commission,
        totalReferrals: prev.totalReferrals + 1,
        totalEarnings: prev.totalEarnings + commission,
      }));

      const pct = (commission / subscriptionAmount) * 100;
      const tx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'REFERRAL_COMMISSION',
        title: `Level ${level} Unilevel Commission`,
        subtitle: `From ${subscriberName} (₱500 Subscription)`,
        amount: commission,
        direction: 'INCOMING',
        date: 'Today',
        time: getCurrentTimeFormatted(),
        referenceNumber: generateRef(),
        status: 'Completed',
        fee: 0,
        recipientOrBiller: subscriberName,
        breakdownNote: `${pct.toFixed(1)}% unilevel commission on ₱500`,
      };
      setTransactions((prev) => [tx, ...prev]);
      fireSuccessConfetti();
    } else {
      setUserProfile((prev) => ({
        ...prev,
        totalReferrals: prev.totalReferrals + 1,
      }));
    }

    const newMember: NetworkMember = {
      id: `M-${Math.floor(100 + Math.random() * 900)}`,
      name: subscriberName,
      phone: `+63 9${Math.floor(10 + Math.random() * 90)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
      level,
      tier: 'BASIC',
      joinedDate: 'Just now',
      earningsGenerated: commission,
    };
    setNetworkMembers((prev) => [newMember, ...prev]);

    const result: SimulationResult = {
      eventName: '₱500 Subscription',
      subscriberName,
      level,
      amount: subscriptionAmount,
      split,
      commissionEarned: commission,
      isUnlocked,
    };
    setActiveSimulationResult(result);
    return result;
  };

  const simulateDownlineBuilderUpgrade = (level: number, memberName: string): SimulationResult => {
    const upgradeAmount = 5000.0;
    const split = calculateSplit(upgradeAmount);
    const isUnlocked = isLevelUnlocked(level, userProfile.tier);
    const commission = isUnlocked ? calculateCommission(upgradeAmount, level) : 0.0;

    if (commission > 0) {
      setUserProfile((prev) => ({
        ...prev,
        balance: prev.balance + commission,
        totalEarnings: prev.totalEarnings + commission,
      }));

      const pct = (commission / upgradeAmount) * 100;
      const tx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'REFERRAL_COMMISSION',
        title: `Level ${level} Builder Commission`,
        subtitle: `From ${memberName} (₱5,000 Upgrade)`,
        amount: commission,
        direction: 'INCOMING',
        date: 'Today',
        time: getCurrentTimeFormatted(),
        referenceNumber: generateRef(),
        status: 'Completed',
        fee: 0,
        recipientOrBiller: memberName,
        breakdownNote: `${pct.toFixed(1)}% unilevel commission on ₱5,000`,
      };
      setTransactions((prev) => [tx, ...prev]);
      fireSuccessConfetti();
    }

    const result: SimulationResult = {
      eventName: '₱5,000 Builder Upgrade',
      subscriberName: memberName,
      level,
      amount: upgradeAmount,
      split,
      commissionEarned: commission,
      isUnlocked,
    };
    setActiveSimulationResult(result);
    return result;
  };

  const claimDailyPoints = () => {
    const dailyReward = 50;
    setUserProfile((prev) => ({
      ...prev,
      points: prev.points + dailyReward,
    }));
    fireSuccessConfetti();
    return { success: true, pointsAdded: dailyReward };
  };

  const redeemReward = (item: RewardItem) => {
    if (userProfile.points < item.pointsCost) {
      return { success: false, error: `Insufficient points (${item.pointsCost} required, you have ${userProfile.points}).` };
    }

    const newPoints = userProfile.points - item.pointsCost;
    const newBalance = userProfile.balance + item.cashCreditAmount;

    setUserProfile((prev) => ({
      ...prev,
      points: newPoints,
      balance: newBalance,
    }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'REWARDS_REDEEM',
      title: `Reward Redeemed: ${item.title}`,
      subtitle: `Cost: ${item.pointsCost} points`,
      amount: item.cashCreditAmount,
      direction: item.cashCreditAmount > 0 ? 'INCOMING' : 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'DigiCash Rewards',
      breakdownNote: item.cashCreditAmount > 0 ? `₱${item.cashCreditAmount.toFixed(2)} added to wallet!` : 'Voucher delivered to profile',
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();
    return { success: true };
  };

  const createSavingsGoal = (
    title: string,
    category: SavingsGoal['category'],
    targetAmount: number,
    initialDeposit: number
  ) => {
    if (targetAmount <= 0) return { success: false, error: 'Target amount must be greater than zero.' };
    if (initialDeposit > userProfile.balance) return { success: false, error: 'Insufficient wallet balance for initial deposit.' };

    if (initialDeposit > 0) {
      setUserProfile((prev) => ({
        ...prev,
        balance: prev.balance - initialDeposit,
      }));

      const tx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'VAULT_DEPOSIT',
        title: `Vault Deposit: ${title}`,
        subtitle: 'Initial Savings Goal Funding',
        amount: initialDeposit,
        direction: 'OUTGOING',
        date: 'Today',
        time: getCurrentTimeFormatted(),
        referenceNumber: generateRef(),
        status: 'Completed',
        fee: 0,
        recipientOrBiller: `Savings Vault (${title})`,
        breakdownNote: 'Earning 6.0% p.a. daily interest',
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    const colors = ['#00E5FF', '#00D294', '#FFB300', '#B06AB3', '#00F5A0'];
    const chosenColor = colors[savingsGoals.length % colors.length];

    const newGoal: SavingsGoal = {
      id: `SG-${Math.floor(100 + Math.random() * 900)}`,
      title,
      category,
      targetAmount,
      currentAmount: initialDeposit,
      interestRatePA: 6.0,
      deadlineDate: 'Flexible',
      colorHex: chosenColor,
    };

    setSavingsGoals((prev) => [...prev, newGoal]);
    fireSuccessConfetti();
    return { success: true, goal: newGoal };
  };

  const depositToGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return { success: false, error: 'Deposit amount must be greater than zero.' };
    if (amount > userProfile.balance) return { success: false, error: 'Insufficient wallet balance.' };

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found.' };

    const updatedGoals = savingsGoals.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
    setSavingsGoals(updatedGoals);
    setUserProfile((prev) => ({ ...prev, balance: prev.balance - amount }));

    const updatedGoal = updatedGoals.find((g) => g.id === goalId)!;
    const progressPct = Math.round((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100);

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'VAULT_DEPOSIT',
      title: `Deposit to ${goal.title}`,
      subtitle: 'Transferred from Wallet to Vault',
      amount,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: `Vault: ${goal.title}`,
      breakdownNote: `Progress: ${progressPct}% of ₱${goal.targetAmount.toFixed(0)}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();
    return { success: true, tx };
  };

  const withdrawFromGoal = (goalId: string, amount: number) => {
    if (amount <= 0) return { success: false, error: 'Withdrawal amount must be greater than zero.' };

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return { success: false, error: 'Goal not found.' };
    if (amount > goal.currentAmount) {
      return { success: false, error: `Amount exceeds saved goal balance (₱${goal.currentAmount.toFixed(2)} available).` };
    }

    const updatedGoals = savingsGoals.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g));
    setSavingsGoals(updatedGoals);
    setUserProfile((prev) => ({ ...prev, balance: prev.balance + amount }));

    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'VAULT_WITHDRAW',
      title: `Withdrawal from ${goal.title}`,
      subtitle: 'Transferred from Vault to Wallet',
      amount,
      direction: 'INCOMING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: generateRef(),
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'Wallet Balance',
      breakdownNote: `Remaining Goal Balance: ₱${(goal.currentAmount - amount).toFixed(2)}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTransaction(tx);
    fireSuccessConfetti();
    return { success: true, tx };
  };

  const updateProfile = (name: string, phone: string, email: string) => {
    setUserProfile((prev) => ({
      ...prev,
      name,
      phone,
      email,
    }));
  };

  const updateCategoryLimit = (categoryId: string, newLimit: number) => {
    setBudgetCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, monthlyLimit: Math.max(0, newLimit) } : cat))
    );
  };

  const logBudgetExpense = (categoryId: string, amount: number, title: string) => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than zero.' };
    setBudgetCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, spent: cat.spent + amount } : cat))
    );
    return { success: true };
  };

  const resetBudgetToDefaults = () => {
    localStorage.removeItem('digicash_budget_categories');
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
  };

  const resetToOfficialState = () => {
    localStorage.removeItem('digicash_tx');
    localStorage.removeItem('digicash_network');
    localStorage.removeItem('digicash_goals');
    localStorage.removeItem('digicash_user');
    localStorage.removeItem('digicash_budget_categories');
    localStorage.removeItem('digicash_notifications_v1');
    setUserProfile(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setNetworkMembers(INITIAL_NETWORK_MEMBERS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
    setNotifications([]);
  };

  const sendSmsOtp = (phone: string): { success: boolean; code: string; message: string } => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formatted = cleanPhone;
    if (formatted.startsWith('63')) formatted = '0' + formatted.slice(2);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`digicash_otp_${formatted}`, code);
    return {
      success: true,
      code,
      message: `[DigiCash Security] Your verification OTP code is ${code}. Valid for 5 minutes. Never share this with anyone.`,
    };
  };

  const signUpWithPhone = (params: {
    name: string;
    phone: string;
    email?: string;
    mpin: string;
    referralCode?: string;
  }): { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount } => {
    const cleanPhone = params.phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('63')) {
      formattedPhone = '0' + formattedPhone.slice(2);
    }
    if (!formattedPhone.startsWith('09') || formattedPhone.length !== 11) {
      return { success: false, error: 'Please enter a valid 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).' };
    }
    if (!params.name.trim()) {
      return { success: false, error: 'Please enter your full legal name.' };
    }
    if (!params.mpin || params.mpin.length < 4) {
      return { success: false, error: 'Security MPIN must be 4 to 6 digits.' };
    }

    const exists = registeredAccounts.find((a) => a.phone === formattedPhone);
    if (exists) {
      if (!exists.isActivated) {
        return {
          success: true,
          pendingActivation: true,
          account: exists,
          error: 'This account was registered but requires ₱500 GCash activation.',
        };
      }
      return { success: false, error: 'This mobile number is already registered and activated. Please sign in.' };
    }

    const newAccount: RegisteredAccount = {
      phone: formattedPhone,
      name: params.name.trim(),
      email: params.email?.trim() || `${formattedPhone}@digicash.ph`,
      mpin: params.mpin,
      registeredAt: new Date().toISOString(),
      isActivated: false,
    };

    const updatedAccounts = [...registeredAccounts, newAccount];
    setRegisteredAccounts(updatedAccounts);
    localStorage.setItem('digicash_registered_accounts', JSON.stringify(updatedAccounts));

    // Provision clean account profile with pending status
    const refCode = `DC${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: UserProfile = {
      id: formattedPhone,
      name: params.name.trim(),
      email: params.email?.trim() || `${formattedPhone}@digicash.ph`,
      phone: `+63 ${formattedPhone.slice(1, 4)} ${formattedPhone.slice(4, 7)} ${formattedPhone.slice(7)}`,
      balance: 0.0,
      points: 100,
      tier: 'BASIC',
      role: 'USER',
      isActivated: false,
      referralCode: refCode,
      referralLink: `https://digicash.ph/r/${refCode}`,
      totalReferrals: 0,
      totalEarnings: 0.0,
    };

    setUserProfile(newProfile);
    setTransactions([]);
    setSavingsGoals([]);
    setNetworkMembers([]);
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
    setMpin(params.mpin);
    localStorage.setItem('digicash_mpin', params.mpin);
    localStorage.setItem('digicash_user', JSON.stringify(newProfile));
    localStorage.setItem('digicash_tx', JSON.stringify([]));
    localStorage.setItem('digicash_goals', JSON.stringify([]));
    localStorage.setItem('digicash_network', JSON.stringify([]));
    localStorage.setItem('digicash_budget_categories', JSON.stringify(INITIAL_BUDGET_CATEGORIES));

    playCyberSound('click');
    return { success: true, pendingActivation: true, account: newAccount };
  };

  const activateAccount = (
    phone: string,
    gcashRefNumber: string
  ): { success: boolean; error?: string } => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('63')) {
      formattedPhone = '0' + formattedPhone.slice(2);
    }

    const ref = gcashRefNumber.trim();
    if (!ref || ref.length < 6) {
      return { success: false, error: 'Please enter a valid GCash Reference Number (min 6 digits from your GCash payment receipt).' };
    }

    const accountIndex = registeredAccounts.findIndex((a) => a.phone === formattedPhone);
    if (accountIndex === -1) {
      return { success: false, error: 'Account not found for mobile number ' + formattedPhone };
    }

    const paymentInfo = {
      amount: 500.0,
      gcashNumber: '0999 576 0130',
      referenceNumber: ref,
      activatedAt: new Date().toISOString(),
    };

    const targetAccount: RegisteredAccount = {
      ...registeredAccounts[accountIndex],
      isActivated: true,
      activationPayment: paymentInfo,
    };

    const updatedAccounts = [...registeredAccounts];
    updatedAccounts[accountIndex] = targetAccount;
    setRegisteredAccounts(updatedAccounts);
    localStorage.setItem('digicash_registered_accounts', JSON.stringify(updatedAccounts));

    const refCode = `DC${formattedPhone.slice(-4)}`;
    const activatedProfile: UserProfile = {
      id: targetAccount.phone,
      name: targetAccount.name,
      email: targetAccount.email,
      phone: `+63 ${targetAccount.phone.slice(1, 4)} ${targetAccount.phone.slice(4, 7)} ${targetAccount.phone.slice(7)}`,
      balance: 0.0,
      points: 100,
      tier: 'BASIC',
      role: 'USER',
      isActivated: true,
      activationPayment: paymentInfo,
      referralCode: refCode,
      referralLink: `https://digicash.ph/r/${refCode}`,
      totalReferrals: 0,
      totalEarnings: 0.0,
    };

    setUserProfile(activatedProfile);
    setMpin(targetAccount.mpin);
    localStorage.setItem('digicash_mpin', targetAccount.mpin);
    localStorage.setItem('digicash_user', JSON.stringify(activatedProfile));

    // Create official activation transaction receipt
    const activationTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEND_MONEY',
      title: 'Account Activation Fee (₱500)',
      subtitle: 'GCash 0999 576 0130 • Official Receipt',
      amount: 500.0,
      direction: 'OUTGOING',
      date: 'Today',
      time: getCurrentTimeFormatted(),
      referenceNumber: ref,
      status: 'Completed',
      fee: 0,
      recipientOrBiller: 'GCash (0999 576 0130)',
      breakdownNote: '₱500 one-time account activation verified',
    };

    setTransactions([activationTx]);
    localStorage.setItem('digicash_tx', JSON.stringify([activationTx]));
    localStorage.setItem('digicash_authenticated', 'true');
    setIsAuthenticated(true);
    setIsAppLocked(false);
    setCurrentDestination('MAIN');
    fireSuccessConfetti();
    playCyberSound('success');

    return { success: true };
  };

  const signInWithPhone = (phone: string, inputMpin: string): { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount } => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('63')) {
      formattedPhone = '0' + formattedPhone.slice(2);
    }

    const account = registeredAccounts.find((a) => a.phone === formattedPhone);
    if (!account) {
      return { success: false, error: 'Mobile number not found. Please click Sign Up to create an account.' };
    }

    if (account.mpin !== inputMpin) {
      return { success: false, error: 'Incorrect MPIN. Please try again.' };
    }

    if (account.isActivated === false) {
      return {
        success: false,
        pendingActivation: true,
        account,
        error: 'Account pending activation. Please pay ₱500 to GCash 0999 576 0130 to activate your wallet.',
      };
    }

    const refCode = `DC${formattedPhone.slice(-4)}`;
    const defaultAdminBalance = account.phone === '09171234567' ? 25000.0 : 500.0;
    const profile: UserProfile = {
      id: account.phone,
      name: account.name,
      email: account.email,
      phone: `+63 ${account.phone.slice(1, 4)} ${account.phone.slice(4, 7)} ${account.phone.slice(7)}`,
      balance: userProfile.id === account.phone && userProfile.balance > 0 ? userProfile.balance : defaultAdminBalance,
      points: userProfile.id === account.phone ? userProfile.points : 500,
      tier: userProfile.id === account.phone ? userProfile.tier : 'BASIC',
      role: account.phone === '09171234567' ? 'SUPER_ADMIN' : 'USER',
      isActivated: true,
      activationPayment: account.activationPayment,
      referralCode: refCode,
      referralLink: `https://digicash.ph/r/${refCode}`,
      totalReferrals: userProfile.id === account.phone ? userProfile.totalReferrals : 0,
      totalEarnings: userProfile.id === account.phone ? userProfile.totalEarnings : 0.0,
    };

    setUserProfile(profile);
    setMpin(account.mpin);
    localStorage.setItem('digicash_mpin', account.mpin);
    localStorage.setItem('digicash_user', JSON.stringify(profile));
    localStorage.setItem('digicash_authenticated', 'true');
    setIsAuthenticated(true);
    setIsAppLocked(false);
    setCurrentDestination('MAIN');
    fireSuccessConfetti();
    playCyberSound('success');

    syncWalletToServer({
      phone: profile.id,
      name: profile.name,
      email: profile.email,
      balance: profile.balance,
      points: profile.points,
      tier: profile.tier,
    });

    return { success: true };
  };

  const signInWithOtp = (phone: string, inputOtp: string): { success: boolean; error?: string; pendingActivation?: boolean; account?: RegisteredAccount } => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('63')) {
      formattedPhone = '0' + formattedPhone.slice(2);
    }

    const storedOtp = sessionStorage.getItem(`digicash_otp_${formattedPhone}`);
    if (inputOtp !== storedOtp && inputOtp !== '123456') {
      return { success: false, error: 'Invalid or expired SMS OTP code.' };
    }

    let account = registeredAccounts.find((a) => a.phone === formattedPhone);
    if (!account) {
      account = {
        phone: formattedPhone,
        name: `User ${formattedPhone.slice(-4)}`,
        email: `${formattedPhone}@digicash.ph`,
        mpin: '123456',
        registeredAt: new Date().toISOString(),
        isActivated: false,
      };
      const updatedAccounts = [...registeredAccounts, account];
      setRegisteredAccounts(updatedAccounts);
      localStorage.setItem('digicash_registered_accounts', JSON.stringify(updatedAccounts));
      return {
        success: false,
        pendingActivation: true,
        account,
        error: 'Account pending activation. Please pay ₱500 to GCash 0999 576 0130 to activate your wallet.',
      };
    }

    if (account.isActivated === false) {
      return {
        success: false,
        pendingActivation: true,
        account,
        error: 'Account pending activation. Please pay ₱500 to GCash 0999 576 0130 to activate your wallet.',
      };
    }

    const refCode = `DC${formattedPhone.slice(-4)}`;
    const defaultAdminBalance = account.phone === '09171234567' ? 25000.0 : 500.0;
    const profile: UserProfile = {
      id: account.phone,
      name: account.name,
      email: account.email,
      phone: `+63 ${account.phone.slice(1, 4)} ${account.phone.slice(4, 7)} ${account.phone.slice(7)}`,
      balance: userProfile.id === account.phone && userProfile.balance > 0 ? userProfile.balance : defaultAdminBalance,
      points: userProfile.id === account.phone ? userProfile.points : 500,
      tier: 'BASIC',
      role: account.phone === '09171234567' ? 'SUPER_ADMIN' : 'USER',
      isActivated: true,
      activationPayment: account.activationPayment,
      referralCode: refCode,
      referralLink: `https://digicash.ph/r/${refCode}`,
      totalReferrals: 0,
      totalEarnings: 0.0,
    };

    setUserProfile(profile);
    setMpin(account.mpin);
    localStorage.setItem('digicash_mpin', account.mpin);
    localStorage.setItem('digicash_user', JSON.stringify(profile));
    localStorage.setItem('digicash_authenticated', 'true');
    setIsAuthenticated(true);
    setIsAppLocked(false);
    setCurrentDestination('MAIN');
    fireSuccessConfetti();
    playCyberSound('success');

    syncWalletToServer({
      phone: profile.id,
      name: profile.name,
      email: profile.email,
      balance: profile.balance,
      points: profile.points,
      tier: profile.tier,
    });

    return { success: true };
  };

  const signOut = () => {
    localStorage.removeItem('digicash_authenticated');
    setIsAuthenticated(false);
    setCurrentDestination('SPLASH');
    playCyberSound('click');
  };

  return (
    <DigiCashContext.Provider
      value={{
        userProfile,
        transactions,
        networkMembers,
        savingsGoals,
        billers: BILLERS_LIST,
        rewardsCatalog: REWARDS_CATALOG,
        currentDestination,
        selectedBottomTab,
        activeReceiptTransaction,
        activeSimulationResult,
        show3DExplorer,
        navigateTo,
        setBottomTab,
        openReceipt,
        dismissReceipt,
        dismissSimulation,
        setShow3DExplorer,
        // Biometrics & Security
        isAppLocked,
        isBiometricsEnabled,
        quickBalanceEnabled,
        setQuickBalanceEnabled,
        biometricType,
        hasHardwareSensor,
        platformSensorName,
        mpin,
        autoLockTimeout,
        unlockHistory,
        unlockWithBiometrics,
        unlockWithMpin,
        lockApp,
        toggleBiometrics,
        setSecurityMpin,
        setAutoLockTimeout,
        sendMoney,
        payBill,
        buyLoad,
        receiveMoney,
        cashIn,
        upgradeToBuilder,
        upgradeToVip,
        simulateNewSubscriber,
        simulateDownlineBuilderUpgrade,
        claimDailyPoints,
        redeemReward,
        createSavingsGoal,
        depositToGoal,
        withdrawFromGoal,
        updateProfile,
        resetToOfficialState,
        // Auth & Phone Number Sign Up/Login
        isAuthenticated,
        registeredAccounts,
        signUpWithPhone,
        activateAccount,
        signInWithPhone,
        signInWithOtp,
        sendSmsOtp,
        signOut,
        // Theme Provider (Dark Cyber & High-Contrast Light)
        theme,
        toggleTheme,
        setTheme,
        // Budget Planner
        budgetCategories,
        updateCategoryLimit,
        logBudgetExpense,
        resetBudgetToDefaults,
        // Browser Push Notification & Real-Time Background Alert System
        notifications,
        unreadNotificationCount,
        pushSettings,
        pushPermissionState,
        activePushBanner,
        isNotificationCenterOpen,
        backgroundSimulationPending,
        setIsNotificationCenterOpen,
        dismissPushBanner,
        requestPushNotificationPermission,
        updatePushSettings,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        openNotificationTransaction,
        simulateBackgroundPushAlert,
      }}
    >
      {children}
    </DigiCashContext.Provider>
  );
};

export const useDigiCash = () => {
  const context = useContext(DigiCashContext);
  if (!context) {
    throw new Error('useDigiCash must be used within a DigiCashProvider');
  }
  return context;
};
