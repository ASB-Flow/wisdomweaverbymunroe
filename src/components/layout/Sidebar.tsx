import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Lightbulb, 
  Calendar, 
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Navigation pour tous les utilisateurs
const userNavItems = [
  { icon: Home, label: 'Accueil', path: '/home' },
  { icon: BookOpen, label: 'Enseignements', path: '/teachings' },
  { icon: Lightbulb, label: 'Citations', path: '/citations' },
];

// Navigation réservée aux admins
const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Video, label: 'Sources', path: '/sources' },
  { icon: Calendar, label: 'Calendrier', path: '/calendar' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, isAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar flex-col transition-all duration-300 ease-in-out sticky top-0 hidden md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-sidebar-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-semibold text-sidebar-foreground">
              Teachings Hub
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Enseignements thématiques</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Items pour tous les utilisateurs */}
        {userNavItems.map((item) => {
          const isActive = location.pathname === item.path;
            
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-link",
                isActive && "nav-link-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
        
        {/* Items réservés aux admins */}
        {isAdmin && adminNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-link",
                isActive && "nav-link-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm text-sidebar-foreground truncate">{user.email}</p>
            {isAdmin && (
              <span className="text-xs text-gold">Admin</span>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-red-400 hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
