// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from './config';
import './index.css';
import './style.css';

/* ===== Time helpers (IST everywhere) ===== */
const IST = 'Asia/Kolkata';
function fmtIST(isoOrDate) {
  const d = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
  return d.toLocaleString('en-IN', { timeZone: IST });
}

/* =========================
   Auth
   ========================= */
function useAuth(){
  const [token,setToken] = React.useState(localStorage.getItem('token'));
  const [role,setRole] = React.useState(localStorage.getItem('role') || 'team');
  const [loading, setLoading] = React.useState(false);

  const save = (t,r='team')=>{
    localStorage.setItem('token',t);
    setToken(t);
    localStorage.setItem('role',r);
    setRole(r);
  };
  const clear = ()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('round1_done');
    localStorage.removeItem('round1_qualified');
    localStorage.removeItem('round2_done');
    localStorage.removeItem('round2_qualified');
    setToken(null);
    setRole('team');
  };

  const register = async (form)=>{
    try{
      setLoading(true);
      const res = await axios.post(API_BASE + '/api/auth/register', form);
      if (res.data?.token) save(res.data.token,'team');
      return res.data;
    } finally { setLoading(false); }
  };
  const login = async (email,password)=>{
    try{
      setLoading(true);
      const res = await axios.post(API_BASE + '/api/auth/login', {email,password});
      if (res.data?.token) save(res.data.token, res.data.role || 'team');
      return res.data;
    } finally { setLoading(false); }
  };

  return { token, role, save, clear, loading, register, login };
}

/* =========================
   Server clock + windows
   ========================= */
function useServerClock(){
  const [now, setNow] = React.useState(null);
  React.useEffect(()=>{
    let timer;
    (async ()=>{
      try{
        const r = await axios.get(API_BASE + '/api/server-time');
        const serverNow = new Date(r.data.now_iso).getTime();
        const clientNow = Date.now();
        const off = serverNow - clientNow;
        setNow(new Date(serverNow));
        timer = setInterval(()=> setNow(new Date(Date.now() + off)), 1000);
      }catch{
        setNow(new Date());
        timer = setInterval(()=> setNow(new Date()), 1000);
      }
    })();
    return ()=> timer && clearInterval(timer);
  }, []);
  return now;
}

function useEventWindows(){
  const [win, setWin] = React.useState(null);
  React.useEffect(()=>{
    axios.get(API_BASE + '/api/event-settings')
      .then(r=> setWin({ round1: r.data.round1, round2: r.data.round2 }))
      .catch(()=> setWin(null));
  },[]);
  return win;
}

function useGate(now, isoStart, isoEnd, mode='R1'){
  const start = isoStart ? new Date(isoStart) : null;
  const end   = isoEnd   ? new Date(isoEnd)   : null;
  if (!now) return { status:'loading' };

  if (mode === 'R1'){
    if (!start || !end) return { status:'unset' };
    if (now < start) return { status:'locked', opensAt:start };
    if (end && now >= end) return { status:'ended', endedAt:end };
    return { status:'open', endsAt:end };
  } else {
    if (!start) return { status:'unset' };
    if (now < start) return { status:'locked', opensAt:start };
    return { status:'open', endsAt:end || null }; // R2 end optional
  }
}

function Countdown({now, target, prefix='Opens in'}){
  if (!now || !target) return null;
  const diff = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(diff/1000);
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  return (
    <div className="countdown">
      {prefix} <b>{d}d {h}h {m}m {sec}s</b>
    </div>
  );
}

/* =========================
   Helpers / flags
   ========================= */
async function fetchStatusAndSetFlags(token){
  if (!token) return null;
  try{
    const hdr = { headers: { Authorization: 'Bearer ' + token } };
    const r = await axios.get(API_BASE + '/api/status', hdr);
    const data = r.data;
    if (data?.round1_attempted) localStorage.setItem('round1_done','1');
    if (data?.shortlist?.round1_qualified) localStorage.setItem('round1_qualified','1');
    if (data?.shortlist?.round2_shortlisted) localStorage.setItem('round2_qualified','1');
    return data;
  }catch{ return null; }
}
const isRound1Done      = ()=> !!localStorage.getItem('round1_done');
const isRound1Qualified = ()=> !!localStorage.getItem('round1_qualified');
const isRound2Done      = ()=> !!localStorage.getItem('round2_done');
const isRound2Qualified = ()=> !!localStorage.getItem('round2_qualified');

/* =========================
   Nav  (✅ Badge removed here)
   ========================= */
