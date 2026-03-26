import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ mode: 'onSubmit' });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    const { error } = await resetPassword(data.email);

    setIsSubmitting(false);

    if (error) {
      setServerError(error);
      return;
    }

    setSentEmail(data.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-[16px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[440px] bg-bg-card border border-border-subtle rounded-[20px] p-[32px] sm:p-[40px] text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-[64px] h-[64px] rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-[20px]"
          >
            <Mail size={28} className="text-[var(--color-success)]" />
          </motion.div>
          <h2 className="font-display text-[24px] text-text-primary mb-[8px]">Check your inbox</h2>
          <p className="font-body text-[14px] text-text-secondary leading-relaxed mb-[8px]">
            We sent a password reset link to:
          </p>
          <p className="font-body text-[14px] text-text-primary font-medium mb-[24px]">
            {sentEmail}
          </p>
          <p className="font-body text-[12px] text-text-muted mb-[24px]">
            Click the link in the email to set a new password. If you don&apos;t see it, check your spam folder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-[6px] font-body text-[14px] text-accent-warm no-underline hover:underline"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-[16px] py-[40px]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[440px]"
      >
        {/* Header */}
        <div className="text-center mb-[32px]">
          <Link to="/" className="inline-flex items-center gap-[6px] no-underline mb-[16px]">
            <span className="text-[28px]">🫧</span>
            <span className="font-display text-[24px] text-text-primary">Solace</span>
          </Link>
          <h1 className="font-display text-[28px] sm:text-[32px] text-text-primary mb-[6px]">Reset your password</h1>
          <p className="font-body text-[14px] text-text-secondary">
            Enter the email you signed up with and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-bg-card border border-border-subtle rounded-[20px] p-[24px] sm:p-[32px] backdrop-blur-[10px]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
            {/* Email */}
            <div>
              <label className="font-body text-[13px] text-text-secondary mb-[6px] block">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-bg-input border border-border-subtle rounded-[12px] px-[14px] py-[11px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
                autoComplete="email"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-[12px] text-[var(--color-error)] mt-[4px]"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[12px] px-[14px] py-[10px]"
                >
                  <p className="font-body text-[13px] text-[var(--color-error)]">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-accent-warm text-text-on-cta font-body text-[15px] font-medium rounded-[12px] py-[12px] border-none cursor-pointer transition-all duration-200 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center font-body text-[13px] text-text-secondary mt-[20px]">
          <Link
            to="/login"
            className="inline-flex items-center gap-[4px] text-accent-warm no-underline hover:underline font-medium"
          >
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
