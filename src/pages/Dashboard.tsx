import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { InsightCard } from '@/components/insights/InsightCard';
import { PostPreview } from '@/components/posts/PostPreview';
import { SourceCard } from '@/components/sources/SourceCard';
import { 
  Video, 
  Lightbulb, 
  FileText, 
  Calendar,
  ArrowRight,
  MessageCircle,
  Heart,
  Eye,
  BookOpen
} from 'lucide-react';
import { getStats, insights, posts, sources } from '@/lib/seed-data';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/useStats';
import { useTeachingsStore } from '@/lib/teachings-store';

export default function Dashboard() {
  const stats = getStats();
  const { stats: dashboardStats, loading } = useStats();
  const { teachings } = useTeachingsStore();
  const recentInsights = insights.slice(0, 3);
  const recentPosts = posts.filter(p => p.status !== 'draft').slice(0, 2);
  const recentSources = sources.slice(0, 2);

  return (
    <MainLayout>
      <Header 
        title="Tableau de bord" 
        subtitle="Bienvenue ! Voici un aperçu de votre contenu."
      />
      
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <StatCard 
            title="Enseignements" 
            value={dashboardStats.totalTeachings} 
            icon={BookOpen}
            trend={{ value: teachings.length, isPositive: true }}
          />
          <StatCard 
            title="Commentaires" 
            value={dashboardStats.totalComments} 
            icon={MessageCircle}
            trend={{ value: dashboardStats.recentActivity.comments, isPositive: true }}
          />
          <StatCard 
            title="Favoris" 
            value={dashboardStats.totalFavorites} 
            icon={Heart}
            trend={{ value: dashboardStats.recentActivity.favorites, isPositive: true }}
          />
          <StatCard 
            title="Vues estimées" 
            value={dashboardStats.totalViews} 
            icon={Eye}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Insights */}
          <div className="lg:col-span-2 animate-slide-up stagger-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Insights récents
              </h2>
              <Link to="/insights">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {recentInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 animate-slide-up stagger-2">
            {/* Upcoming Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Posts à venir
                </h2>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Calendrier <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <PostPreview key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Recent Sources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Sources récentes
                </h2>
                <Link to="/sources">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentSources.map((source) => (
                  <SourceCard key={source.id} source={source} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
