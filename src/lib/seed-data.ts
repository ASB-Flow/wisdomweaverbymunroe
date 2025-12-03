// Seed data for Teachings Hub MVP

export interface Source {
  id: string;
  title: string;
  url: string;
  speaker: string;
  publishedAt: Date;
  durationSeconds: number;
  thumbnailUrl: string;
  platform: 'youtube' | 'audio' | 'doc';
}

export interface Transcript {
  id: string;
  sourceId: string;
  startTs: number;
  endTs: number;
  text: string;
}

export interface Insight {
  id: string;
  sourceId: string;
  transcriptIds: string[];
  title: string;
  bullets: string[];
  citationText: string;
  citationStartTs: number;
  citationEndTs: number;
  tags: string[];
  confidence: number;
  createdBy: string;
}

export interface Clip {
  id: string;
  insightId: string;
  fileUrl: string;
  startTs: number;
  endTs: number;
  duration: number;
}

export interface Post {
  id: string;
  insightId: string;
  platform: 'youtube_short' | 'instagram' | 'twitter' | 'facebook';
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: Date;
  publishedAt?: Date;
}

// Seed Sources
export const sources: Source[] = [
  {
    id: 'src-1',
    title: 'The Power of Purpose',
    url: 'https://youtube.com/watch?v=example1',
    speaker: 'Myles Munroe',
    publishedAt: new Date('2015-03-15'),
    durationSeconds: 3845,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
    platform: 'youtube',
  },
  {
    id: 'src-2',
    title: 'Understanding the Kingdom',
    url: 'https://youtube.com/watch?v=example2',
    speaker: 'Myles Munroe',
    publishedAt: new Date('2014-08-22'),
    durationSeconds: 4520,
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=225&fit=crop',
    platform: 'youtube',
  },
  {
    id: 'src-3',
    title: 'Keys to Leadership',
    url: 'https://youtube.com/watch?v=example3',
    speaker: 'Myles Munroe',
    publishedAt: new Date('2013-11-10'),
    durationSeconds: 2980,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
    platform: 'youtube',
  },
  {
    id: 'src-4',
    title: 'The Spirit of Meditation',
    url: 'https://youtube.com/watch?v=example4',
    speaker: 'Myles Munroe',
    publishedAt: new Date('2012-06-05'),
    durationSeconds: 5120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=225&fit=crop',
    platform: 'youtube',
  },
  {
    id: 'src-5',
    title: 'Vision and Destiny',
    url: 'https://youtube.com/watch?v=example5',
    speaker: 'Myles Munroe',
    publishedAt: new Date('2011-09-18'),
    durationSeconds: 3670,
    thumbnailUrl: 'https://images.unsplash.com/photo-1492681290082-e932832941e6?w=400&h=225&fit=crop',
    platform: 'youtube',
  },
];

