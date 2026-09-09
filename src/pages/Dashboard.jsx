
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ── Your original dialogs & components (unchanged) ─────────────────
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import AnalyticsChart from '../components/AnalyticsChart';
import FeeRemindersDialog from '../components/FeeRemindersDialog';
import API_BASE_URL from '../config';

// ─────────────────────────────────────────────────────────────────────
// ANIMATION COMPONENTS
// ─────────────────────────────────────────────────────────────────────

const AnimatedCounter = ({ value, duration = 1.8 }) => {
    const spring = useSpring(0, { stiffness: 50, damping: 20 });
    const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
    
    useEffect(() => {
        spring.set(value);
    }, [spring, value]);
    
    return <motion.span>{display}</motion.span>;
};

const RadialRing = ({ pct, color, size = 48, stroke = 3.5, delay = 0 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const spring = useSpring(0, { stiffness: 40, damping: 15 });
    const strokeDash = useTransform(spring, (v) => `${(v / 100) * circ} ${circ}`);
    
    useEffect(() => {
        const timer = setTimeout(() => spring.set(pct), delay * 1000 + 300);
        return () => clearTimeout(timer);
    }, [spring, pct, delay]);
    
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="var(--kimi-color-border, rgba(128,128,128,0.2))" strokeWidth={stroke} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    style={{ strokeDasharray: strokeDash }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color
            }}>{pct}%</div>
        </div>
    );
};

const ProgressBar = ({ pct, color, delay = 0 }) => (
    <div style={{
        height: 5, borderRadius: 99, overflow: 'hidden',
        background: 'var(--kimi-color-surface-muted, rgba(128,128,128,0.12))'
    }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + 0.3 }}
            style={{ height: '100%', borderRadius: 99, background: color }}
        />
    </div>
);

const Sparkline = ({ data, color }) => {
    const w = 72, h = 28;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.35, flexShrink: 0 }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────
// THEME TOKENS
// ─────────────────────────────────────────────────────────────────────
const DARK = {
    bg: 'transparent',
    surface: 'var(--kimi-color-surface, rgba(10,14,30,0.45))',
    surfaceRaised: 'var(--kimi-color-surface-raised, rgba(15,23,42,0.55))',
    border: 'var(--kimi-color-border, rgba(255,255,255,0.1))',
    text: 'var(--kimi-color-text-primary, #f8fafc)',
    textSecondary: 'var(--kimi-color-text-secondary, #94a3b8)',
    textTertiary: 'var(--kimi-color-text-tertiary, #64748b)',
};

const LIGHT = {
    bg: 'transparent',
    surface: 'var(--kimi-color-surface, rgba(255,255,255,0.8))',
    surfaceRaised: 'var(--kimi-color-surface-raised, rgba(255,255,255,0.9))',
    border: 'var(--kimi-color-border, rgba(15,23,42,0.1))',
    text: 'var(--kimi-color-text-primary, #0f172a)',
    textSecondary: 'var(--kimi-color-text-secondary, #475569)',
    textTertiary: 'var(--kimi-color-text-tertiary, #94a3b8)',
};

const C = {
    blue: 'var(--kimi-chart-1, #3b82f6)',
    green: 'var(--kimi-chart-3, #22c55e)',
    red: 'var(--kimi-chart-2, #ef4444)',
    purple: 'var(--kimi-chart-4, #a855f7)',
    positive: 'var(--kimi-color-positive, #22c55e)',
    warning: 'var(--kimi-color-warning, #f59e0b)',
};

// Sparkline data (visual only)
const SPARKS = {
    students: [780, 850, 910, 970, 1020, 1080, 1150, 1248],
    subjects: [10, 11, 12, 13, 14, 15, 16, 17],
    teachers: [30, 33, 36, 38, 40, 42, 44, 46],
};

// ─────────────────────────────────────────────────────────────────────
// STAGGERED MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
};

