import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, BookOpen, Video, Edit, Eye, 
  Sparkles, Globe, CheckCircle
} from 'lucide-react';
import { insights, getSourceById } from '@/lib/seed-data';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { id: 'meditation', label: 'Méditation', tags: ['méditation', 'parole', 'transformation'] },
  { id: 'leadership', label: 'Leadership', tags: ['leadership', 'service', 'influence', 'caractère', 'intégrité'] },
  { id: 'purpose', label: 'Purpose & Destinée', tags: ['purpose', 'destinée', 'potentiel', 'création'] },
  { id: 'kingdom', label: 'Royaume', tags: ['royaume', 'gouvernement', 'spiritualité'] },
  { id: 'vision', label: 'Vision', tags: ['vision', 'provision'] },
];

interface Teaching {
  id: string;
  titleFr: string;
  theme: string;
  insights: typeof insights;
  status: 'draft' | 'review' | 'published';
  contentFr: string;
}

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
      titleFr: `Enseignement sur ${theme.label}`,
      theme: theme.id,
      insights: themeInsights,
      status: idx === 0 ? 'published' : idx === 1 ? 'review' : 'draft',
      contentFr: combinedContent,
    };
  });
};

export default function Teachings() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [teachings, setTeachings] = useState<Teaching[]>(generateTeachings);
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCreateTheme, setSelectedCreateTheme] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTeachings = teachings.filter(teaching => {
    const matchesSearch = teaching.titleFr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = !selectedTheme || teaching.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  const handleEdit = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setEditTitle(teaching.titleFr);
    setEditContent(teaching.contentFr);
  };

  const handleSave = (publish: boolean = false) => {
    if (!editingTeaching) return;
    setTeachings(prev => prev.map(t => 
      t.id === editingTeaching.id ? { ...t, titleFr: editTitle, contentFr: editContent, status: publish ? 'published' : 'review' } : t
    ));
    setEditingTeaching(null);
    toast({ title: publish ? "Enseignement publié !" : "Modifications enregistrées" });
  };

  const handleCreateTeaching = async () => {
    if (!selectedCreateTheme) return;
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const theme = themes.find(t => t.id === selectedCreateTheme)!;
    const themeInsights = insights.filter(insight => insight.tags.some(tag => theme.tags.includes(tag)));
    const combinedContent = themeInsights.map(i => `## ${i.title}\n\n${i.bullets.map(b => `- ${b}`).join('\n')}\n\n> "${i.citationText}"`).join('\n\n---\n\n');
    const newTeaching: Teaching = { id: `teaching-${teachings.length + 1}`, titleFr: `Enseignement sur ${theme.label}`, theme: theme.id, insights: themeInsights, status: 'draft', contentFr: combinedContent };
    setTeachings(prev => [...prev, newTeaching]);
    setIsCreating(false);
    setShowCreateDialog(false);
    setSelectedCreateTheme(null);
    toast({ title: "Enseignement créé !" });
  };

  const getStatusBadge = (status: Teaching['status']) => {
    if (status === 'published') return <Badge className="bg-green-100 text-green-700">Publié</Badge>;
    if (status === 'review') return <Badge className="bg-gold/20 text-gold-dark">En révision</Badge>;
    return <Badge variant="secondary">Brouillon</Badge>;
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Enseignements</h1>
            <p className="text-muted-foreground mt-1">Contenus thématiques extraits de plusieurs vidéos</p>
          </div>
          <Button variant="gold" className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />Nouvel enseignement
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={selectedTheme === null ? "default" : "outline"} size="sm" onClick={() => setSelectedTheme(null)}>Tous</Button>
            {themes.map(theme => (
              <Button key={theme.id} variant={selectedTheme === theme.id ? "default" : "outline"} size="sm" onClick={() => setSelectedTheme(theme.id)}>{theme.label}</Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTeachings.map(teaching => (
            <div key={teaching.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-accent" /></div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{teaching.titleFr}</h3>
                      <p className="text-sm text-muted-foreground">{teaching.insights.length} insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 mb-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sources :</span>
                    {[...new Set(teaching.insights.map(i => i.sourceId))].slice(0, 3).map(sourceId => {
                      const source = getSourceById(sourceId);
                      return source ? <Badge key={sourceId} variant="secondary" className="text-xs">{source.title.slice(0, 20)}...</Badge> : null;
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(teaching.status)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEdit(teaching)}><Edit className="w-3 h-3" />Modifier</Button>
                    <Link to={`/teachings/${teaching.id}`}><Button variant="outline" size="sm" className="gap-1"><Eye className="w-3 h-3" />Voir</Button></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un enseignement</DialogTitle><DialogDescription>Sélectionnez un thème pour générer automatiquement un enseignement.</DialogDescription></DialogHeader>
            <div className="space-y-4 mt-4">
              <Label>Thème</Label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map(theme => (<Button key={theme.id} variant={selectedCreateTheme === theme.id ? "default" : "outline"} className="justify-start" onClick={() => setSelectedCreateTheme(theme.id)}>{theme.label}</Button>))}
              </div>
              <Button variant="gold" className="w-full gap-2" onClick={handleCreateTeaching} disabled={isCreating || !selectedCreateTheme}>{isCreating ? 'Génération...' : <><Sparkles className="w-4 h-4" />Générer</>}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTeaching} onOpenChange={() => setEditingTeaching(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5" />Modifier l'enseignement</DialogTitle></DialogHeader>
            {editingTeaching && (
              <div className="space-y-6 mt-4">
                <div><Label>Titre</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1" /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label className="flex items-center gap-2"><Globe className="w-4 h-4" />Contenu (FR)</Label><Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mt-1 min-h-[300px] font-mono text-sm" /></div>
                  <div><Label>Aperçu</Label><div className="mt-1 p-4 bg-muted/50 rounded-lg min-h-[300px] prose prose-sm max-w-none overflow-y-auto">{editContent.split('\n').map((line, idx) => (<p key={idx} className={cn(line.startsWith('##') && "font-display font-bold text-lg", line.startsWith('-') && "ml-4", line.startsWith('>') && "border-l-2 border-accent pl-3 italic text-muted-foreground")}>{line.replace(/^##\s/, '').replace(/^>\s/, '').replace(/^-\s/, '• ')}</p>))}</div></div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditingTeaching(null)}>Annuler</Button>
                  <Button variant="outline" onClick={() => handleSave(false)} className="gap-2"><CheckCircle className="w-4 h-4" />Enregistrer</Button>
                  <Button variant="gold" onClick={() => handleSave(true)} className="gap-2"><CheckCircle className="w-4 h-4" />Publier</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
