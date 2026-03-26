import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from './ui/Button';

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASES: { phase: Phase; label: string; duration: number }[] = [
  { phase: 'inhale', label: 'Breathe in...', duration: 4000 },
  { phase: 'hold', label: 'Hold...', duration: 7000 },
  { phase: 'exhale', label: 'Breathe out...', duration: 8000 },
];

export function BreathingCircle() {
  const { isBreathingActive, setBreathingActive } = useStore();
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const runCycle = useCallback(() => {
    if (!isBreathingActive) return;

    const phase = PHASES[phaseIndex];
    setCurrentPhase(phase.phase);

    const timer = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASES.length;
      setPhaseIndex(nextIndex);
      if (nextIndex === 0) {
        setCycleCount((c) => c + 1);
      }
    }, phase.duration);

    return () => clearTimeout(timer);
  }, [isBreathingActive, phaseIndex]);

  useEffect(() => {
    const cleanup = runCycle();
    return cleanup;
  }, [runCycle]);

  const scaleMap: Record<Phase, number> = {
    inhale: 1.6,
    hold: 1.6,
    exhale: 1.0,
  };

  const opacityMap: Record<Phase, number> = {
    inhale: 1,
    hold: 1,
    exhale: 0.6,
  };

  const durationMap: Record<Phase, number> = {
    inhale: 4,
    hold: 0.1,
    exhale: 8,
  };

  if (!isBreathingActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-0 bg-bg-overlay backdrop-blur-[32px] flex flex-col items-center justify-center gap-xl z-modal"
      >
        {/* Breathing circle */}
        <div className="relative">
          <motion.div
            animate={{
              scale: scaleMap[currentPhase],
              opacity: opacityMap[currentPhase],
            }}
            transition={{
              duration: durationMap[currentPhase],
              ease: [0.37, 0, 0.63, 1],
            }}
            className="w-[200px] h-[200px] rounded-full border-2 border-border-sage flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-surface-sage-light)',
            }}
          >
            <motion.span
              key={currentPhase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="font-display text-md text-text-primary text-center select-none"
            >
              {PHASES.find((p) => p.phase === currentPhase)?.label}
            </motion.span>
          </motion.div>

          {/* Outer glow ring */}
          <motion.div
            animate={{
              scale: scaleMap[currentPhase],
              opacity: opacityMap[currentPhase] * 0.5,
            }}
            transition={{
              duration: durationMap[currentPhase],
              ease: [0.37, 0, 0.63, 1],
              delay: 0.2,
            }}
            className="absolute inset-[-12px] rounded-full border border-border-sage"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-lg text-text-secondary text-sm">
          <span>Cycle {cycleCount + 1}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setBreathingActive(false);
              setPhaseIndex(0);
              setCycleCount(0);
            }}
          >
            End session
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
