import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { PostPreview } from '@/components/posts/PostPreview';
import { 
  getInsightById, 
  getSourceById, 
  getClipByInsightId, 
  getPostsByInsightId,
  formatTimestamp 
} from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  ExternalLink,
  Tag,
  Sparkles,
  Copy,
  RefreshCw,
  Plus,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InsightDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const insight = getInsightById(id || '');
  const source = insight ? getSourceById(insight.sourceId) : undefined;
  const clip = insight ? getClipByInsightId(insight.id) : undefined;
  const posts = insight ? getPostsByInsightId(insight.id) : [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  if (!insight || !source) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-display font-semibold mb-2">Insight not found</h1>
            <Link to="/insights">
              <Button variant="outline">Back to Insights</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header 
        title="Insight Detail"
        subtitle={source.title}
      />
      
      <div className="p-8">
        {/* Back button */}
        <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Insights
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            {/* Insight Header */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  {insight.title}
                </h1>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                  {Math.round(insight.confidence * 100)}% confidence
                </div>
              </div>

              {/* Citation */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <blockquote className="text-lg italic text-foreground/90 mb-3">
                  "{insight.citationText}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(insight.citationStartTs)} - {formatTimestamp(insight.citationEndTs)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => copyToClipboard(insight.citationText)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Key Points */}
              <div className="mb-6">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {insight.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-foreground/90">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <span key={tag} className="tag-gold">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Clip Section */}
            {clip ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Video Clip</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>
                  </div>
                </div>
                
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={source.thumbnailUrl} 
                    alt="Clip preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <button className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-gold hover:scale-105 transition-transform">
                      <Play className="w-7 h-7 text-accent-foreground ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-foreground/80 text-primary-foreground text-xs font-medium">
                    {Math.round(clip.duration)}s
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No clip generated yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a video clip from this insight's timestamp
                </p>
                <Button variant="gold">Generate Clip</Button>
              </div>
            )}

            {/* Generated Posts */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Generated Posts</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Generate New
                </Button>
              </div>
              
              {posts.length > 0 ? (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <PostPreview key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No posts generated yet</p>
                  <Button variant="gold">Generate Posts</Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="animate-slide-up">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-8">
              <h3 className="font-display text-lg font-semibold mb-4">Source Info</h3>
              
              <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <img 
                  src={source.thumbnailUrl} 
                  alt={source.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h4 className="font-medium text-foreground mb-1">{source.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{source.speaker}</p>

              <div className="space-y-3 pt-4 border-t border-border">
                <Link to={`/sources/${source.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    View Full Source
                  </Button>
                </Link>
                
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Original
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
