import { Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, getTheme, themes } from '@config/themes';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme') || 'default';
    setCurrentTheme(saved);
    applyTheme(getTheme(saved));
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(getTheme(themeId));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition hover:border-white/30 hover:text-white"
        aria-label="Select theme"
      >
        <Palette className="h-4 w-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Theme
            </div>
            {(Object.values(themes) as Array<typeof themes[keyof typeof themes]>).map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  currentTheme === theme.id
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
