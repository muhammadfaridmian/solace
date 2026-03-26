import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { modalOverlayVariants, modalContentVariants } from '../../lib/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-md">
          {/* Backdrop Overlay */}
          <motion.div
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-bg-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-bg-card border border-border-medium rounded-xl p-2xl max-w-narrow w-full shadow-2xl relative z-10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-body' : undefined}
          >
            <button
              onClick={onClose}
              className="absolute top-md right-md w-[32px] h-[32px] rounded-full bg-transparent border border-border-subtle text-text-secondary cursor-pointer flex items-center justify-center transition-all duration-micro ease-comfort hover:bg-[var(--color-hover-bg)] hover:border-border-medium hover:text-text-primary"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            {title && (
              <h2
                id="modal-title"
                className="font-display text-xl text-text-primary mb-xs"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-body"
                className="font-body text-sm text-text-secondary leading-relaxed mb-md"
              >
                {description}
              </p>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