const cardHover = {
    rest: { y: 0, scale: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    hover: { 
        y: -5, scale: 1.02, 
        boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    },
    tap: { scale: 0.98 }
};

// ─────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, accent, spark, onClick, theme, index }) => (
    <motion.div
        variants={itemVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        animate="rest"
        onClick={onClick}
        style={{
            background: theme.surfaceRaised,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: '22px 20px 18px',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <motion.div 
            variants={cardHover}
            style={{ height: '100%' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: accent, fontSize: 18
                }}>{icon}</div>
                {spark && <Sparkline data={spark} color={accent} />}
            </div>
            
            <div style={{
                fontSize: 34, fontWeight: 500,
                color: theme.text, lineHeight: 1.1,
                marginBottom: 6, fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum" 1',
                fontFamily: 'var(--kimi-font-sans, sans-serif)'
            }}>
                {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </div>
            
            <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 400 }}>
                {title}
            </div>
        </motion.div>
    </motion.div>
);

const SubjectCard = ({ sub, idx, theme, onClick }) => {
    const pct = sub.studentCount > 0 
        ? Math.round((sub.paidFees / sub.studentCount) * 100) 
        : 0;
    const good = pct > 80;
    const accent = good ? C.positive : C.warning;
    
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            style={{
                background: theme.surfaceRaised,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                    <div style={{ fontWeight: 500, fontSize: 15, color: theme.text, marginBottom: 2 }}>
                        {sub.subject}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textTertiary }}>
                        {sub.studentCount} students enrolled
                    </div>
                </div>
                <RadialRing pct={pct} color={accent} delay={idx * 0.07} />
            </div>
            
            <ProgressBar pct={pct} color={accent} delay={idx * 0.07} />
            
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', 
                marginTop: 12, fontSize: 12, color: theme.textSecondary 
            }}>
                <span>{sub.paidFees} paid</span>
                <span style={{ color: accent, fontWeight: 500 }}>
                    {sub.studentCount - sub.paidFees} pending
                </span>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    // ── original state ──
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [feeRemindersOpen, setFeeRemindersOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
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

    const handleDownloadBackup = () => {
        window.open(`${API_BASE_URL}/api/backup/export`, '_blank');
    };

    // ── compute overall collection rate ──
    const collectionRate = stats && stats.subjectStats && stats.subjectStats.length > 0
        ? Math.round(
            (stats.subjectStats.reduce((a, s) => a + s.paidFees, 0) /
             stats.subjectStats.reduce((a, s) => a + s.studentCount, 0)) * 100
          )
        : 0;

    // ── loading state ──
    if (loading) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20,
            background: 'var(--kimi-color-surface, #0a0e1e)'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: 44, height: 44, borderRadius: '50%',
                    border: '3px solid var(--kimi-color-border)',
                    borderTopColor: 'var(--kimi-chart-1, #3b82f6)',
                }}
            />
            <span style={{
                color: 'var(--kimi-color-text-tertiary)', fontSize: 13,
                letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500
            }}>Loading dashboard…</span>
        </div>
    );

    // ── error state ──
    if (!stats || typeof stats === 'string') return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
            background: 'var(--kimi-color-surface, #0a0e1e)'
        }}>
            <div style={{ fontSize: 32 }}>⚠️</div>
            <div style={{ 
                color: 'var(--kimi-color-text-primary)', 
                fontWeight: 500, fontSize: 16 
            }}>Error loading stats</div>
            <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={fetchStats}
                style={{
                    border: 'none', cursor: 'pointer', padding: '10px 22px',
                    borderRadius: 10, background: 'var(--kimi-chart-1, #3b82f6)',
                    color: '#fff', fontWeight: 500, fontSize: 13,
                }}
            >↺ Retry</motion.button>
        </div>
    );

    // ── main render ──
    return (
        <div style={{
            minHeight: '100vh',
            background: theme.bg,
            fontFamily: 'var(--kimi-font-sans, sans-serif)',
            color: theme.text,
            position: 'relative',
            overflow: 'hidden',
            transition: 'color 0.3s',
        }}>
            {/* Background dot pattern */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: `radial-gradient(circle, ${theme.border} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.4,
            }} />

            {/* Page content */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
                
                {/* ═══ TOP NAV ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 0 24px',
                        borderBottom: `1px solid ${theme.border}`,
                        marginBottom: 32, flexWrap: 'wrap', gap: 14,
                    }}
                >
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'var(--kimi-color-text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 17, fontWeight: 600, color: 'var(--kimi-color-surface)',
                        }}>E</div>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 16 }}>EduFlex</div>
                            <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: -1 }}>
                                Institute dashboard
                            </div>
                        </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {/* Live indicator */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, color: C.positive, fontWeight: 500,
                            background: `color-mix(in srgb, ${C.positive} 8%, transparent)`,
                            padding: '5px 10px', borderRadius: 99,
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: C.positive,
                                animation: 'pulse 2s ease-in-out infinite',
                                display: 'inline-block'
                            }} />
                            Live data
                        </div>

                        {/* Theme toggle */}
                        <motion.button
                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                            onClick={() => setIsDark(!isDark)}
                            style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: `1px solid ${theme.border}`,
                                background: theme.surface, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 15, color: theme.textSecondary,
                            }}
                        >{isDark ? '☀️' : '🌙'}</motion.button>

                        {/* Fix Data */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={handleFixData}
                            style={{
                                border: `1px solid ${C.warning}33`, cursor: 'pointer',
                                padding: '7px 14px', borderRadius: 8,
                                background: `color-mix(in srgb, ${C.warning} 8%, transparent)`,
                                color: C.warning, fontWeight: 500, fontSize: 12,
                            }}
                        >🔧 Fix data</motion.button>

                        {/* Generate Report */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setReportOpen(true)}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '8px 16px', borderRadius: 8,
                                background: 'var(--kimi-color-text-primary)',
                                color: 'var(--kimi-color-surface)', fontWeight: 500, fontSize: 12,
                            }}
                        >📊 {t('generate_report')}</motion.button>

                        {/* DB Backup */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={handleDownloadBackup}
                            style={{
                                border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer',
                                padding: '8px 14px', borderRadius: 8,
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: '#818cf8', fontWeight: 600, fontSize: 12,
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >💾 Backup DB</motion.button>

                        {/* Fee Reminders */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setFeeRemindersOpen(true)}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '8px 16px', borderRadius: 8,
                                background: '#f59e0b', color: '#fff',
                                fontWeight: 600, fontSize: 12,
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >📢 Fee Reminders</motion.button>

                        {/* QR Scan */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => navigate('/qr-scanner')}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '8px 16px', borderRadius: 8,
                                background: C.blue, color: '#fff',
                                fontWeight: 500, fontSize: 12,
                            }}
                        >📷 Scan</motion.button>
                    </div>
                </motion.div>

                {/* ═══ HERO HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        display: 'flex', alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 16, marginBottom: 28
                    }}
                >
                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '2px',
                            textTransform: 'uppercase', color: C.blue, marginBottom: 8,
                        }}>● Live overview</div>
                        <h1 style={{
                            margin: 0,
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            fontWeight: 500, lineHeight: 1.1,
                            fontFamily: 'var(--kimi-font-sans, sans-serif)',
                            color: theme.text,
                        }}>
                            {t('dashboard_overview')}
                        </h1>
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: theme.textSecondary }}>
                            {t('dashboard_subtitle')}
                        </p>
                    </div>

                    {/* Overall collection rate */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        style={{
                            background: theme.surface,
                            border: `1px solid ${theme.border}`,
                            borderRadius: 12, padding: '16px 22px',
                            textAlign: 'right',
                        }}
                    >
                        <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>
                            Overall collection
                        </div>
                        <div style={{
                            fontSize: 28, fontWeight: 500, lineHeight: 1,
                            color: C.positive, fontVariantNumeric: 'tabular-nums',
                        }}>
                            <AnimatedCounter value={collectionRate} />%
                        </div>
                        <div style={{ fontSize: 10, color: theme.textTertiary, marginTop: 4 }}>
                            from MongoDB live data
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══ STAT CARDS ═══ */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16, marginBottom: 28
                    }}
                >
                    <StatCard
                        title={t('total_students')}
                        value={stats.totalStudents}
                        icon="👥"
                        accent={C.blue}
                        spark={SPARKS.students}
                        theme={theme}
                        index={0}
                    />
                    <StatCard
                        title={t('total_subjects')}
                        value={stats.totalSubjects}
                        icon="📚"
                        accent={C.purple}
                        spark={SPARKS.subjects}
                        theme={theme}
                        index={1}
                    />
                    <StatCard
                        title="Teachers"
                        value={stats.teacherCount || 0}
                        icon="🎓"
                        accent={C.green}
                        spark={SPARKS.teachers}
                        theme={theme}
                        onClick={() => navigate('/teachers')}
                        index={2}
                    />
                    <StatCard
                        title="Collection rate"
                        value={`${collectionRate}%`}
                        icon="📈"
                        accent={C.positive}
                        theme={theme}
                        index={3}
                    />
                </motion.div>

                {/* ═══ ANALYTICS CHART ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background: theme.surfaceRaised,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 12, padding: 24,
                        marginBottom: 28,
                    }}
                >
                    <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>
                        Analytics
                    </div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16 }}>
                        Live data from your MongoDB
                    </div>
                    <AnalyticsChart />
                </motion.div>

                {/* ═══ SUBJECT PERFORMANCE ═══ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 12, marginBottom: 20
                    }}>
                        <div>
                            <h2 style={{
                                margin: 0, fontWeight: 500, fontSize: 18,
                                color: theme.text
                            }}>
                                Subject performance
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.textSecondary }}>
                                Fee collection rates — live from MongoDB
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 14 }}>
                            {[
                                { color: C.positive, label: 'Good (>80%)' },
                                { color: C.warning, label: 'Needs attention' },
                            ].map(({ color, label }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textSecondary }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 14
                        }}
                    >
                        {(stats.subjectStats || []).map((sub, i) => (
                            <SubjectCard
                                key={sub.subject}
                                sub={sub}
                                idx={i}
                                theme={theme}
                                onClick={() => handleSubjectClick(sub.subject)}
                            />
                        ))}
                    </motion.div>
                </motion.div>

                {/* ═══ FOOTER ═══ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        marginTop: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 0',
                        borderTop: `1px solid ${theme.border}`,
                        fontSize: 11, color: theme.textTertiary, flexWrap: 'wrap', gap: 8,
                    }}
                >
                    <span>EduFlex Institute • Real-time dashboard</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: C.positive, display: 'inline-block',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        MongoDB connected
                    </span>
                    <span>Live data · auto-refresh on mount</span>
                </motion.div>
            </div>

            {/* ═══ ALL ORIGINAL DIALOGS — unchanged ═══ */}
            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
            />
            <SubjectDetailsDialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onUpdate={fetchStats}
                subjectName={selectedSubject}
            />
            <FeeRemindersDialog
                open={feeRemindersOpen}
                onClose={() => setFeeRemindersOpen(false)}
            />

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.8)} }
            `}</style>
        </div>
    );
}

