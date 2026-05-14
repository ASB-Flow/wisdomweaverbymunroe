import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, ArrowRight, Quote, Eye } from 'lucide-react';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import heroImg from '@/assets/hero-leadership.jpg';
import meditationImg from '@/assets/theme-meditation.jpg';
import purposeImg from '@/assets/theme-purpose.jpg';
import kingdomImg from '@/assets/theme-kingdom.jpg';
import visionImg from '@/assets/theme-vision.jpg';
import leadershipImg from '@/assets/theme-leadership.jpg';

const themeImages: Record<string, string> = {
  meditation: meditationImg,
  leadership: leadershipImg,
  purpose: purposeImg,
  kingdom: kingdomImg,
  vision: visionImg,
};

const getThemeLabel = (themeId: string) =>
  themes.find(t => t.id === themeId)?.label || themeId;

export default function UserHome() {
  const { teachings } = useTeachings();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const publishedTeachings = teachings.filter(t => t.status === 'published');
  const latestTeachings = publishedTeachings.slice(0, 4);
  const favoriteTeachings = publishedTeachings.filter(t => favorites.includes(t.id));

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

  // Group teachings by theme for the "Explore" section
  const themesWithTeachings = themes
    .map(theme => ({
      ...theme,
      count: publishedTeachings.filter(t => t.theme === theme.id).length,
      image: themeImages[theme.id],
    }))
    .filter(t => t.count > 0);

  return (
    <MainLayout>
      <Header 
        title="Bienvenue" 
        subtitle="Découvrez les enseignements et citations thématiques"
      />

      <div className="p-4 md:p-6 space-y-10">
        {/* Hero Banner */}
        <section className="relative rounded-2xl overflow-hidden">
          <AspectRatio ratio={21 / 9}>
            <img src={heroImg} alt="Leadership et enseignement" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-10">
              <div className="max-w-lg space-y-3">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight">
                  Transformez votre vie par la sagesse
                </h2>
                <p className="text-primary-foreground/80 text-sm md:text-base">
                  Explorez les enseignements profonds sur le leadership, la destinée et le royaume.
                </p>
                <Link to="/teachings">
                  <Button className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                    Explorer les enseignements <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </AspectRatio>
        </section>

        {/* Explore by Theme */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
              Explorer par thème
            </h2>
            <Link to="/teachings">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {themesWithTeachings.map((theme) => (
              <Link key={theme.id} to={`/teachings?theme=${theme.id}`}>
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <AspectRatio ratio={1}>
                      <img
                        src={theme.image}
                        alt={theme.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-display text-sm md:text-base font-semibold text-primary-foreground">
                          {theme.label}
                        </h3>
                        <p className="text-primary-foreground/70 text-xs">
                          {theme.count} enseignement{theme.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </AspectRatio>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Favorites */}
        {favoriteTeachings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                <h2 className="font-display text-xl font-semibold text-foreground">Mes favoris</h2>
              </div>
              <Link to="/teachings">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoriteTeachings.slice(0, 3).map((teaching) => (
                <Link key={teaching.id} to={`/teachings/${teaching.id}`}>
                  <Card className="hover:shadow-md transition-all duration-300 h-full group overflow-hidden">
                    {themeImages[teaching.theme] && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={themeImages[teaching.theme]}
                          alt={getThemeLabel(teaching.theme)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {getThemeLabel(teaching.theme)}
                      </Badge>
                      <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {teaching.titleFr}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
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
              <h2 className="font-display text-xl font-semibold text-foreground">Enseignements récents</h2>
            </div>
            <Link to="/teachings">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestTeachings.map((teaching) => (
              <Card key={teaching.id} className="hover:shadow-md transition-all duration-300 h-full group overflow-hidden">
                {themeImages[teaching.theme] && (
                  <div className="h-28 overflow-hidden">
                    <img
                      src={themeImages[teaching.theme]}
                      alt={getThemeLabel(teaching.theme)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getThemeLabel(teaching.theme)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -mt-1"
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
                  <Link to={`/teachings/${teaching.id}`}>
                    <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                      {teaching.titleFr}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {teaching.contentFr.substring(0, 80)}...
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
                      <Eye className="w-3.5 h-3.5" /> Lire
                    </span>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Citations */}
        {featuredCitations.length > 0 && (
          <section className="rounded-2xl bg-primary p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-semibold text-primary-foreground">Citations en vedette</h2>
              </div>
              <Link to="/citations">
                <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredCitations.map((citation, idx) => (
                <Link key={idx} to={`/teachings/${citation.teachingId}`}>
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 hover:bg-primary-foreground/15 transition-colors h-full border border-primary-foreground/10">
                    <Badge className="mb-3 bg-accent/20 text-accent border-0 text-xs">
                      {getThemeLabel(citation.theme)}
                    </Badge>
                    <blockquote className="text-primary-foreground/90 text-sm italic leading-relaxed mb-3">
                      "{citation.text?.substring(0, 140)}..."
                    </blockquote>
                    <p className="text-primary-foreground/50 text-xs">— {citation.teachingTitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
