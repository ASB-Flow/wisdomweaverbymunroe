import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  type: "generate-content" | "generate-design" | "generate-quote-image";
  youtubeUrl?: string;
  theme?: string;
  content?: string;
  designPrompt?: string;
  citation?: string;
  context?: string;
  author?: string;
  accentColor?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchYouTubeMetadata(videoId: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const response = await fetch(oembedUrl);
  if (!response.ok) return null;
  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user and check admin role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid authentication:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role - only admins can generate content
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      console.error("Admin access required for user:", user.id);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: RequestBody = await req.json();
    const { type } = body;

    if (type === "generate-content") {
      const { youtubeUrl, theme } = body;
      
      if (!youtubeUrl) {
        return new Response(JSON.stringify({ error: "YouTube URL is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const metadata = await fetchYouTubeMetadata(videoId);
      const videoTitle = metadata?.title || "Enseignement";

      const systemPrompt = `Tu es un expert en extraction d'enseignements spirituels et de leadership à partir de contenus de Myles Munroe. 
Tu dois extraire le maximum de contenu, créer un résumé structuré en français, formuler des citations mémorables, et générer des représentations visuelles des concepts clés.

IMPORTANT: Extrais le plus de contenu possible - ne te limite pas à un résumé superficiel. Analyse en profondeur chaque concept présenté.

Format de réponse attendu (JSON):
{
  "title": "Titre de l'enseignement en français",
  "summary": "Résumé détaillé de 3-5 paragraphes couvrant tous les aspects majeurs de l'enseignement",
  "keyPoints": [
    "Point clé 1 avec explication détaillée",
    "Point clé 2 avec explication détaillée",
    "Point clé 3 avec explication détaillée",
    "Point clé 4 avec explication détaillée",
    "Point clé 5 avec explication détaillée",
    "Point clé 6 avec explication détaillée",
    "Point clé 7 avec explication détaillée"
  ],
  "visualConcepts": [
    {
      "title": "Titre du concept visuel",
      "type": "diagram|pyramid|cycle|comparison|timeline|mindmap",
      "description": "Description détaillée de la figure explicative",
      "elements": ["Élément 1", "Élément 2", "Élément 3"],
      "explanation": "Explication de comment les éléments sont connectés"
    }
  ],
  "practicalTips": [
    {
      "tip": "Conseil pratique concret",
      "icon": "lightbulb|target|star|heart|book|compass",
      "application": "Comment appliquer ce conseil dans la vie quotidienne"
    }
  ],
  "citations": [
    {
      "text": "Citation exacte ou paraphrasée",
      "context": "Contexte dans lequel cette citation a été donnée"
    }
  ],
  "principles": [
    {
      "name": "Nom du principe",
      "definition": "Définition claire du principe",
      "importance": "Pourquoi ce principe est important"
    }
  ],
  "themes": ["thème1", "thème2", "thème3"],
  "applicationSteps": [
    {
      "step": 1,
      "action": "Action concrète à faire",
      "outcome": "Résultat attendu"
    }
  ],
  "socialPosts": {
    "twitter": "Post court pour Twitter (max 280 caractères)",
    "instagram": "Légende Instagram avec emojis et hashtags",
    "youtube": "Description YouTube avec timestamps suggérés",
    "linkedin": "Post LinkedIn professionnel et engageant (500-1000 caractères) avec une accroche forte, des points clés, un appel à l'action et des hashtags pertinents"
  }
}`;

      const userPrompt = `Génère un enseignement COMPLET et DÉTAILLÉ basé sur cette vidéo YouTube de Myles Munroe:
Titre: ${videoTitle}
URL: https://youtube.com/watch?v=${videoId}
${theme ? `Thème souhaité: ${theme}` : ""}

Instructions spéciales:
1. Extrais le MAXIMUM de contenu - ne te limite pas à un résumé superficiel
2. Crée au moins 3 concepts visuels (diagrammes, pyramides, cycles) pour représenter les idées clés
3. Fournis au moins 5 conseils pratiques applicables immédiatement
4. Identifie tous les principes fondamentaux enseignés
5. Propose des étapes d'application concrètes
6. Formule les citations de manière impactante

Crée un contenu riche, profond et transformationnel qui capture toute l'essence de l'enseignement.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "AI generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content;

      let parsedContent;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
      } catch {
        parsedContent = { raw: content };
      }

      return new Response(JSON.stringify({
        success: true,
        videoId,
        videoTitle,
        teaching: parsedContent,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "generate-design") {
      const { content, designPrompt } = body;

      if (!content) {
        return new Response(JSON.stringify({ error: "Content is required for design generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imagePrompt = designPrompt || 
        `Create an elegant, professional social media quote card design. 
Background: Deep navy blue with subtle gold accents and light rays.
Style: Modern, inspirational, spiritual aesthetic.
Include space for text overlay.
The design should evoke wisdom, leadership and spiritual depth.
Aspect ratio 1:1 for Instagram.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await response.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      return new Response(JSON.stringify({
        success: true,
        imageUrl,
        message: imageData.choices?.[0]?.message?.content,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (type === "generate-quote-image") {
      const { citation, context, theme: imageTheme, accentColor } = body as { 
        citation: string; 
        context?: string; 
        theme?: 'dark' | 'light' | 'gradient';
        accentColor?: 'gold' | 'blue' | 'purple' | 'green' | 'rose';
      };

      if (!citation) {
        return new Response(JSON.stringify({ error: "Citation is required for quote image generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Theme descriptions
      const themeDescriptions: Record<string, string> = {
        dark: "Elegant dark background with subtle gradient (deep navy blue to dark charcoal). Text should be white or cream colored for contrast.",
        light: "Clean, bright background with soft cream or white tones. Text should be dark navy or charcoal for contrast. Subtle texture or paper-like quality.",
        gradient: "Beautiful gradient background transitioning from deep purple to navy blue to soft pink/coral at the edges. Text should be white or golden for contrast.",
      };

      // Accent color descriptions
      const accentDescriptions: Record<string, string> = {
        gold: "Warm golden/amber accent elements, decorative lines, and subtle glow effects",
        blue: "Cool blue accent elements, decorative lines, and subtle cyan/turquoise glow effects",
        purple: "Rich purple/violet accent elements, decorative lines, and subtle magenta glow effects",
        green: "Fresh emerald green accent elements, decorative lines, and subtle teal glow effects",
        rose: "Elegant rose/pink accent elements, decorative lines, and subtle coral glow effects",
      };

      const selectedTheme = themeDescriptions[imageTheme || 'dark'] || themeDescriptions.dark;
      const selectedAccent = accentDescriptions[accentColor || 'gold'] || accentDescriptions.gold;

      const imagePrompt = `Create an elegant, professional social media quote card image with this exact quote text displayed beautifully on the image:

"${citation}"

${context ? `\n📍 ${context}` : ""}

Design specifications:
- ${selectedTheme}
- ${selectedAccent}
- The main quote text must be prominently displayed in an elegant serif font
- Text should be centered and easily readable
${context ? `- Add the context explanation in smaller text at the bottom of the image, in a lighter/muted color` : ""}
- NO author name should be displayed on the image
- Modern, inspirational, spiritual aesthetic
- Professional typography with proper hierarchy
- Aspect ratio 1:1 (square format for Instagram)
- Include subtle decorative elements like quotation marks or a frame
- The design should evoke wisdom, leadership and spiritual depth
- Make sure the entire quote is visible and readable`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quote image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "Quote image generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await response.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      return new Response(JSON.stringify({
        success: true,
        imageUrl,
        citation,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid request type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-teaching function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
