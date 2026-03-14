import React, { useContext, useEffect } from 'react';
import { termContext } from '../termContext';

/**
 * Clear command — triggers the terminal to clear its history.
 * The actual clearing is handled by the terminal's clearHistory callback,
 * which is called via this component's useEffect on mount.
 * The component renders nothing visible.
 */
const Clear: React.FC = () => {
  const { clearHistory } = useContext(termContext);

  useEffect(() => {
    clearHistory?.();
  }, []);

  return null;
};

export default Clear;
