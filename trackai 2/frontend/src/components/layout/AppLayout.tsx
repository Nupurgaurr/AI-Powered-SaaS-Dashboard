import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../lib/api';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/dashboard',    icon: '⊞',  label: 'Dashboard'    },
  { to: '/applications', icon: '💼',  label: 'Applications' },
  { to: '/analytics',    icon: '📊',  label: 'Analytics'    },
];

const aiItems = [
  { to: '/ai/resume',    icon: '📄',  label: 'Resume Analyzer'  },
  { to: '/ai/cover',     icon: '✉️',  label: 'Cover Letters'    },
  { to: '/ai/interview', icon: '💡',  label: 'Interview Prep'   },
  { to: '/ai/jd',        icon: '🔍',  label: 'JD Analyzer'      },
  { to: '/ai/match',     icon: '🎯',  label: 'Match Score'      },
];

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const toggleDark = () => {
    setDarkMode((d) => !d);
    document.documentElement.classList.toggle('dark');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      'flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
      mobile ? 'w-full h-full' : 'w-56 h-full hidden lg:flex'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">TrackAI</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">BETA</span>
          </div>
          <div className="text-[10px] text-gray-400">Job Intelligence</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
              isActive
                ? 'bg-brand-50 text-brand-500 font-medium dark:bg-brand-700/20 dark:text-brand-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">AI Tools</p>
        </div>

        {aiItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
              isActive
                ? 'bg-brand-50 text-brand-500 font-medium dark:bg-brand-700/20 dark:text-brand-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Account</p>
        </div>
        <NavLink
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
            isActive
              ? 'bg-brand-50 text-brand-500 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
          )}
        >
          <span>👤</span> Profile
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all">
          <div className="w-6 h-6 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.plan} plan</div>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">TrackAI</span>
          <div className="w-7 h-7 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
