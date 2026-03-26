export const RANT_PLACEHOLDERS = [
  "What's weighing on you right now?...",
  'There are no wrong feelings here...',
  'Start wherever you need to...',
  'This space is only yours...',
  "Say the thing you haven't been able to say...",
  "No one's reading this but you...",
  'What do you need to let out today?...',
] as const;

export const AFFIRMATION_MESSAGES = [
  'You let it out. That took courage.',
  "Those words don't own you anymore.",
  'Solace. You did something important.',
  "It's out of you now. You're lighter.",
  "That was real. You're still here.",
  "You didn't have to. You chose to. That matters.",
] as const;

export const WORD_CLOUD_WORDS = [
  'anxious', 'tired', 'angry', 'lost', 'stuck',
  'scared', 'overwhelmed', 'numb', 'hollow', 'exhausted',
  'frustrated', 'unseen', 'unheard', 'heavy', 'breaking',
  'alone', 'confused', 'trapped', 'hopeless', 'desperate',
  'grieving', 'empty', 'suffocating', 'forgotten', 'invisible',
] as const;

export const CRISIS_KEYWORDS = [
  'suicide', 'self-harm', 'kill myself', 'end it',
  "don't want to be here", 'hurting myself', 'self harm',
  'want to die', 'ending it all', 'no reason to live',
] as const;

export const EMOTIONS = [
  // High Energy / Negative & Positive
  { key: 'angry', label: 'Angry', color: 'var(--color-emotion-angry)' },
  { key: 'frustrated', label: 'Frustrated', color: 'var(--color-emotion-frustrated)' },
  { key: 'overwhelmed', label: 'Overwhelmed', color: 'var(--color-emotion-overwhelmed)' },
  { key: 'excited', label: 'Excited', color: 'var(--color-emotion-excited)' },
  { key: 'passionate', label: 'Passionate', color: 'var(--color-emotion-passionate)' },
  { key: 'empowered', label: 'Empowered', color: 'var(--color-emotion-empowered)' },
  { key: 'euphoric', label: 'Euphoric', color: 'var(--color-emotion-euphoric)' },
  { key: 'restless', label: 'Restless', color: 'var(--color-emotion-restless)' },
  { key: 'panicked', label: 'Panicked', color: 'var(--color-emotion-panicked)' },
  
  // Low Energy / Negative
  { key: 'sad', label: 'Sad', color: 'var(--color-emotion-sad)' },
  { key: 'lonely', label: 'Lonely', color: 'var(--color-emotion-lonely)' },
  { key: 'lost', label: 'Lost', color: 'var(--color-emotion-lost)' },
  { key: 'numb', label: 'Numb', color: 'var(--color-emotion-numb)' },
  { key: 'exhausted', label: 'Exhausted', color: 'var(--color-emotion-exhausted)' },
  { key: 'insecure', label: 'Insecure', color: 'var(--color-emotion-insecure)' },
  { key: 'confused', label: 'Confused', color: 'var(--color-emotion-confused)' },
  { key: 'anxious', label: 'Anxious', color: 'var(--color-emotion-anxious)' },
  { key: 'stressed', label: 'Stressed', color: 'var(--color-emotion-stressed)' },

  // Positive / Grounded
  { key: 'calm', label: 'Calm', color: 'var(--color-emotion-calm)' },
  { key: 'hopeful', label: 'Hopeful', color: 'var(--color-emotion-hopeful)' },
  { key: 'grateful', label: 'Grateful', color: 'var(--color-emotion-grateful)' },
  { key: 'proud', label: 'Proud', color: 'var(--color-emotion-proud)' },
  { key: 'inspired', label: 'Inspired', color: 'var(--color-emotion-inspired)' },
  { key: 'loved', label: 'Loved', color: 'var(--color-emotion-loved)' },
  { key: 'peaceful', label: 'Peaceful', color: 'var(--color-emotion-peaceful)' },
] as const;

export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/rant', label: 'Rant' },
  { path: '/companion', label: 'Companion' },
  { path: '/journal', label: 'Journal' },
  { path: '/resources', label: 'Resources' },
] as const;
