import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Mic,
  BarChart3,
  User,
  Bookmark,
  Shield,
  LogOut,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/interview/new', label: 'New Simulation', icon: Mic },
  { to: '/skills', label: 'Skill Map', icon: Layers },
  { to: '/learning', label: 'Learning Paths', icon: BookOpen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral/5 bg-ink-800 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="signal-bars h-5 text-signal">
          <span /><span /><span /><span /><span />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-paper">
          Interview<span className="text-signal">.AI</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-signal/15 text-signal font-semibold shadow-sm'
                  : 'text-slate-light hover:bg-neutral/5 hover:text-paper'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-signal/15 text-signal' : 'text-slate-light hover:bg-neutral/5 hover:text-paper'
              )
            }
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="pt-4 border-t border-neutral/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-light transition-colors hover:bg-coral/10 hover:text-coral"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
