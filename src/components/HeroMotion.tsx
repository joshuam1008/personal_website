import { motion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getAnimationConfig } from '@config/animations';

const highlights = [
  'Agentic AI (LLM orchestration)',
  'LLM + RAG foundations',
  'NLP classification & dataset design',
  'Cloud ML (SageMaker, Spark)',
];

const quoteText = '"I care about how models meet people. The tooling is fun, but the experience is the product."';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.6 + index * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const glowVariants: Variants = {
  initial: { scale: 0.95, opacity: 0.6 },
  animate: {
    scale: [0.95, 1.05, 0.95],
    opacity: [0.6, 0.9, 0.6],
    transition: { duration: 6, repeat: Infinity, repeatType: 'mirror' },
  },
};

const floatingVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 1.5 + index * 0.02, duration: 0.3 },
  }),
};

export default function HeroMotion() {
  const [enableRipple, setEnableRipple] = useState(true);

  useEffect(() => {
    const config = getAnimationConfig();
    setEnableRipple(config.enableQuoteRipple);

    const handleConfigChange = (e: CustomEvent) => {
      setEnableRipple(e.detail.enableQuoteRipple);
    };

    window.addEventListener('animation-config-changed', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('animation-config-changed', handleConfigChange as EventListener);
    };
  }, []);
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative glass-card overflow-hidden p-8 md:p-10"
    >
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/40 via-sky-500/30 to-transparent blur-3xl"
      />

      <motion.div
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        className="absolute -left-10 bottom-6 hidden h-32 w-32 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm md:block"
      />

      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Applied Scientist — Thomson Reuters
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">Focus areas</p>
          <ul className="space-y-3 text-sm text-neutral-100">
            {highlights.map((item, index) => (
              <motion.li
                key={item}
                custom={index}
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 mix-blend-screen"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/30 text-xs font-semibold text-indigo-100">
                  {index + 1}
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300">
          {enableRipple ? (
            quoteText.split('').map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                custom={index}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >
                {char}
              </motion.span>
            ))
          ) : (
            quoteText
          )}
        </div>
      </div>
    </motion.div>
  );
}
