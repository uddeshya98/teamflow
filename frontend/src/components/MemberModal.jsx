import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MemberModal({ isOpen, onClose, project, onMemberAdded, onMemberRemoved }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data.users);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, [isOpen]);

  const memberIds = project?.members?.map((m) => m._id || m) || [];

  const addMember = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { userId });
      onMemberAdded(data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.delete(`/projects/${project._id}/members/${userId}`);
      onMemberRemoved(data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md glass rounded-2xl p-6 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Manage Members</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-light transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {users.map((u) => {
            const isMember = memberIds.includes(u._id);
            return (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-dark">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-medium">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => isMember ? removeMember(u._id) : addMember(u._id)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                    isMember
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-primary/10 text-primary-light hover:bg-primary/20'
                  }`}
                >
                  {isMember ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
