import { ArrowDown, Sparkles, BookOpen, Terminal } from 'lucide-react';
import { stats } from '../data/projects';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background - semi-transparent so canvas shows through */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/70 to-indigo-50/80" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Beta Banner */}
            <div className="inline-flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-400/30 animate-pulse-slow">
                <span className="text-xs font-black text-white tracking-widest uppercase">⚡ BETA</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm backdrop-blur-sm">
                <span className="text-sm font-semibold text-slate-600">Bu bir</span>
                <span className="text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">BETA</span>
                <span className="text-sm font-semibold text-slate-600">sürümüdür •</span>
                <span className="text-sm font-bold text-slate-700">👑 Samo Kral</span>
                <span className="text-sm font-semibold text-slate-600">ile yapılmıştır</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-600">Eğitim & Kodlama Platformu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-slate-800">Projelerimi </span>
              <span className="gradient-text">Keşfet</span>
              <br />
              <span className="text-slate-800">& </span>
              <span className="gradient-text">Öğren</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              Eğitim, akademi ve kodlama alanlarındaki projelerimi paylaştığım platform. 
              Modern teknolojilerle geliştirilen uygulamalar, eğitim içerikleri ve araştırma çalışmaları.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
              >
                <BookOpen className="w-5 h-5" />
                Projeleri Gör
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all hover:-translate-y-1"
              >
                <Terminal className="w-5 h-5" />
                Hakkımda
              </a>
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6 animate-slide-up">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative p-6 rounded-2xl bg-white/80 border border-white/60 shadow-lg shadow-slate-200/50 card-hover ${
                  index === 0 ? 'lg:translate-y-6' : ''
                } ${index === 3 ? 'lg:translate-y-6' : ''}`}
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{stat.label}</div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
