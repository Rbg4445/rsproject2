import { useState } from 'react';
import { CheckCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  code?: string;
  link?: { text: string; url: string };
}

const steps: Step[] = [
  {
    title: '1. Firebase Console\'a Git',
    description: 'console.firebase.google.com adresine gidin ve Google hesabınızla giriş yapın.',
    link: { text: 'Firebase Console\'u Aç', url: 'https://console.firebase.google.com' },
  },
  {
    title: '2. Yeni Proje Oluştur',
    description: '"Add project" butonuna tıklayın, proje adını girin (örn: projeakademi) ve projeyi oluşturun.',
  },
  {
    title: '3. Web Uygulaması Ekle',
    description: 'Project Overview\'dan "</>" (Web) ikonuna tıklayın, app adını girin ve "Register app"e basın.',
  },
  {
    title: '4. Config Bilgilerini Kopyala',
    description: 'Çıkan firebaseConfig objesindeki değerleri kopyalayın. Bu değerleri .env dosyasına ekleyeceksiniz.',
    code: `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=proje.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projeakademi
VITE_FIREBASE_STORAGE_BUCKET=proje.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123`,
  },
  {
    title: '5. Authentication Etkinleştir',
    description: 'Sol menüden Authentication → Get started → Sign-in method sekmesinden Email/Password ve Google\'ı etkinleştirin.',
  },
  {
    title: '6. Firestore Database Oluştur',
    description: 'Sol menüden Firestore Database → Create database → "Start in test mode" seçin (production\'da güvenlik kuralları ekleyin).',
  },
  {
    title: '7. Storage Etkinleştir',
    description: 'Sol menüden Storage → Get started → "Start in test mode" seçin.',
  },
  {
    title: '8. .env Dosyası Oluştur',
    description: 'Proje kök dizininde .env dosyası oluşturun ve 4. adımdaki değerleri yapıştırın.',
    code: `# Proje kök dizininde .env dosyası oluşturun:
VITE_FIREBASE_API_KEY=buraya_yapistirin
VITE_FIREBASE_AUTH_DOMAIN=buraya_yapistirin
VITE_FIREBASE_PROJECT_ID=buraya_yapistirin
VITE_FIREBASE_STORAGE_BUCKET=buraya_yapistirin
VITE_FIREBASE_MESSAGING_SENDER_ID=buraya_yapistirin
VITE_FIREBASE_APP_ID=buraya_yapistirin`,
  },
  {
    title: '9. Uygulamayı Yeniden Başlat',
    description: '.env dosyasını oluşturduktan sonra "npm run dev" komutu ile uygulamayı yeniden başlatın.',
    code: 'npm run dev',
  },
];

export default function FirebaseSetupGuide({ onClose }: { onClose: () => void }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [copied, setCopied] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-xl">
              🔥
            </div>
            <div>
              <h2 className="text-white font-bold">Firebase Kurulum Rehberi</h2>
              <p className="text-white/40 text-xs">Gerçek veritabanı için adım adım kurulum</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-blue-300 text-sm">
              💡 <strong>Firebase'i kurmadan önce:</strong> Uygulama şu an demo modunda çalışıyor ve tüm özellikler aktif.
              Firebase kurulumu ile veriler buluta taşınır, gerçek kullanıcı kaydı ve Google ile giriş aktif olur.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-white font-medium text-sm">{step.title}</span>
                  {expandedStep === index ? (
                    <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                  )}
                </button>

                {expandedStep === index && (
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-white/60 text-sm">{step.description}</p>

                    {step.link && (
                      <a
                        href={step.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {step.link.text}
                      </a>
                    )}

                    {step.code && (
                      <div className="relative bg-black/50 rounded-xl overflow-hidden border border-white/5">
                        <button
                          onClick={() => copyCode(step.code!, index)}
                          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white p-1.5 rounded-lg transition-all"
                        >
                          {copied === index ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <pre className="p-4 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">{step.code}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-300 text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Tamamlandı!</strong> .env dosyasını oluşturduktan sonra uygulama otomatik olarak Firebase'e bağlanacak.
                Tüm kayıt, giriş, proje ve blog verileri Firebase'de güvenle saklanacak.
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
