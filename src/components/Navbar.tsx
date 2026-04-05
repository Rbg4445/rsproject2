import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User, Compass, ChevronDown, BookOpen, FileText, Shield, Star, Play, Bell, Trophy, MessageSquare, Search } from 'lucide-react';
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

  const getXpProgress = () => {
    if (!userProfile?.xp) return 0;
    const xp = userProfile.xp;
    if (xp < 100) return (xp / 100) * 100;
    if (xp < 500) return ((xp - 100) / 400) * 100;
    if (xp < 1000) return ((xp - 500) / 500) * 100;
    if (xp < 5000) return ((xp - 1000) / 4000) * 100;
    return 100;
  };

  const initials = userProfile?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className={`w-full max-w-7xl pointer-events-auto transition-all duration-500 relative overflow-hidden ${
          scrolled || !isHome
            ? 'nav-floating rounded-[24px] py-1 shadow-2xl'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group relative"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 shadow-lg shadow-indigo-500/20 border border-white/10 transition-all group-hover:scale-105 group-hover:rotate-3">
                <span className="text-xs font-black text-white">RBG</span>
              </div>
              <div className="text-left">
                <span className="block text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                  {settings.brandName || 'rbgprojects'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'explore', label: 'Keşfet', icon: <Compass className="w-4 h-4" /> },
                { id: 'blogs', label: 'Blog', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'wiki', label: 'Wiki', icon: <FileText className="w-4 h-4" /> },
                { id: 'leaderboard', label: 'Liderlik', icon: <Trophy className="w-4 h-4" /> },
                { id: 'rbg', label: 'RBG', icon: <Play className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group hover:bg-white/5 ${
                    currentPage === item.id ? 'nav-item-active' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${currentPage === item.id ? 'text-indigo-400' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    currentPage === 'admin' ? 'bg-red-500/20 text-red-400' : 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}

              <div className="w-px h-6 bg-white/10 mx-2" />

              {/* Global Search Bar */}
              <div className="relative group/search ml-1 mr-2 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-white/40 group-focus-within/search:text-indigo-400 transition-colors pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Platformda ara..."
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 w-40 focus:w-60 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all duration-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onNavigate('explore');
                    }
                  }}
                />
              </div>

              {userProfile ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                      className={`p-2.5 rounded-xl border transition-all ${
                        showNotifs ? 'bg-indigo-500/20 border-indigo-500/30 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900" />
                      )}
                    </button>
                    {showNotifs && (
                      <NotificationsDropdown uid={userProfile.uid} onClose={() => setShowNotifs(false)} />
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black">
                        {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full rounded-xl object-cover" /> : initials}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-5 py-4 bg-white/5 border-b border-white/10">
                          <p className="font-bold text-white text-sm">{userProfile.displayName}</p>
                          <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Level: {userProfile.level || 'Çaylak'}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button onClick={() => onNavigate(`profile:${userProfile.username}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl transition-all">
                            <User className="w-4 h-4" /> Profilim
                          </button>
                          <button onClick={() => { logout(); onNavigate('home'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition">
                            <LogOut className="w-4 h-4" /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={onOpenAuth} className="px-6 py-2 bg-indigo-600 text-white text-sm font-black rounded-xl hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
                    GİRİŞ YAP
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-3 rounded-xl bg-white/5 text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {userProfile && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-[0_0_10px_#6366f1] transition-all duration-1000"
              style={{ width: `${getXpProgress()}%` }}
            />
          </div>
        )}

        {isOpen && (
          <div className="md:hidden px-4 py-6 space-y-2 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 animate-slide-up">
            {[
              { id: 'explore', label: 'Keşfet', icon: <Compass className="w-5 h-5" /> },
              { id: 'blogs', label: 'Bloglar', icon: <BookOpen className="w-5 h-5" /> },
              { id: 'wiki', label: 'Wiki', icon: <FileText className="w-5 h-5" /> },
              { id: 'leaderboard', label: 'Liderlik', icon: <Trophy className="w-5 h-5" /> },
              { id: 'rbg', label: 'RBG Page', icon: <Play className="w-5 h-5" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  currentPage === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="font-bold">{item.label}</span>
              </button>
            ))}

            {userProfile ? (
               <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
                 <button
                    onClick={() => { onNavigate('messages'); setIsOpen(false); }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/60 hover:bg-white/5"
                 >
                   <MessageSquare className="w-5 h-5" />
                   <span className="font-bold">Mesajlarım</span>
                 </button>
                 <button
                    onClick={() => { logout(); setIsOpen(false); onNavigate('home'); }}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10"
                 >
                   <LogOut className="w-5 h-5" />
                   <span className="font-bold">Çıkış Yap</span>
                 </button>
               </div>
            ) : (
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => { onOpenAuth(); setIsOpen(false); }}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg"
                >
                  Hemen Katıl
                </button>
                <button
                  onClick={() => { onOpenAdminLogin(); setIsOpen(false); }}
                  className="w-full py-4 border border-white/10 text-white/60 font-bold rounded-2xl"
                >
                  Admin Girişi
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
