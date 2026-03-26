import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';
import { primaryButtonVariants, rantButtonVariants } from '../../lib/animations';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'rant' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'text-sm px-[20px] py-[10px]',
    md: 'text-[15px] px-[32px] py-[14px]',
    lg: 'text-md px-[40px] py-[18px]',
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-xs cursor-pointer whitespace-nowrap no-underline select-none';

  if (variant === 'rant') {
    return (
      <motion.button
        variants={rantButtonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className={`${baseClasses} bg-accent-warm text-text-on-cta font-display font-semibold text-md leading-6 px-[40px] py-[18px] border-none rounded-full tracking-[-0.01em] shadow-cta-default hover:shadow-cta-rant focus-visible:outline-[3px] focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-[4px] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none ${className}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </motion.button>
    );
  }

  if (variant === 'secondary') {
    return (
      <motion.button
        whileHover={{
          borderColor: 'var(--color-hover-border)',
          backgroundColor: 'var(--color-hover-bg)',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`${baseClasses} ${sizeClasses[size]} bg-transparent text-text-primary font-body font-medium border-[1.5px] border-border-medium rounded-md backdrop-blur-[4px] transition-all duration-small ease-comfort focus-visible:outline-[3px] focus-visible:outline-[var(--color-focus-ring-secondary)] focus-visible:outline-offset-[3px] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </motion.button>
    );
  }

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ backgroundColor: 'var(--color-hover-bg)' }}
        whileTap={{ scale: 0.9 }}
        className={`p-xs rounded-sm bg-transparent border-none text-text-secondary cursor-pointer inline-flex items-center justify-center transition-all duration-micro ease-comfort hover:text-text-primary aspect-square ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  // Primary — solid color, no gradient
  return (
    <motion.button
      variants={primaryButtonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={`${baseClasses} ${sizeClasses[size]} bg-accent-warm text-text-on-cta font-body font-semibold border-none rounded-md relative overflow-hidden shadow-cta-default hover:shadow-cta-hover hover:brightness-110 focus-visible:outline-[3px] focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-[3px] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </motion.button>
  );
}

function Spinner() {
  return (
    <span className="w-[18px] h-[18px] border-2 border-[var(--color-spinner-track)] border-t-[var(--color-spinner-active)] rounded-full animate-spin flex-shrink-0" />
  );
}
