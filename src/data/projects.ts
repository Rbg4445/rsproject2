export type ProjectCategory = 'all' | 'egitim' | 'kodlama' | 'akademi' | 'tasarim';

export interface Project {
  id: number;
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  image: string;
  date: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  duration: string;
  github?: string;
  demo?: string;
  featured?: boolean;
}

export const categories: { key: ProjectCategory; label: string; emoji: string }[] = [
  { key: 'all', label: 'Tümü', emoji: '🌟' },
  { key: 'egitim', label: 'Eğitim', emoji: '📚' },
  { key: 'kodlama', label: 'Kodlama', emoji: '💻' },
  { key: 'akademi', label: 'Akademi', emoji: '🎓' },
  { key: 'tasarim', label: 'Tasarım', emoji: '🎨' },
];

export const projects: Project[] = [
  {
    id: 1,
    title: 'React ile E-Ticaret Uygulaması',
    description: 'Modern React, TypeScript ve Tailwind CSS kullanarak sıfırdan bir e-ticaret platformu geliştirme. Sepet yönetimi, ödeme entegrasyonu ve kullanıcı paneli içerir.',
    category: 'kodlama',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    date: '2025-03-15',
    difficulty: 'İleri',
    duration: '8 hafta',
    github: '#',
    demo: '#',
    featured: true,
  },
  {
    id: 2,
    title: 'Python ile Veri Bilimi Eğitimi',
    description: 'Pandas, NumPy ve Matplotlib kütüphaneleri ile veri analizi temelleri. Gerçek dünya veri setleri üzerinde uygulamalı çalışmalar.',
    category: 'egitim',
    tags: ['Python', 'Pandas', 'NumPy', 'Veri Bilimi'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    date: '2025-02-20',
    difficulty: 'Orta',
    duration: '6 hafta',
    github: '#',
    featured: true,
  },
  {
    id: 3,
    title: 'Makine Öğrenmesi Araştırma Projesi',
    description: 'Doğal dil işleme tekniklerini kullanarak Türkçe metin sınıflandırma modeli geliştirme. Akademik makale ve uygulama.',
    category: 'akademi',
    tags: ['Machine Learning', 'NLP', 'TensorFlow', 'Akademik'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    date: '2025-01-10',
    difficulty: 'İleri',
    duration: '12 hafta',
    github: '#',
    demo: '#',
    featured: true,
  },
  {
    id: 4,
    title: 'UI/UX Tasarım Rehberi',
    description: 'Figma ile mobil uygulama tasarımı. Kullanıcı deneyimi prensipleri, wireframe oluşturma ve prototipleme teknikleri.',
    category: 'tasarim',
    tags: ['Figma', 'UI/UX', 'Prototip', 'Mobil'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    date: '2025-04-05',
    difficulty: 'Başlangıç',
    duration: '4 hafta',
    demo: '#',
  },
  {
    id: 5,
    title: 'Node.js ile REST API Geliştirme',
    description: 'Express.js ve MongoDB kullanarak ölçeklenebilir RESTful API tasarımı. JWT authentication, rate limiting ve API dokümantasyonu.',
    category: 'kodlama',
    tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop',
    date: '2025-03-01',
    difficulty: 'Orta',
    duration: '5 hafta',
    github: '#',
    demo: '#',
  },
  {
    id: 6,
    title: 'JavaScript Temelleri Eğitim Serisi',
    description: 'Sıfırdan ileri seviyeye JavaScript öğrenme yolculuğu. ES6+, async/await, DOM manipülasyonu ve modern JS patterns.',
    category: 'egitim',
    tags: ['JavaScript', 'ES6+', 'Web', 'Başlangıç'],
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&h=400&fit=crop',
    date: '2025-01-25',
    difficulty: 'Başlangıç',
    duration: '10 hafta',
    github: '#',
  },
  {
    id: 7,
    title: 'Siber Güvenlik Akademik Çalışma',
    description: 'Web uygulama güvenliği üzerine kapsamlı araştırma. OWASP Top 10, penetrasyon testi ve güvenlik denetim raporu.',
    category: 'akademi',
    tags: ['Güvenlik', 'OWASP', 'Pentest', 'Araştırma'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
    date: '2024-12-15',
    difficulty: 'İleri',
    duration: '8 hafta',
    github: '#',
  },
  {
    id: 8,
    title: 'Responsive Web Tasarım Atölyesi',
    description: 'CSS Grid, Flexbox ve modern CSS teknikleri ile responsive web sayfaları oluşturma. Animasyonlar ve mikro-etkileşimler.',
    category: 'tasarim',
    tags: ['CSS', 'Responsive', 'Animasyon', 'Grid'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    date: '2025-02-10',
    difficulty: 'Orta',
    duration: '3 hafta',
    demo: '#',
  },
  {
    id: 9,
    title: 'Flutter ile Mobil Uygulama',
    description: 'Cross-platform mobil uygulama geliştirme. Dart programlama, state management ve Firebase entegrasyonu.',
    category: 'kodlama',
    tags: ['Flutter', 'Dart', 'Firebase', 'Mobil'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
    date: '2025-04-20',
    difficulty: 'Orta',
    duration: '7 hafta',
    github: '#',
    demo: '#',
  },
  {
    id: 10,
    title: 'Docker & DevOps Eğitimi',
    description: 'Konteynerizasyon, CI/CD pipeline kurulumu ve bulut dağıtım süreçleri. GitHub Actions ve AWS entegrasyonu.',
    category: 'egitim',
    tags: ['Docker', 'DevOps', 'CI/CD', 'AWS'],
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&h=400&fit=crop',
    date: '2025-03-25',
    difficulty: 'İleri',
    duration: '6 hafta',
    github: '#',
  },
  {
    id: 11,
    title: 'Blockchain Teknolojileri Araştırması',
    description: 'Akıllı kontrat geliştirme ve DeFi protokolleri üzerine akademik çalışma. Solidity ile örnek uygulamalar.',
    category: 'akademi',
    tags: ['Blockchain', 'Solidity', 'Smart Contract', 'DeFi'],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop',
    date: '2025-01-05',
    difficulty: 'İleri',
    duration: '10 hafta',
    github: '#',
    demo: '#',
  },
  {
    id: 12,
    title: 'Marka Kimliği Tasarım Projesi',
    description: 'Startup şirketler için logo tasarımı, renk paleti oluşturma ve marka rehberi hazırlama süreci.',
    category: 'tasarim',
    tags: ['Logo', 'Branding', 'İllüstrasyon', 'Renk Teorisi'],
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop',
    date: '2025-04-10',
    difficulty: 'Başlangıç',
    duration: '3 hafta',
    demo: '#',
  },
];

export interface Stat {
  label: string;
  value: string;
  icon: string;
}

export const stats: Stat[] = [
  { label: 'Proje', value: '50+', icon: '📁' },
  { label: 'Eğitim Saati', value: '200+', icon: '⏱️' },
  { label: 'Öğrenci', value: '1.2K', icon: '👨‍🎓' },
  { label: 'Teknoloji', value: '30+', icon: '⚡' },
];

export interface Skill {
  name: string;
  level: number;
  color: string;
}

export const skills: Skill[] = [
  { name: 'React / Next.js', level: 95, color: 'from-cyan-400 to-blue-500' },
  { name: 'TypeScript', level: 90, color: 'from-blue-400 to-indigo-500' },
  { name: 'Python', level: 85, color: 'from-green-400 to-emerald-500' },
  { name: 'Node.js', level: 88, color: 'from-lime-400 to-green-500' },
  { name: 'UI/UX Tasarım', level: 80, color: 'from-pink-400 to-rose-500' },
  { name: 'DevOps / Docker', level: 75, color: 'from-purple-400 to-violet-500' },
];
