import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { skills } from '../data/projects';

function SkillBar({ name, level, color, animate }: { name: string; level: number; color: string; animate: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{name}</span>
        <span className="text-sm font-bold text-indigo-600">{level}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
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
  { name: 'Git', emoji: '📦' },
  { name: 'AWS', emoji: '☁️' },
  { name: 'Figma', emoji: '🎯' },
];

export default function Skills() {
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="py-24 bg-gradient-to-b from-slate-50 to-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
            <Zap className="w-4 h-4" />
            Yetenekler
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            Teknik <span className="gradient-text">Yeteneklerim</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Sürekli öğrenme ve gelişim ile edindiğim teknik beceriler
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skill Bars */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              📊 Yetkinlik Seviyeleri
            </h3>
            {skills.map((skill) => (
              <SkillBar key={skill.name} {...skill} animate={animate} />
            ))}
          </div>

          {/* Tech Stack Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              🛠️ Teknoloji Yığını
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 cursor-default"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">{tech.emoji}</span>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Fun stats */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <h4 className="font-bold text-lg mb-4">📈 Kod İstatistikleri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-extrabold">12K+</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Commit</div>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-extrabold">500+</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Pull Request</div>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-extrabold">80+</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Repository</div>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-2xl font-extrabold">200+</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Saat Eğitim</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
