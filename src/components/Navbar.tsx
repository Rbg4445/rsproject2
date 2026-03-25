import { useState, useEffect } from 'react';
import { Menu, X, Code2, GraduationCap, LogIn, LogOut, User, Compass, ChevronDown, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onOpenAuth, onNavigate, currentPage }: NavbarProps) {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const navLinks = isHome
    ? [
        { label: 'Ana Sayfa', href: '#hero' },
        { label: 'Projeler', href: '#projects' },
        { label: 'Hakkımda', href: '#about' },
        { label: 'Yetenekler', href: '#skills' },
        { label: 'İletişim', href: '#contact' },
      ]
    : [];

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'glass border-b border-white/20 shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <GraduationCap className="w-4 h-4 text-purple-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">ProjeAkademi</span>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 font-medium">
                Eğitim & Kodlama
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {link.label}
              </a>
            ))}

            {/* Explore Button */}
            <button
              onClick={() => onNavigate('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentPage === 'explore'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
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
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bloglar
            </button>

            {/* Admin Button */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentPage === 'admin'
                    ? 'bg-red-50 text-red-600'
                    : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold hidden lg:block">{user.displayName.split(' ')[0]}</span>
                  {isAdmin && <Shield className="w-3.5 h-3.5 text-yellow-300" />}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{user.displayName}</p>
                        {isAdmin && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Admin</span>
                        )}
                        {user.role === 'moderator' && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">Mod</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { onNavigate(`profile:${user.username}`); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <User className="w-4 h-4" />
                        Profilim
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { onNavigate('admin'); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); onNavigate('home'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
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
        <div className="glass border-t border-white/20 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { onNavigate('explore'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Keşfet
          </button>
          <button
            onClick={() => { onNavigate('blogs'); setIsOpen(false); }}
            className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Bloglar
          </button>

          {user ? (
            <>
              <button
                onClick={() => { onNavigate(`profile:${user.username}`); setIsOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profilim
              </button>
              {isAdmin && (
                <button
                  onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 font-medium transition flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => { logout(); setIsOpen(false); onNavigate('home'); }}
                className="w-full text-left px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 font-medium transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setIsOpen(false); }}
              className="block w-full text-center mt-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Giriş Yap / Kayıt Ol
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
