import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { pageVariants } from '../lib/animations';
import { Phone, MessageCircle, Globe, Heart, Search, ArrowRight, ExternalLink, Shield, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

type Category = 'all' | 'crisis' | 'therapy' | 'self-help';

interface Resource {
  title: string;
  description: string;
  url: string;
  phone?: string;
  icon: React.ReactNode;
  accent: string;
  accentRgb: string;
  category: Category;
  tag: string;
  urgency?: 'immediate' | 'standard';
}

const resources: Resource[] = [
  {
    title: 'Hope (Amal) - National Helpline',
    description: 'Toll-free, confidential mental health support 24/7 in Arabic and English. Call or WhatsApp.',
    url: 'https://u.ae/en/information-and-services/health-and-fitness/mental-health',
    phone: '800-4673',
    icon: <Phone size={18} />,
    accent: 'var(--color-accent-warm)',
    accentRgb: '168,85,63',
    category: 'crisis',
    tag: 'Gov Hotline',
    urgency: 'immediate',
  },
  {
    title: 'Estijaba Helpline',
    description: 'Emergency psychological support provided by the Abu Dhabi government.',
    url: 'https://www.doh.gov.ae/en/estijaba',
    phone: '800-1717',
    icon: <Shield size={18} />,
    accent: 'var(--color-accent-sage)',
    accentRgb: '69,115,88',
    category: 'crisis',
    tag: 'Emergency',
    urgency: 'immediate',
  },
  {
    title: 'The LightHouse Arabia',
    description: 'Community mental health center providing outpatient therapy and support groups.',
    url: 'https://www.lighthousearabia.com',
    phone: '+971 4 380 2088',
    icon: <Heart size={18} />,
    accent: 'var(--color-accent-rose)',
    accentRgb: '150,78,94',
    category: 'therapy',
    tag: 'Center',
  },
  {
    title: 'American Center (ACPN)',
    description: 'Premier medical facility for psychiatry, neurology, and psychology services.',
    url: 'https://www.americancenteruae.com',
    phone: '+971 4 314 1000',
    icon: <Globe size={18} />,
    accent: 'var(--color-accent-lavender)',
    accentRgb: '98,78,120',
    category: 'therapy',
    tag: 'Medical',
  },
  {
    title: 'Al Amal Psychiatric Hospital',
    description: 'Government specialized psychiatric care facility for Dubai and Northern Emirates.',
    url: 'https://www.ehs.gov.ae/en/services/health-care-facilities/al-amal-psychiatric-hospital',
    icon: <Shield size={18} />,
    accent: 'var(--color-accent-sage)',
    accentRgb: '69,115,88',
    category: 'self-help',
    tag: 'Hospital',
  },
  {
    title: 'BetterHelp',
    description: 'Online therapy with licensed counselors from anywhere. Accessible globally.',
    url: 'https://www.betterhelp.com',
    icon: <Globe size={18} />,
    accent: 'var(--color-accent-sage)',
    accentRgb: '69,115,88',
    category: 'therapy',
    tag: 'Online',
  },
  {
    title: 'Headspace',
    description: 'Guided meditations, sleep sounds, and mindfulness exercises for daily mental wellness.',
    url: 'https://www.headspace.com',
    icon: <Globe size={18} />,
    accent: 'var(--color-accent-lavender)',
    accentRgb: '98,78,120',
    category: 'self-help',
    tag: 'Meditation',
  },
];

const categoryLabels: Record<Category, string> = {
  all: 'Everything',
  crisis: 'Crisis Support',
  therapy: 'Find a Therapist',
  'self-help': 'Self-Help',
};

const categoryIcons: Record<Category, React.ReactNode> = {
  all: <Sparkles size={12} />,
  crisis: <Phone size={12} />,
  therapy: <Search size={12} />,
  'self-help': <Heart size={12} />,
};

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Resource Card ───
function ResourceCard({ resource, index, isLight }: { resource: Resource; index: number; isLight: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const isUrgent = resource.urgency === 'immediate';

  return (
    <RevealSection delay={index * 0.06}>
      <motion.a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline group"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative rounded-[16px] overflow-hidden transition-all duration-300"
          style={{
            background: isLight
              ? `linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(${resource.accentRgb},0.04) 100%)`
              : `linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(${resource.accentRgb},0.06) 100%)`,
            border: `1px solid ${isHovered ? `rgba(${resource.accentRgb},0.25)` : 'var(--color-border-subtle)'}`,
            boxShadow: isHovered
              ? isLight
                ? `0 8px 32px rgba(${resource.accentRgb},0.12), 0 2px 8px rgba(${resource.accentRgb},0.08), inset 0 1px 0 rgba(255,255,255,0.5)`
                : `0 8px 32px rgba(${resource.accentRgb},0.2), 0 2px 8px rgba(0,0,0,0.3)`
              : isLight
                ? `0 2px 8px rgba(${resource.accentRgb},0.04), 0 1px 3px rgba(42,32,53,0.04), inset 0 1px 0 rgba(255,255,255,0.4)`
                : `0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Accent gradient strip on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300"
            style={{
              background: `linear-gradient(180deg, ${resource.accent} 0%, rgba(${resource.accentRgb},0.3) 100%)`,
              width: isHovered ? '5px' : '4px',
              boxShadow: isHovered ? `2px 0 12px rgba(${resource.accentRgb},0.2)` : 'none',
            }}
          />

          {/* Ambient glow on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `radial-gradient(ellipse at 20% 50%, rgba(${resource.accentRgb},${isLight ? '0.06' : '0.1'}) 0%, transparent 70%)`,
            }}
          />

          <div className="relative flex items-start gap-[12px] sm:gap-[16px] px-[16px] sm:px-[20px] py-[16px] sm:py-[18px] pl-[20px] sm:pl-[28px]">
            {/* Icon container */}
            <div className="relative flex-shrink-0 mt-[2px]">
              {/* Icon ambient glow */}
              <motion.div
                className="absolute -inset-[6px] rounded-full pointer-events-none"
                initial={false}
                animate={{ opacity: isHovered ? 0.6 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ background: `radial-gradient(circle, rgba(${resource.accentRgb},0.15) 0%, transparent 70%)` }}
              />
              <div
                className="relative w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-[12px] flex items-center justify-center transition-all duration-300"
                style={{
                  color: resource.accent,
                  background: isLight
                    ? `linear-gradient(135deg, rgba(${resource.accentRgb},0.1) 0%, rgba(${resource.accentRgb},0.05) 100%)`
                    : `linear-gradient(135deg, rgba(${resource.accentRgb},0.15) 0%, rgba(${resource.accentRgb},0.08) 100%)`,
                  boxShadow: isHovered
                    ? `0 0 0 1px rgba(${resource.accentRgb},0.2), 0 4px 12px rgba(${resource.accentRgb},${isLight ? '0.12' : '0.2'})`
                    : `0 0 0 1px rgba(${resource.accentRgb},0.08)`,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {resource.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-[4px] flex-1 min-w-0">
              <div className="flex items-center gap-[8px] flex-wrap">
                <h3
                  className="font-display text-text-primary text-[15px] sm:text-base leading-snug"
                  style={isHovered ? { color: resource.accent } : undefined}
                >
                  {resource.title}
                </h3>
                <span
                  className="text-[9px] sm:text-[10px] font-body font-semibold uppercase tracking-[0.1em] px-[7px] py-[2px] rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    color: resource.accent,
                    background: isLight
                      ? `linear-gradient(135deg, rgba(${resource.accentRgb},0.1) 0%, rgba(${resource.accentRgb},0.05) 100%)`
                      : `rgba(${resource.accentRgb},0.12)`,
                    border: `1px solid rgba(${resource.accentRgb},${isHovered ? '0.25' : '0.1'})`,
                  }}
                >
                  {resource.tag}
                </span>
                {isUrgent && (
                  <span className="relative flex h-[8px] w-[8px] flex-shrink-0">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: resource.accent }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-[8px] w-[8px]"
                      style={{ backgroundColor: resource.accent }}
                    />
                  </span>
                )}
              </div>
              <p className="text-[13px] sm:text-sm text-text-secondary leading-relaxed">
                {resource.description}
              </p>
              {resource.phone && (
                <div className="flex items-center gap-[6px] mt-[2px]">
                  <Phone size={11} style={{ color: resource.accent }} />
                  <span
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: resource.accent }}
                  >
                    {resource.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Arrow / External link */}
            <div className="flex-shrink-0 flex items-center h-full pt-[10px]">
              <motion.div
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0.3,
                  x: isHovered ? 0 : -4,
                }}
                transition={{ duration: 0.2 }}
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: isHovered ? `rgba(${resource.accentRgb},${isLight ? '0.1' : '0.15'})` : 'transparent',
                  color: isHovered ? resource.accent : 'var(--color-text-muted)',
                }}
              >
                <ExternalLink size={14} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.a>
    </RevealSection>
  );
}

export function ResourcesPage() {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = activeCategory === 'all'
    ? resources
    : resources.filter((r) => r.category === activeCategory);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative"
    >
      {/* Page ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[5%] right-[10%] w-[350px] h-[350px] rounded-full blur-[180px]"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(69,115,88,0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(69,115,88,0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[15%] left-[5%] w-[300px] h-[300px] rounded-full blur-[160px]"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(150,78,94,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(150,78,94,0.03) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-[200px]"
          style={{
            background: isLight
              ? 'radial-gradient(circle, rgba(98,78,120,0.04) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(98,78,120,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-xl max-w-[720px] mx-auto text-center relative z-[1]"
      >
        {/* Decorative icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={headerInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center justify-center mb-[16px]"
        >
          <div
            className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center"
            style={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(69,115,88,0.12) 0%, rgba(98,78,120,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(69,115,88,0.15) 0%, rgba(98,78,120,0.1) 100%)',
              boxShadow: isLight
                ? '0 4px 16px rgba(69,115,88,0.1), 0 0 0 1px rgba(69,115,88,0.08)'
                : '0 4px 16px rgba(69,115,88,0.15), 0 0 0 1px rgba(69,115,88,0.1)',
            }}
          >
            <Shield size={22} className="text-accent-sage" />
          </div>
        </motion.div>

        <p className="text-xs text-text-muted uppercase tracking-[0.15em] mb-xs flex items-center justify-center gap-[8px]">
          <span
            className="w-[24px] h-[1px]"
            style={{ background: isLight ? 'linear-gradient(90deg, transparent, rgba(69,115,88,0.3))' : 'linear-gradient(90deg, transparent, rgba(69,115,88,0.2))' }}
          />
          When you&apos;re ready
          <span
            className="w-[24px] h-[1px]"
            style={{ background: isLight ? 'linear-gradient(90deg, rgba(69,115,88,0.3), transparent)' : 'linear-gradient(90deg, rgba(69,115,88,0.2), transparent)' }}
          />
        </p>
        <h1
          className="font-display text-text-primary mb-xs"
          style={{ textShadow: isLight ? '0 0 60px rgba(69,115,88,0.08)' : '0 0 60px rgba(69,115,88,0.06)' }}
        >
          Resources
        </h1>
        <p className="font-body text-sm text-text-secondary leading-relaxed max-w-[420px] mx-auto">
          Real help from real organizations. Browse when you have bandwidth.
        </p>
      </motion.div>

      {/* Notice */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-[720px] mx-auto mb-lg relative z-[1]"
      >
        <div
          className="border rounded-[14px] px-sm sm:px-lg py-[14px] text-center relative overflow-hidden"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, rgba(69,115,88,0.05) 0%, rgba(98,78,120,0.03) 50%, rgba(168,85,63,0.03) 100%)'
              : 'linear-gradient(135deg, rgba(69,115,88,0.08) 0%, rgba(98,78,120,0.04) 50%, rgba(168,85,63,0.04) 100%)',
            borderColor: isLight ? 'rgba(69,115,88,0.12)' : 'rgba(69,115,88,0.15)',
            boxShadow: isLight
              ? '0 2px 12px rgba(69,115,88,0.06), inset 0 1px 0 rgba(255,255,255,0.4)'
              : '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-center justify-center gap-[8px]">
            <Heart size={13} className="text-accent-rose flex-shrink-0" />
            <p className="font-body text-xs text-text-secondary leading-relaxed">
              Solace is not a replacement for professional help. If you&apos;re
              struggling, please reach out.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-[720px] mx-auto mb-xl relative z-[1]"
      >
        <div className="flex flex-wrap justify-center gap-[6px]">
          {(Object.keys(categoryLabels) as Category[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.96 }}
                className="font-body text-xs px-[14px] py-[7px] rounded-full border cursor-pointer transition-all duration-300 flex items-center gap-[5px]"
                style={isActive ? {
                  borderColor: 'var(--color-accent-warm)',
                  color: 'var(--color-accent-warm)',
                  background: isLight
                    ? 'linear-gradient(135deg, rgba(168,85,63,0.08) 0%, rgba(168,85,63,0.04) 100%)'
                    : 'rgba(168,85,63,0.12)',
                  boxShadow: isLight
                    ? '0 2px 8px rgba(168,85,63,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                    : '0 2px 8px rgba(168,85,63,0.15)',
                } : {
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  background: 'transparent',
                  boxShadow: isLight ? '0 1px 3px rgba(98,78,120,0.04)' : 'none',
                }}
              >
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Resource cards */}
      <div className="max-w-[720px] mx-auto flex flex-col gap-[12px] relative z-[1]">
        <AnimatePresence mode="popLayout">
          {filtered.map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              layout
            >
              <ResourceCard resource={resource} index={i} isLight={isLight} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-center mt-2xl mb-xl max-w-[720px] mx-auto relative z-[1]"
      >
        <div className="flex items-center justify-center gap-[12px] mb-[12px]">
          <div className="w-[40px] h-[1px]" style={{ background: isLight ? 'linear-gradient(90deg, transparent, rgba(98,78,120,0.15))' : 'linear-gradient(90deg, transparent, rgba(98,78,120,0.1))' }} />
          <Heart size={14} className="text-accent-rose opacity-40" />
          <div className="w-[40px] h-[1px]" style={{ background: isLight ? 'linear-gradient(90deg, rgba(98,78,120,0.15), transparent)' : 'linear-gradient(90deg, rgba(98,78,120,0.1), transparent)' }} />
        </div>
        <p
          className="font-display text-sm italic text-text-muted"
          style={{ textShadow: isLight ? '0 0 30px rgba(150,78,94,0.08)' : 'none' }}
        >
          Reaching out is brave. You deserve support.
        </p>
      </motion.div>
    </motion.div>
  );
}
