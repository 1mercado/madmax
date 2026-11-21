import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { AppNotification } from '../../types';

export const PushNotificationBanner: React.FC = () => {
  const {
    activePushBanner,
    dismissPushBanner,
    openNotificationTransaction,
    backgroundSimulationPending,
  } = useDigiCash();

  useEffect(() => {
    if (!activePushBanner) return;
    const timer = setTimeout(() => {
      dismissPushBanner();
    }, 6500);
    return () => clearTimeout(timer);
  }, [activePushBanner, dismissPushBanner]);

  return (
    <>
      {/* Countdown Pill when Background Simulation is Armed */}
      {backgroundSimulationPending && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-md pointer-events-auto">
          <div className="rounded-2xl bg-[#071f3e]/95 border border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.35)] px-4 py-3 backdrop-blur-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center shrink-0 animate-pulse">
              <Clock className="w-5 h-5 text-[#00e5ff]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-[#00e5ff] uppercase tracking-wider">
                Background Push Armed (3.5s)
              </div>
              <p className="text-[11px] text-slate-200 leading-tight mt-0.5">
                Switch to another browser tab or minimize now to see the{' '}
                <span className="text-[#00f5a0] font-semibold">
                  {backgroundSimulationPending === 'INCOMING_TRANSFER'
                    ? 'Incoming Transfer'
                    : 'Completed Bill Payment'}
                </span>{' '}
                push alert in the background!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Push Toast Banner */}
      {activePushBanner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[75] w-[94%] max-w-md pointer-events-auto">
          <div
            className={`rounded-2xl border shadow-2xl p-3.5 backdrop-blur-xl transition-all ${
              activePushBanner.category === 'INCOMING_TRANSFER'
                ? 'bg-[#062338]/95 border-[#00f5a0]/70 shadow-[0_10px_35px_rgba(0,245,160,0.28)]'
                : 'bg-[#081d38]/95 border-[#00e5ff]/70 shadow-[0_10px_35px_rgba(0,229,255,0.28)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  activePushBanner.category === 'INCOMING_TRANSFER'
                    ? 'bg-[#00f5a0]/20 border-[#00f5a0]/50 text-[#00f5a0]'
                    : 'bg-[#00e5ff]/20 border-[#00e5ff]/50 text-[#00e5ff]'
                }`}
              >
                {activePushBanner.category === 'INCOMING_TRANSFER' ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <Receipt className="w-5 h-5" />
                )}
              </div>

              <div
                onClick={() => {
                  openNotificationTransaction(activePushBanner);
                  dismissPushBanner();
                }}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#00e5ff]">
                    {activePushBanner.wasBackgrounded ? 'BACKGROUND PUSH' : 'LIVE PUSH ALERT'}
                  </span>
                  {activePushBanner.gatewayProvider && (
                    <span className="text-[9px] font-mono text-slate-300 truncate">
                      • {activePushBanner.gatewayProvider}
                    </span>
                  )}
                </div>
                <div className="text-xs font-extrabold text-white mt-1">
                  {activePushBanner.title}
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">
                  {activePushBanner.body}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00f5a0] hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    Tap to View Official Receipt
                  </span>
                  <span className="text-[10px] text-slate-400">{activePushBanner.timestamp}</span>
                </div>
              </div>

              <button
                onClick={dismissPushBanner}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                title="Dismiss Push Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const NotificationCenterModal: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    pushSettings,
    pushPermissionState,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    requestPushNotificationPermission,
    updatePushSettings,
    markAllNotificationsRead,
    clearNotifications,
    openNotificationTransaction,
    simulateBackgroundPushAlert,
    backgroundSimulationPending,
  } = useDigiCash();

  const [selectedTab, setSelectedTab] = useState<'ALL' | 'INCOMING_TRANSFER' | 'BILL_PAYMENT'>('ALL');
  const [permissionFeedback, setPermissionFeedback] = useState<string | null>(null);

  if (!isNotificationCenterOpen) return null;

  const filteredList = notifications.filter((item) => {
    if (selectedTab === 'ALL') return true;
    return item.category === selectedTab;
  });

  const handleEnableBrowserPush = async () => {
    setPermissionFeedback(null);
    const res = await requestPushNotificationPermission();
    if (res.granted) {
      setPermissionFeedback('Browser & Background Push Notifications enabled!');
    } else if (res.note) {
      setPermissionFeedback(res.note);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-[#071932] border border-[#00e5ff]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] text-white">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0b2548] to-[#071932] border-b border-[#00e5ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-[#00e5ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Push Notifications & Alerts
                </h3>
                {unreadNotificationCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#00f5a0] text-[#00222b]">
                    {unreadNotificationCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Real-time incoming transfer & bill payment background push system
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationCenterOpen(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Browser Push Status & Settings Card */}
          <div className="rounded-2xl bg-[#0b2342] border border-[#00e5ff]/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00f5a0]" />
                <span className="text-xs font-bold text-white">
                  Browser & Service Worker Push Status
                </span>
              </div>

              {pushPermissionState === 'granted' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40">
                  <Check className="w-3 h-3" />
                  OS / BROWSER PUSH GRANTED
                </span>
              ) : (
                <button
                  onClick={handleEnableBrowserPush}
                  className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-[#00e5ff] to-[#00f5a0] text-[#021024] hover:opacity-95 transition-all shadow-md"
                >
                  Enable Browser Push
                </button>
              )}
            </div>

            {permissionFeedback && (
              <div className="text-[11px] text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl px-3 py-2">
                {permissionFeedback}
              </div>
            )}

            {/* Category Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Incoming Transfers Toggle */}
              <button
                type="button"
                onClick={() =>
                  updatePushSettings({ incomingTransfers: !pushSettings.incomingTransfers })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  pushSettings.incomingTransfers
                    ? 'bg-[#00f5a0]/10 border-[#00f5a0]/40'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="pr-2">
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#00f5a0]" />
                    Incoming Transfers
                  </div>
                  <div className="text-[10px] text-slate-300">
                    QR Ph, GCash, Maya & P2P
                  </div>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    pushSettings.incomingTransfers ? 'bg-[#00f5a0]' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-[#021024] transition-transform ${
                      pushSettings.incomingTransfers ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              {/* Completed Bill Payments Toggle */}
              <button
                type="button"
                onClick={() => updatePushSettings({ billPayments: !pushSettings.billPayments })}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  pushSettings.billPayments
                    ? 'bg-[#00e5ff]/10 border-[#00e5ff]/40'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="pr-2">
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-[#00e5ff]" />
                    Completed Bills
                  </div>
                  <div className="text-[10px] text-slate-300">
                    BancNet Billers Settlement
                  </div>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    pushSettings.billPayments ? 'bg-[#00e5ff]' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-[#021024] transition-transform ${
                      pushSettings.billPayments ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Background Sync & Sound Row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() =>
                  updatePushSettings({ backgroundSync: !pushSettings.backgroundSync })
                }
                className="flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    pushSettings.backgroundSync ? 'bg-[#00f5a0]' : 'bg-slate-500'
                  }`}
                />
                <span>
                  Background Service Worker Watch:{' '}
                  <strong className="text-white">
                    {pushSettings.backgroundSync ? 'ON' : 'OFF'}
                  </strong>
                </span>
              </button>

              <button
                type="button"
                onClick={() => updatePushSettings({ soundAlerts: !pushSettings.soundAlerts })}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {pushSettings.soundAlerts ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#00e5ff]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Sound {pushSettings.soundAlerts ? 'On' : 'Muted'}</span>
              </button>
            </div>
          </div>

          {/* 2. Background Push Channel Verification Card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0e2a4f] to-[#09203d] border border-[#00f5a0]/35 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#00f5a0]" />
                <span className="text-xs font-extrabold text-white">
                  Verify Background Push Delivery (3.5s)
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0]">
                Service Worker Live
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Send a background push verification signal to confirm your device receives incoming transfer and bill payment alerts when minimized.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={Boolean(backgroundSimulationPending)}
                onClick={() => {
                  simulateBackgroundPushAlert('INCOMING_TRANSFER', 3500);
                }}
                className="py-2 px-3 rounded-xl bg-[#00f5a0]/20 hover:bg-[#00f5a0]/30 border border-[#00f5a0]/50 text-[#00f5a0] text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>
                  {backgroundSimulationPending === 'INCOMING_TRANSFER'
                    ? 'Verifying (3.5s)...'
                    : 'Verify Transfer Push'}
                </span>
              </button>

              <button
                type="button"
                disabled={Boolean(backgroundSimulationPending)}
                onClick={() => {
                  simulateBackgroundPushAlert('BILL_PAYMENT', 3500);
                }}
                className="py-2 px-3 rounded-xl bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 border border-[#00e5ff]/50 text-[#00e5ff] text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>
                  {backgroundSimulationPending === 'BILL_PAYMENT'
                    ? 'Verifying (3.5s)...'
                    : 'Verify Bill Push'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Filter Tabs & Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'All Alerts' },
                  { id: 'INCOMING_TRANSFER', label: 'Incoming' },
                  { id: 'BILL_PAYMENT', label: 'Bills Paid' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    selectedTab === tab.id
                      ? 'bg-[#00e5ff] text-[#00222b]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-[#00e5ff] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* 4. Notification Feed List */}
          {filteredList.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-bold text-slate-300">No push notifications yet</div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Incoming money transfers and completed bill payments will appear here and trigger browser push notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((notif: AppNotification) => {
                const isIncoming = notif.category === 'INCOMING_TRANSFER';
                return (
                  <div
                    key={notif.id}
                    onClick={() => openNotificationTransaction(notif)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      notif.read
                        ? 'bg-[#0a1e38]/60 border-white/10 hover:bg-[#0e2747]'
                        : 'bg-[#0e294d] border-[#00e5ff]/50 shadow-md hover:bg-[#13335e]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isIncoming
                          ? 'bg-[#00f5a0]/15 border-[#00f5a0]/40 text-[#00f5a0]'
                          : 'bg-[#00e5ff]/15 border-[#00e5ff]/40 text-[#00e5ff]'
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        {notif.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isIncoming
                              ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                              : 'bg-[#00e5ff]/15 text-[#00e5ff]'
                          }`}
                        >
                          {isIncoming ? 'Incoming Transfer' : 'Bill Payment'}
                        </span>
                        {notif.wasBackgrounded && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                            Background Push
                          </span>
                        )}
                        {notif.gatewayProvider && (
                          <span className="text-[9px] text-slate-400 font-mono truncate">
                            {notif.gatewayProvider}
                          </span>
                        )}
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#00f5a0] ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
