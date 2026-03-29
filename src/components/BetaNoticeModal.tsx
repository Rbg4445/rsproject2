import { X, FlaskConical, ShieldCheck, Clock3 } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

interface BetaNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BetaNoticeModal({ isOpen, onClose }: BetaNoticeModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const dark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl sm:p-8 ${
          dark
            ? 'border-white/10 bg-gray-900 text-white'
            : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-lg p-2 transition ${
            dark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600/20 p-2 text-indigo-400">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black sm:text-2xl">Beta Surum Bilgilendirmesi</h2>
            <p className={dark ? 'text-sm text-white/60' : 'text-sm text-gray-600'}>Platform su anda aktif gelistirme asamasindadir.</p>
          </div>
        </div>

        <div className={`space-y-3 text-sm leading-6 ${dark ? 'text-white/75' : 'text-gray-700'}`}>
          <p>
            Bu site su anda beta asamasinda calisiyor. Ozelliklerin buyuk bolumu aktif olsa da, arayuz akislarinda,
            veri isleme adimlarinda ve performans tarafinda surekli iyilestirme yapiliyor. Bu nedenle bazi ekranlar
            zaman zaman degisebilir, yeni alanlar eklenebilir veya mevcut alanlarin davranisi guncellenebilir.
          </p>
          <p>
            Beta döneminde oluşan içeriklerin korunması hedeflenir ancak teknik iyileştirmeler nedeniyle geçiş sürecinde
            geçici tutarsızlıklar yaşanabilir. Önemli verileriniz için periyodik yedek almanız önerilir. Geri bildirimler,
            platformun kararlı sürüme ulaşması için doğrudan geliştirme sürecine dahil edilir.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Güvenlik Notu
            </div>
            <p className={`text-xs ${dark ? 'text-white/65' : 'text-gray-600'}`}>
              Erisim kontrolleri ve yonetim araci aktif durumdadir. Supheli etkinlikler loglanir ve gerekli durumlarda
              yetkiler kisitlanabilir.
            </p>
          </div>

          <div className={`rounded-xl border p-3 ${dark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="h-4 w-4 text-amber-500" />
              Surec Notu
            </div>
            <p className={`text-xs ${dark ? 'text-white/65' : 'text-gray-600'}`}>
              Beta doneminde duzenli guncellemeler yapilacaktir. Kucuk arayuz degisiklikleri ve yeni moduller asamali
              sekilde yayinlanir.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Okudum, devam et
          </button>
        </div>
      </div>
    </div>
  );
}
