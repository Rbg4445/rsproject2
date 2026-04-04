import { useEffect, useState } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SiteSettingsProvider, useSiteSettings } from './store/SiteSettingsContext';
import { Home, AlertTriangle, Shield } from 'lucide-react';
import Layout from './components/Layout';
import FirebaseHomeFeed from './components/FirebaseHomeFeed';
import FirebaseAuthModal from './components/FirebaseAuthModal';
import FirebaseUserProfile from './components/FirebaseUserProfile';
import FirebaseMessagesPage from './components/FirebaseMessagesPage';
import AdminPanel from './components/AdminPanel';
import MouseTrailBackground from './components/MouseTrailBackground';
import AdminLoginModal from './components/AdminLoginModal';
import BetaNoticeModal from './components/BetaNoticeModal';
import RbgPage from './components/RbgPage';
import CookieConsent from './components/CookieConsent';
import LeaderboardPage from './components/LeaderboardPage';

function parseRouteFromHash() {
  const raw = window.location.hash.replace(/^#/, '').trim();
  if (!raw) return 'home';
  return decodeURIComponent(raw);
}

function PageRouter({ currentPage }: { currentPage: string }) {
  if (currentPage === 'explore') return <FirebaseHomeFeed feedFilter="project" />;
  if (currentPage === 'blogs') return <FirebaseHomeFeed feedFilter="blog" />;
  if (currentPage === 'wiki') return <FirebaseHomeFeed feedFilter="article" />;
  if (currentPage === 'rbg') return <RbgPage />;
  if (currentPage === 'leaderboard') return <LeaderboardPage />;
  
  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return <FirebaseUserProfile username={username} />;
  }
  
  if (currentPage.startsWith('messages')) {
    return <FirebaseMessagesPage />;
  }
  
  return <FirebaseHomeFeed />;
}

function AppContent() {
  const { loading: authLoading, isAdmin } = useFirebaseAuth();
  const { settings, isLoaded: settingsLoaded } = useSiteSettings();
  const [currentPage, setCurrentPage] = useState(parseRouteFromHash());
  const loading = authLoading || !settingsLoaded;
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(true);
  const [authTab, setAuthTab] = useState('login' as 'login' | 'register');
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { setShowSplash(false); }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  // Online Heartbeat
  const { userProfile } = useFirebaseAuth();
  useEffect(() => {
    if (!userProfile) return;
    const interval = setInterval(async () => {
      try {
        const { updateLastLogin: update } = await import('./firebase/firestoreService');
        await update(userProfile.uid);
      } catch (e) { console.error("Heartbeat error:", e); }
    }, 1000 * 60 * 5); // 5 dakikada bir update
    return () => clearInterval(interval);
  }, [userProfile?.uid]);

  useEffect(() => {
    const handleHashChange = () => {
      setIsTransitioning(true);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setTimeout(() => {
        setCurrentPage(parseRouteFromHash());
        setTimeout(() => setIsTransitioning(false), 400); // 400ms loading effect
      }, 50); // slight delay to allow loader to paint
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#home');
      setCurrentPage('home');
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string) => {
    const nextHash = `#${encodeURIComponent(page)}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#0B1416] flex items-center justify-center z-[999] overflow-hidden">
        {/* Dekoratif Arka Plan (RBG Logo renklerine uygun ışıklar) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#60a5fa]/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#38bdf8]/5 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2"></div>
        
        <div className="text-center relative z-10 animate-fade-in flex flex-col items-center">
          {/* Logo */}
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-black border border-[#27383F] flex items-center justify-center mb-8 mx-auto shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden">
             <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" alt="RBG Projects" className="w-full h-full object-cover scale-110" />
          </div>
          
          <h2 className="text-white text-xl md:text-2xl font-bold tracking-tight mb-2">RBG ProjeAkademi</h2>
          <p className="text-[#818384] text-sm tracking-wide animate-pulse">Kuruluyor...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0B1416] flex items-center justify-center z-[998]">
        <div className="text-center">
          <div className="w-14 h-14 bg-black rounded-xl overflow-hidden border border-[#27383F] flex items-center justify-center mb-4 mx-auto animate-pulse">
            <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" alt="Loading..." className="w-full h-full object-cover" />
          </div>
          <p className="text-[#818384] text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Maintenance Mode Check
  const isUnlocked = localStorage.getItem('pa_maintenance_unlocked') === 'true';
  if (settings.maintenanceMode && !isAdmin && !isUnlocked && currentPage !== 'admin') {
    return (
      <div className="fixed inset-0 bg-[#0B1416] flex items-center justify-center z-[9999] p-6 text-center">
        <MouseTrailBackground />
        <div className="relative z-10 max-w-md w-full animate-fade-in">
          <div className="w-24 h-24 bg-zinc-900 border border-zinc-700/50 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <AlertTriangle className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tighter">Bakım Modu Aktif</h1>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            Sitemiz şu an yeni özellikler yüklenmesi ve iyileştirmeler için bakımdadır. Kısa süre sonra tekrar görüşmek üzere.
          </p>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-4 justify-center">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800">
                <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" alt="RBG" className="w-6 h-6 object-cover" />
             </div>
             <p className="text-sm font-bold text-white uppercase tracking-widest">RBG ProjeAkademi</p>
          </div>
          <div className="mt-8 space-y-4 max-w-[280px] mx-auto">
            <div className="relative group">
              <input 
                type="password"
                id="maintenance-pwd"
                placeholder="Erişim Şifresi..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-center text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-zinc-700 group-hover:border-zinc-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    if (val === '1453') {
                      localStorage.setItem('pa_maintenance_unlocked', 'true');
                      window.location.reload();
                    } else {
                      e.currentTarget.classList.add('animate-shake');
                      setTimeout(() => e.currentTarget.classList.remove('animate-shake'), 500);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <p className="mt-2 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Girmek için şifreyi yazıp Enter'a basın</p>
            </div>
          </div>

          <button 
             onClick={() => setShowAdminAuth(true)}
             className="mt-12 text-zinc-600 hover:text-white transition flex items-center gap-2 mx-auto text-xs uppercase tracking-widest font-bold"
          >
            <Shield className="w-3 h-3" /> Yönetici Girişi
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div key="admin" className="min-h-screen bg-slate-950/80">
        <AdminPanel onBack={() => navigate('home')} />
        <CookieConsent />
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[998]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        <p className="text-white/60 text-sm font-medium tracking-wide animate-pulse">Sayfa Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      {currentPage !== 'explore' && <MouseTrailBackground />}
      <Layout 
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenAuth={() => openAuth('login')}
        onOpenAdminLogin={() => setShowAdminAuth(true)}
      >
        <PageRouter currentPage={currentPage} />
      </Layout>
      
      {showAuth && <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
      {showAdminAuth && (
        <AdminLoginModal
          onClose={() => setShowAdminAuth(false)}
          onSuccess={() => { setShowAdminAuth(false); navigate('admin'); }}
        />
      )}
      {showBetaNotice && <BetaNoticeModal onClose={() => setShowBetaNotice(false)} isOpen={showBetaNotice} />}
      <CookieConsent />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <FirebaseAuthProvider>
          <AppContent />
        </FirebaseAuthProvider>
      </SiteSettingsProvider>
    </ThemeProvider>
  );
}
