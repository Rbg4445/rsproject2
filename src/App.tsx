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
  if (currentPage === 'explore') return <><FirebaseHomeFeed feedFilter="project" /><Footer /></>;
  if (currentPage === 'blogs') return <><FirebaseHomeFeed feedFilter="blog" /><Footer /></>;
  if (currentPage === 'wiki') return <><FirebaseHomeFeed feedFilter="article" /><Footer /></>;
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
