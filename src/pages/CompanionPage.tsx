import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Shield, RotateCcw, Pencil, X, Check, Clock, MessageCircle, Settings2, ImagePlus, Plus, PanelLeftOpen, PanelLeftClose, MoreHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';

/* ── Solara Logo ── */
function SolaraLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Organic fluid shape */}
      <path
        d="M12 2C13.5 6.5 17.5 10.5 22 12C17.5 13.5 13.5 17.5 12 22C10.5 17.5 6.5 13.5 2 12C6.5 10.5 10.5 6.5 12 2Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 5C13 8 16 11 19 12C16 13 13 16 12 19C11 16 8 13 5 12C8 11 11 8 12 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// ─── Types ───
type Personality = 'balanced' | 'gen-z' | 'gentle' | 'direct';

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface PersonalityOption {
  key: Personality;
  label: string;
  description: string;
  preview: string;
}

const PERSONALITIES: PersonalityOption[] = [
  {
    key: 'balanced',
    label: 'Balanced',
    description: 'Warm and modern, casual but grounded',
    preview: '"That\'s really valid honestly. I hear you."',
  },
  {
    key: 'gen-z',
    label: 'Gen Z',
    description: 'Internet-native, vibes-first, group chat energy',
    preview: '"ngl that hits different fr. like your feelings are so valid rn"',
  },
  {
    key: 'gentle',
    label: 'Gentle',
    description: 'Soft and nurturing, like a warm blanket',
    preview: '"It sounds like you\'re carrying something heavy."',
  },
  {
    key: 'direct',
    label: 'Direct',
    description: 'Straight to the point, warm but no fluff',
    preview: '"I see you. Here\'s what I think."',
  },
];

const MAX_IMAGES = 20;
const MAX_IMAGE_DIMENSION = 2048;

// Compress image to reasonable size for API
function compressImage(dataUrl: string, maxDim: number = MAX_IMAGE_DIMENSION): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if too large
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG, quality 0.9 for better details
      const compressed = canvas.toDataURL('image/jpeg', 0.9);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Create thumbnail for display in chat history (larger for better quality)
function createThumbnail(dataUrl: string): Promise<string> {
  return compressImage(dataUrl, 800);
}

interface ImageAttachment {
  id: string;
  dataUrl: string;
  name: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  imageContext?: string; // Gemini's description of images, used for context continuity
  timestamp: string;
}

