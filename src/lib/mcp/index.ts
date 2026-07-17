import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listTeachings from "./tools/list-teachings";
import getTeaching from "./tools/get-teaching";
import listFavorites from "./tools/list-favorites";
import toggleFavorite from "./tools/toggle-favorite";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "teachings-hub-mcp",
  title: "Teachings Hub MCP",
  version: "0.1.0",
  instructions:
    "Outils pour la plateforme d'enseignements. Permet de lister et lire les enseignements publiés, gérer les favoris de l'utilisateur connecté.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listTeachings, getTeaching, listFavorites, toggleFavorite],
});
