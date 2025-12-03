import { Link } from 'react-router-dom';
import { Clock, Tag, Sparkles, Play, ExternalLink } from 'lucide-react';
import { Insight, getSourceById, formatTimestamp, getClipByInsightId } from '@/lib/seed-data';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: Insight;
  className?: string;
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const source = getSourceById(insight.sourceId);
  const clip = getClipByInsightId(insight.id);
  
  return (
    <Link 
      to={`/insights/${insight.id}`}
      className={cn("insight-card block group", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {insight.title}
        </h3>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex-shrink-0">
          <Sparkles className="w-3 h-3" />
          {Math.round(insight.confidence * 100)}%
        </div>
      </div>

      {/* Citation */}
      <blockquote className="text-sm text-muted-foreground italic border-l-2 border-accent/30 pl-3 mb-4 line-clamp-2">
        "{insight.citationText}"
      </blockquote>

      {/* Bullets preview */}
      <ul className="space-y-1 mb-4">
        {insight.bullets.slice(0, 2).map((bullet, idx) => (
          <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
            <span className="line-clamp-1">{bullet}</span>
          </li>
        ))}
        {insight.bullets.length > 2 && (
          <li className="text-xs text-muted-foreground pl-3.5">
            +{insight.bullets.length - 2} more points
          </li>
        )}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {source && (
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              {source.title.slice(0, 20)}...
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(insight.citationStartTs)}
          </span>
        </div>
        
        {clip && (
          <div className="flex items-center gap-1 text-xs text-accent font-medium">
            <Play className="w-3 h-3" />
            Clip ready
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {insight.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
