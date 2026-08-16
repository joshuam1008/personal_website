import { useState, useEffect, useCallback, useRef } from 'react';

const BOOT_LINES = [
  'BIOS v2.4.1 — Joshua Mason OS',
  'Initializing memory... OK',
  'Loading kernel modules...',
  'Mounting content collections...',
  '  [ blog ]       OK',
  '  [ projects ]   OK',
  '  [ resume ]     OK',
  'Starting window manager...',
  'Launching desktop environment...',
];

const SESSION_KEY = 'boot-complete';

function bootAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markBootSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Safari private mode etc — nothing to persist, boot just replays.
  }
}

type BootScreenProps = {
  onComplete: () => void;
};

export function BootScreen({ onComplete }: BootScreenProps) {
  const [skip] = useState(() => bootAlreadySeen());
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);
  // BootScreen never unmounts (Desktop.tsx only toggles a CSS class), so effect
  // cleanup alone never runs the teardown below — finish() must trigger it directly.
  const cleanupRef = useRef<(() => void) | null>(null);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cleanupRef.current?.();
    cleanupRef.current = null;
    markBootSeen();
    setDone(true);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (skip) {
      finish();
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setDisplayedLines(BOOT_LINES);
      setProgress(100);
      const t = setTimeout(finish, 300);
      const cleanup = () => clearTimeout(t);
      cleanupRef.current = cleanup;
      return cleanup;
    }

    const lineTimer = setInterval(() => {
      setDisplayedLines((prev) => {
        if (prev.length < BOOT_LINES.length) {
          return [...prev, BOOT_LINES[prev.length]];
        }
        return prev;
      });
    }, 250);

    const startTime = Date.now();
    const duration = 2500;
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed >= duration) clearInterval(progressTimer);
    }, 30);

    const skipHandler = () => finish();
    window.addEventListener('keydown', skipHandler);
    window.addEventListener('pointerdown', skipHandler);

    const cleanup = () => {
      clearInterval(lineTimer);
      clearInterval(progressTimer);
      window.removeEventListener('keydown', skipHandler);
      window.removeEventListener('pointerdown', skipHandler);
    };
    cleanupRef.current = cleanup;
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  useEffect(() => {
    if (!skip && displayedLines.length === BOOT_LINES.length) {
      const completeTimer = setTimeout(finish, 400);
      return () => clearTimeout(completeTimer);
    }
  }, [skip, displayedLines.length, finish]);

  if (skip) return null;

  return (
    <div id="os-boot-screen" className={done ? 'hidden' : ''}>
      <pre className="boot-text">{displayedLines.join('\n')}</pre>
      <div className="boot-progress">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <p className="boot-skip-hint">press any key to skip</p>
    </div>
  );
}
