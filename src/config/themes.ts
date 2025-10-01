export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string; // Hex format
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
      border: '#ffffff',
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
};

export function getTheme(id: string): Theme {
  return themes[id] || themes.default;
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Only apply CSS variables for terminal theme
  // Default theme uses compiled Tailwind colors
  if (theme.id === 'terminal') {
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-card', theme.colors.card);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-accent-foreground', theme.colors.accentForeground);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--font-sans', theme.fonts.sans);
    root.style.setProperty('--font-mono', theme.fonts.mono);
  }

  // Set theme data attribute for Terminal-specific CSS
  root.setAttribute('data-theme', theme.id);

  // Store preference
  localStorage.setItem('theme', theme.id);
}
