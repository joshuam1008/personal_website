import { useContext } from 'react';
import { WindowManagerContext } from './WindowManager';
import type { WindowId } from './WindowManager';

type DesktopIconProps = {
  id: WindowId;
  label: string;
  iconArt: string;
};

export function DesktopIcon({ id, label, iconArt }: DesktopIconProps) {
  const wmContext = useContext(WindowManagerContext);
  if (!wmContext) throw new Error('DesktopIcon must be used within WindowManagerProvider');

  const { openWindow } = wmContext;

  return (
    <button
      className="os-desktop-icon"
      type="button"
      onClick={() => openWindow(id)}
    >
      <span className="icon-art">{iconArt}</span>
      <span className="icon-label">{label}</span>
    </button>
  );
}
