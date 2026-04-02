import { useEffect, useState } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SiteSettingsProvider } from './store/SiteSettingsContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
// import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FirebaseAuthModal from './components/FirebaseAuthModal';
import FirebaseUserProfile from './components/FirebaseUserProfile';
import FirebaseExplorePage from './components/FirebaseExplorePage';
import FirebaseBlogsPage from './components/FirebaseBlogsPage';
import FirebaseWikiPage from './components/FirebaseWikiPage';
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

function AppContent() {
  const { loading } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState(parseRouteFromHash());
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // BETA splash ekranı: ilk açılışta göster, 2.2 saniye sonra kapat
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(parseRouteFromHash());
      window.scrollTo({ top: 0, behavior: 'auto' });
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

  const renderOverlayModals = (withAuth = true) => (
    <>
      {withAuth && showAuth && (
        <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
      )}
      {withAuth && showAdminAuth && (
        <AdminLoginModal
          onClose={() => setShowAdminAuth(false)}
          onSuccess={() => {
            setShowAdminAuth(false);
            navigate('admin');
          }}
        />
      )}
      {showBetaNotice && (
        <BetaNoticeModal onClose={() => setShowBetaNotice(false)} isOpen={showBetaNotice} />
      )}
    </>
  );

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-fuchsia-800 to-slate-950 flex items-center justify-center z-[999] overflow-hidden">
        <div className="text-center">
          <div className="beta-splash-card w-52 h-52 md:w-72 md:h-72 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-fuchsia-500/50 border border-white/20">
            <span className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              BETA
            </span>
          </div>
          <p className="text-white/60 text-xs md:text-sm tracking-wide uppercase">ProjeAkademi Proje Platformu</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-[998]">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 mx-auto animate-pulse">
            <img
              src="https://cdn-icons-png.flaticon.com/128/1197/1197460.png"
              alt="loading icon"
              className="h-6 w-6"
            />
          </div>
          <p className="text-white/40 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950/80">
        {/* Admin sayfası: sade koyu arka plan, animasyonsuz */}
        <AdminPanel onBack={() => navigate('home')} />
        {renderOverlayModals(false)}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'rbg') {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <RbgPage />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'leaderboard') {
    return (
      <div className="min-h-screen bg-transparent">
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <LeaderboardPage />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return (
      <div className="min-h-screen bg-transparent">
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <FirebaseUserProfile username={username} />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'explore') {
    return (
      <div className="min-h-screen bg-transparent">
        {/* MouseTrailBackground kaldırıldı: keşfet sayfası için performans optimizasyonu */}
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <FirebaseExplorePage />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'blogs') {
    return (
      <div className="min-h-screen bg-transparent">
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <FirebaseBlogsPage />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'wiki') {
    return (
      <div className="min-h-screen bg-transparent">
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onOpenAdminLogin={() => setShowAdminAuth(true)}
          onNavigate={navigate}
          currentPage={currentPage}
        />
        <div className="relative z-10">
          <FirebaseWikiPage />
        </div>
        {renderOverlayModals()}
        <CookieConsent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <MouseTrailBackground />
      <Navbar
        onOpenAuth={() => openAuth('login')}
        onOpenAdminLogin={() => setShowAdminAuth(true)}
        onNavigate={navigate}
        currentPage="home"
      />
      <div className="relative z-10">
        <Hero />
        <Projects />
        <About />
        <Contact />
        <Footer />
      </div>
      {renderOverlayModals()}
      <CookieConsent />
    </div>
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
