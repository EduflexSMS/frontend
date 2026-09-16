import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../contexts/ThemeContext';

// ── Original dialogs & components (100% preserved) ─────────────────
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import AnalyticsChart from '../components/AnalyticsChart';
import FeeRemindersDialog from '../components/FeeRemindersDialog';
import API_BASE_URL from '../config';

// ─────────────────────────────────────────────────────────────────────
// ANIMATION COMPONENTS (Butter-smooth 120fps Springs)
// ─────────────────────────────────────────────────────────────────────

const AnimatedCounter = ({ value }) => {
    const spring = useSpring(0, { stiffness: 60, damping: 22 });
    const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
};

const RadialRing = ({ pct, color, size = 52, stroke = 4, delay = 0 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const spring = useSpring(0, { stiffness: 45, damping: 18 });
    const strokeDash = useTransform(spring, (v) => `${(v / 100) * circ} ${circ}`);

    useEffect(() => {
        const timer = setTimeout(() => spring.set(pct), delay * 1000 + 200);
        return () => clearTimeout(timer);
    }, [spring, pct, delay]);

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    opacity={0.12}
                    strokeWidth={stroke}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    style={{ strokeDasharray: strokeDash }}
                />
            </svg>
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color,
                letterSpacing: '-0.5px'
            }}>
                {pct}%
            </div>
        </div>
    );
};

const ProgressBar = ({ pct, color, delay = 0 }) => (
    <div style={{
        height: 6,
        borderRadius: 999,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.08)',
        position: 'relative',
    }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
            style={{
                height: '100%',
                borderRadius: 999,
                background: color,
                boxShadow: `0 0 10px ${color}88`,
            }}
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
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.6, flexShrink: 0 }}>
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// ─────────────────────────────────────────────────────────────────────
// THEME & COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────
const PALETTE = {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
};

const SPARKS = {
    students: [780, 850, 910, 970, 1020, 1080, 1150, 1248],
    subjects: [10, 11, 12, 13, 14, 15, 16, 17],
    teachers: [30, 33, 36, 38, 40, 42, 44, 46],
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
};

