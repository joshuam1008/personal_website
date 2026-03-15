import React, { useContext, useEffect } from 'react';
import { termContext } from '../termContext';
import { applyTheme, THEMES, type ThemeName } from '../../lib/theme';

const Themes: React.FC = () => {
  const { arg, rerender } = useContext(termContext);

  const subCmd = arg[0]?.toLowerCase();
  const themeName = arg[1]?.toLowerCase() as ThemeName | undefined;

  useEffect(() => {
    if (rerender && subCmd === 'set' && themeName) {
      const valid = THEMES.find((t) => t.name === themeName);
      if (valid) applyTheme(themeName);
    }
  }, [rerender]);

  if (subCmd && !['list', 'set'].includes(subCmd)) {
    return (
      <div className="term-error">
        Unknown sub-command: <strong>{subCmd}</strong>
        <div className="term-dim" style={{ marginTop: '0.25rem' }}>
          Usage: <span className="term-accent3">themes</span> | <span className="term-accent3">themes list</span> | <span className="term-accent3">themes set &lt;name&gt;</span>
        </div>
      </div>
    );
  }

  if (subCmd === 'set') {
    const valid = THEMES.find((t) => t.name === themeName);
    if (!valid) {
      return (
        <div className="term-error">
          Unknown theme: <strong>{themeName ?? '(none)'}</strong>
          <div className="term-dim">Available: {THEMES.map((t) => t.name).join(', ')}</div>
        </div>
      );
    }
    return (
      <div>
        Theme set to <span className="term-accent2">{valid.label}</span>.
      </div>
    );
  }

  // Default / "list": show all themes
  const current = (typeof document !== 'undefined')
    ? (document.documentElement.getAttribute('data-theme') ?? 'green')
    : 'green';

  return (
    <div data-testid="themes">
      <p className="term-dim" style={{ marginBottom: '0.5rem' }}>
        Available themes. Use <span className="term-accent3">themes set &lt;name&gt;</span> to switch.
      </p>
      {THEMES.map((t) => (
        <div className="term-list-item" key={t.name}>
          <span className="term-list-num">→</span>
          <div>
            <span
              className="term-theme-swatch"
              style={{ background: t.swatch }}
              aria-hidden="true"
            />
            <span className="term-accent3">{t.name}</span>
            {'  '}
            <span className="term-dim">{t.label}</span>
            {t.name === current && <span className="term-accent" style={{ marginLeft: '0.75rem' }}>← active</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Themes;
