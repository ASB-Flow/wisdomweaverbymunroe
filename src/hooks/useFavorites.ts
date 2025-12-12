import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('teaching_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data.map(f => f.teaching_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (teachingId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, teaching_id: teachingId });

      if (error) throw error;
      
      setFavorites(prev => [...prev, teachingId]);
      toast.success('Ajouté aux favoris');
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Déjà dans vos favoris');
      } else {
        console.error('Error adding favorite:', error);
        toast.error('Erreur lors de l\'ajout aux favoris');
      }
    }
  };

  const removeFavorite = async (teachingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('teaching_id', teachingId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(id => id !== teachingId));
      toast.success('Retiré des favoris');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const toggleFavorite = async (teachingId: string) => {
    if (favorites.includes(teachingId)) {
      await removeFavorite(teachingId);
    } else {
      await addFavorite(teachingId);
    }
  };

  const isFavorite = (teachingId: string) => favorites.includes(teachingId);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
