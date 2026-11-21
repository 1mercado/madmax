import { AppNotification, PushNotificationSettings, Transaction } from '../types';

export type BrowserPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

const PUSH_SETTINGS_KEY = 'digicash_push_settings_v1';
const NOTIFICATIONS_STORAGE_KEY = 'digicash_notifications_v1';

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  enabled: true,
  incomingTransfers: true,
  billPayments: true,
  backgroundSync: true,
  soundAlerts: true,
};

export function loadPushSettings(): PushNotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_PUSH_SETTINGS;
  try {
    const raw = localStorage.getItem(PUSH_SETTINGS_KEY);
    if (!raw) return DEFAULT_PUSH_SETTINGS;
    return { ...DEFAULT_PUSH_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PUSH_SETTINGS;
  }
}

export function savePushSettings(settings: PushNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PUSH_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function loadStoredNotifications(initialTransactions: Transaction[] = []): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback below
  }

  // Seed initial notifications from incoming transfers & completed bill payments in history
  const seeded: AppNotification[] = initialTransactions
    .filter((tx) => tx.type === 'RECEIVE_MONEY' || tx.type === 'PAY_BILLS')
    .slice(0, 5)
    .map((tx, idx) => {
      const isIncoming = tx.type === 'RECEIVE_MONEY';
      return {
        id: `NOTIF-INIT-${tx.id}-${idx}`,
        category: isIncoming ? 'INCOMING_TRANSFER' : 'BILL_PAYMENT',
        title: isIncoming
          ? `💸 +₱${tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} Received!`
          : `✅ Bill Payment Completed: ${tx.title}`,
        body: isIncoming
          ? `${tx.subtitle} • Ref: ${tx.referenceNumber}`
          : `₱${tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} paid (${tx.subtitle}) • Ref: ${tx.referenceNumber}`,
        amount: tx.amount,
        referenceNumber: tx.referenceNumber,
        transactionId: tx.id,
        recipientOrSender: tx.recipientOrBiller,
        gatewayProvider: tx.gatewayProvider,
        timestamp: tx.time || 'Today',
        createdAt: Date.now() - (idx + 1) * 60000,
        read: idx > 1,
        deliveredViaPush: true,
        wasBackgrounded: false,
      };
    });

  return seeded;
}

export function saveStoredNotifications(list: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore storage quota errors
  }
}

export function getBrowserNotificationPermission(): BrowserPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as BrowserPermissionState;
}

export async function requestBrowserPushPermission(): Promise<{
  permission: BrowserPermissionState;
  granted: boolean;
  note?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      permission: 'unsupported',
      granted: false,
      note: 'Browser Notification API is not supported in this browser.',
    };
  }

  if (Notification.permission === 'granted') {
    await ensureServiceWorkerReady();
    return { permission: 'granted', granted: true };
  }

  try {
    const result = await Notification.requestPermission();
    await ensureServiceWorkerReady();
    if (result === 'granted') {
      return { permission: 'granted', granted: true };
    }
    return {
      permission: result as BrowserPermissionState,
      granted: false,
      note:
        result === 'denied'
          ? 'Browser notifications are blocked in site settings or preview frame. Background & in-app push alerts remain active.'
          : 'Notification permission prompt was dismissed.',
    };
  } catch {
    return {
      permission: getBrowserNotificationPermission(),
      granted: false,
      note: 'Native OS permission prompt restricted by iframe container; Service Worker & In-App Push Alerts enabled.',
    };
  }
}

export async function ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export function syncBackgroundWatchWithSw(
  phone: string,
  settings: PushNotificationSettings,
  lastCheckedTimestamp?: number
): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      const target = reg.active || navigator.serviceWorker.controller;
      if (target) {
        target.postMessage({
          type: 'CONFIGURE_BACKGROUND_WATCH',
          phone,
          settings,
          lastCheckedTimestamp: lastCheckedTimestamp || Date.now(),
        });
      }
    })
    .catch(() => {});
}

export function triggerSwBackgroundCheck(phone: string): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      const target = reg.active || navigator.serviceWorker.controller;
      if (target) {
        target.postMessage({
          type: 'CHECK_BACKGROUND_ALERTS',
          phone,
        });
      }
    })
    .catch(() => {});
}

/**
 * Dispatches a Browser Push Notification via Service Worker (works in background/minimized tabs)
 * with graceful fallback to the standard Web Notification constructor.
 */
