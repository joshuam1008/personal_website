import { useContext } from 'react';
import { termContext } from '../termContext';
import { resolvePath, normalizePath, getNode } from '../../lib/filesystem';

const Cat = () => {
  const { arg, currentPath = '/home/visitor', filesystem } = useContext(termContext);

  if (!filesystem) return <div className="term-dim">(no filesystem)</div>;

  if (!arg[0]) {
    return (
      <div className="term-error">
        usage: <strong>cat</strong> &lt;file&gt;
      </div>
    );
  }

  const targetPath = normalizePath(resolvePath(arg[0], currentPath));
  const node = getNode(filesystem, targetPath);

  if (!node) {
    return (
      <div className="term-error">
        cat: <strong>{arg[0]}</strong>: no such file or directory
      </div>
    );
  }

  if (node.type === 'dir') {
    return (
      <div className="term-error">
        cat: <strong>{arg[0]}</strong>: is a directory
      </div>
    );
  }

  return (
    <div>
      {(node.content ?? '').split('\n').map((line, i) => (
        <div key={i} className="term-dim" style={{ minHeight: '1.2em' }}>
          {line || '\u00a0'}
        </div>
      ))}
    </div>
  );
};

export default Cat;
