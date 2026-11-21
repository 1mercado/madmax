import { Biller, Transaction } from '../types';

// ============================================================================
// CLIENT-SIDE PUBLIC KEYRING (Paired with Server-Side Secret Keys in server.ts)
// ============================================================================

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

export const PUBLIC_GATEWAY_KEYS = {
  digicash:
    env.VITE_DIGICASH_PUBLIC_KEY || 'pk_live_digicash_ph_9f8a7b6c5d4e3f2a1b0c9d8e',
  paymongo:
    env.VITE_PAYMONGO_PUBLIC_KEY || 'pk_live_paymongo_ph_88a1c4f92e03b7d65194a8c2',
  maya:
    env.VITE_MAYA_PUBLIC_KEY || 'pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah',
  xendit:
    env.VITE_XENDIT_PUBLIC_KEY || 'xnd_public_production_Z8kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0',
  gotyme:
    env.VITE_GOTYME_PUBLIC_KEY || 'gt_pub_live_ph_60129483726150493827',
  telcoEload:
    env.VITE_TELCO_ELOAD_PUBLIC_KEY || 'telco_pk_live_smart_globe_dito_3344556677',
  bancnetBillers:
    env.VITE_BANCNET_BILLERS_PUBLIC_KEY || 'bn_pub_live_bsp_clearing_112233445566',
} as const;

export function getPublicGatewayForChannel(channelOrType: string): {
  gatewayProvider: string;
  publicKeyId: string;
  signatureHash: string;
} {
  const norm = (channelOrType || '').toLowerCase();
  const suffix = Math.random().toString(16).slice(2, 14);

  if (norm.includes('gcash') || norm.includes('qr ph')) {
    return {
      gatewayProvider: 'PayMongo Philippines (GCash / QR Ph)',
      publicKeyId: PUBLIC_GATEWAY_KEYS.paymongo,
      signatureHash: `sig_pm_${suffix}`,
    };
  }
  if (norm.includes('maya')) {
    return {
      gatewayProvider: 'Maya Philippines / Maya Bank',
      publicKeyId: PUBLIC_GATEWAY_KEYS.maya,
      signatureHash: `sig_maya_${suffix}`,
    };
  }
  if (norm.includes('gotyme')) {
    return {
      gatewayProvider: 'GoTyme Bank Corporation OpenAPI',
      publicKeyId: PUBLIC_GATEWAY_KEYS.gotyme,
      signatureHash: `sig_gt_${suffix}`,
    };
  }
  if (norm.includes('bank') || norm.includes('instapay') || norm.includes('pesonet')) {
    return {
      gatewayProvider: 'Xendit Philippines (InstaPay / PESONet)',
      publicKeyId: PUBLIC_GATEWAY_KEYS.xendit,
      signatureHash: `sig_xnd_${suffix}`,
    };
  }
  if (norm.includes('telco') || norm.includes('load') || norm.includes('smart') || norm.includes('globe') || norm.includes('dito') || norm.includes('tnt')) {
    return {
      gatewayProvider: 'PH Telco Direct HLR Aggregator',
      publicKeyId: PUBLIC_GATEWAY_KEYS.telcoEload,
      signatureHash: `sig_hlr_${suffix}`,
    };
  }
  if (norm.includes('bill') || norm.includes('bancnet')) {
    return {
      gatewayProvider: 'BancNet / BSP Multi-Biller Settlement Hub',
      publicKeyId: PUBLIC_GATEWAY_KEYS.bancnetBillers,
      signatureHash: `sig_bn_${suffix}`,
    };
  }
  return {
    gatewayProvider: 'DigiCash Core Clearinghouse',
    publicKeyId: PUBLIC_GATEWAY_KEYS.digicash,
    signatureHash: `sig_dc_${suffix}`,
  };
}

function buildGatewayHeaders(gatewayPublicKey: string = PUBLIC_GATEWAY_KEYS.digicash): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-DigiCash-Public-Key': PUBLIC_GATEWAY_KEYS.digicash,
    'X-Gateway-Public-Key': gatewayPublicKey,
  };
}

export interface RecipientLookupResult {
  verified: boolean;
  identifier?: string;
  accountName?: string;
  maskedName?: string;
  institution?: string;
  rail?: 'DIGICASH_P2P' | 'INSTAPAY' | 'PESONET';
  fee?: number;
  instantPosting?: boolean;
  message?: string;
  gatewayProvider?: string;
  publicKeyId?: string;
  signatureHash?: string;
}

export interface BillVerificationResult {
  verified: boolean;
  billerName?: string;
  accountNumber?: string;
  subscriberName?: string;
  statementAmount?: number;
  dueDate?: string;
  postingWindow?: string;
  status?: string;
  error?: string;
  gatewayProvider?: string;
  publicKeyId?: string;
  signatureHash?: string;
}

export interface SavedBillerAccount {
  id: string;
  ownerPhone: string;
  billerId: string;
  billerName: string;
  billerCode: string;
  category: string;
  accountNumber: string;
  nickname: string;
}

export interface TelcoLookupResult {
  success: boolean;
  phone: string;
  telco: 'Smart' | 'Globe' | 'DITO' | 'TNT';
  networkName: string;
  hlrStatus: string;
  prefix: string;
  gatewayProvider?: string;
  publicKeyId?: string;
  signatureHash?: string;
}