export async function dispatchBrowserPushNotification(
  notification: AppNotification,
  settings: PushNotificationSettings,
  onClickTransactionId?: (txId?: string, ref?: string) => void
): Promise<boolean> {
  if (!settings.enabled) return false;
  if (notification.category === 'INCOMING_TRANSFER' && !settings.incomingTransfers) {
    return false;
  }
  if (notification.category === 'BILL_PAYMENT' && !settings.billPayments) {
    return false;
  }

  const permission = getBrowserNotificationPermission();
  if (permission !== 'granted') {
    return false;
  }

  const tag = notification.referenceNumber || notification.id;
  const payload = {
    id: notification.id,
    tag,
    title: notification.title,
    body: notification.body,
    category: notification.category,
    transactionId: notification.transactionId,
    referenceNumber: notification.referenceNumber,
    amount: notification.amount,
    requireInteraction: document.visibilityState === 'hidden',
  };

  // 1. Prefer Service Worker showNotification so it works when tab is in the background or minimized
  try {
    const reg = await ensureServiceWorkerReady();
    if (reg && 'showNotification' in reg) {
      await reg.showNotification(notification.title, {
        body: notification.body,
        icon: '/assets/digicash_logo.png',
        badge: '/assets/digicash_logo_transparent.png',
        tag,
        data: payload,
        requireInteraction: document.visibilityState === 'hidden',
      });
      return true;
    }
  } catch {
    // Fallback to controller postMessage or window.Notification below
  }

  // 2. Try posting to Service Worker controller
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_PUSH_NOTIFICATION',
        payload,
      });
      return true;
    }
  } catch {
    // Fallback to window.Notification below
  }

  // 3. Direct Web Notification API fallback
  try {
    const nativeNotif = new Notification(notification.title, {
      body: notification.body,
      icon: '/assets/digicash_logo.png',
      badge: '/assets/digicash_logo_transparent.png',
      tag,
    });
    nativeNotif.onclick = () => {
      window.focus();
      nativeNotif.close();
      if (onClickTransactionId) {
        onClickTransactionId(notification.transactionId, notification.referenceNumber);
      }
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Schedules a push notification inside the Service Worker after a delay (e.g. 4 seconds)
 * so the user can switch tabs or minimize the browser and experience the background push alert.
 */
export async function scheduleServiceWorkerBackgroundPush(
  notification: AppNotification,
  delayMs: number = 4000
): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await ensureServiceWorkerReady();
    const target = reg?.active || navigator.serviceWorker.controller;
    if (target) {
      target.postMessage({
        type: 'SCHEDULE_BACKGROUND_PUSH',
        delayMs,
        payload: {
          id: notification.id,
          tag: notification.referenceNumber || notification.id,
          title: notification.title,
          body: notification.body,
          category: notification.category,
          transactionId: notification.transactionId,
          referenceNumber: notification.referenceNumber,
          amount: notification.amount,
          requireInteraction: true,
        },
      });
    }
  } catch {
    // ignore
  }
}

export function buildIncomingTransferNotification(tx: Transaction, wasBackgrounded = false): AppNotification {
  const formattedAmt = tx.amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return {
    id: `NOTIF-${tx.id}-${Date.now()}`,
    category: 'INCOMING_TRANSFER',
    title: `💸 +₱${formattedAmt} Incoming Transfer`,
    body: `${tx.title} (${tx.subtitle}) • Ref: ${tx.referenceNumber}`,
    amount: tx.amount,
    referenceNumber: tx.referenceNumber,
    transactionId: tx.id,
    recipientOrSender: tx.recipientOrBiller,
    gatewayProvider: tx.gatewayProvider,
    timestamp: tx.time || 'Just now',
    createdAt: Date.now(),
    read: false,
    deliveredViaPush: true,
    wasBackgrounded,
  };
}

export function buildBillPaymentNotification(tx: Transaction, wasBackgrounded = false): AppNotification {
  const formattedAmt = tx.amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return {
    id: `NOTIF-${tx.id}-${Date.now()}`,
    category: 'BILL_PAYMENT',
    title: `✅ Bill Paid: ${tx.title}`,
    body: `₱${formattedAmt} settled for ${tx.subtitle} • Ref: ${tx.referenceNumber}`,
    amount: tx.amount,
    referenceNumber: tx.referenceNumber,
    transactionId: tx.id,
    recipientOrSender: tx.recipientOrBiller,
    gatewayProvider: tx.gatewayProvider,
    timestamp: tx.time || 'Just now',
    createdAt: Date.now(),
    read: false,
    deliveredViaPush: true,
    wasBackgrounded,
  };
}
