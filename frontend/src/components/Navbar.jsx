import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/kanban':    'Kanban Board',
  '/calendar':  'Calendar',
  '/team':      'Team',
  '/reports':   'Reports',
  '/settings':  'Settings',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  // Match on pathname prefix for project detail pages too
  const title =
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Projects' : 'Dashboard');

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: '220px',
        width: 'calc(100% - 220px)',
        height: '60px',
        background: '#0f1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu size={20} color="#94a3b8" />
        <span style={{ color: 'white', fontWeight: 600, fontSize: '18px', marginLeft: '16px' }}>
          {title}
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '8px 14px',
            width: '240px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            style={{
              background: 'transparent',
              color: '#cbd5e1',
              fontSize: '14px',
              outline: 'none',
              border: 'none',
              width: '100%',
            }}
          />
        </div>

        {/* Bell button */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          className="navbar-bell-btn"
        >
          <Bell size={18} color="#94a3b8" />
        </button>

        {/* User avatar + name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          className="navbar-user-btn"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginLeft: '8px' }}>
            {user?.name}
          </span>
          <ChevronDown size={16} color="#94a3b8" style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </header>
  );
}
