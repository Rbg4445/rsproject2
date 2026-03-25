import { useState } from 'react';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import ExplorePage from './components/ExplorePage';
import BlogsPage from './components/BlogsPage';
import AdminPanel from './components/AdminPanel';
import MouseTrailBackground from './components/MouseTrailBackground';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin panel (tam ekran, navbar yok)
  if (currentPage === 'admin') {
    return (
      <>
        <MouseTrailBackground />
        <AdminPanel onBack={() => navigate('home')} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // Profile page: "profile:username"
  if (currentPage.startsWith('profile:')) {
    const username = currentPage.split(':')[1];
    return (
      <>
        <MouseTrailBackground />
        <Navbar onOpenAuth={() => setShowAuth(true)} onNavigate={navigate} currentPage={currentPage} />
        <div className="relative z-10 pt-20">
          <UserProfile username={username} onBack={() => navigate('home')} />
        </div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // Explore page
  if (currentPage === 'explore') {
    return (
      <>
        <MouseTrailBackground />
        <Navbar onOpenAuth={() => setShowAuth(true)} onNavigate={navigate} currentPage={currentPage} />
        <div className="relative z-10 pt-20">
          <ExplorePage
            onBack={() => navigate('home')}
            onViewProfile={(username) => navigate(`profile:${username}`)}
          />
        </div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // Blogs page
  if (currentPage === 'blogs') {
    return (
      <>
        <MouseTrailBackground />
        <Navbar onOpenAuth={() => setShowAuth(true)} onNavigate={navigate} currentPage={currentPage} />
        <div className="relative z-10 pt-20">
          <BlogsPage
            onBack={() => navigate('home')}
            onViewProfile={(username) => navigate(`profile:${username}`)}
          />
        </div>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-white">
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
