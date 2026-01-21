import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Comment {
  id: string;
  teaching_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  avatar_url: string | null;
  is_own_comment: boolean;
}

export const useComments = (teachingId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    setLoading(true);
    
    // Use the secure view that doesn't expose user_id
    const { data: commentsData, error } = await supabase
      .from('comments_with_profiles')
      .select('*')
      .eq('teaching_id', teachingId)
      .order('created_at', { ascending: false });

    if (error || !commentsData) {
      setComments([]);
      setLoading(false);
      return;
    }

    setComments(commentsData as Comment[]);
    setLoading(false);
  };

  const addComment = async (content: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('comments')
      .insert({
        teaching_id: teachingId,
        user_id: user.id,
        content: content.trim()
      });

    if (!error) {
      await fetchComments();
    }

    return { error };
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchComments();
    }

    return { error };
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchComments();
    }

    return { error };
  };

  useEffect(() => {
    if (teachingId) {
      fetchComments();
    }
  }, [teachingId]);

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments
  };
};
