import { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import {
  DESIGN_PRESETS,
  getDesign,
  StorySlideData,
} from "@/lib/instagram-designs";
import { StorySlide } from "@/components/instagram/StorySlide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Instagram,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Download,
  ImageIcon,
  FileDown,
  Bold,
  List,
} from "lucide-react";

interface PostRow {
  id: string;
  title: string;
  theme: string | null;
  design_style: string;
  slides: StorySlideData[];
  updated_at: string;
}

const EXPORT_WIDTH = 1080;

/** Downscale a data URL to a compact JPEG so it can be stored with the post */
async function compressImage(dataUrl: string, maxWidth = 720): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const emptySlide = (): StorySlideData => ({ heading: "", body: "" });

export default function InstagramStudio() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [subject, setSubject] = useState("");
  const [slideCount, setSlideCount] = useState("5");
  const [designId, setDesignId] = useState("gold-dark");
  const [slides, setSlides] = useState<StorySlideData[]>([emptySlide()]);
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageLoading, setImageLoading] = useState<number | null>(null);
  const [bulkImages, setBulkImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const design = getDesign(designId);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("id,title,theme,design_style,slides,updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setPosts((data ?? []) as unknown as PostRow[]);
  };

  useEffect(() => {
    if (user) loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resetForm = () => {
    setCurrentId(null);
    setTitle("");
    setTheme("");
    setSubject("");
    setCaption("");
    setSlides([emptySlide()]);
  };

  const openPost = (post: PostRow) => {
    setCurrentId(post.id);
    setTitle(post.title);
    setTheme(post.theme ?? "");
    setDesignId(post.design_style);
    setSlides(post.slides?.length ? post.slides : [emptySlide()]);
  };

  const updateSlide = (index: number, patch: Partial<StorySlideData>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const generateSections = async () => {
    if (!subject.trim()) {
      toast.error("Indiquez d'abord un sujet");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("instagram-visuals", {
        body: {
          type: "generate-sections",
          subject,
          theme,
          slideCount: Number(slideCount),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.title && !title) setTitle(data.title);
      if (data?.caption) setCaption(data.caption);
      if (Array.isArray(data?.slides) && data.slides.length) {
        setSlides(
          data.slides.map((s: StorySlideData) => ({
            heading: s.heading ?? "",
            body: s.body ?? "",
          })),
        );
      }
      toast.success("Sections générées");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Génération impossible");
    } finally {
      setGenerating(false);
    }
  };

  const generateBackground = async (index: number) => {
    setImageLoading(index);
    try {
      const slide = slides[index];
      const { data, error } = await supabase.functions.invoke("instagram-visuals", {
        body: {
          type: "generate-background",
          stylePrompt: design.prompt,
          sectionText: `${slide.heading}. ${slide.body}`,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("Aucune image reçue");
      const compact = await compressImage(data.imageUrl);
      updateSlide(index, { image: compact });
      toast.success(`Visuel ${index + 1} généré`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Génération de l'image impossible");
    } finally {
      setImageLoading(null);
    }
  };

  const generateAllBackgrounds = async () => {
    setBulkImages(true);
    for (let i = 0; i < slides.length; i++) {
      // sequential to stay under rate limits
      // eslint-disable-next-line no-await-in-loop
      await generateBackground(i);
    }
    setBulkImages(false);
  };

  const savePost = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error("Donnez un titre au sujet");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        title,
        theme: theme || null,
        design_style: designId,
        slides: slides as unknown as never,
      };
      if (currentId) {
        const { error } = await supabase
          .from("instagram_posts")
          .update(payload)
          .eq("id", currentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("instagram_posts")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setCurrentId(data.id);
      }
      toast.success("Sujet enregistré");
      loadPosts();
    } catch (e) {
      console.error(e);
      toast.error("Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("instagram_posts").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    if (currentId === id) resetForm();
    toast.success("Sujet supprimé");
    loadPosts();
  };

  const exportSlide = async (index: number) => {
    const node = exportRefs.current[index];
    if (!node) return;
    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      width: EXPORT_WIDTH,
      height: (EXPORT_WIDTH * 16) / 9,
    });
    const link = document.createElement("a");
    link.download = `${(title || "story").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportAll = async () => {
    setExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await exportSlide(i);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success("Visuels téléchargés");
    } catch (e) {
      console.error(e);
      toast.error("Export impossible");
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
              <Instagram className="w-7 h-7 text-primary" />
              Studio Instagram
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez un sujet, structurez vos sections et générez les visuels 9:16 prêts à publier.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau sujet
            </Button>
            <Button onClick={savePost} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Saved posts */}
          <Card className="p-4 h-fit">
            <h2 className="font-medium mb-3">Mes sujets</h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun sujet enregistré.</p>
              )}
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`group flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                    currentId === post.id ? "border-primary bg-accent/40" : "hover:bg-accent/30"
                  }`}
                  onClick={() => openPost(post)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.slides?.length ?? 0} sections
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost(post.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            {/* Subject */}
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre du sujet</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Le pouvoir de la vision" />
                </div>
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex : Leadership, foi, purpose" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sujet à développer (pour l'IA)</Label>
                <Textarea
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Décrivez le message que vous voulez transmettre..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de sections</Label>
                  <Select value={slideCount} onValueChange={setSlideCount}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} sections</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Design</Label>
                  <Select value={designId} onValueChange={setDesignId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DESIGN_PRESETS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={generateSections} disabled={generating} className="w-full">
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Générer les sections
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" onClick={generateAllBackgrounds} disabled={bulkImages}>
                  {bulkImages ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  Générer tous les fonds IA
                </Button>
                <Button variant="outline" onClick={exportAll} disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  Télécharger tous les visuels
                </Button>
                <Button variant="ghost" onClick={() => setSlides((p) => [...p, emptySlide()])}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une section
                </Button>
              </div>

              {caption && (
                <div className="space-y-2">
                  <Label>Légende Instagram</Label>
                  <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} />
                </div>
              )}
            </Card>

            {/* Sections + previews */}
            <div className="space-y-6">
              {slides.map((slide, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    <div className="flex justify-center">
                      <div className="overflow-hidden rounded-xl shadow-lg">
                        <StorySlide
                          slide={slide}
                          design={design}
                          width={200}
                          index={index}
                          total={slides.length}
                          footer={theme || "Teachings Hub"}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Section {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSlides((p) => p.filter((_, i) => i !== index))}
                          disabled={slides.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={slide.heading}
                        onChange={(e) => updateSlide(index, { heading: e.target.value })}
                        placeholder="Titre de la section"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyBold(index)}
                          title="Mettre en gras la sélection"
                        >
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyBullets(index)}
                          title="Transformer les lignes en puces"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          **gras** · lignes commençant par « - » = puces
                        </span>
                      </div>
                      <Textarea
                        ref={(el) => (bodyRefs.current[index] = el)}
                        value={slide.body}
                        onChange={(e) => updateSlide(index, { body: e.target.value })}
                        placeholder="Texte affiché sur le visuel"
                        rows={4}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateBackground(index)}
                          disabled={imageLoading === index}
                        >
                          {imageLoading === index ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ImageIcon className="w-4 h-4 mr-2" />
                          )}
                          Fond IA
                        </Button>
                        {slide.image && (
                          <Button variant="ghost" size="sm" onClick={() => updateSlide(index, { image: undefined })}>
                            Retirer le fond
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => exportSlide(index)}>
                          <Download className="w-4 h-4 mr-2" /> PNG 1080×1920
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden full-size render used for the PNG export */}
        <div style={{ position: "fixed", top: 0, left: -99999, opacity: 0, pointerEvents: "none" }} aria-hidden>
          {slides.map((slide, index) => (
            <StorySlide
              key={index}
              ref={(el) => (exportRefs.current[index] = el)}
              slide={slide}
              design={design}
              width={EXPORT_WIDTH}
              index={index}
              total={slides.length}
              footer={theme || "Teachings Hub"}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