// ─────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, accent, spark, onClick, isDark }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{
            y: -6,
            scale: 1.018,
            boxShadow: isDark
                ? `0 20px 40px -15px ${accent}33, 0 0 1px 1px ${accent}44`
                : `0 20px 35px -10px ${accent}22, 0 0 0 1px ${accent}33`,
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            background: isDark
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDark
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: 18,
            padding: '24px 22px 20px',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* Subtle decorative radial glow in background */}
        <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: accent,
            opacity: isDark ? 0.12 : 0.08,
            filter: 'blur(28px)',
            pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accent,
                fontSize: 20,
                boxShadow: `0 4px 14px ${accent}22`,
            }}>
                {icon}
            </div>
            {spark && <Sparkline data={spark} color={accent} />}
        </div>

        <div style={{
            fontSize: 34,
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            lineHeight: 1.1,
            marginBottom: 6,
            letterSpacing: '-0.8px',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </div>

        <div style={{
            fontSize: 13,
            color: isDark ? '#94a3b8' : '#64748b',
            fontWeight: 600,
            letterSpacing: '0.2px'
        }}>
            {title}
        </div>
    </motion.div>
);

const SubjectCard = ({ sub, idx, isDark, onClick }) => {
    const pct = sub.studentCount > 0
        ? Math.round((sub.paidFees / sub.studentCount) * 100)
        : 0;
    const good = pct >= 80;
    const accent = good ? PALETTE.emerald : PALETTE.amber;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                y: -5,
                scale: 1.015,
                boxShadow: isDark
                    ? '0 16px 36px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2)'
                    : '0 16px 30px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.15)',
                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }}
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.55) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.75) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: 16,
                padding: '20px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                    <div style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: isDark ? '#f8fafc' : '#0f172a',
                        marginBottom: 4,
                        letterSpacing: '-0.2px'
                    }}>
                        {sub.subject}
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                        {sub.studentCount} students enrolled
                    </div>
                </div>
                <RadialRing pct={pct} color={accent} delay={idx * 0.05} />
            </div>

            <ProgressBar pct={pct} color={accent} delay={idx * 0.05} />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 14,
                fontSize: 12.5,
                fontWeight: 600,
                color: isDark ? '#94a3b8' : '#64748b'
            }}>
                <span style={{ color: PALETTE.emerald }}>{sub.paidFees} paid</span>
                <span style={{ color: sub.studentCount - sub.paidFees > 0 ? PALETTE.amber : isDark ? '#64748b' : '#94a3b8' }}>
                    {sub.studentCount - sub.paidFees} pending
                </span>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [feeRemindersOpen, setFeeRemindersOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const { mode } = useContext(ThemeContext);
    const isDark = mode === 'dark';
    const { t } = useTranslation();
    const navigate = useNavigate();

    // ── Original fetch logic ──
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

    useEffect(() => {
        fetchStats();
    }, []);

    // ── Handlers ──
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

    // ── Dynamic time greeting ──
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // ── Overall collection rate ──
    const collectionRate = stats && stats.subjectStats && stats.subjectStats.length > 0
        ? Math.round(
            (stats.subjectStats.reduce((a, s) => a + s.paidFees, 0) /
                stats.subjectStats.reduce((a, s) => a + s.studentCount, 0)) * 100
        )
        : 0;

    // ── Loading state ──
    if (loading) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: `3px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderTopColor: PALETTE.indigo,
                    }}
                />
                <span style={{
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 13,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                }}>
                    Loading Live Dashboard…
                </span>
            </div>
        );
    }

    // ── Error state ──
    if (!stats || typeof stats === 'string') {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
            }}>
                <div style={{ fontSize: 36 }}>⚠️</div>
                <div style={{
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontWeight: 700,
                    fontSize: 18,
                }}>
                    Unable to load dashboard stats
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchStats}
                    style={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: '12px 24px',
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${PALETTE.indigo} 0%, ${PALETTE.violet} 100%)`,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        boxShadow: `0 8px 20px ${PALETTE.indigo}44`,
                    }}
                >
                    ↺ Retry Connection
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
            
            {/* ═══ HERO BANNER & QUICK ACTIONS ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    background: isDark
                        ? 'radial-gradient(120% 120% at 0% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(15, 23, 42, 0.7) 100%)'
                        : 'radial-gradient(120% 120% at 0% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: 22,
                    padding: '28px 28px 24px',
                    marginBottom: 30,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isDark
                        ? '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
                        : '0 20px 35px -15px rgba(99, 102, 241, 0.12)',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 20,
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: `color-mix(in srgb, ${PALETTE.indigo} 18%, transparent)`,
                                color: PALETTE.indigo,
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                            }}>
                                {greeting}
                            </span>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 11.5,
                                color: PALETTE.emerald,
                                fontWeight: 700,
                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: PALETTE.emerald,
                                    boxShadow: `0 0 8px ${PALETTE.emerald}`,
                                    display: 'inline-block'
                                }} />
                                Real-time Sync
                            </span>
                        </div>

                        <h1 style={{
                            margin: 0,
                            fontSize: 'clamp(24px, 3.2vw, 36px)',
                            fontWeight: 900,
                            letterSpacing: '-0.8px',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            lineHeight: 1.15,
                        }}>
                            {t('dashboard_overview', 'Institute Command Center')}
                        </h1>
                        <p style={{
                            margin: '6px 0 0',
                            fontSize: 13.5,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontWeight: 500,
                        }}>
                            {t('dashboard_subtitle', 'Monitor live attendance, subject performance & fee collection.')}
                        </p>
                    </div>

                    {/* Overall collection rate badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 16,
                        padding: '12px 20px',
                    }}>
                        <div>
                            <div style={{
                                fontSize: 10.5,
                                color: isDark ? '#94a3b8' : '#64748b',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                            }}>
                                Overall Collection
                            </div>
                            <div style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: collectionRate >= 80 ? PALETTE.emerald : PALETTE.amber,
                                letterSpacing: '-0.5px',
                                lineHeight: 1.1,
                            }}>
                                <AnimatedCounter value={collectionRate} />%
                            </div>
                        </div>
                        <RadialRing
                            pct={collectionRate}
                            color={collectionRate >= 80 ? PALETTE.emerald : PALETTE.amber}
                            size={48}
                        />
                    </div>
                </div>

                {/* ── Quick Action Dock ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 22,
                    paddingTop: 18,
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                    flexWrap: 'wrap',
                }}>
                    {/* Fee Reminders */}
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFeeRemindersOpen(true)}
                        style={{
                            border: 'none',
                            cursor: 'pointer',
                            padding: '9px 18px',
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${PALETTE.amber} 0%, #f97316 100%)`,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                        }}
                    >
                        <span>📢</span>
                        <span>Fee Reminders</span>
                    </motion.button>

                    {/* Generate Report */}
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setReportOpen(true)}
                        style={{
                            border: 'none',
                            cursor: 'pointer',
                            padding: '9px 18px',
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${PALETTE.indigo} 0%, ${PALETTE.violet} 100%)`,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                        }}
                    >
                        <span>📊</span>
                        <span>{t('generate_report', 'Class Report')}</span>
                    </motion.button>

                    {/* QR Attendance */}
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/qr-scanner')}
                        style={{
                            border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(6, 182, 212, 0.25)',
                            cursor: 'pointer',
                            padding: '9px 16px',
                            borderRadius: 12,
                            background: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.08)',
                            color: PALETTE.cyan,
                            fontWeight: 700,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span>📷</span>
                        <span>QR Scan</span>
                    </motion.button>

                    {/* DB Backup */}
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadBackup}
                        style={{
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            padding: '9px 16px',
                            borderRadius: 12,
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontWeight: 600,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span>💾</span>
                        <span>Backup DB</span>
                    </motion.button>

                    {/* Fix Data */}
                    <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFixData}
                        style={{
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            cursor: 'pointer',
                            padding: '9px 14px',
                            borderRadius: 12,
                            background: 'rgba(245, 158, 11, 0.08)',
                            color: PALETTE.amber,
                            fontWeight: 600,
                            fontSize: 12.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginLeft: 'auto',
                        }}
                    >
                        <span>🔧</span>
                        <span>Fix Data</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* ═══ STAT CARDS ═══ */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 18,
                    marginBottom: 30,
                }}
            >
                <StatCard
                    title={t('total_students', 'Total Students')}
                    value={stats.totalStudents}
                    icon="👥"
                    accent={PALETTE.indigo}
                    spark={SPARKS.students}
                    isDark={isDark}
                />
                <StatCard
                    title={t('total_subjects', 'Total Subjects')}
                    value={stats.totalSubjects}
                    icon="📚"
                    accent={PALETTE.violet}
                    spark={SPARKS.subjects}
                    isDark={isDark}
                />
                <StatCard
                    title="Active Teachers"
                    value={stats.teacherCount || 0}
                    icon="🎓"
                    accent={PALETTE.cyan}
                    spark={SPARKS.teachers}
                    isDark={isDark}
                    onClick={() => navigate('/teachers')}
                />
                <StatCard
                    title="Collection Rate"
                    value={`${collectionRate}%`}
                    icon="📈"
                    accent={PALETTE.emerald}
                    isDark={isDark}
                />
            </motion.div>

            {/* ═══ ANALYTICS CHART ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.75) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: 20,
                    padding: 26,
                    marginBottom: 30,
                    boxShadow: isDark
                        ? '0 16px 36px -12px rgba(0, 0, 0, 0.5)'
                        : '0 16px 30px -12px rgba(0, 0, 0, 0.06)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <div style={{
                            fontWeight: 800,
                            fontSize: 18,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            letterSpacing: '-0.3px',
                        }}>
                            Attendance & Collection Analytics
                        </div>
                        <div style={{ fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 3 }}>
                            Comprehensive performance metrics across classes
                        </div>
                    </div>
                    <div style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: PALETTE.indigo,
                        background: `color-mix(in srgb, ${PALETTE.indigo} 12%, transparent)`,
                        padding: '6px 12px',
                        borderRadius: 10,
                    }}>
                        Live MongoDB Stream
                    </div>
                </div>
                <AnalyticsChart />
            </motion.div>

            {/* ═══ SUBJECT PERFORMANCE ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 20,
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: 20,
                            letterSpacing: '-0.4px',
                            color: isDark ? '#f8fafc' : '#0f172a',
                        }}>
                            Subject Performance
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: isDark ? '#94a3b8' : '#64748b' }}>
                            Fee collection progress per subject — click any card to inspect enrolled students
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE.emerald }} />
                            Optimal (&ge;80%)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE.amber }} />
                            Pending Follow-up
                        </div>
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 16,
                    }}
                >
                    {(stats.subjectStats || []).map((sub, i) => (
                        <SubjectCard
                            key={sub.subject}
                            sub={sub}
                            idx={i}
                            isDark={isDark}
                            onClick={() => handleSubjectClick(sub.subject)}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* ═══ ALL ORIGINAL DIALOGS (100% UNCHANGED) ═══ */}
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
        </div>
    );
}
