import { getAnimationConfig } from '@config/animations';

export function initParallax() {
  if (typeof window === 'undefined') return;

  let isEnabled = getAnimationConfig().enableParallax;
  let ticking = false;

  const parallaxElements: Array<{
    element: HTMLElement;
    speed: number;
  }> = [];

  const initElements = () => {
    parallaxElements.length = 0;
    const elements = document.querySelectorAll<HTMLElement>('[data-parallax]');

    elements.forEach((element) => {
      const speed = parseFloat(element.dataset.parallax || '0.5');
      parallaxElements.push({ element, speed });
    });
  };

  const updateParallax = () => {
    if (!isEnabled) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY;

    parallaxElements.forEach(({ element, speed }) => {
      const offset = scrollY * speed;
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking && isEnabled) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  const handleConfigChange = (e: CustomEvent) => {
    isEnabled = e.detail.enableParallax;

    if (!isEnabled) {
      // Reset transforms
      parallaxElements.forEach(({ element }) => {
        element.style.transform = '';
      });
    }
  };

  // Initialize
  initElements();

  // Listen for scroll
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Listen for config changes
  window.addEventListener('animation-config-changed', handleConfigChange as EventListener);

  // Observe for new parallax elements
  const observer = new MutationObserver(initElements);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
