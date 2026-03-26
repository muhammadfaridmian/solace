import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  colorIndex: number;
}

export function FloatingParticles({ count = 30 }: { count?: number }) {
  const theme = useStore((s) => s.theme);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * -20,
      opacity: 0.08 + Math.random() * 0.15,
      colorIndex: Math.floor(Math.random() * 4),
    }));
  }, [count]);

  const lightColors = [
    'var(--color-accent-warm)',
    'var(--color-accent-rose)',
    'var(--color-accent-sage)',
    'var(--color-accent-lavender)',
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden max-[767px]:hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: theme === 'dark' ? 'var(--color-text-primary)' : lightColors[p.colorIndex],
            opacity: theme === 'dark' ? p.opacity : p.opacity * 1.8,
          }}
          animate={{
            y: [0, -60, -20, -80, 0],
            x: [0, 15, -10, 20, 0],
            opacity: theme === 'dark'
              ? [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity]
              : [p.opacity * 1.5, p.opacity * 2.2, p.opacity * 0.8, p.opacity * 2, p.opacity * 1.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
