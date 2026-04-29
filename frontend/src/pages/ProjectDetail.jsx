import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { isAdmin } from '../utils/roleGuard';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';
import api from '../api/axios';
import EmptyState from '../components/EmptyState';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, fetchTasks, updateTask, deleteTask, createTask } = useTasks();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProject();
    fetchTasks({ projectId: id });
  }, [id, loadProject, fetchTasks]);

  const handleStatusChange = async (taskId, status) => {
    await updateTask(taskId, { status });
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(taskId);
  };

  const handleTaskSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask({ ...formData, project: id });
    }
    setEditingTask(null);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all associated data?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && (
            <p className="text-slate-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
        {isAdmin(user) && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-surface-light hover:bg-surface text-sm rounded-lg transition-colors"
              id="manage-members-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Members
            </button>
            <button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            <button
              onClick={handleDeleteProject}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">
          Team Members ({project.members?.length || 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.members?.length > 0 ? (
            project.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-[10px] font-medium">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300">{member.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  member.role === 'admin' ? 'bg-primary/20 text-primary-light' : 'bg-slate-600/30 text-slate-400'
                }`}>
                  {member.role}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No members added yet</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Board</h2>
        {tasks.length === 0 && !isAdmin(user) ? (
          <EmptyState
            title="No tasks yet"
            description="There are no tasks associated with this project."
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* To Do Column */}
            <div className="flex-1 bg-white/5 rounded-xl p-4 min-h-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                <h3 className="font-semibold text-white">To Do</h3>
                <span className="ml-auto bg-white/10 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                  {tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              {tasks.filter(t => t.status === 'todo').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {isAdmin(user) && (
                <button
                  onClick={() => { setEditingTask({ status: 'todo' }); setShowTaskModal(true); }}
                  className="w-full py-3 rounded-lg border border-dashed border-white/10 text-slate-400 text-sm font-medium hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              )}
            </div>

            {/* In Progress Column */}
            <div className="flex-1 bg-white/5 rounded-xl p-4 min-h-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold text-white">In Progress</h3>
                <span className="ml-auto bg-white/10 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              {tasks.filter(t => t.status === 'in-progress').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {isAdmin(user) && (
                <button
                  onClick={() => { setEditingTask({ status: 'in-progress' }); setShowTaskModal(true); }}
                  className="w-full py-3 rounded-lg border border-dashed border-white/10 text-slate-400 text-sm font-medium hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              )}
            </div>

            {/* Done Column */}
            <div className="flex-1 bg-white/5 rounded-xl p-4 min-h-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <h3 className="font-semibold text-white">Done</h3>
                <span className="ml-auto bg-white/10 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                  {tasks.filter(t => t.status === 'done').length}
                </span>
              </div>
              {tasks.filter(t => t.status === 'done').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {isAdmin(user) && (
                <button
                  onClick={() => { setEditingTask({ status: 'done' }); setShowTaskModal(true); }}
                  className="w-full py-3 rounded-lg border border-dashed border-white/10 text-slate-400 text-sm font-medium hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projectId={id}
      />

      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        project={project}
        onMemberAdded={(updated) => setProject(updated)}
        onMemberRemoved={(updated) => setProject(updated)}
      />
    </div>
  );
}
