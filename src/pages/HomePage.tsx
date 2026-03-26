import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { WordCloud } from '../components/WordCloud';
import { pageVariants } from '../lib/animations';
import { ArrowDown, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

/* ── Scroll Reveal ── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Typing Animation ── */
function TypewriterText({ phrases }: { phrases: string[] }) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhrase];
    const speed = isDeleting ? 40 : 70;

    if (!isDeleting && displayText === phrase) {
      const timeout = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? phrase.substring(0, displayText.length - 1)
          : phrase.substring(0, displayText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhrase, phrases]);

  return (
    <span className="text-accent-warm">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-accent-warm ml-[2px] align-middle"
      />
    </span>
  );
}

/* ── Marquee Line ── */
function MarqueeWords() {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';
  const words = useMemo(() => [
    'release', 'breathe', 'feel', 'let go', 'soften', 'exhale',
    'unburden', 'surrender', 'be still', 'heal', 'rest', 'flow',
    'release', 'breathe', 'feel', 'let go', 'soften', 'exhale',
    'unburden', 'surrender', 'be still', 'heal', 'rest', 'flow',
  ], []);

  return (
    <div
      className="w-full overflow-hidden py-xl relative"
      style={{
        maskImage: isLight 
           ? 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' 
           : 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: isLight 
           ? 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' 
           : 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
    >
      {isLight && <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-bg-primary opacity-20 pointer-events-none" />}
      <motion.div
        className="flex gap-xl whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            className={`font-display text-[clamp(1.5rem,3vw,2.25rem)] italic select-none transition-colors duration-500 ${
                isLight ? 'text-accent-lavender/30 mix-blend-multiply' : 'text-text-muted'
            }`}
            style={isLight ? { textShadow: '0 2px 10px rgba(98,78,120,0.1)' } : undefined}
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Interactive Breathing Guide ── */
function InteractiveBreathingPreview() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  const runPhase = useCallback(() => {
    if (!isActive) return;
    const durations = { inhale: 4000, hold: 4000, exhale: 6000 };
    const next = { inhale: 'hold' as const, hold: 'exhale' as const, exhale: 'inhale' as const };
    timerRef.current = setTimeout(() => {
      setPhase((p) => next[p]);
    }, durations[phase]);
  }, [isActive, phase]);

  useEffect(() => {
    runPhase();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [runPhase]);

  const phaseLabel = { inhale: 'Breathe in...', hold: 'Hold gently...', exhale: 'Let it go...' };
  const phaseScale = { inhale: 1.35, hold: 1.35, exhale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center gap-lg relative"
    >
      {/* Light Mode Glow */}
      {isLight && <div className="absolute inset-0 bg-accent-sage/10 blur-[80px] rounded-full pointer-events-none transform scale-150 opacity-40" />}

      {/* The breathing circle */}
      <div
        className="relative flex items-center justify-center cursor-pointer z-10"
        onClick={() => setIsActive(!isActive)}
      >
        {/* Outer ring */}
        <motion.div
          className={`absolute w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full ${
            isLight ? 'border border-accent-sage/20 bg-accent-sage/5 mix-blend-multiply' : 'border border-border-subtle'
          }`}
          animate={isActive ? { scale: phaseScale[phase], opacity: isLight ? 0.6 : 0.3 } : { scale: 1, opacity: 0.15 }}
          transition={{ duration: isActive ? (phase === 'hold' ? 0.1 : phase === 'inhale' ? 4 : 6) : 0.5, ease: [0.37, 0, 0.63, 1] }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] rounded-full"
          style={{ 
             backgroundColor: isLight ? '#7aa086' : 'var(--color-accent-sage)', // darker sage for light mode mix-blend
             opacity: isLight ? 0.15 : 0.06,
             mixBlendMode: isLight ? 'multiply' : 'normal'
          }}
          animate={isActive ? { scale: phaseScale[phase] } : { scale: 1 }}
          transition={{ duration: isActive ? (phase === 'hold' ? 0.1 : phase === 'inhale' ? 4 : 6) : 0.5, ease: [0.37, 0, 0.63, 1], delay: 0.1 }}
        />
        {/* Inner circle */}
        <motion.div
          className={`w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center relative overflow-hidden ${
             isLight ? 'backdrop-blur-sm' : ''
          }`}
          style={{ 
             backgroundColor: isLight ? 'rgba(235,242,235,0.8)' : 'var(--color-surface-sage-light)',
             boxShadow: isLight && isActive 
                ? '0 10px 40px rgba(69,115,88,0.25), inset 0 0 20px rgba(255,255,255,0.8)' 
                : 'none'
          }}
          animate={isActive
            ? { scale: phaseScale[phase], boxShadow: isLight ? '0 10px 40px rgba(69,115,88,0.25), inset 0 0 20px rgba(255,255,255,0.8)' : '0 0 60px var(--color-accent-sage)' }
            : { scale: [1, 1.04, 1], boxShadow: '0 0 0px transparent' }
          }
          transition={isActive
            ? { duration: phase === 'hold' ? 0.1 : phase === 'inhale' ? 4 : 6, ease: [0.37, 0, 0.63, 1] }
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {isLight && <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-50" />}
          
          <AnimatePresence mode="wait">
            <motion.span
              key={isActive ? phase : 'idle'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`font-display text-sm text-center select-none px-xs relative z-10 ${
                 isLight ? 'text-[#4a6b54] font-medium' : 'text-accent-sage'
              }`}
            >
              {isActive ? phaseLabel[phase] : 'tap to try'}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <p className={`text-xs text-center max-w-[260px] ${isLight ? 'text-text-secondary/80' : 'text-text-muted'}`}>
        {isActive ? 'Follow the circle. Breathe with it.' : 'A quick breathing exercise. Try it right here.'}
      </p>

      {isActive && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setIsActive(false); setPhase('inhale'); }}
          className={`text-xs underline underline-offset-[3px] bg-transparent border-none cursor-pointer font-body transition-colors duration-micro ${
             isLight ? 'text-text-secondary hover:text-[#8e4530]' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          stop
        </motion.button>
      )}
    </motion.div>
  );
}

/* ── Interactive Release Demo ── */
function InteractiveReleaseDemo() {
  const [text, setText] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  const handleRelease = () => {
    if (!text.trim()) return;
    setIsDissolving(true);
    setTimeout(() => {
      setIsDissolving(false);
      setText('');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }, 1800);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-[480px] mx-auto relative"
    >
      {isLight && <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent blur-xl -z-10 rounded-3xl" />}
      
      <div className="relative group">
        <motion.textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Try it. Write something small, then let it go..."
          className={`w-full border rounded-lg px-lg py-md font-mono text-sm leading-relaxed resize-none outline-none h-[100px] sm:h-[120px] transition-all duration-medium ease-comfort placeholder:font-display placeholder:italic ${
             isLight 
               ? 'bg-white/60 border-white/50 text-[#4a3b5e] placeholder:text-[#4a3b5e]/40 focus:bg-white/80 focus:border-[#d8b4a0] focus:shadow-[0_4px_20px_rgba(216,180,160,0.15)] shadow-sm' 
               : 'bg-bg-input border-border-subtle text-text-primary focus:border-border-focus focus:bg-bg-input-focus placeholder:text-text-placeholder'
          }`}
          animate={isDissolving ? { opacity: 0, scale: 0.97, filter: 'blur(6px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <p className={`font-display text-md italic ${isLight ? 'text-[#624e78]' : 'text-accent-sage'}`}>
                Gone. You&apos;re lighter now.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {text.trim() && !isDissolving && !showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-sm"
        >
          <button
            onClick={handleRelease}
            className={`font-body text-sm rounded-full px-lg py-[8px] cursor-pointer transition-all duration-small ease-comfort border ${
               isLight
                 ? 'text-[#8e4530] border-[#d8b4a0] hover:bg-[#d8b4a0]/10 hover:shadow-md hover:shadow-[#d8b4a0]/10'
                 : 'text-accent-warm bg-transparent border-accent-warm hover:bg-[var(--color-surface-warm-light)]'
            }`}
          >
            Let it dissolve
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Ambient Mood Landscape ── */
function MoodLandscape() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const [touchedWords, setTouchedWords] = useState<Set<string>>(new Set());
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const trailId = useRef(0);
  const lastTrailTime = useRef(0);
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  const words = ['release', 'breathe', 'soften', 'rest', 'heal'];
  const wordPositions = [
    { left: 12, top: 22 },
    { left: 22, top: 68 },
    { left: 50, top: 82 },
    { left: 65, top: 18 },
    { left: 82, top: 52 },
  ];

  const rippleColors = [
    'var(--color-accent-warm)',
    'var(--color-accent-rose)',
    'var(--color-accent-sage)',
    'var(--color-accent-lavender)',
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });

    // Drop trail dots every 60ms
    const now = Date.now();
    if (now - lastTrailTime.current > 60) {
      lastTrailTime.current = now;
      const id = trailId.current++;
      setTrail(prev => [...prev.slice(-14), { id, x: x * 100, y: y * 100 }]);
      setTimeout(() => {
        setTrail(prev => prev.filter(t => t.id !== id));
      }, 800);
    }

    // Check proximity to words
    words.forEach((word, i) => {
      const wordX = wordPositions[i].left / 100;
      const wordY = wordPositions[i].top / 100;
      const dist = Math.sqrt((x - wordX) ** 2 + (y - wordY) ** 2);
      if (dist < 0.1) {
        setTouchedWords(prev => {
          if (prev.has(word)) return prev;
          const next = new Set(prev);
          next.add(word);
          return next;
        });
      }
    });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Double ripple with different colors
    const color = rippleColors[rippleId.current % rippleColors.length];
    const id1 = rippleId.current++;
    const id2 = rippleId.current++;
    setRipples(prev => [
      ...prev,
      { id: id1, x, y, color },
      { id: id2, x, y, color: rippleColors[(id2) % rippleColors.length] },
    ]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id1)), 1800);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id2)), 2400);

    // Burst particles on click
    const burstCount = 8;
    const newParticles = Array.from({ length: burstCount }, (_, i) => ({
      id: rippleId.current++,
      x,
      y,
      angle: (i / burstCount) * 360,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const allTouched = touchedWords.size === words.length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative w-full h-[260px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden cursor-none ${
         isLight ? 'border border-[#d8b4a0]/20 shadow-[inset_0_0_40px_rgba(216,180,160,0.1)]' : 'border border-border-subtle'
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setTrail([]); }}
      onClick={handleClick}
    >
      {/* Background */}
      <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-br from-[#f8f3eb] via-[#f4efe9] to-[#efe9e4]' : 'bg-bg-secondary'}`} />

      {/* Custom cursor glow — instant follow, no lag */}
      {isHovering && (
        <>
          {/* Inner bright core */}
          <div
            className="absolute w-[24px] h-[24px] rounded-full pointer-events-none z-[10]"
            style={{
              left: `calc(${mousePos.x * 100}% - 12px)`,
              top: `calc(${mousePos.y * 100}% - 12px)`,
              background: isLight
                ? 'radial-gradient(circle, rgba(216,180,160,0.9) 0%, rgba(216,180,160,0.4) 40%, transparent 70%)'
                : 'radial-gradient(circle, var(--color-accent-warm) 0%, rgba(168,85,63,0.4) 40%, transparent 70%)',
              boxShadow: isLight
                ? '0 0 24px 6px rgba(216,180,160,0.4), 0 0 60px 10px rgba(142,69,48,0.1)'
                : '0 0 24px 6px var(--color-accent-warm), 0 0 60px 10px rgba(168,85,63,0.15)',
            }}
          />
          {/* Outer soft glow */}
          <div
            className="absolute w-[160px] h-[160px] rounded-full pointer-events-none z-[5]"
            style={{
              left: `calc(${mousePos.x * 100}% - 80px)`,
              top: `calc(${mousePos.y * 100}% - 80px)`,
              background: isLight 
                 ? 'radial-gradient(circle, rgba(216,180,160,0.3) 0%, transparent 70%)'
                 : 'radial-gradient(circle, var(--color-accent-warm) 0%, transparent 70%)',
              opacity: isLight ? 0.4 : 0.18,
            }}
          />
        </>
      )}

      {/* Mouse trail */}
      <AnimatePresence>
        {trail.map((dot, i) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full pointer-events-none z-[6]"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              x: '-50%',
              y: '-50%',
              backgroundColor: isLight ? '#d8b4a0' : 'var(--color-accent-warm)',
            }}
            initial={{ width: 8, height: 8, opacity: 0.4 }}
            animate={{ width: 3, height: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.01 }}
          />
        ))}
      </AnimatePresence>

      {/* Responsive orbs that follow mouse */}
      <motion.div
        className="absolute w-[300px] h-[300px] max-[639px]:w-[150px] max-[639px]:h-[150px] rounded-full blur-[100px]"
        style={{ 
           backgroundColor: isLight ? '#e6b3cc' : 'var(--color-accent-rose)',
           opacity: isLight ? 0.3 : (theme === 'dark' ? 0.1 : 0.15),
           mixBlendMode: isLight ? 'multiply' : 'normal'
        }}
        animate={{
          x: mousePos.x * 100 - 50,
          y: mousePos.y * 80 - 40,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute right-[10%] bottom-[10%] w-[250px] h-[250px] max-[639px]:w-[120px] max-[639px]:h-[120px] rounded-full blur-[90px]"
        style={{ 
           backgroundColor: isLight ? '#8fb39e' : 'var(--color-accent-sage)',
           opacity: isLight ? 0.25 : (theme === 'dark' ? 0.08 : 0.12),
           mixBlendMode: isLight ? 'multiply' : 'normal'
        }}
        animate={{
          x: -(mousePos.x * 70 - 35),
          y: -(mousePos.y * 50 - 25),
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute left-[20%] top-[15%] w-[220px] h-[220px] max-[639px]:w-[100px] max-[639px]:h-[100px] rounded-full blur-[80px]"
        style={{ 
           backgroundColor: isLight ? '#b5a4c9' : 'var(--color-accent-lavender)',
           opacity: isLight ? 0.25 : (theme === 'dark' ? 0.07 : 0.11),
           mixBlendMode: isLight ? 'multiply' : 'normal'
        }}
        animate={{
          x: mousePos.x * 50 - 25,
          y: -(mousePos.y * 40 - 20),
        }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />

      {/* Click ripples — double ring */}
      <AnimatePresence>
        {ripples.map((ripple, i) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              x: '-50%',
              y: '-50%',
              borderWidth: i % 2 === 0 ? 1.5 : 1,
              borderStyle: 'solid',
              borderColor: isLight ? '#d8b4a0' : ripple.color,
            }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{
              width: i % 2 === 0 ? 220 : 300,
              height: i % 2 === 0 ? 220 : 300,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: i % 2 === 0 ? 1.5 : 2.2,
              ease: 'easeOut',
              delay: i % 2 === 0 ? 0 : 0.15,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Click burst particles */}
      <AnimatePresence>
        {particles.map(p => {
          const rad = (p.angle * Math.PI) / 180;
          const dist = 60 + Math.random() * 30;
          return (
            <motion.div
              key={p.id}
              className="absolute w-[4px] h-[4px] rounded-full pointer-events-none z-[7]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: isLight ? '#d8b4a0' : 'var(--color-accent-warm)',
              }}
              initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
              animate={{
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist,
                opacity: 0,
                scale: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          );
        })}
      </AnimatePresence>

      {/* Floating grid lines that react to mouse */}
      {[0.25, 0.5, 0.75].map(pos => (
        <motion.div
          key={`h-${pos}`}
          className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{
            top: `${pos * 100}%`,
            background: isLight 
              ? 'linear-gradient(90deg, transparent, rgba(98,78,120,0.1), transparent)'
              : 'linear-gradient(90deg, transparent, var(--color-border-subtle), transparent)',
          }}
          animate={{
            opacity: isHovering ? 0.15 + Math.max(0, 1 - Math.abs(mousePos.y - pos) / 0.2) * 0.2 : 0.05,
            scaleY: 1 + Math.max(0, 1 - Math.abs(mousePos.y - pos) / 0.15) * 2,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
      {[0.25, 0.5, 0.75].map(pos => (
        <motion.div
          key={`v-${pos}`}
          className="absolute top-0 bottom-0 w-[1px] pointer-events-none"
          style={{
            left: `${pos * 100}%`,
            background: isLight 
              ? 'linear-gradient(180deg, transparent, rgba(98,78,120,0.1), transparent)'
              : 'linear-gradient(180deg, transparent, var(--color-border-subtle), transparent)',
          }}
          animate={{
            opacity: isHovering ? 0.15 + Math.max(0, 1 - Math.abs(mousePos.x - pos) / 0.2) * 0.2 : 0.05,
            scaleX: 1 + Math.max(0, 1 - Math.abs(mousePos.x - pos) / 0.15) * 2,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}

      {/* Interactive floating words */}
      {words.map((word, i) => {
        const isTouched = touchedWords.has(word);
        const wordX = wordPositions[i].left / 100;
        const wordY = wordPositions[i].top / 100;
        const distToMouse = Math.sqrt((mousePos.x - wordX) ** 2 + (mousePos.y - wordY) ** 2);
        const proximity = Math.max(0, 1 - distToMouse / 0.2);

        return (
          <motion.span
            key={word}
            className="absolute font-display italic select-none pointer-events-none z-[8] max-[639px]:text-[13px]"
            style={{
              fontSize: `${17 + i * 3}px`,
              left: `${wordPositions[i].left}%`,
              top: `${wordPositions[i].top}%`,
            }}
            animate={{
              opacity: isTouched ? 0.85 : 0.08 + proximity * 0.6,
              scale: isTouched ? 1.1 : 1 + proximity * 0.2,
              y: [0, -8 - i * 2, 0],
              x: [0, 4 + i, 0],
              textShadow: isTouched
                ? (isLight ? '0 0 20px rgba(142,69,48,0.5)' : '0 0 20px var(--color-accent-warm)')
                : proximity > 0.3
                ? (isLight ? '0 0 12px rgba(142,69,48,0.3)' : '0 0 12px var(--color-accent-warm)')
                : '0 0 0px transparent',
              color: isTouched
                ? (isLight ? '#8e4530' : 'var(--color-accent-warm)')
                : proximity > 0
                ? (isLight ? '#624e78' : 'var(--color-text-secondary)')
                : (isLight ? 'rgba(98,78,120,0.4)' : 'var(--color-text-muted)'),
            }}
            transition={{
              y: { duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 },
              x: { duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
              color: { duration: 0.25 },
              textShadow: { duration: 0.25 },
            }}
          >
            {word}
          </motion.span>
        );
      })}

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center z-[9]">
        <div className="text-center">
          <AnimatePresence mode="wait">
            {allTouched ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p className={`font-display text-[22px] italic mb-2xs ${isLight ? 'text-[#8e4530]' : 'text-accent-warm'}`}
                  style={{ textShadow: isLight ? '0 0 30px rgba(142,69,48,0.4)' : '0 0 30px var(--color-accent-warm)' }}>
                  You found them all
                </p>
                <p className="text-xs text-text-secondary">
                  This space is yours. Click anywhere.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <p className={`font-display text-lg italic mb-2xs ${isLight ? 'text-[#4a3b5e]' : 'text-text-primary'}`}>
                  {isHovering ? 'Keep exploring' : 'Move your cursor'}
                </p>
                <p className={`text-xs ${isLight ? 'text-[#4a3b5e]/60' : 'text-text-muted'}`}>
                  {isHovering
                    ? `${touchedWords.size} of ${words.length} words discovered`
                    : 'Hover close to reveal hidden words'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 flex gap-[8px] z-[9]">
        {words.map((word) => (
          <motion.div
            key={word}
            className="rounded-full"
            animate={{
              backgroundColor: touchedWords.has(word)
                ? (isLight ? '#8e4530' : 'var(--color-accent-warm)')
                : (isLight ? 'rgba(98,78,120,0.2)' : 'var(--color-border-subtle)'),
              scale: touchedWords.has(word) ? [1, 1.6, 1.2] : 1,
              width: touchedWords.has(word) ? 8 : 6,
              height: touchedWords.has(word) ? 8 : 6,
              boxShadow: touchedWords.has(word)
                ? (isLight ? '0 0 8px rgba(142,69,48,0.5)' : '0 0 8px var(--color-accent-warm)')
                : '0 0 0px transparent',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Coordinate display — bottom right */}
      {isHovering && (
        <motion.div
          className={`absolute bottom-[14px] right-[16px] z-[9] font-mono text-[10px] ${isLight ? 'text-[#4a3b5e]/40' : 'text-text-muted'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          style={{ letterSpacing: '0.05em' }}
        >
          {Math.round(mousePos.x * 100)}, {Math.round(mousePos.y * 100)}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Companion Button ── */
function CompanionButton() {
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';
  
  return (
    <motion.button
      onClick={() => navigate('/companion')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-lavender)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)] transition-all duration-300 ${
        isLight ? 'shadow-[0_8px_30px_rgba(98,78,120,0.15)] hover:shadow-[0_12px_40px_rgba(98,78,120,0.25)]' : 'shadow-lg shadow-[var(--color-accent-lavender)]/20 hover:shadow-[var(--color-accent-lavender)]/40'
      }`}
    >
      <span className={`absolute inset-[-1000%] animate-[spin_3s_linear_infinite] opacity-70 ${
        isLight ? 'bg-[conic-gradient(from_90deg_at_50%_50%,#b5a4c9_0%,#d8b4a0_50%,#b5a4c9_100%)]' : 'bg-[conic-gradient(from_90deg_at_50%_50%,var(--color-accent-lavender)_0%,var(--color-accent-rose)_50%,var(--color-accent-lavender)_100%)]'
      }`} />
      <span className={`relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-8 py-3.5 text-base font-medium backdrop-blur-sm transition-all duration-300 ${
        isLight 
          ? 'bg-[#f8f3eb]/90 text-[#4a3b5e] group-hover:text-[#8e4530] border border-white/50' 
          : 'bg-[var(--color-bg-primary)]/90 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-warm)]'
      }`}>
        <Sparkles size={18} className={`mr-2 transition-colors duration-300 group-hover:animate-pulse ${
            isLight ? 'text-[#8e4530]' : 'text-[var(--color-accent-lavender)] group-hover:text-[var(--color-accent-warm)]'
        }`} />
        <span className="font-display tracking-wide font-semibold">Talk to Companion</span>
      </span>
    </motion.button>
  );
}

/* ── Main Page ── */
export function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      {/* Light mode ambient background layout */}
      {isLight && (
        <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-accent-sage/5 rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
           <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vh] bg-accent-warm/5 rounded-full blur-[100px] opacity-50 mix-blend-multiply" />
           <div className="absolute top-[40%] left-[-10%] w-[60vw] h-[60vh] bg-accent-lavender/5 rounded-full blur-[100px] opacity-50 mix-blend-multiply" />
        </div>
      )}

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-[80vh] sm:min-h-[92vh] flex flex-col justify-center items-center">
        <WordCloud />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-[1] w-full max-w-[700px] mx-auto flex flex-col items-center text-center gap-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            className="relative"
          >
            {isLight && (
               <div className="absolute -inset-12 bg-gradient-radial from-white/40 to-transparent blur-2xl rounded-full pointer-events-none" />
            )}
            <h1 className="font-display text-text-primary leading-[1.08] tracking-[-0.03em] relative z-10"
                style={isLight ? { textShadow: '0 2px 10px rgba(255,255,255,0.5)' } : undefined}
            >
              A safe place to
              <br />
              <TypewriterText phrases={['let it out.', 'feel everything.', 'breathe again.', 'start healing.', 'find peace.', 'be yourself.', 'speak freely.', 'let go.', 'unburden your soul.', 'embrace the quiet.', 'soften your heart.', 'simply exist.']} />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.6 }}
            className="font-body text-md text-text-secondary leading-relaxed max-w-[440px] relative z-10"
          >
            Write what you can&apos;t say out loud. Keep it, or let it dissolve.
            No one will ever see it but you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.9 }}
            className="flex flex-col items-center gap-md mt-sm relative z-10"
          >
            <div className="flex flex-col sm:flex-row items-center gap-md w-full justify-center">
              <Button variant="rant" onClick={() => navigate('/rant')}>
                Let it out →
              </Button>
              <CompanionButton />
            </div>
            <p className="text-xs text-text-muted mt-2xs select-none flex items-center gap-2 opacity-80">
              <Shield size={10} className="text-accent-sage" />
              Free forever · Safe & secure · Private by design
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-[36px] left-1/2 -translate-x-1/2 z-[1]"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} className="text-text-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Marquee ─── */}
      <MarqueeWords />

      {/* ─── Try It Now — Interactive Release ─── */}
      <section className="py-2xl sm:py-3xl max-w-[720px] mx-auto relative">
        <div className={`absolute inset-0 rounded-[32px] pointer-events-none ${
           isLight 
             ? 'bg-gradient-to-b from-[#f8f3eb] via-transparent to-transparent opacity-80 backdrop-blur-3xl' 
             : 'bg-gradient-to-b from-[var(--color-surface-warm-light)] via-transparent to-transparent opacity-60'
        }`} />
        <RevealSection>
          <div className="text-center mb-2xl relative z-[1]">
            <p className="text-xs text-text-muted uppercase tracking-[0.15em] mb-2xs">
              Try it right now
            </p>
            <h2 className="font-display text-text-primary mb-xs">
              Write something small.<br />Then let it go.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[360px] mx-auto">
              This doesn&apos;t get saved. It&apos;s just for you, right here.
            </p>
          </div>
        </RevealSection>

        <InteractiveReleaseDemo />
      </section>

      {/* ─── Thin Divider ─── */}
      <div className="flex items-center justify-center gap-[12px] py-[4px]">
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-r from-transparent to-[#d8b4a0]/40' : 'bg-gradient-to-r from-transparent to-border-medium'}`} />
        <div className={`w-[5px] h-[5px] rounded-full ${isLight ? 'bg-[#8e4530]' : 'bg-accent-warm'} opacity-30`} />
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-l from-transparent to-[#d8b4a0]/40' : 'bg-gradient-to-l from-transparent to-border-medium'}`} />
      </div>

      {/* ─── Interactive Mood Landscape ─── */}
      <section className="py-2xl sm:py-3xl max-w-[720px] mx-auto relative">
        <div className={`absolute inset-0 rounded-[32px] pointer-events-none ${
           isLight 
             ? 'bg-gradient-to-b from-[#f4efe9] via-transparent to-transparent opacity-80 backdrop-blur-3xl' 
             : 'bg-gradient-to-b from-[var(--color-surface-lavender-light)] via-transparent to-transparent opacity-50'
        }`} />
        <RevealSection className="mb-2xl">
          <div className="text-center relative z-[1]">
            <p className="text-xs text-text-muted uppercase tracking-[0.15em] mb-2xs">
              Your atmosphere
            </p>
            <h2 className="font-display text-text-primary mb-xs">
              A space that responds to you.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[380px] mx-auto">
              Every corner of Solace is designed to feel alive. Gentle,
              responsive, and entirely yours.
            </p>
          </div>
        </RevealSection>

        <RevealSection delay={0.15}>
          <MoodLandscape />
        </RevealSection>
      </section>

      {/* ─── Thin Divider ─── */}
      <div className="flex items-center justify-center gap-[12px] py-[4px]">
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-r from-transparent to-[#b5a4c9]/40' : 'bg-gradient-to-r from-transparent to-border-medium'}`} />
        <div className={`w-[5px] h-[5px] rounded-full ${isLight ? 'bg-[#624e78]' : 'bg-accent-warm'} opacity-30`} />
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-l from-transparent to-[#b5a4c9]/40' : 'bg-gradient-to-l from-transparent to-border-medium'}`} />
      </div>

      {/* ─── Breathing Exercise Preview ─── */}
      <section className="py-2xl sm:py-3xl max-w-[720px] mx-auto relative">
        <div className={`absolute inset-0 rounded-[32px] pointer-events-none ${
           isLight 
             ? 'bg-gradient-to-b from-[#ebf2eb] via-transparent to-transparent opacity-80 backdrop-blur-3xl' 
             : 'bg-gradient-to-b from-[var(--color-surface-sage-light)] via-transparent to-transparent opacity-50'
        }`} />
        <RevealSection className="mb-xl">
          <div className="text-center relative z-[1]">
            <p className="text-xs text-text-muted uppercase tracking-[0.15em] mb-2xs">
              Ground yourself
            </p>
            <h2 className="font-display text-text-primary mb-xs">
              Breathe with it.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[340px] mx-auto">
              A guided breathing exercise, whenever you need it.
            </p>
          </div>
        </RevealSection>

        <InteractiveBreathingPreview />
      </section>

      {/* ─── Thin Divider ─── */}
      <div className="flex items-center justify-center gap-[12px] py-[4px]">
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-r from-transparent to-[#8fb39e]/40' : 'bg-gradient-to-r from-transparent to-border-medium'}`} />
        <div className={`w-[5px] h-[5px] rounded-full ${isLight ? 'bg-[#4a6b54]' : 'bg-accent-warm'} opacity-30`} />
        <div className={`w-[40px] h-[1px] ${isLight ? 'bg-gradient-to-l from-transparent to-[#8fb39e]/40' : 'bg-gradient-to-l from-transparent to-border-medium'}`} />
      </div>



      {/* ─── Final CTA ─── */}
      <RevealSection className="py-2xl sm:py-3xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <p className="text-xs text-text-muted uppercase tracking-[0.15em]">
            Your safe space awaits
          </p>
          <h2 className="font-display text-xl text-text-primary">
            Ready when you are.
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[320px]">
            Completely private. Nothing stored on any server. Just you and this space.
          </p>
          <div className="mt-xs">
            <Button variant="rant" onClick={() => navigate('/rant')}>
              Let it out →
            </Button>
          </div>
        </div>
      </RevealSection>
    </motion.div>
  );
}
