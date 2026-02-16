import { MainLayout } from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Quote, BookOpen, ArrowRight } from 'lucide-react';
import { useTeachings, themes } from '@/hooks/useTeachings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface CitationItem {
  text: string;
  context?: string;
  teachingId: string;
  teachingTitle: string;
  theme: string;
}

export default function Citations() {
  const { teachings, isLoading } = useTeachings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Extract all citations from teachings
  const allCitations: CitationItem[] = teachings.flatMap(teaching => {
    const citations = teaching.citations || [];
    return citations.map((c: any) => ({
      text: typeof c === 'string' ? c : c.text || '',
      context: typeof c === 'string' ? undefined : c.context,
      teachingId: teaching.id,
      teachingTitle: teaching.titleFr,
      theme: teaching.theme,
    }));
  }).filter(c => c.text.length > 0);

  const filteredCitations = allCitations.filter(c => {
    const matchesSearch = !searchQuery || 
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teachingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = !selectedTheme || c.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  // Get unique themes that have citations
  const themesWithCitations = [...new Set(allCitations.map(c => c.theme))];

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Citations</h1>
          <p className="text-muted-foreground mt-1">
            Les citations marquantes extraites des enseignements
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une citation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm text-muted-foreground mr-2">Thème :</span>
            <Button
              variant={selectedTheme === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTheme(null)}
            >
              Tous ({allCitations.length})
            </Button>
            {themesWithCitations.map(themeId => {
              const label = themes.find(t => t.id === themeId)?.label || themeId;
              const count = allCitations.filter(c => c.theme === themeId).length;
              return (
                <Button
                  key={themeId}
                  variant={selectedTheme === themeId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTheme(themeId)}
                >
                  {label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Citations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredCitations.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery || selectedTheme
                ? "Aucune citation trouvée pour ces critères."
                : "Aucune citation disponible."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCitations.map((citation, index) => {
              const themeLabel = themes.find(t => t.id === citation.theme)?.label || citation.theme;
              return (
                <div
                  key={`${citation.teachingId}-${index}`}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-soft transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <blockquote className="text-foreground italic border-l-2 border-accent/40 pl-4 mb-4 leading-relaxed">
                    "{citation.text}"
                  </blockquote>

                  {citation.context && (
                    <p className="text-sm text-muted-foreground mb-4 pl-4">
                      💡 {citation.context}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <BookOpen className="w-3 h-3" />
                        {themeLabel}
                      </Badge>
                    </div>
                    <Link
                      to={`/teachings/${citation.teachingId}`}
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                      {citation.teachingTitle.length > 30
                        ? citation.teachingTitle.slice(0, 30) + '…'
                        : citation.teachingTitle}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
