import { useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ShieldCheck } from 'lucide-react';

interface ConditionalRecaptchaProps {
  show: boolean;
  value: string | null;
  onChange: (token: string | null) => void;
  description?: string;
}

export default function ConditionalRecaptcha({
  show,
  value,
  onChange,
  description = 'Sik tekrar deneme algilandi. Devam etmek icin dogrulamayi tamamlayin.',
}: ConditionalRecaptchaProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const runVerification = async () => {
    if (!executeRecaptcha) {
      setLocalError('reCAPTCHA henuz hazir degil. Biraz bekleyip tekrar deneyin.');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const token = await executeRecaptcha('suspicious_repeat_check');
      if (!token) {
        setLocalError('Dogrulama tokeni alinamadi. Lutfen tekrar deneyin.');
        return;
      }
      onChange(token);
    } catch {
      setLocalError('reCAPTCHA calistirilamadi. Domain ayarlarinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && !value) {
      void runVerification();
    }
    // executeRecaptcha hazır hale gelince bir kez daha denemesi için dependency'de tutuldu.
  }, [show, value, executeRecaptcha]);

  if (!show) return null;

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-200">Ek Dogrulama Gerekli</p>
          <p className="text-xs text-amber-100/80">{description}</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-300/30 bg-amber-500/5 p-3">
        <button
          type="button"
          onClick={() => void runVerification()}
          disabled={loading}
          className="w-full rounded-lg bg-amber-400/20 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-400/30 disabled:opacity-60"
        >
          {loading ? 'Dogrulama calistiriliyor...' : 'reCAPTCHA dogrulamasini calistir'}
        </button>
        {localError && <p className="mt-2 text-xs text-red-200">{localError}</p>}
        {value && <p className="mt-2 text-xs text-emerald-200">Dogrulama basarili. Devam edebilirsiniz.</p>}
      </div>

      {!value && <p className="text-xs text-amber-100/70">Dogrulama tamamlanmadan isleme devam edemezsiniz.</p>}
    </div>
  );
}
