import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { skills } from '../data/projects';

function SkillBar({ name, level, color, animate }: { name: string; level: number; color: string; animate: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">{name}</span>
        <span className="text-sm font-bold text-indigo-400">{level}%</span>
      </div>
      <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: animate ? `${level}%` : '0%' }}
        />
      </div>
    </div>
  );
}

const techStack = [
  { name: 'React', emoji: '⚛️' },
  { name: 'TypeScript', emoji: '🔷' },
  { name: 'Python', emoji: '🐍' },
  { name: 'Node.js', emoji: '🟢' },
  { name: 'Next.js', emoji: '▲' },
  { name: 'Tailwind', emoji: '🎨' },
  { name: 'Docker', emoji: '🐳' },
  { name: 'PostgreSQL', emoji: '🐘' },
  { name: 'MongoDB', emoji: '🍃' },
  { name: 'Redis', emoji: '🔴' },
  { name: 'GraphQL', emoji: '◉' },
  { name: 'AWS', emoji: '☁️' },
];

export default function Skills() {
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Teknoloji Yığını
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Kullandığım <span className="gradient-text">Teknolojiler</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Modern web geliştirme araçları ve teknolojileri ile projeler inşa ediyorum.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Skill Bars */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-6">Yetkinlik Seviyeleri</h3>
            {skills.map((skill) => (
              <SkillBar key={skill.name} {...skill} animate={animate} />
            ))}
          </div>

          {/* Tech Stack Grid */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Teknoloji Yığını</h3>
            <div className="grid grid-cols-3 gap-3">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-800/50 border border-white/5 hover:border-indigo-500/30 hover:bg-gray-800 transition-all duration-300 group cursor-default"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{tech.emoji}</span>
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors">{tech.name}</span>
                </div>
              ))}
            </div>

            {/* Stats card */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl">
                  💻
                </div>
                <div>
                  <p className="font-bold text-white">Kod İstatistikleri</p>
                  <p className="text-xs text-white/50">Toplam aktivite</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">50K+</div>
                  <div className="text-xs text-white/40">Satır Kod</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">200+</div>
                  <div className="text-xs text-white/40">Commit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">15+</div>
                  <div className="text-xs text-white/40">Repo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
