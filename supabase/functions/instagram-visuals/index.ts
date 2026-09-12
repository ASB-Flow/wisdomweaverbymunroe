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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY non configurée");

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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: `Sujet : ${subject}\n${body.theme ? `Thème : ${body.theme}\n` : ""}Génère exactement ${count} sections.` }] }],
            generationConfig: { temperature: 1 },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
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
        return new Response(JSON.stringify({ error: "Génération du contenu échouée" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await response.json();
      const content: string = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

      // Map requested size to Imagen aspect ratio
      const sizeToRatio: Record<string, string> = {
        "1024x1024": "1:1",
        "1024x1536": "9:16",
        "1536x1024": "16:9",
      };
      const aspectRatio = sizeToRatio[body.size ?? ""] ?? "9:16";

      const visualBrief = (body.imageIdea ?? "").trim();
      const prompt = `Create a photorealistic editorial image for an Instagram carousel.

MANDATORY PRIMARY SCENE — reproduce this description faithfully and literally:
${visualBrief || "A symbolic, cinematic scene inspired by the editorial message."}

COMPOSITION REQUIREMENTS:
- The requested subject, number of people, actions, body language, camera direction, focus and contrast are mandatory.
- If people appear, depict Black African adults with natural, realistic features.
- Keep the main subject clearly recognizable and in sharp focus when the brief requests it.
- Motion blur applies only to moving people or objects; never blur the main stationary subject.
- Preserve useful negative space in the upper or lower third for an editorial text overlay, without removing or weakening the requested scene.

VISUAL STYLE:
${stylePrompt}.
${body.sectionText ? `Emotional context only: "${body.sectionText}". Do not replace the mandatory scene with this context.` : ""}
Cinematic photography, believable lighting, natural anatomy, high-end African editorial campaign, subtle film grain.

STRICT EXCLUSIONS:
No text, no letters, no words, no captions, no logos, no watermark, no poster typography, no duplicated people, no distorted faces or hands.`;

      // Discover which image-capable models this API key can use
      let response: Response | null = null;
      let lastError = "";
      let usedPredict = false;

      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}&pageSize=200`,
      );
      const listJson = listRes.ok ? await listRes.json() : { models: [] };
      const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = listJson?.models ?? [];

      const predictModels = models
        .filter((m) => m.name?.includes("imagen") && (m.supportedGenerationMethods ?? []).includes("predict"))
        .map((m) => m.name.replace(/^models\//, ""));
      const genContentImageModels = models
        .filter((m) => /image/i.test(m.name) && (m.supportedGenerationMethods ?? []).includes("generateContent"))
        .map((m) => m.name.replace(/^models\//, ""));

      const candidates = [
        ...genContentImageModels,
        ...predictModels,
      ];
      if (candidates.length === 0) {
        candidates.push("gemini-2.5-flash-image", "imagen-3.0-generate-002");
      }
      console.log("Image model candidates:", candidates.join(", "));

      let b64: string | undefined;
      let lastStatus = 502;

      for (const model of candidates.slice(0, 6)) {
        const isPredict = model.includes("imagen");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${isPredict ? "predict" : "generateContent"}?key=${GEMINI_API_KEY}`;
        const payload = isPredict
          ? { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio } }
          : {
              contents: [{ role: "user", parts: [{ text: `${prompt}\nAspect ratio: ${aspectRatio}.` }] }],
              generationConfig: { responseModalities: ["IMAGE"] },
            };

        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          lastError = await response.text();
          lastStatus = response.status;
          console.error("Image generation error:", model, response.status, lastError);
          // Quota (429) and permission (403) are per-model on Gemini: try the next one.
          continue;
        }


        const imageData = await response.json();
        usedPredict = isPredict;
        b64 = isPredict
          ? imageData?.predictions?.[0]?.bytesBase64Encoded
          : imageData?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data)?.inlineData?.data;
        if (b64) break;
        lastError = "Aucune image renvoyée par " + model;
        console.error(lastError);
      }

      if (!b64) {
        // Fallback gratuit (sans clé) quand le quota Google image est indisponible
        try {
          const [w, h] = (body.size ?? "1024x1536").split("x").map((n) => parseInt(n, 10));
          const fbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w || 1024}&height=${h || 1536}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
          const fbRes = await fetch(fbUrl);
          if (fbRes.ok) {
            const buf = new Uint8Array(await fbRes.arrayBuffer());
            let bin = "";
            for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
            const fbB64 = btoa(bin);
            console.log("Image generated via fallback provider");
            return new Response(JSON.stringify({ success: true, imageUrl: `data:image/jpeg;base64,${fbB64}`, fallback: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          console.error("Fallback image provider failed:", fbRes.status);
        } catch (e) {
          console.error("Fallback image provider error:", e);
        }

        if (lastStatus === 429) {
          return new Response(JSON.stringify({
            error: "La génération d'images n'est pas incluse dans le quota gratuit de votre clé Google. Activez la facturation sur votre projet Google AI Studio pour l'utiliser.",
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (lastStatus === 403) {
          return new Response(JSON.stringify({ error: "Clé API Gemini invalide ou génération d'images non activée sur ce compte." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "Génération de l'image échouée", details: lastError }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }


      console.log("Image generated via", usedPredict ? "predict" : "generateContent");
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
