import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, BookOpen, Video, Clock, Edit, Share2, 
  Download, CheckCircle, Sparkles, ExternalLink, Copy, Globe, Youtube, Image, Loader2, Trash2, Lightbulb,
  Eye, Target, Gem, ListChecks, Quote, FileEdit
} from 'lucide-react';
import { CommentSection } from '@/components/comments/CommentSection';
import { VisualConceptCard } from '@/components/teachings/VisualConceptCard';
import { PracticalTipCard } from '@/components/teachings/PracticalTipCard';
import { PrincipleCard } from '@/components/teachings/PrincipleCard';
import { ApplicationSteps } from '@/components/teachings/ApplicationSteps';
import { CitationCard } from '@/components/teachings/CitationCard';
import { StoryCard } from '@/components/teachings/StoryCard';
import { getSourceById, formatTimestamp } from '@/lib/seed-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { renderInlineMarkdown } from '@/lib/markdown-utils';
import jsPDF from 'jspdf';

export default function TeachingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { getTeachingById, updateTeaching, deleteTeaching, isLoading } = useTeachings();
  
  const teaching = getTeachingById(id || '');
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // Design generation states
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [designPrompt, setDesignPrompt] = useState('');
  const [generatedDesignUrl, setGeneratedDesignUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !teaching) {
      navigate('/teachings');
    }
  }, [teaching, navigate, isLoading]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!teaching) {
    return null;
  }

  const theme = themes.find(t => t.id === teaching.theme) || themes[0];
  const uniqueSources = teaching.insights ? [...new Set(teaching.insights.map((i: any) => i.sourceId))] : [];

  const handleOpenEdit = () => {
    setEditTitle(teaching.titleFr);
    setEditContent(teaching.contentFr);
    setGeneratedDesignUrl(teaching.generatedDesign || null);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (publish: boolean = false) => {
    try {
      await updateTeaching(teaching.id, {
        titleFr: editTitle,
        contentFr: editContent,
        status: publish ? 'published' : teaching.status === 'published' ? 'published' : 'review',
        generatedDesign: generatedDesignUrl || undefined
      });
      setShowEditDialog(false);
      
      toast({
        title: publish ? "Enseignement publié !" : "Modifications enregistrées",
        description: publish 
          ? "L'enseignement est maintenant visible publiquement."
          : "Vos modifications ont été sauvegardées.",
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeaching(teaching.id);
      toast({
        title: "Enseignement supprimé",
        description: "L'enseignement a été supprimé avec succès.",
      });
      navigate('/teachings');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExportPDF = () => {
    try {
      toast({
        title: "Export PDF",
        description: "Génération du fichier PDF en cours...",
      });

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const writeText = (
        text: string,
        opts: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: [number, number, number]; gap?: number } = {}
      ) => {
        const { size = 11, style = 'normal', color = [30, 30, 30], gap = 2 } = opts;
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = size * 0.45;
        for (const line of lines) {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += gap;
      };

      const drawDivider = () => {
        ensureSpace(6);
        doc.setDrawColor(200, 170, 80);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      };

      // Header band
      doc.setFillColor(20, 30, 55);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(212, 175, 55);
      doc.text('TEACHINGS HUB — ENSEIGNEMENT', margin, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.text(`Thème : ${theme.label}`, margin, 20);
      y = 38;

      // Title
      writeText(teaching.titleFr, { size: 20, style: 'bold', color: [20, 30, 55], gap: 4 });

      // Meta
      const metaParts: string[] = [];
      if (teaching.youtubeUrl) metaParts.push('Source : vidéo YouTube');
      if (uniqueSources.length) metaParts.push(`${uniqueSources.length} source(s)`);
      if (teaching.insights?.length) metaParts.push(`${teaching.insights.length} section(s)`);
      if (metaParts.length) {
        writeText(metaParts.join(' • '), { size: 9, style: 'italic', color: [120, 120, 120], gap: 4 });
      }
      drawDivider();

      // Body
      const stripMd = (s: string) =>
        s
          .replace(/[#>*_`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\r/g, '')
          .trim();

      if (teaching.insights && teaching.insights.length > 0) {
        teaching.insights.forEach((insight: any, idx: number) => {
          writeText(`${idx + 1}. ${insight.title}`, {
            size: 14,
            style: 'bold',
            color: [20, 30, 55],
            gap: 2,
          });
          if (insight.content) {
            writeText(stripMd(insight.content), { size: 11, gap: 4 });
          }
          if (insight.quote) {
            writeText(`« ${stripMd(insight.quote)} »`, {
              size: 11,
              style: 'italic',
              color: [120, 90, 20],
              gap: 4,
            });
          }
          drawDivider();
        });
      } else {
        contentSections.forEach((section) => {
          writeText(stripMd(section), { size: 11, gap: 4 });
        });
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} / ${pageCount} — Généré depuis la plateforme d'enseignements Enseignements`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      const safeTitle = teaching.titleFr
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);

      doc.save(`enseignement-${safeTitle || teaching.id}.pdf`);

      toast({
        title: "PDF prêt !",
        description: "Le fichier a été téléchargé.",
      });
    } catch (error) {
      console.error('Erreur export PDF :', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Lien copié !",
      description: "Le lien a été copié dans le presse-papiers.",
    });
  };

  const handleGenerateDesign = async () => {
    setIsGeneratingDesign(true);
    setGeneratedDesignUrl(null);

    try {
      const citation = teaching.contentFr.match(/> "([^"]+)"/)?.[1] || teaching.titleFr;
      
      const { data, error } = await supabase.functions.invoke('generate-teaching', {
        body: { 
          type: 'generate-design',
          content: citation,
          designPrompt: designPrompt || `Create an elegant quote card for social media with this quote from Enseignements: "${citation}". 
Style: Deep navy blue background with golden accents, subtle light rays, modern and spiritual aesthetic. 
Include the name "un enseignant" at the bottom. 
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

  const statusOptions = [
    { value: 'draft', label: 'Brouillon', icon: FileEdit },
    { value: 'review', label: 'En révision', icon: Eye },
    { value: 'published', label: 'Publié', icon: CheckCircle },
  ];

  const handleStatusChange = async (newStatus: 'draft' | 'review' | 'published') => {
    try {
      await updateTeaching(teaching.id, { status: newStatus });
      toast({
        title: "Statut mis à jour",
        description: `L'enseignement est maintenant "${statusOptions.find(s => s.value === newStatus)?.label}".`,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = () => {
    switch (teaching.status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Publié</Badge>;
      case 'review':
        return <Badge className="bg-gold/20 text-gold-dark">En révision</Badge>;
      default:
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  // Parse content for display
  const contentSections = teaching.contentFr.split('\n\n---\n\n').filter(Boolean);

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
                  {isAdmin ? (
                    <Select 
                      value={teaching.status} 
                      onValueChange={(value: 'draft' | 'review' | 'published') => handleStatusChange(value)}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="w-3 h-3" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge()
                  )}
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
                    {teaching.titleFr}
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {teaching.youtubeUrl ? (
                  <>Enseignement généré à partir d'une vidéo YouTube</>
                ) : (
                  <>Enseignement thématique sur {theme.label.toLowerCase()}.</>
                )}
              </p>
              {teaching.youtubeUrl && (
                <a 
                  href={teaching.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-accent hover:underline"
                >
                  <Youtube className="w-4 h-4" />
                  Voir la vidéo source
                </a>
              )}
            </div>
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              {isAdmin && (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleOpenEdit}
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
            </div>
          </div>

          {/* Stats - Admin only */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{teaching.insights.length || contentSections.length}</p>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{uniqueSources.length || (teaching.youtubeUrl ? 1 : 0)}</p>
                <p className="text-sm text-muted-foreground">Sources vidéo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {teaching.insights.length > 0 
                    ? Math.round(teaching.insights.reduce((acc, i) => acc + i.confidence, 0) / teaching.insights.length * 100)
                    : 100}%
                </p>
                <p className="text-sm text-muted-foreground">Confiance</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            {teaching.insights && teaching.insights.length > 0 ? (
              // Display insights if available
              teaching.insights.map((insight: any, idx: number) => {
                const source = getSourceById(insight.sourceId);
                return (
                  <div 
                    key={insight.id}
                    className="bg-card rounded-xl border border-border p-4 md:p-6"
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
                        {isAdmin && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            <Sparkles className="w-3 h-3" />
                            {Math.round(insight.confidence * 100)}%
                          </div>
                        )}
                      </div>

                    <ul className="space-y-2 mb-4">
                      {insight.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-3 text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <blockquote className="border-l-2 border-accent/30 pl-4 py-2 bg-muted/50 rounded-r-lg">
                      <p className="text-sm italic text-muted-foreground">"{insight.citationText}"</p>
                      {source && isAdmin && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                          <Video className="w-3 h-3" />
                          {source.title} • {formatTimestamp(insight.citationStartTs)}
                        </p>
                      )}
                    </blockquote>

                    <Link 
                      to={`/insights/${insight.id}`}
                      className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-4"
                    >
                      Voir les détails <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })
            ) : (
              // Display parsed content for AI-generated teachings
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <div className="prose prose-sm max-w-none">
                  {(() => {
                    // Try to parse JSON content if it looks like JSON
                    let parsedContent: any = null;
                    const trimmedContent = teaching.contentFr.trim();
                    
                    if (trimmedContent.startsWith('{') || trimmedContent.startsWith('```json') || trimmedContent.startsWith('```')) {
                      try {
                        // Strip various markdown code block wrappers
                        let jsonStr = trimmedContent
                          .replace(/^```(?:json)?\s*\n?/, '')
                          .replace(/\n?\s*```\s*$/, '')
                          .trim();
                        // Also try extracting the first JSON object if there's extra text
                        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                          parsedContent = JSON.parse(jsonMatch[0]);
                        }
                      } catch (e) {
                        // Not valid JSON, will render as markdown
                      }
                    }
                    
                    // If we have parsed JSON content, render it properly
                    if (parsedContent) {
                      return (
                        <>
                          {parsedContent.title && (
                            <h2 className="font-display text-xl font-bold text-foreground mb-4">
                              {parsedContent.title}
                            </h2>
                          )}
                          
                          {parsedContent.summary && (
                            <div className="mb-6">
                              <h3 className="font-display text-lg font-semibold text-foreground mb-2">📖 Introduction</h3>
                              <p className="text-foreground/80 whitespace-pre-line">{parsedContent.summary}</p>
                            </div>
                          )}

                          {/* Parts - Serial publishing sections */}
                          {parsedContent.parts?.length > 0 && (
                            <div className="mb-6 space-y-6">
                              {parsedContent.parts.map((part: any, idx: number) => (
                                <div key={idx} className="border border-border rounded-xl p-5 bg-muted/30">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                                      {part.partNumber || idx + 1}
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-foreground">
                                      {part.partTitle || `Partie ${idx + 1}`}
                                    </h3>
                                  </div>
                                  <div className="text-foreground/80 whitespace-pre-line">
                                    {(part.content || '').split('\n').map((line: string, lineIdx: number) => {
                                      if (line.startsWith('## ')) return <h4 key={lineIdx} className="font-display text-base font-semibold text-foreground mt-4 mb-2">{renderInlineMarkdown(line.replace('## ', ''))}</h4>;
                                      if (line.startsWith('- ')) return <div key={lineIdx} className="flex items-start gap-2 mb-1"><CheckCircle className="w-3.5 h-3.5 text-accent mt-1 flex-shrink-0" /><span>{renderInlineMarkdown(line.replace('- ', ''))}</span></div>;
                                      if (line.startsWith('> ')) return <blockquote key={lineIdx} className="border-l-2 border-accent/30 pl-3 py-1 bg-muted/50 rounded-r-lg my-2 text-sm italic text-muted-foreground">{renderInlineMarkdown(line.replace('> ', ''))}</blockquote>;
                                      if (line.trim()) return <p key={lineIdx} className="mb-1">{renderInlineMarkdown(line)}</p>;
                                      return <br key={lineIdx} />;
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Publishing plan */}
                          {parsedContent.publishingPlan && (
                            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                              <h3 className="font-display text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Plan de publication
                              </h3>
                              <p className="text-sm text-foreground/80">
                                📅 {parsedContent.publishingPlan.totalParts} parties • Publication tous les {parsedContent.publishingPlan.frequencyDays} jours
                              </p>
                              {parsedContent.publishingPlan.hookForNextPart && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                  🔜 {parsedContent.publishingPlan.hookForNextPart}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {parsedContent.keyPoints?.length > 0 && (
                            <div className="mb-6">
                              <h3 className="font-display text-lg font-semibold text-foreground mb-3">🔑 Points clés</h3>
                              {parsedContent.keyPoints.map((point: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 text-foreground/80 mb-2">
                                  <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                                  <span>{renderInlineMarkdown(typeof point === 'string' ? point : JSON.stringify(point))}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {parsedContent.citations?.length > 0 && (
                            <div className="mb-6">
                              <h3 className="font-display text-lg font-semibold text-foreground mb-3">💬 Citations</h3>
                              {parsedContent.citations.map((citation: any, idx: number) => (
                                <blockquote key={idx} className="border-l-2 border-accent/30 pl-4 py-2 bg-muted/50 rounded-r-lg my-3">
                                  <p className="text-sm italic text-muted-foreground">
                                    "{typeof citation === 'string' ? citation : citation.text || JSON.stringify(citation)}"
                                  </p>
                                  {typeof citation !== 'string' && citation.context && (
                                    <p className="text-xs text-muted-foreground mt-1">— {citation.context}</p>
                                  )}
                                </blockquote>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    }
                    
                    // Fallback to markdown rendering
                    return teaching.contentFr.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={idx} className="font-display text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">
                            {renderInlineMarkdown(line.replace('## ', ''))}
                          </h2>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-3 text-foreground/80 mb-2">
                            <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                            <span>{renderInlineMarkdown(line.replace('- ', ''))}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-2 border-accent/30 pl-4 py-2 bg-muted/50 rounded-r-lg my-4">
                            <p className="text-sm italic text-muted-foreground">{renderInlineMarkdown(line.replace('> ', ''))}</p>
                          </blockquote>
                        );
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} className="my-6 border-border" />;
                      }
                      if (line.trim()) {
                        return <p key={idx} className="text-foreground/80 mb-2">{renderInlineMarkdown(line)}</p>;
                      }
                      return null;
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Visual Concepts Section */}
            {teaching.visualConcepts && teaching.visualConcepts.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  Concepts visuels
                </h3>
                <div className="grid gap-4">
                  {teaching.visualConcepts.map((concept, idx) => (
                    <VisualConceptCard key={idx} concept={concept} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Practical Tips Section */}
            {teaching.practicalTips && teaching.practicalTips.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Conseils pratiques
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teaching.practicalTips.map((tip, idx) => (
                    <PracticalTipCard key={idx} tip={tip} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Citations Section */}
            {teaching.citations && teaching.citations.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-accent" />
                  Citations marquantes
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      Générer des images pour les réseaux sociaux
                    </Badge>
                  )}
                </h3>
                <div className="space-y-4">
                  {teaching.citations.map((citation, idx) => (
                    <CitationCard 
                      key={idx}
                      citation={citation}
                      isAdmin={isAdmin}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Principles Section */}
            {teaching.principles && teaching.principles.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <Gem className="w-5 h-5 text-gold" />
                  Principes fondamentaux
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teaching.principles.map((principle, idx) => (
                    <PrincipleCard key={idx} principle={principle} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Stories Section */}
            {teaching.stories && teaching.stories.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 md:p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Histoires & Leçons
                </h3>
                <div className="space-y-4">
                  {teaching.stories.map((story, idx) => (
                    <StoryCard key={idx} story={story} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Application Steps Section */}
            {teaching.applicationSteps && teaching.applicationSteps.length > 0 && (
              <ApplicationSteps steps={teaching.applicationSteps} />
            )}

            {/* LinkedIn Post Section - Admin only */}
            {isAdmin && teaching.socialPosts?.linkedin && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-accent" />
                  Post LinkedIn
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{teaching.socialPosts.linkedin}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(teaching.socialPosts.linkedin);
                    toast({
                      title: "Copié !",
                      description: "Le post LinkedIn a été copié dans le presse-papiers.",
                    });
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copier le texte
                </Button>
              </div>
            )}

            {/* Generated Design Section - Admin only */}
            {isAdmin && teaching.generatedDesign && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-accent" />
                  Design généré
                </h3>
                <img 
                  src={teaching.generatedDesign} 
                  alt="Generated design" 
                  className="w-full rounded-lg"
                />
                <a 
                  href={teaching.generatedDesign} 
                  download="teaching-design.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                </a>
              </div>
            )}

            {/* CTA for non-authenticated users */}
            {!user && (
              <div className="bg-gradient-to-br from-gold/10 to-accent/5 border border-gold/20 rounded-2xl p-6 md:p-8 text-center">
                <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Vous avez aimé cet enseignement ?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Inscrivez-vous pour accéder à plus de contenu de ce genre et rejoindre notre communauté.
                </p>
                <Button 
                  variant="gold" 
                  className="gap-2"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-4 h-4" />
                  Inscrivez-vous pour plus de contenu
                </Button>
              </div>
            )}

            {/* Comments Section */}
            <CommentSection teachingId={teaching.id} />
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Modifier l'enseignement
              </DialogTitle>
              <DialogDescription>
                Vérifiez et modifiez le contenu avant publication.
              </DialogDescription>
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

              <TabsContent value="content" className="space-y-6 mt-4">
                <div>
                  <Label>Titre</Label>
                  <Input 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Contenu (FR)
                    </Label>
                    <Textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mt-1 min-h-[300px] font-mono text-sm"
                    />
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

                <div className="flex items-center gap-2 p-4 bg-gold/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-gold flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    <strong>Contenu IA :</strong> Modifiez le texte ci-dessus pour corriger toute erreur.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Annuler
                  </Button>
                  <Button variant="outline" onClick={() => handleSaveEdit(false)} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer
                  </Button>
                  <Button variant="gold" onClick={() => handleSaveEdit(true)} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer & Publier
                  </Button>
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

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Partager l'enseignement
              </DialogTitle>
              <DialogDescription>
                Copiez le lien ou partagez sur les réseaux sociaux.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label>Lien de partage</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={window.location.href}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copier
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(teaching.titleFr)}`, '_blank');
                  }}
                >
                  Twitter/X
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                >
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet enseignement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'enseignement "{teaching.titleFr}" sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
