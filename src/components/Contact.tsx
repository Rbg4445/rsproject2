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
    { icon: <GithubIcon className="w-5 h-5" />, label: 'GitHub', href: '#', color: 'hover:bg-slate-800 hover:text-white' },
    { icon: <TwitterIcon className="w-5 h-5" />, label: 'Twitter', href: '#', color: 'hover:bg-sky-500 hover:text-white' },
    { icon: <LinkedInIcon className="w-5 h-5" />, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-600 hover:text-white' },
    { icon: <YoutubeIcon className="w-5 h-5" />, label: 'YouTube', href: '#', color: 'hover:bg-red-600 hover:text-white' },
  ];

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
            <MessageCircle className="w-4 h-4" />
            İletişim
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            Benimle <span className="gradient-text">İletişime Geçin</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Projeleriniz, iş birlikleri veya sorularınız için benimle iletişime geçebilirsiniz
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">E-posta</h4>
                  <p className="text-sm text-slate-500 mt-0.5">info@projeakademi.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Konum</h4>
                  <p className="text-sm text-slate-500 mt-0.5">İstanbul, Türkiye</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Telefon</h4>
                  <p className="text-sm text-slate-500 mt-0.5">+90 (555) 123 45 67</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Sosyal Medya</h4>
              <div className="flex gap-2">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 transition-all ${social.color}`}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adınız</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    placeholder="Adınızı yazın"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konu</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mesaj</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
              >
                {submitted ? (
                  <>✅ Mesajınız Gönderildi!</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Mesaj Gönder
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
