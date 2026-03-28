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
  shape: ShapeType;
  rotation: number;
  rotationSpeed: number;
}

type ShapeType = 'circle' | 'triangle' | 'square' | 'diamond' | 'ring' | 'cross' | 'hexagon';

interface FloatingShape {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  alpha: number;
  shape: ShapeType;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const COLORS = [
  'rgba(99, 102, 241,',   // indigo
  'rgba(139, 92, 246,',   // violet
  'rgba(168, 85, 247,',   // purple
  'rgba(236, 72, 153,',   // pink
  'rgba(59, 130, 246,',   // blue
  'rgba(14, 165, 233,',   // sky
  'rgba(6, 182, 212,',    // cyan
];

const SHAPES: ShapeType[] = ['circle', 'triangle', 'square', 'diamond', 'ring', 'cross', 'hexagon'];

export default function MouseTrailBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const floatingShapesRef = useRef<FloatingShape[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  const drawShape = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    shape: ShapeType,
    rotation: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.lineWidth = size * 0.3;
        ctx.stroke();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.866, size * 0.5);
        ctx.lineTo(-size * 0.866, size * 0.5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.7, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case 'cross':
        const w = size * 0.3;
        ctx.beginPath();
        ctx.moveTo(-w, -size);
        ctx.lineTo(w, -size);
        ctx.lineTo(w, -w);
        ctx.lineTo(size, -w);
        ctx.lineTo(size, w);
        ctx.lineTo(w, w);
        ctx.lineTo(w, size);
        ctx.lineTo(-w, size);
        ctx.lineTo(-w, w);
        ctx.lineTo(-size, w);
        ctx.lineTo(-size, -w);
        ctx.lineTo(-w, -w);
        ctx.closePath();
        ctx.fill();
        break;

      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const hx = Math.cos(angle) * size;
          const hy = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  const initFloatingShapes = useCallback((width: number, height: number) => {
    const shapes: FloatingShape[] = [];
    const count = Math.floor((width * height) / 25000);

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      shapes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 12 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.08 + 0.02,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
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

      // Spawn trail particles on mouse move
      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Daha hafif performans: üretilen parçacık sayısını azalt
      const count = Math.min(Math.floor(speed / 4) + 1, 3);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const px = prevMouseRef.current.x + dx * t + (Math.random() - 0.5) * 20;
        const py = prevMouseRef.current.y + dy * t + (Math.random() - 0.5) * 20;
        const maxLife = Math.random() * 60 + 40;

        particlesRef.current.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 2 + dx * 0.05,
          vy: (Math.random() - 0.5) * 2 + dy * 0.05,
          size: Math.random() * 6 + 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.6 + 0.3,
          life: 0,
          maxLife,
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
        });
      }

      // Limit particles
      if (particlesRef.current.length > 300) {
        particlesRef.current = particlesRef.current.slice(-300);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // === 1. Draw floating shapes (react to mouse) ===
      floatingShapesRef.current.forEach((shape) => {
        const dx = mx - shape.baseX;
        const dy = my - shape.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 250;

        // Shapes move away from mouse (repel effect)
        if (dist < maxDist && mx > 0) {
          const force = (1 - dist / maxDist) * 40;
          shape.x = shape.baseX - (dx / dist) * force;
          shape.y = shape.baseY - (dy / dist) * force;
        } else {
          shape.x += (shape.baseX - shape.x) * 0.02;
          shape.y += (shape.baseY - shape.y) * 0.02;
        }

        shape.rotation += shape.rotationSpeed;
        const pulse = Math.sin(timeRef.current * shape.pulseSpeed + shape.pulsePhase) * 0.3 + 1;
        const currentSize = shape.size * pulse;

        // Glow near mouse
        let glowAlpha = shape.alpha;
        if (dist < maxDist && mx > 0) {
          glowAlpha = shape.alpha + (1 - dist / maxDist) * 0.15;
        }

        ctx.fillStyle = `${shape.color} ${glowAlpha})`;
        ctx.strokeStyle = `${shape.color} ${glowAlpha})`;
        drawShape(ctx, shape.x, shape.y, currentSize, shape.shape, shape.rotation);
      });

      // === 2. Draw connection lines between nearby floating shapes and mouse ===
      if (mx > 0) {
        floatingShapesRef.current.forEach((shape) => {
          const dx = mx - shape.x;
          const dy = my - shape.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `${shape.color} ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        });
      }

      // === 3. Draw & update trail particles ===
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy += 0.02; // slight gravity
        p.life += 1;
        p.rotation += p.rotationSpeed;

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(p.life / 10, 1);
        const fadeOut = 1 - Math.pow(lifeRatio, 2);
        const currentAlpha = p.alpha * fadeIn * fadeOut;
        const currentSize = p.size * (1 - lifeRatio * 0.5);

        if (currentAlpha > 0.01) {
          ctx.fillStyle = `${p.color} ${currentAlpha})`;
          ctx.strokeStyle = `${p.color} ${currentAlpha})`;
          drawShape(ctx, p.x, p.y, currentSize, p.shape, p.rotation);
        }
      });

      // Remove dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // === 4. Draw mouse glow ===
      if (mx > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.03)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mx, my, 120, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright dot
        const innerGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        innerGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Rotating ring around cursor
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(timeRef.current * 0.02);
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 / 6) * i;
          const rx = Math.cos(angle) * 30;
          const ry = Math.sin(angle) * 30;
          ctx.fillStyle = `${COLORS[i % COLORS.length]} 0.15)`;
          ctx.beginPath();
          ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Second rotating ring (opposite direction)
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-timeRef.current * 0.015);
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const rx = Math.cos(angle) * 55;
          const ry = Math.sin(angle) * 55;
          ctx.fillStyle = `${COLORS[i % COLORS.length]} 0.08)`;
          ctx.beginPath();
          ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // === 5. Connect nearby trail particles ===
      const trailParticles = particlesRef.current;
      for (let i = 0; i < trailParticles.length; i++) {
        for (let j = i + 1; j < trailParticles.length; j++) {
          const dx = trailParticles[i].x - trailParticles[j].x;
          const dy = trailParticles[i].y - trailParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            const lifeI = 1 - trailParticles[i].life / trailParticles[i].maxLife;
            const lifeJ = 1 - trailParticles[j].life / trailParticles[j].maxLife;
            const alpha = (1 - dist / 60) * 0.12 * lifeI * lifeJ;
            ctx.beginPath();
            ctx.strokeStyle = `${trailParticles[i].color} ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(trailParticles[i].x, trailParticles[i].y);
            ctx.lineTo(trailParticles[j].x, trailParticles[j].y);
            ctx.stroke();
          }
        }
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
  }, [drawShape, initFloatingShapes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
