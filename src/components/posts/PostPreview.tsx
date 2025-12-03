import { Post } from '@/lib/seed-data';
import { Instagram, Twitter, Youtube, Facebook, Clock, Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PostPreviewProps {
  post: Post;
  className?: string;
}

const platformIcons = {
  youtube_short: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

const platformColors = {
  youtube_short: 'text-red-500 bg-red-500/10',
  instagram: 'text-pink-500 bg-pink-500/10',
  twitter: 'text-sky-500 bg-sky-500/10',
  facebook: 'text-blue-600 bg-blue-600/10',
};

const platformLabels = {
  youtube_short: 'YouTube Short',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
};

const statusConfig = {
  draft: { icon: Edit2, label: 'Draft', className: 'text-muted-foreground bg-muted' },
  scheduled: { icon: Clock, label: 'Scheduled', className: 'text-accent bg-accent/10' },
  published: { icon: Check, label: 'Published', className: 'text-sage bg-sage/10' },
};

export function PostPreview({ post, className }: PostPreviewProps) {
  const PlatformIcon = platformIcons[post.platform];
  const status = statusConfig[post.status];
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-all duration-200",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
          platformColors[post.platform]
        )}>
          <PlatformIcon className="w-3.5 h-3.5" />
          {platformLabels[post.platform]}
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
          status.className
        )}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-6 mb-3">
        {post.content}
      </div>

      {/* Footer */}
      {(post.scheduledAt || post.publishedAt) && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {post.status === 'scheduled' && post.scheduledAt && (
              <>Scheduled for {format(post.scheduledAt, 'MMM d, yyyy \'at\' h:mm a')}</>
            )}
            {post.status === 'published' && post.publishedAt && (
              <>Published on {format(post.publishedAt, 'MMM d, yyyy \'at\' h:mm a')}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
