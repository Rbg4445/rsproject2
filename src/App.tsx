import { useState } from 'react';
import { AuthProvider } from './store/AuthContext';
import { FirebaseAuthProvider, useFirebaseAuth } from './store/FirebaseAuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import FirebaseAuthModal from './components/FirebaseAuthModal';
import FirebaseUserProfile from './components/FirebaseUserProfile';
import FirebaseExplorePage from './components/FirebaseExplorePage';
import FirebaseBlogsPage from './components/FirebaseBlogsPage';
import AdminPanel from './components/AdminPanel';
import MouseTrailBackground from './components/MouseTrailBackground';
import FirebaseSetupGuide from './components/FirebaseSetupGuide';

// Firebase bağlı mı kontrol et
const FIREBASE_CONFIGURED =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'FIREBASE_API_KEY_BURAYA' &&
  import.meta.env.VITE_FIREBASE_API_KEY.length > 10;

function FirebaseAppContent() {
  const { firebaseUser, userProfile, loading } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-[999]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto animate-pulse">
            🚀
          </div>
          <p className="text-white/40 text-sm">ProjeAkademi yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Admin panel
  if (currentPage === 'admin') {
    return (
      <>
        <MouseTrailBackground />
        <AdminPanel onBack={() => navigate('home')} />
        {showSetupGuide && <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />}
      </>
    );
  }

  // Profile page
  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return (
      <>
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onNavigate={navigate}
          currentPage={currentPage}
          onShowSetupGuide={() => setShowSetupGuide(true)}
        />
        <div className="relative z-10">
          <FirebaseUserProfile username={username} />
        </div>
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showSetupGuide && <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />}
      </>
    );
  }

  // Explore page
  if (currentPage === 'explore') {
    return (
      <>
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onNavigate={navigate}
          currentPage={currentPage}
          onShowSetupGuide={() => setShowSetupGuide(true)}
        />
        <div className="relative z-10">
          <FirebaseExplorePage />
        </div>
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showSetupGuide && <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />}
      </>
    );
  }

  // Blogs page
  if (currentPage === 'blogs') {
    return (
      <>
        <MouseTrailBackground />
        <Navbar
          onOpenAuth={() => openAuth('login')}
          onNavigate={navigate}
          currentPage={currentPage}
          onShowSetupGuide={() => setShowSetupGuide(true)}
        />
        <div className="relative z-10">
          <FirebaseBlogsPage />
        </div>
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showSetupGuide && <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />}
      </>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gray-950">
      <MouseTrailBackground />
      <Navbar
        onOpenAuth={() => openAuth('login')}
        onNavigate={navigate}
        currentPage="home"
        onShowSetupGuide={() => setShowSetupGuide(true)}
      />
      <div className="relative z-10">
        <Hero />
        <Projects />
        <About />
        <Skills />
        <Contact />
        <Footer />
      </div>

      {/* Firebase kurulum banner (Firebase yapılandırılmamışsa) */}
      {!FIREBASE_CONFIGURED && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-yellow-600 p-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <p className="text-white text-sm font-medium">
                Firebase henüz yapılandırılmadı. Veriler tarayıcıda saklı (demo mod).
                Gerçek veritabanı için kurulum yapın.
              </p>
            </div>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="flex-shrink-0 bg-white text-orange-600 font-bold text-xs px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Kurulum Rehberi
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
      )}
      {showSetupGuide && <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />}
    </div>
  );
}

function LocalAppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return (
      <>
        <MouseTrailBackground />
        <AdminPanel onBack={() => navigate('home')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <MouseTrailBackground />
      <Navbar onOpenAuth={() => setShowAuth(true)} onNavigate={navigate} currentPage="home" />
      <div className="relative z-10">
        <Hero />
        <Projects />
        <About />
        <Skills />
        <Contact />
        <Footer />
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default function App() {
  if (FIREBASE_CONFIGURED) {
    return (
      <FirebaseAuthProvider>
        <FirebaseAppContent />
      </FirebaseAuthProvider>
    );
  }

  // Firebase yapılandırılmamışsa, Firebase provider'ı kullan ama graceful degradation yap
  return (
    <FirebaseAuthProvider>
      <FirebaseAppContent />
    </FirebaseAuthProvider>
  );
}
