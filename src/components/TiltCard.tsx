import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { getAnimationConfig } from '@config/animations';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxRotation?: number;
}

export default function TiltCard({
  children,
  className = '',
  maxRotation = 8,
}: TiltCardProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxRotation, -maxRotation]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxRotation, maxRotation]);

  useEffect(() => {
    const config = getAnimationConfig();
    setIsEnabled(config.enableCardTilt);

    const handleConfigChange = (e: CustomEvent) => {
      setIsEnabled(e.detail.enableCardTilt);
    };

    window.addEventListener('animation-config-changed', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('animation-config-changed', handleConfigChange as EventListener);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        isEnabled
          ? {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
