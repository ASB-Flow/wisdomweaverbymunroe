import { PracticalTip } from '@/lib/teachings-store';
import { cn } from '@/lib/utils';
import { Lightbulb, Target, Star, Heart, Book, Compass } from 'lucide-react';

interface PracticalTipCardProps {
  tip: PracticalTip;
  index: number;
}

const tipIcons = {
  lightbulb: Lightbulb,
  target: Target,
  star: Star,
  heart: Heart,
  book: Book,
  compass: Compass,
};

const tipColors = {
  lightbulb: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  target: 'bg-red-500/10 text-red-600 border-red-500/20',
  star: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  heart: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  book: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  compass: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
};

export function PracticalTipCard({ tip, index }: PracticalTipCardProps) {
  const Icon = tipIcons[tip.icon] || Lightbulb;
  const colorClass = tipColors[tip.icon] || tipColors.lightbulb;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all hover:border-gold/30">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0",
          colorClass
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {tip.tip}
          </h4>
          <p className="text-sm text-muted-foreground">
            {tip.application}
          </p>
        </div>
      </div>
    </div>
  );
}