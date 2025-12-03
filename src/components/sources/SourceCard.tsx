import { Link } from 'react-router-dom';
import { Play, Clock, Calendar, Lightbulb } from 'lucide-react';
import { Source, formatDuration, getInsightsBySourceId } from '@/lib/seed-data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SourceCardProps {
  source: Source;
  className?: string;
}

export function SourceCard({ source, className }: SourceCardProps) {
  const insights = getInsightsBySourceId(source.id);
  
  return (
    <Link 
      to={`/sources/${source.id}`}
      className={cn(
        "group block bg-card rounded-xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img 
          src={source.thumbnailUrl} 
          alt={source.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-foreground/80 text-primary-foreground text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(source.durationSeconds)}
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-gold">
            <Play className="w-6 h-6 text-accent-foreground ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {source.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">{source.speaker}</p>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(source.publishedAt, 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1 text-accent font-medium">
            <Lightbulb className="w-3.5 h-3.5" />
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
