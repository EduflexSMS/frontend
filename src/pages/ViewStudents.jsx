import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

// ─── Global Styles ─────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    :root {
      --bg:        #0d1117;
      --surface:   rgba(255,255,255,0.04);
      --surface2:  rgba(255,255,255,0.07);
      --border:    rgba(255,255,255,0.08);
      --border-hi: rgba(255,255,255,0.16);
      --accent:    #4f8ef7;
      --accent2:   #a78bfa;
      --cyan:      #22d3ee;
      --success:   #34d399;
      --warn:      #fb923c;
      --text:      #e8edf5;
      --muted:     rgba(232,237,245,0.42);
      --card-r:    16px;
      --font-head: 'Syne', sans-serif;
      --font-body: 'DM Sans', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vs-root {
      min-height: 100vh;
      background: var(--bg);
      padding: 32px 28px 60px;
      font-family: var(--font-body);
      color: var(--text);
    }

    .vs-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
    .vs-orb-1 { width: 480px; height: 480px; background: radial-gradient(circle,rgba(79,142,247,0.14),transparent 70%); top: -150px; left: -80px; }
    .vs-orb-2 { width: 340px; height: 340px; background: radial-gradient(circle,rgba(167,139,250,0.1),transparent 70%); bottom: -60px; right: -40px; }

    .vs-wrap { max-width: 1140px; margin: 0 auto; position: relative; z-index: 1; }

    .glass {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--card-r);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    /* ── Page title ── */
    .page-title { font-family: var(--font-head); font-size: clamp(1.8rem,3.5vw,2.4rem); font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
    .page-sub   { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.6px; color: var(--muted); margin-bottom: 24px; }

    /* ── Header ── */
    .vs-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
    .back-btn {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--muted); cursor: pointer; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, border-color 0.15s, transform 0.15s;
      font-family: var(--font-body);
    }
    .back-btn:hover { color: var(--text); border-color: var(--border-hi); transform: translateX(-2px); }

    .bc { font-family: var(--font-head); font-size: clamp(1.4rem,2.5vw,2rem); font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .bc-dim    { opacity: 0.28; }
    .bc-sep    { opacity: 0.15; font-weight: 400; }
    .bc-active { color: var(--accent); }

    /* ── Card grid ── */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 14px; }
    @media (max-width:700px) { .card-grid { grid-template-columns: repeat(2,1fr); } }

    .sel-card {
      padding: 28px 18px 24px; cursor: pointer; min-height: 170px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
      text-align: center;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      position: relative; overflow: hidden;
    }
    .sel-card:hover  { border-color: var(--border-hi); transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.45); }
    .sel-card:active { transform: translateY(0); }

    .hero-card { background: linear-gradient(135deg,rgba(79,142,247,0.14),rgba(167,139,250,0.08)); border-color: rgba(79,142,247,0.22); }
    .hero-card:hover { border-color: rgba(79,142,247,0.45); box-shadow: 0 14px 40px rgba(79,142,247,0.18); }

    .grade-num {
      width: 62px; height: 62px; border-radius: 15px;
      background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.22);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-head); font-size: 1.5rem; font-weight: 800; color: var(--cyan); letter-spacing: -1px;
    }
    .card-icon-wrap { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .card-title { font-family: var(--font-head); font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.2; }
    .card-sub   { font-size: 0.7rem; color: var(--muted); margin-top: 2px; }

    /* ── Search ── */
    .search-wrap { position: relative; margin-bottom: 18px; }
    .search-ico  { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 12px 14px 12px 42px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 12px; font-size: 0.88rem; font-family: var(--font-body);
      color: var(--text); outline: none; transition: border-color 0.15s;
    }
    .search-input::placeholder { color: var(--muted); }
    .search-input:focus { border-color: rgba(79,142,247,0.5); }

    /* ── Student list ── */
    .stu-list { display: flex; flex-direction: column; gap: 2px; }

    .stu-row {
      display: flex; align-items: center; gap: 14px;
      padding: 13px 18px; border-radius: 12px; cursor: pointer;
      transition: background 0.1s;
    }
    .stu-row:hover    { background: var(--surface2); }
    .stu-row.expanded { background: var(--surface2); border-radius: 12px 12px 0 0; }

    .stu-avatar {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-head); font-size: 0.95rem; font-weight: 800; color: white;
    }
    .stu-name  { font-weight: 600; font-size: 0.9rem; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stu-id    { font-size: 0.72rem; color: var(--muted); font-family: var(--font-head); }
    .stu-grade { font-size: 0.72rem; color: var(--muted); flex-shrink: 0; }
    .stu-arrow { color: var(--muted); font-size: 0.9rem; transition: transform 0.15s; flex-shrink: 0; }
    .stu-arrow.open { transform: rotate(90deg); color: var(--accent); }

    .badge   { padding: 2px 9px; border-radius: 99px; font-size: 0.65rem; font-weight: 600; flex-shrink: 0; }
    .badge-g { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.28); color: var(--success); }
    .badge-o { background: rgba(251,146,60,0.12);  border: 1px solid rgba(251,146,60,0.28);  color: var(--warn); }

    /* ── Detail panel — FAST 0.13s ── */
    .stu-detail {
      background: rgba(255,255,255,0.03);
      border-radius: 0 0 12px 12px;
      border-top: 1px solid var(--border);
      animation: detail-in 0.13s ease both;
    }
    @keyframes detail-in { from { opacity: 0; transform: translateY(-4px); } to { opacity:1; transform:none; } }

    .detail-inner { padding: 16px 18px 18px; }
    .detail-grid  { display: grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap: 10px; margin-bottom: 14px; }

    .d-stat       { padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); }
    .d-stat-num   { font-family: var(--font-head); font-size: 1.45rem; font-weight: 800; }
    .d-stat-label { font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.9px; margin-top: 2px; }

    .subj-rows { display: flex; flex-direction: column; gap: 7px; }
    .subj-row  { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); }
    .subj-name { flex: 1; font-size: 0.82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini-bar  { flex:1; max-width: 90px; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.07); overflow: hidden; }
    .mini-fill { height: 100%; border-radius: 4px; }
    .subj-pct  { font-family: var(--font-head); font-size: 0.78rem; font-weight: 700; min-width: 32px; text-align: right; }

    /* ── Pager ── */
    .pager { display: flex; justify-content: center; gap: 6px; margin-top: 20px; }
    .pg { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-family: var(--font-head); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.13s; }
    .pg:hover:not(:disabled) { border-color: var(--border-hi); color: var(--text); }
    .pg.act { background: var(--accent); border-color: var(--accent); color: #fff; }
    .pg:disabled { opacity: 0.28; cursor: default; }

    .spinner { width: 36px; height: 36px; border: 3px solid rgba(79,142,247,0.15); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .centered { display: flex; justify-content: center; align-items: center; padding: 48px; }
    .empty    { display: flex; justify-content: center; padding: 36px; font-size: 0.88rem; color: var(--muted); }

    .fade { animation: fadein 0.2s ease both; }
    @keyframes fadein { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

    .stagger > *:nth-child(1)   { animation: fadein 0.2s 0.00s ease both; }
    .stagger > *:nth-child(2)   { animation: fadein 0.2s 0.04s ease both; }
    .stagger > *:nth-child(3)   { animation: fadein 0.2s 0.07s ease both; }
    .stagger > *:nth-child(4)   { animation: fadein 0.2s 0.10s ease both; }
    .stagger > *:nth-child(5)   { animation: fadein 0.2s 0.13s ease both; }
    .stagger > *:nth-child(6)   { animation: fadein 0.2s 0.16s ease both; }
    .stagger > *:nth-child(7)   { animation: fadein 0.2s 0.19s ease both; }
    .stagger > *:nth-child(8)   { animation: fadein 0.2s 0.22s ease both; }
    .stagger > *:nth-child(n+9) { animation: fadein 0.2s 0.25s ease both; }
  `}</style>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SUBJ_MAP = {
  Mathematics: { color: '#f87171', bg: 'rgba(248,113,113,0.13)', icon: '📐' },
  Science:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.13)',  icon: '🔬' },
  English:     { color: '#34d399', bg: 'rgba(52,211,153,0.13)',  icon: '📖' },
  ICT:         { color: '#a78bfa', bg: 'rgba(167,139,250,0.13)', icon: '💻' },
  Business:    { color: '#fb923c', bg: 'rgba(251,146,60,0.13)',  icon: '📊' },
  Scholarship: { color: '#fbbf24', bg: 'rgba(251,191,36,0.13)',  icon: '🏆' },
};
const getSubjStyle = name => { for (const [k,v] of Object.entries(SUBJ_MAP)) if (name.includes(k)) return v; return { color:'#4f8ef7', bg:'rgba(79,142,247,0.13)', icon:'📚' }; };
const attColor    = pct => pct >= 75 ? '#34d399' : pct >= 50 ? '#4f8ef7' : '#fb923c';
const fmtGrade    = g => g?.replace(/\D/g,'').padStart(2,'0') || g;

function shouldShowSubject(name, grade) {
  const n = parseInt(grade?.replace(/\D/g,'') || '0');
  if (n >= 6 && n <= 9)    return ['Mathematics','Science','English','ICT'].some(k => name.includes(k));
  if (n === 10 || n === 11) return ['Mathematics','Science','English','ICT','Business'].some(k => name.includes(k));
  if (n >= 3 && n <= 5)    return name.toLowerCase().includes('scholarship');
  return true;
}

const SearchIco = () => (
  <svg className="search-ico" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function Pager({ page, total, onChange }) {
  if (total <= 1) return null;
  const pages   = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 1);
  return (
    <div className="pager">
      <button className="pg" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span style={{color:'var(--muted)',fontSize:'0.8rem',display:'flex',alignItems:'center'}}>…</span>}
            <button className={`pg${p === page ? ' act' : ''}`} onClick={() => onChange(p)}>{p}</button>
          </React.Fragment>
        );
      })}
      <button className="pg" disabled={page === total} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Student expandable row ───────────────────────────────────────────────────
function StudentRow({ student }) {
  const [open, setOpen] = useState(false);

  const stats = React.useMemo(() => {
    let total = 0, attended = 0;
    (student.enrollments || []).forEach(e => {
      (e.monthlyRecords || []).forEach(r => {
        (r.attendance || []).forEach(s => {
          if (s !== 'pending') total++;
          if (s === 'present' || s === true || s === 'true') attended++;
        });
      });
    });
    const pct = total === 0 ? 0 : Math.round((attended / total) * 100);
    const curMonth = new Date().getMonth();
    const subjects = (student.enrollments || []).map(e => {
      let st = 0, sa = 0;
      (e.monthlyRecords || []).forEach(r => {
        (r.attendance || []).forEach(s => {
          if (s !== 'pending') st++;
          if (s === 'present' || s === true || s === 'true') sa++;
        });
      });
      const mr = e.monthlyRecords?.find(r => r.monthIndex === curMonth);
      return { name: e.subject, pct: st === 0 ? 0 : Math.round((sa/st)*100), feesPaid: mr?.feePaid || false };
    });
    return { pct, attended, total, subjects };
  }, [student]);

  return (
    <>
      <div className={`stu-row${open ? ' expanded' : ''}`} onClick={() => setOpen(o => !o)}>
        <div className="stu-avatar">{student.name?.charAt(0) || '?'}</div>
        <div style={{flex:1, minWidth:0}}>
          <div className="stu-name">{student.name}</div>
          <div className="stu-id">{student.indexNumber}</div>
        </div>
        <div className="stu-grade">{student.grade}</div>
        <span className={`badge ${stats.pct >= 75 ? 'badge-g' : 'badge-o'}`}>{stats.pct}%</span>
        <span className={`stu-arrow${open ? ' open' : ''}`}>›</span>
      </div>

      {open && (
        <div className="stu-detail">
          <div className="detail-inner">
            <div className="detail-grid">
              <div className="d-stat"><div className="d-stat-num" style={{color: attColor(stats.pct)}}>{stats.pct}%</div><div className="d-stat-label">Overall Attendance</div></div>
              <div className="d-stat"><div className="d-stat-num" style={{color:'var(--accent)'}}>{stats.attended}</div><div className="d-stat-label">Attended</div></div>
              <div className="d-stat"><div className="d-stat-num" style={{color:'var(--muted)'}}>{stats.total}</div><div className="d-stat-label">Total Classes</div></div>
              <div className="d-stat"><div className="d-stat-num" style={{color:'var(--success)'}}>{stats.subjects.filter(s=>s.feesPaid).length}/{stats.subjects.length}</div><div className="d-stat-label">Fees Paid</div></div>
            </div>
            {stats.subjects.length > 0 && (
              <div className="subj-rows">
                {stats.subjects.map(s => {
                  const ss = getSubjStyle(s.name);
                  return (
                    <div className="subj-row" key={s.name}>
                      <span style={{fontSize:'0.9rem',flexShrink:0}}>{ss.icon}</span>
                      <span className="subj-name">{s.name}</span>
                      <div className="mini-bar"><div className="mini-fill" style={{width:`${s.pct}%`, background: attColor(s.pct)}}/></div>
                      <span className="subj-pct" style={{color: attColor(s.pct)}}>{s.pct}%</span>
                      <span className={`badge ${s.feesPaid ? 'badge-g' : 'badge-o'}`}>{s.feesPaid ? '✓' : '⏳'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ViewStudents() {
  const [viewMode, setViewMode]               = useState('grades');
  const [selectedGrade, setSelectedGrade]     = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [grades, setGrades]               = useState([]);
  const [subjects, setSubjects]           = useState([]);
  const [students, setStudents]           = useState([]);
  const [subjectColors, setSubjectColors] = useState({});

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students/grades`).then(r => setGrades(r.data)).catch(console.error);
    axios.get(`${API_BASE_URL}/api/subjects`).then(r => {
      setSubjects(r.data);
      const m = {}; r.data.forEach(s => { m[s.name] = s; }); setSubjectColors(m);
    }).catch(console.error);
  }, []);

  const fetchStudents = useCallback(async (bg = false) => {
    if (!bg) setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/students`, { params: { page, search, grade: selectedGrade, subject: selectedSubject } });
      setStudents(r.data.students);
      setTotalPages(r.data.totalPages);
    } catch(e) { console.error(e); }
    finally { if (!bg) setLoading(false); }
  }, [page, search, selectedGrade, selectedSubject]);

  useEffect(() => { if (viewMode === 'students') fetchStudents(); }, [viewMode, fetchStudents]);

  // grade card → students directly (no subject filter)
  const goGradeStudents  = g => { setSelectedGrade(g); setSelectedSubject(null); setViewMode('students'); setPage(1); };
  const goAllStudents    = () => { setSelectedGrade(null); setSelectedSubject(null); setViewMode('students'); setPage(1); };
  // right-click / long-press on grade → drill into subjects (keep this as optional path)
  const goGradeSubjects  = g => { setSelectedGrade(g); setViewMode('subjects'); };
  const goSubject        = s => { setSelectedSubject(s); setViewMode('students'); setPage(1); };

  const handleBack = () => {
    if (viewMode === 'students') {
      setViewMode(selectedSubject ? 'subjects' : 'grades');
      if (!selectedSubject) setSelectedGrade(null);
    } else if (viewMode === 'subjects') {
      setViewMode('grades'); setSelectedGrade(null);
    }
  };

  const Breadcrumb = () => (
    <div className="bc">
      {viewMode === 'grades' && <span>Students</span>}
      {viewMode === 'subjects' && (<><span className="bc-dim">Students</span><span className="bc-sep">/</span><span className="bc-active">{selectedGrade}</span></>)}
      {viewMode === 'students' && !selectedGrade && (<><span className="bc-dim">Students</span><span className="bc-sep">/</span><span className="bc-active">All</span></>)}
      {viewMode === 'students' && selectedGrade && !selectedSubject && (<><span className="bc-dim">Students</span><span className="bc-sep">/</span><span className="bc-active">{selectedGrade}</span></>)}
      {viewMode === 'students' && selectedGrade && selectedSubject && (<><span className="bc-dim">Students</span><span className="bc-sep">/</span><span className="bc-dim">{selectedGrade}</span><span className="bc-sep">/</span><span className="bc-active">{selectedSubject}</span></>)}
    </div>
  );

  const visSubjects = subjects.filter(s => shouldShowSubject(s.name, selectedGrade));

  return (
    <div className="vs-root">
      <GlobalStyle/>
      <div className="vs-orb vs-orb-1"/>
      <div className="vs-orb vs-orb-2"/>
      <div className="vs-wrap">

        {viewMode === 'grades' && (
          <div className="fade">
            <h1 className="page-title">Students</h1>
            <p className="page-sub">Select a grade to drill down, or view all records</p>
          </div>
        )}

        {viewMode !== 'grades' && (
          <div className="vs-header fade">
            <button className="back-btn" onClick={handleBack}>←</button>
            <Breadcrumb/>
          </div>
        )}

        {/* ══ GRADES ══ */}
        {viewMode === 'grades' && (
          <div className="card-grid stagger">
            <div className="glass sel-card hero-card" onClick={goAllStudents}>
              <div style={{fontSize:'2rem'}}>👥</div>
              <div><div className="card-title">All Students</div><div className="card-sub">View every record</div></div>
            </div>
            {grades.map(g => (
              <div key={g} className="glass sel-card" onClick={() => goGradeStudents(g)}>
                <div className="grade-num">{fmtGrade(g)}</div>
                <div><div className="card-title">{g}</div><div className="card-sub">View students →</div></div>
              </div>
            ))}
          </div>
        )}

        {/* ══ SUBJECTS ══ */}
        {viewMode === 'subjects' && (
          <div className="card-grid stagger fade">
            {visSubjects.map(sub => {
              const ss = getSubjStyle(sub.name);
              return (
                <div key={sub._id} className="glass sel-card fade"
                  onClick={() => goSubject(sub.name)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ss.color+'55'; e.currentTarget.style.boxShadow = `0 14px 40px ${ss.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="card-icon-wrap" style={{background:ss.bg, border:`1px solid ${ss.color}33`}}>
                    <span style={{fontSize:'1.5rem'}}>{ss.icon}</span>
                  </div>
                  <div><div className="card-title">{sub.name}</div><div className="card-sub" style={{color:ss.color,opacity:.85}}>View students →</div></div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ STUDENTS ══ */}
        {viewMode === 'students' && (
          <div className="fade">
            <div className="search-wrap">
              <SearchIco/>
              <input className="search-input" placeholder="Search by name or ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
            </div>
            {loading ? (
              <div className="centered"><div className="spinner"/></div>
            ) : (
              <div className="glass" style={{overflow:'hidden', padding:'6px 0'}}>
                <div className="stu-list">
                  {students.map(s => <StudentRow key={s._id} student={s}/>)}
                  {students.length === 0 && <div className="empty">No students found</div>}
                </div>
              </div>
            )}
            <Pager page={page} total={totalPages} onChange={setPage}/>
          </div>
        )}

      </div>
    </div>
  );
}