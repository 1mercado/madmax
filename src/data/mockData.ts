import { Biller, NetworkMember, RewardItem, SavingsGoal, Transaction, UserProfile, UserTierConfig, SplitBreakdown } from '../types';

export const USER_TIERS: Record<string, UserTierConfig> = {
  BASIC: {
    tier: 'BASIC',
    title: 'Basic Subscriber',
    price: 500.0,
    description: 'Upon subscription 60% goes up and splits to VIP 1, 2, 3 and 40% remains to subscriber • Levels 1–3 unlocked',
    badgeColor: '#00E5FF',
    levelsUnlocked: 3,
  },
  BUILDER: {
    tier: 'BUILDER',
    title: 'Builder Subscriber',
    price: 5000.0,
    description: 'Builder Subscriber • Unlocks 4th level across 10th level • 60% split to VIP 1, 2, 3 and 40% remains',
    badgeColor: '#00D294',
    levelsUnlocked: 10,
  },
  VIP_1: {
    tier: 'VIP_1',
    title: 'VIP 1',
    price: 1000.0,
    description: 'Julius Hate • Monthly Benefits • VIP Pool Split to Infinity',
    badgeColor: '#FFB300',
    levelsUnlocked: 10,
  },
  VIP_2: {
    tier: 'VIP_2',
    title: 'VIP 2',
    price: 5000.0,
    description: 'Randy Andong • Bigger Rewards • VIP Pool Split to Infinity',
    badgeColor: '#FF9100',
    levelsUnlocked: 10,
  },
  VIP_3: {
    tier: 'VIP_3',
    title: 'VIP 3',
    price: 10000.0,
    description: 'Elle Valenzona • Max Earnings • Dedicated Manager • VIP Pool Split to Infinity',
    badgeColor: '#FF3D00',
    levelsUnlocked: 10,
  },
};

export const LEVEL_PERCENTAGES: Array<{ level: number; percentage: number }> = [
  { level: 1, percentage: 10.0 },
  { level: 2, percentage: 5.0 },
  { level: 3, percentage: 4.0 },
  { level: 4, percentage: 3.0 },
  { level: 5, percentage: 2.0 },
  { level: 6, percentage: 1.5 },
  { level: 7, percentage: 1.0 },
  { level: 8, percentage: 0.75 },
  { level: 9, percentage: 0.5 },
  { level: 10, percentage: 0.25 },
];

export function isLevelUnlocked(level: number, tier: string): boolean {
  if (tier === 'BASIC') {
    return level <= 3;
  }
  return level <= 10;
}

export function calculateSplit(amount: number): SplitBreakdown {
  const vipTotal = amount * 0.6;
  const vipShareEach = vipTotal / 3.0;
  const subscriberCashback = amount * 0.4;
  return {
    totalAmount: amount,
    vipPoolTotal: vipTotal,
    vip1Share: vipShareEach,
    vip2Share: vipShareEach,
    vip3Share: vipShareEach,
    subscriberCashback,
  };
}

export function calculateCommission(amount: number, level: number): number {
  const item = LEVEL_PERCENTAGES.find((l) => l.level === level);
  const pct = item ? item.percentage : 0;
  return amount * (pct / 100.0);
}

export const INITIAL_USER: UserProfile = {
  id: '09171234567',
  name: 'Super Admin',
  email: 'superadmin@digicash.ph',
  phone: '+63 917 123 4567',
  balance: 25000.0,
  points: 500,
  tier: 'BASIC',
  role: 'SUPER_ADMIN',
  isActivated: true,
  activationPayment: {
    amount: 500.0,
    gcashNumber: '0999 576 0130',
    referenceNumber: 'GCASH-ADM-8092718',
    activatedAt: '2026-10-23T10:00:00Z',
  },
  referralCode: 'DC2026',
  referralLink: 'https://digicash.ph/r/DC2026',
  totalReferrals: 0,
  totalEarnings: 0.0,
};

// Official release starts with pristine, zero-record state
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_NETWORK_MEMBERS: NetworkMember[] = [];

