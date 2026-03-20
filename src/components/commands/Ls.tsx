import { useContext } from 'react';
import { termContext } from '../termContext';
import { resolvePath, normalizePath, getNode } from '../../lib/filesystem';

const Ls = () => {
  const { arg, currentPath = '/home/visitor', filesystem } = useContext(termContext);

  if (!filesystem) return <div className="term-dim">(no filesystem)</div>;

  const targetRaw = arg[0] ?? currentPath;
  const targetPath = normalizePath(resolvePath(targetRaw, currentPath));
  const node = getNode(filesystem, targetPath);

  if (!node) {
    return (
      <div className="term-error">
        ls: <strong>{arg[0] ?? '.'}</strong>: no such file or directory
      </div>
    );
  }

  if (node.type === 'file') {
    return <div className="term-dim">{arg[0]}</div>;
  }

  const entries = Object.entries(node.children ?? {});
  if (entries.length === 0) return <div className="term-dim">(empty)</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 1.5rem' }}>
      {entries.map(([name, child]) => (
        <span
          key={name}
          style={{
            color: child.type === 'dir' ? 'var(--accent)' : 'var(--text)',
          }}
        >
          {name}
          {child.type === 'dir' ? '/' : ''}
        </span>
      ))}
    </div>
  );
};

export default Ls;
