import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { BreathingBackground } from './BreathingBackground';
import { TextureOverlay } from './TextureOverlay';
import { CrisisStrip } from './CrisisStrip';
import { CrisisOverlay } from './CrisisOverlay';
import { BreathingCircle } from './BreathingCircle';
import { ToastContainer } from './ui/Toast';
import { CursorGlow } from './CursorGlow';
import { FloatingParticles } from './FloatingParticles';
import { ScrollProgress } from './ScrollProgress';

export function Layout() {
  const location = useLocation();
  const isCompanion = location.pathname === '/companion';

  return (
    <div className="min-h-screen flex flex-col relative">
      <BreathingBackground />
      <TextureOverlay />
      <CursorGlow />
      <FloatingParticles count={25} />
      <ScrollProgress />
      <Navigation />

      <main className={`flex-1 flex flex-col items-center w-full relative z-[2] ${
        isCompanion
          ? 'pt-0 pb-0 max-[1023px]:pt-0 max-[1023px]:pb-0'
          : 'pt-[100px] pb-[48px] max-[1023px]:pt-[16px] max-[1023px]:pb-[80px]'
      }`}>
        <div className={`w-full ${isCompanion ? 'max-w-full px-0' : 'max-w-[1200px] px-[16px] sm:px-[24px] tablet:px-[32px] desktop:px-[48px]'}`}>
          <Outlet />
        </div>
      </main>

      {!isCompanion && (
        <footer className="mt-auto relative z-[2]">
          <CrisisStrip />
        </footer>
      )}

      <CrisisOverlay />
      <BreathingCircle />
      <ToastContainer />

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="live-feedback"
      />
    </div>
  );
}
