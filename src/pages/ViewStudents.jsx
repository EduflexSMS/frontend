import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

// ─── Global Styles ─────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    :root {
      --bg:         #0f1923;
      --bg2:        #131f2e;
      --bg3:        #1a2840;
      --surface:    rgba(255,255,255,0.04);
      --surface2:   rgba(255,255,255,0.07);
      --border:     rgba(255,255,255,0.07);
      --border-hi:  rgba(255,255,255,0.14);
      --accent:     #38bdf8;
      --accent2:    #818cf8;
      --green:      #4ade80;
      --orange:     #fb923c;
      --gold:       #fbbf24;
      --text:       #e2eaf6;
      --muted:      rgba(226,234,246,0.38);
      --r:          14px;
      --font:       'Outfit', sans-serif;
      --mono:       'JetBrains Mono', monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vs-root {
      min-height: 100vh;
      background: var(--bg);
      font-family: var(--font);
      color: var(--text);
    }

    /* ── Noise texture overlay ── */
    .vs-root::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 0; opacity: 0.5;
    }

    .vs-wrap { max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; position: relative; z-index: 1; }

    /* ── Glow blobs ── */
    .glow-blob {
      position: fixed; border-radius: 50%; filter: blur(120px);
      pointer-events: none; z-index: 0;
    }
    .glow-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 60%); top: -200px; left: -100px; }
    .glow-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 60%); bottom: -100px; right: -80px; }

    /* ── Page header ── */
    .page-header { margin-bottom: 30px; }
    .page-title-row { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
    .page-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.15)); border: 1px solid rgba(56,189,248,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .page-title { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; letter-spacing: -0.5px; }
    .page-sub { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; margin-left: 56px; }

    /* ── Back + breadcrumb ── */
    .nav-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .back-btn {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--muted); cursor: pointer; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; font-family: var(--font);
    }
    .back-btn:hover { color: var(--text); border-color: var(--border-hi); transform: translateX(-2px); }

    .breadcrumb { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: clamp(1.1rem, 2vw, 1.5rem); letter-spacing: -0.3px; }
    .bc-dim { opacity: 0.25; }
    .bc-sep { opacity: 0.15; font-weight: 300; }
    .bc-active { color: var(--accent); }

    /* ── Grade / subject cards ── */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
    @media (max-width: 600px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }

    .sel-card {
      padding: 24px 16px 20px;
      border-radius: var(--r);
      background: var(--surface);
      border: 1px solid var(--border);
      cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
      text-align: center; min-height: 160px;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s, background 0.15s;
      position: relative; overflow: hidden;
    }
    .sel-card::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
      pointer-events: none;
    }
    .sel-card:hover { border-color: var(--border-hi); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); background: var(--surface2); }

    .hero-card { background: linear-gradient(135deg, rgba(56,189,248,0.1), rgba(129,140,248,0.07)); border-color: rgba(56,189,248,0.2); }
    .hero-card:hover { border-color: rgba(56,189,248,0.4); box-shadow: 0 16px 40px rgba(56,189,248,0.15); }

    .grade-badge {
      width: 64px; height: 64px; border-radius: 16px;
      background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 800; color: var(--accent); letter-spacing: -1px;
    }
    .card-icon-box { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .card-title { font-size: 0.95rem; font-weight: 700; color: var(--text); line-height: 1.2; }
    .card-sub   { font-size: 0.68rem; color: var(--muted); margin-top: 2px; }

    /* ── Search bar ── */
    .search-wrap { position: relative; margin-bottom: 16px; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 11px 14px 11px 42px;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; font-size: 0.88rem; font-family: var(--font);
      color: var(--text); outline: none; transition: border-color 0.15s;
    }
    .search-input::placeholder { color: var(--muted); }
    .search-input:focus { border-color: rgba(56,189,248,0.4); background: var(--bg3); }

    /* ── Table header ── */
    .table-wrap { border-radius: var(--r); overflow: hidden; border: 1px solid var(--border); background: var(--bg2); }
    .table-head {
      display: grid;
      grid-template-columns: 48px 1fr 140px 80px 70px 36px;
      align-items: center;
      padding: 10px 18px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.03);
    }
    .th { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--muted); }
    @media (max-width: 640px) {
      .table-head { grid-template-columns: 40px 1fr 90px 60px 28px; }
      .th-index, .col-index { display: none; }
    }

    /* ── Student row ── */
    .stu-item { border-bottom: 1px solid var(--border); }
    .stu-item:last-child { border-bottom: none; }

    .stu-row {
      display: grid;
      grid-template-columns: 48px 1fr 140px 80px 70px 36px;
      align-items: center;
      padding: 12px 18px;
      cursor: pointer;
      transition: background 0.1s;
      gap: 8px;
    }
    .stu-row:hover    { background: rgba(255,255,255,0.04); }
    .stu-row.open     { background: rgba(56,189,248,0.04); }

    @media (max-width: 640px) {
      .stu-row { grid-template-columns: 40px 1fr 90px 60px 28px; }
    }

    .avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.9rem; color: white;
    }
    .stu-name-cell { min-width: 0; }
    .stu-name  { font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stu-grade-label { font-size: 0.65rem; color: var(--muted); margin-top: 1px; }
    .stu-index { font-family: var(--mono); font-size: 0.72rem; color: var(--accent); background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.15); padding: 3px 8px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stu-att   { font-weight: 700; font-size: 0.8rem; font-family: var(--mono); }

    .pill { padding: 2px 8px; border-radius: 99px; font-size: 0.63rem; font-weight: 700; }
    .pill-green  { background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.25); color: var(--green); }
    .pill-orange { background: rgba(251,146,60,0.12);  border: 1px solid rgba(251,146,60,0.25);  color: var(--orange); }

    .chevron { color: var(--muted); font-size: 0.85rem; transition: transform 0.15s, color 0.15s; user-select: none; }
    .chevron.open { transform: rotate(90deg); color: var(--accent); }

    /* ── Expanded detail ── */
    .stu-detail {
      background: rgba(56,189,248,0.03);
      border-top: 1px solid rgba(56,189,248,0.1);
      animation: slide-in 0.15s ease both;
    }
    @keyframes slide-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

    .detail-body { padding: 20px 18px 22px; }

    /* Section label */
    .section-label {
      font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.4px; color: var(--muted); margin-bottom: 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* Stats row */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    @media (max-width: 480px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }

    .stat-box { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
    .stat-val  { font-family: var(--mono); font-size: 1.4rem; font-weight: 700; line-height: 1; }
    .stat-lbl  { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); margin-top: 4px; }

    /* Monthly cards */
    .months-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
    .months-row::-webkit-scrollbar { height: 4px; }
    .months-row::-webkit-scrollbar-track { background: transparent; }
    .months-row::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 4px; }

    .month-card {
      flex-shrink: 0; min-width: 110px;
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 12px; padding: 12px 12px 10px;
    }
    .month-card.current { border-color: rgba(56,189,248,0.3); background: rgba(56,189,248,0.05); }

    .month-name { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.3px; color: var(--muted); margin-bottom: 10px; }

    .month-icons { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
    .fee-icon { font-size: 1.1rem; line-height: 1; }
    .att-icon { font-size: 0.72rem; color: var(--muted); }

    .att-dots { display: flex; flex-wrap: wrap; gap: 5px; }
    .dot {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem;
    }
    .dot-present { background: rgba(74,222,128,0.15); border: 1.5px solid rgba(74,222,128,0.5); color: var(--green); }
    .dot-absent  { background: rgba(251,146,60,0.1);  border: 1.5px solid rgba(251,146,60,0.3);  color: var(--orange); }
    .dot-pending { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1); color: var(--muted); }

    /* Subject list */
    .subj-list { display: flex; flex-direction: column; gap: 7px; }
    .subj-row  { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; }
    .subj-icon { font-size: 0.9rem; flex-shrink: 0; }
    .subj-name { flex: 1; font-size: 0.82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini-bar  { width: 80px; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; flex-shrink: 0; }
    .mini-fill { height: 100%; border-radius: 4px; }
    .subj-pct  { font-family: var(--mono); font-size: 0.75rem; font-weight: 700; min-width: 34px; text-align: right; flex-shrink: 0; }

    /* ── Pager ── */
    .pager { display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 24px; }
    .pg-btn {
      width: 32px; height: 32px; border-radius: 9px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--muted); cursor: pointer; font-family: var(--font);
      font-size: 0.78rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.12s;
    }
    .pg-btn:hover:not(:disabled) { border-color: var(--border-hi); color: var(--text); }
    .pg-btn.active { background: var(--accent); border-color: var(--accent); color: #0f1923; }
    .pg-btn:disabled { opacity: 0.25; cursor: default; }

    .spinner { width: 34px; height: 34px; border: 3px solid rgba(56,189,248,0.12); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .centered { display: flex; justify-content: center; align-items: center; padding: 52px 0; }
    .empty-msg { text-align: center; padding: 40px; font-size: 0.85rem; color: var(--muted); }

    /* ── Animations ── */
    .fade-up { animation: fadein 0.22s ease both; }
    @keyframes fadein { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
    .stagger > *:nth-child(1)   { animation: fadein 0.22s 0.00s ease both; }
    .stagger > *:nth-child(2)   { animation: fadein 0.22s 0.04s ease both; }
    .stagger > *:nth-child(3)   { animation: fadein 0.22s 0.07s ease both; }
    .stagger > *:nth-child(4)   { animation: fadein 0.22s 0.10s ease both; }
    .stagger > *:nth-child(5)   { animation: fadein 0.22s 0.13s ease both; }
    .stagger > *:nth-child(6)   { animation: fadein 0.22s 0.16s ease both; }
    .stagger > *:nth-child(n+7) { animation: fadein 0.22s 0.19s ease both; }
  `}</style>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const SUBJ_MAP = {
  Mathematics: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '📐' },
  Science:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  icon: '🔬' },
  English:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  icon: '📖' },
  ICT:         { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '💻' },
  Business:    { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  icon: '📊' },
  Scholarship: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '🏆' },
};
const getSubjStyle = name => {
  for (const [k, v] of Object.entries(SUBJ_MAP)) if (name?.includes(k)) return v;
  return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', icon: '📚' };
};
const attColor  = pct => pct >= 75 ? '#4ade80' : pct >= 50 ? '#38bdf8' : '#fb923c';
const fmtGrade  = g => g?.replace(/\D/g, '').padStart(2, '0') || g;

function shouldShowSubject(name, grade) {
  const n = parseInt(grade?.replace(/\D/g, '') || '0');
  if (n >= 6 && n <= 9)     return ['Mathematics','Science','English','ICT'].some(k => name.includes(k));
  if (n === 10 || n === 11) return ['Mathematics','Science','English','ICT','Business'].some(k => name.includes(k));
  if (n >= 3 && n <= 5)     return name.toLowerCase().includes('scholarship');
  return true;
}

// ─── Pager ────────────────────────────────────────────────────────────────────
function Pager({ page, total, onChange }) {
  if (total <= 1) return null;
  const pages   = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 1);
  return (
    <div className="pager">
      <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>…</span>}
            <button className={`pg-btn${p === page ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
          </React.Fragment>
        );
      })}
      <button className="pg-btn" disabled={page === total} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────
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
    const subjects = (student.enrollments || []).map(e => {
      let st = 0, sa = 0;
      (e.monthlyRecords || []).forEach(r => {
        (r.attendance || []).forEach(s => {
          if (s !== 'pending') st++;
          if (s === 'present' || s === true || s === 'true') sa++;
        });
      });
      const feesTotal = e.monthlyRecords?.length || 0;
      const feesPaid  = e.monthlyRecords?.filter(r => r.feePaid).length || 0;
      return { name: e.subject, pct: st === 0 ? 0 : Math.round((sa / st) * 100), feesTotal, feesPaid, monthlyRecords: e.monthlyRecords || [] };
    });
    const feesPaidCount = subjects.reduce((acc, s) => acc + (s.feesPaid > 0 ? 1 : 0), 0);
    return { pct, attended, total, subjects, feesPaidCount };
  }, [student]);

  return (
    <div className="stu-item">
      <div className={`stu-row${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <div className="avatar">{student.name?.charAt(0) || '?'}</div>
        <div className="stu-name-cell">
          <div className="stu-name">{student.name}</div>
          <div className="stu-grade-label">{student.grade}</div>
        </div>
        <div className="stu-index th-index col-index">{student.indexNumber}</div>
        <div className="stu-att" style={{ color: attColor(stats.pct) }}>{stats.pct}%</div>
        <span className={`pill ${stats.pct >= 75 ? 'pill-green' : 'pill-orange'}`}>{stats.pct >= 75 ? 'Good' : 'Low'}</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </div>

      {open && (
        <div className="stu-detail">
          <div className="detail-body">
            {/* Stats */}
            <div className="section-label">📊 Overview</div>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-val" style={{ color: attColor(stats.pct) }}>{stats.pct}%</div>
                <div className="stat-lbl">Attendance</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: '#38bdf8' }}>{stats.attended}</div>
                <div className="stat-lbl">Attended</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--muted)' }}>{stats.total}</div>
                <div className="stat-lbl">Total Classes</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: '#4ade80' }}>{stats.feesPaidCount}/{stats.subjects.length}</div>
                <div className="stat-lbl">Fees Paid</div>
              </div>
            </div>

            {/* Monthly breakdown per subject */}
            {stats.subjects.map(subj => {
              const ss = getSubjStyle(subj.name);
              return (
                <div key={subj.name} style={{ marginBottom: 20 }}>
                  <div className="section-label">
                    <span style={{ color: ss.color }}>{ss.icon} {subj.name}</span>
                  </div>
                  <div className="months-row">
                    {MONTHS.map((m, mi) => {
                      const rec = subj.monthlyRecords?.find(r => r.monthIndex === mi);
                      const nowMonth = new Date().getMonth();
                      const isCurrent = mi === nowMonth;
                      const att = rec?.attendance || [];
                      const hasFuture = !rec && mi > nowMonth;
                      return (
                        <div key={m} className={`month-card${isCurrent ? ' current' : ''}`} style={{ opacity: hasFuture ? 0.35 : 1 }}>
                          <div className="month-name">{m}</div>
                          <div className="month-icons">
                            <span className="fee-icon" title={rec?.feePaid ? 'Fee paid' : 'Fee pending'}>
                              {rec?.feePaid ? '💛' : '🩶'}
                            </span>
                            {att.length > 0 && (
                              <span className="att-icon">{att.filter(a => a === 'present' || a === true || a === 'true').length}/{att.filter(a => a !== 'pending').length}</span>
                            )}
                          </div>
                          <div className="att-dots">
                            {att.length === 0 ? (
                              <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>No data</span>
                            ) : att.map((s, i) => {
                              const isPresent = s === 'present' || s === true || s === 'true';
                              const isPending = s === 'pending';
                              return (
                                <div key={i} className={`dot ${isPending ? 'dot-pending' : isPresent ? 'dot-present' : 'dot-absent'}`}>
                                  {isPending ? '' : isPresent ? '✓' : '✗'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Subject progress */}
            {stats.subjects.length > 0 && (
              <>
                <div className="section-label">📈 Subject Progress</div>
                <div className="subj-list">
                  {stats.subjects.map(s => {
                    const ss = getSubjStyle(s.name);
                    return (
                      <div className="subj-row" key={s.name} style={{ borderColor: `${ss.color}22` }}>
                        <span className="subj-icon">{ss.icon}</span>
                        <span className="subj-name">{s.name}</span>
                        <div className="mini-bar">
                          <div className="mini-fill" style={{ width: `${s.pct}%`, background: attColor(s.pct) }} />
                        </div>
                        <span className="subj-pct" style={{ color: attColor(s.pct) }}>{s.pct}%</span>
                        <span className={`pill ${s.feesPaid > 0 ? 'pill-green' : 'pill-orange'}`}>{s.feesPaid > 0 ? '✓ Paid' : '⏳'}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ViewStudents() {
  const [viewMode, setViewMode]               = useState('grades');
  const [selectedGrade, setSelectedGrade]     = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [grades, setGrades]       = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [students, setStudents]   = useState([]);

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students/grades`).then(r => setGrades(r.data)).catch(console.error);
    axios.get(`${API_BASE_URL}/api/subjects`).then(r => setSubjects(r.data)).catch(console.error);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/students`, {
        params: { page, search, grade: selectedGrade, subject: selectedSubject }
      });
      setStudents(r.data.students);
      setTotalPages(r.data.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, selectedGrade, selectedSubject]);

  useEffect(() => { if (viewMode === 'students') fetchStudents(); }, [viewMode, fetchStudents]);

  const goGradeStudents = g => { setSelectedGrade(g); setSelectedSubject(null); setViewMode('students'); setPage(1); };
  const goAllStudents   = () => { setSelectedGrade(null); setSelectedSubject(null); setViewMode('students'); setPage(1); };
  const goSubject       = s => { setSelectedSubject(s); setViewMode('students'); setPage(1); };

  const handleBack = () => {
    if (viewMode === 'students') {
      setViewMode(selectedSubject ? 'subjects' : 'grades');
      if (!selectedSubject) setSelectedGrade(null);
    } else if (viewMode === 'subjects') {
      setViewMode('grades'); setSelectedGrade(null);
    }
  };

  const visSubjects = subjects.filter(s => shouldShowSubject(s.name, selectedGrade));

  const Breadcrumb = () => (
    <div className="breadcrumb">
      {viewMode === 'grades' && <span>Students</span>}
      {viewMode === 'subjects' && (<><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">{selectedGrade}</span></>)}
      {viewMode === 'students' && !selectedGrade && (<><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">All</span></>)}
      {viewMode === 'students' && selectedGrade && !selectedSubject && (<><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">{selectedGrade}</span></>)}
      {viewMode === 'students' && selectedGrade && selectedSubject && (<><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-dim">{selectedGrade}</span><span className="bc-sep"> / </span><span className="bc-active">{selectedSubject}</span></>)}
    </div>
  );

  return (
    <div className="vs-root">
      <GlobalStyle />
      <div className="glow-blob glow-1" />
      <div className="glow-blob glow-2" />
      <div className="vs-wrap">

        {/* Header */}
        {viewMode === 'grades' ? (
          <div className="page-header fade-up">
            <div className="page-title-row">
              <div className="page-icon">👥</div>
              <h1 className="page-title">Students</h1>
            </div>
            <p className="page-sub">Select a grade to browse students</p>
          </div>
        ) : (
          <div className="nav-row fade-up">
            <button className="back-btn" onClick={handleBack}>←</button>
            <Breadcrumb />
          </div>
        )}

        {/* ══ GRADES ══ */}
        {viewMode === 'grades' && (
          <div className="card-grid stagger">
            <div className="sel-card hero-card" onClick={goAllStudents}>
              <div style={{ fontSize: '2rem' }}>👥</div>
              <div>
                <div className="card-title">All Students</div>
                <div className="card-sub">View every record</div>
              </div>
            </div>
            {grades.map(g => (
              <div key={g} className="sel-card" onClick={() => goGradeStudents(g)}>
                <div className="grade-badge">{fmtGrade(g)}</div>
                <div>
                  <div className="card-title">{g}</div>
                  <div className="card-sub">View students →</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ SUBJECTS ══ */}
        {viewMode === 'subjects' && (
          <div className="card-grid stagger fade-up">
            {visSubjects.map(sub => {
              const ss = getSubjStyle(sub.name);
              return (
                <div key={sub._id} className="sel-card fade-up"
                  onClick={() => goSubject(sub.name)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = ss.color + '44'; e.currentTarget.style.boxShadow = `0 16px 40px ${ss.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="card-icon-box" style={{ background: ss.bg, border: `1px solid ${ss.color}30` }}>
                    <span style={{ fontSize: '1.5rem' }}>{ss.icon}</span>
                  </div>
                  <div>
                    <div className="card-title">{sub.name}</div>
                    <div className="card-sub" style={{ color: ss.color, opacity: 0.85 }}>View students →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ STUDENTS ══ */}
        {viewMode === 'students' && (
          <div className="fade-up">
            <div className="search-wrap">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className="search-input"
                placeholder="Search by name or ID…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {loading ? (
              <div className="centered"><div className="spinner" /></div>
            ) : (
              <div className="table-wrap">
                <div className="table-head">
                  <div className="th" />
                  <div className="th">Student Name</div>
                  <div className="th th-index">Index No.</div>
                  <div className="th">Attendance</div>
                  <div className="th">Status</div>
                  <div className="th" />
                </div>
                {students.length === 0
                  ? <div className="empty-msg">No students found</div>
                  : students.map(s => <StudentRow key={s._id} student={s} />)
                }
              </div>
            )}
            <Pager page={page} total={totalPages} onChange={setPage} />
          </div>
        )}

      </div>
    </div>
  );
}