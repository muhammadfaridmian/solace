interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function Skeleton({ lines = 3, className = '' }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-xs ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-[12px] rounded-full animate-skeleton-shimmer ${
            i === lines - 1 ? 'w-[65%]' : 'w-full'
          }`}
          style={{
            background:
              'linear-gradient(90deg, var(--color-skeleton-from) 25%, var(--color-skeleton-via) 50%, var(--color-skeleton-from) 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}
