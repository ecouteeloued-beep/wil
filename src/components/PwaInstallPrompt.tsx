import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const PwaInstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const canShow = !isInstalled && !dismissed && (Boolean(installEvent) || isIos);
  if (!canShow) return null;

  const install = async () => {
    if (!installEvent) {
      setShowIosInstructions(true);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setIsInstalled(true);
    setInstallEvent(null);
  };

  return (
    <>
      <aside className="fixed bottom-4 left-4 right-4 z-[9998] mx-auto max-w-md rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl" dir="rtl" aria-label="تثبيت البوابة">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute left-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006233] text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-changa text-base font-bold text-gray-900">ثبّت البوابة على هاتفك</h2>
            <p className="mt-1 font-tajawal text-sm leading-relaxed text-gray-600">افتحها بسرعة لتقديم وتتبع انشغالك من شاشة الهاتف.</p>
            <button type="button" onClick={install} className="mt-3 rounded-lg bg-[#006233] px-4 py-2 font-tajawal text-sm font-bold text-white transition hover:bg-[#004d28]">
              {isIos ? 'طريقة التثبيت' : 'تثبيت التطبيق'}
            </button>
          </div>
        </div>
      </aside>

      {showIosInstructions && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between">
              <h2 id="ios-install-title" className="font-changa text-lg font-bold text-gray-900">تثبيت البوابة على iPhone</h2>
              <button type="button" onClick={() => setShowIosInstructions(false)} className="rounded-full p-1 text-gray-500 hover:bg-gray-100" aria-label="إغلاق"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-3 font-tajawal text-sm leading-7 text-gray-700">اضغط على زر المشاركة <Share className="mx-1 inline h-4 w-4 text-[#006233]" /> ثم اختر <strong>إضافة إلى الشاشة الرئيسية</strong>.</p>
          </div>
        </div>
      )}
    </>
  );
};
