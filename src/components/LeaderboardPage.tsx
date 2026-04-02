import { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp, Medal, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllUsers, getProjects, getBlogs } from '../firebase/firestoreService';
import type { FirestoreUser } from '../firebase/firestoreService';

interface RankedUser extends FirestoreUser {
  score: number;
  rank: number;
  activeProjects: number;
  activeBlogs: number;
  totalLikes: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const [users, projects, blogs] = await Promise.all([
          getAllUsers(),
          getProjects(),
          getBlogs()
        ]);

        const scoredUsers = users.map(user => {
          const userProjects = projects.filter(p => p.uid === user.uid);
          const userBlogs = blogs.filter(b => b.uid === user.uid);
          
          let totalLikes = 0;
          userProjects.forEach(p => { totalLikes += (p.likes || []).length; });
          userBlogs.forEach(b => { totalLikes += (b.likes || []).length; });

          // Formül: (Projeler * 50) + (Bloglar * 30) + (Beğeniler * 10)
          const score = (userProjects.length * 50) + (userBlogs.length * 30) + (totalLikes * 10);
          
          return {
            ...user,
            score,
            activeProjects: userProjects.length,
            activeBlogs: userBlogs.length,
            totalLikes
          };
        })
        .filter(u => u.score > 0) // Sadece 0 puandan yüksek olanları göster
        .sort((a, b) => b.score - a.score);

        // Rank ekle
        const ranked = scoredUsers.map((u, i) => ({ ...u, rank: i + 1 })).slice(0, 50); // İlk 50
        setLeaders(ranked);
      } catch (err) {
        console.error('Error loading leaderboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const getRankIndicator = (rank: number) => {
    if (rank === 1) return <div className="flex flex-col items-center"><Trophy className="w-8 h-8 text-yellow-400 mb-1" drop-shadow-md /><span className="text-yellow-400 font-bold">1</span></div>;
    if (rank === 2) return <div className="flex flex-col items-center"><Medal className="w-7 h-7 text-gray-300 mb-1" /><span className="text-gray-300 font-bold">2</span></div>;
    if (rank === 3) return <div className="flex flex-col items-center"><Award className="w-7 h-7 text-amber-600 mb-1" /><span className="text-amber-600 font-bold">3</span></div>;
    return <span className="text-lg font-bold text-white/40 px-2">{rank}</span>;
  };

  const getBadges = (user: RankedUser) => {
    const badges = [];
    if (user.activeProjects >= 5) badges.push({ id: 'top-creator', icon: <Flame className="w-4 h-4 text-orange-400" />, label: 'Proje Ateşi' });
    if (user.totalLikes >= 50) badges.push({ id: 'loved', icon: <Star className="w-4 h-4 text-pink-400" />, label: 'Sevilen Yazar' });
    if (user.rank === 1) badges.push({ id: 'champion', icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: 'Şampiyon' });
    return badges;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Topluluk Geliştiricileri
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Liderlik <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">Tablosu</span>
          </h1>
          <p className="text-white/60 text-lg">En çok üreten, paylaşan ve beğeni alan yetenekler.</p>
        </motion.div>

        {leaders.length === 0 ? (
          <div className="text-center bg-gray-800/40 border border-white/5 rounded-3xl py-16">
            <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium mb-2">Henüz yeterli veri yok</h3>
            <p className="text-white/40">Liderlik tablosu projeler paylaşıldıkça güncellenecektir.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {leaders.map((user, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.uid}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border ${
                  user.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10' :
                  user.rank === 2 ? 'bg-gradient-to-r from-gray-300/20 to-gray-500/10 border-gray-400/30' :
                  user.rank === 3 ? 'bg-gradient-to-r from-amber-600/20 to-amber-800/10 border-amber-600/30' :
                  'bg-gray-800/40 border-white/5 hover:bg-gray-800/60 transition-colors'
                }`}
              >
                {/* Sıralama İkonu */}
                <div className="w-14 flex-shrink-0 flex items-center justify-center">
                  {getRankIndicator(user.rank)}
                </div>

                {/* Profil Resmi & İsim */}
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.displayName} />
                  ) : (
                    user.displayName.substring(0, 2).toUpperCase()
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold truncate ${
                      user.rank === 1 ? 'text-yellow-400 text-lg' : 'text-white text-base'
                    }`}>
                      {user.displayName}
                    </h3>
                    <span className="text-white/40 text-xs">@{user.username}</span>
                  </div>
                  
                  {/* Rozetler */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getBadges(user).map(badge => (
                      <span key={badge.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70" title={badge.label}>
                        {badge.icon} {badge.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* İstatistikler (Mobilde Gizli) */}
                <div className="hidden md:flex flex-shrink-0 items-center justify-around w-64 text-sm">
                  <div className="text-center">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-0.5">Projeler</p>
                    <p className="text-white font-semibold">{user.activeProjects}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-0.5">Bloglar</p>
                    <p className="text-white font-semibold">{user.activeBlogs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-0.5">Beğeniler</p>
                    <p className="text-white font-semibold">{user.totalLikes}</p>
                  </div>
                </div>

                {/* Puan */}
                <div className="flex-shrink-0 text-right w-24">
                  <p className={`text-2xl font-black tracking-tight ${
                    user.rank === 1 ? 'text-yellow-400' :
                    user.rank === 2 ? 'text-gray-300' :
                    user.rank === 3 ? 'text-amber-500' :
                    'text-white'
                  }`}>
                    {user.score.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Puan</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
