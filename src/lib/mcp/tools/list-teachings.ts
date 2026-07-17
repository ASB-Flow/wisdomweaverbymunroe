import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_teachings",
  title: "Lister les enseignements",
  description:
    "Liste les enseignements publiés (titre, thème, id, date). Filtre optionnel par thème ou recherche textuelle sur le titre.",
  inputSchema: {
    theme: z.string().optional().describe("Filtrer par thème (ex: meditation, leadership, purpose)."),
    search: z.string().optional().describe("Recherche textuelle dans le titre."),
    limit: z.number().int().min(1).max(50).optional().describe("Nombre max de résultats (défaut 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ theme, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Authentification requise." }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("teachings")
      .select("id, title_fr, theme, status, created_at, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (theme) q = q.eq("theme", theme);
    if (search) q = q.ilike("title_fr", `%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { teachings: data ?? [] },
    };
  },
});
