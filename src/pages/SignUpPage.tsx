import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { evaluatePasswordStrength, isPasswordStrong } from '../lib/passwordStrength';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpPage() {
  const signUp = useAuthStore((s) => s.signUp);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({ mode: 'onChange' });

  const password = watch('password', '');
  const strength = evaluatePasswordStrength(password);

  const onSubmit = async (data: SignUpFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    const { error } = await signUp(data.email, data.password, data.name);

    setIsSubmitting(false);

    if (error) {
      setServerError(error);
      return;
    }

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
            <Check size={28} className="text-[var(--color-success)]" />
          </motion.div>
          <h2 className="font-display text-[24px] text-text-primary mb-[8px]">Check your email</h2>
          <p className="font-body text-[14px] text-text-secondary leading-relaxed mb-[24px]">
            We sent a confirmation link to your email. Click it to activate your account, then come back to sign in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-[6px] font-body text-[14px] text-accent-warm no-underline hover:underline"
          >
            Go to sign in <ArrowRight size={14} />
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
          <h1 className="font-display text-[28px] sm:text-[32px] text-text-primary mb-[6px]">Create your account</h1>
          <p className="font-body text-[14px] text-text-secondary">
            Your safe space starts here.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-bg-card border border-border-subtle rounded-[20px] p-[24px] sm:p-[32px] backdrop-blur-[10px]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
            {/* Name */}
            <div>
              <label className="font-body text-[13px] text-text-secondary mb-[6px] block">
                Display name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                placeholder="What should we call you?"
                className="w-full bg-bg-input border border-border-subtle rounded-[12px] px-[14px] py-[11px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
                autoComplete="name"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-[12px] text-[var(--color-error)] mt-[4px]"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label className="font-body text-[13px] text-text-secondary mb-[6px] block">
                Email
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

            {/* Password */}
            <div>
              <label className="font-body text-[13px] text-text-secondary mb-[6px] block">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    validate: (val) =>
                      isPasswordStrong(val) || 'Password must be at least "Strong"',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="w-full bg-bg-input border border-border-subtle rounded-[12px] px-[14px] py-[11px] pr-[42px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-[10px]"
                  >
                    {/* Bar */}
                    <div className="flex gap-[4px] mb-[6px]">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="flex-1 h-[4px] rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: 1,
                            backgroundColor: i < strength.score
                              ? strength.color
                              : 'var(--color-border-subtle)',
                          }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          style={{ transformOrigin: 'left' }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-body text-[11px] font-medium"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>

                    {/* Requirements */}
                    {strength.feedback.length > 0 && (
                      <div className="mt-[8px] flex flex-col gap-[3px]">
                        {strength.feedback.map((hint) => (
                          <div key={hint} className="flex items-center gap-[6px]">
                            <X size={10} className="text-[var(--color-error)] flex-shrink-0" />
                            <span className="font-body text-[11px] text-text-muted">{hint}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show checks for met requirements */}
                    <div className="mt-[4px] flex flex-col gap-[3px]">
                      {password.length >= 8 && (
                        <div className="flex items-center gap-[6px]">
                          <Check size={10} className="text-[var(--color-success)] flex-shrink-0" />
                          <span className="font-body text-[11px] text-text-muted">8+ characters</span>
                        </div>
                      )}
                      {/[a-z]/.test(password) && /[A-Z]/.test(password) && (
                        <div className="flex items-center gap-[6px]">
                          <Check size={10} className="text-[var(--color-success)] flex-shrink-0" />
                          <span className="font-body text-[11px] text-text-muted">Mixed case</span>
                        </div>
                      )}
                      {/\d/.test(password) && (
                        <div className="flex items-center gap-[6px]">
                          <Check size={10} className="text-[var(--color-success)] flex-shrink-0" />
                          <span className="font-body text-[11px] text-text-muted">Contains number</span>
                        </div>
                      )}
                      {/[^a-zA-Z0-9]/.test(password) && (
                        <div className="flex items-center gap-[6px]">
                          <Check size={10} className="text-[var(--color-success)] flex-shrink-0" />
                          <span className="font-body text-[11px] text-text-muted">Special character</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-[12px] text-[var(--color-error)] mt-[4px]"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-body text-[13px] text-text-secondary mb-[6px] block">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  className="w-full bg-bg-input border border-border-subtle rounded-[12px] px-[14px] py-[11px] pr-[42px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-[12px] text-[var(--color-error)] mt-[4px]"
                  >
                    {errors.confirmPassword.message}
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center font-body text-[13px] text-text-secondary mt-[20px]">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-warm no-underline hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
