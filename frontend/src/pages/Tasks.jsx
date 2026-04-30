import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { formatDate, isOverdue } from '../utils/formatDate';
import { MoreVertical } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All',         value: '' },
  { label: 'To Do',       value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done',        value: 'done' },
];

const priorityConfig = {
  high:   { bg: 'rgba(239,68,68,0.1)',    text: '#f87171', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)',   text: '#fbbf24', dot: '#f59e0b' },
  low:    { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80', dot: '#22c55e' },
};

const statusConfig = {
  'todo':        { bg: 'rgba(100,116,139,0.3)', text: '#cbd5e1', label: 'To Do'       },
  'in-progress': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'In Progress' },
  'done':        { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', label: 'Done'        },
};

function PriorityBadge({ priority = 'medium' }) {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.text, fontSize: '12px', fontWeight: 500,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function StatusBadge({ status = 'todo' }) {
  const cfg = statusConfig[status] || statusConfig.todo;
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.text, fontSize: '12px', fontWeight: 500,
    }}>
      {cfg.label}
    </span>
  );
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Tasks() {
  const { user } = useAuth();
  const { tasks, setTasks, loading, fetchTasks, updateTask, createTask, deleteTask } = useTasks();
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDeleteTask = async (taskId) => {
    console.log('Attempting to delete task:', taskId);
    
    if (!taskId) {
      toast.error('Invalid task ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      console.log('Delete response:', response.data);
      
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setOpenMenu(null);
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete task');
      setOpenMenu(null);
    }
  };

  useEffect(() => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    fetchTasks(filters);
  }, [statusFilter, fetchTasks]);

  // Client-side overdue filtering
  const visibleTasks = tasks;

  const handleSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask(formData);
    }
    setEditingTask(null);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>Tasks</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin(user) && (
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: '14px', fontWeight: 600,
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              transition: 'opacity 0.15s',
            }}
          >
            + New Task
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: statusFilter === f.value
                ? 'rgba(99,102,241,0.2)'
                : 'rgba(255,255,255,0.05)',
              color: statusFilter === f.value ? '#818cf8' : '#6b7280',
              outline: statusFilter === f.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#161b27',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg mb-2" />
            ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <div style={{ padding: '40px 24px' }}>
            <EmptyState
              title={statusFilter ? `No ${statusFilter} tasks` : 'No tasks found'}
              description="No tasks match your current filter."
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {['TITLE', 'PROJECT', 'PRIORITY', 'STATUS', 'DUE DATE', 'ASSIGNEE', ''].map(col => (
                    <th key={col} style={{
                      padding: '12px 20px', color: '#64748b', fontSize: '12px',
                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map(task => (
                  <tr
                    key={task._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
                    className="dashboard-task-row"
                    onClick={() => { setEditingTask(task); setShowModal(true); }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{task.title}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '14px' }}>{task.project?.title || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {task.dueDate ? (
                        <span style={{
                          fontSize: '14px',
                          color: isOverdue(task.dueDate, task.status) ? '#f87171' : '#94a3b8',
                          fontWeight: isOverdue(task.dueDate, task.status) ? 500 : 400,
                        }}>
                          {formatDate(task.dueDate)}
                        </span>
                      ) : <span style={{ color: '#475569', fontSize: '14px' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {task.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: '#4f46e5', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700,
                          }}>
                            {getInitials(task.assignedTo.name)}
                          </div>
                          <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{task.assignedTo.name}</span>
                        </div>
                      ) : <span style={{ color: '#475569', fontSize: '14px', fontStyle: 'italic' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}>
                      <div ref={openMenu === task._id ? menuRef : null} style={{ position:'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); 
                            setOpenMenu(openMenu === task._id ? null : task._id); }}
                          style={{ background:'none', border:'none', cursor:'pointer',
                                   padding:'6px', borderRadius:6, color:'#475569',
                                   display:'flex', alignItems:'center' }}
                          onMouseEnter={e => e.currentTarget.style.color='#94a3b8'}
                          onMouseLeave={e => e.currentTarget.style.color='#475569'}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openMenu === task._id && (
                          <div style={{
                            position:'absolute', right:0, top:'100%', marginTop:4,
                            background:'#1e2538', border:'1px solid rgba(255,255,255,0.1)',
                            borderRadius:10, overflow:'hidden', zIndex:50, minWidth:160,
                            boxShadow:'0 10px 30px rgba(0,0,0,0.4)'
                          }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/projects/${task.project?._id || task.project}`); setOpenMenu(null); }}
                              style={{ width:'100%', padding:'10px 14px', background:'none',
                                       border:'none', color:'#cbd5e1', fontSize:'13px',
                                       cursor:'pointer', textAlign:'left', display:'flex',
                                       alignItems:'center', gap:8 }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              👁 View Task
                            </button>
                            
                            {user?.role === 'admin' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                style={{ width:'100%', padding:'10px 14px', background:'none',
                                         border:'none', color:'#f87171', fontSize:'13px',
                                         cursor:'pointer', textAlign:'left', display:'flex',
                                         alignItems:'center', gap:8,
                                         borderTop:'1px solid rgba(255,255,255,0.05)' }}
                                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background='none'}
                              >
                                🗑 Delete Task
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        task={editingTask}
      />
    </div>
  );
}
