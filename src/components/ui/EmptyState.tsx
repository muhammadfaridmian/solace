import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  illustration?: ReactNode;
}

export function EmptyState({ title, body, ctaLabel, onCta, illustration }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-3xl px-xl gap-md">
      {illustration && (
        <div className="w-[160px] h-[160px] opacity-40">{illustration}</div>
      )}
      <h3 className="font-display text-xl text-text-primary tracking-tight">
        {title}
      </h3>
      <p className="font-body text-base text-text-secondary max-w-[40ch] leading-relaxed">
        {body}
      </p>
      {ctaLabel && onCta && (
        <div className="mt-sm">
          <Button onClick={onCta}>{ctaLabel}</Button>
        </div>
      )}
    </div>
  );
}
