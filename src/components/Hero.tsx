import { ArrowDown, Star, BookOpen, Terminal } from 'lucide-react';
import { stats } from '../data/projects';
import { useSiteSettings } from '../store/SiteSettingsContext';

export default function Hero() {
  const { settings } = useSiteSettings();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Arka plan ışıkları (Vibrant) */}
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed opacity-40" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-30" />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-black/5 shadow-sm backdrop-blur-md">
                <span className="text-sm font-semibold text-gray-600">Bu bir</span>
                <span className="text-sm font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">BETA</span>
                <span className="text-sm font-semibold text-gray-600">{settings.betaLine}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">{settings.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight">
              <span className="text-gray-900 tracking-tight">{settings.heroTitle}</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-xl leading-relaxed font-medium">
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#projects"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                <Terminal className="w-5 h-5" />
                Projeleri Gör
              </a>
              <a
                href="#about"
                className="px-8 py-4 bg-white border border-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-orange-500" />
                Hakkımda
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Vibrant shadow backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-orange-400 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
              <div className="absolute inset-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl flex flex-col p-6 font-mono text-sm overflow-hidden">
                {/* Minimal Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-gray-500 text-xs">proje-akademi.config.ts</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-pink-400">const</span> <span className="text-blue-400">platform</span> <span className="text-gray-300">= {'{'}</span></div>
                  <div className="pl-4"><span className="text-teal-300">name</span><span className="text-gray-300">:</span> <span className="text-amber-300">'{settings.brandName}'</span><span className="text-gray-300">,</span></div>
                  <div className="pl-4"><span className="text-teal-300">features</span><span className="text-gray-300">: [</span></div>
                  <div className="pl-8 flex items-center gap-2"><span className="text-amber-300">'🚀 İnovasyon'</span><span className="text-gray-300">,</span></div>
                  <div className="pl-8 flex items-center gap-2"><span className="text-amber-300">'💻 Kodlama'</span><span className="text-gray-300">,</span></div>
                  <div className="pl-8 flex items-center gap-2"><span className="text-amber-300">'🤝 Topluluk'</span><span className="text-gray-300">,</span></div>
                  <div className="pl-8 flex items-center gap-2"><span className="text-amber-300">'🎓 Akademi'</span></div>
                  <div className="pl-4"><span className="text-gray-300">],</span></div>
                  <div className="pl-4"><span className="text-teal-300">author</span><span className="text-gray-300">:</span> <span className="text-amber-300">'{settings.footerNote}'</span><span className="text-gray-300">,</span></div>
                  <div className="pl-4"><span className="text-teal-300">status</span><span className="text-gray-300">:</span> <span className="text-green-400">'ONLINE'</span></div>
                  <div><span className="text-gray-300">{'}'}</span></div>
                  <div className="mt-4">
                    <span className="text-pink-400">export default</span> <span className="text-blue-400">platform</span><span className="text-gray-400">;</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-gray-500">~</span>
                    <span className="text-green-400 animate-pulse">█</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Aşağı Kaydır</span>
          <ArrowDown className="w-5 h-5 animate-bounce text-orange-500" />
        </div>
      </div>
    </section>
  );
}
