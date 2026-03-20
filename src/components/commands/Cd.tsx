import { useContext } from 'react';
import { termContext } from '../termContext';
import { resolvePath, normalizePath, getNode, formatPath } from '../../lib/filesystem';

const Cd = () => {
  const {
    arg,
    rerender,
    currentPath = '/home/visitor',
    setCurrentPath,
    filesystem,
  } = useContext(termContext);

  const target = arg[0] ?? '~';
  const resolved = normalizePath(resolvePath(target, currentPath));

  if (!filesystem) return null;

  const node = getNode(filesystem, resolved);

  if (!node || node.type !== 'dir') {
    return (
      <div className="term-error">
        cd: <strong>{target}</strong>: no such directory
      </div>
    );
  }

  // Side effect: update current path on the render that submitted this command
  if (rerender && setCurrentPath) {
    setCurrentPath(resolved);
  }

  return (
    <div className="term-dim" style={{ fontSize: '0.85em' }}>
      → {formatPath(resolved)}
    </div>
  );
};

export default Cd;
