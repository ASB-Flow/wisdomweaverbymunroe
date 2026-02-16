import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Video, Calendar, ArrowRight, Quote, Users, Star } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import heroImg from '@/assets/landing-hero.jpg';
import studyImg from '@/assets/landing-feature-study.jpg';
import createImg from '@/assets/landing-feature-create.jpg';
import meditationImg from '@/assets/theme-meditation.jpg';
import leadershipImg from '@/assets/theme-leadership.jpg';
import purposeImg from '@/assets/theme-purpose.jpg';
import kingdomImg from '@/assets/theme-kingdom.jpg';
import visionImg from '@/assets/theme-vision.jpg';

const themeShowcase = [
  { label: 'Leadership', image: leadershipImg },
  { label: 'Destinée & Purpose', image: purposeImg },
  { label: 'Le Royaume', image: kingdomImg },
  { label: 'Vision', image: visionImg },
  { label: 'Méditation', image: meditationImg },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <img src={heroImg} alt="Enseignement et leadership" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-primary-foreground">Teachings Hub</span>
          </div>
          <Link to="/auth">
            <Button variant="gold" size="lg" className="gap-2">
              Rejoindre <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-36">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Transformez les enseignements<br />
              <span className="text-accent">en contenu impactant</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mb-10">
              Extrayez les idées clés des enseignements de Myles Munroe, créez des clips et posts optimisés, 
              et partagez la sagesse avec le monde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button variant="gold" size="lg" className="gap-2 text-lg px-8 py-6">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Explorer les enseignements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Themes Showcase */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Des thèmes qui transforment
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Explorez les enseignements à travers des thématiques essentielles pour votre croissance personnelle.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themeShowcase.map((theme) => (
              <Link key={theme.label} to="/auth" className="group">
                <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <AspectRatio ratio={3 / 4}>
                    <img
                      src={theme.image}
                      alt={theme.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-sm md:text-base font-semibold text-primary-foreground">
                        {theme.label}
                      </h3>
                    </div>
                  </AspectRatio>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with images */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Une plateforme complète
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
            Tout ce dont vous avez besoin pour transformer des heures d'enseignements en contenu viral.
          </p>

          {/* Feature row 1 */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={studyImg} alt="Étude et extraction" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <div className="space-y-6">
              <FeatureItem 
                icon={<Video className="w-5 h-5" />}
                title="Import automatique"
                description="Importez des vidéos YouTube et obtenez automatiquement la transcription complète."
              />
              <FeatureItem 
                icon={<Sparkles className="w-5 h-5" />}
                title="Extraction IA"
                description="L'intelligence artificielle extrait les idées clés avec citations et timestamps précis."
              />
            </div>
          </div>

          {/* Feature row 2 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 md:order-1 order-2">
              <FeatureItem 
                icon={<BookOpen className="w-5 h-5" />}
                title="Enseignements thématiques"
                description="Regroupez les insights par thème pour créer des enseignements complets et structurés."
              />
              <FeatureItem 
                icon={<Calendar className="w-5 h-5" />}
                title="Publication planifiée"
                description="Planifiez et publiez sur YouTube, Instagram, Twitter et Facebook en quelques clics."
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg md:order-2 order-1">
              <img src={createImg} alt="Création de contenu" className="w-full h-64 md:h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Citation Highlight */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <Quote className="w-10 h-10 text-accent mx-auto mb-6" />
          <blockquote className="font-display text-2xl md:text-3xl text-primary-foreground/90 italic max-w-3xl mx-auto leading-relaxed mb-4">
            "The greatest tragedy in life is not death, but a life without a purpose."
          </blockquote>
          <p className="text-accent font-medium">— Myles Munroe</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatBlock icon={<BookOpen className="w-6 h-6" />} value="50+" label="Enseignements" />
            <StatBlock icon={<Quote className="w-6 h-6" />} value="200+" label="Citations" />
            <StatBlock icon={<Users className="w-6 h-6" />} value="500+" label="Utilisateurs" />
            <StatBlock icon={<Star className="w-6 h-6" />} value="5" label="Thèmes" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Prêt à commencer?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10">
            Rejoignez des centaines de créateurs qui transforment les enseignements en contenu impactant.
          </p>
          <Link to="/auth">
            <Button variant="gold" size="lg" className="gap-2 text-lg px-10 py-6">
              Rejoindre maintenant <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 text-center text-primary-foreground/60 text-sm">
          © 2025 Teachings Hub. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function StatBlock({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div className="font-display text-3xl font-bold text-foreground">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
