import { createContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

export type WindowId =
  | 'terminal'
  | 'about'
  | 'projects'
  | 'blog'
  | 'skills'
  | 'contact';

export type WindowState = {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
};

export type WindowManagerContextValue = {
  windows: Map<WindowId, WindowState>;
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  toggleMaximize: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
};

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

type WindowManagerProviderProps = {
  children: ReactNode;
};

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  const [windows, setWindows] = useState<Map<WindowId, WindowState>>(() => {
    const m = new Map<WindowId, WindowState>();
    const windowIds: WindowId[] = ['terminal', 'about', 'projects', 'blog', 'skills', 'contact'];

    windowIds.forEach((id) => {
      m.set(id, {
        id,
        title: id,
        isOpen: id === 'terminal',
        isMinimized: false,
        isMaximized: false,
        zIndex: id === 'terminal' ? 2 : 0,
      });
    });

    return m;
  });

  const [nextZIndex, setNextZIndex] = useState(3);

  const openWindow = useCallback(
    (id: WindowId) => {
      setWindows((prev) => {
        const updated = new Map(prev);
        const win = updated.get(id);
        if (win) updated.set(id, { ...win, isOpen: true, isMinimized: false, zIndex: nextZIndex });
        return updated;
      });
      setNextZIndex((z) => z + 1);
    },
    [nextZIndex]
  );

  const closeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const updated = new Map(prev);
      const win = updated.get(id);
      if (win) updated.set(id, { ...win, isOpen: false, isMinimized: false, zIndex: 0 });
      return updated;
    });
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const updated = new Map(prev);
      const win = updated.get(id);
      if (win) updated.set(id, { ...win, isMinimized: true });
      return updated;
    });
  }, []);

  const toggleMaximize = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const updated = new Map(prev);
      const win = updated.get(id);
      if (win) updated.set(id, { ...win, isMaximized: !win.isMaximized });
      return updated;
    });
  }, []);

  const focusWindow = useCallback(
    (id: WindowId) => {
      setWindows((prev) => {
        const updated = new Map(prev);
        const win = updated.get(id);
        if (win && win.isOpen) updated.set(id, { ...win, zIndex: nextZIndex });
        return updated;
      });
      setNextZIndex((z) => z + 1);
    },
    [nextZIndex]
  );

  const value: WindowManagerContextValue = {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
  };

  return (
    <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
  );
}
