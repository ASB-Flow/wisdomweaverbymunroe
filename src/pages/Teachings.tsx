import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, BookOpen, Video, Edit, Eye, 
  ChevronRight, Sparkles, Globe, CheckCircle 
} from 'lucide-react';
import { insights, sources, getSourceById } from '@/lib/seed-data';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Group insights by theme/tags
const themes = [
  { id: 'meditation', label: 'Méditation', tags: ['méditation', 'parole', 'transformation'] },
  { id: 'leadership', label: 'Leadership', tags: ['leadership', 'service', 'influence', 'caractère', 'intégrité'] },
  { id: 'purpose', label: 'Purpose & Destinée', tags: ['purpose', 'destinée', 'potentiel', 'création'] },
  { id: 'kingdom', label: 'Royaume', tags: ['royaume', 'gouvernement', 'spiritualité'] },
  { id: 'vision', label: 'Vision', tags: ['vision', 'provision'] },
];

interface Teaching {
  id: string;
  title: string;
  titleFr: string;
  theme: string;
  insights: typeof insights;
  status: 'draft' | 'review' | 'published';
  content: string;
  contentFr: string;
}

// Generate teachings from insights grouped by theme
const generateTeachings = (): Teaching[] => {
  return themes.map((theme, idx) => {
    const themeInsights = insights.filter(insight => 
      insight.tags.some(tag => theme.tags.includes(tag))
    );
    
    const combinedContent = themeInsights.map(i => 
      `## ${i.title}\n\n${i.bullets.map(b => `- ${b}`).join('\n')}\n\n> "${i.citationText}"`
    ).join('\n\n---\n\n');

    return {
      id: `teaching-${idx + 1}`,
      title: `Teaching on ${theme.label}`,
      titleFr: `Enseignement sur ${theme.label === 'Purpose & Destinée' ? 'le But et la Destinée' : theme.label === 'Kingdom' ? 'le Royaume' : theme.label}`,
      theme: theme.id,
      insights: themeInsights,
      status: idx === 0 ? 'published' : idx === 1 ? 'review' : 'draft',
      content: combinedContent,
      contentFr: combinedContent, // Already in French in seed data
    };
  });
};

export default function Teachings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [teachings] = useState<Teaching[]>(generateTeachings);
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredTeachings = teachings.filter(teaching => {
    const matchesSearch = teaching.titleFr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = !selectedTheme || teaching.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  const handleEdit = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setEditContent(teaching.contentFr);
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    setEditingTeaching(null);
  };

  const getStatusBadge = (status: Teaching['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Publié</Badge>;
      case 'review':
        return <Badge className="bg-gold/20 text-gold-dark">En révision</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Enseignements</h1>
            <p className="text-muted-foreground mt-1">
              Contenus thématiques extraits de plusieurs vidéos
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="gold" className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvel enseignement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un enseignement</DialogTitle>
                <DialogDescription>
                  Sélectionnez un thème pour générer automatiquement un enseignement à partir des insights existants.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Thème</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {themes.map(theme => (
                      <Button 
                        key={theme.id} 
                        variant="outline" 
                        className="justify-start"
                      >
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button variant="gold" className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  Générer l'enseignement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un enseignement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedTheme === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTheme(null)}
            >
              Tous
            </Button>
            {themes.map(theme => (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTheme(theme.id)}
              >
                {theme.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Teachings List */}
        <div className="space-y-4">
          {filteredTeachings.map(teaching => (
            <div 
              key={teaching.id}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {teaching.titleFr}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {teaching.insights.length} insights • {teaching.insights.reduce((acc, i) => acc + new Set([i.sourceId]).size, 0)} sources
                      </p>
                    </div>
                  </div>

                  {/* Sources used */}
                  <div className="flex items-center gap-2 mt-4 mb-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sources :</span>
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set(teaching.insights.map(i => i.sourceId))].slice(0, 3).map(sourceId => {
                        const source = getSourceById(sourceId);
                        return source ? (
                          <Badge key={sourceId} variant="secondary" className="text-xs">
                            {source.title.slice(0, 20)}...
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Preview of content */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {teaching.insights[0]?.bullets[0]}...
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(teaching.status)}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleEdit(teaching)}
                    >
                      <Edit className="w-3 h-3" />
                      Modifier
                    </Button>
                    <Link to={`/teachings/${teaching.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Voir
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeaching} onOpenChange={() => setEditingTeaching(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Modifier l'enseignement
              </DialogTitle>
              <DialogDescription>
                Vérifiez et modifiez le contenu avant publication. Les traductions peuvent être ajustées.
              </DialogDescription>
            </DialogHeader>
            
            {editingTeaching && (
              <div className="space-y-6 mt-4">
                <div>
                  <Label>Titre</Label>
                  <Input 
                    value={editingTeaching.titleFr} 
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Contenu original (EN → FR traduit)
                    </Label>
                    <Textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mt-1 min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Aperçu</Label>
                    <div className="mt-1 p-4 bg-muted/50 rounded-lg min-h-[300px] prose prose-sm max-w-none">
                      {editContent.split('\n').map((line, idx) => (
                        <p key={idx} className={cn(
                          line.startsWith('##') && "font-display font-bold text-lg",
                          line.startsWith('-') && "ml-4",
                          line.startsWith('>') && "border-l-2 border-accent pl-3 italic text-muted-foreground"
                        )}>
                          {line.replace(/^##\s/, '').replace(/^>\s/, '').replace(/^-\s/, '• ')}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-gold/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <p className="text-sm text-foreground">
                    <strong>Traduction automatique :</strong> Le contenu anglais est automatiquement traduit en français. 
                    Vous pouvez modifier le texte ci-dessus pour corriger toute erreur de traduction.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditingTeaching(null)}>
                    Annuler
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Prévisualiser
                  </Button>
                  <Button variant="gold" onClick={handleSave} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer & Publier
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
