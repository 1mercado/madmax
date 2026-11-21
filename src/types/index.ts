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
  | 'TRANSACTIONS_FULL'
  | 'KYC_COMPLIANCE';

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

// ============================================================================
// KYC (Know Your Customer) & AML (Anti-Money Laundering) Infrastructure Types
// Aligned with BSP Circulars 950 / 1022 and AMLA (RA 9160 as amended)
// ============================================================================

export type KycTier = 'TIER_1_BASIC' | 'TIER_2_VERIFIED' | 'TIER_3_ENHANCED';

export type KycStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ACTION_REQUIRED';

export type GovernmentIdType =
  | 'PHILSYS_NATIONAL_ID'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'UMID'
  | 'PRC_ID'
  | 'POSTAL_ID'
  | 'VOTERS_ID';

export type AmlRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AmlAlertType =
  | 'CTR_THRESHOLD'
  | 'STR_STRUCTURING'
  | 'VELOCITY_SPIKE'
  | 'SANCTIONS_MATCH'
  | 'PEP_FLAG'
  | 'KYC_LIMIT_EXCEEDED'
  | 'ACCOUNT_FROZEN';

export type AmlCaseStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'CLEARED'
  | 'FILED_AMLC'
  | 'ESCALATED';

export interface KycTierLimits {
  tier: KycTier;
  label: string;
  singleTransactionLimit: number;
  dailyOutgoingLimit: number;
  monthlyOutgoingLimit: number;
  maxWalletBalance: number;
  features: string[];
}

export interface SanctionsScreeningMatch {
  listName: 'OFAC SDN' | 'UNSC Consolidated' | 'AMLC PH Watchlist' | 'PEP Registry';
  matchedTerm: string;
  confidence: number;
  category: 'SANCTIONS' | 'TERRORISM_FINANCING' | 'PEP' | 'ADVERSE_MEDIA';
}

export interface SanctionsScreeningResult {
  screenedName: string;
  screenedAt: string;
  status: 'CLEAR' | 'REVIEW_REQUIRED' | 'BLOCKED';
  riskScore: number;
  riskLevel: AmlRiskLevel;
  matches: SanctionsScreeningMatch[];
  screeningRef: string;
}

export interface KycProfile {
  phone: string;
  tier: KycTier;
  status: KycStatus;
  fullLegalName: string;
  dateOfBirth?: string;
  nationality?: string;
  residentialAddress?: string;
  city?: string;
  occupation?: string;
  sourceOfFunds?: string;
  idType?: GovernmentIdType;
  maskedIdNumber?: string;
  idDocumentHash?: string;
  selfieDocumentHash?: string;
  hasFrontId: boolean;
  hasBackId: boolean;
  hasSelfieLiveness: boolean;
  livenessScore?: number;
  isPep: boolean;
  pepDetails?: string;
  riskScore: number;
  riskLevel: AmlRiskLevel;
  screeningStatus: 'NOT_SCREENED' | 'CLEAR' | 'REVIEW_REQUIRED' | 'BLOCKED';
  screeningRef?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
  isFrozen: boolean;
  frozenReason?: string;
}

export interface AmlAlert {
  id: string;
  accountPhone: string;
  accountName: string;
  type: AmlAlertType;
  severity: AmlRiskLevel;
  status: AmlCaseStatus;
  title: string;
  description: string;
  amount?: number;
  transactionRef?: string;
  counterparty?: string;
  ruleTriggered: string;
  amlcFilingRef?: string;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceAuditEntry {
  id: string;
  timestamp: string;
  actorPhone: string;
  actorRole: string;
  action: string;
  targetPhone?: string;
  details: string;
}

export interface ComplianceProfileResponse {
  success: boolean;
  profile: KycProfile;
  limits: KycTierLimits;
  allTiers: Record<KycTier, KycTierLimits>;
  usage: {
    dailyOutgoingUsed: number;
    monthlyOutgoingUsed: number;
    dailyRemaining: number;
    monthlyRemaining: number;
  };
  recentAlerts: AmlAlert[];
}

export interface AdminComplianceOverview {
  success: boolean;
  metrics: {
    totalAccounts: number;
    pendingKycCount: number;
    verifiedKycCount: number;
    openAmlAlerts: number;
    ctrCount: number;
    strCount: number;
    frozenAccountsCount: number;
  };
  kycApplications: KycProfile[];
  amlAlerts: AmlAlert[];
  frozenAccounts: Array<{
    phone: string;
    reason: string;
    frozenBy: string;
    frozenAt: string;
  }>;
  auditLog: ComplianceAuditEntry[];
}


