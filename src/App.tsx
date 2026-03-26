import { useEffect, useState } from 'react';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SiteSettingsProvider } from './store/SiteSettingsContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Skills from './components/Skills';
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
import ConditionalRecaptcha from './components/ConditionalRecaptcha';
import { markRecaptchaVerified, needsRecaptcha } from './utils/recaptcha';

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
  const [entryCaptchaToken, setEntryCaptchaToken] = useState<string | null>(null);
  const [showEntryCaptcha, setShowEntryCaptcha] = useState(false);

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

  // Entry-level captcha: siteye ilk girişte hafif güvenlik taraması
  useEffect(() => {
    const scope = 'entry';
    if (!needsRecaptcha(scope)) {
      return;
    }
    setShowEntryCaptcha(true);
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

      {/* Siteye girişte hafif captcha katmanı */}
      {showEntryCaptcha && !entryCaptchaToken && (
        <div className="fixed inset-x-0 top-16 z-[80] flex justify-center px-2">
          <div className="max-w-3xl w-full rounded-2xl border border-amber-400/40 bg-amber-900/90 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur">
            <ConditionalRecaptcha
              show
              value={entryCaptchaToken}
              onChange={(token) => {
                setEntryCaptchaToken(token);
                if (token) {
                  markRecaptchaVerified('entry');
                  setShowEntryCaptcha(false);
                }
              }}
              description="Guvenlik icin, bu siteye ilk girisinizde kisa bir reCAPTCHA dogrulamasindan gecmeniz gerekiyor."
            />
          </div>
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-[999]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <img
              src="https://cdn-icons-png.flaticon.com/128/1197/1197460.png"
              alt="loading icon"
              className="h-8 w-8"
            />
          </div>
          <p className="text-white/40 text-sm">ProjeAkademi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-950">
        <MouseTrailBackground />
        <AdminPanel onBack={() => navigate('home')} />
        {renderOverlayModals(false)}
        <CookieConsent />
      </div>
    );
  }

  if (currentPage === 'rbg') {
    return (
      <div className="min-h-screen bg-gray-950">
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

  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return (
      <div className="min-h-screen bg-gray-950">
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
      <div className="min-h-screen bg-gray-950">
        <MouseTrailBackground />
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
      <div className="min-h-screen bg-gray-950">
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
      <div className="min-h-screen bg-gray-950">
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
    <div className="min-h-screen bg-gray-950">
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
        <Skills />
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
