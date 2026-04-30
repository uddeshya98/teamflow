import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isOverdue } from '../utils/formatDate';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2,'0'); }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function sameDay(a,b) { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState([]);

  useEffect(() => { api.get('/tasks').then(r => setTasks(r.data.tasks||[])).catch(()=>{}); }, []);

  const prev = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const taskMap = useMemo(() => {
    const m = {};
    tasks.forEach(t => { if(!t.dueDate) return; const k=dateKey(new Date(t.dueDate)); if(!m[k]) m[k]=[]; m[k].push(t); });
    return m;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const first = new Date(year,month,1);
    const sw = first.getDay();
    const dim = new Date(year,month+1,0).getDate();
    const dpm = new Date(year,month,0).getDate();
    const cells = [];
    for(let i=sw-1;i>=0;i--) cells.push({day:dpm-i,current:false,date:new Date(year,month-1,dpm-i)});
    for(let d=1;d<=dim;d++) cells.push({day:d,current:true,date:new Date(year,month,d)});
    const rem=42-cells.length;
    for(let d=1;d<=rem;d++) cells.push({day:d,current:false,date:new Date(year,month+1,d)});
    return cells;
  }, [year,month]);

  const upcoming = useMemo(() => tasks.filter(t=>t.dueDate).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,5), [tasks]);

  const navBtn = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'8px 12px', cursor:'pointer', display:'flex' };

  return (
    <div className="page-enter">
      <div style={{marginBottom:'24px'}}>
        <h1 style={{color:'white',fontSize:'24px',fontWeight:700}}>Calendar</h1>
        <p style={{color:'#94a3b8',fontSize:'14px',marginTop:'4px'}}>Task deadlines overview</p>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={prev} style={navBtn}><ChevronLeft size={18} color="#94a3b8"/></button>
        <span style={{color:'white',fontWeight:600,fontSize:'18px',minWidth:'180px',textAlign:'center'}}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={navBtn}><ChevronRight size={18} color="#94a3b8"/></button>
      </div>

      <div style={{overflowX:'auto', paddingBottom:'8px'}}>
        <div style={{minWidth:'700px',background:'#161b27',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {DAYS.map(d=><div key={d} style={{padding:'10px 0',textAlign:'center',color:'#64748b',fontSize:'12px',textTransform:'uppercase',fontWeight:600,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {calendarDays.map((cell,idx)=>{
            const k=dateKey(cell.date); const dt=taskMap[k]||[]; const isT=sameDay(cell.date,today);
            return (
              <div key={idx} style={{minHeight:'80px',padding:'6px',border:'1px solid rgba(255,255,255,0.04)',background:isT?'rgba(99,102,241,0.06)':'transparent',opacity:cell.current?1:0.3}}>
                <div style={{marginBottom:'4px'}}>
                  {isT ? <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'26px',height:'26px',borderRadius:'50%',background:'#6366f1',color:'white',fontSize:'13px',fontWeight:600}}>{cell.day}</span>
                       : <span style={{color:'#94a3b8',fontSize:'13px'}}>{cell.day}</span>}
                </div>
                {dt.slice(0,2).map(t=><div key={t._id} style={{background:'rgba(99,102,241,0.15)',color:'#a5b4fc',fontSize:'11px',padding:'2px 6px',borderRadius:'9999px',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>)}
                {dt.length>2 && <span style={{color:'#64748b',fontSize:'10px'}}>+{dt.length-2} more</span>}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <div style={{marginTop:'32px'}}>
        <h2 style={{color:'white',fontWeight:600,fontSize:'18px',marginBottom:'16px'}}>Upcoming Deadlines</h2>
        <div style={{overflowX:'auto'}}>
          <div style={{minWidth:'500px', background:'#161b27',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
          {upcoming.length===0 ? <p style={{color:'#64748b',padding:'24px',textAlign:'center',fontSize:'14px'}}>No upcoming deadlines</p> :
            upcoming.map(t=>{
              const od=isOverdue(t.dueDate,t.status); const d=new Date(t.dueDate);
              return (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:od?'#ef4444':t.status==='done'?'#22c55e':'#6366f1'}}/>
                  <span style={{color:'white',fontSize:'14px',fontWeight:500,flex:1}}>{t.title}</span>
                  <span style={{color:'#64748b',fontSize:'13px',minWidth:'120px'}}>{t.project?.title||'—'}</span>
                  <span style={{fontSize:'13px',fontWeight:od?500:400,color:od?'#f87171':'#94a3b8'}}>{d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                </div>
              );
            })
          }
          </div>
        </div>
      </div>
    </div>
  );
}
