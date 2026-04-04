import { useEffect, useState } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SiteSettingsProvider } from './store/SiteSettingsContext';
import Layout from './components/Layout';
import Footer from './components/Footer';
import FirebaseHomeFeed from './components/FirebaseHomeFeed';
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
      <FirebaseHomeFeed />
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { setShowSplash(false); }, 2200);
    return () => window.clearTimeout(timer);
  }, []);

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
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[999] overflow-hidden">
        {/* Dekoratif Arka Plan Daireleri */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="text-center relative z-10">
          <div className="beta-splash-card w-56 h-56 md:w-80 md:h-80 bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 rounded-[2.5rem] flex flex-col items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-500/30 border border-white p-6 relative overflow-hidden">
            {/* Kart içi parlama efekti */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400 rounded-full blur-2xl opacity-40"></div>
            
            <span className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-md mb-2 relative z-10">
              BETA
            </span>
            <div className="w-12 h-1 bg-orange-400 rounded-full mb-3 relative z-10"></div>
            <span className="text-blue-50 text-xs md:text-sm font-semibold tracking-widest uppercase relative z-10">
              ProjeAkademi
            </span>
          </div>
          <h2 className="text-gray-900 text-xl font-bold tracking-tight mb-2 animate-fade-in">Platform Yükleniyor</h2>
          <p className="text-gray-500 text-sm tracking-wide animate-pulse">Sizin için hazırlanıyor...</p>
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