function Nav({auth}){
  const token = auth.token;
  const isAdmin = auth.role === 'admin';
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="NIT Silchar Hackathon 2026 Home">
          <span>NIT SILCHAR HACKATHON 2026</span>
        </Link>
        <nav className="nav-links">
          <Link to="/schedule">Schedule</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/contact">Contact</Link>

          {!token && <Link className="btn ghost" to="/register">Register</Link>}
          {!token && <Link className="btn primary" to="/login">Login</Link>}

          {token && !isAdmin && <Link className="btn" to="/round1">Round 1</Link>}
          {token && !isAdmin && (isRound1Done() || isRound1Qualified()) && <Link className="btn" to="/round2">Round 2</Link>}
          {token && !isAdmin && (isRound2Done() || isRound2Qualified()) && <Link className="btn" to="/round3-offline">Round 3</Link>}
          {token && <Link className="btn" to="/results">Results</Link>}
          {token && !isAdmin && <Link className="btn" to="/dashboard">Dashboard</Link>}
          {token && isAdmin && <Link className="btn" to="/superadmin">Admin</Link>}
          {token && <button className="btn" onClick={auth.clear}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}

/* =========================
   Home
   ========================= */
function Home({auth}){
  const token = auth.token;
  return (
    <main className="container">
      <section className="hero">
        <div className="hero-left">
          <span className="pill">National-Level Competition</span>
          <h1 className="hero-title">
            Hackathon <span className="year">2026</span>
          </h1>
          <p className="hero-sub">
            Showcase your AI/ML and problem-solving skills at NIT Silchar.
            Exactly 3 members per team • Round 1 MCQ • Round 2 Coding • Round 3 On-Campus Finale.
          </p>

          <div className="hero-cta">
            {!token && <Link className="btn primary xl" to="/register">Register Now</Link>}
            <Link className="btn" to="/schedule">View Schedule</Link>
          </div>

          <div className="stats">
            <Stat n="3" label="Competition Rounds" />
            <Stat n="₹1.2L" label="Prize Pool" accent />
            <Stat n="3" label="Members / Team" />
            <Stat n="NIT" label="Silchar, Assam" accent />
          </div>
        </div>

        <div className="hero-right">
          <div className="glass-card img-card hero-media">
            <img
              className="hero-img"
              alt="College students collaborating on code"
              loading="lazy"
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1400&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
function Stat({n,label,accent}) {
  return (
    <div className={`stat ${accent ? 'accent' : ''}`}>
      <div className="stat-n">{n}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}

/* =========================
   Register / Login / Dashboard
   ========================= */
function Register({auth}){
  const [form, setForm] = React.useState({
    team_name:'', email:'', password:'', phone:'', member1:'', member2:'', member3:''
  });
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if (!form.member1.trim() || !form.member2.trim() || !form.member3.trim()){
      setErr('Please provide names for exactly 3 members.');
      return;
    }
    try{
      setErr(''); setLoading(true);
      await auth.register(form);
      await fetchStatusAndSetFlags(localStorage.getItem('token'));
    }catch(e){
      setErr(e.response?.data?.error || 'Registration error');
    }finally{ setLoading(false); }
  };

  if (auth.token) return <Navigate to="/dashboard" />;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Register Team</h2>
        <p className="muted">Exactly 3 members are required.</p>
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit} className="grid gap">
          {['team_name','email','password','phone','member1','member2','member3'].map(k=>(
            <input
              key={k}
              placeholder={k}
              className="input"
              type={k==='password' ? 'password' : (k==='email' ? 'email' : 'text')}
              value={form[k]}
              onChange={e=>setForm({...form,[k]:e.target.value})}
              required={['team_name','email','password','member1','member2','member3'].includes(k)}
            />
          ))}
          <button className="btn primary" disabled={loading}>{loading ? 'Registering…' : 'Create Team'}</button>
        </form>
      </div>
    </div>
  );
}

function Login({auth}){
  const [email,setEmail] = React.useState('');
  const [password,setPassword] = React.useState('');
  const [err,setErr] = React.useState('');
  const [loading,setLoading] = React.useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    try{
      setLoading(true); setErr('');
      await auth.login(email,password);
      await fetchStatusAndSetFlags(localStorage.getItem('token'));
    }catch{ setErr('Invalid credentials'); }
    finally{ setLoading(false); }
  };

  if (auth.token && auth.role==='team') return <Navigate to="/dashboard" />;
  if (auth.token && auth.role==='admin') return <Navigate to="/superadmin" />;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Login</h2>
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit} className="grid gap">
          <input className="input" placeholder="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="input" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button className="btn primary" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <p className="muted small">Use your registered credentials to log in.</p>
      </div>
    </div>
  );
}

