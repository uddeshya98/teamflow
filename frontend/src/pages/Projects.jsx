import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { isAdmin } from '../utils/roleGuard';
import ProjectCard from '../components/ProjectCard';
import Skeleton from '../components/Skeleton';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks, fetchTasks } = useTasks();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects', form);
      setForm({ title: '', description: '' });
      setShowForm(false);
      fetchProjects();
      toast.success('Project created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 text-sm mt-1.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin(user) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#111827] rounded-2xl p-6 mb-8 border border-white/5 shadow-xl animate-[fadeIn_0.3s_ease_forwards]">
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Describe the project"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl bg-[#111827]" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-8 max-w-sm">Create your first project to get started and collaborate with your team.</p>
          {isAdmin(user) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              tasks={tasks}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
