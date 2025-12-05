import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Video, Calendar, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-95" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920')] bg-cover bg-center mix-blend-overlay opacity-20" />
        
        <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <span className="font-display text-xl font-bold text-cream">Teachings Hub</span>
          </div>
          <Link to="/auth">
            <Button variant="gold" size="lg" className="gap-2">
              Rejoindre <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-6 leading-tight">
            Transformez les enseignements<br />
            <span className="text-gold">en contenu impactant</span>
          </h1>
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-10">
            Extrayez les idées clés des enseignements de Myles Munroe, créez des clips et posts optimisés, 
            et partagez la sagesse avec le monde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="gold" size="lg" className="gap-2 text-lg px-8 py-6">
                Commencer gratuitement <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 border-cream/30 text-cream hover:bg-cream/10">
                Explorer les enseignements
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            Une plateforme complète
          </h2>
          <p className="text-navy/70 text-center max-w-xl mx-auto mb-16">
            Tout ce dont vous avez besoin pour transformer des heures d'enseignements en contenu viral.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Video className="w-6 h-6" />}
              title="Import automatique"
              description="Importez des vidéos YouTube et obtenez automatiquement la transcription."
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Extraction IA"
              description="L'IA extrait les idées clés avec citations et timestamps."
            />
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6" />}
              title="Enseignements thématiques"
              description="Regroupez les insights par thème pour créer des enseignements complets."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Publication planifiée"
              description="Planifiez et publiez sur YouTube, Instagram, Twitter et Facebook."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-6">
            Prêt à commencer?
          </h2>
          <p className="text-cream/80 max-w-xl mx-auto mb-10">
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
      <footer className="py-8 bg-navy-light border-t border-navy">
        <div className="container mx-auto px-6 text-center text-cream/60 text-sm">
          © 2024 Teachings Hub. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-navy/70 text-sm">{description}</p>
    </div>
  );
}
