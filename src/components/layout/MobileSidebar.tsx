import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Lightbulb, 
  Calendar, 
  Settings,
  BookOpen,
  LogOut,
  Home,
  Menu,
  Wand2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const userNavItems = [
  { icon: Home, label: 'Accueil', path: '/home' },
  { icon: BookOpen, label: 'Enseignements', path: '/teachings' },
  { icon: Lightbulb, label: 'Citations', path: '/citations' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Video, label: 'Sources', path: '/sources' },
  { icon: Wand2, label: 'Rédaction', path: '/compose' },
  { icon: Calendar, label: 'Calendrier', path: '/calendar' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, isAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-sidebar-foreground" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-semibold text-sidebar-foreground">
              Teachings Hub
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Enseignements thématiques</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {userNavItems.map((item) => {
            const isActive = location.pathname === item.path;
              
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  "nav-link",
                  isActive && "nav-link-active"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
          
          {isAdmin && adminNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={cn(
                  "nav-link",
                  isActive && "nav-link-active"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border space-y-2 bg-sidebar">
          {user && (
            <div className="px-3 py-2">
              <p className="text-sm text-sidebar-foreground truncate">{user.email}</p>
              {isAdmin && (
                <span className="text-xs text-gold">Admin</span>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-red-400 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
