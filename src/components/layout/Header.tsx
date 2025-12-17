import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from './MobileSidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

export function Header({ 
  title, 
  subtitle, 
  showAddButton = false, 
  onAddClick,
  addButtonLabel = 'Add New'
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 px-4 md:py-6 md:px-8 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search insights, sources..."
            className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* Add button */}
        {showAddButton && (
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="w-4 h-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
