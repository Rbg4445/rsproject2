import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import {
  type AdminApplication,
  type FirestoreUser,
  getUserAdminApplication,
  submitAdminApplication,
} from '../firebase/firestoreService';

interface Props {
  user: FirestoreUser;
  onClose: () => void;
}

export default function AdminApplicationModal({ user, onClose }: Props) {
  const [existingApp, setExistingApp] = useState(null as AdminApplication | null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: user.displayName || '',
    profession: '',
    reason: '',
    linkedin: user.linkedin || '',
    github: user.github || '',
    twitter: user.twitter || '',
    experience: '',
  });
  const [errors, setErrors] = useState({} as Record<string, string>);

  useEffect(() => {
    getUserAdminApplication(user.uid).then(app => {
      setExistingApp(app);
      setLoading(false);
    });
  }, [user.uid]);

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Ad Soyad zorunludur.';
    if (!form.profession.trim()) errs.profession = 'Meslek/Unvan zorunludur.';
    if (form.reason.trim().length < 50) errs.reason = 'Başvuru sebebi en az 50 karakter olmalıdır.';
    if (!form.experience.trim()) errs.experience = 'Deneyim alanı zorunludur.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await submitAdminApplication({
        uid: user.uid,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        fullName: form.fullName.trim(),
        profession: form.profession.trim(),
        reason: form.reason.trim(),
        linkedin: form.linkedin.trim() || undefined,
        github: form.github.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        experience: form.experience.trim(),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = existingApp ? {
    pending:  { icon: <Clock className="h-5 w-5 text-yellow-400" />, label: 'Başvurunuz İnceleniyor', color: 'border-yellow-500/30 bg-yellow-500/8 text-yellow-300', desc: 'Başvurunuz admin ekibimiz tarafından değerlendiriliyor. Sonuç bildirilecek.' },
    approved: { icon: <CheckCircle className="h-5 w-5 text-green-400" />, label: 'Başvurunuz Onaylandı!', color: 'border-green-500/30 bg-green-500/8 text-green-300', desc: 'Tebrikler! Admin rolünüz aktif edildi.' },
    rejected: { icon: <XCircle className="h-5 w-5 text-red-400" />, label: 'Başvurunuz Reddedildi', color: 'border-red-500/30 bg-red-500/8 text-red-300', desc: existingApp.reviewNote || 'Bu sefer olmadı, daha sonra tekrar başvurabilirsiniz.' },
  }[existingApp.status] : null;

  return (
    <div className="fixed inset-0 z-[230] flex items-start justify-center overflow-y-auto p-4 pt-16">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-gray-900/98 shadow-2xl mb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Admin Başvurusu</h2>
              <p className="text-xs text-white/40">Moderatör/Admin ekibine katılmak için başvurun</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gray-800 text-white/50 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Başvurunuz Alındı!</h3>
              <p className="text-sm text-white/60 max-w-sm mx-auto">Admin ekibimiz başvurunuzu inceleyecek ve en kısa sürede geri dönecek.</p>
              <button onClick={onClose} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">
                Kapat
              </button>
            </div>
          ) : existingApp ? (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${statusConfig!.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  {statusConfig!.icon}
                  <p className="font-bold">{statusConfig!.label}</p>
                </div>
                <p className="text-sm opacity-80">{statusConfig!.desc}</p>
                {existingApp.reviewedAt && (
                  <p className="text-xs opacity-60 mt-2">
                    İnceleme tarihi: {new Date(existingApp.reviewedAt).toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
              {/* Mevcut başvuru detayları */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-white/40 mb-0.5">Ad Soyad</p><p className="font-semibold text-white">{existingApp.fullName}</p></div>
                  <div><p className="text-xs text-white/40 mb-0.5">Meslek</p><p className="font-semibold text-white">{existingApp.profession}</p></div>
                </div>
                <div><p className="text-xs text-white/40 mb-0.5">Başvuru Sebebi</p><p className="text-white/80 text-xs">{existingApp.reason}</p></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-4 py-3 text-xs text-indigo-300">
                ℹ️ Admin başvurusu, platformu daha iyi yönetmek için moderatör ekibine katılmak isteyenler içindir. Bilgileriniz gizli tutulacaktır.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ad Soyad *" value={form.fullName} onChange={v => set('fullName', v)} error={errors.fullName} placeholder="Tam adınız" />
                <Field label="Meslek / Unvan *" value={form.profession} onChange={v => set('profession', v)} error={errors.profession} placeholder="Öğrenci, Yazılımcı, vb." />
              </div>

              <Field
                label="Deneyim Alanı *"
                value={form.experience}
                onChange={v => set('experience', v)}
                error={errors.experience}
                placeholder="Web geliştirme, moderasyon, içerik yönetimi..."
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
                  Neden Admin Olmak İstiyorsunuz? * <span className="text-white/30 font-normal">(min. 50 karakter)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={e => set('reason', e.target.value)}
                  placeholder="Platforma nasıl katkı sağlamak istediğinizi açıklayın..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-400"
                />
                <div className="flex justify-between mt-1">
                  {errors.reason && <p className="text-xs text-red-400">{errors.reason}</p>}
                  <p className={`text-xs ml-auto ${form.reason.length >= 50 ? 'text-green-400' : 'text-white/30'}`}>{form.reason.length}/50+</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Sosyal Bağlantılar (opsiyonel)</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="LinkedIn" value={form.linkedin} onChange={v => set('linkedin', v)} placeholder="linkedin.com/in/..." />
                  <Field label="GitHub" value={form.github} onChange={v => set('github', v)} placeholder="github.com/..." />
                  <Field label="Twitter / X" value={form.twitter} onChange={v => set('twitter', v)} placeholder="@kullanici" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/15 bg-gray-800 py-3 text-sm font-semibold text-white/70 hover:bg-gray-700 transition">
                  İptal
                </button>
                <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-black/30 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400 ${error ? 'border-red-500/60' : 'border-white/10'}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
