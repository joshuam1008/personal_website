import { useContext, useEffect } from 'react';
import { termContext } from '../termContext';
import { resolvePath, normalizePath, getNode, formatPath } from '../../lib/filesystem';

const Cd = () => {
  const {
    arg,
    currentPath = '/home/visitor',
    setCurrentPath,
    filesystem,
  } = useContext(termContext);

  const target = arg[0] ?? '~';
  const resolved = normalizePath(resolvePath(target, currentPath));

  if (!filesystem) return null;

  const node = getNode(filesystem, resolved);
  const isValid = !!(node && node.type === 'dir');

  // setCurrentPath is only provided for the latest entry, so this only fires once.
  useEffect(() => {
    if (isValid && setCurrentPath) {
      setCurrentPath(resolved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isValid) {
    return (
      <div className="term-error">
        cd: <strong>{target}</strong>: no such directory
      </div>
    );
  }

  return (
    <div className="term-dim" style={{ fontSize: '0.85em' }}>
      → {formatPath(resolved)}
    </div>
  );
};

export default Cd;
