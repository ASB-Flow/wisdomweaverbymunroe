import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, BookOpen, Video, Edit, Eye, 
  Sparkles, Globe, CheckCircle, Youtube, Image, Loader2, Download, Heart
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { getSourceById } from '@/lib/seed-data';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTeachingsStore, themes, Teaching } from '@/lib/teachings-store';

export default function Teachings() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { teachings, addTeaching, updateTeaching } = useTeachingsStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCreateTheme, setSelectedCreateTheme] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // New states for YouTube generation
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isGeneratingFromYoutube, setIsGeneratingFromYoutube] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  // Design generation states
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [designPrompt, setDesignPrompt] = useState('');
  const [generatedDesignUrl, setGeneratedDesignUrl] = useState<string | null>(null);

  const filteredTeachings = teachings.filter(teaching => {
    const matchesSearch = teaching.titleFr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = !selectedTheme || teaching.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  const handleEdit = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setEditTitle(teaching.titleFr);
    setEditContent(teaching.contentFr);
    setGeneratedDesignUrl(teaching.generatedDesign || null);
  };

  const handleSave = (publish: boolean = false) => {
    if (!editingTeaching) return;
    updateTeaching(editingTeaching.id, { 
      titleFr: editTitle, 
      contentFr: editContent, 
      status: publish ? 'published' : 'review',
      generatedDesign: generatedDesignUrl || undefined
    });
    setEditingTeaching(null);
    toast({ title: publish ? "Enseignement publié !" : "Modifications enregistrées" });
  };

  const handleCreateTeaching = async () => {
    if (!selectedCreateTheme) return;
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const theme = themes.find(t => t.id === selectedCreateTheme)!;
    const newTeaching: Teaching = { 
      id: `teaching-${teachings.length + 1}`, 
      titleFr: `Enseignement sur ${theme.label}`, 
      theme: theme.id, 
      insights: [], 
      status: 'draft', 
      contentFr: '' 
    };
    addTeaching(newTeaching);
    setIsCreating(false);
    setShowCreateDialog(false);
    setSelectedCreateTheme(null);
    toast({ title: "Enseignement créé !" });
  };

  const handleGenerateFromYoutube = async () => {
    if (!youtubeUrl) {
      toast({ title: "Erreur", description: "Veuillez entrer une URL YouTube", variant: "destructive" });
      return;
    }

    setIsGeneratingFromYoutube(true);
    setGeneratedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-teaching', {
        body: { 
          type: 'generate-content',
          youtubeUrl,
          theme: selectedCreateTheme 
        }
      });

      if (error) throw error;

      if (data.success && data.teaching) {
        setGeneratedContent(data);
        toast({ title: "Contenu généré avec succès !" });
      } else {
        throw new Error(data.error || "Erreur lors de la génération");
      }
    } catch (error: any) {
      console.error('Error generating from YouTube:', error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de générer le contenu", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingFromYoutube(false);
    }
  };

  const handleSaveGeneratedContent = () => {
    if (!generatedContent?.teaching) return;

    const teaching = generatedContent.teaching;
    const newTeaching: Teaching = {
      id: `teaching-${teachings.length + 1}`,
      titleFr: teaching.title || `Enseignement - ${generatedContent.videoTitle}`,
      theme: selectedCreateTheme || 'leadership',
      insights: [],
      status: 'draft',
      contentFr: formatGeneratedContent(teaching),
      youtubeUrl,
      socialPosts: teaching.socialPosts,
    };

    addTeaching(newTeaching);
    setShowCreateDialog(false);
    setYoutubeUrl('');
    setGeneratedContent(null);
    setSelectedCreateTheme(null);
    toast({ title: "Enseignement enregistré !" });
  };

  const formatGeneratedContent = (teaching: any): string => {
    let content = '';
    
    if (teaching.summary) {
      content += `## Résumé\n\n${teaching.summary}\n\n`;
    }
    
    if (teaching.keyPoints?.length) {
      content += `## Points clés\n\n${teaching.keyPoints.map((p: string) => `- ${p}`).join('\n')}\n\n`;
    }
    
    if (teaching.citations?.length) {
      content += `## Citations\n\n${teaching.citations.map((c: string) => `> "${c}"`).join('\n\n')}\n\n`;
    }

    if (teaching.raw) {
      content = teaching.raw;
    }

    return content;
  };

  const handleGenerateDesign = async () => {
    if (!editingTeaching) return;

    setIsGeneratingDesign(true);
    setGeneratedDesignUrl(null);

    try {
      const citation = editingTeaching.contentFr.match(/> "([^"]+)"/)?.[1] || editingTeaching.titleFr;
      
      const { data, error } = await supabase.functions.invoke('generate-teaching', {
        body: { 
          type: 'generate-design',
          content: citation,
          designPrompt: designPrompt || `Create an elegant quote card for social media with this quote from Myles Munroe: "${citation}". 
Style: Deep navy blue background with golden accents, subtle light rays, modern and spiritual aesthetic. 
Include the name "Dr. Myles Munroe" at the bottom. 
Square format (1:1) for Instagram.`
        }
      });

      if (error) throw error;

      if (data.success && data.imageUrl) {
        setGeneratedDesignUrl(data.imageUrl);
        toast({ title: "Design généré avec succès !" });
      } else {
        throw new Error(data.error || "Erreur lors de la génération du design");
      }
    } catch (error: any) {
      console.error('Error generating design:', error);
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de générer le design", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingDesign(false);
    }
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
          {isAdmin && (
            <Button variant="gold" className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />Nouvel enseignement
            </Button>
          )}
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
                      {isAdmin && <p className="text-sm text-muted-foreground">{teaching.insights.length} extraits</p>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-4 mb-3">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sources :</span>
                      {[...new Set(teaching.insights.map(i => i.sourceId))].slice(0, 3).map(sourceId => {
                        const source = getSourceById(sourceId);
                        return source ? <Badge key={sourceId} variant="secondary" className="text-xs">{source.title.slice(0, 20)}...</Badge> : null;
                      })}
                      {teaching.youtubeUrl && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Youtube className="w-3 h-3" /> YouTube
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(teaching.status)}
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleFavorite(teaching.id)}
                      className="h-8 w-8"
                    >
                      <Heart 
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isFavorite(teaching.id) 
                            ? "fill-destructive text-destructive" 
                            : "text-muted-foreground hover:text-foreground"
                        )} 
                      />
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEdit(teaching)}>
                        <Edit className="w-3 h-3" />Modifier
                      </Button>
                    )}
                    <Link to={`/teachings/${teaching.id}`}><Button variant="outline" size="sm" className="gap-1"><Eye className="w-3 h-3" />Voir</Button></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Dialog with YouTube Generation */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un enseignement</DialogTitle>
              <DialogDescription>Générez du contenu à partir d'une vidéo YouTube ou sélectionnez un thème</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="youtube" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube" className="gap-2">
                  <Youtube className="w-4 h-4" /> Depuis YouTube
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-2">
                  <BookOpen className="w-4 h-4" /> Par thème
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="space-y-4 mt-4">
                <div>
                  <Label>URL de la vidéo YouTube</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Thème (optionnel)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {themes.map(theme => (
                      <Button 
                        key={theme.id} 
                        variant={selectedCreateTheme === theme.id ? "default" : "outline"} 
                        size="sm"
                        className="justify-start" 
                        onClick={() => setSelectedCreateTheme(theme.id)}
                      >
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="gold" 
                  className="w-full gap-2" 
                  onClick={handleGenerateFromYoutube}
                  disabled={isGeneratingFromYoutube || !youtubeUrl}
                >
                  {isGeneratingFromYoutube ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Générer avec l'IA
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Contenu généré !</span>
                    </div>
                    
                    {generatedContent.teaching.title && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Titre</Label>
                        <p className="font-display font-semibold">{generatedContent.teaching.title}</p>
                      </div>
                    )}

                    {generatedContent.teaching.summary && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Résumé</Label>
                        <p className="text-sm">{generatedContent.teaching.summary}</p>
                      </div>
                    )}

                    {generatedContent.teaching.keyPoints?.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Points clés</Label>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {generatedContent.teaching.keyPoints.map((point: string, idx: number) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {generatedContent.teaching.socialPosts && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Posts réseaux sociaux</Label>
                        <div className="space-y-2 mt-1">
                          {generatedContent.teaching.socialPosts.twitter && (
                            <div className="p-2 bg-background rounded text-xs">
                              <span className="font-medium">Twitter/X:</span> {generatedContent.teaching.socialPosts.twitter}
                            </div>
                          )}
                          {generatedContent.teaching.socialPosts.instagram && (
                            <div className="p-2 bg-background rounded text-xs">
                              <span className="font-medium">Instagram:</span> {generatedContent.teaching.socialPosts.instagram}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button variant="gold" className="w-full gap-2" onClick={handleSaveGeneratedContent}>
                      <CheckCircle className="w-4 h-4" />
                      Enregistrer cet enseignement
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="theme" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {themes.map(theme => (
                    <Button 
                      key={theme.id} 
                      variant={selectedCreateTheme === theme.id ? "default" : "outline"} 
                      className="h-auto py-4 flex-col items-start" 
                      onClick={() => setSelectedCreateTheme(theme.id)}
                    >
                      <span className="font-medium">{theme.label}</span>
                      <span className="text-xs text-muted-foreground font-normal">{theme.tags.join(', ')}</span>
                    </Button>
                  ))}
                </div>
                <Button variant="gold" className="w-full gap-2" onClick={handleCreateTeaching} disabled={!selectedCreateTheme || isCreating}>
                  {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" />Création...</> : <><Sparkles className="w-4 h-4" />Créer l'enseignement</>}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeaching} onOpenChange={(open) => !open && setEditingTeaching(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'enseignement</DialogTitle>
              <DialogDescription>Vérifiez et modifiez le contenu avant publication</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="content" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content" className="gap-2">
                  <Globe className="w-4 h-4" /> Contenu
                </TabsTrigger>
                <TabsTrigger value="design" className="gap-2">
                  <Image className="w-4 h-4" /> Designs IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div>
                  <Label>Titre</Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contenu (FR)</Label>
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mt-1 min-h-[300px] font-mono text-sm" />
                  </div>
                  <div>
                    <Label>Aperçu</Label>
                    <div className="mt-1 p-4 bg-muted/50 rounded-lg min-h-[300px] prose prose-sm max-w-none overflow-y-auto">
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
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTeaching(null)}>Annuler</Button>
                  <Button variant="outline" onClick={() => handleSave(false)}>Enregistrer</Button>
                  <Button variant="gold" onClick={() => handleSave(true)}>Publier</Button>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-4 mt-4">
                <div>
                  <Label>Prompt de design (optionnel)</Label>
                  <Textarea 
                    value={designPrompt} 
                    onChange={(e) => setDesignPrompt(e.target.value)} 
                    placeholder="Décrivez le style de design souhaité..."
                    className="mt-1"
                  />
                </div>

                <Button 
                  variant="gold" 
                  className="w-full gap-2" 
                  onClick={handleGenerateDesign}
                  disabled={isGeneratingDesign}
                >
                  {isGeneratingDesign ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération du design...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      Générer un design
                    </>
                  )}
                </Button>

                {generatedDesignUrl && (
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Design généré !</span>
                    </div>
                    <img 
                      src={generatedDesignUrl} 
                      alt="Generated design" 
                      className="w-full rounded-lg"
                    />
                    <a 
                      href={generatedDesignUrl} 
                      download="teaching-design.png"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </a>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
