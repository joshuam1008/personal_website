import { getAnimationConfig } from '@config/animations';

export function initShimmers() {
  if (typeof window === 'undefined') return;

  const applyShimmers = () => {
    const config = getAnimationConfig();
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach((card) => {
      if (config.enableShimmers) {
        card.classList.add('shimmer-enabled');
      } else {
        card.classList.remove('shimmer-enabled');
      }
    });
  };

  // Apply on load
  applyShimmers();

  // Listen for config changes
  window.addEventListener('animation-config-changed', applyShimmers);

  // Observe for new glass cards being added
  const observer = new MutationObserver(applyShimmers);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
