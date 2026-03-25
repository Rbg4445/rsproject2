import { useMemo, useState } from 'react';
import { ArrowLeft, Save, RotateCcw, Link2, Type, Palette } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { useSiteSettings, type SiteSettings } from '../store/SiteSettingsContext';
import { useTheme, type ThemeMode } from '../store/ThemeContext';

interface AdminPanelProps {
  onBack: () => void;
}

type AdminTab = 'texts' | 'links' | 'appearance';

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'texts', label: 'Yazilar', icon: <Type className="h-4 w-4" /> },
  { id: 'links', label: 'Linkler', icon: <Link2 className="h-4 w-4" /> },
  { id: 'appearance', label: 'Gorunum', icon: <Palette className="h-4 w-4" /> },
];

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
        />
      )}
    </label>
  );
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { isAdmin, userProfile } = useFirebaseAuth();
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('texts');
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [flash, setFlash] = useState('');

  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 px-6 py-24 text-center text-white">
        <h2 className="text-2xl font-bold">Admin Yetkisi Gerekli</h2>
        <p className="mt-2 text-white/60">Bu sayfayi sadece admin hesaplari kullanabilir.</p>
        <button onClick={onBack} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
          Geri Don
        </button>
      </div>
    );
  }

  const saveChanges = () => {
    updateSettings(draft);
    setFlash('Ayarlar kaydedildi.');
    setTimeout(() => setFlash(''), 2200);
  };

  const resetAll = () => {
    resetSettings();
    setDraft(settings);
    setFlash('Varsayilan ayarlar yuklendi.');
    setTimeout(() => setFlash(''), 2200);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Admin Panel</h1>
            <p className="text-sm text-white/50">Hosgeldin, {userProfile?.displayName}</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Siteye Don
          </button>
        </div>

        {flash && <div className="mb-4 rounded-xl bg-green-500/15 px-4 py-3 text-sm text-green-300">{flash}</div>}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
          {activeTab === 'texts' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Marka Adi" value={draft.brandName} onChange={(v) => setDraft((p) => ({ ...p, brandName: v }))} />
              <Field label="Marka Alt Basligi" value={draft.brandSubline} onChange={(v) => setDraft((p) => ({ ...p, brandSubline: v }))} />
              <Field label="Hero Rozet" value={draft.heroBadge} onChange={(v) => setDraft((p) => ({ ...p, heroBadge: v }))} />
              <Field label="Hero Baslik" value={draft.heroTitle} onChange={(v) => setDraft((p) => ({ ...p, heroTitle: v }))} />
              <div className="sm:col-span-2">
                <Field label="Hero Aciklama" value={draft.heroSubtitle} onChange={(v) => setDraft((p) => ({ ...p, heroSubtitle: v }))} textarea />
              </div>
              <div className="sm:col-span-2">
                <Field label="Beta Satiri" value={draft.betaLine} onChange={(v) => setDraft((p) => ({ ...p, betaLine: v }))} />
              </div>
              <Field label="Hakkimda Baslik" value={draft.aboutTitle} onChange={(v) => setDraft((p) => ({ ...p, aboutTitle: v }))} />
              <div className="sm:col-span-2">
                <Field label="Hakkimda Aciklama" value={draft.aboutDescription} onChange={(v) => setDraft((p) => ({ ...p, aboutDescription: v }))} textarea />
              </div>
              <Field label="Footer Notu" value={draft.footerNote} onChange={(v) => setDraft((p) => ({ ...p, footerNote: v }))} />
            </div>
          )}

          {activeTab === 'links' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Iletisim Email" value={draft.contactEmail} onChange={(v) => setDraft((p) => ({ ...p, contactEmail: v }))} />
              <Field label="Telefon" value={draft.contactPhone} onChange={(v) => setDraft((p) => ({ ...p, contactPhone: v }))} />
              <Field label="Konum" value={draft.contactLocation} onChange={(v) => setDraft((p) => ({ ...p, contactLocation: v }))} />
              <Field label="GitHub Linki" value={draft.githubUrl} onChange={(v) => setDraft((p) => ({ ...p, githubUrl: v }))} />
              <Field label="Twitter Linki" value={draft.twitterUrl} onChange={(v) => setDraft((p) => ({ ...p, twitterUrl: v }))} />
              <Field label="LinkedIn Linki" value={draft.linkedinUrl} onChange={(v) => setDraft((p) => ({ ...p, linkedinUrl: v }))} />
              <Field label="YouTube Linki" value={draft.youtubeUrl} onChange={(v) => setDraft((p) => ({ ...p, youtubeUrl: v }))} />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">Site temasini buradan degistirebilirsin.</p>
              <div className="flex gap-3">
                {(['dark', 'light'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      theme === mode ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {mode === 'dark' ? 'Karanlik Mod' : 'Aydinlik Mod'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/50">
                Not: Tema secimi kullanicinin tarayicisinda saklanir. Admin panelde secilen tema aninda gorunur.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={saveChanges}
            disabled={!changed}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
          <button
            onClick={() => setDraft(settings)}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80"
          >
            Taslagi Sifirla
          </button>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300"
          >
            <RotateCcw className="h-4 w-4" />
            Varsayilana Don
          </button>
        </div>
      </div>
    </div>
  );
}
