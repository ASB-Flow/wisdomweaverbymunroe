import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, ArrowRight, Sparkles, Quote } from 'lucide-react';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

export default function UserHome() {
  const { teachings } = useTeachings();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Only published teachings for regular users
  const publishedTeachings = teachings.filter(t => t.status === 'published');

  const latestTeachings = publishedTeachings.slice(0, 4);
  const favoriteTeachings = publishedTeachings.filter(t => favorites.includes(t.id));

  // Extract featured citations from teachings
  const featuredCitations = teachings
    .flatMap(t => {
      const citations = t.citations || [];
      return citations.map(c => ({
        text: typeof c === 'string' ? c : (c as any).text,
        teachingId: t.id,
        teachingTitle: t.titleFr,
        theme: t.theme,
      }));
    })
    .slice(0, 3);

  const getThemeLabel = (themeId: string) =>
    themes.find(t => t.id === themeId)?.label || themeId;

  return (
    <MainLayout>
      <Header 
        title="Bienvenue" 
        subtitle="Découvrez les enseignements et citations de Myles Munroe"
      />

      <div className="p-4 md:p-6 space-y-8">
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

        {/* Featured Citations */}
        {featuredCitations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-foreground">Citations en vedette</h2>
              </div>
              <Link to="/citations">
                <Button variant="ghost" size="sm">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredCitations.map((citation, idx) => (
                <Link key={idx} to={`/teachings/${citation.teachingId}`}>
                  <Card className="hover:shadow-md transition-all duration-300 h-full">
                    <CardHeader className="pb-2">
                      <Badge variant="secondary" className="w-fit mb-2 text-xs">
                        {getThemeLabel(citation.theme)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{citation.teachingTitle}</p>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                        "{citation.text?.substring(0, 120)}..."
                      </blockquote>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
