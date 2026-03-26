import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ mode: 'onSubmit' });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    const { error } = await signIn(data.email, data.password);

    setIsSubmitting(false);

    if (error) {
      setServerError(error);
      return;
    }

    navigate(from, { replace: true });
  };

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
          <h1 className="font-display text-[28px] sm:text-[32px] text-text-primary mb-[6px]">Welcome back</h1>
          <p className="font-body text-[14px] text-text-secondary">
            Sign in to your safe space.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-bg-card border border-border-subtle rounded-[20px] p-[24px] sm:p-[32px] backdrop-blur-[10px]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
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
              <div className="flex items-center justify-between mb-[6px]">
                <label className="font-body text-[13px] text-text-secondary">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="font-body text-[12px] text-accent-warm no-underline hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full bg-bg-input border border-border-subtle rounded-[12px] px-[14px] py-[11px] pr-[42px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
                  autoComplete="current-password"
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center font-body text-[13px] text-text-secondary mt-[20px]">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-accent-warm no-underline hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
