export type ThemeMode = 'dark' | 'light';

export type UserTier = 'BASIC' | 'BUILDER' | 'VIP_1' | 'VIP_2' | 'VIP_3';

export interface UserTierConfig {
  tier: UserTier;
  title: string;
  price: number;
  description: string;
  badgeColor: string;
  levelsUnlocked: number;
}

export interface RegisteredAccount {
  phone: string;
  name: string;
  email: string;
  mpin: string;
  registeredAt: string;
  isActivated: boolean;
  activationPayment?: {
    amount: number;
    gcashNumber: string;
    referenceNumber: string;
    activatedAt: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  points: number;
  tier: UserTier;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  isActivated: boolean;
  activationPayment?: {
    amount: number;
    gcashNumber: string;
    referenceNumber: string;
    activatedAt: string;
  };
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number;
}

export type TransactionType =
  | 'SEND_MONEY'
  | 'RECEIVE_MONEY'
  | 'PAY_BILLS'
  | 'TOP_UP_LOAD'
  | 'REFERRAL_COMMISSION'
  | 'VIP_POOL_DISTRIBUTION'
  | 'BUILDER_UPGRADE'
  | 'SUBSCRIPTION_REBATE'
  | 'REWARDS_REDEEM'
  | 'VAULT_DEPOSIT'
  | 'VAULT_WITHDRAW';

export type TransactionDirection = 'INCOMING' | 'OUTGOING';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  direction: TransactionDirection;
  date: string;
  time: string;
  referenceNumber: string;
  status: 'Completed' | 'Pending' | 'Failed';
  fee: number;
  recipientOrBiller: string;
  breakdownNote?: string;
  gatewayProvider?: string;
  publicKeyId?: string;
  signatureHash?: string;
}

export interface Biller {
  id: string;
  name: string;
  category: 'Electricity' | 'Water' | 'Internet' | 'Cable TV' | 'Government' | 'Loans' | 'All';
  description: string;
  fee: number;
  code: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  rewardValueFormatted: string;
  cashCreditAmount: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: 'Emergency' | 'Investment' | 'Travel' | 'Gadget' | 'General';
  targetAmount: number;
  currentAmount: number;
  interestRatePA: number;
  deadlineDate: string;
  colorHex: string;
}

export interface NetworkMember {
  id: string;
  name: string;
  phone: string;
  level: number;
  tier: UserTier;
  joinedDate: string;
  earningsGenerated: number;
}

export interface SplitBreakdown {
  totalAmount: number;
  vipPoolTotal: number;
  vip1Share: number;
  vip2Share: number;
  vip3Share: number;
  subscriberCashback: number;
}

export interface SimulationResult {
  eventName: string;
  subscriberName: string;
  level: number;
  amount: number;
  split: SplitBreakdown;
  commissionEarned: number;
  isUnlocked: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  iconName: string;
  monthlyLimit: number;
  spent: number;
  color: string;
}

export interface BudgetExpenseEntry {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  date: string;
}

export type AppDestination =
  | 'SPLASH'
  | 'LOGIN'
  | 'MAIN'
  | 'SEND_MONEY'
  | 'RECEIVE_MONEY'
  | 'QR_SCANNER'
  | 'SAVINGS_VAULT'
  | 'PAY_BILLS'
  | 'TOP_UP'
  | 'BUDGET_PLANNER'
  | 'REWARDS'
  | 'REFERRALS'
  | 'VIP_TIERS'
  | 'BUILDER_UPGRADE'
  | 'TRANSACTIONS_FULL';

export type BottomNavTab = 'HOME' | 'TRANSACTIONS' | 'SERVICES' | 'PROFILE';

export type BiometricSensorType = 'fingerprint' | 'face' | 'device' | 'none';

export type AutoLockTimeout = 'immediately' | '1min' | '5min' | 'never';

export interface BiometricSecurityState {
  isLocked: boolean;
  isBiometricsEnabled: boolean;
  biometricType: BiometricSensorType;
  hasHardwareSensor: boolean;
  mpin: string;
  autoLockTimeout: AutoLockTimeout;
  lastUnlockedAt: string | null;
  unlockHistory: Array<{ timestamp: string; method: 'biometrics' | 'mpin'; success: boolean }>;
}

export type PushNotificationCategory = 'INCOMING_TRANSFER' | 'BILL_PAYMENT' | 'SYSTEM';

export interface AppNotification {
  id: string;
  category: PushNotificationCategory;
  title: string;
  body: string;
  amount?: number;
  referenceNumber?: string;
  transactionId?: string;
  recipientOrSender?: string;
  gatewayProvider?: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  deliveredViaPush: boolean;
  wasBackgrounded: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  incomingTransfers: boolean;
  billPayments: boolean;
  backgroundSync: boolean;
  soundAlerts: boolean;
}

