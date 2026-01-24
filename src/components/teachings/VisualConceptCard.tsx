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
        <div className="mt-6 flex flex-col items-center">
          {/* Pyramid container */}
          <div className="relative w-full max-w-2xl">
            {/* SVG Pyramid Shape as background */}
            <svg 
              viewBox="0 0 400 300" 
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Pyramid outline */}
              <defs>
                <linearGradient id={`pyramidGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id={`pyramidStroke-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* Main pyramid shape */}
              <polygon
                points="200,20 380,280 20,280"
                fill={`url(#pyramidGradient-${index})`}
                stroke={`url(#pyramidStroke-${index})`}
                strokeWidth="2"
              />
              
              {/* Horizontal level dividers */}
              {concept.elements.map((_, idx) => {
                if (idx === 0) return null;
                const total = concept.elements.length;
                const yPos = 20 + (260 / total) * idx;
                const progress = idx / total;
                const halfWidth = 180 * progress;
                return (
                  <line
                    key={`line-${idx}`}
                    x1={200 - halfWidth}
                    y1={yPos}
                    x2={200 + halfWidth}
                    y2={yPos}
                    stroke="hsl(var(--gold))"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Level labels below pyramid - Full text visible */}
          <div className="w-full mt-6 space-y-2">
            {concept.elements.map((element, idx) => {
              const elementText = typeof element === 'string' ? element : JSON.stringify(element);
              const total = concept.elements.length;
              // Width decreases as we go up (idx 0 = top = smallest)
              const widthPercent = 50 + ((idx / (total - 1 || 1)) * 50);
              
              return (
                <div 
                  key={idx}
                  className="flex justify-center"
                >
                  <div 
                    className={cn(
                      "px-4 py-3 rounded-lg text-center text-sm font-medium",
                      "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/10",
                      "border border-gold/30 text-foreground",
                      "shadow-sm"
                    )}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-gold font-bold mr-2">{idx + 1}.</span>
                    <span className="break-words">{elementText}</span>
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
        <div className="mt-6 flex justify-center">
          <div className="relative">
            {/* Circular container */}
            <div className="w-64 h-64 relative">
              {/* Center circle with refresh icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center z-10">
                <RefreshCw className="w-6 h-6 text-green-600 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              {/* Elements positioned in a circle */}
              {concept.elements.map((element, idx) => {
                const elementText = typeof element === 'string' ? element : JSON.stringify(element);
                const total = concept.elements.length;
                const angle = (idx * 360) / total - 90; // Start from top
                const radius = 100; // Distance from center
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <div
                    key={idx}
                    className="absolute px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-700 font-medium text-center max-w-[90px] whitespace-normal"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {elementText}
                  </div>
                );
              })}
              {/* Connecting arrows (circular path) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  className="text-green-300"
                />
              </svg>
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
                {elementText}
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
                        {elementText}
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