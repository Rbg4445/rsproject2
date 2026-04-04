import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User, Compass, ChevronDown, BookOpen, FileText, Shield, Star, Play, Bell, Trophy, MessageSquare } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { useTheme } from '../store/ThemeContext';
import { useSiteSettings } from '../store/SiteSettingsContext';
import NotificationsDropdown from './NotificationsDropdown';
import { getUserNotifications } from '../firebase/firestoreService';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAdminLogin: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onOpenAuth, onOpenAdminLogin, onNavigate, currentPage }: NavbarProps) {
  const { userProfile, isAdmin, logout } = useFirebaseAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userProfile?.uid) {
      getUserNotifications(userProfile.uid).then(data => {
        setUnreadCount(data.filter(n => !n.read).length);
      });
    } else {
      setUnreadCount(0);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  const isHome = currentPage === 'home';

  // Üst menüde yalnızca soldaki ana menü butonları kalsın, eski anchor linkler kaldırıldı
  const navLinks: { label: string; href: string }[] = [];

  const initials = userProfile?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-gray-950/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between md:justify-start md:gap-8 h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/40 border border-white/10 transition-all group-hover:-translate-y-0.5 group-hover:shadow-sky-500/70">
              <span className="text-xs font-black tracking-tight text-white">RBG</span>
            </div>
            <div className="text-left">
              <span className="block text-lg font-semibold tracking-tight text-white">
                {settings.brandName || 'rbgprojects'}
              </span>
              <span className="hidden sm:block text-[11px] text-white/40 font-medium">
                Projeler · Eğitim · Wiki
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {link.label}
              </a>
            ))}

            {/* Explore Button */}
            <button
              onClick={() => onNavigate('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'explore'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-4 h-4" />
              Keşfet
            </button>

            {/* Blogs Button */}
            <button
              onClick={() => onNavigate('blogs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'blogs'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bloglar
            </button>

            <button
              onClick={() => onNavigate('wiki')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'wiki'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              Wiki
            </button>

            <button
              onClick={() => onNavigate('rbg')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'rbg'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Play className="w-4 h-4" />
              RBG
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'leaderboard'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Liderlik
            </button>

            {/* Admin Button */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentPage === 'admin'
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}



            {/* Auth */}
            {userProfile ? (
              <div className="flex items-center ml-3 gap-2">
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-gray-900" />
                    )}
                  </button>
                  {showNotifs && (
                    <NotificationsDropdown 
                      uid={userProfile.uid} 
                      onClose={() => {
                        setShowNotifs(false);
                        // Kapatırken local state'i güncelle (gerçek senaryoda Context vs. kullanılmalı)
                        setUnreadCount(0);
                      }} 
                    />
                  )}
                </div>

                <button 
                  onClick={() => onNavigate('messages')}
                  className={`p-2 rounded-xl border transition ${
                    currentPage.startsWith('messages')
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Mesajlar"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                
                <div className="relative ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold hidden lg:block">{userProfile.displayName.split(' ')[0]}</span>
                  {isAdmin && <Shield className="w-3.5 h-3.5 text-yellow-300" />}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 bg-gray-700/50 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{userProfile.displayName}</p>
                        {isAdmin && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold border border-red-500/20">Admin</span>
                        )}
                        {userProfile.role === 'moderator' && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold border border-orange-500/20">Mod</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">@{userProfile.username}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { onNavigate(`profile:${userProfile.username}`); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        <User className="w-4 h-4" />
                        Profilim
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { onNavigate('admin'); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); onNavigate('home'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="ml-3 flex items-center gap-2">
                <button
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  <Shield className="h-4 w-4" />
                  Admin Girisi
                </button>
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  Giris Yap
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:bg-white/10 transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { onNavigate('explore'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Keşfet
          </button>
          <button
            onClick={() => { onNavigate('blogs'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Bloglar
          </button>
          <button
            onClick={() => { onNavigate('wiki'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Wiki
          </button>
          <button
            onClick={() => { onNavigate('rbg'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            RBG
          </button>
          <button
            onClick={() => { onNavigate('leaderboard'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Liderlik
          </button>


          {userProfile ? (
            <>
              <button
                onClick={() => { onNavigate('messages'); setIsOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Mesajlar
              </button>
              <button
                onClick={() => { onNavigate(`profile:${userProfile.username}`); setIsOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-medium transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profilim
              </button>
              {isAdmin && (
                <button
                  onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium transition flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => { logout(); setIsOpen(false); onNavigate('home'); }}
                className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onOpenAdminLogin(); setIsOpen(false); }}
                className="block w-full text-center mt-2 px-5 py-3 border border-red-500/30 bg-red-500/10 text-red-300 font-semibold rounded-xl"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin Girişi
              </button>
              <button
                onClick={() => { onOpenAuth(); setIsOpen(false); }}
                className="block w-full text-center mt-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl"
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Giris Yap / Kayit Ol
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
