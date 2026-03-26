import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RANT_PLACEHOLDERS, AFFIRMATION_MESSAGES } from '../lib/constants';
import { useCrisisDetection } from '../hooks/useCrisisDetection';
import { useStore } from '../store/useStore';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { addToast } from './ui/Toast';

export function RantBox() {
  const [content, setContent] = useState('');
  const [placeholder, setPlaceholder] = useState<string>(RANT_PLACEHOLDERS[0]);
  const [hasContent, setHasContent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [postBreathing, setPostBreathing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholderInterval = useRef<ReturnType<typeof setInterval>>();
  const placeholderIndex = useRef(0);

  const { checkContent } = useCrisisDetection();
  const { addJournalEntry, mood, intensity, isBreathingActive } = useStore();

  // Rotating placeholder
  useEffect(() => {
    if (hasContent) return;

    placeholderInterval.current = setInterval(() => {
      placeholderIndex.current =
        (placeholderIndex.current + 1) % RANT_PLACEHOLDERS.length;
      setPlaceholder(RANT_PLACEHOLDERS[placeholderIndex.current]);
    }, 5000);

    return () => {
      if (placeholderInterval.current) clearInterval(placeholderInterval.current);
    };
  }, [hasContent]);

  // Post-breathing border effect
  useEffect(() => {
    if (!isBreathingActive) {
      setPostBreathing(true);
      const timer = setTimeout(() => setPostBreathing(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [isBreathingActive]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);

      if (!hasContent && value.length > 0) {
        setHasContent(true);
        if (placeholderInterval.current) clearInterval(placeholderInterval.current);
      } else if (value.length === 0) {
        setHasContent(false);
      }

      // Crisis detection
      checkContent(value);

      // Auto-expand
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(
          hasContent ? 300 : 200,
          textareaRef.current.scrollHeight
        )}px`;
      }
    },
    [hasContent, checkContent]
  );

  const handleSave = () => {
    if (!content.trim()) return;
    addJournalEntry({ content, mood, intensity });
    addToast('Saved to your journal.', 'success');
    setContent('');
    setHasContent(false);
    setShowConfirm(false);
  };

  const handleDissolve = () => {
    setShowConfirm(false);
    setIsDissolving(true);

    // Show affirmation after dissolve
    const msg =
      AFFIRMATION_MESSAGES[Math.floor(Math.random() * AFFIRMATION_MESSAGES.length)];

    setTimeout(() => {
      setIsDissolving(false);
      setContent('');
      setHasContent(false);
      setAffirmation(msg);

      setTimeout(() => setAffirmation(''), 6000);
    }, 2500);
  };

  return (
    <div className="relative w-full max-w-[720px] mx-auto">
      <label htmlFor="rant-input" className="sr-only">
        Write what you&apos;re feeling. This space is private.
      </label>

      <motion.textarea
        ref={textareaRef}
        id="rant-input"
        value={content}
        onChange={handleInput}
        placeholder={placeholder}
        aria-label="Your private rant space"
        aria-multiline="true"
        aria-describedby="rant-hint"
        className={`block w-full bg-bg-input border-[1.5px] border-border-subtle rounded-lg px-[32px] py-[28px] text-text-primary font-display text-[20px] leading-loose font-regular resize-none outline-none overflow-y-auto transition-all duration-medium ease-comfort shadow-sm
          focus:border-border-focus focus:shadow-[0_0_0_4px_var(--color-focus-ring-secondary),0_8px_40px_rgba(98,78,120,0.1)] focus:bg-bg-input-focus
          placeholder:font-display placeholder:text-[20px] placeholder:font-regular placeholder:text-text-placeholder
          ${postBreathing ? 'animate-border-pulse' : ''}
        `}
        style={{
          minHeight: hasContent ? '300px' : '200px',
          maxHeight: '60vh',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-scrollbar) transparent',
          transition: 'min-height 600ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), background 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        animate={
          isDissolving
            ? { opacity: 0, scale: 0.98, filter: 'blur(4px)' }
            : { opacity: 1, scale: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      <p id="rant-hint" className="sr-only">
        Everything you write here is private. Press Escape at any time to exit.
      </p>

      {/* Affirmation */}
      {affirmation && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-[22px] italic text-text-primary text-center p-lg tracking-tight"
        >
          {affirmation}
        </motion.p>
      )}

      {/* Word count indicator */}
      {hasContent && !isDissolving && !affirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-sm"
        >
          <p className="text-xs text-text-muted">
            Private to you
          </p>
          <p className="text-xs text-text-muted tabular-nums">
            {content.split(/\s+/).filter(Boolean).length} {content.split(/\s+/).filter(Boolean).length === 1 ? 'word' : 'words'}
          </p>
        </motion.div>
      )}

      {/* Privacy badge — shown when empty */}
      {!hasContent && !affirmation && (
        <p className="text-center text-xs text-text-muted mt-sm">
          Private to you
        </p>
      )}

      {/* Action buttons */}
      {hasContent && !isDissolving && !affirmation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex items-center justify-center gap-sm mt-md"
        >
          <Button 
            variant="rant" 
            onClick={handleSave}
            className="bg-gradient-to-r from-accent-warm via-accent-rose to-accent-warm bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-[0_4px_20px_rgba(168,85,63,0.3)] hover:shadow-[0_8px_30px_rgba(168,85,63,0.4)] text-white border-none min-w-[200px]"
          >
            Save to journal
          </Button>
        </motion.div>
      )}

      {/* Release confirmation modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Before you let this go"
        description="This is yours to decide. Save it privately, or release it forever."
      >
        <div className="flex flex-col gap-sm mt-md">
          <Button onClick={handleSave}>Save to my journal</Button>
          <Button variant="rant" onClick={handleDissolve}>
            Release it forever
          </Button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-transparent border-none text-text-secondary text-sm cursor-pointer font-body underline underline-offset-[3px] p-xs hover:text-text-primary transition-colors duration-micro ease-comfort"
          >
            Actually, keep editing
          </button>
        </div>
      </Modal>
    </div>
  );
}