function Dashboard({auth}){
  const [data,setData]   = React.useState(null);
  const [me,setMe]       = React.useState(null);
  const [loading,setLoading] = React.useState(true);

  React.useEffect(()=>{
    async function load(){
      if (!auth.token) { setLoading(false); return; }
      const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
      try{
        const [st, meRes] = await Promise.all([
          axios.get(API_BASE + '/api/status', hdr).catch(()=>null),
          axios.get(API_BASE + '/api/me', hdr).catch(()=>null)
        ]);
        if (st?.data) {
          setData(st.data);
          if (st.data?.round1_attempted) localStorage.setItem('round1_done','1');
          if (st.data?.shortlist?.round1_qualified) localStorage.setItem('round1_qualified','1');
          if (st.data?.shortlist?.round2_shortlisted) localStorage.setItem('round2_qualified','1');
        }
        if (meRes?.data) setMe(meRes.data);
      } finally { setLoading(false); }
    }
    load();
  }, [auth.token]);

  if (!auth.token) return <Navigate to="/login" />;
  if (loading) return <div className="container">Loading…</div>;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Welcome{me?.team?.team_name ? `, ${me.team.team_name}` : ''}</h2>
        <div className="links">
          <Link className="link" to="/profile">Edit Profile</Link>{' • '}
          <Link className="link" to="/certificate">Certificate</Link>{' • '}
          <Link className="link" to="/results">Results</Link>{' • '}
          <Link className="link" to="/round3-offline">Round 3 (Offline)</Link>{' • '}
          <Link className="link" to="/round1">Round 1: MCQ</Link>{' • '}
          {(isRound1Done() || isRound1Qualified()) && <Link className="link" to="/round2">Round 2: Problems</Link>}{' • '}
          <Link className="link" to="/submit">Upload Submission</Link>
        </div>
        <div className="mt">
          <p>Round 1 Score: <b>{data?.round1?.score ?? 0}</b> / {data?.round1?.total ?? 15}</p>
          <p>Round 1 Qualified: <b>{data?.shortlist?.round1_qualified ? 'Yes' : 'No'}</b></p>
          <p>Round 2 Shortlisted: <b>{data?.shortlist?.round2_shortlisted ? 'Yes' : 'No'}</b></p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Round 1 – Timers + single attempt
   ========================= */
function Round1({auth}){
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === 'admin') return <Navigate to="/superadmin" />;

  const now = useServerClock();
  const wins = useEventWindows();
  const [qs,setQs] = React.useState([]);
  const [sel,setSel] = React.useState({});
  const [resu,setResu] = React.useState(null);
  const [loading,setLoading] = React.useState(true);
  const [already,setAlready] = React.useState(false);

  const r1 = wins?.round1;
  const gate = useGate(now, r1?.start_iso, r1?.end_iso, 'R1');

  React.useEffect(()=>{
    async function load(){
      if (!auth.token) return;
      const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
      const st = await axios.get(API_BASE + '/api/status', hdr).catch(()=>null);
      if (st?.data?.round1_attempted) {
        setAlready(true);
        setLoading(false);
        return;
      }
      if (gate?.status !== 'open') { setLoading(false); return; }
      try{
        const r = await axios.get(API_BASE + '/api/round1/questions', hdr);
        setQs(r.data || []);
      }catch(e){
        if (e?.response?.data?.error === 'ALREADY_SUBMITTED') setAlready(true);
        setQs([]);
      }
      setLoading(false);
    }
    load();
  }, [auth.token, gate?.status]);

  const submitAnswers = async ()=>{
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    try{
      const res = await axios.post(API_BASE + '/api/round1/submit', { answers: sel }, hdr);
      setResu(res.data);
      localStorage.setItem('round1_done','1');
      await fetchStatusAndSetFlags(auth.token);
      setAlready(true);
    }catch(e){
      if (e?.response?.status === 409) {
        setAlready(true);
        alert('You have already submitted Round-1.');
      } else {
        alert('Submission failed');
      }
    }
  };

  if (gate?.status === 'loading' || loading) return <div className="container">Loading…</div>;
  if (gate?.status === 'unset') return <CardInfo title="Round 1" msg="Admin has not set the Round-1 window yet." />;
  if (gate?.status === 'locked') return <Locked title="Round 1 – MCQ" when={gate.opensAt} now={now} />;
  if (gate?.status === 'ended')  return <CardInfo title="Round 1 – Ended" msg="Round-1 has ended." />;

  if (already) return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>Round 1 – Submitted ✅</h2>
        <p className="muted">Your MCQ submission is recorded. You can’t attempt again.</p>
      </div>
    </div>
  );

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <div className="row-between">
          <h2>Round 1 – MCQ</h2>
          {gate?.endsAt && (
            <div className="align-right">
              <p className="muted small">Ends at: <b>{fmtIST(gate.endsAt)}</b></p>
              <Countdown now={now} target={gate.endsAt} prefix="Ends in" />
            </div>
          )}
        </div>

        {qs.length === 0 && <div className="muted">No questions available.</div>}
        {qs.map((q,i)=>(
          <div key={q.id} className="mcq">
            <div className="q">Q{i+1}. {q.question}</div>
            {['a','b','c','d'].map(opt=>(
              <label key={opt} className="opt">
                <input type="radio" name={`q${q.id}`} onChange={()=>setSel({...sel,[q.id]:opt})} checked={sel[q.id]===opt} />
                <span className="opt-text">{opt.toUpperCase()}) {q['opt_'+opt]}</span>
              </label>
            ))}
          </div>
        ))}
        <div className="row">
          <button className="btn primary" onClick={submitAnswers}>Submit</button>
          {resu && <div className="score">Score: <b>{resu.score}</b> / {resu.total}</div>}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Round 2 – Timers + review card
   ========================= */