// ─── Typing Indicator ───
function TypingIndicator() {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  return (
    <div className="flex items-end gap-[12px] max-w-[720px]">
      <div
        className="w-[32px] h-[32px] rounded-full bg-accent-sage flex items-center justify-center flex-shrink-0"
        style={isLight ? { boxShadow: '0 2px 12px rgba(69,115,88,0.25), 0 0 24px rgba(69,115,88,0.1)' } : undefined}
      >
        <SolaraLogo className="w-[18px] h-[18px] text-white" />
      </div>
      <div
        className="bg-bg-secondary border border-border-subtle rounded-[16px] rounded-bl-[4px] px-[16px] py-[12px]"
        style={isLight ? {
          boxShadow: '0 2px 12px rgba(98,78,120,0.06), 0 1px 4px rgba(168,85,63,0.04)',
          borderColor: 'rgba(98,78,120,0.08)',
        } : undefined}
      >
        <div className="flex items-center gap-[4px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: isLight ? 'var(--color-accent-sage)' : 'var(--color-text-muted)' }}
              animate={{ y: [0, -6, 0], opacity: isLight ? [0.4, 0.9, 0.4] : [1, 1, 1] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-[400] flex items-center justify-center px-[16px]"
    >
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative bg-bg-nav backdrop-blur-md border border-border-subtle rounded-[16px] px-[24px] py-[20px] max-w-[360px] w-full"
        style={isLight ? {
          boxShadow: '0 16px 48px rgba(98,78,120,0.15), 0 4px 16px rgba(42,32,53,0.08)',
          borderColor: 'rgba(98,78,120,0.1)',
        } : { boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}
      >
        <h3 className="font-display text-text-primary text-[18px] mb-[6px]">{title}</h3>
        <p className="font-body text-[13px] text-text-secondary leading-relaxed mb-[20px]">
          {description}
        </p>
        <div className="flex items-center justify-end gap-[8px]">
          <button
            onClick={onCancel}
            className="font-body text-[13px] text-text-secondary bg-transparent border border-border-subtle rounded-full px-[16px] py-[7px] cursor-pointer transition-colors duration-200 hover:text-text-primary hover:border-border-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="font-body text-[13px] text-white bg-semantic-error border-none rounded-full px-[16px] py-[7px] cursor-pointer transition-opacity duration-200 hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single Message Bubble ───
function MessageBubble({
  message,
  onEdit,
  onDelete,
  isLoading,
}: {
  message: ChatMessage;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  const isUser = message.role === 'user';
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = 'auto';
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
      className={`group flex items-end gap-[10px] max-w-[720px] ${
        isUser ? 'ml-auto flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-[32px] h-[32px] rounded-full bg-accent-sage flex items-center justify-center flex-shrink-0"
          style={isLight ? { boxShadow: '0 2px 12px rgba(69,115,88,0.25), 0 0 24px rgba(69,115,88,0.1)' } : undefined}
        >
          <SolaraLogo className="w-[18px] h-[18px] text-white" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        {isEditing ? (
          <div className="w-full max-w-[85%] min-w-[120px] sm:min-w-[200px]">
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleEditKeyDown}
              className="w-full bg-bg-input border-[1.5px] border-accent-sage rounded-[12px] px-[14px] py-[10px] text-[14px] font-body text-text-primary resize-none outline-none leading-relaxed"
              style={{ scrollbarWidth: 'thin' }}
            />
            <div className="flex items-center gap-[6px] mt-[6px] justify-end">
              <button
                onClick={handleEditCancel}
                className="flex items-center gap-[3px] text-[11px] font-body text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary transition-colors"
              >
                <X size={11} />
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex items-center gap-[3px] text-[11px] font-body text-accent-sage bg-transparent border-none cursor-pointer hover:text-accent-warm transition-colors"
              >
                <Check size={11} />
                Save & resend
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`px-[16px] py-[10px] max-w-[92%] sm:max-w-[85%] whitespace-pre-wrap leading-relaxed text-[14px] font-body relative ${
              isUser
                ? 'bg-accent-warm text-white rounded-[16px] rounded-br-[4px]'
                : 'bg-bg-secondary border border-border-subtle text-text-primary rounded-[16px] rounded-bl-[4px]'
            }`}
            style={isLight ? (
              isUser
                ? { 
                    boxShadow: '0 4px 20px rgba(168,85,63,0.2), 0 1px 4px rgba(168,85,63,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    background: 'linear-gradient(135deg, var(--color-accent-warm) 0%, #8e4530 100%)' 
                  }
                : { 
                    boxShadow: '0 4px 16px rgba(98,78,120,0.06), 0 1px 4px rgba(42,32,53,0.02), inset 0 1px 0 rgba(255,255,255,0.8)', 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,232,220,0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(255,255,255,0.4)'
                  }
            ) : undefined}
          >
            {/* Images */}
            {message.images && message.images.length > 0 && (
              <div className={`flex flex-wrap gap-[6px] mb-[8px] ${message.images.length === 1 ? '' : 'grid grid-cols-2'}`}>
                {message.images.map((img, i) => (
                  img === 'thumb' ? (
                    <div
                      key={i}
                      className="rounded-[8px] bg-bg-card border border-border-subtle flex items-center justify-center text-[10px] text-text-muted font-body"
                      style={{ width: '100%', aspectRatio: '4/3' }}
                    >
                      Image {i + 1}
                    </div>
                  ) : (
                    <img
                      key={i}
                      src={img}
                      alt={`Attached image ${i + 1}`}
                      className="rounded-[8px] max-h-[200px] object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(img, '_blank')}
                    />
                  )
                ))}
              </div>
            )}
            {message.content.split(/(\*\*.*?\*\*)/g).map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i} className="font-semibold text-text-primary brightness-110">{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </div>
        )}

        {/* Timestamp + action buttons */}
        <AnimatePresence>
          {hovered && !isEditing && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-[8px] mt-[4px] ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <span className="flex items-center gap-[3px] text-[10px] text-text-muted font-body">
                <Clock size={9} />
                {timeString}
              </span>

              {isUser && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-[3px] text-[10px] font-body text-text-muted bg-transparent border-none cursor-pointer hover:text-accent-sage transition-colors"
                    title="Edit message"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(message.id)}
                    className="flex items-center gap-[3px] text-[10px] font-body text-text-muted bg-transparent border-none cursor-pointer hover:text-semantic-error transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={10} />
                    Delete
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Welcome Screen ───
function WelcomeScreen({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  const suggestions = [
    'I had a really rough day today',
    'I feel anxious and I don\u2019t know why',
    'I\u2019m going through a breakup',
    'I feel lost and confused about my life',
    'I need someone to talk to',
    'I can\u2019t stop overthinking everything',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center flex-1 px-[16px] max-[1023px]:pb-[16px] max-[1023px]:justify-start max-[1023px]:pt-[8px] overflow-y-auto relative"
    >
      {/* Light mode decorative ambient background */}
      {isLight && (
        <>
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(69,115,88,0.06) 0%, rgba(98,78,120,0.03) 50%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-[10%] right-[10%] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,63,0.04) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        </>
      )}



      <h2 className="font-display text-text-primary text-center mb-[8px] relative z-[1]" style={isLight ? { textShadow: '0 0 40px rgba(69,115,88,0.1)' } : undefined}>
        Hey, I&apos;m Solara.
      </h2>
      <p className="font-body text-[14px] text-text-secondary text-center max-w-[400px] mb-[8px] leading-relaxed relative z-[1]">
        I&apos;m your light in Solace. A safe space to talk about
        whatever you&apos;re feeling. No judgment, no advice you didn&apos;t ask for.
        Just warmth that listens.
      </p>
      <div className="flex items-center gap-[6px] mb-[32px] relative z-[1]">
        <Shield size={12} className="text-accent-sage" />
        <span className="font-body text-[11px] text-text-muted">
          Conversations stay on your device
        </span>
      </div>

      <div className="w-full max-w-[460px] relative">
        {isLight && (
          <div className="absolute -inset-[16px] rounded-[24px] pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(69,115,88,0.03) 0%, rgba(98,78,120,0.02) 50%, rgba(168,85,63,0.02) 100%)', border: '1px solid rgba(98,78,120,0.05)' }} />
        )}
        <p className="font-body text-[11px] text-text-muted uppercase tracking-[0.1em] mb-[12px] text-center flex items-center justify-center gap-[10px] relative z-[1]">
          <span className="w-[20px] h-[1px]" style={isLight ? { background: 'linear-gradient(90deg, transparent, rgba(69,115,88,0.25))' } : { background: 'linear-gradient(90deg, transparent, var(--color-border-subtle))' }} />
          You could start with...
          <span className="w-[20px] h-[1px]" style={isLight ? { background: 'linear-gradient(90deg, rgba(69,115,88,0.25), transparent)' } : { background: 'linear-gradient(90deg, var(--color-border-subtle), transparent)' }} />
        </p>
        <div className="flex flex-wrap justify-center gap-[8px] relative z-[1]">
          {suggestions.map((s) => (
            <motion.button
              key={s}
              onClick={() => onSuggestion(s)}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="font-body text-[13px] text-text-secondary border border-border-subtle bg-bg-secondary rounded-full px-[14px] py-[7px] cursor-pointer transition-all duration-200 ease-in-out hover:border-accent-sage hover:text-text-primary hover:bg-bg-card"
              style={isLight ? {
                boxShadow: '0 1px 8px rgba(98,78,120,0.06), 0 1px 3px rgba(42,32,53,0.04)',
                background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(98,78,120,0.03) 100%)',
              } : undefined}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Session persistence helpers ───
const SESSIONS_KEY = 'breathe-companion-sessions';
const ACTIVE_SESSION_KEY = 'breathe-companion-active-session';

function generateSessionName(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return 'New chat';
  const text = firstUserMsg.content.slice(0, 40);
  return text.length < firstUserMsg.content.length ? `${text}...` : text;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      // Migrate old single-chat format
      const oldChat = localStorage.getItem('breathe-companion-chat');
      if (oldChat) {
        const oldMessages = JSON.parse(oldChat) as ChatMessage[];
        if (oldMessages.length > 0) {
          const session: ChatSession = {
            id: crypto.randomUUID(),
            name: generateSessionName(oldMessages),
            messages: oldMessages,
            createdAt: oldMessages[0]?.timestamp || new Date().toISOString(),
            updatedAt: oldMessages[oldMessages.length - 1]?.timestamp || new Date().toISOString(),
          };
          localStorage.setItem(SESSIONS_KEY, JSON.stringify([session]));
          localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
          localStorage.removeItem('breathe-companion-chat');
          return [session];
        }
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    // Strip large images before saving
    const toSave = sessions.map((s) => ({
      ...s,
      messages: s.messages.map((m) => ({
        ...m,
        images: m.images?.map((img) => (img.length < 5000 ? img : 'thumb')),
      })),
    }));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(toSave));
  } catch {
    try { localStorage.removeItem(SESSIONS_KEY); } catch { /* ignore */ }
  }
}

function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

// ─── Chat Sidebar ───
function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onToggle,
}: {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  const startRename = (session: ChatSession) => {
    setEditingId(session.id);
    setEditName(session.name);
    setMenuOpenId(null);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      onRenameSession(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[299] lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 270 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex flex-col bg-bg-card border-r border-border-subtle flex-shrink-0 overflow-hidden shadow-sm"
        style={isLight ? {
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(240,232,220,0.5) 100%)',
          borderColor: 'rgba(98,78,120,0.08)',
          boxShadow: '2px 0 24px rgba(98,78,120,0.04)',
          backdropFilter: 'blur(20px)',
        } : undefined}
      >
        <div className="w-[270px] flex flex-col h-full">
        {/* Brand header */}
        <div className="h-[85px] flex items-center px-[20px] gap-[12px] flex-shrink-0 border-b border-border-subtle relative overflow-hidden"
          style={isLight ? {
            borderColor: 'rgba(98,78,120,0.06)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
          } : { backgroundColor: 'var(--color-bg-card)' }}
        >
          {isLight && (
            <>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(69,115,88,0.08) 0%, transparent 60%)' }} />
              <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(98,78,120,0.1), transparent)' }} />
            </>
          )}
          <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-accent-sage relative z-[1]"
            style={isLight ? {
              background: 'linear-gradient(135deg, rgba(69,115,88,0.15) 0%, rgba(69,115,88,0.05) 100%)',
              boxShadow: '0 2px 10px rgba(69,115,88,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
            } : { backgroundColor: 'rgba(69,115,88,0.1)' }}
          >
            <SolaraLogo className="w-[20px] h-[20px]" />
          </div>
          <div className="flex flex-col relative z-[1]">
            <span className="font-display text-[20px] text-text-primary leading-tight">Solara</span>
            <span className="font-body text-[11px] text-text-muted tracking-wide uppercase">AI Companion</span>
          </div>
        </div>

        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-[14px] py-[12px] border-b border-border-subtle flex-shrink-0"
          style={isLight ? {
            background: 'linear-gradient(135deg, rgba(69,115,88,0.04) 0%, rgba(98,78,120,0.03) 100%)',
            borderColor: 'rgba(98,78,120,0.08)',
          } : undefined}
        >
          <h2 className="font-display text-text-primary text-[14px]">Chats</h2>
          <div className="flex items-center gap-[6px]">
            <motion.button
              onClick={onNewChat}
              whileTap={{ scale: 0.95 }}
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all duration-300"
              style={isLight ? {
                background: 'linear-gradient(135deg, var(--color-accent-sage) 0%, #3d664e 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(69,115,88,0.25), 0 2px 4px rgba(69,115,88,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(69,115,88,0.1)'
              } : { backgroundColor: 'var(--color-accent-sage)', color: 'white' }}
              title="New chat"
            >
              <Plus size={15} />
            </motion.button>
            <motion.button
              onClick={onToggle}
              whileTap={{ scale: 0.9 }}
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-transparent text-text-muted border border-border-subtle cursor-pointer hover:text-text-primary hover:border-border-medium transition-all"
              style={isLight ? {
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                boxShadow: '0 2px 6px rgba(98,78,120,0.06), inset 0 1px 0 rgba(255,255,255,0.5)'
              } : undefined}
              title="Close sidebar"
            >
              <PanelLeftClose size={15} />
            </motion.button>
          </div>
        </div>

        {/* Session list */}
        <div
          className="flex-1 overflow-y-auto py-[4px] px-[6px]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-scrollbar) transparent' }}
        >
          {sortedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[40px] px-[16px] text-center">
              <div
                className="mb-[10px] p-[10px] rounded-full"
                style={isLight ? { background: 'linear-gradient(135deg, rgba(69,115,88,0.06), rgba(98,78,120,0.04))' } : undefined}
              >
                <MessageCircle size={24} className="text-text-placeholder" />
              </div>
              <p className="font-body text-[13px] text-text-muted mb-[4px]">No conversations yet</p>
              <p className="font-body text-[11px] text-text-placeholder">Start a new chat to begin</p>
            </div>
          ) : (
            sortedSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const msgCount = session.messages.length;
              const lastMsg = session.messages[session.messages.length - 1];
              const preview = lastMsg
                ? lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? '...' : '')
                : 'Empty chat';

              return (
                <div key={session.id} className="relative mb-[2px]">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-[4px] px-[10px] py-[8px]">
                      <input
                        ref={editInputRef}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={saveRename}
                        className="flex-1 bg-bg-input border border-accent-sage rounded-[6px] px-[8px] py-[4px] text-[12px] font-body text-text-primary outline-none"
                        maxLength={60}
                      />
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left rounded-[10px] px-[10px] py-[8px] cursor-pointer border-none transition-all duration-200 group/session flex items-start gap-[8px] relative overflow-hidden`}
                      style={isLight ? (
                        isActive ? {
                          background: 'linear-gradient(135deg, rgba(69,115,88,0.12) 0%, rgba(98,78,120,0.06) 100%)',
                          boxShadow: '0 2px 8px rgba(69,115,88,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                          border: '1px solid rgba(69,115,88,0.1)'
                        } : {
                          background: 'transparent',
                          border: '1px solid transparent'
                        }
                      ) : (
                        isActive ? {
                          backgroundColor: 'rgba(69,115,88,0.12)',
                          borderLeft: '2px solid var(--color-accent-sage)'
                        } : {
                          backgroundColor: 'transparent'
                        }
                      )}
                    >
                      {isLight && isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-sage rounded-r-[2px]" />
                      )}
                      <div className="flex-1 min-w-0 relative z-[1]">
                        <div className="flex items-center gap-[6px]">
                          <p className={`font-body text-[13px] truncate ${
                            isActive ? 'text-text-primary font-medium' : 'text-text-secondary'
                          }`}>
                            {session.name}
                          </p>
                        </div>
                        <p className="font-body text-[11px] text-text-placeholder truncate mt-[2px]">
                          {preview}
                        </p>
                        <span className="font-body text-[9px] text-text-placeholder mt-[2px] block">
                          {msgCount} message{msgCount !== 1 ? 's' : ''} ·{' '}
                          {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* More button */}
                      <div
                        className="flex-shrink-0 opacity-0 group-hover/session:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === session.id ? null : session.id);
                        }}
                      >
                        <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center hover:bg-bg-card transition-colors cursor-pointer">
                          <MoreHorizontal size={13} className="text-text-muted" />
                        </div>
                      </div>
                    </motion.button>
                  )}

                  {/* Context menu */}
                  <AnimatePresence>
                    {menuOpenId === session.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-[8px] top-[40px] z-[50] bg-bg-overlay border border-border-medium rounded-[12px] py-[6px] min-w-[160px] shadow-2xl backdrop-blur-md"
                        style={isLight ? {
                          boxShadow: '0 8px 32px rgba(98,78,120,0.15), 0 2px 8px rgba(42,32,53,0.08)',
                          borderColor: 'rgba(98,78,120,0.15)',
                        } : { 
                          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                          borderColor: 'rgba(255,255,255,0.1)' 
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(session);
                          }}
                          className="w-full text-left flex items-center gap-[10px] px-[16px] py-[10px] text-[13px] font-medium font-body text-text-secondary bg-transparent border-none cursor-pointer hover:bg-bg-secondary hover:text-text-primary transition-colors"
                        >
                          <Pencil size={14} className="opacity-70" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            onDeleteSession(session.id);
                          }}
                          className="w-full text-left flex items-center gap-[10px] px-[16px] py-[10px] text-[13px] font-medium font-body text-semantic-error bg-transparent border-none cursor-pointer hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={14} className="opacity-70" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar footer */}
        <div
          className="px-[12px] py-[8px] border-t border-border-subtle flex-shrink-0"
          style={isLight ? { borderColor: 'rgba(98,78,120,0.06)', background: 'linear-gradient(0deg, rgba(98,78,120,0.02) 0%, transparent 100%)' } : undefined}
        >
          <p className="font-body text-[9px] text-text-placeholder text-center">
            {sessions.length} chat{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar (fixed overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-0 bottom-0 w-[270px] bg-bg-card border-r border-border-subtle z-[300] flex flex-col lg:hidden"
          >
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between px-[16px] py-[14px] border-b border-border-subtle flex-shrink-0">
              <h2 className="font-display text-text-primary text-[15px]">Chats</h2>
              <div className="flex items-center gap-[6px]">
                <motion.button
                  onClick={onNewChat}
                  whileTap={{ scale: 0.9 }}
                  className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-accent-sage text-white border-none cursor-pointer hover:brightness-110 transition-all"
                  title="New chat"
                >
                  <Plus size={15} />
                </motion.button>
                <motion.button
                  onClick={onToggle}
                  whileTap={{ scale: 0.9 }}
                  className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-transparent text-text-muted border border-border-subtle cursor-pointer hover:text-text-primary hover:border-border-medium transition-all"
                  title="Close sidebar"
                >
                  <PanelLeftClose size={15} />
                </motion.button>
              </div>
            </div>
            {/* Mobile session list */}
            <div
              className="flex-1 overflow-y-auto py-[8px] px-[8px]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-scrollbar) transparent' }}
            >
              {sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <motion.button
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onToggle();
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left rounded-[10px] px-[10px] py-[8px] cursor-pointer border-none transition-all duration-150 mb-[2px] ${
                      isActive
                        ? 'bg-[rgba(133,183,157,0.1)]'
                        : 'bg-transparent hover:bg-bg-secondary'
                    }`}
                  >
                    <p className={`font-body text-[13px] truncate ${
                      isActive ? 'text-text-primary font-medium' : 'text-text-secondary'
                    }`}>
                      {session.name}
                    </p>
                    <span className="font-body text-[9px] text-text-placeholder">
                      {session.messages.length} messages
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="px-[16px] py-[10px] border-t border-border-subtle flex-shrink-0">
              <p className="font-body text-[9px] text-text-placeholder text-center">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Companion Page ───
export function CompanionPage() {
  const theme = useStore((s) => s.theme);
  const isLight = theme !== 'dark';

  // ─── Session management ───
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const savedId = loadActiveSessionId();
    const loaded = loadSessions();
    if (savedId && loaded.some((s) => s.id === savedId)) return savedId;
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  // Ref to always have the latest activeSessionId (avoids stale closures)
  const activeSessionIdRef = useRef<string | null>(activeSessionId);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  const setMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setSessions((prev) => {
        const currentId = activeSessionIdRef.current;
        if (!currentId) return prev;
        return prev.map((s) => {
          if (s.id !== currentId) return s;
          const newMessages = typeof updater === 'function' ? updater(s.messages) : updater;
          return {
            ...s,
            messages: newMessages,
            name: s.name === 'New chat' && newMessages.length > 0
              ? generateSessionName(newMessages)
              : s.name,
            updatedAt: new Date().toISOString(),
          };
        });
      });
    },
    []
  );

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [personality, setPersonality] = useState<Personality>(() => {
    try {
      return (localStorage.getItem('breathe-companion-personality') as Personality) || 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([]);

  // Persist personality
  useEffect(() => {
    localStorage.setItem('breathe-companion-personality', personality);
  }, [personality]);

  // Persist sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processImageFiles(Array.from(files));
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImageFiles = (files: File[]) => {
    const remaining = MAX_IMAGES - pendingImages.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images per message.`);
      return;
    }

    const filesToProcess = files.slice(0, remaining);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 20 * 1024 * 1024) {
        setError('Images must be under 20MB each.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const raw = reader.result as string;
          // Compress for API use
          const compressed = await compressImage(raw);
          setPendingImages((prev) => {
            if (prev.length >= MAX_IMAGES) return prev;
            return [
              ...prev,
              { id: crypto.randomUUID(), dataUrl: compressed, name: file.name || 'image' },
            ];
          });
        } catch {
          setError('Failed to process image.');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Core send function that works with a specific messages array
  const sendWithMessages = useCallback(
    async (messageText: string, currentMessages: ChatMessage[], images?: string[]) => {
      setError(null);
      setInput('');
      setPendingImages([]);

      // Create thumbnails for chat display (small enough for localStorage)
      let thumbnails: string[] | undefined;
      if (images && images.length > 0) {
        try {
          thumbnails = await Promise.all(images.map((img) => createThumbnail(img)));
        } catch {
          thumbnails = images.map(() => 'thumb');
        }
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageText,
        images: thumbnails,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...currentMessages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const historyForAPI = updatedMessages.slice(-20).map((m) => ({
          role: m.role,
          // Include image descriptions in context so the text model knows what was in images
          content: m.role === 'user' && m.imageContext
            ? `[User shared image(s). Image content: ${m.imageContext}] ${m.content}`
            : m.role === 'user' && m.images && m.images.length > 0
            ? `[User shared ${m.images.length} image(s)] ${m.content}`
            : m.content,
        }));
        const history = historyForAPI.slice(0, -1);

        const apiBase = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiBase}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            history,
            personality,
            // Send full compressed images to API (not thumbnails)
            images: images && images.length > 0 ? images : undefined,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error (${response.status})`);
        }

        const data = await response.json();

        // If server returned imageContext (Gemini's description), attach it to the user message
        // so future API calls include what was in the images
        if (data.imageContext) {
          setMessages((prev) => {
            const updated = [...prev];
            // Find the last user message (the one we just sent) and attach imageContext
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === 'user' && updated[i].images && updated[i].images!.length > 0) {
                updated[i] = { ...updated[i], imageContext: data.imageContext };
                break;
              }
            }
            return updated;
          });
        }

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        // Show error as an assistant message so user sees it inline
        const errorAssistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `hmm, I had trouble responding just now. ${errorMessage.includes('Failed') || errorMessage.includes('Server error') ? "the AI service hit a hiccup. try sending your message again in a sec" : errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorAssistantMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [personality]
  );

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text || input).trim();
      const images = pendingImages.map((img) => img.dataUrl);
      if ((!messageText && images.length === 0) || isLoading) return;

      // Auto-create a session if none exists
      if (!activeSessionId) {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          name: 'New chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        activeSessionIdRef.current = newSession.id;
        // Defer the send to after state updates
        setTimeout(() => {
          const finalText = messageText || 'What do you see in this?';
          sendWithMessages(finalText, [], images.length > 0 ? images : undefined);
        }, 50);
        return;
      }

      const finalText = messageText || 'What do you see in this?';
      await sendWithMessages(finalText, messages, images.length > 0 ? images : undefined);
    },
    [input, isLoading, messages, pendingImages, sendWithMessages, activeSessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) return;

    // Prevent the default paste (don't insert binary data into textarea)
    e.preventDefault();
    processImageFiles(imageFiles);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setShowClearConfirm(false);
  };

  // ─── Session management actions ───
  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      name: 'New chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
    setInput('');
    setPendingImages([]);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      // If we deleted the active session, switch to first remaining or null
      if (activeSessionId === sessionId) {
        const next = updated.length > 0 ? updated[0].id : null;
        setActiveSessionId(next);
      }
      return updated;
    });
    setShowDeleteConfirm(null);
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
    );
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setError(null);
    setInput('');
    setPendingImages([]);
  }, []);

  const retryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    setMessages((prev) => {
      const copy = [...prev];
      if (copy.length > 0 && copy[copy.length - 1].role === 'assistant') copy.pop();
      if (copy.length > 0 && copy[copy.length - 1].role === 'user') copy.pop();
      return copy;
    });

    setTimeout(() => sendMessage(lastUserMsg.content), 100);
  };

  // Edit a user message: truncate conversation at that point and resend
  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (isLoading) return;

      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      // Keep all messages before the edited one
      const messagesBeforeEdit = messages.slice(0, msgIndex);

      // Send the edited content as a new message with prior context
      sendWithMessages(newContent, messagesBeforeEdit);
    },
    [messages, isLoading, sendWithMessages]
  );

  // Delete a specific message (and its response if it's a user message)
  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (isLoading) return;

      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return;

      setMessages((prev) => {
        const copy = [...prev];
        const msg = copy[msgIndex];

        if (msg.role === 'user') {
          // Delete user message + the following assistant response if it exists
          const nextMsg = copy[msgIndex + 1];
          if (nextMsg && nextMsg.role === 'assistant') {
            copy.splice(msgIndex, 2);
          } else {
            copy.splice(msgIndex, 1);
          }
        } else {
          copy.splice(msgIndex, 1);
        }

        return copy;
      });
    },
    [messages, isLoading]
  );

  const hasMessages = messages.length > 0;
  const messageCount = messages.length;

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex w-full"
      style={{ minHeight: '500px' }}
      id="companion-container"
    >
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteSession={(id) => setShowDeleteConfirm(id)}
        onRenameSession={renameSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 px-[12px] sm:px-[24px] relative">
        {/* Light mode ambient glow for chat area */}
        {isLight && (
          <>
            <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] rounded-full blur-[150px] pointer-events-none" style={{ backgroundColor: 'var(--color-accent-sage)', opacity: 0.05 }} />
            <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] rounded-full blur-[130px] pointer-events-none" style={{ backgroundColor: 'var(--color-accent-lavender)', opacity: 0.04 }} />
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[180px] pointer-events-none" style={{ backgroundColor: 'var(--color-accent-warm)', opacity: 0.025 }} />
          </>
        )}
        {/* Header */}
        <div
          className="flex items-center justify-between mb-[16px] flex-shrink-0 pt-[16px] lg:pt-[85px] relative z-[1]"
          style={isLight ? { borderBottom: '1px solid rgba(98,78,120,0.06)', paddingBottom: '14px' } : undefined}
        >
          <div className="flex items-center gap-[10px]">
            {/* Sidebar toggle */}
            {!sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSidebarOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center bg-transparent text-text-muted border border-border-subtle cursor-pointer hover:text-text-primary hover:border-border-medium transition-all"
                title="Open chat history"
              >
                <PanelLeftOpen size={15} />
              </motion.button>
            )}

            <div className="relative">
              <div
                className="w-[32px] h-[32px] rounded-full bg-accent-sage flex items-center justify-center flex-shrink-0"
                style={isLight
                  ? { boxShadow: '0 0 16px rgba(69,115,88,0.4), 0 0 40px rgba(69,115,88,0.15), 0 2px 8px rgba(69,115,88,0.2)' }
                  : { boxShadow: '0 0 16px rgba(69,115,88,0.35), 0 0 40px rgba(69,115,88,0.1)' }
                }
              >
                <SolaraLogo className="w-[20px] h-[20px] text-white" />
              </div>
              <motion.div
                className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] rounded-full bg-accent-sage border-[2px] border-bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <div>
              <h1 className="font-display text-text-primary text-[20px] leading-tight">
                Solara
              </h1>
              <span className="font-body text-[11px] text-text-muted">
                Always here
              </span>
            </div>
          </div>

          <div className="flex items-center gap-[6px]">
            {/* New chat button (visible in header) */}
            <motion.button
              onClick={createNewChat}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-[5px] font-body text-[12px] text-text-muted border border-border-subtle bg-transparent rounded-full px-[10px] py-[5px] cursor-pointer transition-colors duration-200 hover:text-accent-sage hover:border-accent-sage"
              style={isLight ? { boxShadow: '0 1px 4px rgba(98,78,120,0.06)' } : undefined}
              title="New chat"
            >
              <Plus size={12} />
              <span className="max-[479px]:hidden">New</span>
            </motion.button>

            {hasMessages && (
              <>
                <span className="flex items-center gap-[4px] text-[10px] font-body text-text-muted max-[479px]:hidden">
                  <MessageCircle size={10} />
                  {messageCount}
                </span>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowClearConfirm(true)}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center gap-[5px] font-body text-[12px] text-text-muted border border-border-subtle bg-transparent rounded-full px-[10px] py-[5px] cursor-pointer transition-colors duration-200 hover:text-semantic-error hover:border-semantic-error"
                  aria-label="Clear conversation"
                >
                  <Trash2 size={12} />
                  <span className="max-[479px]:hidden">Clear</span>
                </motion.button>
              </>
            )}
            {activeSessionId && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowDeleteConfirm(activeSessionId)}
                className="flex items-center gap-[5px] font-body text-[12px] text-text-muted border border-border-subtle bg-transparent rounded-full px-[10px] py-[5px] cursor-pointer transition-colors duration-200 hover:text-semantic-error hover:border-semantic-error lg:hidden"
                aria-label="Delete chat"
                title="Delete this chat"
              >
                <X size={12} />
                <span className="max-[479px]:hidden">Delete</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-[5px] font-body text-[12px] border rounded-full px-[10px] py-[5px] cursor-pointer transition-colors duration-200 ${
                showSettings
                  ? 'text-accent-sage border-accent-sage bg-[rgba(133,183,157,0.08)]'
                  : 'text-text-muted border-border-subtle bg-transparent hover:text-text-primary hover:border-border-medium'
              }`}
              aria-label="Solara settings"
            >
              <Settings2 size={13} />
              <span className="max-[479px]:hidden">Tone</span>
            </motion.button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden flex-shrink-0 max-w-[720px] mx-auto w-full"
            >
              <div
                className="bg-bg-secondary border border-border-subtle rounded-[14px] px-[16px] py-[14px] mb-[16px]"
                style={isLight ? {
                  boxShadow: '0 2px 16px rgba(98,78,120,0.06), 0 1px 4px rgba(42,32,53,0.04)',
                  background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(69,115,88,0.03) 100%)',
                  borderColor: 'rgba(98,78,120,0.08)',
                } : undefined}
              >
                <p className="font-body text-[11px] text-text-muted uppercase tracking-[0.1em] mb-[10px]">
                  How should Solara talk?
                </p>
                <div className="grid grid-cols-2 gap-[8px] max-[479px]:grid-cols-1">
                  {PERSONALITIES.map((p) => (
                    <motion.button
                      key={p.key}
                      onClick={() => {
                        setPersonality(p.key);
                        setShowSettings(false);
                      }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-left border rounded-[10px] px-[12px] py-[10px] cursor-pointer transition-all duration-200 ${
                        personality === p.key
                          ? 'border-accent-sage bg-[rgba(133,183,157,0.08)]'
                          : 'border-border-subtle bg-transparent hover:border-border-medium hover:bg-bg-card'
                      }`}
                      style={isLight ? (
                        personality === p.key
                          ? { boxShadow: '0 2px 12px rgba(69,115,88,0.1), inset 0 0 0 1px rgba(69,115,88,0.08)' }
                          : { boxShadow: '0 1px 4px rgba(98,78,120,0.04)' }
                      ) : undefined}
                    >
                      <div className="flex items-center gap-[6px] mb-[2px]">
                        {personality === p.key && (
                          <div
                            className="w-[6px] h-[6px] rounded-full bg-accent-sage flex-shrink-0"
                            style={isLight ? { boxShadow: '0 0 8px rgba(69,115,88,0.4)' } : undefined}
                          />
                        )}
                        <span className={`font-body text-[13px] font-medium ${
                          personality === p.key ? 'text-accent-sage' : 'text-text-primary'
                        }`}>
                          {p.label}
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-text-muted leading-snug mb-[4px]">
                        {p.description}
                      </p>
                      <p className="font-mono text-[10px] text-text-placeholder italic">
                        {p.preview}
                      </p>
                    </motion.button>
                  ))}
                </div>
                <p className="font-body text-[10px] text-text-muted mt-[10px] text-center">
                  Changes apply to new messages. Your conversation history is kept.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 max-w-[720px] mx-auto w-full">
          {!hasMessages ? (
            <WelcomeScreen onSuggestion={(text) => sendMessage(text)} />
          ) : (
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto flex flex-col gap-[16px] pb-[16px] pr-[4px]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-scrollbar) transparent' }}
            >
              {/* Session start indicator */}
              <div className="flex items-center justify-center gap-[8px] py-[8px]">
                <div className="h-[1px] flex-1" style={isLight ? { background: 'linear-gradient(90deg, transparent, rgba(98,78,120,0.1))' } : { backgroundColor: 'var(--color-border-subtle)' }} />
                <span
                  className="text-[10px] font-body text-text-muted px-[8px]"
                  style={isLight ? { background: 'linear-gradient(135deg, rgba(69,115,88,0.06), rgba(98,78,120,0.04))', borderRadius: '12px', padding: '4px 12px' } : undefined}
                >
                  {new Date(messages[0]?.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="h-[1px] flex-1" style={isLight ? { background: 'linear-gradient(90deg, rgba(98,78,120,0.1), transparent)' } : { backgroundColor: 'var(--color-border-subtle)' }} />
              </div>

              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    isLoading={isLoading}
                  />
                ))}
              </AnimatePresence>

              {isLoading && <TypingIndicator />}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-[8px] bg-semantic-error-bg border border-semantic-error rounded-[12px] px-[14px] py-[10px] max-w-[720px]"
                >
                  <p className="font-body text-[13px] text-semantic-error flex-1">
                    {error}
                  </p>
                  <button
                    onClick={retryLast}
                    className="flex items-center gap-[4px] text-[12px] font-body text-semantic-error bg-transparent border-none cursor-pointer hover:underline"
                  >
                    <RotateCcw size={12} />
                    Retry
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="flex-shrink-0 pt-[12px] border-t border-border-subtle max-w-[720px] mx-auto w-full max-[1023px]:pb-[8px] relative z-[1]"
          style={isLight ? {
            borderColor: 'rgba(98,78,120,0.08)',
            boxShadow: '0 -4px 20px rgba(98,78,120,0.04)',
            background: 'linear-gradient(180deg, rgba(69,115,88,0.015) 0%, transparent 100%)',
            borderRadius: '16px 16px 0 0',
            padding: '14px 8px 8px',
          } : { boxShadow: '0 -4px 16px rgba(98,78,120,0.04)' }}
        >
          {/* Image preview strip */}
          <AnimatePresence>
            {pendingImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-[10px] overflow-hidden"
              >
                <div className="flex items-center gap-[4px] mb-[6px]">
                  <span className="text-[10px] font-body text-text-muted">
                    {pendingImages.length} image{pendingImages.length !== 1 ? 's' : ''} attached
                  </span>
                  <span className="text-[10px] font-body text-text-placeholder">
                    (max {MAX_IMAGES})
                  </span>
                </div>
                <div className="flex gap-[8px] overflow-x-auto pb-[4px]" style={{ scrollbarWidth: 'thin' }}>
                  {pendingImages.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative flex-shrink-0 group/img"
                    >
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-[64px] h-[64px] object-cover rounded-[8px] border border-border-subtle"
                      />
                      <button
                        onClick={() => removePendingImage(img.id)}
                        className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-semantic-error text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover/img:opacity-100 transition-opacity duration-150"
                        aria-label={`Remove ${img.name}`}
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-[8px]">
            {/* Image upload button */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileTap={{ scale: 0.9 }}
              disabled={isLoading || pendingImages.length >= MAX_IMAGES}
              className={`w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 border border-border-subtle cursor-pointer transition-all duration-200 ${
                pendingImages.length >= MAX_IMAGES || isLoading
                  ? 'bg-bg-secondary text-text-placeholder cursor-not-allowed opacity-50'
                  : 'bg-transparent text-text-muted hover:text-accent-sage hover:border-accent-sage hover:bg-[rgba(133,183,157,0.06)]'
              }`}
              style={isLight && !(pendingImages.length >= MAX_IMAGES || isLoading) ? {
                boxShadow: '0 1px 6px rgba(98,78,120,0.06)',
              } : undefined}
              aria-label="Attach images"
              title={pendingImages.length >= MAX_IMAGES ? `Max ${MAX_IMAGES} images` : 'Attach images'}
            >
              <ImagePlus size={16} />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              aria-hidden="true"
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={pendingImages.length > 0 ? 'Add a message about your images...' : "Say what you're feeling..."}
              rows={1}
              className="flex-1 bg-bg-input border border-border-subtle rounded-[14px] px-[16px] py-[10px] text-[14px] font-body text-text-primary placeholder:text-text-placeholder placeholder:font-body resize-none outline-none transition-all duration-200 focus:border-accent-sage focus:shadow-[0_0_0_3px_rgba(133,183,157,0.15)]"
              style={{
                maxHeight: '120px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--color-scrollbar) transparent',
                ...(isLight ? {
                  boxShadow: '0 1px 6px rgba(98,78,120,0.05), inset 0 1px 2px rgba(42,32,53,0.03)',
                  background: 'linear-gradient(135deg, var(--color-bg-input) 0%, rgba(98,78,120,0.02) 100%)',
                } : {}),
              }}
              disabled={isLoading}
            />
            <motion.button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && pendingImages.length === 0) || isLoading}
              whileTap={{ scale: 0.9 }}
              className={`w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-all duration-200 ${
                (input.trim() || pendingImages.length > 0) && !isLoading
                  ? 'bg-accent-sage text-white hover:brightness-110'
                  : 'bg-bg-secondary text-text-muted cursor-not-allowed'
              }`}
              style={(input.trim() || pendingImages.length > 0) && !isLoading && isLight
                ? { boxShadow: '0 2px 12px rgba(69,115,88,0.3), 0 0 20px rgba(69,115,88,0.1)' }
                : undefined
              }
              aria-label="Send message"
            >
              <Send size={16} />
            </motion.button>
          </div>
          <div className="flex items-center justify-center gap-[12px] mt-[8px]">
            <p className="font-body text-[10px] text-text-muted" style={isLight ? { textShadow: '0 0 20px rgba(98,78,120,0.06)' } : undefined}>
              Solara is not a therapist. If you&apos;re in crisis, please call 988.
            </p>
          </div>
        </div>
      </div>

      {/* Clear chat confirmation modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <ConfirmDialog
            title="Clear conversation?"
            description="This will permanently delete all messages in this conversation. This can't be undone."
            confirmLabel="Clear all"
            onConfirm={clearChat}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete session confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmDialog
            title="Delete conversation?"
            description="This conversation and all its messages will be permanently deleted."
            confirmLabel="Delete"
            onConfirm={() => deleteSession(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
