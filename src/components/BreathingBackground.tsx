import { useStore } from '../store/useStore';

export function BreathingBackground() {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  return (
    <div className="fixed inset-0 z-below bg-bg-primary overflow-hidden pointer-events-none transition-colors duration-[2000ms]">
      {/* Light-mode multi-layer gradient wash */}
      {isLight && (
        <>
          {/* Warm top-left wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 90% 70% at 20% 15%, rgba(168,85,63,0.09) 0%, transparent 65%)',
            }}
          />
          {/* Lavender center-right wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 85% 50%, rgba(98,78,120,0.07) 0%, transparent 60%)',
            }}
          />
          {/* Sage bottom wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 50% at 50% 95%, rgba(69,115,88,0.06) 0%, transparent 60%)',
            }}
          />
          {/* Warm ambient glow at top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(168,85,63,0.04) 0%, transparent 30%)',
            }}
          />
        </>
      )}

      {/* Orb 1 — Rose */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] animate-breathe-orb-1 will-change-transform pointer-events-none max-[767px]:w-[250px] max-[767px]:h-[250px]"
        style={{
          backgroundColor: 'var(--color-accent-rose)',
          opacity: isLight ? 0.15 : 0.08,
          top: '30%',
          right: '-5%',
        }}
      />
      {/* Orb 2 — Sage */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-[160px] animate-breathe-orb-2 will-change-transform pointer-events-none max-[767px]:hidden"
        style={{
          backgroundColor: 'var(--color-accent-sage)',
          opacity: isLight ? 0.12 : 0.06,
          bottom: '-20%',
          left: '-15%',
          animationDelay: '-4s',
        }}
      />
      {/* Orb 3 — Warm */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[160px] animate-breathe-orb-1 will-change-transform pointer-events-none max-[767px]:hidden"
        style={{
          backgroundColor: 'var(--color-accent-warm)',
          opacity: isLight ? 0.10 : 0.04,
          top: '55%',
          right: '5%',
          animationDelay: '-8s',
        }}
      />

      {/* Light-mode extra orbs for depth */}
      {isLight && (
        <>
          {/* Orb 4 — Lavender, top-left */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[180px] animate-breathe-orb-2 will-change-transform pointer-events-none max-[767px]:w-[300px] max-[767px]:h-[300px]"
            style={{
              backgroundColor: 'var(--color-accent-lavender)',
              opacity: 0.10,
              top: '-10%',
              left: '5%',
              animationDelay: '-6s',
            }}
          />
          {/* Orb 5 — Rose, top-right diffuse */}
          <div
            className="absolute w-[450px] h-[450px] rounded-full blur-[200px] animate-breathe-orb-1 will-change-transform pointer-events-none max-[767px]:hidden"
            style={{
              backgroundColor: 'var(--color-accent-rose)',
              opacity: 0.08,
              top: '5%',
              right: '15%',
              animationDelay: '-10s',
            }}
          />
          {/* Orb 6 — Warm, center diffuse */}
          <div
            className="absolute w-[350px] h-[350px] rounded-full blur-[150px] animate-breathe-orb-2 will-change-transform pointer-events-none max-[767px]:hidden"
            style={{
              backgroundColor: 'var(--color-accent-warm)',
              opacity: 0.06,
              top: '40%',
              left: '30%',
              animationDelay: '-2s',
            }}
          />
          {/* Light beam — diagonal warm ray */}
          <div
            className="absolute pointer-events-none max-[767px]:hidden"
            style={{
              top: '-10%',
              right: '20%',
              width: '2px',
              height: '120%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,63,0.04) 30%, rgba(168,85,63,0.06) 50%, rgba(168,85,63,0.04) 70%, transparent 100%)',
              transform: 'rotate(25deg)',
              filter: 'blur(20px)',
            }}
          />
          {/* Second light beam — lavender */}
          <div
            className="absolute pointer-events-none max-[767px]:hidden"
            style={{
              top: '-5%',
              left: '30%',
              width: '2px',
              height: '110%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(98,78,120,0.03) 30%, rgba(98,78,120,0.05) 50%, rgba(98,78,120,0.03) 70%, transparent 100%)',
              transform: 'rotate(-15deg)',
              filter: 'blur(25px)',
            }}
          />
        </>
      )}
    </div>
  );
}
