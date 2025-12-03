import { Post, getInsightById } from '@/lib/seed-data';
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CalendarPostProps {
  post: Post;
}

const platformIcons = {
  youtube_short: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

const platformColors = {
  youtube_short: 'border-l-red-500 bg-red-500/5',
  instagram: 'border-l-pink-500 bg-pink-500/5',
  twitter: 'border-l-sky-500 bg-sky-500/5',
  facebook: 'border-l-blue-600 bg-blue-600/5',
};

export function CalendarPost({ post }: CalendarPostProps) {
  const insight = getInsightById(post.insightId);
  const PlatformIcon = platformIcons[post.platform];
  const time = post.scheduledAt ? format(post.scheduledAt, 'h:mm a') : 
               post.publishedAt ? format(post.publishedAt, 'h:mm a') : '';

  return (
    <div className={cn(
      "p-3 rounded-lg border-l-4 mb-2 cursor-pointer hover:shadow-sm transition-shadow",
      platformColors[post.platform]
    )}>
      <div className="flex items-center gap-2 mb-1">
        <PlatformIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{time}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {insight?.title || 'Untitled insight'}
      </p>
    </div>
  );
}
