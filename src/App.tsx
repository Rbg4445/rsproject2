import { useState } from 'react';
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
import AdminPanel from './components/AdminPanel';
import MouseTrailBackground from './components/MouseTrailBackground';
import AdminLoginModal from './components/AdminLoginModal';

function AppContent() {
  const { loading } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

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

  // Admin panel
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-950">
        <MouseTrailBackground />
        <AdminPanel onBack={() => navigate('home')} />
      </div>
    );
  }

  // Profile page
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
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showAdminAuth && (
          <AdminLoginModal
            onClose={() => setShowAdminAuth(false)}
            onSuccess={() => navigate('admin')}
          />
        )}
      </div>
    );
  }

  // Explore page
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
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showAdminAuth && (
          <AdminLoginModal
            onClose={() => setShowAdminAuth(false)}
            onSuccess={() => navigate('admin')}
          />
        )}
      </div>
    );
  }

  // Blogs page
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
        {showAuth && (
          <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
        )}
        {showAdminAuth && (
          <AdminLoginModal
            onClose={() => setShowAdminAuth(false)}
            onSuccess={() => navigate('admin')}
          />
        )}
      </div>
    );
  }

  // Home page
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

      {showAuth && (
        <FirebaseAuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />
      )}
      {showAdminAuth && (
        <AdminLoginModal
          onClose={() => setShowAdminAuth(false)}
          onSuccess={() => navigate('admin')}
        />
      )}
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
