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
  { key: 'all', label: 'Tümü', emoji: 'https://cdn-icons-png.flaticon.com/128/1828/1828884.png' },
  { key: 'egitim', label: 'Eğitim', emoji: 'https://cdn-icons-png.flaticon.com/128/2436/2436874.png' },
  { key: 'kodlama', label: 'Kodlama', emoji: 'https://cdn-icons-png.flaticon.com/128/1006/1006363.png' },
  { key: 'akademi', label: 'Akademi', emoji: 'https://cdn-icons-png.flaticon.com/128/3135/3135755.png' },
  { key: 'tasarim', label: 'Tasarım', emoji: 'https://cdn-icons-png.flaticon.com/128/906/906175.png' },
];

export const projects: Project[] = [];

export interface Stat {
  label: string;
  value: string;
  icon: string;
}

export const stats: Stat[] = [
  { label: 'Proje', value: '50+', icon: 'https://cdn-icons-png.flaticon.com/128/2921/2921222.png' },
  { label: 'Eğitim Saati', value: '200+', icon: 'https://cdn-icons-png.flaticon.com/128/2784/2784459.png' },
  { label: 'Öğrenci', value: '1.2K', icon: 'https://cdn-icons-png.flaticon.com/128/1995/1995574.png' },
  { label: 'Teknoloji', value: '30+', icon: 'https://cdn-icons-png.flaticon.com/128/1055/1055687.png' },
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
