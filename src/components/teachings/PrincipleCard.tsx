import { Principle } from '@/lib/teachings-store';
import { Gem, Info } from 'lucide-react';

interface PrincipleCardProps {
  principle: Principle;
  index: number;
}

export function PrincipleCard({ principle, index }: PrincipleCardProps) {
  return (
    <div className="bg-gradient-to-br from-gold/5 to-gold/10 rounded-xl border border-gold/20 p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
          <Gem className="w-4 h-4 text-gold-dark" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-foreground mb-2">
            {principle.name}
          </h4>
          <p className="text-sm text-foreground/80 mb-3">
            {principle.definition}
          </p>
          <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
            <Info className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Importance:</strong> {principle.importance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}