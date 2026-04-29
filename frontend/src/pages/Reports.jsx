import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { isOverdue } from '../utils/formatDate';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

function StatCard({ label, sub, value, iconBg, iconColor, Icon }) {
  return (
    <div style={{ background:'#161b27', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ color:'#94a3b8', fontSize:'14px', fontWeight:500 }}>{label}</p>
          <p style={{ color:'white', fontSize:'36px', fontWeight:700, marginTop:'8px', lineHeight:1.1 }}>{value??0}</p>
          <p style={{ color:'#64748b', fontSize:'12px', marginTop:'4px' }}>{sub}</p>
        </div>
        <div style={{ width:'52px', height:'52px', borderRadius:'12px', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={24} color={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/projects')])
      .then(([tr, pr]) => { setTasks(tr.data.tasks||[]); setProjects(pr.data.projects||[]); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t=>t.status==='done').length;
    const inProgress = tasks.filter(t=>t.status==='in-progress').length;
    const todo = tasks.filter(t=>t.status==='todo').length;
    const overdue = tasks.filter(t=>isOverdue(t.dueDate,t.status)).length;
    return { total, completed, inProgress, todo, overdue };
  }, [tasks]);

  const projectStats = useMemo(() => {
    return projects.map(p => {
      const pt = tasks.filter(t => (t.project?._id||t.project)===p._id);
      const done = pt.filter(t=>t.status==='done').length;
      return { name: p.title, total: pt.length, done };
    });
  }, [tasks, projects]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => isOverdue(t.dueDate,t.status)).map(t => {
      const days = Math.ceil((new Date()-new Date(t.dueDate))/(1000*60*60*24));
      return { ...t, daysOverdue: days };
    });
  }, [tasks]);

  if (loading) return (
    <div className="page-enter">
      <h1 style={{color:'white',fontSize:'24px',fontWeight:700,marginBottom:'24px'}}>Reports</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'28px'}}>
        {[1,2,3,4].map(i=><Skeleton key={i} className="h-[120px] bg-[#161b27] rounded-[14px]"/>)}
      </div>
      <Skeleton className="h-40 bg-[#161b27] rounded-[14px] mb-6" />
    </div>
  );

  const pct = (n) => stats.total > 0 ? Math.round(n/stats.total*100) : 0;

  return (
    <div className="page-enter">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px'}}>
        <div>
          <h1 style={{color:'white',fontSize:'24px',fontWeight:700}}>Reports</h1>
          <p style={{color:'#94a3b8',fontSize:'14px',marginTop:'4px'}}>Project and task analytics</p>
        </div>
        <span style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'8px 14px',color:'#cbd5e1',fontSize:'14px'}}>All time</span>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'32px'}}>
        <StatCard label="Total Tasks" sub="All tasks" value={stats.total} iconBg="rgba(99,102,241,0.15)" iconColor="#818cf8" Icon={ClipboardList}/>
        <StatCard label="Completed" sub="Tasks done" value={stats.completed} iconBg="rgba(16,185,129,0.15)" iconColor="#34d399" Icon={CheckCircle2}/>
        <StatCard label="In Progress" sub="Active tasks" value={stats.inProgress} iconBg="rgba(245,158,11,0.15)" iconColor="#fbbf24" Icon={Clock}/>
        <StatCard label="Overdue" sub="Past due" value={stats.overdue} iconBg="rgba(239,68,68,0.15)" iconColor="#f87171" Icon={AlertTriangle}/>
      </div>

      {/* Status breakdown */}
      <div style={{background:'#161b27',borderRadius:'14px',padding:'24px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'32px'}}>
        <h2 style={{color:'white',fontWeight:600,fontSize:'18px',marginBottom:'16px'}}>Task Status Breakdown</h2>
        {[{label:'To Do',count:stats.todo,color:'#64748b'},{label:'In Progress',count:stats.inProgress,color:'#3b82f6'},{label:'Done',count:stats.completed,color:'#22c55e'}].map(s=>(
          <div key={s.label} style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'12px'}}>
            <span style={{color:'#94a3b8',fontSize:'14px',width:'96px'}}>{s.label}</span>
            <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'9999px',height:'8px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'9999px',background:s.color,width:`${pct(s.count)}%`,transition:'width 0.5s'}}/>
            </div>
            <span style={{color:'#94a3b8',fontSize:'14px',width:'40px',textAlign:'right'}}>{pct(s.count)}%</span>
          </div>
        ))}
      </div>

      {/* Tasks per project */}
      <div style={{marginBottom:'32px'}}>
        <h2 style={{color:'white',fontWeight:600,fontSize:'18px',marginBottom:'16px'}}>Tasks Per Project</h2>
        {projectStats.map(p=>(
          <div key={p.name} style={{background:'#161b27',borderRadius:'14px',padding:'16px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'12px',display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{color:'white',fontSize:'14px',width:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
            <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'9999px',height:'12px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'9999px',background:'#6366f1',width:p.total>0?`${p.done/p.total*100}%`:'0%',transition:'width 0.5s'}}/>
            </div>
            <span style={{color:'#94a3b8',fontSize:'13px',width:'80px',textAlign:'right'}}>{p.done}/{p.total} tasks</span>
          </div>
        ))}
      </div>

      {/* Overdue tasks table */}
      <div style={{background:'#161b27',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{padding:'20px 24px'}}><h2 style={{color:'white',fontWeight:600,fontSize:'18px'}}>Overdue Tasks</h2></div>
        {overdueTasks.length===0 ? (
          <p style={{color:'#64748b',padding:'16px 24px 24px',fontSize:'14px'}}>No overdue tasks 🎉</p>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['Task','Project','Assigned To','Due Date','Days Overdue'].map(c=><th key={c} style={{padding:'12px 24px',color:'#64748b',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left'}}>{c}</th>)}
            </tr></thead>
            <tbody>
              {overdueTasks.map(t=>(
                <tr key={t._id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}} className="dashboard-task-row">
                  <td style={{padding:'14px 24px',color:'white',fontSize:'14px',fontWeight:500}}>{t.title}</td>
                  <td style={{padding:'14px 24px',color:'#94a3b8',fontSize:'14px'}}>{t.project?.title||'—'}</td>
                  <td style={{padding:'14px 24px'}}>
                    {t.assignedTo ? (
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'11px',fontWeight:700}}>{getInitials(t.assignedTo.name)}</div>
                        <span style={{color:'#cbd5e1',fontSize:'14px'}}>{t.assignedTo.name}</span>
                      </div>
                    ) : <span style={{color:'#475569',fontSize:'14px'}}>—</span>}
                  </td>
                  <td style={{padding:'14px 24px',color:'#f87171',fontSize:'14px'}}>{new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                  <td style={{padding:'14px 24px'}}><span style={{background:'rgba(239,68,68,0.15)',color:'#f87171',padding:'4px 10px',borderRadius:'9999px',fontSize:'12px',fontWeight:500}}>{t.daysOverdue}d</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
