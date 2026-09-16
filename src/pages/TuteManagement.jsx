import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import API_BASE_URL from '../config';

const GRADES = ['All Grades', 'Grade 06', 'Grade 07', 'Grade 08', 'Grade 09', 'Grade 10', 'Grade 11'];

export default function TuteManagement() {
    const { mode } = useContext(ThemeContext);
    const isDark = mode === 'dark';

    const [selectedGrade, setSelectedGrade] = useState('All Grades');
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        totalIssuedTerm1: 0,
        totalIssuedTerm2: 0,
        totalIssuedTerm3: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [alertData, setAlertData] = useState(null);

    // Fetch students from backend
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const gradeParam = selectedGrade === 'All Grades' ? 'all' : selectedGrade;
            const res = await axios.get(`${API_BASE_URL}/api/tutes/students`, {
                params: { grade: gradeParam, search: searchTerm }
            });
            if (res.data && res.data.success) {
                setStudents(res.data.students || []);
                setStats(res.data.stats || {
                    totalIssuedTerm1: 0,
                    totalIssuedTerm2: 0,
                    totalIssuedTerm3: 0,
                    totalRevenue: 0
                });
            }
        } catch (err) {
            console.error('Error fetching tutes students:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedGrade, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 200);
        return () => clearTimeout(timer);
    }, [fetchStudents]);

    // Handle issuing a tute
    const handleIssueTute = async (student, termNum) => {
        const actionKey = `${student._id}-${termNum}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        try {
            const res = await axios.post(`${API_BASE_URL}/api/tutes/issue`, {
                studentId: student._id,
                term: termNum,
                subject: student.mathSubject || 'Mathematics',
                fee: 400,
                language: 'si'
            });

            if (res.data.success) {
                setAlertData({
                    type: 'success',
                    title: `Term ${termNum} Tute Issued!`,
                    message: `Rs. 400 collected for ${student.name}.`,
                    smsStatus: res.data.smsResult?.status || 'sent',
                    waMessage: res.data.waMessage,
                    mobile: student.mobile
                });
                fetchStudents();
            }
        } catch (err) {
            console.error('Failed to issue tute:', err);
            setAlertData({
                type: 'error',
                title: 'Issue Failed',
                message: err.response?.data?.message || err.message
            });
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    // Toggle status (unmark if clicked by error)
    const handleToggleTute = async (student, termNum) => {
        const actionKey = `${student._id}-${termNum}`;
        if (!window.confirm(`Are you sure you want to revert Term ${termNum} Tute for ${student.name} back to Pending?`)) {
            return;
        }
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        try {
            await axios.post(`${API_BASE_URL}/api/tutes/toggle`, {
                studentId: student._id,
                term: termNum,
                subject: student.mathSubject
            });
            fetchStudents();
        } catch (err) {
            console.error('Failed to toggle tute:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    // Resend SMS
    const handleResendSMS = async (student, termNum) => {
        const actionKey = `sms-${student._id}-${termNum}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        try {
            await axios.post(`${API_BASE_URL}/api/tutes/resend-sms`, {
                studentId: student._id,
                term: termNum,
                subject: student.mathSubject
            });
            alert(`SMS sent to ${student.mobile}!`);
        } catch (err) {
            alert('Failed to send SMS: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    const openWhatsApp = (mobile, message) => {
        if (!mobile) return;
        let cleaned = mobile.replace(/[^\d+]/g, '').trim().replace('+', '');
        if (cleaned.startsWith('0')) cleaned = '94' + cleaned.slice(1);
        if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message || '')}`, '_blank');
    };

    return (
        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative' }}>

            {/* ═══ HERO BANNER ═══ */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    background: isDark
                        ? 'radial-gradient(120% 120% at 0% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.7) 100%)'
                        : 'radial-gradient(120% 120% at 0% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.06) 50%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: 22,
                    padding: '26px 28px',
                    marginBottom: 26,
                    boxShadow: isDark ? '0 20px 40px -15px rgba(0,0,0,0.5)' : '0 20px 35px -15px rgba(99,102,241,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 20
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#6366f1',
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}>
                            Mathematics • Grades 6–11
                        </span>
                        <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 8px #10b981'
                            }} />
                            Hutch SIM Gateway Ready
                        </span>
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 'clamp(22px, 3vw, 32px)',
                        fontWeight: 900,
                        letterSpacing: '-0.7px',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        lineHeight: 1.2
                    }}>
                        Term Tute Distribution (වාර ටියුට් නිකුත් කිරීම)
                    </h1>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: 13.5,
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontWeight: 500
                    }}>
                        Rs. 400 per term tute • Instant Hutch SMS receipt dispatched on issue
                    </p>
                </div>

                {/* Quick Revenue Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 16,
                    padding: '12px 22px'
                }}>
                    <div>
                        <div style={{
                            fontSize: 10.5,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px'
                        }}>
                            Total Tute Collection
                        </div>
                        <div style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: '#10b981',
                            letterSpacing: '-0.5px'
                        }}>
                            Rs. {stats.totalRevenue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══ STATS ROW ═══ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24
            }}>
                <div style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    backdropFilter: 'blur(16px)'
                }}>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Total Math Students</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>{students.length}</div>
                </div>
                <div style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    backdropFilter: 'blur(16px)'
                }}>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Term 1 Issued</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{stats.totalIssuedTerm1}</div>
                </div>
                <div style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    backdropFilter: 'blur(16px)'
                }}>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Term 2 Issued</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#06b6d4', marginTop: 4 }}>{stats.totalIssuedTerm2}</div>
                </div>
                <div style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    backdropFilter: 'blur(16px)'
                }}>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Term 3 Issued</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>{stats.totalIssuedTerm3}</div>
                </div>
            </div>

            {/* ═══ FILTER & SEARCH BAR ═══ */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                marginBottom: 20
            }}>
                {/* Grade Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {GRADES.map(g => {
                        const active = selectedGrade === g;
                        return (
                            <motion.button
                                key={g}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGrade(g)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 12,
                                    border: active ? '1px solid #6366f1' : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                                    background: active ? '#6366f1' : isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255,255,255,0.8)',
                                    color: active ? '#fff' : isDark ? '#cbd5e1' : '#475569',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : 'none'
                                }}
                            >
                                {g}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Search Input */}
                <div style={{ position: 'relative', minWidth: 280, flex: '1 1 280px', maxWidth: 400 }}>
                    <span style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 15,
                        opacity: 0.6
                    }}>🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search student name, index, or mobile..."
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 40px',
                            borderRadius: 12,
                            background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.1)',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontSize: 13.5,
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            {/* ═══ ALERT POPUP / MODAL ═══ */}
            <AnimatePresence>
                {alertData && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            padding: '16px 20px',
                            borderRadius: 14,
                            marginBottom: 20,
                            background: alertData.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                            border: `1px solid ${alertData.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>{alertData.type === 'success' ? '✅' : '⚠️'}</span>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: alertData.type === 'success' ? '#10b981' : '#f43f5e' }}>
                                    {alertData.title}
                                </div>
                                <div style={{ fontSize: 12.5, color: isDark ? '#cbd5e1' : '#475569', marginTop: 2 }}>
                                    {alertData.message} • <strong>Hutch SIM SMS:</strong> {alertData.smsStatus || 'sent'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {alertData.waMessage && alertData.mobile && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openWhatsApp(alertData.mobile, alertData.waMessage)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: '#22c55e',
                                        color: '#fff',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    <span>💬</span>
                                    <span>Share WhatsApp</span>
                                </motion.button>
                            )}
                            <button
                                onClick={() => setAlertData(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    padding: '4px 8px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ STUDENTS LIST / CARDS ═══ */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: isDark ? '#94a3b8' : '#64748b' }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>⏳</div>
                    <div>Loading Mathematics Students...</div>
                </div>
            ) : students.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    borderRadius: 18,
                    background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                        No Mathematics students found
                    </div>
                    <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }}>
                        Make sure students are enrolled in Mathematics in Grades 06 to 11.
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {students.map((student) => (
                        <motion.div
                            key={student._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
                                borderRadius: 18,
                                padding: '18px 22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 16,
                                boxShadow: isDark ? '0 10px 25px -10px rgba(0,0,0,0.4)' : '0 10px 20px -10px rgba(0,0,0,0.05)'
                            }}
                        >
                            {/* Student Meta */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 240 }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 13,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: 16
                                }}>
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{
                                        fontWeight: 800,
                                        fontSize: 15,
                                        color: isDark ? '#f8fafc' : '#0f172a'
                                    }}>
                                        {student.name}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginTop: 3,
                                        fontSize: 12,
                                        color: isDark ? '#94a3b8' : '#64748b'
                                    }}>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            padding: '2px 6px',
                                            borderRadius: 5,
                                            background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)',
                                            color: '#06b6d4',
                                            fontWeight: 700
                                        }}>
                                            {student.indexNumber}
                                        </span>
                                        <span>•</span>
                                        <span>{student.grade}</span>
                                        <span>•</span>
                                        <span>{student.mobile || 'No Mobile'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3 Terms Matrix Controls */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                flexWrap: 'wrap'
                            }}>
                                {[1, 2, 3].map(termNum => {
                                    const termData = student.terms.find(t => t.term === termNum) || {
                                        term: termNum,
                                        paid: false,
                                        issued: false,
                                        fee: 400
                                    };
                                    const isIssued = termData.issued || termData.paid;
                                    const loadingKey = `${student._id}-${termNum}`;
                                    const isLoading = actionLoading[loadingKey];

                                    return (
                                        <div
                                            key={termNum}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: 14,
                                                background: isIssued
                                                    ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)')
                                                    : (isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)'),
                                                border: `1px solid ${isIssued ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                                minWidth: 140,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.8px',
                                                color: isIssued ? '#10b981' : '#f59e0b'
                                            }}>
                                                Term {termNum}
                                            </div>

                                            {isIssued ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        color: '#10b981',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4
                                                    }}>
                                                        <span>✓</span>
                                                        <span>Issued (Rs. {termData.fee || 400})</span>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                                        {/* Re-send SMS button */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.92 }}
                                                            onClick={() => handleResendSMS(student, termNum)}
                                                            title="Resend SMS"
                                                            style={{
                                                                padding: '3px 8px',
                                                                borderRadius: 6,
                                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                background: 'transparent',
                                                                color: '#10b981',
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📨 SMS
                                                        </motion.button>

                                                        {/* Toggle back to pending */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.92 }}
                                                            onClick={() => handleToggleTute(student, termNum)}
                                                            title="Revert to Pending"
                                                            style={{
                                                                padding: '3px 8px',
                                                                borderRadius: 6,
                                                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                                                background: 'transparent',
                                                                color: '#f43f5e',
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ↺ Revert
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.94 }}
                                                    disabled={isLoading}
                                                    onClick={() => handleIssueTute(student, termNum)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: 10,
                                                        border: 'none',
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                                        color: '#fff',
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                                        opacity: isLoading ? 0.6 : 1
                                                    }}
                                                >
                                                    {isLoading ? 'Issuing…' : 'Issue (Rs. 400)'}
                                                </motion.button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
