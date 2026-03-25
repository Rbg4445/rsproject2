import { Code2, GraduationCap, Heart } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedInIcon, YoutubeIcon } from './icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Sayfalar',
      links: [
        { label: 'Ana Sayfa', href: '#hero' },
        { label: 'Projeler', href: '#projects' },
        { label: 'Hakkımda', href: '#about' },
        { label: 'Yetenekler', href: '#skills' },
        { label: 'İletişim', href: '#contact' },
      ],
    },
    {
      title: 'Kategoriler',
      links: [
        { label: '📚 Eğitim', href: '#projects' },
        { label: '💻 Kodlama', href: '#projects' },
        { label: '🎓 Akademi', href: '#projects' },
        { label: '🎨 Tasarım', href: '#projects' },
      ],
    },
    {
      title: 'Kaynaklar',
      links: [
        { label: 'Blog', href: '#' },
        { label: 'Eğitim Videoları', href: '#' },
        { label: 'Açık Kaynak', href: '#' },
        { label: 'SSS', href: '#' },
      ],
    },
  ];

  const socials = [
    { icon: <GithubIcon className="w-5 h-5" />, href: '#' },
    { icon: <TwitterIcon className="w-5 h-5" />, href: '#' },
    { icon: <LinkedInIcon className="w-5 h-5" />, href: '#' },
    { icon: <YoutubeIcon className="w-5 h-5" />, href: '#' },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#hero" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <GraduationCap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">ProjeAkademi</span>
                <span className="block text-[10px] text-slate-400 -mt-1 font-medium">
                  Eğitim & Kodlama
                </span>
              </div>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Eğitim, akademi ve kodlama alanlarındaki projelerimi paylaştığım platform. 
              Bilgiyi paylaşarak büyüyoruz.
            </p>
            <div className="flex gap-2">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} ProjeAkademi. Tüm hakları saklıdır.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  );
}
