import { useState } from 'react';
import { Shield, Lock, Mail, X } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ onClose, onSuccess }: AdminLoginModalProps) {
  const { login, userProfile, refreshProfile, logout } = useFirebaseAuth();
  const [email, setEmail] = useState('admin@projeakademi.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Admin girisi basarisiz.');
      return;
    }

    setTimeout(async () => {
      await refreshProfile();
      if (userProfile?.role === 'admin' || email.toLowerCase() === 'admin@projeakademi.com') {
        onSuccess();
        onClose();
      } else {
        await logout();
        setError('Bu hesap admin yetkisine sahip degil.');
      }
      setLoading(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Admin Girisi</h2>
            <p className="text-xs text-white/50">Yonetim paneline erisim icin giris yapin.</p>
          </div>
        </div>

        {error && <p className="mb-3 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}

        <label className="mb-2 block text-xs font-medium text-white/60">Admin E-posta</label>
        <div className="relative mb-4">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-red-400"
          />
        </div>

        <label className="mb-2 block text-xs font-medium text-white/60">Sifre</label>
        <div className="relative mb-5">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-red-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Kontrol ediliyor...' : 'Admin Paneline Gir'}
        </button>
      </form>
    </div>
  );
}
