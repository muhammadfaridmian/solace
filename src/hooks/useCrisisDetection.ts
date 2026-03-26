import { useCallback, useRef } from 'react';
import { CRISIS_KEYWORDS } from '../lib/constants';
import { useStore } from '../store/useStore';

export function useCrisisDetection() {
  const setShowCrisisOverlay = useStore((s) => s.setShowCrisisOverlay);
  const lastTriggered = useRef(0);

  const checkContent = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      const now = Date.now();

      // Debounce: don't re-trigger within 30 seconds
      if (now - lastTriggered.current < 30000) return;

      const detected = CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
      if (detected) {
        lastTriggered.current = now;
        setShowCrisisOverlay(true);
      }
    },
    [setShowCrisisOverlay]
  );

  return { checkContent };
}
