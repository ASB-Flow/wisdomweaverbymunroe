import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Loader2,
  FileText,
  Sparkles,
  Copy,
  Download,
  Save,
  X,
  Wand2,
} from 'lucide-react';

interface ComposedTeaching {
  title?: string;
  subtitle?: string;
  hook?: string;
  sections?: { heading: string; body: string }[];
  keyDeclarations?: string[];
  principles?: { name: string; definition: string; importance: string }[];
  applicationSteps?: { step: number; action: string; outcome: string }[];
  closingDeclaration?: string;
  suggestedTheme?: string;
  raw?: string;
}

export default function Compose() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addTeaching } = useTeachings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState('');
  const [theme, setTheme] = useState<string>('purpose');
  const [audience, setAudience] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ComposedTeaching | null>(null);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setFileName(file.name);
    try {
      const name = file.name.toLowerCase();
      let text = '';

      if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
        text = await file.text();
      } else if (name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const buffer = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = res.value;
      } else if (name.endsWith('.pdf')) {
        const pdfjs: any = await import('pdfjs-dist');
        const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        let full = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          full += content.items.map((it: any) => it.str).join(' ') + '\n\n';
        }
        text = full;
      } else {
        throw new Error('Format non supporté. Utilisez .txt, .md, .docx ou .pdf');
      }

      setNotes((prev) => (prev ? prev + '\n\n' + text : text));
      toast({ title: 'Fichier importé', description: `${text.length} caractères extraits` });
    } catch (e: any) {
      console.error(e);
      setFileName(null);
      toast({
        title: 'Erreur de lecture',
        description: e.message || 'Impossible de lire le fichier',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      toast({ title: 'Sujet requis', description: 'Entrez un sujet (min 3 caractères)', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('compose-teaching', {
        body: { topic, notes, theme, audience, length },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.teaching);
      toast({ title: 'Enseignement généré', description: 'Vérifiez et personnalisez le résultat' });
    } catch (e: any) {
      toast({
        title: 'Échec de la génération',
        description: e.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^## (.+)$/gm, '<h3 class="text-xl font-display font-semibold mt-6 mb-2 text-gold">$1</h3>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gold pl-4 italic my-4 text-foreground/90">$1</blockquote>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/^/, '<p class="mb-3">')
      .concat('</p>');
  };

  const composedToMarkdown = (t: ComposedTeaching): string => {
    if (t.raw) return t.raw;
    let md = `# ${t.title || ''}\n\n`;
    if (t.subtitle) md += `*${t.subtitle}*\n\n`;
    if (t.hook) md += `${t.hook}\n\n---\n\n`;
    t.sections?.forEach((s) => {
      md += `## ${s.heading}\n\n${s.body}\n\n`;
    });
    if (t.principles?.length) {
      md += `## Principes clés\n\n`;
      t.principles.forEach((p) => {
        md += `**${p.name}** — ${p.definition}\n\n*Pourquoi c'est vital :* ${p.importance}\n\n`;
      });
    }
    if (t.applicationSteps?.length) {
      md += `## Mise en pratique\n\n`;
      t.applicationSteps.forEach((s) => {
        md += `${s.step}. **${s.action}** — ${s.outcome}\n`;
      });
      md += '\n';
    }
    if (t.keyDeclarations?.length) {
      md += `## Déclarations à retenir\n\n`;
      t.keyDeclarations.forEach((d) => (md += `> ${d}\n\n`));
    }
    if (t.closingDeclaration) md += `---\n\n${t.closingDeclaration}\n`;
    return md;
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(composedToMarkdown(result));
    toast({ title: 'Copié', description: 'Le markdown est dans le presse-papiers' });
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([composedToMarkdown(result)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.title || 'enseignement').replace(/[^\w]+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDraft = async () => {
    if (!result) return;
    try {
      const teaching = await addTeaching({
        titleFr: result.title || topic,
        theme: result.suggestedTheme || theme,
        status: 'draft',
        contentFr: composedToMarkdown(result),
        principles: result.principles,
        applicationSteps: result.applicationSteps,
        citations: result.keyDeclarations?.map((text) => ({ text })),
      });
      toast({ title: 'Brouillon créé', description: 'Vous pouvez maintenant l\'éditer' });
      navigate(`/teachings/${teaching.id}`);
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e.message || 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-6 md:py-10 px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-gold" />
            Rédaction d'enseignement
          </h1>
          <p className="text-muted-foreground mt-2">
            Génère un enseignement captivant dans le style du Dr Myles Munroe à partir de tes notes
            ou d'un sujet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="p-6 space-y-5 bg-card/50 backdrop-blur">
            <div>
              <Label htmlFor="topic">Sujet de l'enseignement *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Découvrir et activer ton potentiel caché"
                maxLength={200}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thème</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Longueur</Label>
                <Select value={length} onValueChange={(v: any) => setLength(v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Court (~1000 mots)</SelectItem>
                    <SelectItem value="medium">Moyen (~1800 mots)</SelectItem>
                    <SelectItem value="long">Long (~3000 mots)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="audience">Audience cible (optionnel)</Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Ex: Jeunes leaders africains"
                maxLength={150}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="notes">Notes de référence</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                  >
                    {isParsing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Importer (.txt .md .docx .pdf)
                  </Button>
                </div>
              </div>
              {fileName && (
                <div className="mb-2 text-xs flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" /> {fileName}
                  <button
                    onClick={() => {
                      setFileName(null);
                      setNotes('');
                    }}
                    className="hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Colle ou saisis tes notes ici, ou importe un fichier..."
                rows={10}
                maxLength={50000}
                className="resize-y font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notes.length.toLocaleString()} / 50 000 caractères
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || topic.trim().length < 3}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rédaction en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer l'enseignement
                </>
              )}
            </Button>
          </Card>

          {/* Result */}
          <Card className="p-6 bg-card/50 backdrop-blur min-h-[400px]">
            {!result && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                <p>L'enseignement généré apparaîtra ici</p>
              </div>
            )}

            {isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-gold" />
                <p>Rédaction prophétique en cours…</p>
                <p className="text-xs mt-2">Cela peut prendre 20-40 secondes</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="default" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4 mr-2" /> Sauvegarder comme brouillon
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" /> Copier
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" /> Markdown
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  {result.raw ? (
                    <pre className="whitespace-pre-wrap text-sm">{result.raw}</pre>
                  ) : (
                    <article className="prose prose-invert max-w-none">
                      {result.title && (
                        <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">
                          {result.title}
                        </h2>
                      )}
                      {result.subtitle && (
                        <p className="text-muted-foreground italic mb-4">{result.subtitle}</p>
                      )}
                      {result.hook && (
                        <div
                          className="text-foreground/90 mb-6 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(result.hook) }}
                        />
                      )}
                      {result.sections?.map((s, i) => (
                        <section key={i} className="mb-6">
                          <h3 className="text-xl font-display font-semibold text-gold mb-2">
                            {s.heading}
                          </h3>
                          <div
                            className="leading-relaxed text-foreground/90"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(s.body) }}
                          />
                        </section>
                      ))}
                      {result.principles && result.principles.length > 0 && (
                        <section className="mb-6">
                          <h3 className="text-xl font-display font-semibold text-gold mb-2">
                            Principes
                          </h3>
                          <ul className="space-y-3">
                            {result.principles.map((p, i) => (
                              <li key={i}>
                                <strong className="text-gold">{p.name}</strong> — {p.definition}
                                <br />
                                <span className="text-sm text-muted-foreground">
                                  {p.importance}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {result.applicationSteps && result.applicationSteps.length > 0 && (
                        <section className="mb-6">
                          <h3 className="text-xl font-display font-semibold text-gold mb-2">
                            Mise en pratique
                          </h3>
                          <ol className="list-decimal ml-6 space-y-2">
                            {result.applicationSteps.map((s) => (
                              <li key={s.step}>
                                <strong>{s.action}</strong> —{' '}
                                <span className="text-muted-foreground">{s.outcome}</span>
                              </li>
                            ))}
                          </ol>
                        </section>
                      )}
                      {result.keyDeclarations && result.keyDeclarations.length > 0 && (
                        <section className="mb-6">
                          <h3 className="text-xl font-display font-semibold text-gold mb-2">
                            Déclarations
                          </h3>
                          <div className="space-y-2">
                            {result.keyDeclarations.map((d, i) => (
                              <blockquote
                                key={i}
                                className="border-l-4 border-gold pl-4 italic text-foreground/90"
                              >
                                {d}
                              </blockquote>
                            ))}
                          </div>
                        </section>
                      )}
                      {result.closingDeclaration && (
                        <section className="mt-8 pt-6 border-t border-border">
                          <p className="text-lg italic text-gold/90 leading-relaxed">
                            {result.closingDeclaration}
                          </p>
                        </section>
                      )}
                    </article>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
