import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import StudentTable from '../components/StudentTable';

// ─── Global Styles ─────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

    :root {
      --bg:          #09090b;
      --bg2:         #0f0f12;
      --bg3:         #141418;
      --bg4:         #1a1a20;
      --surface:     rgba(255,255,255,0.03);
      --surface2:    rgba(255,255,255,0.055);
      --surface3:    rgba(255,255,255,0.08);
      --border:      rgba(255,255,255,0.06);
      --border2:     rgba(255,255,255,0.10);
      --border3:     rgba(255,255,255,0.16);
      --accent:      #6366f1;
      --accent-dim:  rgba(99,102,241,0.15);
      --accent-glow: rgba(99,102,241,0.3);
      --cyan:        #22d3ee;
      --cyan-dim:    rgba(34,211,238,0.12);
      --green:       #4ade80;
      --green-dim:   rgba(74,222,128,0.12);
      --orange:      #fb923c;
      --orange-dim:  rgba(251,146,60,0.12);
      --red:         #f87171;
      --red-dim:     rgba(248,113,113,0.12);
      --gold:        #fbbf24;
      --text:        #fafafa;
      --text2:       #a1a1aa;
      --text3:       #71717a;
      --r-sm:        8px;
      --r:           12px;
      --r-lg:        16px;
      --r-xl:        20px;
      --font:        'Inter', sans-serif;
      --mono:        'JetBrains Mono', monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .vs { min-height: 100vh; background: var(--bg); font-family: var(--font); color: var(--text); }

    .vs-inner { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }

    /* ── Page Header ── */
    .ph { margin-bottom: 36px; }
    .ph-row { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; }
    .ph-icon {
      width: 44px; height: 44px; border-radius: var(--r);
      background: var(--accent-dim); border: 1px solid rgba(99,102,241,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;
    }
    .ph-title { font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; letter-spacing: -0.8px; }
    .ph-sub { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.8px; color: var(--text3); font-weight: 500; margin-left: 58px; }

    /* ── Nav Row (back + breadcrumb) ── */
    .nav-row { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
    .back-btn {
      width: 38px; height: 38px; border-radius: var(--r); flex-shrink: 0;
      background: var(--surface2); border: 1px solid var(--border2);
      color: var(--text2); cursor: pointer; font-size: 1rem; font-family: var(--font);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s ease;
    }
    .back-btn:hover { color: var(--text); border-color: var(--border3); transform: translateX(-2px); background: var(--surface3); }

    .breadcrumb { display: flex; align-items: center; gap: 10px; font-size: clamp(1.05rem,2vw,1.45rem); font-weight: 800; letter-spacing: -0.4px; }
    .bc-dim { color: var(--text3); }
    .bc-sep { color: var(--border3); }
    .bc-active { color: var(--accent); }

    /* ── Grade / Subject Grid ── */
    .sel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(195px,1fr)); gap: 14px; }
    @media (max-width: 580px) { .sel-grid { grid-template-columns: repeat(2,1fr); } }

    .sel-card {
      padding: 28px 18px 22px; border-radius: var(--r-xl);
      background: var(--surface); border: 1px solid var(--border);
      cursor: pointer; text-align: center; min-height: 170px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
      transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
      position: relative;
    }
    .sel-card:hover { border-color: var(--border3); background: var(--surface2); transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.55); }
    .sel-card.hero { background: var(--accent-dim); border-color: rgba(99,102,241,0.28); }
    .sel-card.hero:hover { border-color: rgba(99,102,241,0.5); box-shadow: 0 20px 48px rgba(99,102,241,0.2); }

    .grade-circle {
      width: 66px; height: 66px; border-radius: 18px;
      background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.55rem; font-weight: 800; color: var(--cyan); letter-spacing: -1px;
    }
    .subj-circle {
      width: 58px; height: 58px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
    }
    .card-name { font-size: 0.92rem; font-weight: 700; color: var(--text); line-height: 1.2; }
    .card-hint { font-size: 0.66rem; color: var(--text3); margin-top: 3px; }

    /* ── Search ── */
    .search-wrap { position: relative; margin-bottom: 16px; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
    .search-icon svg { width: 15px; height: 15px; }
    .search-input {
      width: 100%; padding: 12px 14px 12px 42px; border-radius: var(--r-lg);
      background: var(--bg3); border: 1px solid var(--border2);
      font-size: 0.875rem; font-family: var(--font); color: var(--text); outline: none;
      transition: border-color 0.18s, background 0.18s;
    }
    .search-input::placeholder { color: var(--text3); }
    .search-input:focus { border-color: rgba(99,102,241,0.45); background: var(--bg4); }

    /* ── Table wrapper ── */
    .tbl-wrap { border-radius: var(--r-lg); overflow: hidden; border: 1px solid var(--border); background: var(--bg2); }
    .tbl-head {
      display: grid; grid-template-columns: 44px 1fr 150px 90px 72px 36px;
      align-items: center; padding: 10px 18px;
      background: rgba(255,255,255,0.025); border-bottom: 1px solid var(--border);
    }
    .th { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: var(--text3); }
    @media (max-width: 620px) {
      .tbl-head { grid-template-columns: 38px 1fr 80px 58px 28px; }
      .col-idx { display: none; }
    }

    /* ── Student rows ── */
    .stu-item { border-bottom: 1px solid var(--border); }
    .stu-item:last-child { border-bottom: none; }

    .stu-row {
      display: grid; grid-template-columns: 44px 1fr 150px 90px 72px 36px;
      align-items: center; padding: 13px 18px; cursor: pointer; gap: 8px;
      transition: background 0.12s;
    }
    .stu-row:hover { background: rgba(255,255,255,0.03); }
    .stu-row.open { background: rgba(99,102,241,0.04); }
    @media (max-width: 620px) { .stu-row { grid-template-columns: 38px 1fr 80px 58px 28px; } }

    .avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.85rem; color: white; letter-spacing: -0.5px;
    }
    .stu-name-cell { min-width: 0; }
    .stu-name { font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stu-grade-lbl { font-size: 0.63rem; color: var(--text3); margin-top: 2px; }
    .stu-idx { font-family: var(--mono); font-size: 0.7rem; color: var(--cyan); background: var(--cyan-dim); border: 1px solid rgba(34,211,238,0.18); padding: 3px 8px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stu-att { font-weight: 700; font-size: 0.8rem; font-family: var(--mono); }

    .badge { padding: 3px 9px; border-radius: 99px; font-size: 0.62rem; font-weight: 700; }
    .badge-good { background: var(--green-dim); border: 1px solid rgba(74,222,128,0.22); color: var(--green); }
    .badge-low  { background: var(--orange-dim); border: 1px solid rgba(251,146,60,0.22); color: var(--orange); }

    .chev { color: var(--text3); font-size: 0.85rem; transition: transform 0.16s, color 0.16s; user-select: none; }
    .chev.open { transform: rotate(90deg); color: var(--accent); }

    /* ── Student detail panel ── */
    .stu-detail { background: rgba(99,102,241,0.025); border-top: 1px solid rgba(99,102,241,0.1); }
    .detail-body { padding: 22px 18px 26px; }

    .sec-lbl {
      font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px;
      color: var(--text3); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }
    .sec-lbl::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* Action Bar */
    .action-bar { display: flex; gap: 10px; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px dashed var(--border2); }
    .action-btn { 
      padding: 8px 14px; border-radius: var(--r-sm); border: 1px solid var(--border);
      background: var(--surface); color: var(--text2); font-size: 0.75rem; font-weight: 600; font-family: var(--font);
      display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s;
    }
    .action-btn:hover { background: var(--surface2); color: var(--text); transform: translateY(-1px); border-color: var(--border3); }
    .action-btn.wa:hover { color: #4ade80; border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.05); }
    .action-btn.del:hover { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.05); }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 22px; }
    @media (max-width: 500px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

    .stat-box { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; }
    .stat-val { font-family: var(--mono); font-size: 1.45rem; font-weight: 700; line-height: 1; }
    .stat-lbl { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); margin-top: 5px; }

    /* Monthly breakdown */
    .months-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
    .months-scroll::-webkit-scrollbar { height: 3px; }
    .months-scroll::-webkit-scrollbar-track { background: transparent; }
    .months-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

    .mo-card {
      flex-shrink: 0; min-width: 112px;
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: var(--r); padding: 12px 12px 10px;
    }
    .mo-card.now { border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.06); }

    .mo-name { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: var(--text3); margin-bottom: 10px; }
    .mo-meta { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; font-size: 0.7rem; color: var(--text3); }
    .mo-fee { font-size: 1rem; }
    .att-dots { display: flex; flex-wrap: wrap; gap: 5px; }
    .dot {
      width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .dot:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .dot-p { background: var(--green-dim); border: 1.5px solid rgba(74,222,128,0.45); color: var(--green); }
    .dot-a { background: var(--orange-dim); border: 1.5px solid rgba(251,146,60,0.35); color: var(--orange); }
    .dot-q { background: var(--surface); border: 1.5px solid var(--border); color: var(--text3); }
    .no-data { font-size: 0.63rem; color: var(--text3); }

    /* Subject list */
    .subj-list { display: flex; flex-direction: column; gap: 8px; }
    .subj-row { display: flex; align-items: center; gap: 10px; padding: 10px 13px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); }
    .subj-em { font-size: 0.9rem; flex-shrink: 0; }
    .subj-nm { flex: 1; font-size: 0.82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini-bar { width: 80px; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; flex-shrink: 0; }
    .mini-fill { height: 100%; border-radius: 4px; }
    .subj-pct { font-family: var(--mono); font-size: 0.75rem; font-weight: 700; min-width: 34px; text-align: right; flex-shrink: 0; }

    /* ── Pager ── */
    .pager { display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 26px; }
    .pg-btn {
      width: 34px; height: 34px; border-radius: var(--r-sm); border: 1px solid var(--border);
      background: var(--surface); color: var(--text2); cursor: pointer; font-family: var(--font);
      font-size: 0.78rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; transition: all 0.12s;
    }
    .pg-btn:hover:not(:disabled) { border-color: var(--border2); color: var(--text); background: var(--surface2); }
    .pg-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .pg-btn:disabled { opacity: 0.2; cursor: default; }

    /* ── Loader ── */
    .spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.12); border-top-color: var(--accent); border-radius: 50%; animation: vs-spin 0.7s linear infinite; }
    @keyframes vs-spin { to { transform: rotate(360deg); } }
    .centered { display: flex; justify-content: center; align-items: center; padding: 56px 0; }
    .empty { text-align: center; padding: 44px; font-size: 0.85rem; color: var(--text3); }

    /* ── Confirm Popup ── */
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      animation: vs-fadein 0.2s ease;
    }
    .confirm-box {
      background: var(--bg2); border: 1px solid var(--border2);
      border-radius: var(--r-xl); width: 100%; max-width: 360px;
      padding: 24px; box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset;
      animation: vs-zoom-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .confirm-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .confirm-icon {
      width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .confirm-icon.warning { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(251,146,60,0.25); }
    .confirm-icon.danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
    .confirm-title { font-size: 1.05rem; font-weight: 700; color: var(--text); }
    .confirm-desc { font-size: 0.85rem; color: var(--text3); line-height: 1.5; margin-bottom: 24px; }
    
    .confirm-actions { display: flex; gap: 10px; }
    .confirm-btn {
      flex: 1; padding: 11px 0; border-radius: var(--r); font-family: var(--font);
      font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;
    }
    .confirm-btn.cancel { background: var(--surface); color: var(--text2); border: 1px solid var(--border); }
    .confirm-btn.cancel:hover { background: var(--surface2); color: var(--text); border-color: var(--border3); }
    .confirm-btn.danger { background: var(--red); color: #fff; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 12px rgba(248,113,113,0.25); }
    .confirm-btn.danger:hover { background: #ef4444; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(248,113,113,0.4); }
    .confirm-btn.warning { background: var(--orange); color: #fff; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 12px rgba(251,146,60,0.25); }
    .confirm-btn.warning:hover { background: #f97316; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(251,146,60,0.4); }

    @keyframes vs-zoom-in {
      from { opacity: 0; transform: scale(0.92) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ── Animations ── */
    .fade-up { animation: vs-fadein 0.22s ease both; }
    @keyframes vs-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    .stagger > * { animation: vs-fadein 0.22s ease both; }
    .stagger > *:nth-child(1) { animation-delay: 0.00s; }
    .stagger > *:nth-child(2) { animation-delay: 0.04s; }
    .stagger > *:nth-child(3) { animation-delay: 0.07s; }
    .stagger > *:nth-child(4) { animation-delay: 0.10s; }
    .stagger > *:nth-child(5) { animation-delay: 0.13s; }
    .stagger > *:nth-child(6) { animation-delay: 0.15s; }
    .stagger > *:nth-child(n+7) { animation-delay: 0.17s; }

    .slide-in { animation: vs-slide 0.15s ease both; }
    @keyframes vs-slide { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
  `}</style>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const SUBJ_META = {
  Mathematics: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '📐' },
  Science:     { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  icon: '🔬' },
  English:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  icon: '📖' },
  ICT:         { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '💻' },
  Business:    { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  icon: '📊' },
  Scholarship: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '🏆' },
};

const WHATSAPP_GROUP_LINKS = {
    'Grade 03': 'https://chat.whatsapp.com/JDa517chrKQ9459MfzRSZC',
    'Grade 04': 'https://chat.whatsapp.com/Il7vUb6trXOBViX4U46dfm',
    'Grade 05': 'https://chat.whatsapp.com/K0df52vVfPoDjFuLtYrneG',
    'Grade 06': 'https://chat.whatsapp.com/Ebz4zJgdDhDEn1p2Z6HzbX',
    'Grade 07': 'https://chat.whatsapp.com/Ko87JpVAHdMJ3UCIDHh22a',
    'Grade 08': 'https://chat.whatsapp.com/LfrLuuB0NmE37Bul1cSwog',
    'Grade 09': 'https://chat.whatsapp.com/KEoJ2cotqWUA92EZA5R4W7',
    'Grade 10': 'https://chat.whatsapp.com/KOJD2PNrd936IHgWxLGotB',
    'Grade 11': 'https://chat.whatsapp.com/IuCquSU1EPHB9TcORCUdrz',
};

const sendWhatsAppGroupLink = (student) => {
    try {
        if (!student.mobile) {
            alert('No mobile number provided for this student.');
            return;
        }
        let formattedNumber = student.mobile.trim().replace(/[\s-]/g, '');
        if (formattedNumber.startsWith('0')) formattedNumber = '94' + formattedNumber.substring(1);
        else if (formattedNumber.startsWith('+94')) formattedNumber = formattedNumber.substring(1);
        else if (formattedNumber.length === 9 && !formattedNumber.startsWith('94')) formattedNumber = '94' + formattedNumber;
        
        const groupLink = WHATSAPP_GROUP_LINKS[student.grade];
        if (!groupLink) {
            alert(`No WhatsApp group link configured for ${student.grade}`);
            return;
        }
        const message = `Welcome to Eduflex!\nHere is your ${student.grade} WhatsApp Group Link: ${groupLink}`;
        const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error("Error opening WhatsApp link:", error);
    }
};

const getSubjMeta = name => {
  for (const [k, v] of Object.entries(SUBJ_META)) {
    if (name?.includes(k)) return v;
  }
  return { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '📚' };
};

const attColor = pct => pct >= 75 ? '#4ade80' : pct >= 50 ? '#22d3ee' : '#fb923c';

const fmtGrade = g => g?.replace(/\D/g, '').padStart(2, '0') || g;

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
            {prev && p - prev > 1 && <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>…</span>}
            <button className={`pg-btn${p === page ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
          </React.Fragment>
        );
      })}
      <button className="pg-btn" disabled={page === total} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────
function StudentRow({ student, onUpdate, subjectColors }) {
  const [open, setOpen] = useState(false);
  const [confirmOpts, setConfirmOpts] = useState(null);

  const handleToggleAttendance = async (subjectName, monthIndex, weekIndex, currentStatus) => {
    const applyUpdate = async () => {
      try {
        let newStatus = 'present';
        if (currentStatus === 'present' || currentStatus === true || currentStatus === 'true') newStatus = 'absent';
        else if (currentStatus === 'absent') newStatus = 'pending';

        await axios.patch(`${API_BASE_URL}/api/attendance/${student._id}/${encodeURIComponent(subjectName)}/${monthIndex}/${weekIndex}`, { status: newStatus });
        if (onUpdate) onUpdate();
      } catch (e) {
        console.error(e);
        alert('Error updating attendance: ' + (e.response?.data?.message || e.message));
      }
      setConfirmOpts(null);
    };

    if (currentStatus && currentStatus !== 'pending') {
      setConfirmOpts({
        title: 'Change Attendance',
        desc: `Are you sure you want to change this attendance mark? It is currently marked as ${currentStatus}.`,
        iconType: 'warning',
        confirmText: 'Change Status',
        onConfirm: applyUpdate
      });
      return;
    }
    applyUpdate();
  };

  const handleToggleFee = async (subjectName, monthIndex, isPaid) => {
    const applyUpdate = async () => {
      try {
        await axios.patch(`${API_BASE_URL}/api/records/${student._id}/${encodeURIComponent(subjectName)}/${monthIndex}/fee`, {});
        
        if (!isPaid && student.mobile) {
          let mobile = student.mobile.trim();
          if (mobile.startsWith('0')) mobile = '94' + mobile.substring(1);
          else if (mobile.startsWith('+')) mobile = mobile.substring(1);
          else if (!mobile.startsWith('94')) mobile = '94' + mobile;

          const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const monthName = monthsList[monthIndex];
          const feeAmount = subjectColors?.[subjectName]?.fee || 0;
          
          const message = `Hello ${student.name},\n\nYour payment of Rs. ${feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for the *${subjectName}* class (${monthName}) has been received successfully.\n\nThank you!\nEduflex Institute\nContact: +94789232752`;
          
          window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(message)}`, '_blank');
        }

        if (onUpdate) onUpdate();
      } catch (e) {
        console.error(e);
        alert('Error updating fee: ' + (e.response?.data?.message || e.message));
      }
      setConfirmOpts(null);
    };

    if (isPaid) {
      setConfirmOpts({
        title: 'Unmark Fee',
        desc: 'Are you sure you want to unmark this fee as paid? This will revert the record to pending.',
        iconType: 'warning',
        confirmText: 'Unmark Fee',
        onConfirm: applyUpdate
      });
      return;
    }
    applyUpdate();
  };

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
      return {
        name: e.subject,
        pct: st === 0 ? 0 : Math.round((sa / st) * 100),
        feesTotal, feesPaid,
        monthlyRecords: e.monthlyRecords || []
      };
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
          <div className="stu-grade-lbl">{student.grade}</div>
        </div>
        <div className={`stu-idx col-idx`}>{student.indexNumber}</div>
        <div className="stu-att" style={{ color: attColor(stats.pct) }}>{stats.pct}%</div>
        <span className={`badge ${stats.pct >= 75 ? 'badge-good' : 'badge-low'}`}>{stats.pct >= 75 ? 'Good' : 'Low'}</span>
        <span className={`chev${open ? ' open' : ''}`}>›</span>
      </div>

      {open && (
        <div className="stu-detail slide-in">
          <div className="detail-body">
            
            {/* Action Bar */}
            <div className="action-bar">
              <button className="action-btn wa" onClick={() => sendWhatsAppGroupLink(student)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp Group
              </button>
              <button className="action-btn del" onClick={() => {
                setConfirmOpts({
                  title: 'Delete Student',
                  desc: `Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`,
                  iconType: 'danger',
                  confirmText: 'Delete Permanently',
                  onConfirm: async () => {
                    try { 
                      await axios.delete(API_BASE_URL + '/api/students/' + student._id); 
                      if (onUpdate) onUpdate(); 
                    } catch(e) { 
                      console.error(e); 
                      alert('Error deleting'); 
                    }
                    setConfirmOpts(null);
                  }
                });
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Student
              </button>
            </div>

            {/* Overview stats */}
            <div className="sec-lbl">📊 Overview</div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-val" style={{ color: attColor(stats.pct) }}>{stats.pct}%</div>
                <div className="stat-lbl">Attendance</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--cyan)' }}>{stats.attended}</div>
                <div className="stat-lbl">Attended</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--text2)' }}>{stats.total}</div>
                <div className="stat-lbl">Total Classes</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--green)' }}>{stats.feesPaidCount}/{stats.subjects.length}</div>
                <div className="stat-lbl">Fees Paid</div>
              </div>
            </div>

            {/* Monthly breakdown per subject */}
            {stats.subjects.map(subj => {
              const sm = getSubjMeta(subj.name);
              return (
                <div key={subj.name} style={{ marginBottom: 22 }}>
                  <div className="sec-lbl">
                    <span style={{ color: sm.color }}>{sm.icon} {subj.name}</span>
                  </div>
                  <div className="months-scroll">
                    {MONTHS.map((m, mi) => {
                      const rec        = subj.monthlyRecords?.find(r => r.monthIndex === mi);
                      const nowMonth   = new Date().getMonth();
                      const isCurrent  = mi === nowMonth;
                      const isFuture   = !rec && mi > nowMonth;
                      const att        = rec?.attendance || [];
                      return (
                        <div key={m} className={`mo-card${isCurrent ? ' now' : ''}`} style={{ opacity: isFuture ? 0.3 : 1 }}>
                          <div className="mo-name">{m}</div>
                          <div className="mo-meta">
                            <span className="mo-fee" title={rec?.feePaid ? 'Fee paid' : 'Fee pending'} onClick={(e) => { e.stopPropagation(); handleToggleFee(subj.name, mi, !!rec?.feePaid); }} style={{ cursor: 'pointer', display: 'flex' }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: rec?.feePaid ? '#4ade80' : 'var(--text3)'}}>
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                              </svg>
                            </span>
                            {att.length > 0 && (
                              <span>
                                {att.filter(a => a === 'present' || a === true || a === 'true').length}
                                /{att.filter(a => a !== 'pending').length}
                              </span>
                            )}
                          </div>
                          <div className="att-dots">
                            {att.length === 0
                              ? <span className="no-data">No data</span>
                              : att.map((s, i) => {
                                  const isA = s === 'absent' || (typeof s === 'string' && s.toLowerCase() === 'absent');
                                  const isP = s === 'present' || s === true || s === 'true' || (typeof s === 'string' && s.toLowerCase() === 'present');
                                  const isQ = !isA && !isP;
                                  
                                  // Determine current normalized status to pass to toggle
                                  const normStatus = isA ? 'absent' : isP ? 'present' : 'pending';

                                  return (
                                    <div key={i} className={`dot ${isQ ? 'dot-q' : isP ? 'dot-p' : 'dot-a'}`} onClick={(e) => { e.stopPropagation(); handleToggleAttendance(subj.name, mi, i, normStatus); }}>
                                      {isQ ? '' : isP ? '✓' : '✗'}
                                    </div>
                                  );
                                })
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Subject progress bars */}
            {stats.subjects.length > 0 && (
              <>
                <div className="sec-lbl">📈 Subject Progress</div>
                <div className="subj-list">
                  {stats.subjects.map(s => {
                    const sm = getSubjMeta(s.name);
                    return (
                      <div className="subj-row" key={s.name} style={{ borderColor: `${sm.color}22` }}>
                        <span className="subj-em">{sm.icon}</span>
                        <span className="subj-nm">{s.name}</span>
                        <div className="mini-bar">
                          <div className="mini-fill" style={{ width: `${s.pct}%`, background: attColor(s.pct) }} />
                        </div>
                        <span className="subj-pct" style={{ color: attColor(s.pct) }}>{s.pct}%</span>
                        <span className={`badge ${s.feesPaid > 0 ? 'badge-good' : 'badge-low'}`}>
                          {s.feesPaid > 0 ? '✓ Paid' : '⏳'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Confirm Dialog Overlay ── */}
      {confirmOpts && (
        <div className="confirm-overlay" onClick={() => setConfirmOpts(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-header">
              <div className={`confirm-icon ${confirmOpts.iconType}`}>
                {confirmOpts.iconType === 'danger' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
              </div>
              <div className="confirm-title">{confirmOpts.title}</div>
            </div>
            <div className="confirm-desc">{confirmOpts.desc}</div>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={() => setConfirmOpts(null)}>Cancel</button>
              <button className={`confirm-btn ${confirmOpts.iconType}`} onClick={() => confirmOpts.onConfirm()}>
                {confirmOpts.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ViewStudents() {
  // ── State (identical to original) ──
  const [viewMode, setViewMode]               = useState('grades');
  const [selectedGrade, setSelectedGrade]     = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [grades, setGrades]       = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [subjectColors, setSubjectColors] = useState({});

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);

  // ── Fetch grades (same as original) ──
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/students/grades`);
      setGrades(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Fetch subjects (same as original) ──
  const fetchSubjects = async () => {
    try {
      const r = await axios.get(`${API_BASE_URL}/api/subjects`);
      setSubjects(r.data);
      const map = {};
      r.data.forEach(sub => { map[sub.name] = sub; });
      setSubjectColors(map);
    } catch (e) { console.error(e); }
  };

  // ── Fetch students (same as original) ──
  const fetchStudents = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/students`, {
        params: { page, search, grade: selectedGrade, subject: selectedSubject }
      });
      setStudents(r.data.students);
      setTotalPages(r.data.totalPages);
    } catch (e) { console.error(e); }
    finally { if (!background) setLoading(false); }
  }, [page, search, selectedGrade, selectedSubject]);

  // ── Effects (same as original) ──
  useEffect(() => {
    fetchGrades();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (viewMode === 'students') fetchStudents();
  }, [viewMode, fetchStudents]);

  // ── Handlers (same as original) ──
  const handleGradeClick  = g => { setSelectedGrade(g); setViewMode('subjects'); };
  const handleSubjectClick = s => { setSelectedSubject(s); setViewMode('students'); setPage(1); };
  const handleAllStudents  = () => { setSelectedGrade(null); setSelectedSubject(null); setViewMode('students'); setPage(1); };

  const handleBack = () => {
    if (viewMode === 'students') {
      if (!selectedGrade) { setViewMode('grades'); }
      else { setViewMode('subjects'); }
    } else if (viewMode === 'subjects') {
      setViewMode('grades');
      setSelectedGrade(null);
    }
  };

  // ── Breadcrumb ──
  const Breadcrumb = () => (
    <div className="breadcrumb">
      {viewMode === 'subjects' && (
        <><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">{selectedGrade}</span></>
      )}
      {viewMode === 'students' && !selectedGrade && (
        <><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">All</span></>
      )}
      {viewMode === 'students' && selectedGrade && !selectedSubject && (
        <><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-active">{selectedGrade}</span></>
      )}
      {viewMode === 'students' && selectedGrade && selectedSubject && (
        <><span className="bc-dim">Students</span><span className="bc-sep"> / </span><span className="bc-dim">{selectedGrade}</span><span className="bc-sep"> / </span><span className="bc-active">{selectedSubject}</span></>
      )}
    </div>
  );

  return (
    <div className="vs">
      <GlobalStyle />
      <div className="vs-inner">

        {/* ── Header ── */}
        {viewMode === 'grades' ? (
          <div className="ph fade-up">
            <div className="ph-row">
              <div className="ph-icon">👥</div>
              <h1 className="ph-title">Students</h1>
            </div>
            <p className="ph-sub">Select a grade to browse students</p>
          </div>
        ) : (
          <div className="nav-row fade-up">
            <button className="back-btn" onClick={handleBack}>←</button>
            <Breadcrumb />
          </div>
        )}

        {/* ════ GRADES VIEW ════ */}
        {viewMode === 'grades' && (
          <div className="sel-grid stagger">
            {/* All students hero card */}
            <div className="sel-card hero" onClick={handleAllStudents}>
              <div style={{ fontSize: '2.2rem' }}>👥</div>
              <div>
                <div className="card-name">All Students</div>
                <div className="card-hint">View every record</div>
              </div>
            </div>

            {/* Grade cards */}
            {grades.map(g => (
              <div key={g} className="sel-card" onClick={() => handleGradeClick(g)}>
                <div className="grade-circle">{fmtGrade(g)}</div>
                <div>
                  <div className="card-name">{g}</div>
                  <div className="card-hint">View students →</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ SUBJECTS VIEW ════ */}
        {viewMode === 'subjects' && (
          <div className="sel-grid stagger fade-up">
            {subjects
              .filter(sub => shouldShowSubject(sub.name, selectedGrade))
              .map(sub => {
                const sm = getSubjMeta(sub.name);
                return (
                  <div
                    key={sub._id}
                    className="sel-card"
                    onClick={() => handleSubjectClick(sub.name)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = sm.color + '55'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}
                  >
                    <div className="subj-circle" style={{ background: sm.bg, border: `1px solid ${sm.color}30` }}>
                      <span style={{ fontSize: '1.45rem' }}>{sm.icon}</span>
                    </div>
                    <div>
                      <div className="card-name">{sub.name}</div>
                      <div className="card-hint" style={{ color: sm.color, opacity: 0.85 }}>View students →</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ════ STUDENTS VIEW ════ */}
        {viewMode === 'students' && (
          <div className="fade-up">
            {/* Search */}
            <div className="search-wrap">
              <span className="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="search-input"
                placeholder="Search by name or index number…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {loading ? (
              <div className="centered"><div className="spinner" /></div>
            ) : (
              <div className="tbl-wrap">
                <div className="tbl-head">
                  <div className="th" />
                  <div className="th">Student</div>
                  <div className="th col-idx">Index No.</div>
                  <div className="th">Attendance</div>
                  <div className="th">Status</div>
                  <div className="th" />
                </div>

                {students.length === 0
                  ? <div className="empty">No students found</div>
                  : students.map(s => <StudentRow key={s._id} student={s} onUpdate={() => fetchStudents(true)} subjectColors={subjectColors} />)
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
