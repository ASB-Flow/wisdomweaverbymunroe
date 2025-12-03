import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { SourceCard } from '@/components/sources/SourceCard';
import { sources } from '@/lib/seed-data';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link2, Youtube, FileAudio, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Sources() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowAddModal(false);
    setUrl('');
    
    toast({
      title: "Source imported!",
      description: "Your video is being processed. Transcription will begin shortly.",
    });
  };

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
          {sources.map((source, index) => (
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
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Import New Source</DialogTitle>
            <DialogDescription>
              Paste a YouTube URL to import a video. The system will automatically transcribe and extract insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">What happens next:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Video metadata extracted</li>
                <li>2. Audio transcribed (via Whisper)</li>
                <li>3. Insights automatically identified</li>
                <li>4. Post templates generated</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleImport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Import & Process'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
