import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Columns2,
  Calendar, Users, BarChart2, Settings, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderOpen },
  { to: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { to: '/kanban',    label: 'Kanban Board', icon: Columns2 },
  { to: '/calendar',  label: 'Calendar',  icon: Calendar },
  { to: '/team',      label: 'Team',      icon: Users },
  { to: '/reports',   label: 'Reports',   icon: BarChart2 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];


export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(4px)', zIndex: 35,
          }}
          className="lg:hidden"
        />
      )}
      
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '28px', height: '28px',
            background: '#4f46e5',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={14} color="white" fill="white" />
        </div>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '17px', marginLeft: '8px', lineHeight: 1 }}>
          TeamFlow <span style={{ fontSize: '14px' }}>⚡</span>
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              gap: '12px',
              marginBottom: '2px',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#818cf8' : '#6b7280',
            })}
            className="sidebar-nav-item"
          >
            {({ isActive }) => (
              <>
                <Icon size={18} color={isActive ? '#818cf8' : '#6b7280'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ marginTop: 'auto', padding: '16px' }}>
        <button
          onClick={logout}
          className="sidebar-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            color: '#6b7280',
            fontSize: '14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.15s',
            fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
