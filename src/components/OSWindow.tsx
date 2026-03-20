import { useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { WindowManagerContext } from './WindowManager';
import type { WindowId } from './WindowManager';

type OSWindowProps = {
  id: WindowId;
  title: string;
  initialWidth: number;
  initialHeight: number;
  initialLeft: number;
  initialTop: number;
  children: ReactNode;
};

function isMobile() {
  return typeof globalThis !== 'undefined' && globalThis.innerWidth <= 640;
}

export function OSWindow({
  id,
  title,
  initialWidth,
  initialHeight,
  initialLeft,
  initialTop,
  children,
}: OSWindowProps) {
  const wmContext = useContext(WindowManagerContext);
  if (!wmContext) throw new Error('OSWindow must be used within WindowManagerProvider');

  const { windows, closeWindow, minimizeWindow, toggleMaximize, focusWindow } = wmContext;

  const win = windows.get(id);
  if (!win) return null;

  const [left, setLeft] = useState(initialLeft);
  const [top, setTop] = useState(initialTop);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const windowRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startLeft: 0, startTop: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, startW: 0, startH: 0 });

  const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.os-window-btn')) return;
    if (win.isMaximized || isMobile()) return;

    isDraggingRef.current = true;
    windowRef.current?.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, startLeft: left, startTop: top };
  };

  const onResizerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.isMaximized || isMobile()) return;
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    windowRef.current?.setPointerCapture(e.pointerId);
    resizeStartRef.current = { x: e.clientX, y: e.clientY, startW: width, startH: height };
  };

  const onWindowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      setLeft(dragStartRef.current.startLeft + (e.clientX - dragStartRef.current.x));
      setTop(dragStartRef.current.startTop + (e.clientY - dragStartRef.current.y));
    }
    if (isResizingRef.current) {
      setWidth(Math.max(280, resizeStartRef.current.startW + (e.clientX - resizeStartRef.current.x)));
      setHeight(Math.max(200, resizeStartRef.current.startH + (e.clientY - resizeStartRef.current.y)));
    }
  };

  const onWindowPointerUp = () => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
  };

  if (!win.isOpen) return null;

  const maxZ = Math.max(...Array.from(windows.values()).map((w) => (w.isOpen ? w.zIndex : 0)));
  const className = [
    'os-window',
    win.isMaximized && 'maximized',
    win.isMinimized && 'minimized',
    win.zIndex === maxZ && 'active',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={windowRef}
      className={className}
      style={{
        left: win.isMaximized ? undefined : `${left}px`,
        top: win.isMaximized ? undefined : `${top}px`,
        width: win.isMaximized ? undefined : `${width}px`,
        height: win.isMaximized ? undefined : `${height}px`,
        zIndex: win.zIndex,
      }}
      onPointerDown={() => focusWindow(id)}
      onPointerMove={onWindowPointerMove}
      onPointerUp={onWindowPointerUp}
      onPointerCancel={onWindowPointerUp}
    >
      <div className="os-window-header" onPointerDown={onHeaderPointerDown}>
        <div className="os-window-actions">
          <button
            className="os-window-btn close"
            onClick={() => closeWindow(id)}
            type="button"
            aria-label="Close window"
          />
          <button
            className="os-window-btn minimize"
            onClick={() => minimizeWindow(id)}
            type="button"
            aria-label="Minimize window"
          />
          <button
            className="os-window-btn maximize"
            onClick={() => toggleMaximize(id)}
            type="button"
            aria-label="Maximize window"
          />
        </div>
        <div className="os-window-title">{title.toUpperCase()}</div>
      </div>

      <div className="os-window-body">{children}</div>

      <div className="os-window-resizer" onPointerDown={onResizerPointerDown} />
    </div>
  );
}
