import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingShape {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const COLORS = [
  'rgba(99, 102, 241,',   // indigo
  'rgba(139, 92, 246,',   // violet
  'rgba(168, 85, 247,',   // purple
  'rgba(236, 72, 153,',   // pink
  'rgba(59, 130, 246,',   // blue
  'rgba(6, 182, 212,',    // cyan
];

export default function MouseTrailBackground() {
  const canvasRef = useRef(null as HTMLCanvasElement | null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([] as Particle[]);
  const floatingShapesRef = useRef([] as FloatingShape[]);
  const animationRef = useRef(0 as number);
  const timeRef = useRef(0);

  const initFloatingShapes = useCallback((width: number, height: number) => {
    const shapes: FloatingShape[] = [];
    const count = Math.floor((width * height) / 45000); // Daha seyrek yerleşim

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      shapes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 8 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.05 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }
    return shapes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      floatingShapesRef.current = initFloatingShapes(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Mouse hareket izi parçacıkları - SADECE DAİRE
      const count = Math.min(Math.floor(speed / 8) + 1, 2);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const px = prevMouseRef.current.x + dx * t + (Math.random() - 0.5) * 10;
        const py = prevMouseRef.current.y + dy * t + (Math.random() - 0.5) * 10;
        
        particlesRef.current.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 4 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.4 + 0.1,
          life: 0,
          maxLife: Math.random() * 40 + 20,
        });
      }

      // Parçacık limiti
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      timeRef.current += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Arka plandaki statik/titreyen daireler
      floatingShapesRef.current.forEach((shape) => {
        const dx = mx - shape.baseX;
        const dy = my - shape.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        // Hafif tepki (itme etkisi)
        if (dist < maxDist && mx > 0) {
          const force = (1 - dist / maxDist) * 15;
          shape.x = shape.baseX - (dx / dist) * force;
          shape.y = shape.baseY - (dy / dist) * force;
        } else {
          shape.x += (shape.baseX - shape.x) * 0.05;
          shape.y += (shape.baseY - shape.y) * 0.05;
        }

        const pulse = Math.sin(timeRef.current * shape.pulseSpeed + shape.pulsePhase) * 0.2 + 1;
        const currentSize = shape.size * pulse;
        const currentAlpha = shape.alpha * (mx > 0 && dist < maxDist ? 1.5 : 1);

        ctx.fillStyle = `${shape.color} ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Mouse hareket izi (particles)
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        const ratio = p.life / p.maxLife;
        const fadeOut = 1 - ratio;
        const currentAlpha = p.alpha * fadeOut;
        const currentSize = p.size * fadeOut;

        if (currentAlpha > 0.01) {
          ctx.fillStyle = `${p.color} ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // 3. Basit mouse ışığı (glow)
      if (mx > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mx, my, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initFloatingShapes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
