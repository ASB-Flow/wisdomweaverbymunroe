import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  MessageCircle,
  Heart,
  Eye,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/useStats';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { stats: dashboardStats, loading } = useStats();
  const { teachings } = useTeachings();

  const recentTeachings = teachings.slice(0, 4);

  const getThemeLabel = (themeId: string) =>
    themes.find(t => t.id === themeId)?.label || themeId;

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

        {/* Recent Teachings */}
        <div className="animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Enseignements récents
            </h2>
            <Link to="/teachings">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTeachings.map((teaching) => (
              <Link key={teaching.id} to={`/teachings/${teaching.id}`}>
                <Card className="hover:shadow-md transition-all duration-300 h-full group">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-2">
                      {getThemeLabel(teaching.theme)}
                    </Badge>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {teaching.titleFr}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {teaching.contentFr.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
