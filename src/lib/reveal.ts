import { animate, inView } from 'motion';

type RevealOptions = {
  selector?: string;
};

export function initReveal({ selector = '[data-reveal]' }: RevealOptions = {}) {
  if (typeof window === 'undefined') return;

  inView(
    selector,
    (el) => {
      const delay = Number(el.getAttribute('data-reveal-delay') ?? '0');
      animate(
        el,
        { opacity: 1, y: 0 },
        {
          duration: 0.7,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      );
    },
    {
      margin: '0px 0px -20% 0px',
    },
  );
}
