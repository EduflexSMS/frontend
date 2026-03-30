import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// ── Animated counter ──────────────────────────────────────────────
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
    const spring = useSpring(0, { bounce: 0, duration: 1800 });
    const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`);
    useEffect(() => { spring.set(value); }, [spring, value]);
    return <motion.span>{display}</motion.span>;
};

// ── Particle burst (used behind stat cards) ────────────────────────
const Particles = ({ color }) => (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * 360;
            const x = 50 + 35 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 35 * Math.sin((angle * Math.PI) / 180);
            return (
                <motion.circle
                    key={i}
                    cx="50%" cy="50%" r="3"
                    fill={color}
                    initial={{ opacity: 0, cx: '50%', cy: '50%' }}
                    animate={{ opacity: [0, 0.7, 0], cx: `${x}%`, cy: `${y}%` }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, repeatDelay: 1 }}
                />
            );
        })}
    </svg>
);

// ── Glowing orb background ─────────────────────────────────────────
const GlowOrb = ({ color, size = 300, x, y, blur = 100, opacity = 0.18 }) => (
    <div style={{
        position: 'fixed', left: x, top: y, width: size, height: size,
        borderRadius: '50%', background: color,
        filter: `blur(${blur}px)`, opacity, pointerEvents: 'none', zIndex: 0,
        transform: 'translate(-50%, -50%)'
    }} />
);

// ── Sparkline mini-chart ───────────────────────────────────────────
const Sparkline = ({ data, color, height = 36 }) => {
    const w = 80, h = height;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(' ');
    const area = `M 0,${h} L ${pts.split(' ').map(p => p).join(' L ')} L ${w},${h} Z`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// ── Radial progress ring ───────────────────────────────────────────
const RadialRing = ({ pct, color, size = 56, stroke = 4 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${dash} ${circ}` }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
            />
        </svg>
    );
};

// ── Theme tokens ───────────────────────────────────────────────────
const LIGHT = {
    bg: '#f6f5f2',
    surface: 'rgba(255,255,255,0.72)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    text: '#0f0e0c',
    textSub: '#6b6a66',
    card: 'rgba(255,255,255,0.85)',
};
const DARK = {
    bg: '#0a0a0c',
    surface: 'rgba(18,18,22,0.82)',
    surfaceBorder: 'rgba(255,255,255,0.07)',
    text: '#f2f1ee',
    textSub: '#888880',
    card: 'rgba(20,20,26,0.90)',
};

const ACCENT = {
    cyan:    '#00e5ff',
    indigo:  '#6c63ff',
    emerald: '#00c896',
    amber:   '#ffb547',
    rose:    '#ff5f7e',
    violet:  '#b57aff',
};

const MOCK_STATS = {
    totalStudents: 1284,
    totalSubjects: 18,
    teacherCount: 47,
    subjectStats: [
        { subject: 'Mathematics', studentCount: 312, paidFees: 289 },
        { subject: 'Physics',     studentCount: 245, paidFees: 188 },
        { subject: 'Chemistry',   studentCount: 198, paidFees: 176 },
        { subject: 'Biology',     studentCount: 167, paidFees: 134 },
        { subject: 'English',     studentCount: 289, paidFees: 261 },
        { subject: 'History',     studentCount: 134, paidFees: 98  },
    ],
};

const SPARKLINES = {
    students: [980, 1020, 1055, 1100, 1148, 1200, 1241, 1284],
    subjects:  [12,   13,   14,   15,   16,   17,   17,  18],
    teachers:  [38,   40,   41,   43,   44,   45,   46,  47],
    revenue:   [62,   71,   68,   80,   84,   88,   92,  96],
};

