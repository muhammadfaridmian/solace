interface ProgressOrbProps {
  progress: number; // 0 to 1
  size?: number;
}

export function ProgressOrb({ progress, size = 48 }: ProgressOrbProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div className="relative cursor-pointer" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--color-progress-track)"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--color-accent-sage)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-comfort"
        />
      </svg>
      <div className="absolute inset-[-4px] rounded-full animate-orb-pulse" />
    </div>
  );
}
