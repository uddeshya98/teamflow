import { formatDate } from '../utils/formatDate';

export default function ProjectCard({ project, onClick, tasks = [] }) {
  const projectTasks = tasks.filter(t => t.project === project._id || t.project?._id === project._id);
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const displayMembers = project.members?.slice(0, 3) || [];
  const extraMembers = Math.max(0, (project.members?.length || 0) - 3);

  return (
    <div
      onClick={() => onClick(project._id)}
      className="bg-[#111827] rounded-xl p-6 border border-white/5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 group"
    >
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
      {project.description && (
        <p className="text-sm text-slate-400 mb-6 line-clamp-2">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <span className="text-slate-400">Progress</span>
          <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-300'}>{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center">
          {displayMembers.map((m, i) => (
            <div key={m._id} className={`w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#111827] ${i > 0 ? '-ml-2.5' : ''} shadow-sm`} style={{ zIndex: 3-i }}>
              {m.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {extraMembers > 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold border-2 border-[#111827] -ml-2.5 shadow-sm" style={{ zIndex: 0 }}>
              +{extraMembers}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
}
