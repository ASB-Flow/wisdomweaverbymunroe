import { BookOpen, Lightbulb } from 'lucide-react';
import { renderInlineMarkdown } from '@/lib/markdown-utils';

interface Story {
  title: string;
  story: string;
  lesson: string;
}

interface StoryCardProps {
  story: Story;
  index: number;
}

export function StoryCard({ story, index }: StoryCardProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Story section */}
      <div className="p-4 md:p-5 bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <h4 className="font-display text-base font-semibold text-foreground">
            {renderInlineMarkdown(story.title)}
          </h4>
        </div>
        <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed pl-11">
          {renderInlineMarkdown(story.story)}
        </div>
      </div>

      {/* Lesson section */}
      <div className="p-4 md:p-5 bg-accent/5 border-t border-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Leçon</p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {renderInlineMarkdown(story.lesson)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
