import ReCAPTCHA from 'react-google-recaptcha';
import { ShieldCheck } from 'lucide-react';
import { getRecaptchaSiteKey } from '../utils/recaptcha';

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

      <div className="overflow-x-auto rounded-xl bg-white p-2">
        <ReCAPTCHA sitekey={getRecaptchaSiteKey()} onChange={onChange} />
      </div>

      {!value && <p className="text-xs text-amber-100/70">Dogrulama tamamlanmadan isleme devam edemezsiniz.</p>}
    </div>
  );
}
