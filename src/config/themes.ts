export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textMuted: string;
    accent: string;
    accentForeground: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  effects?: {
    scanlines?: boolean;
    matrixRain?: boolean;
    crtCurvature?: boolean;
    neonGlow?: boolean;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Dark Glassmorphism',
    colors: {
      background: '#0b1120',
      surface: '#111827',
      card: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#cbd5e1',
      accent: '#6366f1',
      accentForeground: '#f9fafc',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    fonts: {
      sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
  },
  terminal: {
    id: 'terminal',
    name: 'Matrix Terminal',
    colors: {
      background: '#000000',
      surface: '#001a00',
      card: '#002200',
      text: '#00ff41',
      textMuted: '#00cc33',
      accent: '#00ff41',
      accentForeground: '#000000',
      border: '#00ff41',
    },
    fonts: {
      sans: '"JetBrains Mono", "Courier New", monospace',
      mono: '"JetBrains Mono", "Courier New", monospace',
    },
    effects: {
      scanlines: true,
      matrixRain: true,
      crtCurvature: false,
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    colors: {
      background: '#0a0015',
      surface: '#1a0033',
      card: '#2d004d',
      text: '#ff00ff',
      textMuted: '#ff69f9',
      accent: '#00ffff',
      accentForeground: '#0a0015',
      border: 'rgba(255, 0, 255, 0.3)',
    },
    fonts: {
      sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    effects: {
      neonGlow: true,
    },
  },
  light: {
    id: 'light',
    name: 'Minimal Light',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#f1f5f9',
      text: '#0f172a',
      textMuted: '#64748b',
      accent: '#6366f1',
      accentForeground: '#ffffff',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    fonts: {
      sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      surface: '#383a59',
      card: '#44475a',
      text: '#f8f8f2',
      textMuted: '#9ca3af',
      accent: '#bd93f9',
      accentForeground: '#282a36',
      border: 'rgba(189, 147, 249, 0.2)',
    },
    fonts: {
      sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    colors: {
      background: '#2e3440',
      surface: '#3b4252',
      card: '#434c5e',
      text: '#eceff4',
      textMuted: '#d8dee9',
      accent: '#88c0d0',
      accentForeground: '#2e3440',
      border: 'rgba(136, 192, 208, 0.2)',
    },
    fonts: {
      sans: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
  },
};

export function getTheme(id: string): Theme {
  return themes[id] || themes.default;
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply color variables
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-card', theme.colors.card);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-accent-foreground', theme.colors.accentForeground);
  root.style.setProperty('--color-border', theme.colors.border);

  // Apply font variables
  root.style.setProperty('--font-sans', theme.fonts.sans);
  root.style.setProperty('--font-mono', theme.fonts.mono);

  // Set theme data attribute
  root.setAttribute('data-theme', theme.id);

  // Store preference
  localStorage.setItem('theme', theme.id);
}
