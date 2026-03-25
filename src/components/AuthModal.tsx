import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus, Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { validatePasswordStrength } from '../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const strengthColors: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};

const strengthBg: Record<string, string> = {
  red: 'text-red-600',
  orange: 'text-orange-600',
  yellow: 'text-yellow-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
};

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  const passwordStrength = tab === 'register' ? validatePasswordStrength(regPassword) : null;

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError('');
      setSuccess('');
      setCountdown(0);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setLoading(true);
    setError('');

    // Kısa gecikme (brute force hissiyatını azaltır)
    await new Promise((r) => setTimeout(r, 500));

    const result = login(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (result.success) {
      setSuccess('Giriş başarılı! Hoş geldiniz 🎉');
      setTimeout(() => onClose(), 1000);
    } else {
      setError(result.error || 'Giriş başarısız.');
      if (result.remainingSeconds) setCountdown(result.remainingSeconds);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    if (!passwordStrength || passwordStrength.score < 2) {
      setError('Lütfen daha güçlü bir şifre seçin.');
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 500));

    const result = register({
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim(),
      password: regPassword,
      displayName: regDisplayName.trim(),
    });

    setLoading(false);

    if (result.success) {
      setSuccess('Hesabınız oluşturuldu! Hoş geldiniz 🎉');
      setTimeout(() => onClose(), 1000);
    } else {
      setError(result.error || 'Kayıt başarısız.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 pb-12">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
              </h2>
              <p className="text-white/70 text-sm">
                {tab === 'login' ? 'ProjeAkademi\'ye hoş geldiniz' : 'Topluluğa katılın'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switch */}
        <div className="mx-6 -mt-6 bg-white rounded-2xl shadow-lg border border-slate-100 flex p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Giriş Yap
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Kayıt Ol
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
                {countdown > 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    🔒 Hesap kilitli: <span className="font-bold">{countdown}s</span> kaldı
                  </p>
                )}
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Adresi</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : countdown > 0 ? (
                  <>
                    <Lock className="w-5 h-5" />
                    {countdown}s bekleyin
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Giriş Yap
                  </>
                )}
              </button>

              {/* Demo Accounts */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Demo Hesaplar
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('ahmet@example.com'); setLoginPassword('123456'); }}
                    className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    👤 <span className="font-medium">Kullanıcı:</span> ahmet@example.com / 123456
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('admin@projeakademi.com'); setLoginPassword('Admin@2025!'); }}
                    className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-red-300 hover:bg-red-50 transition"
                  >
                    🛡️ <span className="font-medium">Admin:</span> admin@projeakademi.com / Admin@2025!
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ad Soyad</label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="Ad Soyad"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="kullanici_adi"
                    required
                    minLength={3}
                    maxLength={20}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Adresi</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="En az 8 karakter"
                    required
                    className="w-full px-4 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {regPassword && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.score
                              ? strengthColors[passwordStrength.color] || 'bg-slate-200'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${strengthBg[passwordStrength.color]}`}>
                        {passwordStrength.label}
                      </p>
                      {passwordStrength.suggestions[0] && (
                        <p className="text-xs text-slate-400">{passwordStrength.suggestions[0]}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Şifre Tekrar</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Şifreyi tekrar girin"
                    required
                    className={`w-full px-4 py-2.5 pr-10 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                      regConfirmPassword && regPassword !== regConfirmPassword
                        ? 'border-red-300 bg-red-50'
                        : regConfirmPassword && regPassword === regConfirmPassword
                        ? 'border-green-300 bg-green-50'
                        : 'border-slate-200'
                    }`}
                  />
                  {regConfirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {regPassword === regConfirmPassword ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Shield className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  Kayıt olarak{' '}
                  <span className="text-indigo-600 font-semibold">Kullanım Şartları</span>'nı ve{' '}
                  <span className="text-indigo-600 font-semibold">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Hesap Oluştur
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
