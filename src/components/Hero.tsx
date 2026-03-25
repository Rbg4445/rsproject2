import { ArrowDown, Sparkles, BookOpen, Terminal } from 'lucide-react';
import { stats } from '../data/projects';
import { useSiteSettings } from '../store/SiteSettingsContext';

export default function Hero() {
  const { settings } = useSiteSettings();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-float" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm backdrop-blur-sm">
                <span className="text-sm font-semibold text-white/70">Bu bir</span>
                <span className="text-sm font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">BETA</span>
                <span className="text-sm font-semibold text-white/70">{settings.betaLine}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">{settings.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-white">{settings.heroTitle}</span>
            </h1>

            <p className="text-lg text-white/60 max-w-xl leading-relaxed">
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                <Terminal className="w-5 h-5" />
                Projeleri Gör
              </a>
              <a
                href="#about"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5" />
                Hakkımda
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl backdrop-blur-sm border border-white/10" />
              <div className="absolute inset-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/5 flex flex-col p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-white/30 text-xs">proje-akademi.tsx</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-purple-400">const</span> <span className="text-blue-300">platform</span> <span className="text-white/60">= {'{'}</span></div>
                  <div className="pl-4"><span className="text-green-300">name</span><span className="text-white/60">:</span> <span className="text-amber-300">'{settings.brandName}'</span><span className="text-white/60">,</span></div>
                  <div className="pl-4"><span className="text-green-300">features</span><span className="text-white/60">: [</span></div>
                  <div className="pl-8"><span className="text-amber-300">'📚 Eğitim'</span><span className="text-white/60">,</span></div>
                  <div className="pl-8"><span className="text-amber-300">'💻 Kodlama'</span><span className="text-white/60">,</span></div>
                  <div className="pl-8"><span className="text-amber-300">'🎓 Akademi'</span><span className="text-white/60">,</span></div>
                  <div className="pl-8"><span className="text-amber-300">'🌐 Topluluk'</span></div>
                  <div className="pl-4"><span className="text-white/60">],</span></div>
                  <div className="pl-4"><span className="text-green-300">author</span><span className="text-white/60">:</span> <span className="text-amber-300">'{settings.footerNote}'</span><span className="text-white/60">,</span></div>
                  <div className="pl-4"><span className="text-green-300">version</span><span className="text-white/60">:</span> <span className="text-amber-300">'BETA'</span></div>
                  <div><span className="text-white/60">{'}'}</span></div>
                  <div className="mt-4">
                    <span className="text-purple-400">export default</span> <span className="text-blue-300">platform</span><span className="text-white/60">;</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-white/30">▶</span>
                    <span className="text-green-400 animate-pulse">|</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs font-medium">Keşfet</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
