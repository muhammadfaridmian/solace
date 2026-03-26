import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
      }
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const glowColor = theme === 'dark'
    ? 'radial-gradient(circle, rgba(232,168,124,0.04) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(168,85,63,0.07) 0%, rgba(98,78,120,0.03) 40%, transparent 70%)';

  return (
    <motion.div
      ref={glowRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[1] will-change-transform max-[767px]:hidden"
      style={{
        background: glowColor,
        filter: 'blur(40px)',
      }}
    />
  );
}
