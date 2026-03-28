import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PenTool, BookOpen, Heart, Sun, Moon, MessageCircle, LogOut, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { NAV_LINKS } from '../lib/constants';

const navIcons: Record<string, React.ReactNode> = {
  '/': <Home size={18} />,
  '/rant': <PenTool size={18} />,
  '/companion': <MessageCircle size={18} />,
  '/journal': <BookOpen size={18} />,
  '/resources': <Heart size={18} />,
};

const navLabels: Record<string, string> = {
  '/': 'Home',
  '/rant': 'Rant',
  '/companion': 'Solara',
  '/journal': 'Journal',
  '/resources': 'Help',
};

export function Navigation() {
  const mood = useStore((s) => s.mood);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user, signOut, deleteAccount } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLLIElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setShowDeleteConfirm(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    window.location.href = '/login';
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return; // Prevent double-click
    setIsDeleting(true);
    
    // Run delete asynchronously but don't await - let the redirect happen
    deleteAccount().then((result) => {
      if (result.error) {
        alert('Delete failed: ' + result.error);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      } else {
        // Force full page reload to login
        window.location.replace('/login');
      }
    }).catch((err) => {
      alert('Delete error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    });
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  const moodDotColors: Record<string, string> = {
    neutral: 'var(--color-accent-sage)',
    calm: 'var(--color-emotion-calm)',
    angry: 'var(--color-emotion-angry)',
    sad: 'var(--color-emotion-sad)',
    anxious: 'var(--color-emotion-anxious)',
    numb: 'var(--color-emotion-numb)',
    overwhelmed: 'var(--color-emotion-overwhelmed)',
    joy: 'var(--color-emotion-joy)',
    exhausted: 'var(--color-emotion-exhausted)',
    frustrated: 'var(--color-emotion-frustrated)',
    confused: 'var(--color-emotion-confused)',
    hopeful: 'var(--color-emotion-hopeful)',
  };

  return (
    <>
      {/* ─── Desktop Nav (top floating pill) ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex fixed top-md left-[3%] right-[3%] max-w-[960px] mx-auto bg-bg-nav backdrop-blur-[20px] backdrop-saturate-[180%] border border-border-subtle rounded-lg px-sm py-[10px] items-center justify-between z-sticky transition-colors duration-medium ease-comfort"
      >
        <NavLink
          to="/"
          className="font-display text-[18px] font-medium text-text-primary no-underline tracking-[-0.01em] flex items-center gap-2xs flex-shrink-0"
        >
          <span className="text-[20px]">🫧</span>
          <span>Solace</span>
        </NavLink>

        <ul className="flex items-center gap-[2px] list-none m-0 p-0 min-w-0 flex-shrink">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `font-body text-[13px] font-medium no-underline px-[8px] py-[6px] rounded-sm relative transition-colors duration-micro ease-comfort flex items-center gap-[4px] whitespace-nowrap ${
                    isActive
                      ? 'text-accent-warm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {navIcons[link.path]}
                <span className="hidden xl:inline">{link.label}</span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-[-2px] left-[10px] right-[10px] h-[2px] rounded-full bg-accent-warm"
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[8px] flex-shrink-0">
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.92 }}
            className="relative flex items-center gap-[5px] px-[8px] py-[5px] rounded-full border border-border-subtle bg-bg-secondary cursor-pointer transition-all duration-small ease-comfort hover:border-border-medium"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <motion.div
              className="absolute top-[3px] bottom-[3px] w-[50%] rounded-full bg-accent-warm"
              style={{ opacity: 0.18 }}
              animate={{ left: theme === 'dark' ? '48%' : '2%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <Sun
              size={14}
              className={`relative z-[1] transition-colors duration-micro ${
                theme === 'light' ? 'text-accent-warm' : 'text-text-muted'
              }`}
            />
            <Moon
              size={14}
              className={`relative z-[1] transition-colors duration-micro ${
                theme === 'dark' ? 'text-accent-warm' : 'text-text-muted'
              }`}
            />
          </motion.button>

          <motion.div
            className="w-[10px] h-[10px] rounded-full flex-shrink-0"
            style={{
              backgroundColor: moodDotColors[mood] || moodDotColors.neutral,
              boxShadow: `0 0 12px ${moodDotColors[mood] || moodDotColors.neutral}, 0 0 24px ${moodDotColors[mood] || moodDotColors.neutral}44`,
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            title={`Current mood: ${mood}`}
            aria-label={`Current mood: ${mood}`}
          />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              whileTap={{ scale: 0.92 }}
              className="w-[30px] h-[30px] rounded-full bg-accent-sage flex items-center justify-center border-none cursor-pointer text-white font-display text-[13px] hover:brightness-110 transition-all"
              title={displayName}
            >
              {displayName.charAt(0).toUpperCase()}
            </motion.button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[38px] w-[200px] bg-bg-card border border-border-subtle rounded-[12px] shadow-lg overflow-hidden z-[100]"
                >
                  <div className="px-[14px] py-[10px] border-b border-border-subtle">
                    <p className="font-body text-[13px] text-text-primary font-medium truncate">{displayName}</p>
                    <p className="font-body text-[11px] text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                    className="w-full flex items-center gap-[8px] px-[14px] py-[10px] font-body text-[13px] text-text-secondary bg-transparent border-none cursor-pointer hover:bg-bg-secondary transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                      className="w-full flex items-center gap-[8px] px-[14px] py-[10px] font-body text-[13px] text-semantic-error bg-transparent border-none cursor-pointer hover:bg-semantic-error-bg transition-colors text-left"
                    >
                      <Trash2 size={14} />
                      Delete account
                    </button>
                  ) : (
                    <div className="px-[14px] py-[10px] border-t border-border-subtle">
                      <p className="font-body text-[11px] text-text-secondary mb-[8px]">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-[8px]">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteAccount(); }}
                          type="button"
                          disabled={isDeleting}
                          className="flex-1 py-[6px] rounded-[6px] font-body text-[12px] bg-semantic-error text-white border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, delete'}
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(false); }}
                          type="button"
                          className="flex-1 py-[6px] rounded-[6px] font-body text-[12px] bg-bg-secondary text-text-secondary border border-border-subtle cursor-pointer hover:bg-bg-card transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile Nav (fixed bottom tab bar) ─── */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-nav backdrop-blur-[20px] backdrop-saturate-[180%] border-t border-border-subtle transition-colors duration-medium ease-comfort"
        style={{ zIndex: 9999 }}
      >
        <ul className="flex items-center justify-evenly list-none m-0 p-0 py-[6px] w-full">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className="flex flex-col items-center gap-[1px] no-underline px-[6px] py-[4px] rounded-[8px] transition-colors duration-150"
                >
                  <span className={`transition-colors duration-150 ${isActive ? 'text-accent-warm' : 'text-text-muted'}`}>
                    {navIcons[link.path]}
                  </span>
                  <span className={`font-body text-[9px] leading-tight transition-colors duration-150 ${isActive ? 'text-accent-warm font-medium' : 'text-text-muted'}`}>
                    {navLabels[link.path]}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="w-[4px] h-[4px] rounded-full bg-accent-warm mt-[1px]"
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
          {/* User account menu */}
          <li className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center gap-[1px] px-[6px] py-[4px] rounded-[8px] transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <span className="w-[18px] h-[18px] rounded-full bg-accent-sage flex items-center justify-center text-white font-display text-[9px]">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="font-body text-[9px] leading-tight text-text-muted">
                Me
              </span>
            </button>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-[52px] right-0 w-[180px] bg-bg-primary border border-border-subtle rounded-[12px] shadow-lg overflow-hidden z-[10000]"
                >
                  <div className="px-[12px] py-[8px] border-b border-border-subtle">
                    <p className="font-body text-[12px] text-text-primary font-medium truncate">{displayName}</p>
                    <p className="font-body text-[10px] text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[10px] font-body text-[12px] text-text-secondary bg-transparent border-none cursor-pointer hover:bg-bg-secondary transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                      className="w-full flex items-center gap-[8px] px-[12px] py-[10px] font-body text-[12px] text-semantic-error bg-transparent border-none cursor-pointer hover:bg-semantic-error-bg transition-colors text-left"
                    >
                      <Trash2 size={14} />
                      Delete account
                    </button>
                  ) : (
                    <div className="px-[12px] py-[10px] border-t border-border-subtle">
                      <p className="font-body text-[10px] text-text-secondary mb-[8px]">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-[6px]">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteAccount(); }}
                          type="button"
                          disabled={isDeleting}
                          className="flex-1 py-[6px] rounded-[6px] font-body text-[11px] bg-semantic-error text-white border-none cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, delete'}
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(false); }}
                          type="button"
                          className="flex-1 py-[6px] rounded-[6px] font-body text-[11px] bg-bg-secondary text-text-secondary border border-border-subtle cursor-pointer hover:bg-bg-card transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          {/* Theme toggle tab */}
          <li>
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-[1px] px-[6px] py-[4px] rounded-[8px] transition-colors duration-150 bg-transparent border-none cursor-pointer"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="text-text-muted">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </span>
              <span className="font-body text-[9px] leading-tight text-text-muted">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