function Round2({auth}){
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === 'admin') return <Navigate to="/superadmin" />;
  if (!(isRound1Done() || isRound1Qualified())) return <div className="container">You need to complete or qualify from Round-1 to access Round-2.</div>;

  const now = useServerClock();
  const wins = useEventWindows();
  const r2 = wins?.round2;
  const gate = useGate(now, r2?.start_iso, r2?.end_iso, 'R2');

  const [problems,setProblems] = React.useState([]);
  const [loading,setLoading] = React.useState(true);
  const [mySub,setMySub] = React.useState(null);

  const hdr = { headers: { Authorization: 'Bearer '+auth.token } };

  React.useEffect(()=>{
    async function load(){
      const ms = await axios.get(API_BASE + '/api/round2/my-submission', hdr).then(r=>r.data).catch(()=>null);
      setMySub(ms);

      if (gate?.status !== 'open') { setLoading(false); return; }
      if (ms) { setLoading(false); return; }
      try{
        const r = await axios.get(API_BASE + '/api/round2/problems', hdr);
        setProblems(r.data || []);
      }catch{ setProblems([]); }
      setLoading(false);
    }
    load();
  }, [gate?.status, auth.token]);

  if (gate?.status === 'loading' || loading) return <div className="container">Loading…</div>;
  if (gate?.status === 'unset') return <CardInfo title="Round 2" msg="Admin has not set the Round-2 start time yet." />;
  if (gate?.status === 'locked') return <Locked title="Round 2 – Problems" when={gate.opensAt} now={now} />;

  if (mySub) return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>Round 2 – Submitted ✅</h2>
        <p className="muted">Your file is received. Only one upload is allowed.</p>
        <div className="mt">
          <div><b>File:</b> {mySub.filename}</div>
          <div><b>Uploaded at:</b> {fmtIST(mySub.created_at)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <div className="row-between">
          <h2>Round 2 – Problems</h2>
          {gate?.endsAt && (
            <div className="align-right">
              <p className="muted small">Ends at: <b>{fmtIST(gate.endsAt)}</b></p>
              <Countdown now={now} target={gate.endsAt} prefix="Ends in" />
            </div>
          )}
        </div>
        <ol className="problems">
          {problems.map(p=> <li key={p.id}><b>{p.title}</b>: {p.statement}</li>)}
        </ol>
        <div className="mt">
          <Link className="btn primary" to="/submit">Upload Solution</Link>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Submit Round 2 (single upload)
   ========================= */
function Submit({auth}){
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === 'admin') return <Navigate to="/superadmin" />;
  if (!(isRound1Done() || isRound1Qualified())) return <div className="container">You need to complete Round 1 to submit Round 2 solutions.</div>;

  const wins = useEventWindows();
  const now = useServerClock();
  const r2 = wins?.round2;
  const gate = useGate(now, r2?.start_iso, r2?.end_iso, 'R2');

  const [file,setFile] = React.useState(null);
  const [already,setAlready] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(()=>{
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    axios.get(API_BASE + '/api/round2/my-submission', hdr)
      .then(r=> setAlready(!!r.data))
      .catch(()=> setAlready(false));
  }, [auth.token]);

  const doUpload = async (e)=>{
    e.preventDefault();
    if (already) { alert('You have already uploaded.'); navigate('/round2'); return; }
    if (gate?.status !== 'open') { alert('Submissions open after Round-2 start.'); return; }
    if (!file) { alert('Pick a file'); return; }
    const fd = new FormData(); fd.append('file', file);
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    try{
      await axios.post(API_BASE + '/api/round2/submit', fd, hdr);
      localStorage.setItem('round2_done','1');
      await fetchStatusAndSetFlags(auth.token);
      navigate('/round2');
    }catch(e){
      if (e?.response?.status === 409) {
        alert('Only one upload allowed for Round-2.');
        navigate('/round2');
      } else {
        alert('Upload failed');
      }
    }
  };

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Upload Solution (ZIP/PDF)</h2>
        {already && <p className="error">You already uploaded. You cannot upload again.</p>}
        {gate?.status === 'locked' && (
          <>
            <p className="muted">Submissions will open at <b>{fmtIST(r2.start_iso)}</b>.</p>
            <Countdown now={now} target={new Date(r2.start_iso)} />
          </>
        )}
        {gate?.status === 'open' && r2?.end_iso && (
          <>
            <p className="muted">Submissions close at <b>{fmtIST(r2.end_iso)}</b>.</p>
            <Countdown now={now} target={new Date(r2.end_iso)} prefix="Closes in" />
          </>
        )}
        <form onSubmit={doUpload} className="grid gap">
          <input type="file" onChange={e=>setFile(e.target.files[0])} />
          <button className="btn primary" disabled={already || gate?.status!=='open'}>Submit</button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   Admin (includes Compute Shortlist)
   ========================= */
function Admin({auth}){
  if (!auth.token || auth.role!=='admin') return <Navigate to="/login" />;

  const [mcqs,setMcqs] = React.useState([]);
  const [teams,setTeams] = React.useState([]);
  const [subs,setSubs]   = React.useState([]);
  const [q,setQ] = React.useState({question:'',opt_a:'',opt_b:'',opt_c:'',opt_d:'',correct:'a'});
  const [p,setP] = React.useState({title:'',statement:''});
  const [schedule, setSchedule] = React.useState([]);
  const [sch, setSch] = React.useState({ round:'', title:'', description:'', date:'' });

  const [r1start,setR1start] = React.useState('');
  const [r1end,setR1end]     = React.useState('');
  const [r2start,setR2start] = React.useState('');
  const [r2end,setR2end]     = React.useState('');

  const hdr = { headers: { Authorization: 'Bearer '+auth.token } };

  React.useEffect(()=>{
    axios.get(API_BASE+'/api/admin/mcqs', hdr).then(r=> setMcqs(r.data)).catch(()=>setMcqs([]));
    axios.get(API_BASE+'/api/admin/teams', hdr).then(r=> setTeams(r.data)).catch(()=>setTeams([]));
    axios.get(API_BASE+'/api/admin/submissions', hdr).then(r=> setSubs(r.data)).catch(()=>setSubs([]));
    axios.get(API_BASE+'/api/schedule').then(r=> setSchedule(r.data)).catch(()=>setSchedule([]));
    axios.get(API_BASE+'/api/admin/event-settings', hdr).then(r=>{
      setR1start(r.data.round1.start_iso || '');
      setR1end(r.data.round1.end_iso || '');
      setR2start(r.data.round2.start_iso || '');
      setR2end(r.data.round2.end_iso || '');
    }).catch(()=>{});
  }, [auth.token]);

  const addMcq = async (e)=>{ e.preventDefault(); await axios.post(API_BASE+'/api/admin/mcqs', q, hdr); const r = await axios.get(API_BASE+'/api/admin/mcqs', hdr); setMcqs(r.data); setQ({question:'',opt_a:'',opt_b:'',opt_c:'',opt_d:'',correct:'a'}); };
  const updMcq = async (id,m)=>{ await axios.put(API_BASE+`/api/admin/mcqs/${id}`, m, hdr); const r = await axios.get(API_BASE+'/api/admin/mcqs', hdr); setMcqs(r.data); };
  const delMcq = async (id)=>{ await axios.delete(API_BASE+`/api/admin/mcqs/${id}`, hdr); const r = await axios.get(API_BASE+'/api/admin/mcqs', hdr); setMcqs(r.data); };

  const addProb = async (e)=>{ e.preventDefault(); await axios.post(API_BASE+'/api/admin/problems', p, hdr); await axios.get(API_BASE+'/api/admin/problems', hdr); setP({title:'',statement:''}); };
  const saveWindows = async (e)=>{
    e.preventDefault();
    await axios.put(API_BASE+'/api/admin/event-settings', {
      round1_start_iso: r1start, round1_end_iso: r1end,
      round2_start_iso: r2start, round2_end_iso: r2end,
    }, hdr);
    alert('Windows saved');
  };
  const addSchedule = async (e)=>{ e.preventDefault(); await axios.post(API_BASE+'/api/admin/schedule', sch, hdr); setSch({round:'',title:'',description:'',date:''}); const r = await axios.get(API_BASE+'/api/schedule'); setSchedule(r.data); };
  const deleteSchedule = async (id)=>{ await axios.delete(API_BASE+`/api/admin/schedule/${id}`, hdr); const r = await axios.get(API_BASE+'/api/schedule'); setSchedule(r.data); };

  const computeShortlist = async ()=>{
    try{
      await axios.post(API_BASE + '/api/admin/compute-shortlist', {}, hdr);
      alert('✅ Shortlist computed successfully!');
    }catch{
      alert('Failed to compute shortlist');
    }
  };

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Admin Panel</h2>

        <h3 className="mt">Round Windows</h3>
        <form onSubmit={saveWindows} className="grid gap" style={{display:'grid', gap:10}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10}}>
            <input className="input" placeholder="Round-1 Start (ISO)" value={r1start} onChange={e=>setR1start(e.target.value)} />
            <input className="input" placeholder="Round-1 End (ISO)"   value={r1end} onChange={e=>setR1end(e.target.value)} />
            <input className="input" placeholder="Round-2 Start (ISO)" value={r2start} onChange={e=>setR2start(e.target.value)} />
            <input className="input" placeholder="Round-2 End (ISO, optional)" value={r2end} onChange={e=>setR2end(e.target.value)} />
          </div>
          <div className="row" style={{gap:10}}>
            <button className="btn primary">Save Windows</button>
            <button className="btn" type="button" onClick={computeShortlist}>Compute Shortlist</button>
          </div>
          <div className="muted small">
            <div>R1 Start: <b>{r1start ? fmtIST(r1start) : '—'}</b></div>
            <div>R1 End: <b>{r1end ? fmtIST(r1end) : '—'}</b></div>
            <div>R2 Start: <b>{r2start ? fmtIST(r2start) : '—'}</b></div>
            <div>R2 End: <b>{r2end ? fmtIST(r2end) : '—'}</b></div>
          </div>
        </form>

        <div className="grid two" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20}}>
          <div>
            <h3>Add MCQ</h3>
            <form onSubmit={addMcq} className="grid gap" style={{display:'grid', gap:10}}>
              {['question','opt_a','opt_b','opt_c','opt_d','correct'].map(k=>(
                <input key={k} className="input" placeholder={k} value={q[k]} onChange={e=>setQ({...q,[k]:e.target.value})}/>
              ))}
              <button className="btn">Add MCQ</button>
            </form>
            <h4 className="mt">MCQs ({mcqs.length})</h4>
            <ul className="list">
              {mcqs.map(m=> (
                <li key={m.id} className="row-between">
                  <span>{m.question} <em>({m.correct})</em></span>
                  <span className="row">
                    <button className="btn" onClick={()=>updMcq(m.id, m)}>Save</button>
                    <button className="btn" onClick={()=>delMcq(m.id)}>Delete</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Add Problem</h3>
            <form onSubmit={addProb} className="grid gap" style={{display:'grid', gap:10}}>
              <input className="input" placeholder="title" value={p.title} onChange={e=>setP({...p,title:e.target.value})}/>
              <input className="input" placeholder="statement" value={p.statement} onChange={e=>setP({...p,statement:e.target.value})}/>
              <button className="btn">Add Problem</button>
            </form>
            <h4 className="mt">Teams & Submissions</h4>
            <div className="list small">{teams.map(t=> <div key={t.id}>• {t.team_name}</div>)}</div>
          </div>
        </div>

        <div className="mt">
          <h3>Schedule (Public)</h3>
          <form onSubmit={addSchedule} className="grid four gap" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
            <input className="input" placeholder="round" value={sch.round} onChange={e=>setSch({...sch,round:e.target.value})}/>
            <input className="input" placeholder="title" value={sch.title} onChange={e=>setSch({...sch,title:e.target.value})}/>
            <input className="input" placeholder="description" value={sch.description} onChange={e=>setSch({...sch,description:e.target.value})}/>
            <input className="input" placeholder="date (YYYY-MM-DD)" value={sch.date} onChange={e=>setSch({...sch,date:e.target.value})}/>
            <button className="btn primary">Add</button>
          </form>
          <ul className="list mt">
            {schedule.map(item=>(
              <li key={item.id} className="row-between">
                <div>
                  <div className="bold">{item.round} — {item.title}</div>
                  <div className="muted small">{item.description}</div>
                  <div className="muted small">Date: {item.date}</div>
                </div>
                <button className="btn" onClick={()=>deleteSchedule(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ===== Shared UI ===== */
function Locked({title, when, now}){
  return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>{title}</h2>
        <p className="muted">Unlocks at:</p>
        <p><b>{fmtIST(when)}</b></p>
        <Countdown now={now} target={when} />
      </div>
    </div>
  );
}
function CardInfo({title, msg}){
  return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>{title}</h2>
        <p className="muted">{msg}</p>
      </div>
    </div>
  );
}

/* =========================
   Other pages
   ========================= */
function Profile({auth}){
  const [form, setForm] = React.useState({ phone:'', member1:'', member2:'', member3:'' });
  const [msg, setMsg] = React.useState('');
  React.useEffect(()=>{
    if (!auth.token) return;
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    axios.get(API_BASE+'/api/me', hdr).then(r=>{
      const t = r.data.team;
      setForm({ phone:t?.phone||'', member1:t?.member1||'', member2:t?.member2||'', member3:t?.member3||'' });
    });
  }, [auth.token]);
  const save = async (e)=>{
    e.preventDefault();
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    try{ await axios.put(API_BASE+'/api/team', form, hdr); setMsg('Saved!'); }
    catch(e){ setMsg(e.response?.data?.error || 'Save failed'); }
  };
  if (!auth.token) return <Navigate to="/login" />;
  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Edit Team Profile</h2>
        {msg && <div className="ok">{msg}</div>}
        <form onSubmit={save} className="grid gap" style={{display:'grid', gap:10}}>
          {['phone','member1','member2','member3'].map(k=>(
            <input key={k} className="input" placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
          ))}
          <button className="btn primary">Save</button>
        </form>
      </div>
    </div>
  );
}

function Leaderboard(){
  const [rows,setRows] = React.useState([]);
  React.useEffect(()=>{ axios.get(API_BASE+'/api/leaderboard').then(r=>setRows(r.data)).catch(()=>setRows([])) },[]);
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Leaderboard (Round 1)</h2>
        <table className="table">
          <thead><tr><th>#</th><th>Team</th><th>Score</th><th>Out of</th><th>Time</th></tr></thead>
          <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td>{i+1}</td>
              <td>{r.team_name}</td>
              <td>{r.score}</td>
              <td>{r.total}</td>
              <td>{r.created_at ? fmtIST(r.created_at) : ''}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Certificate({auth}){
  const [data,setData] = React.useState(null);
  React.useEffect(()=>{
    if (!auth.token) return;
    const hdr = { headers: { Authorization: 'Bearer '+auth.token } };
    axios.get(API_BASE+'/api/certificate-data', hdr).then(r=> setData(r.data)).catch(()=>setData(null));
  }, [auth.token]);
  if (!auth.token) return <Navigate to="/login" />;
  if (!data) return null;
  const pct = data.total ? (data.score / data.total) : 0;
  let badge = 'Participation';
  if (pct >= 0.8) badge = 'Gold';
  else if (pct >= 0.5) badge = 'Silver';
  return (
    <div className="container">
      <div className="card glass-card center">
        <div className="cert-head">
          <div className="brand-badge lg">NIT</div>
          <h2>Certificate of {badge}</h2>
        </div>
        <p className="muted">National-Level Coding Competition (Hackathon 2026)</p>
        <div className="cert">
          <div className="title">{data.teamName || 'Team'}</div>
          <div>Round-1 Score: <b>{data.score}</b> / {data.total} • Qualified: <b>{data.qualified ? 'Yes' : 'No'}</b></div>
          <div className="muted">Date: {fmtIST(data.date)}</div>
        </div>
        <button className="btn primary" onClick={()=>window.print()}>Print / Save as PDF</button>
      </div>
    </div>
  );
}

function Round3Offline(){
  const [info,setInfo] = React.useState(null);
  React.useEffect(()=>{ axios.get(API_BASE+'/api/round3/info').then(r=>setInfo(r.data)).catch(()=>setInfo(null)); },[]);
  if (!info) return null;
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Round 3 – Offline (NIT Silchar)</h2>
        <p className="muted">Venue: {info.venue} • Schedule: {info.date_window} • Check-in: {info.checkin}</p>
        <p className="bold">Sample Datasets (Test Only)</p>
        <ul className="list">{info.datasets?.map(d=> <li key={d.name}><a className="link" href={d.url}>{d.name}</a></li>)}</ul>
        <p className="muted">Contact: {info.contact}</p>
      </div>
    </div>
  );
}
function Schedule(){
  const [items,setItems] = React.useState([]);
  React.useEffect(()=>{ axios.get(API_BASE+'/api/schedule').then(r=>setItems(r.data)).catch(()=>setItems([])) },[]);
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Event Schedule</h2>
        <ul className="list">
          {items.map(it=>(
            <li key={it.id}>
              <div className="bold">{it.round} — {it.title}</div>
              <div className="muted small">{it.description}</div>
              <div className="muted small">Date: {it.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function Contact(){
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Contact</h2>
        <ul className="list">
          <li>CR, Sec A & B, B.Tech (CSE), 3rd year, NIT Silchar</li>
          <li>Email: <a className="link" href="mailto:hackathon@nits.ac.in">hackathon@nits.ac.in</a></li>
        </ul>
      </div>
    </div>
  );
}
function Results({auth}){
  const [data,setData] = React.useState(null);
  const [rank,setRank] = React.useState(null);
  const [teamName,setTeamName] = React.useState(null);

  React.useEffect(()=>{
    async function load(){
      const hdr = auth.token ? { headers: { Authorization: 'Bearer '+auth.token } } : {};
      try{
        if (auth.token){
          const me = await axios.get(API_BASE+'/api/me', hdr).catch(()=>null);
          const tn = me?.data?.team?.team_name || null;
          setTeamName(tn);

          const st = await axios.get(API_BASE+'/api/status', hdr).catch(()=>null);
          if (st?.data) setData(st.data);

          const lb = await axios.get(API_BASE+'/api/leaderboard', hdr).catch(()=>({data:[]}));
          if (tn) {
            const idx = (lb.data || []).findIndex(r=> r.team_name === tn);
            if (idx >= 0) setRank(idx+1);
          }
        }
      }catch{}
    }
    load();
  }, [auth.token]);

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Results</h2>

        {!auth.token && (
          <p className="muted">Login to view your personal score & certificate.</p>
        )}

        {auth.token && data && (
          <div className="mt">
            <div>Team: <b>{teamName}</b></div>

            <div>
              Round 1 Score: <b>
                {!data.round1_attempted
                  ? 'N/A'
                  : `${data.round1.score} / ${data.round1.total}`
                }
              </b>
            </div>

            <div>
              Qualified for Round 2: <b>
                {!data.round1_attempted
                  ? 'N/A'
                  : (data.shortlist?.round1_qualified ? 'Yes' : 'No')
                }
              </b>
            </div>

            <div>
              Round 2 Shortlisted: <b>
                {!data.round1_attempted
                  ? 'N/A'
                  : (data.shortlist?.round2_shortlisted ? 'Yes' : 'No')
                }
              </b>
            </div>

            {rank && <div>Leaderboard Rank: <b>#{rank}</b></div>}

            <div className="mt">
              <Link className="btn primary" to="/certificate">View / Print Certificate</Link>
            </div>
          </div>
        )}

        <div className="mt">
          <Link className="link" to="/leaderboard">See full Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}



/* =========================
   App
   ========================= */
function App(){
  const auth = useAuth();
  return (
    <BrowserRouter>
      <Nav auth={auth} />
      <Routes>
        <Route path="/" element={<Home auth={auth} />} />
        <Route path="/register" element={<Register auth={auth} />} />
        <Route path="/login" element={<Login auth={auth} />} />
        <Route path="/dashboard" element={<Dashboard auth={auth} />} />
        <Route path="/round1" element={<Round1 auth={auth} />} />
        <Route path="/round2" element={<Round2 auth={auth} />} />
        <Route path="/submit" element={<Submit auth={auth} />} />
        <Route path="/profile" element={<Profile auth={auth} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/certificate" element={<Certificate auth={auth} />} />
        <Route path="/round3-offline" element={<Round3Offline />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/results" element={<Results auth={auth} />} />
        {/* Admin */}
        <Route path="/admin" element={<Admin auth={auth} />} />
        <Route path="/superadmin" element={<Admin auth={auth} />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />);