// Seed Insights
export const insights: Insight[] = [
  {
    id: 'ins-1',
    sourceId: 'src-4',
    transcriptIds: ['tr-1', 'tr-2'],
    title: 'Tu deviens ce que tu stockes, pas ce que tu entends',
    bullets: [
      'L\'écoute passive ne transforme pas - c\'est le stockage actif qui change',
      'Méditer dans la Bible signifie "ruminer" (cud) - revenir sur une pensée',
      'La répétition intentionnelle ancre la vérité dans le cœur',
      'Ce que tu stockes détermine ta réponse aux situations',
    ],
    citationText: 'Tu ne deviens pas ce que tu entends, tu deviens ce que tu as stocké. Le mot méditer dans la Bible = cud (ruminer).',
    citationStartTs: 1245.5,
    citationEndTs: 1302.8,
    tags: ['méditation', 'transformation', 'parole'],
    confidence: 0.95,
    createdBy: 'system',
  },
  {
    id: 'ins-2',
    sourceId: 'src-1',
    transcriptIds: ['tr-3'],
    title: 'Le but précède la création',
    bullets: [
      'Dieu définit toujours le but avant de créer',
      'Sans but, l\'existence devient survie au lieu d\'épanouissement',
      'Votre but est la raison de votre naissance',
      'Le plus triste : mourir sans avoir découvert son but',
    ],
    citationText: 'Le but de quelque chose détermine sa nature, son design, et son potentiel.',
    citationStartTs: 890.2,
    citationEndTs: 945.6,
    tags: ['purpose', 'destinée', 'création'],
    confidence: 0.92,
    createdBy: 'system',
  },
  {
    id: 'ins-3',
    sourceId: 'src-2',
    transcriptIds: ['tr-4', 'tr-5'],
    title: 'Le Royaume vs la Religion',
    bullets: [
      'Un royaume a un roi, un territoire, et des lois',
      'La religion cherche Dieu - le Royaume l\'a trouvé',
      'Le Royaume est un gouvernement, pas une religion',
      'Les citoyens du Royaume ont des droits constitutionnels',
    ],
    citationText: 'Le Royaume de Dieu n\'est pas une religion. C\'est un gouvernement avec un Roi qui règne sur un territoire.',
    citationStartTs: 1567.3,
    citationEndTs: 1620.1,
    tags: ['royaume', 'gouvernement', 'spiritualité'],
    confidence: 0.88,
    createdBy: 'system',
  },
  {
    id: 'ins-4',
    sourceId: 'src-3',
    transcriptIds: ['tr-6'],
    title: 'Le leader sert, le boss domine',
    bullets: [
      'Le vrai leadership est serviteur, pas dominateur',
      'Un leader développe d\'autres leaders',
      'L\'influence vraie vient de la valeur ajoutée',
      'Le leadership est une responsabilité, pas un privilège',
    ],
    citationText: 'Le vrai leader ne crée pas des suiveurs, il crée d\'autres leaders.',
    citationStartTs: 678.9,
    citationEndTs: 725.4,
    tags: ['leadership', 'service', 'influence'],
    confidence: 0.94,
    createdBy: 'system',
  },
  {
    id: 'ins-5',
    sourceId: 'src-5',
    transcriptIds: ['tr-7', 'tr-8'],
    title: 'La vision attire les provisions',
    bullets: [
      'La vision est la capacité de voir l\'invisible',
      'Dieu finance ce qu\'Il ordonne',
      'Une vision claire attire les bonnes personnes',
      'Sans vision, le peuple périt (devient indiscipliné)',
    ],
    citationText: 'Quand le but n\'est pas connu, l\'abus est inévitable. La vision donne direction et discipline.',
    citationStartTs: 2134.7,
    citationEndTs: 2189.3,
    tags: ['vision', 'provision', 'destinée'],
    confidence: 0.91,
    createdBy: 'system',
  },
  {
    id: 'ins-6',
    sourceId: 'src-4',
    transcriptIds: ['tr-9'],
    title: 'La méditation biblique transforme',
    bullets: [
      'Méditer = parler à soi-même la Parole',
      'Josué 1:8 - méditer jour et nuit pour prospérer',
      'La méditation n\'est pas vider l\'esprit mais le remplir',
      'Ce sur quoi tu médites te domine',
    ],
    citationText: 'La méditation biblique n\'est pas vider ton esprit. C\'est remplir ton esprit de la Parole jusqu\'à ce qu\'elle devienne toi.',
    citationStartTs: 3456.2,
    citationEndTs: 3512.8,
    tags: ['méditation', 'parole', 'transformation'],
    confidence: 0.96,
    createdBy: 'system',
  },
  {
    id: 'ins-7',
    sourceId: 'src-1',
    transcriptIds: ['tr-10'],
    title: 'Le potentiel non exploité meurt avec toi',
    bullets: [
      'Le cimetière est le lieu le plus riche - rempli de potentiel inexploité',
      'Le potentiel est ce que tu peux faire mais n\'as pas encore fait',
      'Le temps est limité - le potentiel doit être libéré',
      'Mourir vide est le plus grand succès',
    ],
    citationText: 'Le lieu le plus riche de la planète n\'est pas les mines de diamants. C\'est le cimetière. Là reposent des livres jamais écrits, des entreprises jamais lancées.',
    citationStartTs: 2890.4,
    citationEndTs: 2958.1,
    tags: ['potentiel', 'purpose', 'urgence'],
    confidence: 0.93,
    createdBy: 'system',
  },
  {
    id: 'ins-8',
    sourceId: 'src-3',
    transcriptIds: ['tr-11'],
    title: 'Le caractère avant les dons',
    bullets: [
      'Les dons peuvent t\'emmener où le caractère ne peut te maintenir',
      'Le caractère est testé dans les petites choses',
      'La fidélité précède la promotion',
      'Le caractère est qui tu es quand personne ne regarde',
    ],
    citationText: 'Tes dons peuvent t\'ouvrir des portes, mais seul ton caractère peut t\'y garder.',
    citationStartTs: 1890.6,
    citationEndTs: 1934.2,
    tags: ['caractère', 'leadership', 'intégrité'],
    confidence: 0.89,
    createdBy: 'system',
  },
];

