import { useEffect, useState } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SiteSettingsProvider } from './store/SiteSettingsContext';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FirebaseAuthModal from './components/FirebaseAuthModal';
import FirebaseUserProfile from './components/FirebaseUserProfile';
import FirebaseExplorePage from './components/FirebaseExplorePage';
import FirebaseBlogsPage from './components/FirebaseBlogsPage';
import FirebaseMessagesPage from './components/FirebaseMessagesPage';
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

function PageRouter({ currentPage }: { currentPage: string }) {
  if (currentPage === 'explore') return <FirebaseExplorePage />;
  if (currentPage === 'blogs') return <FirebaseBlogsPage />;
  if (currentPage === 'wiki') return <FirebaseWikiPage />;
  if (currentPage === 'rbg') return <RbgPage />;
  if (currentPage === 'leaderboard') return <LeaderboardPage />;
  
  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return <FirebaseUserProfile username={username} />;
  }
  
  if (currentPage.startsWith('messages')) {
    return <FirebaseMessagesPage />;
  }
  
  return (
    <>
      <Hero />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </>
  );
}

function AppContent() {
  const { loading } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState(parseRouteFromHash());
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(true);
  const [authTab, setAuthTab] = useState('login' as 'login' | 'register');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => { setShowSplash(false); }, 2200);
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
            <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/40 text-sm">Yükleniyor...</p>
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
