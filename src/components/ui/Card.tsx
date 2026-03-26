import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cardHoverVariants } from '../../lib/animations';
import type { Mood } from '../../store/useStore';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'elevated' | 'profile';
  emotion?: Mood;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  emotion,
  className = '',
  interactive = true,
  onClick,
}: CardProps) {
  const emotionColors: Record<string, string> = {
    angry: 'var(--color-emotion-angry)',
    sad: 'var(--color-emotion-sad)',
    anxious: 'var(--color-emotion-anxious)',
    calm: 'var(--color-emotion-calm)',
    numb: 'var(--color-emotion-numb)',
    overwhelmed: 'var(--color-emotion-overwhelmed)',
  };

  if (variant === 'flat') {
    return (
      <div
        className={`bg-[var(--color-surface-glass)] border border-border-subtle rounded-lg p-lg ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  if (variant === 'elevated') {
    return (
      <motion.div
        variants={interactive ? cardHoverVariants : undefined}
        initial="rest"
        whileHover={interactive ? 'hover' : undefined}
        className={`bg-[var(--color-surface-glass-heavy)] border border-border-medium rounded-lg p-lg shadow-md hover:shadow-xl transition-shadow duration-small ease-comfort ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'profile') {
    return (
      <motion.div
        variants={interactive ? cardHoverVariants : undefined}
        initial="rest"
        whileHover={interactive ? 'hover' : undefined}
        className={`bg-bg-card border border-border-subtle rounded-xl p-md backdrop-blur-[12px] shadow-[var(--shadow-inset),0_2px_6px_rgba(98,78,120,0.04)] transition-all duration-small ease-comfort hover:bg-bg-card-hover hover:border-border-card-hover ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      variants={interactive ? cardHoverVariants : undefined}
      initial="rest"
      whileHover={interactive ? 'hover' : undefined}
      className={`bg-bg-card border border-border-subtle rounded-lg p-lg backdrop-blur-[12px] relative overflow-hidden shadow-[var(--shadow-inset),0_2px_8px_rgba(98,78,120,0.05)] transition-all duration-small ease-comfort hover:bg-bg-card-hover hover:border-border-card-hover hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {/* Left accent bar — solid color, no gradient */}
      <motion.div
        className="absolute left-0 top-[20px] bottom-[20px] w-[3px] rounded-r-[3px]"
        style={{
          backgroundColor: emotion
            ? emotionColors[emotion] || 'var(--color-accent-warm)'
            : 'var(--color-accent-warm)',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      {children}
    </motion.div>
  );
}
