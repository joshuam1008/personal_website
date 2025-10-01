import { useEffect, useState } from 'react';
import { getAnimationConfig } from '@config/animations';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export default function TypewriterText({
  text,
  className = '',
  delay = 0,
  speed = 50
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const config = getAnimationConfig();
    setIsEnabled(config.enableHeroTypewriter);

    // Listen for config changes
    const handleConfigChange = (e: CustomEvent) => {
      setIsEnabled(e.detail.enableHeroTypewriter);
    };

    window.addEventListener('animation-config-changed', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('animation-config-changed', handleConfigChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');

    const timeout = setTimeout(() => {
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay, speed, isEnabled]);

  return (
    <span className={className}>
      {displayedText}
      {isEnabled && displayedText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}
