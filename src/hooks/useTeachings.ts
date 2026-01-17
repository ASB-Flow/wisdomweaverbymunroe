import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VisualConcept {
  title: string;
  type: 'diagram' | 'pyramid' | 'cycle' | 'comparison' | 'timeline' | 'mindmap';
  description: string;
  elements: string[];
  explanation: string;
}

export interface PracticalTip {
  tip: string;
  icon: 'lightbulb' | 'target' | 'star' | 'heart' | 'book' | 'compass';
  application: string;
}

export interface Citation {
  text: string;
  context?: string;
}

export interface Principle {
  name: string;
  definition: string;
  importance: string;
}

export interface ApplicationStep {
  step: number;
  action: string;
  outcome: string;
}

// For compatibility with existing code
export interface TeachingInput {
  titleFr: string;
  theme: string;
  status?: 'draft' | 'review' | 'published';
  contentFr: string;
  youtubeUrl?: string;
  socialPosts?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  generatedDesign?: string;
  visualConcepts?: VisualConcept[];
  practicalTips?: PracticalTip[];
  citations?: Citation[];
  principles?: Principle[];
  applicationSteps?: ApplicationStep[];
}

// Frontend teaching format (camelCase)
export interface TeachingFrontend {
  id: string;
  titleFr: string;
  theme: string;
  status: 'draft' | 'review' | 'published';
  contentFr: string;
  youtubeUrl?: string;
  socialPosts?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  generatedDesign?: string;
  visualConcepts?: VisualConcept[];
  practicalTips?: PracticalTip[];
  citations?: Citation[];
  principles?: Principle[];
  applicationSteps?: ApplicationStep[];
  createdAt: string;
  updatedAt: string;
  // Legacy field for compatibility
  insights?: any[];
}

// Convert from DB format to frontend format
const toFrontendTeaching = (dbTeaching: any): TeachingFrontend => ({
  id: dbTeaching.id,
  titleFr: dbTeaching.title_fr,
  theme: dbTeaching.theme,
  status: dbTeaching.status,
  contentFr: dbTeaching.content_fr,
  youtubeUrl: dbTeaching.youtube_url || undefined,
  socialPosts: dbTeaching.social_posts || undefined,
  generatedDesign: dbTeaching.generated_design || undefined,
  visualConcepts: dbTeaching.visual_concepts || undefined,
  practicalTips: dbTeaching.practical_tips || undefined,
  citations: dbTeaching.citations || undefined,
  principles: dbTeaching.principles || undefined,
  applicationSteps: dbTeaching.application_steps || undefined,
  createdAt: dbTeaching.created_at,
  updatedAt: dbTeaching.updated_at,
  insights: [], // Legacy compatibility
});

export function useTeachings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teachings = [], isLoading, error } = useQuery({
    queryKey: ['teachings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((t: any) => toFrontendTeaching(t));
    },
  });

  const addTeachingMutation = useMutation({
    mutationFn: async (input: TeachingInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        title_fr: input.titleFr,
        theme: input.theme,
        status: input.status || 'draft',
        content_fr: input.contentFr,
        youtube_url: input.youtubeUrl || null,
        social_posts: input.socialPosts || null,
        generated_design: input.generatedDesign || null,
        visual_concepts: input.visualConcepts || null,
        practical_tips: input.practicalTips || null,
        citations: input.citations || null,
        principles: input.principles || null,
        application_steps: input.applicationSteps || null,
        created_by: user?.id || null,
      };

      const { data, error } = await supabase
        .from('teachings')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return toFrontendTeaching(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'enseignement",
        variant: "destructive",
      });
    },
  });

  const updateTeachingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TeachingInput> }) => {
      const updateData: Record<string, any> = {};
      
      if (updates.titleFr !== undefined) updateData.title_fr = updates.titleFr;
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.contentFr !== undefined) updateData.content_fr = updates.contentFr;
      if (updates.youtubeUrl !== undefined) updateData.youtube_url = updates.youtubeUrl;
      if (updates.socialPosts !== undefined) updateData.social_posts = updates.socialPosts;
      if (updates.generatedDesign !== undefined) updateData.generated_design = updates.generatedDesign;
      if (updates.visualConcepts !== undefined) updateData.visual_concepts = updates.visualConcepts;
      if (updates.practicalTips !== undefined) updateData.practical_tips = updates.practicalTips;
      if (updates.citations !== undefined) updateData.citations = updates.citations;
      if (updates.principles !== undefined) updateData.principles = updates.principles;
      if (updates.applicationSteps !== undefined) updateData.application_steps = updates.applicationSteps;

      const { data, error } = await supabase
        .from('teachings')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toFrontendTeaching(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'enseignement",
        variant: "destructive",
      });
    },
  });

  const deleteTeachingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teachings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'enseignement",
        variant: "destructive",
      });
    },
  });

  const getTeachingById = (id: string) => {
    return teachings.find(t => t.id === id);
  };

  return {
    teachings,
    isLoading,
    error,
    addTeaching: addTeachingMutation.mutateAsync,
    updateTeaching: (id: string, updates: Partial<TeachingInput>) => 
      updateTeachingMutation.mutateAsync({ id, updates }),
    deleteTeaching: deleteTeachingMutation.mutateAsync,
    getTeachingById,
    isAdding: addTeachingMutation.isPending,
    isUpdating: updateTeachingMutation.isPending,
    isDeleting: deleteTeachingMutation.isPending,
  };
}

export const themes = [
  { id: 'meditation', label: 'Méditation', tags: ['méditation', 'parole', 'transformation'] },
  { id: 'leadership', label: 'Leadership', tags: ['leadership', 'service', 'influence', 'caractère', 'intégrité'] },
  { id: 'purpose', label: 'Purpose & Destinée', tags: ['purpose', 'destinée', 'potentiel', 'création'] },
  { id: 'kingdom', label: 'Royaume', tags: ['royaume', 'gouvernement', 'spiritualité'] },
  { id: 'vision', label: 'Vision', tags: ['vision', 'provision'] },
];
