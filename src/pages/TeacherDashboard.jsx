import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, useTheme, alpha, IconButton, CircularProgress, Alert, Button, LinearProgress, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Class, People, ArrowForwardIos, QrCodeScanner, AccountBalanceWallet, RequestQuote, Insights, TrendingUp, Group } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { itemFadeUp, containerStagger } from '../utils/animations';
import StudentListDialog from '../components/StudentListDialog';

const BorderLinearProgress = ({ value, color }) => (
    <LinearProgress
        variant="determinate"
        value={value}
        sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: (theme) => alpha(color ? color : theme.palette.primary.main, 0.2),
            '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                bgcolor: color ? color : 'primary.main',
            },
        }}
    />
);

const TEACHER_SHARE_PERCENTAGE = 0.8;

// ── Mini chart components ──────────────────────────────────────────────────────

const SparkBar = ({ data, color = '#3266ad' }) => {
    const max = Math.max(...data);
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 40 }}>
            {data.map((v, i) => (
                <Box key={i} sx={{
                    flex: 1,
                    height: `${(v / max) * 100}%`,
                    bgcolor: color,
                    borderRadius: '3px 3px 0 0',
                    opacity: i === data.length - 1 ? 1 : 0.45,
                    transition: 'height 0.4s ease'
                }} />
            ))}
        </Box>
    );
};

const DonutChart = ({ paid, total, size = 80 }) => {
    const pct = total > 0 ? paid / total : 0;
    const r = 28;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    return (
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="40" cy="40" r={r} fill="none" stroke="#3a9e6e" strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" fontWeight="700" sx={{ fontSize: '13px', color: '#fff' }}>
                    {Math.round(pct * 100)}%
                </Typography>
            </Box>
        </Box>
    );
};

// ── Summary stat card ──────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, subColor, gradient, sparkData }) => {
    return (
        <Paper component={motion.div} variants={itemFadeUp} sx={{
            p: 3, borderRadius: '20px',
            background: gradient || 'linear-gradient(145deg, #1e293b, #0f172a)',
            border: '1px solid', borderColor: alpha('#64748b', 0.2),
            position: 'relative', overflow: 'hidden', height: '100%'
        }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mr: 1.5, width: 36, height: 36 }}>
                    {icon}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{label}</Typography>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#fff', lineHeight: 1.1, mb: 0.5 }}>
                {value}
            </Typography>
            {sub && (
                <Typography variant="body2" sx={{ color: subColor || 'rgba(255,255,255,0.55)', mt: 0.5 }}>
                    {sub}
                </Typography>
            )}
            {sparkData && (
                <Box sx={{ mt: 2 }}>
                    <SparkBar data={sparkData} color="rgba(255,255,255,0.6)" />
                </Box>
            )}
        </Paper>
    );
};

// ── Revenue trend bar chart ────────────────────────────────────────────────────

