import { VisualConcept } from '@/lib/teachings-store';
import { cn } from '@/lib/utils';
import { renderInlineMarkdown } from '@/lib/markdown-utils';
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
            {renderInlineMarkdown(concept.title)}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {renderInlineMarkdown(concept.description)}
          </p>
        </div>
      </div>

      {/* Visual representation of elements */}
      {concept.type === 'pyramid' && concept.elements && concept.elements.length > 0 && (
        <div className="mt-6 flex flex-col items-center w-full">
          {/* Pyramid levels - each level gets progressively wider */}
          <div className="w-full max-w-2xl space-y-1">
            {concept.elements.map((element, idx) => {
              const elementText = typeof element === 'string' ? element : JSON.stringify(element);
              const total = concept.elements.length;
              // Width increases from top (smallest) to bottom (largest)
              // First element (idx=0) = top = smallest width
              const minWidth = 30;
              const maxWidth = 100;
              const widthPercent = total === 1 
                ? maxWidth 
                : minWidth + ((idx / (total - 1)) * (maxWidth - minWidth));
              
              return (
                <div 
                  key={idx}
                  className="flex justify-center"
                >
                  <div 
                    className={cn(
                      "px-4 py-3 text-center text-sm font-medium",
                      "bg-gradient-to-b from-gold/30 to-gold/15",
                      "border-l-2 border-r-2 border-gold/40",
                      "text-foreground",
                      idx === 0 && "rounded-t-xl border-t-2",
                      idx === total - 1 && "rounded-b-xl border-b-2"
                    )}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-gold font-bold mr-2">{idx + 1}.</span>
                    <span className="break-words">{renderInlineMarkdown(elementText)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Triangle className="w-3 h-3 text-gold" />
            <span>Du sommet (priorité haute) à la base (fondation)</span>
          </div>
        </div>
      )}

      {concept.type === 'cycle' && (
        <div className="mt-6">
          {/* Vertical list layout for cycle - avoids overlapping */}
          <div className="space-y-3">
            {concept.elements.map((element, idx) => {
              const elementText = typeof element === 'string' ? element : JSON.stringify(element);
              const total = concept.elements.length;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">{idx + 1}</span>
                    </div>
                    {idx < total - 1 && (
                      <div className="w-0.5 h-4 bg-green-300 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-700 font-medium">
                    {renderInlineMarkdown(elementText)}
                  </div>
                  {idx < total - 1 && (
                    <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0 rotate-90" />
                  )}
                </div>
              );
            })}
            {/* Loop indicator */}
            <div className="flex items-center gap-2 justify-center text-xs text-green-600">
              <RefreshCw className="w-4 h-4" />
              <span>Le cycle se répète</span>
            </div>
          </div>
        </div>
      )}

      {concept.type === 'diagram' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {concept.elements.map((element, idx) => {
            const elementText = typeof element === 'string' ? element : JSON.stringify(element);
            return (
              <div 
                key={idx}
                className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-700 text-center"
              >
                {renderInlineMarkdown(elementText)}
              </div>
            );
          })}
        </div>
      )}

      {concept.type === 'mindmap' && (
        <div className="mt-4">
          {/* Mindmap with branching structure */}
          <div className="flex flex-col items-center">
            {/* Central node */}
            <div className="px-4 py-2 bg-cyan-500/20 border-2 border-cyan-500/40 rounded-full text-sm font-semibold text-cyan-700 mb-4">
              {concept.title}
            </div>
            {/* Branches */}
            <div className="relative w-full">
              {/* Vertical connector line */}
              <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-cyan-300 -translate-x-1/2" />
              {/* Horizontal connector line */}
              <div className="absolute left-1/4 right-1/4 top-4 h-0.5 bg-cyan-300" />
              {/* Branch nodes */}
              <div className="flex justify-around pt-6">
                {concept.elements.map((element, idx) => {
                  const elementText = typeof element === 'string' ? element : JSON.stringify(element);
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Vertical line to node */}
                      <div className="w-0.5 h-4 bg-cyan-300 mb-1" />
                      {/* Leaf node */}
                      <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-700 text-center max-w-[100px]">
                        {renderInlineMarkdown(elementText)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                {renderInlineMarkdown(elementText)}
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
                  {renderInlineMarkdown(elementText)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {concept.explanation && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            💡 {renderInlineMarkdown(concept.explanation)}
          </p>
        </div>
      )}
    </div>
  );
}