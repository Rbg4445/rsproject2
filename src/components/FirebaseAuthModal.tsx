import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AtSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { validatePasswordStrength } from '../utils/security';

interface Props {
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function FirebaseAuthModal({ onClose, defaultTab = 'login' }: Props) {
  const { login, loginWithGoogle, register } = useFirebaseAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (regPassword) {
      const s = validatePasswordStrength(regPassword);
      const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
      setPasswordStrength({ score: s.score, label: labels[s.score], color: colors[s.score] });
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [regPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setError('');
    setLoading(true);

    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Giriş başarısız.');
      if (result.remainingSeconds) setCountdown(result.remainingSeconds);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Google ile giriş başarısız.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (passwordStrength.score < 2) {
      setError('Daha güçlü bir şifre seçin.');
      return;
    }
    if (regUsername.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(regUsername)) {
      setError('Kullanıcı adı sadece harf, rakam, _ ve - içerebilir.');
      return;
    }

    setLoading(true);
    const result = await register({
      username: regUsername.toLowerCase(),
      email: regEmail,
      password: regPassword,
      displayName: regDisplayName,
    });
    setLoading(false);

    if (result.success) {
      setSuccess('Kayit basarili. Email adresinize dogrulama maili gonderildi. Lutfen emailinizi dogrulayin.');
    } else {
      setError(result.error || 'Kayıt başarısız.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/1197/1197460.png"
              alt="auth"
              className="mx-auto mb-1 h-8 w-8"
            />
            <h2 className="text-xl font-bold text-white">ProjeAkademi</h2>
            <p className="text-white/70 text-sm mt-1">
              {tab === 'login' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
            </p>
          </div>
          {/* Tabs */}
          <div className="flex mt-4 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'login' ? 'bg-white text-indigo-700' : 'text-white/70 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'register' ? 'bg-white text-indigo-700' : 'text-white/70 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Mesajlar */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3 text-sm">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Google Giriş Butonu */}
          {!success && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {googleLoading ? 'Bağlanıyor...' : 'Google ile devam et'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-xs">veya email ile</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          {/* Login Formu */}
          {tab === 'login' && !success && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="Email adresiniz"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifreniz"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Giriş yapılıyor...</>
                ) : countdown > 0 ? (
                  `⏳ ${countdown} saniye bekleyin`
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </form>
          )}

          {/* Register Formu */}
          {tab === 'register' && !success && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
              </div>

              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı (örn: kullanici_adi)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="Email adresiniz"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Şifre güç göstergesi */}
              {regPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.score - 1 ? passwordStrength.color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50">
                    Güç: <span className="text-white/80">{passwordStrength.label}</span>
                  </p>
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Şifre tekrar"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all text-sm ${
                    regConfirmPassword
                      ? regPassword === regConfirmPassword
                        ? 'border-green-500'
                        : 'border-red-500'
                      : 'border-white/10 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Email doğrulama notu */}
              <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-300 text-xs">
                  Kayıt sonrası email adresinize <strong>doğrulama maili</strong> gönderilecektir.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Kayıt yapılıyor...</>
                ) : (
                  'Hesap Oluştur'
                )}
              </button>
            </form>
          )}

          {/* Başarılı kayıt sonrası */}
          {success && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">📧</div>
              <p className="text-white/60 text-sm">Email kutunuzu kontrol edin ve giriş yapın.</p>
              <button
                onClick={() => { setTab('login'); setSuccess(''); setError(''); }}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>

        {/* Firebase güvenlik notu */}
        <div className="px-6 pb-4 flex items-center justify-center gap-2 text-white/30 text-xs">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          Firebase Authentication ile güvence altında
        </div>
      </div>
    </div>
  );
}
