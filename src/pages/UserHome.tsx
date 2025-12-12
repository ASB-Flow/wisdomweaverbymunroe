import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useTeachingsStore, themes } from '@/lib/teachings-store';
import { useFavorites } from '@/hooks/useFavorites';
import { insights } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

export default function UserHome() {
  const { teachings } = useTeachingsStore();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Get latest teachings (published first)
  const latestTeachings = [...teachings]
    .sort((a, b) => {
      if (a.status === 'published' && b.status !== 'published') return -1;
      if (b.status === 'published' && a.status !== 'published') return 1;
      return 0;
    })
    .slice(0, 4);

  // Get featured insights
  const featuredInsights = insights.slice(0, 3);

  // Get favorite teachings
  const favoriteTeachings = teachings.filter(t => favorites.includes(t.id));

  const getThemeLabel = (themeId: string) => {
    return themes.find(t => t.id === themeId)?.label || themeId;
  };

  return (
    <MainLayout>
      <Header 
        title="Bienvenue" 
        subtitle="Découvrez les enseignements et insights de Myles Munroe"
      />

      <div className="p-6 space-y-8">
        {/* Featured Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">En vedette</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestTeachings.slice(0, 2).map((teaching) => (
              <Card key={teaching.id} className="group hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="mb-2">
                      {getThemeLabel(teaching.theme)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(teaching.id);
                      }}
                      className="opacity-70 hover:opacity-100"
                    >
                      <Heart 
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isFavorite(teaching.id) 
                            ? "fill-destructive text-destructive" 
                            : "text-muted-foreground"
                        )} 
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {teaching.titleFr}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {teaching.contentFr.substring(0, 150)}...
                  </p>
                  <Link to={`/teachings/${teaching.id}`}>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Découvrir <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Favorites Section */}
        {favoriteTeachings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground">Mes favoris</h2>
              </div>
              <Link to="/teachings">
                <Button variant="ghost" size="sm">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoriteTeachings.slice(0, 3).map((teaching) => (
                <Link key={teaching.id} to={`/teachings/${teaching.id}`}>
                  <Card className="hover:shadow-md transition-all duration-300 h-full">
                    <CardHeader className="pb-2">
                      <Badge variant="outline" className="w-fit mb-2">
                        {getThemeLabel(teaching.theme)}
                      </Badge>
                      <CardTitle className="text-base">{teaching.titleFr}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {teaching.contentFr.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Teachings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Enseignements récents</h2>
            </div>
            <Link to="/teachings">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestTeachings.map((teaching) => (
              <Link key={teaching.id} to={`/teachings/${teaching.id}`}>
                <Card className="hover:shadow-md transition-all duration-300 h-full group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-2">
                        {getThemeLabel(teaching.theme)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(teaching.id);
                        }}
                      >
                        <Heart 
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isFavorite(teaching.id) 
                              ? "fill-destructive text-destructive" 
                              : "text-muted-foreground group-hover:text-foreground"
                          )} 
                        />
                      </Button>
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {teaching.titleFr}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {teaching.contentFr.substring(0, 80)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Insights */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-foreground">Insights en vedette</h2>
            </div>
            <Link to="/insights">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredInsights.map((insight) => (
              <Link key={insight.id} to={`/insights/${insight.id}`}>
                <Card className="hover:shadow-md transition-all duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {insight.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                      "{insight.citationText.substring(0, 100)}..."
                    </blockquote>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
