import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export function CrisisOverlay() {
  const { showCrisisOverlay, setShowCrisisOverlay } = useStore();

  if (!showCrisisOverlay) return null;

  return (
    <AnimatePresence>
      {showCrisisOverlay && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="fixed bottom-lg left-1/2 -translate-x-1/2 w-[min(480px,calc(100%-32px))] bg-bg-primary border border-border-sage rounded-xl p-lg shadow-xl z-crisis backdrop-blur-[20px]"
        >
          <h3 className="font-display text-xl text-text-primary mb-xs">
            Something&apos;s here for you
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed mb-md">
            It sounds like you might be carrying something really heavy. These might
            help:
          </p>
          <div className="flex flex-col gap-xs mb-md">
            <a
              href="tel:988"
              className="text-accent-warm font-semibold underline underline-offset-[3px] text-sm"
            >
              988 Suicide &amp; Crisis Lifeline
            </a>
            <a
              href="sms:741741?body=HOME"
              className="text-accent-warm font-semibold underline underline-offset-[3px] text-sm"
            >
              Text HOME to 741741
            </a>
          </div>
          <button
            onClick={() => setShowCrisisOverlay(false)}
            className="text-xs text-text-muted cursor-pointer bg-transparent border-none underline font-body"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