export async function lookupRecipient(params: {
  identifier: string;
  channel: string;
  bankName?: string;
}): Promise<RecipientLookupResult> {
  try {
    const gwInfo = getPublicGatewayForChannel(params.channel);
    const qs = new URLSearchParams({
      identifier: params.identifier,
      channel: params.channel,
      bankName: params.bankName || '',
    });
    const res = await fetch(`/api/fintech/lookup-recipient?${qs.toString()}`, {
      headers: buildGatewayHeaders(gwInfo.publicKeyId),
    });
    if (!res.ok) return { verified: false };
    return await res.json();
  } catch {
    return { verified: false };
  }
}

export async function sendMoneyApi(params: {
  senderPhone: string;
  recipientIdentifier: string;
  recipientName: string;
  amount: number;
  channel: string;
  bankName?: string;
  note?: string;
}): Promise<{
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  newPoints?: number;
  clearingTraceId?: string;
  rail?: string;
  error?: string;
}> {
  try {
    const gwInfo = getPublicGatewayForChannel(params.channel);
    const res = await fetch('/api/fintech/send-money', {
      method: 'POST',
      headers: buildGatewayHeaders(gwInfo.publicKeyId),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error while connecting to InstaPay / DigiCash rail.' };
  }
}

export async function generateQrPhPayload(params: {
  accountPhone: string;
  accountName: string;
  amount?: number;
}): Promise<{
  success: boolean;
  qrPhPayload?: string;
  standard?: string;
  merchantId?: string;
  gatewayProvider?: string;
  publicKeyId?: string;
  signatureHash?: string;
}> {
  try {
    const res = await fetch('/api/fintech/qrph-generate', {
      method: 'POST',
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.paymongo),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function receiveMoneyApi(params: {
  recipientPhone: string;
  senderName: string;
  sourceChannel: string;
  amount: number;
  note?: string;
}): Promise<{
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  clearingTraceId?: string;
  error?: string;
}> {
  try {
    const gwInfo = getPublicGatewayForChannel(params.sourceChannel);
    const res = await fetch('/api/fintech/receive-money', {
      method: 'POST',
      headers: buildGatewayHeaders(gwInfo.publicKeyId),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Failed to process incoming QR Ph / InstaPay deposit.' };
  }
}

export async function lookupTelcoSubscriber(phone: string): Promise<TelcoLookupResult | null> {
  try {
    const res = await fetch(`/api/fintech/telco-lookup?phone=${encodeURIComponent(phone)}`, {
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.telcoEload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function buyLoadApi(params: {
  accountPhone: string;
  targetPhone: string;
  telco: string;
  amount: number;
  promoTitle?: string;
  promoCode?: string;
}): Promise<{
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  newPoints?: number;
  serialPin?: string;
  clearingTraceId?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/fintech/buy-load', {
      method: 'POST',
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.telcoEload),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Failed to connect to Telco Direct E-Load gateway.' };
  }
}

export async function verifyBillStatement(params: {
  billerCode: string;
  billerName: string;
  accountNumber: string;
}): Promise<BillVerificationResult> {
  try {
    const res = await fetch('/api/fintech/verify-bill', {
      method: 'POST',
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.bancnetBillers),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { verified: false, error: 'Unable to reach BancNet Billers Clearinghouse.' };
  }
}

export async function payBillApi(params: {
  accountPhone: string;
  biller: Biller;
  accountNumber: string;
  amount: number;
  saveAsFavorite?: boolean;
  favoriteNickname?: string;
}): Promise<{
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  newPoints?: number;
  savedBillers?: SavedBillerAccount[];
  clearingTraceId?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/fintech/pay-bill', {
      method: 'POST',
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.bancnetBillers),
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error while settling bill payment.' };
  }
}

export async function fetchWalletFromServer(phone: string): Promise<{
  found: boolean;
  account?: {
    phone: string;
    name: string;
    email: string;
    balance: number;
    points: number;
    tier: string;
  };
  transactions?: Transaction[];
  savedBillers?: SavedBillerAccount[];
}> {
  try {
    const res = await fetch(`/api/fintech/wallet/${encodeURIComponent(phone)}`, {
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.digicash),
    });
    if (!res.ok) return { found: false };
    return await res.json();
  } catch {
    return { found: false };
  }
}

export async function syncWalletToServer(params: {
  phone: string;
  name: string;
  email: string;
  balance: number;
  points: number;
  tier: string;
}): Promise<void> {
  try {
    await fetch('/api/fintech/wallet/sync', {
      method: 'POST',
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.digicash),
      body: JSON.stringify(params),
    });
  } catch {
    // ignore offline sync error
  }
}

export async function fetchPendingServerNotifications(
  phone: string,
  sinceTimestamp: number
): Promise<{
  success: boolean;
  notifications?: Array<{
    id: string;
    category: 'INCOMING_TRANSFER' | 'BILL_PAYMENT';
    title: string;
    body: string;
    amount: number;
    referenceNumber: string;
    transactionId: string;
    recipientOrSender?: string;
    gatewayProvider?: string;
    timestamp: string;
    createdAt: number;
    transaction?: Transaction;
  }>;
  serverTimestamp?: number;
}> {
  try {
    const qs = new URLSearchParams({
      phone,
      since: String(sinceTimestamp),
    });
    const res = await fetch(`/api/fintech/notifications/pending?${qs.toString()}`, {
      headers: buildGatewayHeaders(PUBLIC_GATEWAY_KEYS.digicash),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch {
    return { success: false };
  }
}

