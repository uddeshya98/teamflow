import { formatDate, isOverdue } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/roleGuard';

const priorityColors = {
  'low': 'bg-slate-500',
  'medium': 'bg-yellow-500',
  'high': 'bg-red-500'
};

const priorityBorders = {
  'low': 'border-l-slate-500',
  'medium': 'border-l-yellow-500',
  'high': 'border-l-red-500'
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className={`bg-[#1a2236] rounded-lg p-4 mb-3 border border-white/5 border-l-4 ${priorityBorders[task.priority || 'medium']} hover:border-indigo-500/30 transition-all group`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors leading-tight">
          {task.title}
        </h4>
        {isAdmin(user) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-indigo-400 transition-colors p-1" title="Edit">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDelete(task._id)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Delete">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5 border border-white/5">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority || 'medium']}`}></span>
            <span className="text-[10px] text-slate-300 font-medium capitalize">{task.priority || 'medium'}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo ? (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0" title={task.assignedTo.name}>
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-500 text-[10px] shrink-0 border border-white/10" title="Unassigned">
            ?
          </div>
        )}
      </div>
    </div>
  );
}
