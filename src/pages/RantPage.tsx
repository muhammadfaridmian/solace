import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { RantBox } from '../components/RantBox';
import { EmotionSelector } from '../components/EmotionSelector';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { pageVariants } from '../lib/animations';
import { Wind, Shield, Clock, Flame } from 'lucide-react';

/* ── Ambient mood color bar ── */
function MoodAmbience() {
  const mood = useStore((s) => s.mood);
  const intensity = useStore((s) => s.intensity);

  const moodColors: Record<string, string> = {
    neutral: 'var(--color-accent-sage)',
    angry: 'var(--color-emotion-angry)',
    sad: 'var(--color-emotion-sad)',
    anxious: 'var(--color-emotion-anxious)',
    numb: 'var(--color-emotion-numb)',
    overwhelmed: 'var(--color-emotion-overwhelmed)',
    calm: 'var(--color-emotion-calm)',
    joy: 'var(--color-emotion-joy)',
    exhausted: 'var(--color-emotion-exhausted)',
    frustrated: 'var(--color-emotion-frustrated)',
    confused: 'var(--color-emotion-confused)',
    hopeful: 'var(--color-emotion-hopeful)',
    lonely: 'var(--color-emotion-lonely)',
    stressed: 'var(--color-emotion-stressed)',
    lost: 'var(--color-emotion-lost)',
    grateful: 'var(--color-emotion-grateful)',
    proud: 'var(--color-emotion-proud)',
  };

  const color = moodColors[mood] || moodColors.neutral;
  const theme = useStore((s) => s.theme);
  const opacity = mood === 'neutral' ? 0 : theme === 'dark' ? (0.03 + (intensity * 0.015)) : (0.06 + (intensity * 0.025));

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-below"
      animate={{ opacity }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      <div
        className="absolute inset-0 blur-[200px]"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

/* ── Writing prompts ── */
const PROMPTS = [
  "What's sitting heavy right now?",
  "If you could say one thing without consequences...",
  "What do you wish someone understood about you?",
  "What are you carrying that isn't yours to carry?",
  "What would you tell your past self?",
  "What are you afraid to say out loud?",
  "Describe exactly how your body feels right now.",
  "What needs to leave your mind today?",
  "Who or what are you grieving for today?",
  "What is the hardest thing to forgive right now?",
  "What small thing brought you a moment of peace?",
  "If your anxiety could speak, what would it say?",
  "What does 'safe' feel like to you?",
  "What is one thing you are proud of surviving?",
  "Write a letter to the person you were a year ago.",
  "What expectations are weighing you down?",
  "What would you do if you weren't afraid?",
  "What does your heart need right now?",
  "What is the kindest thing you can do for yourself today?",
  "Where do you feel tension in your body?",
  "What are you waiting for permission to do?",
  "Who do you miss, and why?",
  "What is one truth you are avoiding?",
  "If you could scream one sentence, what would it be?",
  "What does silence feel like to you right now?",
  "What memory brings you comfort?",
  "What part of yourself are you hiding?",
  "If you could pause time, what would you do?",
  "What is draining your energy the most?",
  "What does 'enough' look like for you?",
  "What is a boundary you need to set?",
  "Write about a moment you felt truly seen.",
  "What is making you feel lonely?",
  "What does your anger want to protect?",
  "If you could change one decision, what would you change?",
  "What is something you are grateful for, despite everything?",
  "Who has supported you recently?",
  "What does the best version of tomorrow look like?",
];

function WritingPrompt() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  const cyclePrompt = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentPrompt((p) => (p + 1) % PROMPTS.length);
      setIsVisible(true);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="flex flex-col items-center gap-sm"
    >
      <button
        onClick={() => {
          if (!isVisible) setIsVisible(true);
          else cyclePrompt();
        }}
        className={`text-xs text-text-muted border border-border-subtle rounded-full px-md py-[8px] cursor-pointer font-body transition-all duration-300 ease-comfort hover:text-text-primary hover:shadow-md hover:-translate-y-[1px] active:translate-y-[1px] ${
            isLight ? 'bg-bg-secondary/50 hover:border-accent-warm/30' : 'bg-transparent hover:border-border-medium shadow-xs hover:shadow-sm'
        }`}
        style={isLight ? {
             boxShadow: '0 2px 8px rgba(98,78,120,0.03), inset 0 1px 0 rgba(255,255,255,0.4)',
             backdropFilter: 'blur(4px)'
        } : undefined}
      >
        {isVisible ? 'another prompt' : 'need a prompt?'}
      </button>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentPrompt}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`relative px-lg py-sm rounded-lg mt-sm ${
                isLight ? 'bg-bg-card/40 backdrop-blur-sm border border-border-subtle/50' : ''
            }`}
            style={isLight ? {
                 boxShadow: '0 4px 20px rgba(98,78,120,0.04), inset 0 1px 0 rgba(255,255,255,0.2)'
            } : undefined}
          >
             <p className={`font-display text-base italic text-center max-w-[420px] leading-relaxed relative z-10 ${
                 isLight ? 'text-lg text-text-secondary' : 'text-text-secondary'
             }`}>
               {PROMPTS[currentPrompt]}
             </p>
             {isLight && (
                <>
                 <div className="absolute -top-2 -left-2 text-4xl text-border-subtle font-display opacity-30 select-none">“</div>
                 <div className="absolute -bottom-4 -right-2 text-4xl text-border-subtle font-display opacity-30 select-none">”</div>
                </>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Session timer ── */
function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    // Start timer when page loads
    const timer = setTimeout(() => setIsActive(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (seconds < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex items-center gap-2xs text-text-muted"
    >
      <Clock size={12} />
      <span className="text-xs tabular-nums font-mono">{formatTime(seconds)}</span>
    </motion.div>
  );
}

export function RantPage() {
  const { setBreathingActive, mood, theme } = useStore();
  const isLight = theme !== 'dark';
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  const moodMessages: Record<string, string> = {
    neutral: 'This space is yours. Write whatever you need to.',
    angry: 'Let it burn through the words. This page can take it.',
    sad: "It's okay to feel this. Let the words carry some of it.",
    anxious: 'Slow down. One word at a time. There\'s no rush here.',
    numb: "Even if you can't feel it, you can write it.",
    overwhelmed: 'You don\'t have to sort it out. Just let it spill.',
    calm: 'A good moment to reflect. Write what comes.',
    joy: 'Hold onto this feeling. Or just enjoy it.',
    exhausted: 'You don\'t need to make sense. Just let words fall.',
    frustrated: 'Say exactly what you mean. No filter needed here.',
    confused: 'You don\'t need answers right now. Just write.',
    hopeful: 'Something shifted. Put it into words.',
    lonely: 'No one is here but you. And that’s okay.',
    stressed: 'Unload the weight. One sentence at a time.',
    lost: 'You don’t have to know the way right now. Just be here.',
    grateful: 'What is good? Write it down so you remember.',
    proud: 'You did well. Acknowledge it.',
    insecure: 'You are enough. Even when you doubt it.',
    excited: 'Hold onto this energy. Let it lift you.',
    restless: 'Move through it. Let the words run fast.',
    panicked: 'Breathe. Just one word at a time. You are safe here.',
    inspired: 'Capture it before it fades.',
    loved: 'Let that warmth fill the page.',
    peaceful: 'Savor the quiet. Write it down to remember.',
    passionate: 'Let that fire burn on the page.',
    empowered: 'You are capable. Own this moment.',
    euphoric: 'Ride this wave. Capture the light.',
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-[720px] mx-auto relative"
    >
      {/* Light mode decorative ambient glow */}
      {isLight && <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-accent-rose blur-[160px] opacity-[0.06] pointer-events-none" />}
      <MoodAmbience />

      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-xl text-center relative"
      >
        <div className="flex items-center justify-center gap-sm mb-sm flex-wrap">
          <div className={`flex items-center gap-2xs px-xs py-[4px] rounded-full transition-all duration-300 ${isLight && mood !== 'neutral' ? 'bg-bg-secondary/50 backdrop-blur-sm border border-border-subtle' : ''}`}
             style={isLight && mood !== 'neutral' ? { boxShadow: '0 2px 8px rgba(98,78,120,0.04)' } : {}}
          >
            <Shield size={12} className="text-accent-sage" />
            <span className="text-xs text-text-muted font-medium tracking-wide">PRIVATE</span>
          </div>
          
          <div className={`flex items-center gap-2xs px-xs py-[4px] rounded-full transition-all duration-300 ${isLight && mood !== 'neutral' ? 'bg-bg-secondary/50 backdrop-blur-sm border border-border-subtle' : ''}`}
             style={isLight && mood !== 'neutral' ? { boxShadow: '0 2px 8px rgba(98,78,120,0.04)' } : {}}
          >
            <Flame size={12} className="text-accent-warm" />
            <span className="text-xs text-text-muted font-medium tracking-wide">EPHEMERAL</span>
          </div>

          <div className={`flex items-center gap-2xs px-xs py-[4px] rounded-full transition-all duration-300 ${isLight && mood !== 'neutral' ? 'bg-bg-secondary/50 backdrop-blur-sm border border-border-subtle' : ''}`}
             style={isLight && mood !== 'neutral' ? { boxShadow: '0 2px 8px rgba(98,78,120,0.04)' } : {}}
          >
             <SessionTimer />
          </div>
        </div>

        <h1 className="font-display text-text-primary mb-2xs relative inline-block">
          Your space
          {isLight && mood !== 'neutral' && (
             <motion.div 
               className="absolute -inset-8 blur-[40px] rounded-full -z-10 opacity-40 pointer-events-none mix-blend-multiply"
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.4, scale: [0.8, 1.1, 0.9] }}
               transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
               style={{ backgroundColor: 'var(--color-bg-overlay)' }} 
             />
          )}
        </h1>
        <motion.p
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-body text-sm text-text-secondary leading-relaxed max-w-[320px] sm:max-w-[420px] mx-auto"
        >
          {moodMessages[mood] || moodMessages.neutral}
        </motion.p>
      </motion.div>

      {/* Emotion Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        className={`mb-lg relative transition-all duration-700 ${isLight && mood !== 'neutral' ? 'p-md rounded-2xl' : ''}`}
        style={isLight && mood !== 'neutral' ? {
           background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
           boxShadow: '0 8px 32px rgba(98,78,120,0.04), inset 0 1px 0 rgba(255,255,255,0.4)',
           border: '1px solid rgba(255,255,255,0.2)',
           backdropFilter: 'blur(8px)'
        } : {}}
      >
        <EmotionSelector />
      </motion.div>

      {/* Writing Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-lg"
      >
        <WritingPrompt />
      </motion.div>

      {/* Rant Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        className="mb-xl"
      >
        <RantBox />
      </motion.div>

      {/* Bottom actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex items-center justify-center gap-md"
      >
        <Button
          variant="secondary"
          onClick={() => setBreathingActive(true)}
        >
          <Wind size={16} />
          Take a breath
        </Button>
      </motion.div>

      {/* Bottom spacer with ambient text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="mt-3xl mb-xl"
      >
        <p className="font-display text-sm italic text-text-muted text-center">
          Take as long as you need.
        </p>
      </motion.div>
    </motion.div>
  );
}
