import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { SourceCard } from '@/components/sources/SourceCard';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link2, Youtube, FileAudio, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Source {
  id: string;
  title: string;
  url: string;
  speaker: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  platform: string;
  youtube_id: string | null;
  published_at: string | null;
}

export default function Sources() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();
  const { isAdmin, session } = useAuth();

  // Fetch sources from database
  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setSources(data);
    }
  };

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer une URL YouTube valide",
        variant: "destructive"
      });
      return;
    }

    setIsFetching(true);
    setPreviewData(null);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-metadata', {
        body: { url, saveToDb: false }
      });

      if (error) throw error;
      
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive"
        });
      } else {
        setPreviewData(data.metadata);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les métadonnées",
        variant: "destructive"
      });
    }

    setIsFetching(false);
  };

  const handleImport = async () => {
    if (!previewData) {
      await handleFetchMetadata();
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-metadata', {
        body: { url, saveToDb: true }
      });

      if (error) throw error;
      
      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error === 'This video has already been imported' 
            ? 'Cette vidéo a déjà été importée'
            : data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Source importée !",
          description: "La vidéo a été ajoutée. La transcription commencera bientôt.",
        });
        setShowAddModal(false);
        setUrl('');
        setPreviewData(null);
        fetchSources();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'importer la source",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const allSources = sources.map(s => ({
    id: s.id,
    title: s.title,
    url: s.url,
    speaker: s.speaker || 'Inconnu',
    publishedAt: s.published_at ? new Date(s.published_at) : new Date(),
    durationSeconds: s.duration_seconds || 0,
    thumbnailUrl: s.thumbnail_url || `https://img.youtube.com/vi/${s.youtube_id}/maxresdefault.jpg`,
    platform: (s.platform || 'youtube') as 'youtube' | 'audio' | 'doc',
  }));

  return (
    <MainLayout>
      <Header 
        title="Sources" 
        subtitle="Manage your video and audio sources"
        showAddButton
        addButtonLabel="Import Source"
        onAddClick={() => setShowAddModal(true)}
      />
      
      <div className="p-8">
        {/* Source Type Filters */}
        <div className="flex gap-2 mb-6">
          <Button variant="secondary" size="sm" className="gap-2">
            <Youtube className="w-4 h-4" />
            YouTube ({sources.filter(s => s.platform === 'youtube').length})
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileAudio className="w-4 h-4" />
            Audio (0)
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Documents (0)
          </Button>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {allSources.map((source, index) => (
            <div 
              key={source.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SourceCard source={source} />
            </div>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setUrl('');
          setPreviewData(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Importer une source</DialogTitle>
            <DialogDescription>
              Collez une URL YouTube pour importer une vidéo. Le système extraira automatiquement les métadonnées.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setPreviewData(null);
                }}
                className="input-field pl-11"
              />
            </div>

            {!previewData && (
              <Button 
                variant="outline" 
                onClick={handleFetchMetadata} 
                disabled={isFetching || !url.trim()}
                className="w-full gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Récupération...
                  </>
                ) : (
                  'Prévisualiser les métadonnées'
                )}
              </Button>
            )}

            {previewData && (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <img 
                    src={previewData.thumbnail_url} 
                    alt={previewData.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{previewData.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{previewData.speaker}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Métadonnées récupérées avec succès</span>
                </div>
              </div>
            )}
            
            {!previewData && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Prochaines étapes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Métadonnées de la vidéo extraites</li>
                  <li>2. Audio transcrit (via Whisper)</li>
                  <li>3. Insights automatiquement identifiés</li>
                  <li>4. Templates de posts générés</li>
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button 
                variant="gold" 
                onClick={handleImport} 
                disabled={isLoading || (!previewData && !url.trim()) || !isAdmin}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importation...
                  </>
                ) : previewData ? (
                  'Importer cette vidéo'
                ) : (
                  'Importer'
                )}
              </Button>
            </div>
            {!isAdmin && (
              <p className="text-xs text-destructive text-center">
                Seuls les administrateurs peuvent importer des sources.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
