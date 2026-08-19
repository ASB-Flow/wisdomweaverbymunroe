# Wisdom Weaver

Titre du projet (Lovable) : Teachings Hub — Myles Munroe
Description courte (one-liner) : Application qui ingère des enseignements de Myles Munroe, en extrait les idées clés, génère des clips et posts optimisés pour YouTube & réseaux, et offre une bibliothèque consultable avec preuves (source + timestamp).
Objectif produit : Construire un MVP no-code qui ingère vidéos (URL), transcrit automatiquement, segmente en “insights”, génère templates de post (Short, carrousel, quote-card) et permet de publier via intégrations / scheduler.
Utilisateurs cibles : Créateurs de contenu chrétien / leaders, community managers, étudiants en leadership.
Fonctionnalités essentielles (prioritaires) :

Importer source (YouTube URL + métadonnées).

Transcription automatique (via service externe).

Extraction automatique d’insights (titre, 3–5 bullets, citation, timestamp).

Génération automatique de contenus courts : script Short (≤60s), description YouTube, caption X/Instagram, quote-card text.

Génération clip mp4 à partir de la vidéo (start/end).

Dashboard : recherche par tag, filtre par thème (leadership, méditation, loi), aperçu clip + lien source.

Scheduler & publication (YouTube, Buffer/Meta/X) — bouton publish / planifier.
Permissions / Auth : comptes utilisateurs (Admin, Editeur).
Design / Tone : sobre, professionnel, chaleureux ; prioriser lisibilité pour mobile.
Données & modèle (décrire brièvement les entités) : Source, Transcript, Insight, Clip, Post.
Automations : à l’upload d’une URL → transcrire → extraire insights → générer 3 formats post → préparer clip → mettre en file de publication.
Intégrations externes : YouTube API (métadonnées + upload), Whisper/ASR (transcription), ffmpeg (clipper), Canva/PIL (quote-card).
Pages nécessaires : Dashboard, Source detail, Insight detail (with clip & auto-generated posts), Content calendar, Settings (integrations).
Règles éditoriales : toujours inclure source + timestamp ; marquer le niveau de confiance (auto).
Livrables attendus : Prototype fonctionnel (no-code), seed data (5 vidéos + 20 insights), templates de post.
Priorité MVP : ingestion → transcription → extraction → génération post (manual publish).
Notes product owner : utiliser cet extrait comme exemple de contenu et seed data : “Tu ne deviens pas ce que tu entends, tu deviens ce que tu as stocké. Le mot méditer dans la Bible = cud (ruminer).”

Entités principales (champs essentiels) :

Source

id (uuid)

title (string)

url (string)

speaker (string)

published_at (datetime)

duration_seconds (int)

thumbnail_url (string)

platform (enum: youtube, audio, doc)

Transcript

id (uuid)

source_id (relation)

start_ts (float seconds)

end_ts (float seconds)

text (text)

Insight

id (uuid)

source_id (relation)
transcript_ids (list relation)
title (string)
bullets (json array)
citation_text (string)
citation_start_ts (float)
citation_end_ts (float)
tags (string[])
confidence (float 0..1)
created_by (user id)

- Clip
id (uuid)
insight_id (relation)
file_url (string)
start_ts (float)
end_ts (float)
duration (float)

- Post
id (uuid)
insight_id (relation)
platform (enum)
content (text)
status (draft/scheduled/published)
scheduled_at (datetime)
published_at (datetime)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wisdomweaverbymunroe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e805bf4-b477-4659-b11c-2266535ab1da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
