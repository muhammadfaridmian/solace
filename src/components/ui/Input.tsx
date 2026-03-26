import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-2xs">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-sm text-text-secondary font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full bg-bg-input border-[1.5px] ${
            error ? 'border-semantic-error shadow-[0_0_0_3px_rgba(201,123,132,0.08)]' : 'border-border-subtle'
          } rounded-md px-[18px] py-[14px] text-text-primary font-body text-base leading-normal outline-none transition-all duration-small ease-comfort placeholder:text-text-placeholder focus:border-border-focus focus:shadow-[0_0_0_3px_var(--color-focus-ring-secondary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
