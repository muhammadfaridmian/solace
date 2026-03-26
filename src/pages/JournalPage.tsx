import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore, type JournalEntry } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { pageVariants } from '../lib/animations';
import { Trash2, Clock, X } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { Modal } from '../components/ui/Modal';
import { addToast } from '../components/ui/Toast';

export function JournalPage() {
  const { journalEntries, removeJournalEntry } = useStore();
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  const moodConfig: Record<string, { color: string; label: string }> = {
    angry: { color: 'var(--color-emotion-angry)', label: 'Angry' },
    sad: { color: 'var(--color-emotion-sad)', label: 'Sad' },
    anxious: { color: 'var(--color-emotion-anxious)', label: 'Anxious' },
    numb: { color: 'var(--color-emotion-numb)', label: 'Numb' },
    overwhelmed: { color: 'var(--color-emotion-overwhelmed)', label: 'Overwhelmed' },
    calm: { color: 'var(--color-emotion-calm)', label: 'Calm' },
    joy: { color: 'var(--color-emotion-joy)', label: 'Joy' },
    neutral: { color: 'var(--color-accent-sage)', label: 'Neutral' },
    exhausted: { color: 'var(--color-emotion-exhausted)', label: 'Exhausted' },
    frustrated: { color: 'var(--color-emotion-frustrated)', label: 'Frustrated' },
    confused: { color: 'var(--color-emotion-confused)', label: 'Confused' },
    hopeful: { color: 'var(--color-emotion-hopeful)', label: 'Hopeful' },
    lonely: { color: 'var(--color-emotion-lonely)', label: 'Lonely' },
    stressed: { color: 'var(--color-emotion-stressed)', label: 'Stressed' },
    lost: { color: 'var(--color-emotion-lost)', label: 'Lost' },
    grateful: { color: 'var(--color-emotion-grateful)', label: 'Grateful' },
    proud: { color: 'var(--color-emotion-proud)', label: 'Proud' },
    insecure: { color: 'var(--color-emotion-insecure)', label: 'Insecure' },
    excited: { color: 'var(--color-emotion-excited)', label: 'Excited' },
    restless: { color: 'var(--color-emotion-restless)', label: 'Restless' },
    panicked: { color: 'var(--color-emotion-panicked)', label: 'Panicked' },
    inspired: { color: 'var(--color-emotion-inspired)', label: 'Inspired' },
    loved: { color: 'var(--color-emotion-loved)', label: 'Loved' },
    peaceful: { color: 'var(--color-emotion-peaceful)', label: 'Peaceful' },
    passionate: { color: 'var(--color-emotion-passionate)', label: 'Passionate' },
    empowered: { color: 'var(--color-emotion-empowered)', label: 'Empowered' },
    euphoric: { color: 'var(--color-emotion-euphoric)', label: 'Euphoric' },
  };

  const getMoodConfig = (mood: string) => moodConfig[mood] || moodConfig.neutral;

  const handleDelete = () => {
    if (deleteId) {
      removeJournalEntry(deleteId);
      setDeleteId(null);
      if (selectedEntry?.id === deleteId) setSelectedEntry(null);
      addToast('Entry removed.', 'info');
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    journalEntries.forEach((entry) => {
      const entryTime = new Date(entry.createdAt).getTime();
      if (entryTime >= todayStart) groups['Today'].push(entry);
      else if (entryTime >= yesterdayStart) groups['Yesterday'].push(entry);
      else if (entryTime >= weekStart) groups['This Week'].push(entry);
      else groups['Older'].push(entry);
    });

    return groups;
  }, [journalEntries]);

  const sections = ['Today', 'Yesterday', 'This Week', 'Older'].filter(
    (key) => groupedEntries[key].length > 0
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pb-3xl"
    >
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-2xl text-center relative"
      >
        <p className="text-xs text-text-muted uppercase tracking-[0.15em] mb-xs flex items-center justify-center gap-[8px]">
          <span className="w-[16px] h-[1px] bg-accent-lavender opacity-30" />
          Private to you
          <span className="w-[16px] h-[1px] bg-accent-lavender opacity-30" />
        </p>
        <h1 className="font-display text-text-primary mb-xs">
          Journal
        </h1>
        <p className="font-body text-md text-text-secondary leading-relaxed max-w-[320px] sm:max-w-[420px] mx-auto">
          Everything you&apos;ve saved. Only you can see this.
        </p>
      </motion.div>

      {journalEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EmptyState
            title="This page is waiting."
            body="There's no wrong time to start."
            ctaLabel="Let it out"
            onCta={() => navigate('/rant')}
          />
        </motion.div>
      ) : (
        <div className="max-w-[900px] mx-auto px-md">
          {sections.map((section, sectionIdx) => (
            <div key={section} className="mb-xl">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sectionIdx * 0.1 }}
                className="font-display text-xl text-text-secondary mb-md border-b border-border-subtle pb-xs inline-block pr-lg"
              >
                {section}
              </motion.h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {groupedEntries[section].map((entry, i) => {
                  const moodInfo = getMoodConfig(entry.mood);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: sectionIdx * 0.1 + i * 0.05 }}
                    >
                      <Card 
                        emotion={entry.mood}
                        className="cursor-pointer h-full flex flex-col group relative overflow-hidden"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        {/* Decorative background glow on hover */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                          style={{ background: `radial-gradient(circle at center, ${moodInfo.color}, transparent 70%)` }}
                        />

                        <div className="flex items-center justify-between gap-sm mb-sm">
                          <div className="flex items-center gap-xs px-3 py-1 rounded-full bg-bg-secondary/50 border border-border-subtle">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: moodInfo.color }}
                            />
                            <span className="font-body text-[10px] text-text-secondary uppercase tracking-wider font-medium">
                              {moodInfo.label}
                            </span>
                          </div>
                          
                          {/* Intensity Dots */}
                          <div className="flex gap-[2px]">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <div 
                                key={dot} 
                                className={`w-[3px] h-[3px] rounded-full transition-colors ${dot <= entry.intensity ? 'bg-accent-warm opacity-60' : 'bg-text-muted/20'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="font-display text-lg leading-relaxed text-text-primary whitespace-pre-wrap break-words line-clamp-4 opacity-90 mb-auto">
                          {entry.content}
                        </p>

                        <div className="flex items-center justify-between mt-md pt-sm border-t border-border-subtle/50">
                          <span className="text-xs text-text-muted font-mono">
                            {formatTime(entry.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(entry.id);
                            }}
                            className="p-1.5 -mr-1.5 rounded-full text-text-muted/50 hover:text-semantic-error hover:bg-semantic-error/10 transition-all duration-200"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED ENTRY MODAL */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-md sm:p-xl h-screen w-screen">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-bg-overlay/95 backdrop-blur-sm"
                onClick={() => setSelectedEntry(null)}
             />
             
             <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative w-full max-w-2xl bg-bg-card/95 backdrop-blur-2xl border border-border-medium/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
             >
                {/* Noise texture overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                />
                
                {/* Top Accent Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 z-20"
                  style={{ backgroundColor: getMoodConfig(selectedEntry.mood).color }}
                />

                {/* Header Actions */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border-subtle/30 relative z-10 bg-bg-card/50">
                   <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-text-muted">
                      <span className="w-2 h-2 rounded-full bg-text-muted/30" />
                      ENTRY DETAILS
                   </div>
                   <button 
                      onClick={() => setSelectedEntry(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary transition-colors text-text-secondary"
                   >
                      <X size={20} />
                   </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar px-xl pb-xl">
                   {/* Header Section */}
                   <div className="pt-xl pb-lg flex flex-col items-start text-left">
                      {/* Date */}
                      <h2 className="font-display text-xl text-text-primary leading-tight mb-sm">
                         {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h2>
                      
                      {/* Metadata Stack */}
                      <div className="flex flex-col gap-2">
                          {/* Mood */}
                          <div className="flex items-center gap-2">
                            <div 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getMoodConfig(selectedEntry.mood).color }}
                            />
                            <span className="text-sm font-medium text-text-primary capitalize tracking-wide">
                                {getMoodConfig(selectedEntry.mood).label}
                            </span>
                          </div>

                          {/* Intensity */}
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-text-secondary font-mono">Intensity:</span>
                             <div className="flex gap-1 h-1 w-16">
                                {[1, 2, 3, 4, 5].map(v => (
                                  <div 
                                    key={v} 
                                    className={`flex-1 rounded-full transition-colors ${v <= selectedEntry.intensity ? 'bg-text-secondary' : 'bg-bg-secondary'}`} 
                                  />
                                ))}
                             </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-text-secondary text-xs font-mono opacity-70">
                              <Clock size={12} />
                              {formatTime(selectedEntry.createdAt)}
                          </div>
                      </div>
                   </div>

                   {/* Divider */}
                   <div className="w-full h-[1px] bg-border-subtle/40 mb-lg" />

                   {/* Main Content Body */}
                   <div className="relative w-full">
                     <p className="font-display text-base leading-relaxed text-text-primary whitespace-pre-wrap break-words text-left w-full">
                        {selectedEntry.content}
                     </p>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-lg border-t border-border-subtle/40 bg-bg-card/80 backdrop-blur-xl relative z-10 flex justify-between items-center">
                   <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-medium opacity-60">
                      Private to you
                   </p>
                   <button
                      onClick={() => setDeleteId(selectedEntry.id)}
                      className="flex items-center gap-2 text-text-muted hover:text-semantic-error transition-colors text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-semantic-error/5"
                   >
                      <Trash2 size={14} />
                      Delete Entry
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Before you let this go"
        description="This is yours to decide. Once removed, it can't be brought back."
      >
        <div className="flex flex-col gap-sm mt-md">
          <Button variant="rant" onClick={handleDelete}>
            Release it forever
          </Button>
          <button
            onClick={() => setDeleteId(null)}
            className="bg-transparent border-none text-text-secondary text-sm cursor-pointer font-body underline underline-offset-[3px] p-xs hover:text-text-primary transition-colors duration-micro ease-comfort"
          >
            Actually, keep it
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
