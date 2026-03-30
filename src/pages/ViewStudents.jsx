import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

    :root {
      --bg:        #080c14;
      --surface:   rgba(255,255,255,0.045);
      --border:    rgba(255,255,255,0.09);
      --border-hi: rgba(255,255,255,0.18);
      --accent:    #4f8ef7;
      --accent2:   #a78bfa;
      --success:   #34d399;
      --warn:      #fb923c;
      --text:      #f0f4ff;
      --muted:     rgba(240,244,255,0.45);
      --card-r:    20px;
      --font-head: 'Syne', sans-serif;
      --font-body: 'DM Sans', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vs-root {
      min-height: 100vh;
      background: var(--bg);
      padding: 28px 20px 60px;
      font-family: var(--font-body);
      color: var(--text);
      position: relative;
    }

    .vs-root::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.025;
    }

    .vs-orb {
      position: fixed; border-radius: 50%; filter: blur(90px);
      pointer-events: none; z-index: 0;
      animation: vs-pulse 8s ease-in-out infinite alternate;
    }
    .vs-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(79,142,247,0.16), transparent 70%); top: -160px; left: -100px; }
    .vs-orb-2 { width: 380px; height: 380px; background: radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%); bottom: -60px; right: -60px; animation-delay: -4s; }

    @keyframes vs-pulse { from { transform: scale(1); } to { transform: scale(1.1); } }

    /* ── Layout ── */
    .vs-wrap { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }

    /* ── Glass ── */
    .glass {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--card-r);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    }

    /* ── Header ── */
    .vs-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }

    .back-btn {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      background: var(--surface); border: 1px solid var(--border);
      color: var(--muted); cursor: pointer; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; font-family: var(--font-body);
    }
    .back-btn:hover { border-color: var(--border-hi); color: var(--text); transform: translateX(-2px); }

    .vs-breadcrumb { font-family: var(--font-head); font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
    .bc-dim   { opacity: 0.3; }
    .bc-sep   { opacity: 0.15; font-weight: 400; }
    .bc-active { color: var(--accent); }

    /* ── Stat strip (grades view) ── */
    .stat-strip { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
    .stat-pill { padding: 8px 18px; border-radius: 99px; font-size: 0.78rem; font-weight: 500; border: 1px solid var(--border); background: var(--surface); color: var(--muted); }

    /* ── Section label ── */
    .section-lbl { font-family: var(--font-head); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: var(--muted); margin-bottom: 16px; }

    /* ── Grade / Subject grid ── */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

    .sel-card {
      padding: 28px 22px; cursor: pointer; min-height: 200px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
      text-align: center;
    }
    .sel-card:hover { border-color: var(--border-hi); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
    .sel-card:active { transform: translateY(-1px); }

    /* Hero card (All Students) */
    .hero-card {
      background: linear-gradient(135deg, rgba(79,142,247,0.15), rgba(167,139,250,0.1));
      border-color: rgba(79,142,247,0.25);
    }
    .hero-card:hover { border-color: rgba(79,142,247,0.5); box-shadow: 0 12px 40px rgba(79,142,247,0.2); }

    .card-icon {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
    }
    .card-title { font-family: var(--font-head); font-size: 1rem; font-weight: 700; line-height: 1.2; }
    .card-sub   { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

    /* Grade badge */
    .grade-badge {
      width: 64px; height: 64px; border-radius: 18px;
      background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-head); font-size: 1.4rem; font-weight: 800; color: #22d3ee;
    }

    /* Subject icon pill */
    .subj-icon-wrap {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
    }

    /* ── Search bar ── */
    .search-wrap { position: relative; margin-bottom: 20px; }
    .search-wrap svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 13px 16px 13px 46px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; font-size: 0.9rem; font-family: var(--font-body);
      color: var(--text); outline: none; transition: border-color 0.2s;
    }
    .search-input::placeholder { color: var(--muted); }
    .search-input:focus { border-color: var(--accent); }

    /* ── Table wrapper ── */
    .table-wrap {
      border-radius: var(--card-r); overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
      backdrop-filter: blur(18px);
    }

    /* ── Pagination ── */
    .pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; }
    .pg-btn {
      width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border);
      background: var(--surface); color: var(--muted); cursor: pointer;
      font-family: var(--font-head); font-size: 0.82rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .pg-btn:hover { border-color: var(--border-hi); color: var(--text); }
    .pg-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
    .pg-btn:disabled { opacity: 0.3; cursor: default; }

    /* ── Loading ── */
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(79,142,247,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .centered { display: flex; justify-content: center; align-items: center; padding: 60px; }

    /* ── Fade animations ── */
    .fade-in  { animation: fadein 0.4s ease both; }
    .fade-in2 { animation: fadein 0.4s 0.08s ease both; }
    .fade-in3 { animation: fadein 0.4s 0.16s ease both; }
    @keyframes fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

    @media (max-width: 600px) {
      .card-grid { grid-template-columns: repeat(2, 1fr); }
      .sel-card  { min-height: 150px; padding: 20px 14px; }
    }
  `}</style>
);

// ─── Subject color & icon map ─────────────────────────────────────────────────
const SUBJECT_STYLES = {
  Mathematics:                    { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '📐' },
  Science:                        { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  icon: '🔬' },
  English:                        { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: '📖' },
  ICT:                            { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '💻' },
  'Business and Accounting Studies': { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  icon: '📊' },
  Scholarship:                    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '🏆' },
};

function getSubjectStyle(name) {
  for (const key of Object.keys(SUBJECT_STYLES)) {
    if (name.includes(key)) return SUBJECT_STYLES[key];
  }
  return { color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)', icon: '📚' };
}

// ─── Grade number helper ──────────────────────────────────────────────────────
function gradeNum(grade) { return parseInt(grade?.replace(/\D/g, '') || '0'); }

function shouldShowSubject(subjectName, selectedGrade) {
  if (!selectedGrade) return true;
  const n = gradeNum(selectedGrade);
  if (n >= 6 && n <= 9)   return ['Mathematics','Science','English','ICT'].some(s => subjectName.includes(s));
  if (n === 10 || n === 11) return ['Mathematics','Science','English','ICT','Business'].some(s => subjectName.includes(s));
  if (n >= 3 && n <= 5)   return subjectName.toLowerCase().includes('scholarship');
  return true;
}

// ─── SVG Search Icon ──────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pager({ page, total, onChange }) {
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 1);
  return (
    <div className="pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span style={{color:'var(--muted)',fontSize:'0.8rem'}}>…</span>}
            <button className={`pg-btn${p === page ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
          </React.Fragment>
        );
      })}
      <button className="pg-btn" disabled={page === total} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ViewStudents() {
  const [viewMode, setViewMode]         = useState('grades');   // 'grades' | 'subjects' | 'students'
  const [selectedGrade, setSelectedGrade]     = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [grades, setGrades]         = useState([]);
  const [subjects, setSubjects]     = useState([]);
  const [students, setStudents]     = useState([]);
  const [subjectColors, setSubjectColors] = useState({});

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);

  // ── Fetchers ──
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/grades`);
      setGrades(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subjects`);
      setSubjects(res.data);
      const map = {};
      res.data.forEach(s => { map[s.name] = s; });
      setSubjectColors(map);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`, {
        params: { page, search, grade: selectedGrade, subject: selectedSubject }
      });
      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
    } catch (e) { console.error(e); }
    finally { if (!background) setLoading(false); }
  }, [page, search, selectedGrade, selectedSubject]);

  useEffect(() => { fetchGrades(); fetchSubjects(); }, []);
  useEffect(() => { if (viewMode === 'students') fetchStudents(); }, [viewMode, fetchStudents]);

  // ── Handlers ──
  const handleGradeClick   = g  => { setSelectedGrade(g); setViewMode('subjects'); };
  const handleSubjectClick = s  => { setSelectedSubject(s); setViewMode('students'); setPage(1); };
  const handleAllStudents  = () => { setSelectedGrade(null); setSelectedSubject(null); setViewMode('students'); setPage(1); };

  const handleBack = () => {
    if (viewMode === 'students') {
      if (!selectedGrade) { setViewMode('grades'); }
      else                { setViewMode('subjects'); }
    } else if (viewMode === 'subjects') {
      setViewMode('grades'); setSelectedGrade(null);
    }
  };

  // ── Breadcrumb ──
  const Breadcrumb = () => (
    <div className="vs-breadcrumb">
      {viewMode === 'grades' && <span>Students</span>}
      {viewMode === 'subjects' && (
        <>
          <span className="bc-dim">Students</span>
          <span className="bc-sep">/</span>
          <span className="bc-active">{selectedGrade}</span>
        </>
      )}
      {viewMode === 'students' && (
        <>
          <span className="bc-dim">Students</span>
          {selectedGrade && (
            <>
              <span className="bc-sep">/</span>
              <span className="bc-dim">{selectedGrade}</span>
              <span className="bc-sep">/</span>
              <span className="bc-active">{selectedSubject || 'All'}</span>
            </>
          )}
          {!selectedGrade && (
            <>
              <span className="bc-sep">/</span>
              <span className="bc-active">All</span>
            </>
          )}
        </>
      )}
    </div>
  );

  const visibleSubjects = subjects.filter(s => shouldShowSubject(s.name, selectedGrade));

  return (
    <div className="vs-root">
      <GlobalStyle />
      <div className="vs-orb vs-orb-1" />
      <div className="vs-orb vs-orb-2" />

      <div className="vs-wrap">

        {/* ── Header ── */}
        <div className="vs-header fade-in">
          {viewMode !== 'grades' && (
            <button className="back-btn" onClick={handleBack} aria-label="Go back">←</button>
          )}
          <Breadcrumb />
        </div>

        {/* ══ GRADES VIEW ════════════════════════════════════════════════════ */}
        {viewMode === 'grades' && (
          <div className="fade-in2">
            <p className="section-lbl">Select a grade to drill down, or view all records</p>
            <div className="card-grid">

              {/* All Students hero card */}
              <div className="glass sel-card hero-card" onClick={handleAllStudents}>
                <div className="card-icon" style={{background:'rgba(79,142,247,0.15)',border:'1px solid rgba(79,142,247,0.25)'}}>
                  👥
                </div>
                <div>
                  <div className="card-title">All Students</div>
                  <div className="card-sub">View every record</div>
                </div>
              </div>

              {loading ? (
                <div className="centered"><div className="spinner"/></div>
              ) : grades.map((grade, i) => (
                <div
                  key={grade}
                  className="glass sel-card"
                  onClick={() => handleGradeClick(grade)}
                  style={{animationDelay:`${i * 0.05}s`}}
                >
                  <div className="grade-badge">{grade.replace(/\D/g,'')}</div>
                  <div>
                    <div className="card-title">{grade}</div>
                    <div className="card-sub">View subjects →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SUBJECTS VIEW ══════════════════════════════════════════════════ */}
        {viewMode === 'subjects' && (
          <div className="fade-in2">
            <p className="section-lbl">Choose a subject for {selectedGrade}</p>
            <div className="card-grid">
              {visibleSubjects.map((subject, i) => {
                const style = getSubjectStyle(subject.name);
                return (
                  <div
                    key={subject._id}
                    className="glass sel-card"
                    onClick={() => handleSubjectClick(subject.name)}
                    style={{animationDelay:`${i * 0.05}s`}}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = style.color + '66'; e.currentTarget.style.boxShadow = `0 12px 40px ${style.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div className="subj-icon-wrap" style={{background: style.bg, border:`1px solid ${style.color}33`}}>
                      {style.icon}
                    </div>
                    <div>
                      <div className="card-title">{subject.name}</div>
                      <div className="card-sub" style={{color: style.color, opacity: 0.8}}>View students →</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STUDENTS VIEW ══════════════════════════════════════════════════ */}
        {viewMode === 'students' && (
          <div className="fade-in2">
            {/* Search */}
            <div className="search-wrap fade-in">
              <SearchIcon />
              <input
                className="search-input"
                placeholder="Search by name or ID…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Table */}
            {loading ? (
              <div className="centered"><div className="spinner"/></div>
            ) : (
              <div className="table-wrap fade-in2">
                <StudentTable
                  students={students}
                  onUpdate={() => fetchStudents(true)}
                  subjectColorMap={subjectColors}
                />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pager page={page} total={totalPages} onChange={p => setPage(p)} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}