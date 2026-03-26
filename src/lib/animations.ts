import type { Variants } from 'framer-motion';

/* Easing curves from design system */
export const easeComfort = [0.25, 0.46, 0.45, 0.94] as const;
export const easeSettle = [0.34, 1.56, 0.64, 1] as const;
export const easeRelease = [0.55, 0.06, 0.68, 0.19] as const;
export const easeBreathe = [0.37, 0, 0.63, 1] as const;
export const easeStandard = [0.2, 0, 0, 1] as const;

/* Durations in seconds for Framer Motion */
export const duration = {
  micro: 0.2,
  small: 0.35,
  medium: 0.5,
  large: 0.7,
  ambient: 8,
  dissolve: 3,
} as const;

/* Page transition — staggered fade up */
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
  exit: { opacity: 0, transition: { duration: duration.medium } },
};

export const staggerChildVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.large,
      ease: easeSettle as unknown as number[],
    },
  },
};

/* Modal animation */
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(24px)',
    transition: { duration: duration.medium, ease: easeComfort as unknown as number[] },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: duration.medium, ease: easeRelease as unknown as number[] },
  },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.medium,
      ease: easeSettle as unknown as number[],
      delay: 0.05, // Slight delay so overlay starts first
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: duration.small, ease: easeRelease as unknown as number[] },
  },
};

/* Toast animation */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.small, ease: easeSettle as unknown as number[] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: duration.small, ease: easeRelease as unknown as number[] },
  },
};

/* Card hover */
export const cardHoverVariants: Variants = {
  rest: { y: 0, transition: { duration: duration.small, ease: easeComfort as unknown as number[] } },
  hover: { y: -4, transition: { duration: duration.small, ease: easeComfort as unknown as number[] } },
};

/* Button hover */
export const primaryButtonVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -2, transition: { duration: duration.small, ease: easeSettle as unknown as number[] } },
  tap: { y: 0, transition: { duration: 0.1 } },
};

export const rantButtonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.5, ease: easeSettle as unknown as number[] } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

/* Fade in */
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.medium, ease: easeComfort as unknown as number[] } },
};