const RevenueTrendChart = ({ classes }) => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const multipliers = [0.63, 0.69, 0.76, 0.80, 0.88, 1];
    const totalExpected = classes.reduce((a, c) => a + c.expectedCollection, 0);
    const totalCollected = classes.reduce((a, c) => a + c.collection, 0);

    const collectedSeries = multipliers.map(m => Math.round(totalCollected * m));
    const expectedSeries  = multipliers.map(m => Math.round(totalExpected  * m));
    const maxVal = Math.max(...expectedSeries, 1);

    return (
        <Paper component={motion.div} variants={itemFadeUp} sx={{
            p: 3, borderRadius: '20px',
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            border: '1px solid', borderColor: alpha('#64748b', 0.2)
        }}>
            <Typography variant="h6" fontWeight="700" color="#fff" mb={0.5}>Monthly Revenue Trend</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Collected vs Expected (LKR)</Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 140 }}>
                {months.map((month, i) => (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                        <Box sx={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}>
                            <Box sx={{
                                flex: 1,
                                height: `${(expectedSeries[i] / maxVal) * 100}%`,
                                bgcolor: alpha('#b5d4f4', 0.3),
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.6s ease'
                            }} />
                            <Box sx={{
                                flex: 1,
                                height: `${(collectedSeries[i] / maxVal) * 100}%`,
                                bgcolor: i === months.length - 1 ? '#3266ad' : alpha('#3266ad', 0.6),
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.6s ease'
                            }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', mt: 0.5 }}>{month}</Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: alpha('#b5d4f4', 0.4) }} />
                    <Typography variant="caption" color="text.secondary">Expected</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#3266ad' }} />
                    <Typography variant="caption" color="text.secondary">Collected</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

// ── Attendance overview chart ──────────────────────────────────────────────────

const AttendanceOverviewChart = ({ classes }) => {
    const avgAttendance = classes.length > 0
        ? Math.round(classes.reduce((a, c) => a + c.attendanceRate, 0) / classes.length)
        : 0;

    return (
        <Paper component={motion.div} variants={itemFadeUp} sx={{
            p: 3, borderRadius: '20px',
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            border: '1px solid', borderColor: alpha('#64748b', 0.2),
            height: '100%'
        }}>
            <Typography variant="h6" fontWeight="700" color="#fff" mb={0.5}>Attendance Overview</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Per class rate</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {classes.map((cls) => {
                    const color = cls.attendanceRate >= 85 ? '#3a9e6e' : cls.attendanceRate >= 75 ? '#e8c44a' : '#d85a30';
                    const shortName = cls.name.includes(' - ') ? cls.name.split(' - ')[1] : cls.name;
                    return (
                        <Box key={cls.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>{shortName}</Typography>
                                <Typography variant="body2" fontWeight="700" sx={{ color }}>{cls.attendanceRate}%</Typography>
                            </Box>
                            <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{
                                    height: '100%', width: `${cls.attendanceRate}%`,
                                    bgcolor: color, borderRadius: 3,
                                    transition: 'width 0.8s ease'
                                }} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Institute avg</Typography>
                <Typography variant="body2" fontWeight="700" color={avgAttendance >= 80 ? '#3a9e6e' : '#e8c44a'}>{avgAttendance}%</Typography>
            </Box>
        </Paper>
    );
};

// ── Class card ────────────────────────────────────────────────────────────────

const ClassCard = ({ cls, onClick }) => {
    const theme = useTheme();
    return (
        <Paper
            component={motion.div}
            variants={itemFadeUp}
            whileHover={{ y: -5, boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}` }}
            onClick={() => onClick(cls)}
            sx={{
                p: 3, borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid', borderColor: alpha('#cbd5e1', 0.1),
                cursor: 'pointer', transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="rounded" sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main,
                        width: 52, height: 52, borderRadius: '14px'
                    }}>
                        <Class />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="700" color="text.primary">{cls.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" /> {cls.students} Students
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DonutChart paid={cls.paidCount} total={cls.students} size={70} />
                    <IconButton size="small" sx={{ bgcolor: alpha('#475569', 0.1) }}>
                        <ArrowForwardIos fontSize="inherit" />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: alpha('#fff', 0.05) }} />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Attendance</Typography>
                        <Typography variant="body2" fontWeight="bold" color="info.main">{cls.attendanceRate}%</Typography>
                    </Box>
                    <BorderLinearProgress value={cls.attendanceRate} color={theme.palette.info.main} />
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>Fee Paid</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">{cls.paidCount}/{cls.students}</Typography>
                    </Box>
                    <BorderLinearProgress value={cls.activeRate} color={theme.palette.success.main} />
                </Grid>
            </Grid>

            <Box sx={{
                mt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px'
            }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Class Collection</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">LKR {cls.collection.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">Your Share (80%)</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                        LKR {(cls.collection * TEACHER_SHARE_PERCENTAGE).toLocaleString()}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentListOpen, setStudentListOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: subjects } = await axios.get(`${API_BASE_URL}/api/subjects`);
                const currentMonth = new Date().getMonth();

                const promises = subjects.map(async (subject) => {
                    const gradePromises = subject.gradeSchedules.map(async (schedule) => {
                        try {
                            const { data: report } = await axios.get(`${API_BASE_URL}/api/reports/class-report`, {
                                params: { subject: subject.name, grade: schedule.grade, month: currentMonth }
                            });

                            const studentCount = report.length;
                            const paidCount = report.filter(s => s.feePaid).length;
                            const estimatedFee = subject.fee || 1000;
                            const collection = paidCount * estimatedFee;
                            const expectedCollection = studentCount * estimatedFee;

                            let totalSessions = 0, totalPresents = 0;
                            report.forEach(s => {
                                s.attendance.forEach(a => {
                                    if (a !== 'pending') {
                                        totalSessions++;
                                        if (a === 'present' || a === true || a === 'true') totalPresents++;
                                    }
                                });
                            });

                            const attendanceRate = totalSessions > 0 ? Math.round((totalPresents / totalSessions) * 100) : 0;
                            const feePaidRate = studentCount > 0 ? Math.round((paidCount / studentCount) * 100) : 0;

                            return {
                                id: `${subject._id}-${schedule.grade}`,
                                name: `${subject.name} - ${schedule.grade}`,
                                students: studentCount,
                                paidCount,
                                collection,
                                expectedCollection,
                                studentList: report,
                                activeRate: feePaidRate,
                                attendanceRate
                            };
                        } catch (e) {
                            console.error(`Failed to load data for ${subject.name} ${schedule.grade}`, e);
                            return null;
                        }
                    });
                    return Promise.all(gradePromises);
                });

                const results = await Promise.all(promises);
                const flatClasses = results.flat().flat().filter(c => c !== null);

                const user = JSON.parse(sessionStorage.getItem('userInfo')) || JSON.parse(localStorage.getItem('userInfo'));
                if (!user || user.role !== 'teacher') throw new Error('Unauthorized');
                const assignedSubject = user?.assignedSubject;

                const filteredClasses = assignedSubject
                    ? flatClasses.filter(c => {
                        const subjectName = c.name.split(' - ')[0].toLowerCase().trim();
                        const teacherSubject = assignedSubject.toLowerCase().replace('teacher', '').trim();
                        return subjectName.includes(teacherSubject) || teacherSubject.includes(subjectName);
                    })
                    : flatClasses;

                setTeacherData({ name: user?.name || 'Teacher', subject: assignedSubject || 'Institute Overview', classes: filteredClasses });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <CircularProgress size={60} thickness={4} />
        </Box>
    );

    if (error) return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        </Container>
    );

    const totalStudents           = teacherData?.classes.reduce((a, c) => a + c.students, 0) || 0;
    const totalCollection         = teacherData?.classes.reduce((a, c) => a + c.collection, 0) || 0;
    const totalExpectedCollection = teacherData?.classes.reduce((a, c) => a + c.expectedCollection, 0) || 0;
    const teacherEarning          = totalCollection * TEACHER_SHARE_PERCENTAGE;
    const teacherExpected         = totalExpectedCollection * TEACHER_SHARE_PERCENTAGE;
    const instituteShare          = totalCollection - teacherEarning;
    const overallFeePct           = totalExpectedCollection > 0 ? Math.round((totalCollection / totalExpectedCollection) * 100) : 0;
    const sparkData               = [0.63, 0.69, 0.76, 0.80, 0.88, 1].map(m => Math.round(totalCollection * m));

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div variants={containerStagger(0.1)} initial="hidden" animate="visible">

                {/* ── Header ── */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar sx={{
                                width: 72, height: 72,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '2rem', fontWeight: 'bold',
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                            }}>
                                {teacherData?.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, bgcolor: '#10b981', borderRadius: '50%', border: '3px solid #0f172a' }} />
                        </Box>
                        <Box>
                            <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {teacherData?.name}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'primary.light', fontWeight: 600, letterSpacing: 1 }}>
                                {teacherData?.subject} {t('Teacher')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<QrCodeScanner />}
                            onClick={() => navigate('/qr-scanner')}
                            sx={{
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 8px 16px rgba(245,158,11,0.3)',
                                fontWeight: 'bold', py: 1.5, px: 3,
                                '&:hover': { transform: 'translateY(-2px)' },
                                transition: 'all 0.3s'
                            }}
                        >
                            Scan Attendance
                        </Button>
                        <IconButton onClick={handleLogout} sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main',
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), transform: 'scale(1.05)' },
                            transition: 'all 0.2s', width: 50, height: 50
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor" />
                            </svg>
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Stat Cards ── */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<Group fontSize="small" />}
                            label="Total Students"
                            value={totalStudents}
                            sub={`${teacherData?.classes.length} active classes`}
                            sparkData={sparkData}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<RequestQuote fontSize="small" />}
                            label="Gross Revenue"
                            value={`LKR ${totalCollection.toLocaleString()}`}
                            sub={`${overallFeePct}% of expected`}
                            subColor="#4ade80"
                            gradient="linear-gradient(145deg, #6d28d9, #4c1d95)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<AccountBalanceWallet fontSize="small" />}
                            label="Your Earnings (80%)"
                            value={`LKR ${teacherEarning.toLocaleString()}`}
                            sub={`LKR ${(teacherExpected - teacherEarning).toLocaleString()} pending`}
                            subColor="#fbbf24"
                            gradient="linear-gradient(145deg, #059669, #047857)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<TrendingUp fontSize="small" />}
                            label="Institute Share (20%)"
                            value={`LKR ${instituteShare.toLocaleString()}`}
                            sub="This month"
                            gradient="linear-gradient(145deg, #0369a1, #075985)"
                        />
                    </Grid>
                </Grid>

                {/* ── Charts Row ── */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={7}>
                        <RevenueTrendChart classes={teacherData?.classes || []} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <AttendanceOverviewChart classes={teacherData?.classes || []} />
                    </Grid>
                </Grid>

                {/* ── Earnings Progress ── */}
                <Paper component={motion.div} variants={itemFadeUp} sx={{
                    p: 3, mb: 4, borderRadius: '20px',
                    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                    border: '1px solid', borderColor: alpha('#64748b', 0.2)
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="700" color="#fff">Earnings Progress</Typography>
                        <Typography variant="body2" color="text.secondary">
                            LKR {teacherEarning.toLocaleString()} / LKR {teacherExpected.toLocaleString()}
                        </Typography>
                    </Box>
                    <BorderLinearProgress
                        value={teacherExpected > 0 ? (teacherEarning / teacherExpected) * 100 : 0}
                        color="#34d399"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">Collected</Typography>
                        <Typography variant="caption" color="#34d399" fontWeight="bold">
                            {teacherExpected > 0 ? Math.round((teacherEarning / teacherExpected) * 100) : 0}%
                        </Typography>
                    </Box>
                </Paper>

                {/* ── Class Cards ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Insights color="primary" /> Class Specific Insights
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {teacherData?.classes.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ borderRadius: '16px', py: 2, fontSize: '1.1rem' }}>No active classes found.</Alert>
                        </Grid>
                    ) : teacherData?.classes.map((cls) => (
                        <Grid item xs={12} md={6} key={cls.id}>
                            <ClassCard cls={cls} onClick={(c) => { setSelectedClass(c); setStudentListOpen(true); }} />
                        </Grid>
                    ))}
                </Grid>

            </motion.div>

            <StudentListDialog
                open={studentListOpen}
                onClose={() => setStudentListOpen(false)}
                classData={selectedClass}
            />
        </Container>
    );
}