// Seed Clips
export const clips: Clip[] = [
  {
    id: 'clip-1',
    insightId: 'ins-1',
    fileUrl: '/clips/meditation-ruminer.mp4',
    startTs: 1245.5,
    endTs: 1302.8,
    duration: 57.3,
  },
  {
    id: 'clip-2',
    insightId: 'ins-2',
    fileUrl: '/clips/purpose-creation.mp4',
    startTs: 890.2,
    endTs: 945.6,
    duration: 55.4,
  },
  {
    id: 'clip-3',
    insightId: 'ins-4',
    fileUrl: '/clips/leadership-service.mp4',
    startTs: 678.9,
    endTs: 725.4,
    duration: 46.5,
  },
];

// Seed Posts
export const posts: Post[] = [
  {
    id: 'post-1',
    insightId: 'ins-1',
    platform: 'instagram',
    content: '✨ Tu ne deviens pas ce que tu ENTENDS...\nTu deviens ce que tu STOCKES.\n\n📖 Le mot "méditer" dans la Bible vient de "cud" - ruminer.\n\nComme une vache qui rumine, nous devons revenir encore et encore sur la Parole jusqu\'à ce qu\'elle fasse partie de nous.\n\n💡 Ce n\'est pas l\'information qui transforme, c\'est la méditation.\n\n#MylesMonroe #Méditation #Transformation #Foi #Leadership',
    status: 'draft',
  },
  {
    id: 'post-2',
    insightId: 'ins-1',
    platform: 'twitter',
    content: '"Tu ne deviens pas ce que tu entends, tu deviens ce que tu as stocké."\n\nLe mot méditer dans la Bible = "cud" (ruminer)\n\nL\'écoute passive ≠ transformation\nLa méditation active = changement profond\n\n— Myles Munroe',
    status: 'scheduled',
    scheduledAt: new Date('2024-12-04T09:00:00'),
  },
  {
    id: 'post-3',
    insightId: 'ins-2',
    platform: 'youtube_short',
    content: '[Script Short - 55s]\n\n🎬 HOOK (0-5s):\n"Le plus triste n\'est pas de mourir... c\'est de mourir sans avoir vécu."\n\n📍 PROBLÈME (5-15s):\n"Beaucoup existent sans vraiment vivre. Pourquoi? Ils n\'ont jamais découvert leur BUT."\n\n💡 SOLUTION (15-40s):\n"Dieu définit toujours le but AVANT de créer. Votre existence a une raison. Le but de quelque chose détermine sa nature, son design, et son potentiel."\n\n🔥 CTA (40-55s):\n"Arrêtez de survivre. Commencez à vivre. Découvrez votre but aujourd\'hui."',
    status: 'draft',
  },
  {
    id: 'post-4',
    insightId: 'ins-4',
    platform: 'instagram',
    content: '👑 BOSS vs LEADER\n\nLe boss dit "Allez!"\nLe leader dit "Allons-y!"\n\nLe boss crée des suiveurs.\nLe vrai leader crée d\'AUTRES LEADERS.\n\n"Le vrai leadership est serviteur, pas dominateur."\n— Myles Munroe\n\nQuel type de leader voulez-vous devenir?\n\n#Leadership #MylesMonroe #LeadershipDevelopment #Inspiration #GrowthMindset',
    status: 'published',
    publishedAt: new Date('2024-12-01T14:30:00'),
  },
  {
    id: 'post-5',
    insightId: 'ins-7',
    platform: 'twitter',
    content: 'Le lieu le plus RICHE de la planète?\n\nPas les mines de diamants.\nPas Wall Street.\n\nC\'est le CIMETIÈRE.\n\nLà reposent:\n📚 Livres jamais écrits\n🏢 Entreprises jamais lancées\n🎵 Chansons jamais composées\n\nNe meurs pas PLEIN.\nMeurs VIDE.\n\n— Myles Munroe',
    status: 'scheduled',
    scheduledAt: new Date('2024-12-05T18:00:00'),
  },
];

// Helper functions
export function getSourceById(id: string): Source | undefined {
  return sources.find(s => s.id === id);
}

export function getInsightsBySourceId(sourceId: string): Insight[] {
  return insights.filter(i => i.sourceId === sourceId);
}

export function getClipByInsightId(insightId: string): Clip | undefined {
  return clips.find(c => c.insightId === insightId);
}

export function getPostsByInsightId(insightId: string): Post[] {
  return posts.filter(p => p.insightId === insightId);
}

export function getInsightById(id: string): Insight | undefined {
  return insights.find(i => i.id === id);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Stats
export function getStats() {
  return {
    totalSources: sources.length,
    totalInsights: insights.length,
    totalClips: clips.length,
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
  };
}
