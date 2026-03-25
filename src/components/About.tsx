import { Award, BookOpen, Code2, Users } from 'lucide-react';
import { useSiteSettings } from '../store/SiteSettingsContext';

const highlights = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Full-Stack Geliştirici',
    desc: 'React, Node.js, Python ve modern web teknolojileriyle uygulama geliştirme.',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Eğitim İçerik Üretici',
    desc: 'Türkçe yazılım eğitimleri, blog yazıları ve video içerikler hazırlama.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Akademik Araştırmacı',
    desc: 'Yapay zeka ve veri bilimi alanlarında akademik projeler ve yayınlar.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Topluluk Lideri',
    desc: 'Açık kaynak projelere katkı ve yazılım toplulukları yönetimi.',
  },
];

export default function About() {
  const { settings } = useSiteSettings();

  return (
    <section id="about" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-900/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-900/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Profile Visual */}
          <div className="relative">
            <div className="relative w-72 h-72 mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-6 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl -rotate-3 opacity-10" />
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                  alt="profil"
                  className="h-28 w-28 rounded-2xl"
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-indigo-500/30">
                Full-Stack
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-purple-500/30">
                Eğitimci
              </div>
              <div className="absolute top-1/2 -right-8 bg-pink-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-pink-500/30">
                Araştırmacı
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
                Hakkımda
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                <span className="gradient-text">{settings.aboutTitle}</span>
              </h2>
              <p className="text-white/60 leading-relaxed">
                {settings.aboutDescription}
              </p>
            </div>

            {/* Highlights */}
            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl bg-gray-800/50 border border-white/5 hover:border-indigo-500/30 hover:bg-gray-800 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
