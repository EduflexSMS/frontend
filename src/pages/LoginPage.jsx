import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Container,
  CircularProgress, Alert, InputAdornment, IconButton,
  useTheme, alpha, Avatar, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Visibility, VisibilityOff, LockOutlined, PersonOutline,
  School, AdminPanelSettings, SupervisedUserCircle,
  ArrowBack, BadgeOutlined
} from '@mui/icons-material';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.jpg';

/* ─────────────────────────────────────────────────────────────────────
   ANIMATED CANVAS BACKGROUND — soft aurora orbs
───────────────────────────────────────────────────────────────────── */
function AuroraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { cx: 0.15, cy: 0.25, r: 420, color: '#1a56db', speed: 0.0004 },
      { cx: 0.85, cy: 0.15, r: 360, color: '#7c3aed', speed: 0.0003 },
      { cx: 0.5,  cy: 0.85, r: 500, color: '#0e9f6e', speed: 0.00025 },
      { cx: 0.75, cy: 0.65, r: 300, color: '#e3a008', speed: 0.0005 },
      { cx: 0.25, cy: 0.75, r: 280, color: '#e74694', speed: 0.00035 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#06070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb, i) => {
        const dx = Math.sin(t * orb.speed + i * 1.3) * 80;
        const dy = Math.cos(t * orb.speed * 1.2 + i * 0.9) * 60;
        const x = orb.cx * canvas.width + dx;
        const y = orb.cy * canvas.height + dy;

        const g = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        g.addColorStop(0, orb.color + '28');
        g.addColorStop(0.5, orb.color + '10');
        g.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FLOATING STAT BADGES — decorative ambient elements
───────────────────────────────────────────────────────────────────── */
const badges = [
  { label: 'Students', value: '2,840', icon: '🎓', top: '12%', left: '4%' },
  { label: 'Teachers', value: '148',   icon: '📚', top: '20%', right: '5%' },
  { label: 'Courses',  value: '96',    icon: '📖', bottom: '28%', left: '3%' },
  { label: 'Avg Grade','value': 'A+',  icon: '🏆', bottom: '18%', right: '4%' },
];

function FloatingBadge({ label, value, icon, style, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        zIndex: 5,
        ...style,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 130,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ color: '#fff', fontSize: 18, fontFamily: "'Sora', sans-serif", fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ROLE CONFIG
───────────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    title: 'Admin Portal',
    subtitle: 'Full institute control',
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
    glow: 'rgba(59,130,246,0.4)',
    accent: '#3b82f6',
    perks: ['User Management', 'Fee Control', 'Reports & Analytics'],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    title: 'Teacher Portal',
    subtitle: 'Classroom & attendance',
    icon: '📚',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
    glow: 'rgba(139,92,246,0.4)',
    accent: '#8b5cf6',
    perks: ['Student Count by Grade', 'Monthly Attendance', 'Class Overview'],
  },
  {
    id: 'student',
    label: 'Student',
    title: 'Student Portal',
    subtitle: 'Track your progress',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #0e9f6e 0%, #34d399 100%)',
    glow: 'rgba(52,211,153,0.4)',
    accent: '#34d399',
    perks: ['Attendance Record', 'Fee Payment Status', 'Academic Performance'],
  },
];

/* ─────────────────────────────────────────────────────────────────────
   ROLE SELECTION CARD
───────────────────────────────────────────────────────────────────── */
function RoleCard({ config, selected, onClick, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 90, damping: 18 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ cursor: 'pointer', height: '100%' }}
    >
      <div style={{
        height: '100%',
        padding: '28px 24px',
        borderRadius: 28,
        background: selected
          ? `linear-gradient(160deg, ${config.accent}22 0%, ${config.accent}08 100%)`
          : 'rgba(255,255,255,0.025)',
        border: `1.5px solid ${selected ? config.accent : 'rgba(255,255,255,0.07)'}`,
        backdropFilter: 'blur(24px)',
        boxShadow: selected ? `0 0 40px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.08)` : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top badge */}
        <div style={{
          width: 56, height: 56,
          borderRadius: 16,
          background: config.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
          boxShadow: `0 8px 24px ${config.glow}`,
        }}>
          {config.icon}
        </div>

        <div>
          <div style={{ color: '#fff', fontSize: 20, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 4 }}>{config.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{config.subtitle}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {config.perks.map((perk, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: config.accent, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 'auto',
          width: '100%',
          padding: '12px',
          borderRadius: 14,
          background: selected ? config.gradient : 'rgba(255,255,255,0.05)',
          textAlign: 'center',
          color: '#fff',
          fontFamily: "'Sora', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.03em',
          transition: 'all 0.3s ease',
          boxShadow: selected ? `0 4px 20px ${config.glow}` : 'none',
        }}>
          {selected ? '✓ Selected' : `Continue as ${config.label}`}
        </div>

        {/* shine line */}
        {selected && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`,
          }} />
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STYLED INPUT
───────────────────────────────────────────────────────────────────── */
function StyledInput({ label, placeholder, type = 'text', value, onChange, icon, endIcon, required }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        letterSpacing: '0.1em',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', zIndex: 1,
          }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            height: 52,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            color: '#fff',
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            paddingLeft: icon ? 46 : 18,
            paddingRight: endIcon ? 50 : 18,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(139,92,246,0.6)';
            e.target.style.background = 'rgba(255,255,255,0.07)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.background = 'rgba(255,255,255,0.04)';
          }}
        />
        {endIcon && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            {endIcon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useTranslation();
  const roleConfig = ROLES.find(r => r.id === selectedRole);

  useEffect(() => {
    const checkAuth = () => {
      let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (localStorage.getItem('userInfo')) localStorage.removeItem('userInfo');
      if (userInfo) {
        if (userInfo.role === 'student') window.location.href = '/student-dashboard';
        else if (userInfo.role === 'teacher') window.location.href = '/teacher-dashboard';
        else if (userInfo.role === 'admin') window.location.href = '/';
        else setIsCheckingAuth(false);
      } else { setIsCheckingAuth(false); }
    };
    checkAuth();

    axios.get(`${API_BASE_URL}/api/subjects`)
      .then(({ data }) => setSubjects(data))
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let userData = null;
      let redirectUrl = '/';
      const loginData = { username, password, role: selectedRole };

      if (selectedRole === 'student') {
        if (!studentId) throw new Error('Student ID is required');
        userData = { role: 'student', id: studentId, name: 'Student User' };
        redirectUrl = '/student-dashboard';
      } else {
        if (!username || !password) throw new Error('Username and password required');
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
        userData = data;
        if (userData.role !== selectedRole)
          throw new Error(`Access Denied: You cannot login as ${selectedRole} with a ${userData.role} account.`);
        redirectUrl = selectedRole === 'teacher' ? '/teacher-dashboard' : '/';
      }

      sessionStorage.setItem('userInfo', JSON.stringify(userData));
      localStorage.removeItem('userInfo');
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06070d' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#06070d', color: '#fff' }}>

        <AuroraBackground />

        {/* Floating ambient badges */}
        {badges.map((b, i) => (
          <FloatingBadge key={i} {...b} style={{ top: b.top, bottom: b.bottom, left: b.left, right: b.right }} delay={0.5 + i * 0.15} />
        ))}

        {/* Main content */}
        <div style={{
          position: 'relative', zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}>

          {/* ── HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            {/* Logo ring */}
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #34d399, #3b82f6)',
                animation: 'spin 4s linear infinite',
              }} />
              <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: '#06070d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logo} alt="logo" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div style={{ display: 'none', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎓</div>
              </div>
            </div>

            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 42px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              <span style={{ background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EDU
              </span>
              <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FLEX
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 6 }}>
              Institute Management System
            </div>
          </motion.div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* ── ROLE SELECTION ── */}
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="roles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: 960 }}
              >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                    Select your portal to continue
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                  {ROLES.map((role, i) => (
                    <RoleCard
                      key={role.id}
                      config={role}
                      selected={selectedRole === role.id}
                      onClick={() => setSelectedRole(role.id)}
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </motion.div>

            ) : (
              /* ── LOGIN FORM ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 24 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{ width: '100%', maxWidth: 460 }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 36,
                  padding: '40px 40px 36px',
                  boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Subtle top gradient line */}
                  <div style={{
                    position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                    background: `linear-gradient(90deg, transparent, ${roleConfig.accent}, transparent)`,
                  }} />

                  {/* Role accent glow */}
                  <div style={{
                    position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${roleConfig.glow} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button
                      onClick={() => { setSelectedRole(null); setError(''); }}
                      style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >←</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: roleConfig.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                          boxShadow: `0 4px 12px ${roleConfig.glow}`,
                        }}>
                          {roleConfig.icon}
                        </div>
                        <div style={{ color: '#fff', fontSize: 20, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
                          {roleConfig.title}
                        </div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                        Enter your credentials to sign in
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 12, padding: '12px 16px',
                          color: '#fca5a5', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span>⚠️</span> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form fields */}
                  <form onSubmit={handleLogin}>
                    {selectedRole === 'student' ? (
                      <StyledInput
                        label="Student ID"
                        placeholder="e.g. STU-2026-001"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        required
                        icon={<span style={{ fontSize: 18 }}>🎓</span>}
                      />
                    ) : (
                      <>
                        {selectedRole === 'teacher' && subjects.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <label style={{
                              display: 'block', color: 'rgba(255,255,255,0.5)',
                              fontSize: 11, letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600, marginBottom: 8, textTransform: 'uppercase',
                            }}>Subject</label>
                            <select
                              value={selectedSubject}
                              onChange={e => setSelectedSubject(e.target.value)}
                              style={{
                                width: '100%', height: 52,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14, color: selectedSubject ? '#fff' : 'rgba(255,255,255,0.25)',
                                fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                                padding: '0 18px', outline: 'none', cursor: 'pointer',
                              }}
                            >
                              <option value="" style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.5)' }}>Select Subject…</option>
                              {subjects.map(s => (
                                <option key={s._id} value={s.name} style={{ background: '#1a1a2e', color: '#fff' }}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <StyledInput
                          label="Username"
                          placeholder="Enter your username"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          required
                          icon={<span style={{ fontSize: 16 }}>👤</span>}
                        />

                        <StyledInput
                          label="Password"
                          placeholder="••••••••••"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          icon={<span style={{ fontSize: 16 }}>🔒</span>}
                          endIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 18, padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                            >
                              {showPassword ? '🙈' : '👁️'}
                            </button>
                          }
                        />
                      </>
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', height: 54, marginTop: 8,
                        borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        background: loading ? 'rgba(255,255,255,0.1)' : roleConfig.gradient,
                        color: '#fff', fontSize: 16,
                        fontFamily: "'Sora', sans-serif", fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: loading ? 'none' : `0 8px 30px ${roleConfig.glow}`,
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{
                            width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                          Signing in…
                        </>
                      ) : (
                        <>Sign In <span style={{ fontSize: 18 }}>→</span></>
                      )}
                    </motion.button>
                  </form>

                  {/* What you can access */}
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
                      Access includes
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {roleConfig.perks.map((perk, i) => (
                        <div key={i} style={{
                          background: `${roleConfig.accent}15`,
                          border: `1px solid ${roleConfig.accent}30`,
                          borderRadius: 8, padding: '4px 12px',
                          color: roleConfig.accent, fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                        }}>
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom note */}
                <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  🔐 Secured • Role-based access control
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}