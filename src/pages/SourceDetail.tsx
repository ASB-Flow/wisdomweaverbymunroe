import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { InsightCard } from '@/components/insights/InsightCard';
import { getSourceById, getInsightsBySourceId, formatDuration } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  Clock, 
  ExternalLink,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function SourceDetail() {
  const { id } = useParams<{ id: string }>();
  const source = getSourceById(id || '');
  const insights = getInsightsBySourceId(id || '');

  if (!source) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-display font-semibold mb-2">Source not found</h1>
            <Link to="/sources">
              <Button variant="outline">Back to Sources</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header 
        title={source.title}
        subtitle={source.speaker}
      />
      
      <div className="p-8">
        {/* Back button */}
        <Link to="/sources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Sources
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-6">
              <img 
                src={source.thumbnailUrl} 
                alt={source.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-gold hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-accent-foreground ml-1" />
                </button>
              </div>
            </div>

            {/* Insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">
                  Extracted Insights ({insights.length})
                </h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Re-extract
                </Button>
              </div>
              
              {insights.length > 0 ? (
                <div className="grid gap-4">
                  {insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-secondary/30 rounded-xl">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No insights extracted yet.</p>
                  <Button variant="gold" className="mt-4">
                    Extract Insights Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="animate-slide-up">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-8">
              <h3 className="font-display text-lg font-semibold mb-4">Source Details</h3>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Speaker</dt>
                  <dd className="font-medium">{source.speaker}</dd>
                </div>
                
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatDuration(source.durationSeconds)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Published</dt>
                  <dd className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {format(source.publishedAt, 'MMMM d, yyyy')}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Platform</dt>
                  <dd className="font-medium capitalize">{source.platform}</dd>
                </div>
              </dl>

              <div className="mt-6 pt-6 border-t border-border">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent hover:underline text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
