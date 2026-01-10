import { VisualConcept } from '@/lib/teachings-store';
import { cn } from '@/lib/utils';
import { 
  GitBranch, Triangle, RefreshCw, ArrowLeftRight, 
  Clock, Brain, ChevronRight 
} from 'lucide-react';

interface VisualConceptCardProps {
  concept: VisualConcept;
  index: number;
}

const typeIcons = {
  diagram: GitBranch,
  pyramid: Triangle,
  cycle: RefreshCw,
  comparison: ArrowLeftRight,
  timeline: Clock,
  mindmap: Brain,
};

const typeLabels = {
  diagram: 'Diagramme',
  pyramid: 'Pyramide',
  cycle: 'Cycle',
  comparison: 'Comparaison',
  timeline: 'Chronologie',
  mindmap: 'Carte mentale',
};

const typeColors = {
  diagram: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pyramid: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  cycle: 'bg-green-500/10 text-green-600 border-green-500/20',
  comparison: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  timeline: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  mindmap: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

export function VisualConceptCard({ concept, index }: VisualConceptCardProps) {
  const Icon = typeIcons[concept.type] || GitBranch;
  const colorClass = typeColors[concept.type] || typeColors.diagram;

  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          colorClass
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              colorClass
            )}>
              {typeLabels[concept.type]}
            </span>
          </div>
          <h4 className="font-display text-lg font-semibold text-foreground mb-2">
            {concept.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {concept.description}
          </p>
        </div>
      </div>

      {/* Visual representation of elements */}
      {concept.type === 'pyramid' && (
        <div className="mt-4 flex flex-col items-center gap-1">
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div 
                key={idx}
                className={cn(
                  "px-4 py-2 rounded-lg text-center text-sm font-medium transition-all",
                  "bg-gradient-to-r from-gold/20 to-gold/10 text-foreground",
                  idx === 0 && "w-1/3",
                  idx === 1 && "w-1/2",
                  idx === 2 && "w-2/3",
                  idx >= 3 && "w-full"
                )}
                style={{ width: `${40 + (idx * 20)}%` }}
              >
                {elementText}
              </div>
            );
          })}
        </div>
      )}

      {concept.type === 'cycle' && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700">
                  {elementText}
                </div>
                {idx < concept.elements.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
          {concept.elements.length > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-green-600" />
            </div>
          )}
        </div>
      )}

      {(concept.type === 'diagram' || concept.type === 'mindmap') && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div 
                key={idx}
                className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-700 text-center"
              >
                {elementText}
              </div>
            );
          })}
        </div>
      )}

      {concept.type === 'comparison' && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div 
                key={idx}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm text-center border",
                  idx % 2 === 0 
                    ? "bg-purple-500/10 border-purple-500/20 text-purple-700"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                )}
              >
                {elementText}
              </div>
            );
          })}
        </div>
      )}

      {concept.type === 'timeline' && (
        <div className="mt-4 relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rose-200" />
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div key={idx} className="relative flex items-center gap-4 mb-3 last:mb-0">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-rose-600">{idx + 1}</span>
                </div>
                <div className="flex-1 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-700">
                  {elementText}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {concept.explanation && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            💡 {concept.explanation}
          </p>
        </div>
      )}
    </div>
  );
}