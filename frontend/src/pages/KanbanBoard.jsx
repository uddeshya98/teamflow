import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';
import { formatDate, isOverdue } from '../utils/formatDate';

const priorityBorder = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const priorityCfg = {
  high:   { bg: 'rgba(239,68,68,0.1)',  text: '#f87171', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', dot: '#f59e0b' },
  low:    { bg: 'rgba(34,197,94,0.1)',  text: '#4ade80', dot: '#22c55e' },
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function KanbanCard({ task, onClick }) {
  const p = task.priority || 'medium';
  const cfg = priorityCfg[p] || priorityCfg.medium;
  return (
    <div
      onClick={onClick}
      className="kanban-card"
      style={{
        background: '#1e2538',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        borderLeft: `4px solid ${priorityBorder[p] || '#f59e0b'}`,
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeftWidth: '4px',
        borderLeftColor: priorityBorder[p] || '#f59e0b',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '9999px',
          background: cfg.bg, color: cfg.text, fontSize: '11px', fontWeight: 500,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </span>
        <span style={{ color: '#64748b', fontSize: '11px' }}>{task.project?.title || ''}</span>
      </div>

      {/* Title */}
      <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p style={{
          color: '#94a3b8', fontSize: '12px', marginTop: '4px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        {task.assignedTo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '10px', fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials(task.assignedTo.name)}
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{task.assignedTo.name}</span>
          </div>
        ) : <span style={{ color: '#475569', fontSize: '12px', fontStyle: 'italic' }}>Unassigned</span>}
        {task.dueDate && (
          <span style={{
            fontSize: '12px',
            color: isOverdue(task.dueDate, task.status) ? '#f87171' : '#94a3b8',
            fontWeight: isOverdue(task.dueDate, task.status) ? 500 : 400,
          }}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({ title, dot, tasks, navigate }) {
  return (
    <div style={{
      flex: 1, minWidth: '280px', background: '#161b27', borderRadius: '12px', padding: '16px',
      minHeight: '500px', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dot }} />
        <h3 style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{title}</h3>
        <span style={{
          marginLeft: 'auto', background: 'rgba(255,255,255,0.1)',
          color: '#cbd5e1', fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 500,
        }}>{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>No tasks here</p>
      ) : (
        tasks.map(t => (
          <KanbanCard key={t._id} task={t} onClick={() => navigate(`/projects/${t.project?._id || t.project}`)} />
        ))
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedProject ? `/tasks?projectId=${selectedProject}` : '/tasks';
    api.get(url)
      .then(r => setTasks(r.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const done = tasks.filter(t => t.status === 'done');

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>Kanban Board</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>All tasks across projects</p>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '8px 14px', color: '#cbd5e1', fontSize: '14px',
            outline: 'none', cursor: 'pointer', minWidth: '180px',
          }}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {/* Columns */}
      {loading ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, background: '#161b27', borderRadius: '12px', padding: '16px', minHeight: '400px' }}>
              <Skeleton className="h-8 w-32 bg-white/5 rounded-lg mb-4" />
              {[1,2,3].map(j => <Skeleton key={j} className="h-28 w-full bg-white/5 rounded-lg mb-3" />)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          <Column title="To Do" dot="#64748b" tasks={todo} navigate={navigate} />
          <Column title="In Progress" dot="#3b82f6" tasks={inProgress} navigate={navigate} />
          <Column title="Done" dot="#22c55e" tasks={done} navigate={navigate} />
        </div>
      )}
    </div>
  );
}
