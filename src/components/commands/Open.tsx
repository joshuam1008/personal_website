import { useContext, useEffect } from 'react';
import { termContext } from '../termContext';
import type { WindowId } from '../WindowManager';

const VALID_APPS: WindowId[] = ['about', 'projects', 'blog', 'skills', 'contact'];

function isValidApp(name: string): name is WindowId {
  return (VALID_APPS as string[]).includes(name);
}

const Open = () => {
  const { arg, rerender, openWindow } = useContext(termContext);

  useEffect(() => {
    if (!rerender || arg.length === 0) return;
    const appName = arg[0].toLowerCase();
    if (isValidApp(appName) && openWindow) {
      openWindow(appName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!arg.length) {
    return (
      <div className="term-error">
        usage: <strong>open</strong> &lt;app&gt;
        <div style={{ marginTop: '0.5rem' }}>
          available apps: <span className="term-accent">{VALID_APPS.join(', ')}</span>
        </div>
      </div>
    );
  }

  const appName = arg[0].toLowerCase();
  if (!isValidApp(appName)) {
    return (
      <div className="term-error">
        app not found: <strong>{appName}</strong>
        <div style={{ marginTop: '0.5rem' }}>
          available apps: <span className="term-accent">{VALID_APPS.join(', ')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="term-output">
      <span className="term-accent">→</span> opening <span className="term-accent2">{appName}</span>...
    </div>
  );
};

export default Open;
