import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/interview/new': 'New Interview',
  '/analytics': 'Analytics',
  '/bookmarks': 'Bookmarks',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

function resolveTitle(pathname: string) {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/interview/session')) return 'Interview Session';
  if (pathname.startsWith('/interview/result')) return 'Interview Result';
  return 'Interview.AI';
}

export default function Topbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);

  return (
    <header className="flex items-center justify-between border-b border-neutral/5 px-8 py-5">
      <h1 className="font-display text-xl font-semibold text-paper">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="rounded-lg p-2 text-slate-light transition-colors hover:bg-neutral/5"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-signal/20 font-display text-sm font-semibold text-signal">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm font-medium text-paper">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