export const BILLERS_LIST: Biller[] = [
  { id: 'b1', name: 'MERALCO', category: 'Electricity', description: 'Manila Electric Company (Real-Time Posting)', fee: 0.0, code: 'MER' },
  { id: 'b2', name: 'Maynilad', category: 'Water', description: 'Maynilad Water Services Inc.', fee: 0.0, code: 'MYN' },
  { id: 'b3', name: 'Manila Water', category: 'Water', description: 'Manila Water Company', fee: 0.0, code: 'MWC' },
  { id: 'b4', name: 'PLDT Home', category: 'Internet', description: 'PLDT Landline & Fibr Broadband', fee: 0.0, code: 'PLDT' },
  { id: 'b5', name: 'Globe At Home', category: 'Internet', description: 'Globe Postpaid & GFiber', fee: 0.0, code: 'GLB' },
  { id: 'b6', name: 'Converge ICT', category: 'Internet', description: 'Converge FiberX Broadband', fee: 0.0, code: 'CNV' },
  { id: 'b7', name: 'Sky Cable', category: 'Cable TV', description: 'Sky Cable & Sky Fiber', fee: 0.0, code: 'SKY' },
  { id: 'b8', name: 'Cignal TV', category: 'Cable TV', description: 'Cignal Postpaid / Prepaid Direct', fee: 0.0, code: 'CIG' },
  { id: 'b9', name: 'SSS Contributions', category: 'Government', description: 'Social Security System (PRN)', fee: 10.0, code: 'SSS' },
  { id: 'b10', name: 'PhilHealth', category: 'Government', description: 'Philippine Health Insurance Corp.', fee: 10.0, code: 'PHL' },
  { id: 'b11', name: 'Pag-IBIG Fund', category: 'Government', description: 'HDMF / MP2 Savings & Housing', fee: 10.0, code: 'HDMF' },
  { id: 'b12', name: 'Home Credit', category: 'Loans', description: 'Home Credit Philippines Loans', fee: 15.0, code: 'HCD' },
  { id: 'b13', name: 'Maya Credit / Loans', category: 'Loans', description: 'Maya Easy Credit & Personal Loan', fee: 0.0, code: 'MAYA' },
  { id: 'b14', name: 'BDO Credit Cards', category: 'Loans', description: 'BDO Visa / Mastercard / Amex', fee: 0.0, code: 'BDOC' },
];

export const REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'rw1',
    title: '₱50 Cash Voucher',
    description: 'Instant ₱50 cash credited directly to your DigiCash wallet.',
    pointsCost: 2500,
    category: 'Cash',
    rewardValueFormatted: '₱50.00',
    cashCreditAmount: 50.0,
  },
  {
    id: 'rw2',
    title: 'Free Load ₱100',
    description: 'Get ₱100 free mobile prepaid load voucher code.',
    pointsCost: 1000,
    category: 'Load',
    rewardValueFormatted: '₱100.00',
    cashCreditAmount: 100.0,
  },
  {
    id: 'rw3',
    title: 'Shopping Discount ₱1,000',
    description: 'Special e-commerce discount voucher for partner merchants.',
    pointsCost: 5000,
    category: 'Shopping',
    rewardValueFormatted: '₱1,000 OFF',
    cashCreditAmount: 0.0,
  },
  {
    id: 'rw4',
    title: 'Exclusive Item & Merch',
    description: 'DigiCash Worldwide VIP metallic cardholder & premium cap.',
    pointsCost: 10000,
    category: 'Exclusive',
    rewardValueFormatted: 'VIP Merch',
    cashCreditAmount: 0.0,
  },
];

// Clean initial goals state for new users
export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

// Clean initial budget tracking with 0 spent
export const INITIAL_BUDGET_CATEGORIES = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    iconName: 'Utensils',
    monthlyLimit: 8000,
    spent: 0,
    color: '#ff9100',
  },
  {
    id: 'cat-bills',
    name: 'Utilities & Bills',
    iconName: 'Zap',
    monthlyLimit: 7000,
    spent: 0,
    color: '#00e5ff',
  },
  {
    id: 'cat-transfers',
    name: 'Transfers & Remittance',
    iconName: 'Send',
    monthlyLimit: 5000,
    spent: 0,
    color: '#00f5a0',
  },
  {
    id: 'cat-load',
    name: 'Mobile Load & Telco',
    iconName: 'Smartphone',
    monthlyLimit: 1500,
    spent: 0,
    color: '#40c4ff',
  },
  {
    id: 'cat-shopping',
    name: 'Groceries & Shopping',
    iconName: 'ShoppingBag',
    monthlyLimit: 6000,
    spent: 0,
    color: '#d500f9',
  },
  {
    id: 'cat-transport',
    name: 'Transport & Gas',
    iconName: 'Car',
    monthlyLimit: 3500,
    spent: 0,
    color: '#ffab00',
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment & Subs',
    iconName: 'Film',
    monthlyLimit: 2500,
    spent: 0,
    color: '#ff5252',
  },
  {
    id: 'cat-health',
    name: 'Health & Wellness',
    iconName: 'HeartPulse',
    monthlyLimit: 2000,
    spent: 0,
    color: '#1de9b6',
  },
];

