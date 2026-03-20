import { useState, useEffect } from 'react';

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

type BootScreenProps = {
  onComplete: () => void;
};

export function BootScreen({ onComplete }: BootScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setDisplayedLines((prev) => {
        if (prev.length < BOOT_LINES.length) {
          return [...prev, BOOT_LINES[prev.length]];
        }
        return prev;
      });
    }, 250);

    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min(100, (elapsed / duration) * 100);
      setProgress(percentage);

      if (elapsed >= duration) {
        clearInterval(progressTimer);
      }
    }, 30);

    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    if (displayedLines.length === BOOT_LINES.length) {
      const completeTimer = setTimeout(() => {
        setDone(true);
        onComplete();
      }, 400);

      return () => clearTimeout(completeTimer);
    }
  }, [displayedLines.length, onComplete]);

  return (
    <div id="os-boot-screen" className={done ? 'hidden' : ''}>
      <pre className="boot-text">{displayedLines.join('\n')}</pre>
      <div className="boot-progress">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
