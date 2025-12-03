import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, Video, Clock, Edit, Share2, 
  Download, CheckCircle, Sparkles, ExternalLink 
} from 'lucide-react';
import { insights, getSourceById, formatTimestamp } from '@/lib/seed-data';

// Same theme definitions as Teachings page
const themes = [
  { id: 'meditation', label: 'Méditation', tags: ['méditation', 'parole', 'transformation'] },
  { id: 'leadership', label: 'Leadership', tags: ['leadership', 'service', 'influence', 'caractère', 'intégrité'] },
  { id: 'purpose', label: 'Purpose & Destinée', tags: ['purpose', 'destinée', 'potentiel', 'création'] },
  { id: 'kingdom', label: 'Royaume', tags: ['royaume', 'gouvernement', 'spiritualité'] },
  { id: 'vision', label: 'Vision', tags: ['vision', 'provision'] },
];

export default function TeachingDetail() {
  const { id } = useParams<{ id: string }>();
  
  // Find the theme from the teaching ID
  const themeIndex = parseInt(id?.replace('teaching-', '') || '1') - 1;
  const theme = themes[themeIndex] || themes[0];
  
  const themeInsights = insights.filter(insight => 
    insight.tags.some(tag => theme.tags.includes(tag))
  );

  const uniqueSources = [...new Set(themeInsights.map(i => i.sourceId))];

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        {/* Back Button */}
        <Link to="/teachings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour aux enseignements
        </Link>

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-700 mb-1">Publié</Badge>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Enseignement sur {theme.label === 'Purpose & Destinée' ? 'le But et la Destinée' : theme.label}
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Compilation des enseignements de Myles Munroe sur le thème de {theme.label.toLowerCase()}, 
                extraits de {uniqueSources.length} vidéos différentes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
              <Button variant="gold" className="gap-2">
                <Download className="w-4 h-4" />
                Exporter PDF
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{themeInsights.length}</p>
              <p className="text-sm text-muted-foreground">Insights</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{uniqueSources.length}</p>
              <p className="text-sm text-muted-foreground">Sources vidéo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {Math.round(themeInsights.reduce((acc, i) => acc + i.confidence, 0) / themeInsights.length * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Confiance moyenne</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {themeInsights.map((insight, idx) => {
              const source = getSourceById(insight.sourceId);
              return (
                <div 
                  key={insight.id}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                        {idx + 1}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {insight.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      {Math.round(insight.confidence * 100)}%
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2 mb-4">
                    {insight.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex items-start gap-3 text-foreground/80">
                        <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Citation */}
                  <blockquote className="border-l-2 border-accent/30 pl-4 py-2 bg-muted/50 rounded-r-lg">
                    <p className="text-sm italic text-muted-foreground">"{insight.citationText}"</p>
                    {source && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Video className="w-3 h-3" />
                        {source.title} • {formatTimestamp(insight.citationStartTs)}
                      </p>
                    )}
                  </blockquote>

                  {/* Source Link */}
                  {source && (
                    <Link 
                      to={`/insights/${insight.id}`}
                      className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-4"
                    >
                      Voir l'insight complet <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sources Used */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-accent" />
                Sources utilisées
              </h3>
              <div className="space-y-3">
                {uniqueSources.map(sourceId => {
                  const source = getSourceById(sourceId);
                  if (!source) return null;
                  return (
                    <Link 
                      key={sourceId}
                      to={`/sources/${sourceId}`}
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-foreground text-sm line-clamp-1">{source.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(source.durationSeconds / 60)} min
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Tags associés
              </h3>
              <div className="flex flex-wrap gap-2">
                {theme.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Translation Note */}
            <div className="bg-gold/10 rounded-xl border border-gold/20 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Traduction automatique</h4>
                  <p className="text-sm text-muted-foreground">
                    Ce contenu a été automatiquement traduit de l'anglais vers le français. 
                    Cliquez sur "Modifier" pour corriger d'éventuelles erreurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
