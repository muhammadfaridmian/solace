import { useEffect, useRef, useState } from 'react';
import { WORD_CLOUD_WORDS } from '../lib/constants';

interface WordPosition {
  word: string;
  left: string;
  top: string;
  driftSpeed: string;
  delay: string;
}

export function WordCloud() {
  const [words] = useState<WordPosition[]>(() =>
    WORD_CLOUD_WORDS.map((word) => ({
      word,
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 90}%`,
      driftSpeed: `${Math.random() * 10}s`,
      delay: `-${Math.random() * 20}s`,
    }))
  );

  const [faded, setFaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFaded(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-[600ms] ease-release ${
        faded ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="absolute font-display text-text-primary select-none whitespace-nowrap animate-word-drift"
          style={{
            fontSize: 'clamp(14px, 2vw, 24px)',
            opacity: 0.035,
            left: w.left,
            top: w.top,
            animationDuration: `calc(20s + ${w.driftSpeed})`,
            animationDelay: w.delay,
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}
