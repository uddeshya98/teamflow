import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try admin endpoint first, fallback to infer from projects
        let users = [];
        if (isAdmin(user)) {
          const { data } = await api.get('/users');
          users = data.users || [];
        } else {
          // Members can see themselves
          users = user ? [user] : [];
        }
        setMembers(users);

        // Get task counts per user
        const { data: td } = await api.get('/tasks');
        const counts = {};
        (td.tasks || []).forEach(t => {
          const uid = t.assignedTo?._id || t.assignedTo;
          if (uid) counts[uid] = (counts[uid] || 0) + 1;
        });
        setTaskCounts(counts);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>Team</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Manage your team members</p>
        </div>
        {isAdmin(user) && (
          <button style={{
            padding: '10px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
            fontSize: '14px', fontWeight: 600, borderRadius: '10px', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>+ Invite Member</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3].map(i => <Skeleton key={i} className="h-56 bg-[#161b27] rounded-xl" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {members.map(m => (
            <div key={m._id} style={{
              background: '#161b27', borderRadius: '14px', padding: '24px',
              border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s',
              textAlign: 'center',
            }} className="kanban-card">
              {/* Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '22px', fontWeight: 700,
              }}>{getInitials(m.name)}</div>

              <p style={{ color: 'white', fontWeight: 600, fontSize: '17px', marginTop: '12px' }}>{m.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>{m.email}</p>

              {/* Role badge */}
              <div style={{ marginTop: '8px' }}>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                  background: m.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.3)',
                  color: m.role === 'admin' ? '#818cf8' : '#cbd5e1',
                  border: m.role === 'admin' ? '1px solid rgba(99,102,241,0.2)' : 'none',
                }}>{m.role === 'admin' ? 'Admin' : 'Member'}</span>
              </div>

              {/* Task count */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Tasks assigned: {taskCounts[m._id] || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
