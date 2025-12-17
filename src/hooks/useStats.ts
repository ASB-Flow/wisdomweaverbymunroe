import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeachingsStore } from '@/lib/teachings-store';

export interface DashboardStats {
  totalTeachings: number;
  totalComments: number;
  totalFavorites: number;
  totalViews: number;
  recentActivity: {
    comments: number;
    favorites: number;
  };
}

export const useStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachings: 0,
    totalComments: 0,
    totalFavorites: 0,
    totalViews: 0,
    recentActivity: {
      comments: 0,
      favorites: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const { teachings } = useTeachingsStore();

  const fetchStats = async () => {
    setLoading(true);

    try {
      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      // Get recent comments (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCommentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get recent favorites (last 7 days)
      const { count: recentFavoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalTeachings: teachings.filter(t => t.status === 'published').length,
        totalComments: commentsCount || 0,
        totalFavorites: favoritesCount || 0,
        totalViews: teachings.length * 12, // Simulated views
        recentActivity: {
          comments: recentCommentsCount || 0,
          favorites: recentFavoritesCount || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [teachings.length]);

  return { stats, loading, refetch: fetchStats };
};
