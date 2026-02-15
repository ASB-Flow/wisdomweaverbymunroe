import { ApplicationStep } from '@/lib/teachings-store';
import { renderInlineMarkdown } from '@/lib/markdown-utils';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationStepsProps {
  steps: ApplicationStep[];
}

export function ApplicationSteps({ steps }: ApplicationStepsProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-accent" />
        Étapes d'application
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-lg transition-all",
              "bg-gradient-to-r from-accent/5 to-transparent hover:from-accent/10"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">
              {step.step}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {renderInlineMarkdown(step.action)}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-4 h-4 text-accent" />
                <span>{renderInlineMarkdown(step.outcome)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}