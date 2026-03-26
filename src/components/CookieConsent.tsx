import { useEffect, useState } from 'react';
import { Cookie, Info } from 'lucide-react';

interface ConsentState {
  choice: 'accepted' | 'rejected';
  timestamp: number;
}

const STORAGE_KEY = 'pa_cookie_consent_v1';

function loadConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentState['choice']) {
  try {
    const state: ConsentState = { choice, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice: ConsentState['choice']) => {
    saveConsent(choice);
    setVisible(false);
  };

  return (
    <>
      {/* Floating manage button */}
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full border border-white/15 bg-gray-900/80 px-3 py-1.5 text-xs font-medium text-white/70 shadow-lg shadow-black/30 backdrop-blur hover:bg-gray-800/90"
      >
        <Cookie className="h-3.5 w-3.5" />
        Çerez tercihleri
      </button>

      {/* Main banner */}
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-2 pb-3 sm:pb-4">
          <div className="max-w-4xl rounded-2xl border border-white/15 bg-gray-950/95 px-4 py-3 text-xs text-white/80 shadow-2xl shadow-black/50 backdrop-blur sm:px-6 sm:py-4 sm:text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <Info className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="font-semibold text-white text-sm sm:text-base">Bu site çerez kullanır</p>
                <p>
                  Deneyimini geliştirmek, tema tercihini hatırlamak, güvenlik kontrolleri (reCAPTCHA) ve istatistikler için
                  tarayıcında sınırlı çerezler ve benzeri teknolojiler kullanıyoruz. Devam ederek bu kullanım şartlarını
                  kabul etmiş olursun.
                </p>
                <p className="text-[11px] text-white/45">
                  Reddetsen bile, sitenin çalışması için zorunlu olan teknik çerezler (oturum, güvenlik gibi) kullanılmaya
                  devam eder.
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2 sm:mt-4">
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
              >
                Daha sonra
              </button>
              <button
                type="button"
                onClick={() => handleChoice('rejected')}
                className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
              >
                Reddet
              </button>
              <button
                type="button"
                onClick={() => handleChoice('accepted')}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow shadow-indigo-500/40 hover:shadow-lg"
              >
                Kabul et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