// ── Stat card ──────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, spark, prefix='', suffix='', onClick, theme }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            onClick={onClick}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'relative',
                background: theme.card,
                border: `1px solid ${hovered ? accent + '55' : theme.surfaceBorder}`,
                borderRadius: 24,
                padding: '28px 28px 22px',
                cursor: onClick ? 'pointer' : 'default',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                boxShadow: hovered
                    ? `0 20px 60px ${accent}22, 0 0 0 1px ${accent}33`
                    : '0 4px 24px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
        >
            {/* Corner glow */}
            <motion.div
                animate={{ opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute', top: -60, right: -60,
                    width: 180, height: 180, borderRadius: '50%',
                    background: accent, filter: 'blur(60px)', opacity: 0.15,
                    pointerEvents: 'none'
                }}
            />

            {/* Icon badge */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: 14,
                background: accent + '1a',
                border: `1px solid ${accent}33`,
                fontSize: 20, marginBottom: 16,
                boxShadow: hovered ? `0 0 20px ${accent}44` : 'none',
                transition: 'box-shadow 0.3s'
            }}>
                {icon}
            </div>

            {/* Number */}
            <div style={{
                fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
                fontSize: 38, fontWeight: 800,
                color: theme.text, letterSpacing: '-1.5px', lineHeight: 1,
                marginBottom: 6
            }}>
                {typeof value === 'number'
                    ? <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
                    : value}
            </div>

            {/* Label + sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '1.2px', color: theme.textSub }}>{label}</span>
                {spark && <Sparkline data={spark} color={accent} />}
            </div>

            {/* Bottom accent line */}
            <motion.div
                animate={{ scaleX: hovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                    transformOrigin: 'center'
                }}
            />
        </motion.div>
    );
};

// ── Subject performance card ───────────────────────────────────────
const SubjectCard = ({ sub, idx, theme, onClick }) => {
    const pct = sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0;
    const isGood = pct > 80;
    const accent = isGood ? ACCENT.emerald : ACCENT.rose;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            onClick={onClick}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.07 }}
            whileHover={{ y: -5, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            style={{
                background: theme.card,
                border: `1px solid ${hovered ? accent + '55' : theme.surfaceBorder}`,
                borderRadius: 20,
                padding: '24px',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: hovered
                    ? `0 16px 48px ${accent}1a, 0 0 0 1px ${accent}33`
                    : '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
        >
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 120, height: 120, borderRadius: '50%',
                background: accent, filter: 'blur(50px)',
                opacity: hovered ? 0.18 : 0.06, transition: 'opacity 0.3s',
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: theme.text, letterSpacing: '-0.3px' }}>
                    {sub.subject}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RadialRing pct={pct} color={accent} />
                    <span style={{
                        fontSize: 13, fontWeight: 800, color: accent,
                        background: accent + '1a', padding: '4px 10px',
                        borderRadius: 99, border: `1px solid ${accent}33`
                    }}>
                        {Math.round(pct)}%
                    </span>
                </div>
            </div>

            {/* Progress track */}
            <div style={{
                height: 6, borderRadius: 99, overflow: 'hidden',
                background: 'rgba(128,128,128,0.12)', marginBottom: 16
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.07 + 0.2 }}
                    style={{
                        height: '100%', borderRadius: 99,
                        background: isGood
                            ? `linear-gradient(90deg, ${ACCENT.emerald}, ${ACCENT.cyan})`
                            : `linear-gradient(90deg, ${ACCENT.rose}, ${ACCENT.amber})`,
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: theme.textSub }}>
                    👥 {sub.studentCount} students
                </span>
                <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: accent, background: accent + '15',
                    padding: '3px 10px', borderRadius: 99,
                    border: `1px solid ${accent}22`
                }}>
                    {sub.paidFees} Paid
                </span>
            </div>
        </motion.div>
    );
};

