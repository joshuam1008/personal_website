import { useContext } from 'react';
import { termContext } from '../termContext';

const VALID_APPS = ['about', 'projects', 'blog', 'skills', 'contact'];

const Open = () => {
  const { arg, rerender, openWindow } = useContext(termContext);

  // Trigger the open on rerender (when this command was just submitted)
  if (rerender && arg.length > 0) {
    const appName = arg[0].toLowerCase();
    if (VALID_APPS.includes(appName) && openWindow) {
      openWindow(appName);
    }
  }

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
  if (!VALID_APPS.includes(appName)) {
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
