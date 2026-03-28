import { useState, useMemo } from 'react';
import { X, UserCog } from 'lucide-react';
import type { FirestoreUser } from '../firebase/firestoreService';
import { updateUserProfile } from '../firebase/firestoreService';

interface Props {
  user: FirestoreUser;
  onClose: () => void;
  onUpdated: () => void;
}

const ONE_MONTH_MS = 1000 * 60 * 60 * 24 * 30;

export default function EditProfileModal({ user, onClose, onUpdated }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);

  const { canEdit, message } = useMemo(() => {
    if (!user.lastProfileUpdateAt) {
      return { canEdit: true, message: 'Profilini ilk kez düzenliyorsun.' };
    }
    const last = new Date(user.lastProfileUpdateAt).getTime();
    const now = Date.now();
    const diff = now - last;
    if (diff >= ONE_MONTH_MS) {
      return { canEdit: true, message: 'Profilini tekrar güncelleyebilirsin.' };
    }
    const remainingMs = ONE_MONTH_MS - diff;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return {
      canEdit: false,
      message: `Profilini tekrar düzenleyebilmen için yaklaşık ${remainingDays} gün daha beklemen gerekiyor.`,
    };
  }, [user.lastProfileUpdateAt]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || user.displayName,
        bio: bio.trim() || undefined,
        lastProfileUpdateAt: new Date().toISOString(),
      });
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
              <UserCog className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profili Düzenle</h2>
              <p className="text-xs text-white/50">Profil bilgilerini en fazla 30 günde bir güncelleyebilirsin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gray-800 text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {message}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Görünen İsim
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Biyo
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!canEdit}
              className="w-full resize-none rounded-xl border border-white/10 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 bg-gray-800/80 py-2.5 text-sm font-semibold text-white/70"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!canEdit || saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
