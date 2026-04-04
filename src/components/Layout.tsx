import { useState, useEffect } from 'react';
import { Menu, X, Home, Compass, BookOpen, FileText, Trophy, Shield, User, Bell, LogIn, LogOut, MessageSquare, Play, ChevronDown } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { useSiteSettings } from '../store/SiteSettingsContext';
import NotificationsDropdown from './NotificationsDropdown';
import { getUserNotifications } from '../firebase/firestoreService';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
  onOpenAdminLogin: () => void;
}

export default function Layout({ children, currentPage, onNavigate, onOpenAuth, onOpenAdminLogin }: LayoutProps) {
  const { userProfile, isAdmin, logout } = useFirebaseAuth();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  const navLinks = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'explore', label: 'Keşfet', icon: Compass },
    { id: 'blogs', label: 'Bloglar', icon: BookOpen },
    { id: 'wiki', label: 'Wiki', icon: FileText },
    { id: 'leaderboard', label: 'Liderlik', icon: Trophy },
    { id: 'rbg', label: 'RBG', icon: Play },
  ];

  const initials = userProfile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-gray-950/80 backdrop-blur-2xl border-r border-white/5 z-50">
        <div className="h-20 flex items-center px-6">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/40 border border-white/10 group-hover:-translate-y-0.5 transition-transform">
              <span className="text-xs font-black text-white">RBG</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">{settings.brandName || 'ProjeAkademi'}</span>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                {link.label}
              </button>
            );
          })}

          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  currentPage === 'admin'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                    : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </button>
            </div>
          )}
        </nav>
        
        {/* Sidebar Bottom (User Summary) */}
        {userProfile && (
          <div className="p-4 border-t border-white/5">
            <button 
              onClick={() => onNavigate(`profile:${userProfile.username}`)}
              className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userProfile.displayName}</p>
                <p className="text-xs text-white/50 truncate">@{userProfile.username}</p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
            <span className="text-[10px] font-black text-white">RBG</span>
          </div>
          <span className="font-bold text-white tracking-tight">{settings.brandName || 'ProjeAkademi'}</span>
        </button>
        <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-gray-950/95 backdrop-blur-3xl flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
            <span className="font-bold text-white ml-2">Menü</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white/70 p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-medium ${
                    isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col md:pl-64 min-h-screen relative overflow-x-hidden">
        
        {/* Topbar */}
        <header className="sticky top-0 z-40 hidden md:flex items-center justify-end h-20 px-8 bg-transparent pointer-events-none">
          <div className="flex items-center gap-4 bg-gray-950/60 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-2 pointer-events-auto shadow-2xl">
            {userProfile ? (
              <>
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                    className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-gray-900" />}
                  </button>
                  {showNotifs && (
                    <NotificationsDropdown 
                      uid={userProfile.uid} 
                      onClose={() => { setShowNotifs(false); setUnreadCount(0); }} 
                    />
                  )}
                </div>

                <button 
                  onClick={() => onNavigate('messages')}
                  className={`p-2.5 rounded-xl transition ${
                    currentPage.startsWith('messages')
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-white/10 mx-1"></div>

                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                      <div className="p-1">
                        <button onClick={() => { onNavigate(`profile:${userProfile.username}`); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition rounded-xl">
                          <User className="w-4 h-4" /> Profilim
                        </button>
                        <button onClick={() => { logout(); setShowUserMenu(false); onNavigate('home'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition rounded-xl mt-1">
                          <LogOut className="w-4 h-4" /> Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={onOpenAdminLogin} className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 transition">
                  Admin
                </button>
                <div className="h-5 w-px bg-white/10"></div>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-transform hover:-translate-y-0.5"
                >
                  Giriş Yap
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 w-full pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
