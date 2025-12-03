import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-semibold mt-1 text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              trend.isPositive ? "text-sage" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent" />
        </div>
      </div>
    </div>
  );
}
