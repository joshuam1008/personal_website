import { useContext, useEffect } from 'react';
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
  const isValid = !!(node && node.type === 'dir');

  // Side effect: update current path after commit, not during render.
  // Calling setCurrentPath during render caused Terminal to re-render with the
  // updated path, which made Cd re-evaluate the relative target against the new
  // currentPath (e.g. "blog" from "/home/visitor/blog" → "/home/visitor/blog/blog"),
  // resulting in a spurious "not found" error on the second render.
  useEffect(() => {
    if (rerender && isValid && setCurrentPath) {
      setCurrentPath(resolved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerender]);

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
