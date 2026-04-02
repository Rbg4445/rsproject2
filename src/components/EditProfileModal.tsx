import { useState, useMemo } from 'react';
import { X, User, AlertCircle, CheckCircle } from 'lucide-react';
import type { FirestoreUser } from '../firebase/firestoreService';
import { updateUserProfile, isUsernameTaken } from '../firebase/firestoreService';

interface Props {
  user: FirestoreUser;
  onClose: () => void;
  onUpdated: () => void;
}

const ONE_MONTH_MS = 1000 * 60 * 60 * 24 * 30;

export default function EditProfileModal({ user, onClose, onUpdated }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle' as 'idle' | 'checking' | 'taken' | 'available');
  let usernameTimeout: ReturnType<typeof setTimeout>;

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

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setUsernameStatus('idle');

    if (clean === user.username) {
      setUsernameStatus('idle');
      return;
    }
    if (clean.length < 3) return;

    clearTimeout(usernameTimeout);
    usernameTimeout = setTimeout(async () => {
      setUsernameStatus('checking');
      const taken = await isUsernameTaken(clean, user.uid);
      setUsernameStatus(taken ? 'taken' : 'available');
    }, 500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canEdit) return;

    const usernameClean = username.toLowerCase().trim();

    // Username format check
    if (!/^[a-z0-9_]{3,20}$/.test(usernameClean)) {
      setError('Kullanıcı adı 3-20 karakter olmalı, sadece harf, rakam ve _ içerebilir.');
      return;
    }

    // Username uniqueness check (final)
    if (usernameClean !== user.username) {
      const taken = await isUsernameTaken(usernameClean, user.uid);
      if (taken) {
        setError('Bu kullanıcı adı zaten alınmış. Lütfen farklı bir ad seçin.');
        return;
      }
    }

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        username: usernameClean,
        displayName: displayName.trim() || user.displayName,
        bio: bio.trim() || undefined,
        lastProfileUpdateAt: new Date().toISOString(),
      });
      onUpdated();
      onClose();
    } catch {
      setError('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = canEdit && usernameStatus !== 'taken' && usernameStatus !== 'checking';

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profili Düzenle</h2>
              <p className="text-xs text-white/50">30 günde bir güncelleyebilirsin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gray-800 text-white/50 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Durum Mesajı */}
          <div className={`rounded-2xl border p-3 text-xs ${
            canEdit
              ? 'border-indigo-500/20 bg-indigo-500/8 text-indigo-300'
              : 'border-yellow-500/20 bg-yellow-500/8 text-yellow-300'
          }`}>
            {message}
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Kullanıcı Adı */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Kullanıcı Adı (Nickname)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
              <input
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={!canEdit}
                maxLength={20}
                placeholder="kullanici_adi"
                className={`w-full rounded-xl border px-10 py-2.5 text-sm text-white placeholder-white/30 bg-gray-800/70 focus:outline-none transition ${
                  usernameStatus === 'taken'     ? 'border-red-500/60 focus:border-red-500'
                  : usernameStatus === 'available' ? 'border-green-500/60 focus:border-green-500'
                  : 'border-white/10 focus:border-indigo-400'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                )}
                {usernameStatus === 'taken' && <AlertCircle className="h-4 w-4 text-red-400" />}
                {usernameStatus === 'available' && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-white/30">
              <span>
                {usernameStatus === 'taken' && <span className="text-red-400">Bu kullanıcı adı alınmış!</span>}
                {usernameStatus === 'available' && <span className="text-green-400">Kullanıcı adı uygun ✓</span>}
                {usernameStatus === 'idle' && 'Sadece harf, rakam ve _ kullanabilirsin.'}
              </span>
              <span>{username.length}/20</span>
            </div>
          </div>

          {/* Görünen İsim */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Görünen İsim
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!canEdit}
              className="w-full rounded-xl border border-white/10 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Biyo */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Biyo
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!canEdit}
              placeholder="Kendini kısaca tanıt..."
              className="w-full resize-none rounded-xl border border-white/10 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 bg-gray-800/80 py-2.5 text-sm font-semibold text-white/70 hover:bg-gray-700 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!canSave || saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90 transition"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
