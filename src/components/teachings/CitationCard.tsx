import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Download, Image, Loader2, Copy, Check, Palette, Pencil, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Citation {
  text: string;
  context?: string;
}

interface CitationCardProps {
  citation: Citation | string;
  isAdmin: boolean;
  index: number;
}

type ThemeOption = 'dark' | 'light' | 'gradient';
type AccentColor = 'gold' | 'blue' | 'purple' | 'green' | 'rose';

const themeLabels: Record<ThemeOption, string> = {
  dark: 'Sombre',
  light: 'Clair',
  gradient: 'Dégradé',
};

const accentLabels: Record<AccentColor, string> = {
  gold: 'Or',
  blue: 'Bleu',
  purple: 'Violet',
  green: 'Vert',
  rose: 'Rose',
};

const accentColors: Record<AccentColor, string> = {
  gold: 'bg-amber-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

export function CitationCard({ citation, isAdmin, index }: CitationCardProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('gold');
  const [isEditing, setIsEditing] = useState(false);

  const originalCitationText = typeof citation === 'string' ? citation : citation.text;
  const citationContext = typeof citation !== 'string' ? citation.context : undefined;
  
  const [editedText, setEditedText] = useState(originalCitationText);
  const citationText = editedText;

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour générer une image.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-teaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'generate-quote-image',
          citation: citationText,
          context: citationContext,
          theme,
          accentColor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast({
          title: "Image générée !",
          description: "Cliquez sur 'Télécharger' pour sauvegarder l'image.",
        });
      }
    } catch (error) {
      console.error('Error generating quote image:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer l'image.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `citation-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement lancé",
      description: "L'image est en cours de téléchargement.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Citation copiée !",
      description: "La citation a été copiée dans le presse-papiers.",
    });
  };

  const handleResetText = () => {
    setEditedText(originalCitationText);
    setIsEditing(false);
  };

  const hasChanges = editedText !== originalCitationText;

  return (
    <div className="border-l-4 border-gold pl-4 py-4 bg-gold/5 rounded-r-lg">
      <blockquote className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[100px] text-foreground font-medium italic"
              placeholder="Texte de la citation..."
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="gap-1"
              >
                <Check className="w-3 h-3" />
                Valider
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetText}
                className="gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <p className="text-foreground font-medium italic text-base leading-relaxed">
              "{citationText}"
              {hasChanges && (
                <Badge variant="outline" className="ml-2 text-xs align-middle">modifié</Badge>
              )}
            </p>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
        
        {/* Explanation / Context - clearly separated */}
        {citationContext && (
          <div className="pt-2 border-t border-gold/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground/70">💡 Explication :</span>{' '}
              {citationContext}
            </p>
          </div>
        )}
      </blockquote>

      {isAdmin && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Select value={theme} onValueChange={(v) => setTheme(v as ThemeOption)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(themeLabels) as ThemeOption[]).map((t) => (
                    <SelectItem key={t} value={t}>{themeLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={accentColor} onValueChange={(v) => setAccentColor(v as AccentColor)}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${accentColors[accentColor]}`} />
                    <span>{accentLabels[accentColor]}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(accentLabels) as AccentColor[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${accentColors[c]}`} />
                        <span>{accentLabels[c]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié' : 'Copier'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  Générer image
                </>
              )}
            </Button>

            {generatedImageUrl && (
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
            )}
          </div>

          {generatedImageUrl && (
            <div className="mt-3">
              <Badge variant="secondary" className="mb-2 text-xs">Aperçu de l'image</Badge>
              <img 
                src={generatedImageUrl} 
                alt={`Citation ${index + 1}`}
                className="w-full max-w-md rounded-lg shadow-md border border-border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
