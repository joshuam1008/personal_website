export interface AnimationConfig {
  enableHeroTypewriter: boolean;
  enableQuoteRipple: boolean;
  enableCardTilt: boolean;
  enableCursorTrail: boolean;
  enableParallax: boolean;
  enableShimmers: boolean;
  enableScrollAnimations: boolean;
  enableMatrixRain: boolean;
}

export const defaultAnimationConfig: AnimationConfig = {
  enableHeroTypewriter: true,
  enableQuoteRipple: true,
  enableCardTilt: true,
  enableCursorTrail: false, // Disabled by default (performance)
  enableParallax: true,
  enableShimmers: true,
  enableScrollAnimations: true,
  enableMatrixRain: true, // Only shows on terminal theme
};

export const animationDescriptions: Record<keyof AnimationConfig, string> = {
  enableHeroTypewriter: 'Typewriter effect on hero headline',
  enableQuoteRipple: 'Letter-by-letter ripple on quote text',
  enableCardTilt: '3D tilt effect on hover for cards',
  enableCursorTrail: 'Particle trail following cursor (may impact performance)',
  enableParallax: 'Parallax scroll effects',
  enableShimmers: 'Shimmer animations on glass cards',
  enableScrollAnimations: 'Fade-in animations on scroll',
  enableMatrixRain: 'Matrix rain effect (terminal theme only)',
};

const STORAGE_KEY = 'animation-config';

export function getAnimationConfig(): AnimationConfig {
  if (typeof window === 'undefined') return defaultAnimationConfig;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultAnimationConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load animation config:', error);
  }

  return defaultAnimationConfig;
}

export function saveAnimationConfig(config: AnimationConfig) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save animation config:', error);
  }
}

export function updateAnimationConfig(updates: Partial<AnimationConfig>) {
  const current = getAnimationConfig();
  const updated = { ...current, ...updates };
  saveAnimationConfig(updated);
  return updated;
}
