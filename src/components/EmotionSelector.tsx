import { motion } from 'framer-motion';
import { useStore, type Mood } from '../store/useStore';
import { EMOTIONS } from '../lib/constants';
import { Zap, Sparkles, Cloud } from 'lucide-react';

export function EmotionSelector() {
  const { mood, setMood, intensity, setIntensity } = useStore();

  const handleSelect = (emotion: string) => {
    setMood(emotion as Mood);
  };

  const categories = [
    {
      title: 'High Energy',
      emotions: ['angry', 'frustrated', 'overwhelmed', 'excited', 'passionate', 'empowered', 'euphoric'],
    },
    {
      title: 'Heavy',
      emotions: ['sad', 'lonely', 'lost', 'numb', 'exhausted', 'insecure', 'confused', 'anxious', 'stressed', 'restless', 'panicked'],
    },
    {
      title: 'Light',
      emotions: ['calm', 'hopeful', 'grateful', 'proud', 'inspired', 'loved', 'peaceful'],
    },
  ];

  const currentEmotion = EMOTIONS.find((e) => e.key === mood);
  const activeColor = currentEmotion?.color || 'var(--color-accent-warm)';

  return (
    <div className="flex flex-col gap-lg">
      <p
        id="emotion-prompt"
        className="font-body text-md leading-relaxed text-text-secondary text-center"
      >
        How are you feeling right now?
      </p>

      <div
        role="radiogroup"
        aria-labelledby="emotion-prompt"
        className="grid grid-cols-1 md:grid-cols-2 gap-md items-start w-full"
      >
        {/* High Energy */}
        <div className="relative overflow-hidden flex flex-col gap-sm w-full bg-gradient-to-br from-bg-card/80 to-bg-card/30 rounded-2xl p-lg border border-border-subtle/40 h-full backdrop-blur-sm transition-colors hover:border-accent-warm/20 group/card">
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-warm/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           
           <div className="flex items-center gap-2 mb-1 relative z-10">
             <div className="p-1.5 rounded-lg bg-accent-warm/10 text-accent-warm">
               <Zap size={14} />
             </div>
             <span className="text-xs uppercase tracking-widest text-text-secondary font-medium opacity-80">
               High Energy
             </span>
           </div>

           <div className="grid grid-cols-2 gap-2 relative z-10">
             {EMOTIONS.filter((em) => categories[0].emotions.includes(em.key)).map((em) => {
               const isSelected = mood === em.key;
               return (
                 <motion.button
                   key={em.key}
                   role="radio"
                   aria-checked={isSelected}
                   aria-label={em.label}
                   data-emotion={em.key}
                   onClick={() => handleSelect(em.key)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-small ease-settle select-none w-full ${
                     isSelected
                       ? 'border-current bg-bg-secondary/90 shadow-sm'
                       : 'border-transparent bg-bg-secondary/30 hover:bg-bg-secondary/50 hover:border-border-subtle'
                   }`}
                   style={{
                     color: isSelected ? em.color : undefined,
                     WebkitTapHighlightColor: 'transparent',
                     borderColor: isSelected ? em.color : 'transparent',
                   }}
                 >
                   <span
                     className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-80"
                     style={{ backgroundColor: em.color }}
                   />
                   <span
                     className={`font-body text-xs font-medium whitespace-nowrap transition-colors duration-micro ease-comfort ${
                       isSelected ? 'text-text-primary' : 'text-text-secondary/80'
                     }`}
                   >
                     {em.label}
                   </span>
                 </motion.button>
               );
             })}
           </div>
        </div>

        {/* Light */}
        <div className="relative overflow-hidden flex flex-col gap-sm w-full bg-gradient-to-br from-bg-card/80 to-bg-card/30 rounded-2xl p-lg border border-border-subtle/40 h-full backdrop-blur-sm transition-colors hover:border-accent-sage/20 group/card">
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-sage/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

           <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="p-1.5 rounded-lg bg-accent-sage/10 text-accent-sage">
                <Sparkles size={14} />
              </div>
              <span className="text-xs uppercase tracking-widest text-text-secondary font-medium opacity-80">
                Light
              </span>
           </div>

           <div className="grid grid-cols-2 gap-2 relative z-10">
             {EMOTIONS.filter((em) => categories[2].emotions.includes(em.key)).map((em) => {
               const isSelected = mood === em.key;
               return (
                 <motion.button
                   key={em.key}
                   role="radio"
                   aria-checked={isSelected}
                   aria-label={em.label}
                   data-emotion={em.key}
                   onClick={() => handleSelect(em.key)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-small ease-settle select-none w-full ${
                     isSelected
                       ? 'border-current bg-bg-secondary/90 shadow-sm'
                       : 'border-transparent bg-bg-secondary/30 hover:bg-bg-secondary/50 hover:border-border-subtle'
                   }`}
                   style={{
                     color: isSelected ? em.color : undefined,
                     WebkitTapHighlightColor: 'transparent',
                     borderColor: isSelected ? em.color : 'transparent',
                   }}
                 >
                   <span
                     className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-80"
                     style={{ backgroundColor: em.color }}
                   />
                   <span
                     className={`font-body text-xs font-medium whitespace-nowrap transition-colors duration-micro ease-comfort ${
                       isSelected ? 'text-text-primary' : 'text-text-secondary/80'
                     }`}
                   >
                     {em.label}
                   </span>
                 </motion.button>
               );
             })}
           </div>
        </div>

        {/* Heavy - Spans Full Width */}
        <div className="relative overflow-hidden flex flex-col gap-sm w-full bg-gradient-to-br from-bg-card/80 to-bg-card/30 rounded-2xl p-lg border border-border-subtle/40 md:col-span-2 backdrop-blur-sm transition-colors hover:border-accent-lavender/20 group/card">
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent-lavender/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

           <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="p-1.5 rounded-lg bg-accent-lavender/10 text-accent-lavender">
                <Cloud size={14} />
              </div>
              <span className="text-xs uppercase tracking-widest text-text-secondary font-medium opacity-80">
                Heavy
              </span>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 relative z-10">
             {EMOTIONS.filter((em) => categories[1].emotions.includes(em.key)).map((em) => {
               const isSelected = mood === em.key;
               return (
                 <motion.button
                   key={em.key}
                   role="radio"
                   aria-checked={isSelected}
                   aria-label={em.label}
                   data-emotion={em.key}
                   onClick={() => handleSelect(em.key)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-small ease-settle select-none w-full ${
                     isSelected
                       ? 'border-current bg-bg-secondary/90 shadow-sm'
                       : 'border-transparent bg-bg-secondary/30 hover:bg-bg-secondary/50 hover:border-border-subtle'
                   }`}
                   style={{
                     color: isSelected ? em.color : undefined,
                     WebkitTapHighlightColor: 'transparent',
                     borderColor: isSelected ? em.color : 'transparent',
                   }}
                 >
                   <span
                     className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-80"
                     style={{ backgroundColor: em.color }}
                   />
                   <span
                     className={`font-body text-xs font-medium whitespace-nowrap transition-colors duration-micro ease-comfort ${
                       isSelected ? 'text-text-primary' : 'text-text-secondary/80'
                     }`}
                   >
                     {em.label}
                   </span>
                 </motion.button>
               );
             })}
           </div>
        </div>
      </div>

      {/* Intensity slider */}
      {mood !== 'neutral' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-md mx-auto mt-sm p-6 rounded-2xl bg-bg-card/40 border border-border-subtle/30 backdrop-blur-md"
        >
           <div className="flex justify-between items-center mb-5 px-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-medium">Mild</span>
              <span className="text-xs font-mono text-text-primary/90">
                  Intensity <span style={{ color: activeColor }} className="font-bold">{intensity}</span>/5
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-medium">Intense</span>
           </div>

           <div className="relative h-8 flex items-center">
              {/* Track Background Line */}
              <div className="absolute inset-x-0 h-[2px] bg-border-subtle rounded-full overflow-hidden" />

              {/* Step Ticks */}
              <div className="absolute inset-x-0 flex justify-between px-[2px] pointer-events-none">
                 {[1, 2, 3, 4, 5].map((val) => (
                    <div 
                      key={val}
                      className="transition-all duration-300 flex items-center justify-center relative"
                      style={{
                         width: '16px',
                         height: '16px',
                      }}
                    >
                        {/* Outer Ring */}
                        <div 
                           className="absolute inset-0 rounded-full border-[1.5px] transition-all duration-300"
                           style={{
                               borderColor: val <= intensity ? activeColor : 'var(--color-border-subtle)',
                               opacity: val <= intensity ? 1 : 0.4,
                               transform: val === intensity ? 'scale(1.2)' : 'scale(0.8)',
                               backgroundColor: val <= intensity ? 'var(--color-bg-primary)' : 'transparent'
                           }}
                        />
                        
                        {/* Inner Dot (Active only) */}
                        <div 
                           className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                           style={{
                               backgroundColor: val <= intensity ? activeColor : 'transparent',
                               opacity: val <= intensity ? 1 : 0
                           }}
                        />
                    </div>
                 ))}
              </div>

              {/* Invisible Input for Interaction */}
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Set intensity"
              />
           </div>
        </motion.div>
      )}
    </div>
  );
}
