import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { insights } from '@/lib/seed-data';

export interface Teaching {
  id: string;
  titleFr: string;
  theme: string;
  insights: typeof insights;
  status: 'draft' | 'review' | 'published';
  contentFr: string;
  youtubeUrl?: string;
  socialPosts?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  generatedDesign?: string;
}

const themes = [
  { id: 'meditation', label: 'Méditation', tags: ['méditation', 'parole', 'transformation'] },
  { id: 'leadership', label: 'Leadership', tags: ['leadership', 'service', 'influence', 'caractère', 'intégrité'] },
  { id: 'purpose', label: 'Purpose & Destinée', tags: ['purpose', 'destinée', 'potentiel', 'création'] },
  { id: 'kingdom', label: 'Royaume', tags: ['royaume', 'gouvernement', 'spiritualité'] },
  { id: 'vision', label: 'Vision', tags: ['vision', 'provision'] },
];

const generateInitialTeachings = (): Teaching[] => {
  return themes.map((theme, idx) => {
    const themeInsights = insights.filter(insight => 
      insight.tags.some(tag => theme.tags.includes(tag))
    );
    const combinedContent = themeInsights.map(i => 
      `## ${i.title}\n\n${i.bullets.map(b => `- ${b}`).join('\n')}\n\n> "${i.citationText}"`
    ).join('\n\n---\n\n');

    return {
      id: `teaching-${idx + 1}`,
      titleFr: `Enseignement sur ${theme.label}`,
      theme: theme.id,
      insights: themeInsights,
      status: idx === 0 ? 'published' : idx === 1 ? 'review' : 'draft',
      contentFr: combinedContent,
    };
  });
};

interface TeachingsState {
  teachings: Teaching[];
  addTeaching: (teaching: Teaching) => void;
  updateTeaching: (id: string, updates: Partial<Teaching>) => void;
  getTeachingById: (id: string) => Teaching | undefined;
}

export const useTeachingsStore = create<TeachingsState>()(
  persist(
    (set, get) => ({
      teachings: generateInitialTeachings(),
      addTeaching: (teaching) => 
        set((state) => ({ teachings: [...state.teachings, teaching] })),
      updateTeaching: (id, updates) =>
        set((state) => ({
          teachings: state.teachings.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      getTeachingById: (id) => get().teachings.find((t) => t.id === id),
    }),
    {
      name: 'teachings-storage',
    }
  )
);

export { themes };
