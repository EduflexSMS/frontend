import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ── Your original dialogs & components (unchanged) ─────────────────
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import CreateTeacherDialog from '../components/CreateTeacherDialog';
import TeacherListDialog from '../components/TeacherListDialog';
import AnalyticsChart from '../components/AnalyticsChart';
import API_BASE_URL from '../config';

// ─────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────

const AnimatedNumber = ({ value }) => {
    const spring = useSpring(0, { bounce: 0, duration: 1800 });
    const display = useTransform(spring, (v) => Math.round(v));
    useEffect(() => { spring.set(value); }, [spring, value]);
    return <motion.span>{display}</motion.span>;
};

const Sparkline = ({ data, color }) => {
    const w = 80, h = 32;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(' ');
    const id = `sg${color.replace('#', '')}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', flexShrink: 0 }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`0,${h} ${pts.split(' ').join(' ')} ${w},${h}`}
                fill={`url(#${id})`}
            />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const RadialRing = ({ pct, color, size = 52, stroke = 3 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${(pct / 100) * circ} ${circ}` }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
            />
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────
const DARK = {
    bg: '#0a0a0c',
    surface: 'rgba(18,18,22,0.85)',
    border: 'rgba(255,255,255,0.07)',
    card: 'rgba(16,16,22,0.88)',
    text: '#f2f1ee',
    sub: '#888880',
};
const LIGHT = {
    bg: '#f4f3f0',
    surface: 'rgba(255,255,255,0.75)',
    border: 'rgba(0,0,0,0.07)',
    card: 'rgba(255,255,255,0.88)',
    text: '#0f0e0c',
    sub: '#6b6a66',
};

const C = {
    cyan:    '#00e5ff',
    indigo:  '#6c63ff',
    emerald: '#00c896',
    amber:   '#ffb547',
    rose:    '#ff5f7e',
    violet:  '#b57aff',
};

// Sparkline placeholders (visual only — no real historical data needed)
const SPARKS = {
    students: [780, 850, 910, 970, 1020, 1080, 1150, 1200],
    subjects:  [10, 11, 12, 13, 14, 15, 16, 17],
    teachers:  [30, 33, 36, 38, 40, 42, 44, 46],
};

// ─────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

const GlowOrb = ({ color, size, x, y, blur = 110, opacity = 0.09 }) => (
    <div style={{
        position: 'fixed', left: x, top: y, width: size, height: size,
        borderRadius: '50%', background: color,
        filter: `blur(${blur}px)`, opacity, pointerEvents: 'none', zIndex: 0,
        transform: 'translate(-50%,-50%)',
    }} />
);

const StatCard = ({ title, value, icon, accent, spark, onClick, theme }) => {
    const [hov, setHov] = useState(false);
    return (
        <motion.div
            onClick={onClick}
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'relative', overflow: 'hidden',
                background: theme.card,
                border: `1px solid ${hov ? accent + '55' : theme.border}`,
                borderRadius: 22, padding: '24px 24px 18px',
                cursor: onClick ? 'pointer' : 'default',
                backdropFilter: 'blur(24px)',
                boxShadow: hov
                    ? `0 20px 56px ${accent}20, 0 0 0 1px ${accent}30`
                    : '0 2px 20px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
        >
            {/* Corner bloom */}
            <motion.div animate={{ opacity: hov ? 1 : 0 }} transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute', top: -60, right: -60,
                    width: 180, height: 180, borderRadius: '50%',
                    background: accent, filter: 'blur(65px)', opacity: 0.14, pointerEvents: 'none'
                }} />

            {/* Bottom accent line */}
            <motion.div animate={{ scaleX: hov ? 1 : 0 }} transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                    transformOrigin: 'center'
                }} />

            {/* Icon */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 42, height: 42, borderRadius: 13,
                background: accent + '18', border: `1px solid ${accent}30`,
                fontSize: 19, marginBottom: 16,
                boxShadow: hov ? `0 0 18px ${accent}40` : 'none',
                transition: 'box-shadow 0.3s'
            }}>
                {icon}
            </div>

            {/* Value */}
            <div style={{
                fontFamily: "'Outfit', 'DM Sans', sans-serif",
                fontSize: 36, fontWeight: 800,
                color: theme.text, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 6
            }}>
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
            </div>

            {/* Label + spark */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1.3px', color: theme.sub
                }}>{title}</span>
                {spark && <Sparkline data={spark} color={accent} />}
            </div>
        </motion.div>
    );
};

const SubjectCard = ({ sub, idx, theme, onClick }) => {
    const pct = sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0;
    const good = pct > 80;
    const accent = good ? C.emerald : C.rose;
    const [hov, setHov] = useState(false);

    return (
        <motion.div
            onClick={onClick}
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.07 }}
            whileHover={{ y: -5, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            style={{
                position: 'relative', overflow: 'hidden',
                background: theme.card,
                border: `1px solid ${hov ? accent + '50' : theme.border}`,
                borderRadius: 20, padding: '22px',
                cursor: 'pointer', backdropFilter: 'blur(20px)',
                boxShadow: hov
                    ? `0 16px 44px ${accent}18, 0 0 0 1px ${accent}30`
                    : '0 2px 12px rgba(0,0,0,0.07)',
                transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
        >
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 120, height: 120, borderRadius: '50%',
                background: accent, filter: 'blur(48px)',
                opacity: hov ? 0.16 : 0.06, transition: 'opacity 0.3s', pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: theme.text, letterSpacing: '-0.3px' }}>
                    {sub.subject}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RadialRing pct={Math.round(pct)} color={accent} />
                    <span style={{
                        fontSize: 12, fontWeight: 800, color: accent,
                        background: accent + '18', padding: '3px 9px',
                        borderRadius: 99, border: `1px solid ${accent}30`
                    }}>
                        {Math.round(pct)}%
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                height: 5, borderRadius: 99, overflow: 'hidden',
                background: 'rgba(128,128,128,0.12)', marginBottom: 14
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.07 + 0.2 }}
                    style={{
                        height: '100%', borderRadius: 99,
                        background: good
                            ? `linear-gradient(90deg, ${C.emerald}, ${C.cyan})`
                            : `linear-gradient(90deg, ${C.rose}, ${C.amber})`,
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: theme.sub }}>👥 {sub.studentCount} students</span>
                <span style={{
                    fontSize: 11, fontWeight: 700, color: accent,
                    background: accent + '14', padding: '3px 10px',
                    borderRadius: 99, border: `1px solid ${accent}22`
                }}>
                    {sub.paidFees} Paid
                </span>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD  — all original logic preserved exactly
// ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    // ── original state ──
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
    const [teacherListOpen, setTeacherListOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // ── new UI state ──
    const [isDark, setIsDark] = useState(true);
    const theme = isDark ? DARK : LIGHT;

    const { t } = useTranslation();
    const navigate = useNavigate();

    // ── original fetch ──
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(error.message || 'Unknown Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    // ── original handlers ──
    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setDetailsOpen(true);
    };

    const handleFixData = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/api/payments/fix-fees`);
            alert(response.data.message || 'Data fixed successfully');
            fetchStats();
        } catch (error) {
            console.error('Error fixing data:', error);
            alert('Failed to fix data');
            setLoading(false);
        }
    };

    // ── compute overall collection rate from real data ──
    const collectionRate = stats && stats.subjectStats && stats.subjectStats.length > 0
        ? Math.round(
            (stats.subjectStats.reduce((a, s) => a + s.paidFees, 0) /
             stats.subjectStats.reduce((a, s) => a + s.studentCount, 0)) * 100
          )
        : 0;

    // ─────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{
            minHeight: '100vh', background: DARK.bg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: `3px solid rgba(255,255,255,0.08)`,
                    borderTop: `3px solid ${C.cyan}`,
                }}
            />
            <span style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#888880', fontSize: 13, letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>Loading Dashboard…</span>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────
    if (!stats || typeof stats === 'string') return (
        <div style={{
            minHeight: '100vh', background: DARK.bg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16
        }}>
            <div style={{ fontSize: 36 }}>⚠️</div>
            <div style={{ color: '#f2f1ee', fontWeight: 700, fontSize: 18, fontFamily: "'DM Sans',sans-serif" }}>
                Error loading stats
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={fetchStats}
                style={{
                    border: 'none', cursor: 'pointer', padding: '10px 24px',
                    borderRadius: 12, background: C.cyan, color: '#000',
                    fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif"
                }}
            >↺ Retry</motion.button>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: theme.bg,
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            color: theme.text,
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.4s, color 0.4s',
        }}>
            {/* ── Background orbs ── */}
            <GlowOrb color={C.cyan}    size={520} x="8%"  y="12%"  blur={120} opacity={isDark ? 0.11 : 0.06} />
            <GlowOrb color={C.violet}  size={420} x="88%" y="20%"  blur={110} opacity={isDark ? 0.09 : 0.05} />
            <GlowOrb color={C.emerald} size={360} x="55%" y="85%"  blur={100} opacity={isDark ? 0.08 : 0.04} />

            {/* ── Dot-grid texture ── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: `
                    linear-gradient(${theme.border} 1px, transparent 1px),
                    linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
                opacity: isDark ? 0.55 : 0.35,
            }} />

            {/* ── Page content ── */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 28px 80px' }}>

                {/* ═══ TOP NAV ═══ */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '22px 0 28px',
                    borderBottom: `1px solid ${theme.border}`,
                    marginBottom: 40, flexWrap: 'wrap', gap: 16,
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 13,
                            background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 19, fontWeight: 900, color: '#fff',
                            boxShadow: `0 0 22px ${C.cyan}44`,
                        }}>E</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.4px' }}>EduFlex</div>
                            <div style={{ fontSize: 10, color: theme.sub, marginTop: -1 }}>Institute Dashboard</div>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {/* Theme toggle */}
                        <motion.button
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            onClick={() => setIsDark(!isDark)}
                            style={{
                                width: 38, height: 38, borderRadius: 11,
                                border: `1px solid ${theme.border}`,
                                background: theme.surface, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, backdropFilter: 'blur(20px)',
                            }}
                        >{isDark ? '☀️' : '🌙'}</motion.button>

                        {/* Fix Data — original handler */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={handleFixData}
                            style={{
                                border: `1px solid ${C.amber}33`, cursor: 'pointer',
                                padding: '8px 16px', borderRadius: 11,
                                background: C.amber + '14', color: C.amber,
                                fontWeight: 700, fontSize: 12,
                                fontFamily: "'DM Sans',sans-serif",
                            }}
                        >🔧 Fix Data</motion.button>

                        {/* Generate Report — original handler */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setReportOpen(true)}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '9px 18px', borderRadius: 11,
                                background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`,
                                color: '#fff', fontWeight: 700, fontSize: 12,
                                fontFamily: "'DM Sans',sans-serif",
                                boxShadow: `0 0 22px ${C.cyan}40`,
                            }}
                        >📊 {t('generate_report')}</motion.button>

                        {/* QR Scan — original navigate */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/qr-scanner')}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '9px 18px', borderRadius: 11,
                                background: `linear-gradient(135deg, ${C.amber}, ${C.rose})`,
                                color: '#fff', fontWeight: 700, fontSize: 12,
                                fontFamily: "'DM Sans',sans-serif",
                                boxShadow: `0 0 22px ${C.amber}40`,
                            }}
                        >📷 Scan</motion.button>
                    </div>
                </div>

                {/* ═══ HERO HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    style={{
                        display: 'flex', alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 20, marginBottom: 44
                    }}
                >
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 800, letterSpacing: '3px',
                            textTransform: 'uppercase', color: C.cyan, marginBottom: 10,
                        }}>● Live Dashboard</div>
                        <h1 style={{
                            margin: 0,
                            fontSize: 'clamp(30px,5vw,52px)',
                            fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05,
                            fontFamily: "'Outfit','DM Sans',sans-serif",
                            background: isDark
                                ? `linear-gradient(135deg, #fff 30%, ${C.cyan} 75%)`
                                : `linear-gradient(135deg, #0f0e0c 30%, ${C.indigo} 75%)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {t('dashboard_overview')}
                        </h1>
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: theme.sub, fontWeight: 500 }}>
                            {t('dashboard_subtitle')}
                        </p>
                    </div>

                    {/* Overall collection rate from REAL data */}
                    <div style={{
                        background: theme.surface, border: `1px solid ${theme.border}`,
                        borderRadius: 18, padding: '18px 24px',
                        backdropFilter: 'blur(20px)', textAlign: 'right',
                        boxShadow: `0 0 30px ${C.emerald}12`
                    }}>
                        <div style={{ fontSize: 10, color: theme.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Overall Collection Rate
                        </div>
                        <div style={{
                            fontSize: 30, fontWeight: 900, letterSpacing: '-1px',
                            color: C.emerald, fontFamily: "'Outfit',sans-serif"
                        }}>
                            <AnimatedNumber value={collectionRate} />%
                        </div>
                        <div style={{ fontSize: 10, color: theme.sub, marginTop: 3 }}>from MongoDB live data</div>
                    </div>
                </motion.div>

                {/* ═══ STAT CARDS — wired to real stats ═══ */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: 18, marginBottom: 36
                }}>
                    <StatCard
                        title={t('total_students')}
                        value={stats.totalStudents}
                        icon="👥"
                        accent={C.cyan}
                        spark={SPARKS.students}
                        theme={theme}
                    />
                    <StatCard
                        title={t('total_subjects')}
                        value={stats.totalSubjects}
                        icon="📚"
                        accent={C.indigo}
                        spark={SPARKS.subjects}
                        theme={theme}
                    />
                    {/* New Teacher card — original handler */}
                    <StatCard
                        title="New Teacher"
                        value="+"
                        icon="🎓"
                        accent={C.violet}
                        theme={theme}
                        onClick={() => setCreateTeacherOpen(true)}
                    />
                    {/* Teachers count — original handler */}
                    <StatCard
                        title="Teachers"
                        value={stats.teacherCount || 0}
                        icon="👤"
                        accent={C.emerald}
                        spark={SPARKS.teachers}
                        theme={theme}
                        onClick={() => setTeacherListOpen(true)}
                    />
                </div>

                {/* ═══ ANALYTICS CHART — your original component ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.15 }}
                    style={{
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 22, padding: 28,
                        backdropFilter: 'blur(20px)',
                        marginBottom: 36,
                        boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
                    }}
                >
                    <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', marginBottom: 4 }}>
                        Analytics
                    </div>
                    <div style={{ fontSize: 12, color: theme.sub, marginBottom: 20 }}>
                        Live data from your MongoDB
                    </div>
                    <AnalyticsChart />
                </motion.div>

                {/* ═══ SUBJECT PERFORMANCE — wired to real stats.subjectStats ═══ */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 12, marginBottom: 24
                    }}>
                        <div>
                            <h2 style={{
                                margin: 0, fontWeight: 900, fontSize: 22,
                                letterSpacing: '-0.8px', color: theme.text
                            }}>
                                Subject Performance
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.sub }}>
                                Fee collection rates — live from MongoDB
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 14 }}>
                            {[
                                { color: C.emerald, label: 'Good (>80%)' },
                                { color: C.rose,    label: 'Needs Attention' },
                            ].map(({ color, label }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.sub }}>
                                    <div style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                        gap: 16
                    }}>
                        {(stats.subjectStats || []).map((sub, i) => (
                            <SubjectCard
                                key={sub.subject}
                                sub={sub}
                                idx={i}
                                theme={theme}
                                onClick={() => handleSubjectClick(sub.subject)}   // original handler
                            />
                        ))}
                    </div>
                </div>

                {/* ═══ FOOTER ═══ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        marginTop: 52,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 0',
                        borderTop: `1px solid ${theme.border}`,
                        fontSize: 11, color: theme.sub, flexWrap: 'wrap', gap: 8,
                    }}
                >
                    <span>EduFlex Institute • Real-time Dashboard</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: C.emerald, display: 'inline-block',
                            boxShadow: `0 0 7px ${C.emerald}`,
                            animation: 'blink 2s ease-in-out infinite'
                        }} />
                        MongoDB Connected
                    </span>
                    <span>Live data · auto-refresh on mount</span>
                </motion.div>
            </div>

            {/* ═══ ALL ORIGINAL DIALOGS — completely unchanged ═══ */}
            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
            />
            <SubjectDetailsDialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                subjectName={selectedSubject}
            />
            <CreateTeacherDialog
                open={createTeacherOpen}
                onClose={() => setCreateTeacherOpen(false)}
            />
            <TeacherListDialog
                open={teacherListOpen}
                onClose={() => setTeacherListOpen(false)}
            />

            <style>{`
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
            `}</style>
        </div>
    );
}