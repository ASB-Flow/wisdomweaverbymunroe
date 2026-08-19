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

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation";

/** Extract the first inline image (base64) from a Gemini image-generation response. */
function extractImageFromGemini(aiData: any): { b64: string; mimeType: string; text: string } | null {
  const parts = aiData?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      return { b64: p.inlineData.data, mimeType: p.inlineData.mimeType || "image/png", text: "" };
    }
    // Some shapes use inline_data
    if (p.inline_data?.data) {
      return { b64: p.inline_data.data, mimeType: p.inline_data.mime_type || "image/png", text: "" };
    }
  }
  // No inline image found; gather any text
  const text = parts.map((p: any) => p.text ?? "").join("");
  return text ? { b64: "", mimeType: "", text } : null;
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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
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

      const systemPrompt = `Tu es un EXPERT EN NARRATION et en enseignements spirituels/leadership de Myles Munroe. 
Tu rédiges en français des enseignements captivants, riches en illustrations, schémas et figures pour engager une communauté.

🎯 TON RÔLE : Transformer une vidéo en une SÉRIE D'ENSEIGNEMENTS publiables tous les 2 jours.

📝 PRINCIPES DE RÉDACTION :
- Écris comme un narrateur passionné, pas comme un résumé académique
- Utilise des analogies, métaphores et exemples concrets du quotidien
- Chaque partie doit être autonome mais donner envie de lire la suite
- Intègre des questions rhétoriques pour captiver le lecteur
- Utilise un ton direct, personnel et inspirant ("Imaginez...", "Pensez-y...", "Voici ce que cela signifie pour vous...")

📊 ILLUSTRATIONS ET SCHÉMAS (TRÈS IMPORTANT) :
- Crée des concepts visuels variés : pyramides, cycles, diagrammes, comparaisons, chronologies, cartes mentales
- Chaque concept visuel doit avoir des éléments clairs et connectés
- Les schémas doivent simplifier les idées complexes et les rendre mémorables
- Utilise au minimum 4-5 concepts visuels différents

Format de réponse attendu (JSON):
{
  "title": "Titre accrocheur et inspirant en français",
  "parts": [
    {
      "partNumber": 1,
      "partTitle": "Titre de la partie 1",
      "content": "Contenu narratif riche de 300-500 mots avec illustrations textuelles, analogies et exemples concrets. Utilise des sous-titres avec ##, des listes à puces, des citations en bloc avec > et des emphases avec **gras** et *italique*."
    }
  ],
  "summary": "Introduction narrative captivante de 3-5 paragraphes qui donne envie de plonger dans l'enseignement. Commence par une question ou une situation du quotidien.",
  "keyPoints": [
    "Point clé 1 : explication narrative avec exemple concret",
    "Point clé 2 : explication narrative avec illustration",
    "Point clé 3 : explication narrative avec application pratique",
    "Point clé 4 : explication avec analogie mémorable",
    "Point clé 5 : explication avec impact transformationnel",
    "Point clé 6 : explication avec connexion au quotidien",
    "Point clé 7 : explication avec vision inspirante"
  ],
  "visualConcepts": [
    {
      "title": "Titre du concept visuel",
      "type": "diagram|pyramid|cycle|comparison|timeline|mindmap",
      "description": "Description détaillée et narrative de la figure",
      "elements": ["Élément 1", "Élément 2", "Élément 3", "Élément 4"],
      "explanation": "Explication narrative de comment les éléments interagissent - comme si tu racontais une histoire"
    }
  ],
  "practicalTips": [
    {
      "tip": "Conseil pratique formulé de manière engageante et directe",
      "icon": "lightbulb|target|star|heart|book|compass",
      "application": "Scénario concret du quotidien montrant comment appliquer ce conseil"
    }
  ],
  "citations": [
    {
      "text": "Citation impactante et mémorable",
      "context": "Contexte narratif : dans quelle situation Munroe a prononcé ces mots et pourquoi c'est puissant"
    }
  ],
  "principles": [
    {
      "name": "Nom du principe (court et mémorable)",
      "definition": "Définition claire avec une analogie ou métaphore",
      "importance": "Pourquoi ce principe peut transformer votre vie - avec un exemple concret"
    }
  ],
  "themes": ["thème1", "thème2", "thème3"],
  "stories": [
    {
      "title": "Titre court et accrocheur de l'histoire/parabole/illustration",
      "story": "L'histoire, parabole ou illustration racontée par Munroe, fidèlement retranscrite avec les détails narratifs importants. Utilise un style vivant et engageant.",
      "lesson": "La leçon principale tirée de cette histoire. Ce que Munroe voulait enseigner à travers cette illustration. Formulée de manière claire et applicable."
    }
  ],
  "applicationSteps": [
    {
      "step": 1,
      "action": "Action concrète formulée comme un défi personnel",
      "outcome": "Transformation attendue décrite de manière inspirante"
    }
  ],
  "publishingPlan": {
    "totalParts": 3,
    "frequencyDays": 2,
    "hookForNextPart": "Teaser pour inciter à revenir pour la partie suivante"
  },
  "socialPosts": {
    "twitter": "Post percutant pour Twitter (max 280 caractères) avec une question ou citation forte",
    "instagram": "Légende Instagram narrative avec emojis, storytelling et hashtags",
    "youtube": "Description YouTube engageante avec timestamps suggérés",
    "linkedin": "Post LinkedIn storytelling (500-1000 caractères) : accroche émotionnelle, leçon clé, appel à l'action et hashtags"
  }
}`;

      const userPrompt = `Transforme cette vidéo YouTube de Myles Munroe en une SÉRIE D'ENSEIGNEMENTS NARRATIFS captivants en français :
Titre: ${videoTitle}
URL: https://youtube.com/watch?v=${videoId}
${theme ? `Thème souhaité: ${theme}` : ""}

Instructions ESSENTIELLES :
1. NARRATION : Écris comme un conteur passionné. Commence par une situation du quotidien ou une question provocante. Utilise des transitions narratives entre les idées.
2. PARTIES : Divise l'enseignement en 2-4 parties publiables tous les 2 jours. Chaque partie doit avoir un arc narratif complet avec une accroche et une conclusion qui donne envie de lire la suite.
3. ILLUSTRATIONS VISUELLES : Crée au moins 5 concepts visuels (pyramides, cycles, diagrammes, comparaisons, chronologies, cartes mentales) pour rendre les idées mémorables et partageables.
4. EXEMPLES CONCRETS : Chaque principe doit être illustré par un exemple de la vie quotidienne (famille, travail, relations).
5. CITATIONS IMPACTANTES : Formule les citations de manière percutante avec leur contexte narratif.
6. CONSEILS PRATIQUES : Au moins 5 conseils directement applicables, formulés comme des défis personnels.
7. PLAN DE PUBLICATION : Propose un calendrier de publication avec des teasers pour chaque partie suivante.
8. HISTOIRES ET PARABOLES : Capture FIDÈLEMENT toutes les histoires, illustrations, paraboles et anecdotes racontées par Munroe. Pour chaque histoire, extrais la leçon principale enseignée. Format: Histoire complète + Leçon tirée.
9. ENGAGEMENT : Intègre des questions rhétoriques, des interpellations directes au lecteur, et des moments de réflexion.

L'objectif est de CAPTIVER ta communauté et les INCITER à consulter chaque nouvelle partie avec impatience.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 1 },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 403) {
          return new Response(JSON.stringify({ error: "Clé API Gemini invalide ou quota dépassé." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "AI generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await response.json();
      const content = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      let parsedContent;
      try {
        // Strip markdown code block wrappers before parsing
        let cleanContent = content.trim()
          .replace(/^```(?:json)?\s*\n?/, '')
          .replace(/\n?\s*```\s*$/, '')
          .trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        },
      );

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
      const extracted = extractImageFromGemini(imageData);
      const imageUrl = extracted?.b64
        ? `data:${extracted.mimeType};base64,${extracted.b64}`
        : undefined;

      return new Response(JSON.stringify({
        success: true,
        imageUrl,
        message: extracted?.text || undefined,
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quote image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 403) {
          return new Response(JSON.stringify({ error: "Clé API Gemini invalide ou quota dépassé." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "Quote image generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await response.json();
      const extracted = extractImageFromGemini(imageData);
      const imageUrl = extracted?.b64
        ? `data:${extracted.mimeType};base64,${extracted.b64}`
        : undefined;

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
