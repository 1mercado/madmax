import React, { useState, useEffect } from 'react';
import {
  Cable,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Play,
  QrCode,
  Smartphone,
  Terminal,
  X,
  Zap,
} from 'lucide-react';

interface UsbPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsbPublishModal: React.FC<UsbPublishModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'USB_DEVTOOLS' | 'NATIVE_APK'>('USB_DEVTOOLS');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalledStandalone, setIsInstalledStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalledStandalone(isStandalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalledStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install directly on Android via USB:\n\n1. Open Chrome on your phone.\n2. Tap the 3 dots (⋮) in the top-right corner.\n3. Tap "Install App" or "Add to Home screen".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#07152b] border border-[#00e5ff]/50 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#00e5ff]/20 bg-gradient-to-r from-[#0a1e3d] to-[#0d2a54] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
              <Cable className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-extrabold text-base">Direct USB Mobile Publish</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#00f5a0]/20 text-[#00f5a0] px-2 py-0.5 rounded-full border border-[#00f5a0]/40">
                  NO CLOUD NEEDED
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Deploy directly over physical USB cable to your Android phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-[#040e1e] flex gap-2 border-b border-[#00e5ff]/15">
          <button
            onClick={() => setActiveTab('USB_DEVTOOLS')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'USB_DEVTOOLS'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] text-black shadow-lg shadow-[#00e5ff]/25'
                : 'bg-[#081a36] text-slate-300 hover:bg-[#0c244b]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Method 1: USB Port Forward & Install (Instant)
          </button>
          <button
            onClick={() => setActiveTab('NATIVE_APK')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'NATIVE_APK'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] text-black shadow-lg shadow-[#00e5ff]/25'
                : 'bg-[#081a36] text-slate-300 hover:bg-[#0c244b]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Method 2: Android APK (ADB Install)
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'USB_DEVTOOLS' ? (
            <>
              {/* Status Alert */}
              <div className="p-3 rounded-2xl bg-[#0c2347] border border-[#00e5ff]/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Current Device Status</span>
                    {isInstalledStandalone ? (
                      <span className="text-[10px] font-bold text-[#00f5a0] bg-[#00f5a0]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Standalone App Installed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/15 px-2 py-0.5 rounded-full">
                        Ready for Mobile Installation
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">
                    This method uses Android USB Debugging to map the app straight into your phone through the wire, giving you a full native standalone icon on your phone without Google Cloud.
                  </p>
                </div>
              </div>

              {/* Install Trigger Button */}
              {deferredPrompt && (
                <button
                  onClick={handleTriggerInstall}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00f5a0] to-[#00b4d8] text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#00f5a0]/25 hover:opacity-95 transition-all text-xs"
                >
                  <Download className="w-4 h-4" />
                  Tap to Install DigiCash Directly to Home Screen
                </button>
              )}

              {/* Step by Step list */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider text-[#00e5ff]">
                  3-Step USB Cable Publishing Instructions:
                </h4>

                {/* Step 1 */}
                <div className="p-3 rounded-2xl bg-[#091b38] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-5 h-5 rounded-full bg-[#00e5ff] text-black text-[11px] font-black flex items-center justify-center">
                      1
                    </span>
                    <span>Enable USB Debugging on your Android Phone</span>
                  </div>
                  <p className="text-slate-300 text-[11px] pl-7">
                    Go to <strong>Settings</strong> &gt; <strong>About phone</strong> &gt; tap <strong>Build Number 7 times</strong> to unlock Developer Options.
                    Then go to <strong>Developer Options</strong> &gt; turn ON <strong>USB Debugging</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-2xl bg-[#091b38] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-5 h-5 rounded-full bg-[#00e5ff] text-black text-[11px] font-black flex items-center justify-center">
                      2
                    </span>
                    <span>Plug Phone via USB &amp; Run Port Forwarding</span>
                  </div>
                  <p className="text-slate-300 text-[11px] pl-7">
                    Connect your USB cable between your phone and your computer. In your computer terminal or command prompt, run:
                  </p>
                  <div className="ml-7 p-2.5 rounded-xl bg-[#030914] border border-[#00e5ff]/30 font-mono text-[11px] text-[#00e5ff] flex items-center justify-between">
                    <span>adb reverse tcp:3000 tcp:3000</span>
                    <button
                      onClick={() => handleCopy('adb reverse tcp:3000 tcp:3000', 'adb_reverse')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedKey === 'adb_reverse' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-slate-400 text-[10px] pl-7">
                    <em>Or alternatively:</em> Open Chrome on your computer, navigate to{' '}
                    <code className="text-[#00e5ff]">chrome://inspect/#devices</code>, click{' '}
                    <strong>Port forwarding...</strong> and add port <code>3000</code> to <code>localhost:3000</code>.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-2xl bg-[#091b38] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-5 h-5 rounded-full bg-[#00e5ff] text-black text-[11px] font-black flex items-center justify-center">
                      3
                    </span>
                    <span>Open on Phone &amp; Install Standalone</span>
                  </div>
                  <p className="text-slate-300 text-[11px] pl-7">
                    Open Chrome on your connected phone and navigate to:
                  </p>
                  <div className="ml-7 p-2.5 rounded-xl bg-[#030914] border border-[#00f5a0]/30 font-mono text-[11px] text-[#00f5a0] flex items-center justify-between">
                    <span>http://localhost:3000</span>
                    <button
                      onClick={() => handleCopy('http://localhost:3000', 'local_url')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      {copiedKey === 'local_url' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-slate-300 text-[11px] pl-7">
                    Tap the <strong>"Install App"</strong> prompt or Chrome's <strong>⋮ (Menu) &gt; "Add to Home screen"</strong>.
                    DigiCash will now be installed as an independent, full-screen native mobile application on your Android phone!
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Native APK Tab */}
              <div className="p-3 rounded-2xl bg-[#0c2347] border border-[#00e5ff]/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Terminal className="w-4 h-4 text-[#00e5ff]" />
                  <span>Direct USB Sideload (`adb install`)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Capacitor configuration (<code className="text-[#00e5ff]">capacitor.config.ts</code>) is pre-configured with package ID{' '}
                  <code className="text-[#00f5a0]">com.digicash.worldwide</code>. Run these commands locally with your phone connected via USB:
                </p>
              </div>

              <div className="space-y-3">
                {/* Command 1 */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">
                    1. Check USB Device Connection:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#030914] border border-[#00e5ff]/30 font-mono text-[11px] text-[#00e5ff] flex items-center justify-between">
                    <span>adb devices</span>
                    <button
                      onClick={() => handleCopy('adb devices', 'adb_devices')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'adb_devices' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Command 2 */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">
                    2. Add Android Platform &amp; Build:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#030914] border border-[#00e5ff]/30 font-mono text-[11px] text-[#00e5ff] flex items-center justify-between">
                    <span>npm run build && npx cap add android && npx cap sync</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          'npm run build && npx cap add android && npx cap sync',
                          'cap_sync'
                        )
                      }
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'cap_sync' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Command 3 */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">
                    3. Direct USB 1-Command Run onto Android:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#030914] border border-[#00f5a0]/30 font-mono text-[11px] text-[#00f5a0] flex items-center justify-between">
                    <span>npx cap run android -l</span>
                    <button
                      onClick={() => handleCopy('npx cap run android -l', 'cap_run')}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'cap_run' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This compiles the Android APK and installs it directly onto your USB-connected Android phone.
                  </p>
                </div>

                {/* Command 4 */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">
                    4. Or Sideload Debug APK Manually:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#030914] border border-white/20 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <span>adb install -r android/app/build/outputs/apk/debug/app-debug.apk</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          'adb install -r android/app/build/outputs/apk/debug/app-debug.apk',
                          'adb_install'
                        )
                      }
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'adb_install' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#051122] border-t border-[#00e5ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-ping" />
            <span>USB Target: Physical Android Device</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] text-black font-extrabold text-xs shadow-md shadow-[#00e5ff]/20 hover:opacity-95 transition-opacity"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
