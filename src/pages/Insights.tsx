import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { InsightCard } from '@/components/insights/InsightCard';
import { insights } from '@/lib/seed-data';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Get unique tags from all insights
const allTags = [...new Set(insights.flatMap(i => i.tags))];

export default function Insights() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  
  const filteredInsights = selectedTag 
    ? insights.filter(i => i.tags.includes(selectedTag))
    : insights;

  return (
    <MainLayout>
      <Header 
        title="Extraits clés" 
        subtitle="Parcourez et gérez les extraits de contenu"
      />
      
      <div className="p-4 md:p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Button 
            variant={selectedTag === null ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            Tous ({insights.length})
          </Button>
          
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setSelectedTag(tag)}
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
            </Button>
          ))}
          
          {isAdmin && (
            <Button variant="outline" size="sm" className="gap-2 ml-auto">
              <SlidersHorizontal className="w-4 h-4" />
              Filtres avancés
            </Button>
          )}
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {filteredInsights.map((insight, index) => (
            <div 
              key={insight.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <InsightCard insight={insight} showConfidence={isAdmin} />
            </div>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Aucun extrait trouvé avec ce filtre.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