// ── Mini bar chart ─────────────────────────────────────────────────
const BarChart = ({ data, accent, theme }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / max) * 64}px` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                        style={{
                            width: '100%', borderRadius: '6px 6px 0 0',
                            background: i === data.length - 1
                                ? `linear-gradient(180deg, ${accent}, ${accent}88)`
                                : 'rgba(128,128,128,0.18)',
                        }}
                    />
                    <span style={{ fontSize: 10, color: theme.textSub }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
    const [isDark, setIsDark] = useState(true);
    const [stats] = useState(MOCK_STATS);
    const [activeTab, setActiveTab] = useState('overview');
    const theme = isDark ? DARK : LIGHT;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: '⬡' },
        { id: 'subjects', label: 'Subjects', icon: '📚' },
        { id: 'teachers', label: 'Teachers', icon: '👤' },
    ];

    const barData = [
        { label: 'Mon', value: 42 },
        { label: 'Tue', value: 58 },
        { label: 'Wed', value: 47 },
        { label: 'Thu', value: 63 },
        { label: 'Fri', value: 71 },
        { label: 'Sat', value: 38 },
        { label: 'Sun', value: 85 },
    ];

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
            {/* Background orbs */}
            <GlowOrb color={ACCENT.cyan}   size={500} x="10%"  y="15%"  blur={120} opacity={isDark ? 0.12 : 0.07} />
            <GlowOrb color={ACCENT.violet} size={400} x="85%"  y="25%"  blur={100} opacity={isDark ? 0.10 : 0.06} />
            <GlowOrb color={ACCENT.emerald}size={350} x="60%"  y="80%"  blur={100} opacity={isDark ? 0.08 : 0.05} />

            {/* Grid texture overlay */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(${theme.surfaceBorder} 1px, transparent 1px), linear-gradient(90deg, ${theme.surfaceBorder} 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
                opacity: isDark ? 0.5 : 0.3,
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>

                {/* ── Top Nav ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '24px 0 32px', borderBottom: `1px solid ${theme.surfaceBorder}`,
                    marginBottom: 40,
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: `linear-gradient(135deg, ${ACCENT.cyan}, ${ACCENT.indigo})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 900, color: '#fff',
                            boxShadow: `0 0 24px ${ACCENT.cyan}55`,
                        }}>E</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' }}>EduFlex</div>
                            <div style={{ fontSize: 11, color: theme.textSub, marginTop: -2 }}>Institute Dashboard</div>
                        </div>
                    </div>

                    {/* Nav pills */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: theme.surface,
                        border: `1px solid ${theme.surfaceBorder}`,
                        borderRadius: 14, padding: 4,
                        backdropFilter: 'blur(20px)',
                    }}>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    border: 'none', cursor: 'pointer',
                                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                    background: activeTab === item.id
                                        ? `linear-gradient(135deg, ${ACCENT.cyan}22, ${ACCENT.indigo}22)`
                                        : 'transparent',
                                    color: activeTab === item.id ? theme.text : theme.textSub,
                                    boxShadow: activeTab === item.id ? `0 0 0 1px ${ACCENT.cyan}44` : 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Theme toggle */}
                        <motion.button
                            onClick={() => setIsDark(!isDark)}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            style={{
                                width: 40, height: 40, borderRadius: 12, border: `1px solid ${theme.surfaceBorder}`,
                                background: theme.surface, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </motion.button>

                        {/* Generate report */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '10px 20px', borderRadius: 12,
                                background: `linear-gradient(135deg, ${ACCENT.cyan}, ${ACCENT.indigo})`,
                                color: '#fff', fontWeight: 700, fontSize: 13,
                                boxShadow: `0 0 24px ${ACCENT.cyan}44`,
                                letterSpacing: '0.3px',
                            }}
                        >
                            📊 Generate Report
                        </motion.button>

                        {/* Scan */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{
                                border: 'none', cursor: 'pointer',
                                padding: '10px 20px', borderRadius: 12,
                                background: `linear-gradient(135deg, ${ACCENT.amber}, ${ACCENT.rose})`,
                                color: '#fff', fontWeight: 700, fontSize: 13,
                                boxShadow: `0 0 24px ${ACCENT.amber}44`,
                                letterSpacing: '0.3px',
                            }}
                        >
                            📷 QR Scan
                        </motion.button>
                    </div>
                </div>

                {/* ── Hero Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 48 }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{
                                fontSize: 11, fontWeight: 800, letterSpacing: '3px',
                                textTransform: 'uppercase', color: ACCENT.cyan, marginBottom: 8,
                            }}>
                                ● Live Dashboard
                            </div>
                            <h1 style={{
                                margin: 0, fontSize: 'clamp(32px, 5vw, 54px)',
                                fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05,
                                background: isDark
                                    ? `linear-gradient(135deg, #fff 30%, ${ACCENT.cyan} 70%)`
                                    : `linear-gradient(135deg, #0f0e0c 30%, ${ACCENT.indigo} 70%)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                Institute<br />Overview
                            </h1>
                        </div>
                        <div style={{
                            background: theme.surface, border: `1px solid ${theme.surfaceBorder}`,
                            borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(20px)',
                            textAlign: 'right'
                        }}>
                            <div style={{ fontSize: 11, color: theme.textSub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue Rate</div>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: ACCENT.emerald }}>
                                <AnimatedNumber value={88} suffix="%" />
                            </div>
                            <div style={{ fontSize: 11, color: theme.textSub }}>↑ 4% from last month</div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stat Cards ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 20, marginBottom: 40
                }}>
                    <StatCard label="Total Students" value={stats.totalStudents} icon="👥"
                        accent={ACCENT.cyan} spark={SPARKLINES.students} theme={theme} />
                    <StatCard label="Total Subjects" value={stats.totalSubjects} icon="📚"
                        accent={ACCENT.indigo} spark={SPARKLINES.subjects} theme={theme} />
                    <StatCard label="Teachers" value={stats.teacherCount} icon="🎓"
                        accent={ACCENT.emerald} spark={SPARKLINES.teachers} theme={theme} />
                    <StatCard label="Collection Rate" value={88} suffix="%" icon="💰"
                        accent={ACCENT.amber} spark={SPARKLINES.revenue} theme={theme} />
                </div>

                {/* ── Analytics Row ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr',
                    gap: 20, marginBottom: 40
                }}>
                    {/* Weekly activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            background: theme.card, border: `1px solid ${theme.surfaceBorder}`,
                            borderRadius: 24, padding: 28, backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Weekly Activity</div>
                                <div style={{ fontSize: 12, color: theme.textSub, marginTop: 2 }}>Student check-ins this week</div>
                            </div>
                            <span style={{
                                fontSize: 11, fontWeight: 800, color: ACCENT.emerald,
                                background: ACCENT.emerald + '1a', padding: '4px 12px',
                                borderRadius: 99, border: `1px solid ${ACCENT.emerald}33`
                            }}>+12% ↑</span>
                        </div>
                        <BarChart data={barData} accent={ACCENT.cyan} theme={theme} />
                    </motion.div>

                    {/* Quick actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{
                            background: theme.card, border: `1px solid ${theme.surfaceBorder}`,
                            borderRadius: 24, padding: 28, backdropFilter: 'blur(20px)',
                            display: 'flex', flexDirection: 'column', gap: 12
                        }}
                    >
                        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', marginBottom: 8 }}>Quick Actions</div>
                        {[
                            { label: 'Add New Teacher', icon: '➕', color: ACCENT.indigo },
                            { label: 'View All Teachers', icon: '👤', color: ACCENT.cyan },
                            { label: 'Fix Data', icon: '🔧', color: ACCENT.amber },
                            { label: 'Scan QR Code', icon: '📷', color: ACCENT.rose },
                        ].map((a, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: 4, background: a.color + '1a' }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    border: `1px solid ${a.color}22`,
                                    background: 'transparent', borderRadius: 12, padding: '10px 14px',
                                    cursor: 'pointer', color: theme.text, fontSize: 13, fontWeight: 600,
                                    textAlign: 'left', transition: 'all 0.2s',
                                }}
                            >
                                <span style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: a.color + '20', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 14
                                }}>{a.icon}</span>
                                {a.label}
                                <span style={{ marginLeft: 'auto', color: theme.textSub, fontSize: 11 }}>→</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* ── Subject Performance ── */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, letterSpacing: '-0.8px' }}>
                                Subject Performance
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textSub }}>
                                Fee collection rates by subject
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.textSub }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: ACCENT.emerald }} /> Good (>80%)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.textSub }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: ACCENT.rose }} /> Needs Attention
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 18
                    }}>
                        {stats.subjectStats.map((sub, i) => (
                            <SubjectCard key={sub.subject} sub={sub} idx={i} theme={theme}
                                onClick={() => alert(`${sub.subject} details`)} />
                        ))}
                    </div>
                </div>

                {/* ── Footer strip ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '20px 0', borderTop: `1px solid ${theme.surfaceBorder}`,
                        fontSize: 12, color: theme.textSub,
                    }}
                >
                    <span>EduFlex Institute • Real-time Dashboard</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT.emerald, display: 'inline-block',
                            boxShadow: `0 0 8px ${ACCENT.emerald}` }} />
                        All systems operational
                    </span>
                    <span>Last sync: just now</span>
                </motion.div>
            </div>
        </div>
    );
}