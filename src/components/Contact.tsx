import { useState } from 'react';
import { Send, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedInIcon, YoutubeIcon } from './icons';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const socials = [
    { icon: <GithubIcon className="w-5 h-5" />, label: 'GitHub', href: '#', color: 'hover:bg-gray-700 hover:text-white' },
    { icon: <TwitterIcon className="w-5 h-5" />, label: 'Twitter', href: '#', color: 'hover:bg-sky-500 hover:text-white' },
    { icon: <LinkedInIcon className="w-5 h-5" />, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-600 hover:text-white' },
    { icon: <YoutubeIcon className="w-5 h-5" />, label: 'YouTube', href: '#', color: 'hover:bg-red-600 hover:text-white' },
  ];

  return (
    <section id="contact" className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            İletişim
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Benimle <span className="gradient-text">İletişime Geç</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Proje işbirlikleri, sorular veya sadece merhaba demek için ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              {[
                { icon: <Mail className="w-5 h-5" />, label: 'E-posta', value: 'samo@projeakademi.com' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Konum', value: 'İstanbul, Türkiye' },
                { icon: <Phone className="w-5 h-5" />, label: 'Telefon', value: '+90 (555) 000 0000' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">{item.label}</p>
                    <p className="text-white/80 font-semibold text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="text-white/50 text-sm font-medium mb-3">Sosyal Medya</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className={`w-11 h-11 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center text-white/50 transition-all duration-200 ${s.color}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitted && (
              <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium text-center">
                ✅ Mesajınız gönderildi! En kısa sürede döneceğim.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Adınız"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Konu</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Mesajınızın konusu"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Mesaj</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Mesajınızı yazın..."
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Mesaj Gönder
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
