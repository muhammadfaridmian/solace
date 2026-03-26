import type { Mood } from '../../store/useStore';

interface AvatarProps {
  initials?: string;
  mood?: Mood;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ initials = 'S', mood, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-[32px] h-[32px] text-xs',
    md: 'w-[40px] h-[40px] text-sm',
    lg: 'w-[48px] h-[48px] text-base',
  };

  const moodColors: Record<string, string> = {
    calm: 'border-emotion-calm',
    angry: 'border-emotion-angry',
    sad: 'border-emotion-sad',
    anxious: 'border-emotion-anxious',
    numb: 'border-emotion-numb',
    overwhelmed: 'border-emotion-overwhelmed',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-accent-warm border-2 border-border-subtle flex items-center justify-center font-display text-text-on-cta font-semibold flex-shrink-0 relative overflow-visible`}>
      {initials}
      {mood && (
        <div
          className={`absolute inset-[-4px] rounded-full border-2 border-transparent transition-colors duration-1000 ease-breathe ${moodColors[mood] || ''}`}
        />
      )}
    </div>
  );
}
