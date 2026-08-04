import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  type: "generate-sections" | "generate-background";
  subject?: string;
  theme?: string;
  slideCount?: number;
  stylePrompt?: string;
  sectionText?: string;
  imageIdea?: string;
  size?: string;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Authentification invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès administrateur requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

    const body: Body = await req.json();

    if (body.type === "generate-sections") {
      const subject = (body.subject ?? "").trim();
      if (!subject) {
        return new Response(JSON.stringify({ error: "Le sujet est requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const count = Math.min(Math.max(body.slideCount ?? 5, 2), 10);

      const systemPrompt = `Tu es rédacteur de carrousels Instagram pour une communauté chrétienne francophone (Sénégal / Afrique de l'Ouest).
Tu écris en FRANÇAIS, dans le style du Dr Myles Munroe : direct, prophétique, autoritaire, orienté potentiel, purpose, leadership et Royaume.

STRUCTURE NARRATIVE OBLIGATOIRE (dans cet ordre) :
1. Accroche (hook) : une affirmation choc + une chute qui retourne l'esprit.
2. à N-2 : développement — mythe/révélation, définition, analogie concrète (graine, lion, aigle, semence, terre locale), principe.
   Au moins une slide contient une liste de 2 à 4 puces.
   Au moins une slide propose une action / reprogrammation en étapes.
3. Dernière slide : appel à l'action clair (partage, commentaire, inscription).

TON : affirmations, jamais "je pense que". Utilise "Vous êtes...", "Le potentiel est...".
Références culturelles ouest-africaines bienvenues (baobab, manguier, marché, Dakar) mais jamais caricaturales.

Pour chaque slide :
- "kicker" : 1 à 3 mots (ex : "L'accroche", "Le mythe", "L'action").
- "heading" : 2 à 6 mots MAXIMUM, percutant.
- "subtext" : une phrase courte (max 15 mots) qui prolonge le titre. Peut être vide.
- "body" : 15 à 45 mots MAXIMUM. Utilise **gras** pour les mots clés et des lignes commençant par "- " pour les puces.
- "imageIdea" : description visuelle en ANGLAIS du fond (sans texte), ex : "extreme close-up of a lion's eye, golden light".
- Pas de hashtags dans les slides.

Réponds UNIQUEMENT en JSON valide :
{
  "title": "Titre du carrousel (accrocheur, avec sous-titre après ':')",
  "slides": [{ "kicker": "...", "heading": "...", "subtext": "...", "body": "...", "imageIdea": "..." }],
  "caption": "Légende Instagram (150-400 caractères) avec emojis et 5 hashtags en fin"
}`;


      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Sujet : ${subject}\n${body.theme ? `Thème : ${body.theme}\n` : ""}Génère exactement ${count} sections.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Génération du contenu échouée" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await response.json();
      const content: string = aiData.choices?.[0]?.message?.content ?? "";
      let parsed: unknown;
      try {
        const clean = content.trim()
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?\s*```\s*$/, "")
          .trim();
        const match = clean.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      } catch {
        parsed = null;
      }

      if (!parsed) {
        return new Response(JSON.stringify({ error: "Réponse IA illisible" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, ...(parsed as object) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.type === "generate-background") {
      const stylePrompt = (body.stylePrompt ?? "").trim();
      if (!stylePrompt) {
        return new Response(JSON.stringify({ error: "Le style est requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prompt = `Vertical 9:16 Instagram story BACKGROUND image, NO TEXT of any kind, no letters, no words, no logos.
Style: ${stylePrompt}.
${body.sectionText ? `Mood inspired by this idea (do not write it): "${body.sectionText}".` : ""}
The center of the image must stay visually calm and uncluttered so that text can be overlaid on top.
Cinematic, elegant, high-end editorial quality, subtle grain.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-image-2",
          prompt,
          size: "1024x1536",
          quality: "low",
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Génération de l'image échouée", details: errorText }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await response.json();
      const b64 = imageData?.data?.[0]?.b64_json;
      if (!b64) {
        return new Response(JSON.stringify({ error: "Aucune image renvoyée" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, imageUrl: `data:image/png;base64,${b64}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Type de requête invalide" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("instagram-visuals error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
