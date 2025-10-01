import { getAnimationConfig } from '@config/animations';

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';

export function initMatrixRain() {
  if (typeof window === 'undefined') return;

  let isEnabled = getAnimationConfig().enableMatrixRain;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let columns: MatrixColumn[] = [];
  let animationFrame: number | null = null;
  let fontSize = 14;
  let columnCount = 0;

  const createCanvas = () => {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.3';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columnCount = Math.floor(canvas.width / fontSize);
      initColumns();
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
    columns = [];
  };

  const initColumns = () => {
    columns = [];
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        x: i * fontSize,
        y: Math.random() * -500,
        speed: Math.random() * 0.5 + 0.3,
        chars: Array(20)
          .fill(null)
          .map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
      });
    }
  };

  const drawMatrix = () => {
    if (!ctx || !canvas) return;

    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = `${fontSize}px monospace`;

    columns.forEach((col) => {
      col.chars.forEach((char, i) => {
        const y = col.y + i * fontSize;
        if (canvas && y > 0 && y < canvas.height) {
          ctx!.fillText(char, col.x, y);
        }
      });

      col.y += col.speed;

      if (canvas && col.y > canvas.height + col.chars.length * fontSize) {
        col.y = Math.random() * -500;
        col.speed = Math.random() * 0.5 + 0.3;
        col.chars = Array(20)
          .fill(null)
          .map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
      }

      // Randomly change some characters
      if (Math.random() > 0.95) {
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      }
    });
  };

  const animate = () => {
    if (!isEnabled || !isTerminalTheme()) return;

    drawMatrix();
    animationFrame = requestAnimationFrame(animate);
  };

  const isTerminalTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'terminal';
  };

  const handleConfigChange = (e: CustomEvent) => {
    isEnabled = e.detail.enableMatrixRain;

    if (isEnabled && isTerminalTheme()) {
      createCanvas();
      animate();
    } else {
      destroyCanvas();
    }
  };

  const handleThemeChange = () => {
    if (isEnabled && isTerminalTheme()) {
      createCanvas();
      animate();
    } else {
      destroyCanvas();
    }
  };

  // Initialize
  if (isEnabled && isTerminalTheme()) {
    createCanvas();
    animate();
  }

  window.addEventListener('animation-config-changed', handleConfigChange as EventListener);

  // Listen for theme changes (check periodically)
  setInterval(handleThemeChange, 500);
}
