'use client'
import { AnimatePresence, motion, MotionProps } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface FadeEffectsProps extends MotionProps {
  children: React.ReactNode;
  options?: {
    initial?: MotionProps['initial'];
    animate?: MotionProps['animate'];
    transition?: MotionProps['transition'];
  };
}

export default function FadeEffects({ children, options = {}, ...props }: FadeEffectsProps) {
  const pathname = usePathname();

  // Memoize animation config to prevent recreation on every render
  const fadeEffects = useMemo(() => ({
    initial: {
      opacity: 0,
      ...(typeof options.initial === 'object' ? options.initial : {}),
    },
    animate: {
      opacity: 1,
      ...(typeof options.animate === 'object' ? options.animate : {}),
    },
    transition: {
      duration: 0.2, // Reduced from 0.5s to 0.2s for faster transitions
      ease: 'easeOut', // Changed to easeOut for snappier feel
      ...(typeof options.transition === 'object' ? options.transition : {}),
    },
  }), [options]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        {...props}
        {...fadeEffects as any}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
