import { useContext } from 'react';
import { WindowManagerContext } from './WindowManager';

export function BottomTaskbar() {
  const wmContext = useContext(WindowManagerContext);
  if (!wmContext) throw new Error('BottomTaskbar must be used within WindowManagerProvider');

  const { windows, openWindow, focusWindow } = wmContext;

  const openWindows = Array.from(windows.values()).filter((w) => w.isOpen);
  const maxZIndex = Math.max(...openWindows.map((w) => w.zIndex), 0);

  return (
    <footer className="os-taskbar-bottom">
      <div className="task-left">
        <div className="os-taskbar-apps">
          {openWindows.map((w) => {
            const isFocused = w.zIndex === maxZIndex && !w.isMinimized;
            return (
              <button
                key={w.id}
                className={`os-taskbar-btn ${isFocused ? 'active' : ''}`}
                onClick={() => {
                  if (w.isMinimized) {
                    openWindow(w.id);
                  } else {
                    focusWindow(w.id);
                  }
                }}
                type="button"
              >
                {w.title.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
      <div className="task-right">
        <span className="tray-label">SYSTEM RUNNING</span>
      </div>
    </footer>
  );
}
