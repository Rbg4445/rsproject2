import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { getRbgPageData, updateRbgPageData, type RbgLinkItem, type RbgPageData } from '../firebase/firestoreService';

const defaultIcons = [
  'https://cdn-icons-png.flaticon.com/128/2504/2504947.png',
  'https://cdn-icons-png.flaticon.com/128/5968/5968756.png',
  'https://cdn-icons-png.flaticon.com/128/3536/3536505.png',
  'https://cdn-icons-png.flaticon.com/128/1384/1384060.png',
];

const minecraftBg =
  'https://images.unsplash.com/photo-1618331833071-ce81bd50d300?auto=format&fit=crop&w=1800&q=80';

export default function RbgPage() {
  const { userProfile, isAdmin } = useFirebaseAuth();
  const [pageData, setPageData] = useState<RbgPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // RBG sahibini ve duzenleme yetkisini belirle
  const isOwner = useMemo(() => {
    if (!userProfile) return false;
    const username = userProfile.username?.toLowerCase();
    const display = userProfile.displayName?.toLowerCase();
    const email = userProfile.email?.toLowerCase() || '';
    return username === 'rbg' || display === 'rbg' || email.includes('rbg');
  }, [userProfile]);

  const canEdit = isAdmin || isOwner;
 
   useEffect(() => {
     void loadData();
   }, []);

  async function loadData() {
    setLoading(true);
    const data = await getRbgPageData();
    if (!data.backgroundImage) data.backgroundImage = minecraftBg;
    setPageData(data);
    setLoading(false);
  }

  async function saveData(next: RbgPageData) {
    if (!isOwner) return;
    setSaving(true);
    const payload = {
      ...next,
      ownerUid: userProfile?.uid,
      ownerUsername: userProfile?.username,
    };
    const saved = await updateRbgPageData(payload);
    setPageData(saved);
    setSaving(false);
  }

  function updateField<K extends keyof RbgPageData>(key: K, value: RbgPageData[K]) {
    if (!pageData || !isOwner) return;
    setPageData({ ...pageData, [key]: value });
  }

  function addLink() {
    if (!pageData || !isOwner) return;
    const next: RbgLinkItem = {
      id: `rbg_link_${Date.now()}`,
      title: 'Yeni Link',
      url: 'https://',
      description: 'Kisa aciklama',
      iconUrl: defaultIcons[pageData.links.length % defaultIcons.length],
    };
    setPageData({ ...pageData, links: [...pageData.links, next] });
  }

  function updateLink(id: string, updates: Partial<RbgLinkItem>) {
    if (!pageData || !isOwner) return;
    setPageData({
      ...pageData,
      links: pageData.links.map((link) => (link.id === id ? { ...link, ...updates } : link)),
    });
  }

  function removeLink(id: string) {
    if (!pageData || !isOwner) return;
    setPageData({
      ...pageData,
      links: pageData.links.filter((link) => link.id !== id),
    });
  }

  if (loading || !pageData) {
    return <div className="min-h-screen px-4 pt-28 text-center text-white/60">RBG sayfasi yukleniyor...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${pageData.backgroundImage || minecraftBg})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-black/50 to-black/80" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className={
            canEdit
              ? 'grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'
              : 'flex flex-col items-center justify-center'
          }
        >
          <section
            className={
              canEdit
                ? 'rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md sm:p-8'
                : 'w-full max-w-xl rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md sm:p-8'
            }
          >
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <img
                src={pageData.avatarUrl}
                alt="RBG"
                className="h-24 w-24 rounded-3xl border border-white/20 object-cover shadow-2xl"
              />
              <div>
                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  RBG Ozel Sayfasi
                </span>
                <h1 className="mt-3 text-4xl font-black sm:text-5xl">{pageData.title}</h1>
                <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{pageData.subtitle}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {pageData.links.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/65">
                  Henuz link eklenmedi.
                </div>
              ) : (
                pageData.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/15"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={link.iconUrl || defaultIcons[0]}
                        alt={link.title}
                        className="h-12 w-12 rounded-2xl border border-white/10 bg-white/10 p-2 object-contain"
                      />
                      <div>
                        <div className="font-semibold text-white">{link.title}</div>
                        <div className="text-sm text-white/65">{link.description || link.url}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-white/60 transition group-hover:text-emerald-300" />
                  </a>
                ))
              )}
            </div>
          </section>
 
          {canEdit && (
            <aside className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md sm:p-8">
              <h2 className="text-2xl font-black text-white">RBG Link Paneli</h2>
              <p className="mt-2 text-sm text-white/65">
                Bu alan sadece RBG veya admin hesabindan duzenlenebilir.
              </p>
          
            {isOwner ? (
              <div className="mt-6 space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Baslik</label>
                  <input
                    value={pageData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Aciklama</label>
                  <textarea
                    rows={4}
                    value={pageData.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Avatar Gorsel URL</label>
                  <input
                    value={pageData.avatarUrl}
                    onChange={(e) => updateField('avatarUrl', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Minecraft Arka Plan URL</label>
                  <input
                    value={pageData.backgroundImage}
                    onChange={(e) => updateField('backgroundImage', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <h3 className="text-lg font-bold">Linkler</h3>
                  <button
                    onClick={addLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
                  >
                    <Plus className="h-4 w-4" />
                    Link Ekle
                  </button>
                </div>

                <div className="space-y-4">
                  {pageData.links.map((link, index) => (
                    <div key={link.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="grid gap-3">
                        <input
                          value={link.title}
                          onChange={(e) => updateLink(link.id, { title: e.target.value })}
                          placeholder={`Link ${index + 1} basligi`}
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none"
                        />
                        <input
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none"
                        />
                        <input
                          value={link.description || ''}
                          onChange={(e) => updateLink(link.id, { description: e.target.value })}
                          placeholder="Kisa aciklama"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none"
                        />
                        <input
                          value={link.iconUrl || ''}
                          onChange={(e) => updateLink(link.id, { iconUrl: e.target.value })}
                          placeholder="Ikon gorsel URL"
                          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none"
                        />
                        <button
                          onClick={() => removeLink(link.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => void saveData(pageData)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 px-5 py-3 font-bold text-black"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                Bu ozel sayfa yalnizca RBG hesabi tarafindan duzenlenebilir.
              </div>
            )}
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
