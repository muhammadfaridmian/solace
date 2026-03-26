import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { toastVariants } from '../../lib/animations';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

let toastListener: ((toast: Toast) => void) | null = null;

export function addToast(message: string, type: ToastType = 'success') {
  if (toastListener) {
    toastListener({ id: crypto.randomUUID(), message, type });
  }
}

const borderColors: Record<ToastType, string> = {
  success: 'border-l-accent-sage',
  warning: 'border-l-accent-warm',
  error: 'border-l-accent-rose',
  info: 'border-l-accent-lavender',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-lg right-lg flex flex-col gap-xs z-toast pointer-events-none tablet:right-lg mobile-l:right-1/2 mobile-l:translate-x-1/2 mobile-l:w-[calc(100%-32px)] mobile-l:max-w-[380px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className={`flex items-start gap-sm bg-[var(--color-toast-bg)] backdrop-blur-[16px] border border-border-subtle border-l-[3px] ${borderColors[toast.type]} rounded-md px-[20px] py-sm max-w-[380px] pointer-events-auto shadow-md`}
            onClick={() => dismiss(toast.id)}
          >
            <p className="font-body text-sm leading-normal text-text-primary flex-1">
              {toast.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
