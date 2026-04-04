import { useState, useEffect } from 'react';
import { Menu, X, Home, Compass, BookOpen, FileText, Trophy, Shield, User, Bell, LogIn, LogOut, MessageSquare, Play, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { id: 'home', label: 'r/Popüler', icon: Home },
    { id: 'rbg', label: 'RBG Studio', icon: Play },
  ];

  const initials = userProfile?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 bg-zinc-950 border-r border-zinc-800/60 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-6 overflow-hidden border-b border-zinc-800/60">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group shrink-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden group-hover:-translate-y-0.5 transition-transform shadow-lg shadow-cyan-500/10">
              <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" alt="RBG" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-white tracking-tight shrink-0">{settings.brandName || 'ProjeAkademi'}</span>}
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
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                {!isCollapsed && <span>{link.label}</span>}
              </button>
            );
          })}

          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-zinc-800/60">
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                  currentPage === 'admin'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-red-400/50 hover:bg-red-500/10 hover:text-red-400'
                }`}
                title={isCollapsed ? 'Admin Panel' : undefined}
              >
                <Shield className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Admin Panel</span>}
              </button>
            </div>
          )}
        </nav>
        
        {/* Sidebar Bottom */}
        <div className="p-4 border-t border-zinc-800/60 flex flex-col gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center text-zinc-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-zinc-800/50 ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
            title="Paneli Daralt/Genişlet"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
            {!isCollapsed && <span className="text-sm font-medium">Paneli Daralt</span>}
          </button>
          
          {userProfile && (
            <button 
              onClick={() => onNavigate(`profile:${userProfile.username}`)}
              className={`flex items-center w-full p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-left ${isCollapsed ? 'justify-center' : 'gap-3'}`}
              title={isCollapsed ? "Profilim" : undefined}
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userProfile.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate">@{userProfile.username}</p>
                </div>
              )}
            </button>
          )}

          {/* Footer inside Left Sidebar */}
          {!isCollapsed && (
             <div className="mt-2 text-[10px] text-zinc-600 px-2 space-y-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                   <a href="#" className="hover:text-zinc-400 transition">Gizlilik</a>
                   <a href="#" className="hover:text-zinc-400 transition">Sözleşme</a>
                   <a href="#" className="hover:text-zinc-400 transition">Yardım</a>
                </div>
                <p>RBG ProjeAkademi © 2026.</p>
             </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800/60 z-50 flex items-center justify-between px-4 shadow-md">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
            <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" alt="RBG" className="w-full h-full object-cover" />
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
      <main className={`flex-1 flex flex-col min-h-screen relative overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        
        {/* Topbar */}
        <header className="sticky top-0 z-40 hidden md:flex items-center justify-end h-16 px-8 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60">
          <div className="flex items-center gap-4">
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

                {(settings.chatEnabled || isAdmin) && (
                  <button 
                    onClick={() => onNavigate('messages')}
                    className={`p-2.5 rounded-xl transition ${
                      currentPage.startsWith('messages')
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Mesajlar"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}

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
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-transform hover:-translate-y-0.5"
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
