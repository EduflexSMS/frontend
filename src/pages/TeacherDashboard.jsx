import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Grid, Paper, Typography, Avatar, useTheme, alpha,
    IconButton, CircularProgress, Alert, Button, LinearProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, Select, MenuItem, Chip, Tabs, Tab
} from '@mui/material';
import {
    Class, ArrowForwardIos, QrCodeScanner, AccountBalanceWallet,
    RequestQuote, TrendingUp, Group, Logout,
    Assessment, CalendarMonth
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import StudentListDialog from '../components/StudentListDialog';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ── Deterministic Progress Bar ───────────────────────────────────────────────
const CleanLinearProgress = ({ value, color }) => (
    <LinearProgress
        variant="determinate"
        value={Math.min(Math.max(value || 0, 0), 100)}
        sx={{
            height: 7,
            borderRadius: 4,
            bgcolor: (theme) => alpha(color || theme.palette.primary.main, 0.15),
            '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: color || 'primary.main',
            },
        }}
    />
);

// ── SVG Donut Chart ─────────────────────────────────────────────────────────
const DonutChart = ({ paid = 0, pending = 0, free = 0, size = 160 }) => {
    const total = paid + pending + free;
    const paidPct = total > 0 ? (paid / total) : 0;
    const pendingPct = total > 0 ? (pending / total) : 0;
    const freePct = total > 0 ? (free / total) : 0;

    const r = 50;
    const circ = 2 * Math.PI * r;

    const paidDash = paidPct * circ;
    const pendingDash = pendingPct * circ;
    const freeDash = freePct * circ;

    const paidOffset = 0;
    const pendingOffset = -paidDash;
    const freeOffset = -(paidDash + pendingDash);

    return (
        <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
            <svg width={size} height={size} viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth="16" />
                {total > 0 && (
                    <>
                        {/* Paid Arc */}
                        <circle
                            cx="70" cy="70" r={r} fill="none" stroke="#10b981" strokeWidth="16"
                            strokeDasharray={`${paidDash} ${circ}`}
                            strokeDashoffset={paidOffset}
                            strokeLinecap="round"
                            transform="rotate(-90 70 70)"
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                        {/* Pending Arc */}
                        <circle
                            cx="70" cy="70" r={r} fill="none" stroke="#f59e0b" strokeWidth="16"
                            strokeDasharray={`${pendingDash} ${circ}`}
                            strokeDashoffset={pendingOffset}
                            transform="rotate(-90 70 70)"
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                        {/* Free Card Arc */}
                        <circle
                            cx="70" cy="70" r={r} fill="none" stroke="#6366f1" strokeWidth="16"
                            strokeDasharray={`${freeDash} ${circ}`}
                            strokeDashoffset={freeOffset}
                            transform="rotate(-90 70 70)"
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                    </>
                )}
            </svg>
            <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <Typography variant="h5" fontWeight="800" sx={{ lineHeight: 1 }}>
                    {total > 0 ? Math.round(paidPct * 100) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', mt: 0.5 }}>
                    Collected
                </Typography>
            </Box>
        </Box>
    );
};

// ── SVG Revenue Comparison Chart ────────────────────────────────────────────
const RevenueTrendChart = ({ data = [] }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.collected || 0, d.expected || 0)), 1);

    return (
        <Box sx={{ width: '100%', pt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160, pb: 1 }}>
                {data.map((item, idx) => {
                    const collectedH = Math.min(Math.round((item.collected / maxVal) * 100), 100);
                    const expectedH = Math.min(Math.round((item.expected / maxVal) * 100), 100);

                    return (
                        <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '100%' }}>
                                {/* Expected Bar */}
                                <Box sx={{
                                    flex: 1,
                                    height: `${expectedH}%`,
                                    bgcolor: 'rgba(99, 102, 241, 0.25)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.4s ease'
                                }} title={`Expected: LKR ${item.expected?.toLocaleString()}`} />
                                {/* Collected Bar */}
                                <Box sx={{
                                    flex: 1,
                                    height: `${collectedH}%`,
                                    bgcolor: idx === data.length - 1 ? '#3b82f6' : 'rgba(59, 130, 246, 0.75)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.4s ease'
                                }} title={`Collected: LKR ${item.collected?.toLocaleString()}`} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', mt: 1, fontWeight: 500 }}>
                                {item.month}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: 'rgba(99, 102, 241, 0.4)' }} />
                    <Typography variant="caption" color="text.secondary">Expected Target</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#3b82f6' }} />
                    <Typography variant="caption" color="text.secondary">Actual Collected</Typography>
                </Box>
            </Box>
        </Box>
    );
};

// ── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, badgeText, badgeColor = 'success', icon, accentColor = '#3b82f6' }) => {
    const theme = useTheme();
    return (
        <Paper sx={{
            p: 2.5, borderRadius: '16px',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative', overflow: 'hidden', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ mt: 0.5, color: 'text.primary', lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{
                    bgcolor: alpha(accentColor, 0.12),
                    color: accentColor,
                    width: 44, height: 44, borderRadius: '12px'
                }}>
                    {icon}
                </Avatar>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                {sub && (
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {sub}
                    </Typography>
                )}
                {badgeText && (
                    <Chip
                        label={badgeText}
                        size="small"
                        color={badgeColor}
                        sx={{ fontWeight: 600, fontSize: '11px', height: 22, borderRadius: '6px' }}
                    />
                )}
            </Box>
        </Paper>
    );
};

// ── MAIN TEACHER DASHBOARD ──────────────────────────────────────────────────
export default function TeacherDashboard() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [portalData, setPortalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // Modal state for student list
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentListOpen, setStudentListOpen] = useState(false);

    const fetchPortal = useCallback(async (monthIdx) => {
        try {
            setLoading(true);
            setError('');

            const user = JSON.parse(sessionStorage.getItem('userInfo')) || JSON.parse(localStorage.getItem('userInfo'));
            if (!user || user.role !== 'teacher') {
                window.location.href = '/login';
                return;
            }

            const teacherName = user.name || user.username || '';
            const assignedSubject = user.assignedSubject || '';

            const response = await axios.get(`${API_BASE_URL}/api/auth/teacher-portal`, {
                params: {
                    teacherName,
                    subject: assignedSubject,
                    month: monthIdx
                }
            });

            setPortalData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching teacher portal:', err);
            setError(err.response?.data?.message || 'Failed to load teacher portal data.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortal(selectedMonth);
    }, [selectedMonth, fetchPortal]);

    const handleLogout = () => {
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    const handleOpenClassList = (cls) => {
        setSelectedClass(cls);
        setStudentListOpen(true);
    };

    if (loading && !portalData) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', gap: 2 }}>
                <CircularProgress size={54} thickness={4} sx={{ color: '#3b82f6' }} />
                <Typography variant="body2" color="text.secondary">Loading Teacher Workspace...</Typography>
            </Box>
        );
    }

    const summary = portalData?.summary || {};
    const teacher = portalData?.teacher || {};
    const classes = portalData?.classes || [];
    const monthlyTrend = portalData?.monthlyTrend || [];
    const exams = portalData?.exams || [];

    const collectionPct = summary.expectedRevenue > 0
        ? Math.round((summary.grossRevenue / summary.expectedRevenue) * 100)
        : 0;

    return (
        <Container maxWidth="xl" sx={{ py: 3, pb: 8 }}>
            {/* ── Top Header ── */}
            <Paper sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                mb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    {/* Left: Profile & Subject */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={teacher.image || undefined}
                            sx={{
                                width: 62, height: 62,
                                bgcolor: '#3b82f6',
                                fontSize: '1.6rem', fontWeight: 'bold',
                                border: '3px solid rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            {teacher.name?.charAt(0) || 'T'}
                        </Avatar>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <Typography variant="h5" fontWeight="800" color="text.primary">
                                    {teacher.name}
                                </Typography>
                                <Chip
                                    label={`${teacher.subject} Teacher`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700, borderRadius: '8px' }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {teacher.description || 'EduFlex Faculty Portal'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right: Month Selector & Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                }}
                                startAdornment={<CalendarMonth sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />}
                            >
                                {MONTH_NAMES.map((m, idx) => (
                                    <MenuItem key={idx} value={idx}>
                                        {m}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={<QrCodeScanner />}
                            onClick={() => navigate('/qr-scanner')}
                            sx={{
                                borderRadius: '12px',
                                bgcolor: '#f59e0b',
                                color: '#fff',
                                fontWeight: 700,
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#d97706' }
                            }}
                        >
                            Scan Attendance
                        </Button>

                        <IconButton
                            onClick={handleLogout}
                            title="Logout"
                            sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '12px',
                                width: 42, height: 42,
                                color: 'error.main',
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                            }}
                        >
                            <Logout fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
                    {error}
                </Alert>
            )}

            {/* ── Metric Grid ── */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        label="Total Students"
                        value={summary.totalStudents || 0}
                        sub={`Across ${classes.length} active classes`}
                        badgeText={`${classes.length} Grades`}
                        badgeColor="info"
                        icon={<Group />}
                        accentColor="#3b82f6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        label="Gross Collection"
                        value={`LKR ${(summary.grossRevenue || 0).toLocaleString()}`}
                        sub={`Expected: LKR ${(summary.expectedRevenue || 0).toLocaleString()}`}
                        badgeText={`${collectionPct}% Collected`}
                        badgeColor={collectionPct >= 80 ? 'success' : 'warning'}
                        icon={<RequestQuote />}
                        accentColor="#10b981"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        label="Your Share (80%)"
                        value={`LKR ${(summary.teacherEarnings || 0).toLocaleString()}`}
                        sub={`Pending: LKR ${(summary.teacherExpected - summary.teacherEarnings || 0).toLocaleString()}`}
                        badgeText="80% Share"
                        badgeColor="primary"
                        icon={<AccountBalanceWallet />}
                        accentColor="#8b5cf6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        label="Avg Attendance"
                        value={`${summary.avgAttendanceRate || 0}%`}
                        sub={`Institute avg for ${MONTH_NAMES[selectedMonth]}`}
                        badgeText={summary.avgAttendanceRate >= 80 ? 'Good' : 'Needs Followup'}
                        badgeColor={summary.avgAttendanceRate >= 80 ? 'success' : 'warning'}
                        icon={<TrendingUp />}
                        accentColor="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* ── Charts Row ── */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Monthly Revenue Trend */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{
                        p: 3, borderRadius: '20px',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                    Revenue Target vs. Collected
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Last 6 months trend for {teacher.subject}
                                </Typography>
                            </Box>
                            <Chip label="LKR" size="small" sx={{ borderRadius: '6px', fontWeight: 600 }} />
                        </Box>

                        <RevenueTrendChart data={monthlyTrend} />
                    </Paper>
                </Grid>

                {/* Fee Status Donut */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{
                        p: 3, borderRadius: '20px',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                Fee Collection Status
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Status breakdown for {MONTH_NAMES[selectedMonth]}
                            </Typography>
                        </Box>

                        <DonutChart
                            paid={summary.totalPaid || 0}
                            pending={summary.totalPending || 0}
                            free={summary.totalFree || 0}
                            size={170}
                        />

                        {/* Legend */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} /> Paid
                                </Typography>
                                <Typography variant="body1" fontWeight="700" color="text.primary">
                                    {summary.totalPaid || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} /> Pending
                                </Typography>
                                <Typography variant="body1" fontWeight="700" color="text.primary">
                                    {summary.totalPending || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }} /> Free Card
                                </Typography>
                                <Typography variant="body1" fontWeight="700" color="text.primary">
                                    {summary.totalFree || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Navigation Tabs ── */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '15px',
                            minHeight: 48
                        }
                    }}
                >
                    <Tab icon={<Class sx={{ fontSize: 18 }} />} iconPosition="start" label="Class Breakdown & Students" />
                    <Tab icon={<Assessment sx={{ fontSize: 18 }} />} iconPosition="start" label={`Exams & Marks (${exams.length})`} />
                </Tabs>
            </Box>

            {/* ── TAB 0: CLASS BREAKDOWN & CARDS ── */}
            {activeTab === 0 && (
                <>
                    {/* Class Table */}
                    <Paper sx={{
                        borderRadius: '20px',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden',
                        mb: 4
                    }}>
                        <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="800">
                                Class Performance Table
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Click any row to view students roster
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Class / Grade</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Students</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Attendance</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Fee Paid</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Collection</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Your Share (80%)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {classes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                No active classes found for this subject.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        classes.map((cls) => {
                                            const attColor = cls.attendanceRate >= 85 ? '#10b981' : cls.attendanceRate >= 75 ? '#f59e0b' : '#ef4444';
                                            const feePillBg = cls.feePaidRate >= 85 ? alpha('#10b981', 0.15) : cls.feePaidRate >= 65 ? alpha('#f59e0b', 0.15) : alpha('#ef4444', 0.15);
                                            const feePillColor = cls.feePaidRate >= 85 ? '#10b981' : cls.feePaidRate >= 65 ? '#f59e0b' : '#ef4444';

                                            return (
                                                <TableRow
                                                    key={cls.id}
                                                    hover
                                                    onClick={() => handleOpenClassList(cls)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.15s',
                                                        '&:last-child td, &:last-child th': { border: 0 }
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha('#3b82f6', 0.12), color: '#3b82f6', fontSize: '13px' }}>
                                                                <Class sx={{ fontSize: 18 }} />
                                                            </Avatar>
                                                            {cls.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {cls.students}
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: 140 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="caption" fontWeight="700" sx={{ color: attColor }}>
                                                                {cls.attendanceRate}%
                                                            </Typography>
                                                        </Box>
                                                        <CleanLinearProgress value={cls.attendanceRate} color={attColor} />
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: 130 }}>
                                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.3, borderRadius: '12px', bgcolor: feePillBg, color: feePillColor, fontWeight: 700, fontSize: '12px' }}>
                                                            {cls.paidCount}/{cls.students}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        LKR {cls.collection.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>
                                                        LKR {cls.teacherShare.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            endIcon={<ArrowForwardIos sx={{ fontSize: '10px !important' }} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenClassList(cls);
                                                            }}
                                                            sx={{
                                                                borderRadius: '8px',
                                                                textTransform: 'none',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                py: 0.4
                                                            }}
                                                        >
                                                            Roster
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Class Cards Grid */}
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>
                        Class Cards
                    </Typography>
                    <Grid container spacing={2.5}>
                        {classes.map((cls) => (
                            <Grid item xs={12} sm={6} md={4} key={cls.id}>
                                <Paper sx={{
                                    p: 2.5, borderRadius: '18px',
                                    bgcolor: 'background.paper',
                                    border: `1px solid ${theme.palette.divider}`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }
                                }}
                                onClick={() => handleOpenClassList(cls)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', width: 42, height: 42, borderRadius: '10px' }}>
                                                <Class />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                                    {cls.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {cls.students} Enrolled Students
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small">
                                            <ArrowForwardIos sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Monthly Attendance</Typography>
                                            <Typography variant="caption" fontWeight="700" color="#10b981">{cls.attendanceRate}%</Typography>
                                        </Box>
                                        <CleanLinearProgress value={cls.attendanceRate} color="#10b981" />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Fee Collection</Typography>
                                            <Typography variant="caption" fontWeight="700" color="#3b82f6">{cls.paidCount}/{cls.students}</Typography>
                                        </Box>
                                        <CleanLinearProgress value={cls.feePaidRate} color="#3b82f6" />
                                    </Box>

                                    <Box sx={{
                                        p: 1.5, borderRadius: '10px',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Class Revenue</Typography>
                                            <Typography variant="subtitle2" fontWeight="700">
                                                LKR {cls.collection.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary">Your Share</Typography>
                                            <Typography variant="subtitle2" fontWeight="700" color="#10b981">
                                                LKR {cls.teacherShare.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* ── TAB 1: EXAMS & RESULTS ── */}
            {activeTab === 1 && (
                <Paper sx={{
                    borderRadius: '20px',
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="800">
                                Exams for {teacher.subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Student performance, marks, and grading breakdown
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate('/exams')}
                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                        >
                            Open Exams Center
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 600 }}>
                            <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Exam Title</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Participants</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Class Average</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'text.secondary' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No exams scheduled or conducted yet for {teacher.subject}.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map((ex) => (
                                        <TableRow key={ex.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {ex.title}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={ex.grade} size="small" sx={{ borderRadius: '6px', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell color="text.secondary">
                                                {ex.date ? new Date(ex.date).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {ex.studentCount} Students
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="700" sx={{
                                                    color: ex.averageMarks >= 75 ? '#10b981' : ex.averageMarks >= 50 ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {ex.averageMarks}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => navigate('/exams')}
                                                    sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '12px', fontWeight: 600 }}
                                                >
                                                    Enter Marks
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* ── Student List Dialog Roster Modal ── */}
            <StudentListDialog
                open={studentListOpen}
                onClose={() => setStudentListOpen(false)}
                classData={selectedClass}
            />
        </Container>
    );
}