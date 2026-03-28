import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Mood =
  | 'neutral'
  | 'angry'
  | 'sad'
  | 'anxious'
  | 'calm'
  | 'numb'
  | 'overwhelmed'
  | 'joy'
  | 'exhausted'
  | 'frustrated'
  | 'hopeful'
  | 'confused'
  | 'lonely'
  | 'stressed'
  | 'lost'
  | 'grateful'
  | 'proud'
  | 'insecure'
  | 'restless'
  | 'panicked'
  | 'inspired'
  | 'loved'
  | 'peaceful'
  | 'passionate'
  | 'empowered'
  | 'euphoric';

export type Theme = 'dark' | 'light';

export interface JournalEntry {
  id: string;
  content: string;
  mood: Mood;
  intensity: number;
  createdAt: string;
}

interface BreatheState {
  mood: Mood;
  intensity: number;
  theme: Theme;
  journalEntries: JournalEntry[];
  isBreathingActive: boolean;
  showCrisisOverlay: boolean;
  isLoading: boolean;

  setMood: (mood: Mood) => void;
  setIntensity: (intensity: number) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  fetchEntries: () => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  removeJournalEntry: (id: string) => Promise<void>;
  clearAllEntries: () => void;
  setBreathingActive: (active: boolean) => void;
  setShowCrisisOverlay: (show: boolean) => void;
}

export const useStore = create<BreatheState>()(
  persist(
    (set, get) => ({
      mood: 'neutral',
      intensity: 3,
      theme: 'light',
      journalEntries: [],
      isBreathingActive: false,
      showCrisisOverlay: false,
      isLoading: false,

      setMood: (mood) => {
        set({ mood });
      },

      setIntensity: (intensity) => set({ intensity }),

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        }),

      fetchEntries: async () => {
        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ journalEntries: [], isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (data) {
            set({
              journalEntries: data.map((e) => ({
                id: e.id,
                content: e.content,
                mood: e.mood as Mood,
                intensity: e.intensity,
                createdAt: e.created_at,
              })),
            });
          }
        } catch (error) {
          console.error('Error fetching entries:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addJournalEntry: async (entry) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const now = new Date().toISOString();
        const tempEntry = { ...entry, id: tempId, createdAt: now };

        set((state) => ({
          journalEntries: [tempEntry as JournalEntry, ...state.journalEntries],
        }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user authenticated');

          const { data, error } = await supabase
            .from('journal_entries')
            .insert({
              user_id: user.id,
              content: entry.content,
              mood: entry.mood,
              intensity: entry.intensity,
            })
            .select()
            .single();

          if (error) throw error;

          // Replace temp entry with real one
          if (data) {
            set((state) => ({
              journalEntries: state.journalEntries.map((e) =>
                e.id === tempId
                  ? {
                      id: data.id,
                      content: data.content,
                      mood: data.mood as Mood,
                      intensity: data.intensity,
                      createdAt: data.created_at,
                    }
                  : e
              ),
            }));
          }
        } catch (error) {
          console.error('Error adding entry:', error);
          // Revert optimistic update on failure
          set((state) => ({
            journalEntries: state.journalEntries.filter((e) => e.id !== tempId),
          }));
        }
      },

      removeJournalEntry: async (id) => {
        // Optimistic update
        const previousEntries = get().journalEntries;
        set((state) => ({
          journalEntries: state.journalEntries.filter((e) => e.id !== id),
        }));

        try {
          const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

          if (error) throw error;
        } catch (error) {
          console.error('Error deleting entry:', error);
          // Revert on failure
          set({ journalEntries: previousEntries });
        }
      },

      clearAllEntries: () => set({ journalEntries: [] }),

      setBreathingActive: (active) => set({ isBreathingActive: active }),

      setShowCrisisOverlay: (show) => set({ showCrisisOverlay: show }),
    }),
    {
      name: 'solace-storage',
      partialize: (state) => ({
        mood: state.mood,
        theme: state.theme,
        // Removed journalEntries so it doesn't persist to local storage
        intensity: state.intensity,
      }),
    }
  )
);
