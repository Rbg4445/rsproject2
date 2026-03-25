import { Award, BookOpen, Code2, Users } from 'lucide-react';

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
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Visual */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Background circles */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl rotate-6 scale-95" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/30">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <div className="text-7xl mb-4">👨‍💻</div>
                  <h3 className="text-2xl font-bold mb-2">Merhaba!</h3>
                  <p className="text-center text-indigo-100 text-sm leading-relaxed">
                    Yazılım geliştirici, eğitmen ve araştırmacı olarak projelerimle sizlerle buluşuyorum.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                    <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-xl font-bold">5+</div>
                      <div className="text-xs text-indigo-200">Yıl Deneyim</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-xl font-bold">50+</div>
                      <div className="text-xs text-indigo-200">Proje</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-xl font-bold">1.2K</div>
                      <div className="text-xs text-indigo-200">Öğrenci</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-4">
                🧑‍💻 Hakkımda
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-4">
                Kod Yazıyorum,{' '}
                <span className="gradient-text">Öğretiyorum</span>
                <br />& Araştırıyorum
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                Yazılım dünyasına olan tutkumla projeler geliştiriyor, eğitim içerikleri oluşturuyor 
                ve akademik araştırmalar yürütüyorum. Modern teknolojilerle yenilikçi çözümler 
                üretmeyi ve bu bilgiyi başkalarıyla paylaşmayı seviyorum.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="group p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
