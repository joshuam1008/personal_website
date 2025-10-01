import { getAnimationConfig } from '@config/animations';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function initCursorTrail() {
  if (typeof window === 'undefined') return;

  let isEnabled = getAnimationConfig().enableCursorTrail;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let particles: Particle[] = [];
  let animationFrame: number | null = null;

  const createCanvas = () => {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
  };

  const destroyCanvas = () => {
    if (canvas) {
      canvas.remove();
      canvas = null;
      ctx = null;
    }
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    particles = [];
  };

  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.2;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: Math.random() * 30 + 20,
      size: Math.random() * 3 + 1,
    };
  };

  const updateParticles = () => {
    particles = particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1 / p.maxLife;
      return p.life > 0;
    });
  };

  const drawParticles = () => {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx!.save();
      ctx!.globalAlpha = p.life;
      ctx!.fillStyle = 'rgba(99, 102, 241, 0.8)';
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    });
  };

  const animate = () => {
    if (!isEnabled) return;

    updateParticles();
    drawParticles();
    animationFrame = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isEnabled) return;

    // Create 2-3 particles per mouse move
    for (let i = 0; i < 2; i++) {
      particles.push(createParticle(e.clientX, e.clientY));
    }
  };

  const handleConfigChange = (e: CustomEvent) => {
    isEnabled = e.detail.enableCursorTrail;

    if (isEnabled) {
      createCanvas();
      animate();
    } else {
      destroyCanvas();
    }
  };

  // Initialize
  if (isEnabled) {
    createCanvas();
    animate();
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('animation-config-changed', handleConfigChange as EventListener);
}
