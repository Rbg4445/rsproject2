import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Heart, MessageSquare, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserNotifications, markNotificationRead } from '../firebase/firestoreService';
import type { Notification } from '../firebase/firestoreService';

export default function NotificationsDropdown({ uid, onClose }: { uid: string; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
  }, [uid]);

  const loadNotifs = async () => {
    try {
      const data = await getUserNotifications(uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approve': return <ShieldCheck className="w-5 h-5 text-green-400" />;
      case 'reject': return <X className="w-5 h-5 text-red-400" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'like': return <Heart className="w-5 h-5 text-pink-400" />;
      default: return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 scrollbar-thin scrollbar-thumb-white/10"
    >
      <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-white/5">
        <h3 className="font-bold text-white text-sm">Bildirimler</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-xs">Henüz bildiriminiz yok.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => { if (!notif.read) handleRead(notif.id); }}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                notif.read ? 'opacity-60 hover:bg-white/5' : 'bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? 'text-white/80' : 'text-white font-semibold'}`}>{notif.message}</p>
                <p className="text-[10px] text-white/40 mt-1">{new Date(notif.createdAt).toLocaleString('tr-TR')}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
