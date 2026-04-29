import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    const buildNotifications = async () => {
      try {
        const tasksRes = await api.get('/tasks');
        const tasks = tasksRes.data.tasks || tasksRes.data.data || tasksRes.data || [];
        
        const notifs = [];
        
        tasks.forEach(task => {
          if (task.dueDate && task.status !== 'done') {
            const due = new Date(task.dueDate);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            today.setHours(0,0,0,0);
            tomorrow.setHours(0,0,0,0);
            const dueDay = new Date(due);
            dueDay.setHours(0,0,0,0);

            // Overdue check
            if (dueDay < today) {
              notifs.push({
                id: `overdue-${task._id}`,
                type: 'overdue',
                icon: '🔴',
                title: 'Task Overdue',
                message: `"${task.title}" is past its deadline`,
                time: task.dueDate,
                read: false,
                link: `/projects/${task.project?._id || task.project}`
              });
            }
            // Due tomorrow check
            else if (dueDay.getTime() === tomorrow.getTime()) {
              notifs.push({
                id: `due-${task._id}`,
                type: 'due_soon',
                icon: '⚠️',
                title: 'Due Tomorrow',
                message: `"${task.title}" is due tomorrow`,
                time: task.dueDate,
                read: false,
                link: `/projects/${task.project?._id || task.project}`
              });
            }
          }
        });

        notifs.push({
          id: 'welcome',
          type: 'info',
          icon: '👋',
          title: 'Welcome to TeamFlow',
          message: 'Your workspace is ready. Create your first task!',
          time: new Date().toISOString(),
          read: true,
          link: '/dashboard'
        });
        
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch(e) {
        console.error('Notification error:', e);
      }
    };
    buildNotifications();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get(`/tasks?search=${query}`),
          api.get(`/projects?search=${query}`)
        ]);
        const tasks = (tasksRes.data.tasks || tasksRes.data.data || tasksRes.data || [])
          .filter(t => t.title?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map(t => ({ ...t, _type: 'task' }));
        const projects = (projectsRes.data.projects || projectsRes.data.data || projectsRes.data || [])
          .filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(p => ({ ...p, _type: 'project' }));
        setResults([...tasks, ...projects]);
        setShowResults(true);
      } catch(e) {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenNotifs = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    }
  };

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
        <div ref={searchRef} style={{ position:'relative' }}>
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
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query && setShowResults(true)}
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
          {searching && (
            <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
              <div style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
            </div>
          )}
          
          {showResults && (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', left:0,
              width:'360px', background:'#1e2538',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'12px', overflow:'hidden',
              boxShadow:'0 20px 40px rgba(0,0,0,0.5)', zIndex:100
            }}>
              {results.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', color:'#64748b', fontSize:'14px' }}>
                  No results for "{query}"
                </div>
              ) : (
                <>
                  {results.filter(r => r._type === 'task').length > 0 && (
                    <div>
                      <div style={{ padding:'8px 16px', fontSize:'11px', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        Tasks
                      </div>
                      {results.filter(r => r._type === 'task').map(task => (
                        <div key={task._id}
                          onClick={() => {
                            navigate(`/projects/${task.project?._id || task.project}`);
                            setShowResults(false); setQuery('');
                          }}
                          style={{ padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
                            background: task.priority==='high' ? '#ef4444' : task.priority==='medium' ? '#f59e0b' : '#10b981'
                          }} />
                          <div>
                            <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:500 }}>{task.title}</div>
                            <div style={{ color:'#64748b', fontSize:'11px', marginTop:2 }}>
                              {task.project?.title || 'Task'}
                            </div>
                          </div>
                          <div style={{ marginLeft:'auto', fontSize:'11px',
                            color: task.status==='done' ? '#10b981' : task.status==='in-progress' ? '#60a5fa' : '#94a3b8'
                          }}>{task.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.filter(r => r._type === 'project').length > 0 && (
                    <div>
                      <div style={{ padding:'8px 16px', fontSize:'11px', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        Projects
                      </div>
                      {results.filter(r => r._type === 'project').map(proj => (
                        <div key={proj._id}
                          onClick={() => {
                            navigate(`/projects/${proj._id}`);
                            setShowResults(false); setQuery('');
                          }}
                          style={{ padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          <div style={{ width:28, height:28, borderRadius:6, flexShrink:0, background:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#818cf8' }}>
                            📁
                          </div>
                          <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:500 }}>{proj.title}</div>
                          <div style={{ marginLeft:'auto', fontSize:'11px', color:'#64748b' }}>
                            {proj.members?.length || 0} members
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', cursor:'pointer', color:'#818cf8', fontSize:'12px' }}
                    onClick={() => { navigate('/tasks'); setShowResults(false); setQuery(''); }}>
                    View all tasks →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bell button */}
        <div ref={notifRef} style={{ position:'relative' }}>
          
          <button onClick={handleOpenNotifs}
            style={{ position:'relative', width:38, height:38,
                     borderRadius:'50%', background:'rgba(255,255,255,0.06)',
                     border:'1px solid rgba(255,255,255,0.08)',
                     cursor:'pointer', display:'flex', alignItems:'center',
                     justifyContent:'center', color:'#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
          >
            🔔
            {unreadCount > 0 && (
              <div style={{
                position:'absolute', top:-3, right:-3,
                width:18, height:18, borderRadius:'50%',
                background:'#ef4444', color:'white',
                fontSize:'10px', fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
                border:'2px solid #0f1117'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          
          {showNotifs && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              width:360, background:'#1e2538',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:14, overflow:'hidden', zIndex:100,
              boxShadow:'0 20px 50px rgba(0,0,0,0.6)'
            }}>
              <div style={{ padding:'14px 16px',
                            borderBottom:'1px solid rgba(255,255,255,0.06)',
                            display:'flex', justifyContent:'space-between',
                            alignItems:'center' }}>
                <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'14px' }}>
                  Notifications
                </span>
                <span style={{ color:'#64748b', fontSize:'12px' }}>
                  {notifications.filter(n=>!n.read).length === 0 
                    ? 'All caught up ✓' 
                    : `${notifications.filter(n=>!n.read).length} unread`}
                </span>
              </div>
              
              <div style={{ maxHeight:380, overflowY:'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding:'40px 20px', textAlign:'center' }}>
                    <div style={{ fontSize:'32px', marginBottom:8 }}>🔔</div>
                    <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:500 }}>
                      No notifications
                    </div>
                    <div style={{ color:'#64748b', fontSize:'12px', marginTop:4 }}>
                      You're all caught up!
                    </div>
                  </div>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={notif.id}
                      onClick={() => { navigate(notif.link); setShowNotifs(false); }}
                      style={{
                        padding:'14px 16px', cursor:'pointer',
                        display:'flex', gap:12, alignItems:'flex-start',
                        borderBottom:'1px solid rgba(255,255,255,0.04)',
                        background: notif.read ? 'transparent' : 'rgba(99,102,241,0.05)',
                        borderLeft: notif.read 
                          ? '3px solid transparent' 
                          : `3px solid ${notif.type==='overdue' ? '#ef4444' 
                              : notif.type==='due_soon' ? '#f59e0b' : '#6366f1'}`
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background=
                        notif.read ? 'transparent' : 'rgba(99,102,241,0.05)'}
                    >
                      <div style={{ fontSize:'20px', flexShrink:0, marginTop:2 }}>
                        {notif.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>
                          {notif.title}
                        </div>
                        <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:2,
                                      overflow:'hidden', textOverflow:'ellipsis',
                                      whiteSpace:'nowrap' }}>
                          {notif.message}
                        </div>
                        <div style={{ color:'#475569', fontSize:'11px', marginTop:4 }}>
                          {notif.time 
                            ? new Date(notif.time).toLocaleDateString('en-US', 
                                { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
                            : 'Just now'}
                        </div>
                      </div>
                      {!notif.read && (
                        <div style={{ width:8, height:8, borderRadius:'50%',
                                      background:'#6366f1', flexShrink:0, marginTop:4 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ padding:'10px 16px',
                            borderTop:'1px solid rgba(255,255,255,0.06)',
                            textAlign:'center' }}>
                <span onClick={() => { navigate('/tasks'); setShowNotifs(false); }}
                  style={{ color:'#818cf8', fontSize:'12px', cursor:'pointer',
                           fontWeight:500 }}>
                  View all tasks →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User avatar + name */}
        <div ref={userMenuRef} style={{ position:'relative' }}>
          
          <div onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display:'flex', alignItems:'center', gap:8,
                     padding:'6px 12px', borderRadius:10, cursor:'pointer',
                     background: showUserMenu ? 'rgba(255,255,255,0.08)' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
            onMouseLeave={e => !showUserMenu && (e.currentTarget.style.background='transparent')}
          >
            {/* Avatar circle */}
            <div style={{ width:32, height:32, borderRadius:'50%',
                          background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color:'white', fontSize:'12px', fontWeight:700 }}>
              {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600,
                             lineHeight:'1.2' }}>{user?.name}</span>
              <span style={{ color:'#64748b', fontSize:'11px' }}>{user?.role}</span>
            </div>
            {/* ChevronDown icon */}
            <span style={{ color:'#64748b', fontSize:'12px',
                           transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
                           transition:'transform 0.2s' }}>▾</span>
          </div>
          
          {showUserMenu && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'#1e2538', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:12, overflow:'hidden', zIndex:100, minWidth:220,
              boxShadow:'0 20px 40px rgba(0,0,0,0.5)'
            }}>
              {/* User info header */}
              <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%',
                                background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:'white', fontSize:'14px', fontWeight:700 }}>
                    {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div>
                    <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:600 }}>
                      {user?.name}
                    </div>
                    <div style={{ color:'#64748b', fontSize:'12px' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ marginTop:10 }}>
                  <span style={{ 
                    fontSize:'11px', fontWeight:600, padding:'3px 10px',
                    borderRadius:20,
                    background: user?.role === 'admin' 
                      ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.2)',
                    color: user?.role === 'admin' ? '#818cf8' : '#94a3b8',
                    border: `1px solid ${user?.role === 'admin' 
                      ? 'rgba(99,102,241,0.3)' : 'rgba(100,116,139,0.3)'}`
                  }}>
                    {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
                  </span>
                </div>
              </div>
              
              {/* Menu items */}
              {[
                { icon:'⚙️', label:'Settings', action: () => { navigate('/settings'); setShowUserMenu(false); } },
                { icon:'👥', label:'Team', action: () => { navigate('/team'); setShowUserMenu(false); } },
              ].map(item => (
                <button key={item.label}
                  onClick={item.action}
                  style={{ width:'100%', padding:'11px 16px', background:'none',
                           border:'none', color:'#cbd5e1', fontSize:'13px',
                           cursor:'pointer', textAlign:'left',
                           display:'flex', alignItems:'center', gap:10,
                           borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              
              {/* Logout */}
              <button
                onClick={() => { logout(); navigate('/login'); setShowUserMenu(false); }}
                style={{ width:'100%', padding:'11px 16px', background:'none',
                         border:'none', color:'#f87171', fontSize:'13px',
                         cursor:'pointer', textAlign:'left',
                         display:'flex', alignItems:'center', gap:10 }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
