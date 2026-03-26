import { useState } from 'react';

interface ToggleProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

export function Toggle({ label, checked = false, onChange, id }: ToggleProps) {
  const [isChecked, setIsChecked] = useState(checked);
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2)}`;

  const handleChange = () => {
    const next = !isChecked;
    setIsChecked(next);
    onChange?.(next);
  };

  return (
    <label htmlFor={toggleId} className="flex items-center gap-sm cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          id={toggleId}
          checked={isChecked}
          onChange={handleChange}
          className="absolute opacity-0 w-0 h-0 peer"
        />
        <div
          className={`relative w-[44px] h-[24px] rounded-full border transition-all duration-small ease-comfort flex-shrink-0 ${
            isChecked
              ? 'bg-accent-sage border-accent-sage'
              : 'bg-[var(--color-toggle-off)] border-border-medium'
          } peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[var(--color-focus-ring)] peer-focus-visible:outline-offset-[2px]`}
        >
          <div
            className={`absolute top-[3px] w-[16px] h-[16px] rounded-full transition-all duration-small ease-settle ${
              isChecked
                ? 'left-[23px] bg-bg-primary'
                : 'left-[3px] bg-text-secondary'
            }`}
          />
        </div>
      </div>
      <span className="font-body text-base text-text-primary">{label}</span>
    </label>
  );
}
