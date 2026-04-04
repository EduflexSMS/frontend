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

// Helper for Progress Bars
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
                                params: {
                                    subject: subject.name,
                                    grade: schedule.grade,
                                    month: currentMonth
                                }
                            });

                            const studentCount = report.length;
                            const paidCount = report.filter(s => s.feePaid).length;

                            const estimatedFee = subject.fee || 1000;
                            const collection = paidCount * estimatedFee;
                            const expectedCollection = studentCount * estimatedFee;

                            // Calculate Attendance Rate
                            let totalSessions = 0;
                            let totalPresents = 0;
                            report.forEach(s => {
                                s.attendance.forEach(a => {
                                    if (a !== 'pending') {
                                        totalSessions++;
                                        if (a === 'present' || a === true || a === 'true') {
                                            totalPresents++;
                                        }
                                    }
                                });
                            });
                            const attendanceRate = totalSessions > 0 ? Math.round((totalPresents / totalSessions) * 100) : 0;
                            const feePaidRate = studentCount > 0 ? Math.round((paidCount / studentCount) * 100) : 0;

                            return {
                                id: `${subject._id}-${schedule.grade}`,
                                name: `${subject.name} - ${schedule.grade}`,
                                students: studentCount,
                                paidCount: paidCount,
                                collection: collection,
                                expectedCollection: expectedCollection,
                                studentList: report,
                                activeRate: feePaidRate,
                                attendanceRate: attendanceRate
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
                if (!user || user.role !== 'teacher') throw new Error("Unauthorized");
                const assignedSubject = user?.assignedSubject;

                const filteredClasses = assignedSubject
                    ? flatClasses.filter(c => c.name.includes(assignedSubject))
                    : flatClasses;

                setTeacherData({
                    name: user?.name || "Teacher",
                    subject: assignedSubject || "Institute Overview",
                    classes: filteredClasses
                });

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
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

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setStudentListOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            </Container>
        );
    }

    // Totals Calculations
    const totalStudents = teacherData?.classes.reduce((acc, curr) => acc + curr.students, 0) || 0;
    const totalCollection = teacherData?.classes.reduce((acc, curr) => acc + curr.collection, 0) || 0;
    const totalExpectedCollection = teacherData?.classes.reduce((acc, curr) => acc + curr.expectedCollection, 0) || 0;
    
    // Financial Split (Assuming standard 80% teacher, 20% institute setup)
    const TEACHER_SHARE_PERCENTAGE = 0.8;
    const teacherEarning = totalCollection * TEACHER_SHARE_PERCENTAGE;
    const teacherExpected = totalExpectedCollection * TEACHER_SHARE_PERCENTAGE;
    const instituteShare = totalCollection - teacherEarning;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div variants={containerStagger(0.1)} initial="hidden" animate="visible">
                
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar sx={{ width: 72, height: 72, bgcolor: theme.palette.primary.main, fontSize: '2rem', fontWeight: 'bold', boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}` }}>
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
                                boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                                fontWeight: 'bold',
                                py: 1.5,
                                px: 3,
                                '&:hover': { transform: 'translateY(-2px)' },
                                transition: 'all 0.3s'
                            }}
                        >
                            Scan Attendance
                        </Button>
                        <IconButton onClick={handleLogout} sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), transform: 'scale(1.05)' }, transition: 'all 0.2s', width: 50, height: 50 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor" />
                            </svg>
                        </IconButton>
                    </Box>
                </Box>

                {/* Main Stats Overview row */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    
                    {/* Performance & Capacity Card */}
                    <Grid item xs={12} md={4}>
                        <Paper component={motion.div} variants={itemFadeUp} sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid', borderColor: alpha('#64748b', 0.2), height: '100%', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)' }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: alpha('#38bdf8', 0.15), color: '#38bdf8', mr: 2 }}>
                                    <Group />
                                </Avatar>
                                <Typography variant="h6" color="text.secondary" fontWeight={600}>Total Enrollments</Typography>
                            </Box>
                            
                            <Typography variant="h2" fontWeight="800" sx={{ color: '#fff', mb: 1 }}>
                                {totalStudents} <Typography component="span" variant="h6" color="text.secondary">Students</Typography>
                            </Typography>
                            
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Active Classes</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="#38bdf8">{teacherData?.classes.length}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#fff', 0.1) }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Fee Collection</Typography>
                                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}><TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> Tracking Well</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Institute Overview Card */}
                    <Grid item xs={12} md={4}>
                        <Paper component={motion.div} variants={itemFadeUp} sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(145deg, #6d28d9 0%, #4c1d95 100%)', color: 'white', position: 'relative', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ position: 'absolute', bottom: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 70%)' }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mr: 2 }}>
                                    <RequestQuote />
                                </Avatar>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>Gross Class Revenue</Typography>
                            </Box>

                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                <Typography component="span" variant="h5" sx={{ verticalAlign: 'top', opacity: 0.8, mr: 0.5 }}>LKR</Typography>
                                {totalCollection.toLocaleString()}
                            </Typography>
                            
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>Institute Share (20%)</Typography>
                                    <Typography variant="body1" fontWeight="bold">LKR {instituteShare.toLocaleString()}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Personal Earnings Card (80%) */}
                    <Grid item xs={12} md={4}>
                        <Paper component={motion.div} variants={itemFadeUp} sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(145deg, #059669 0%, #047857 100%)', color: 'white', position: 'relative', overflow: 'hidden', height: '100%' }}>
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mr: 2 }}>
                                    <AccountBalanceWallet />
                                </Avatar>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>Your Earnings (80%)</Typography>
                            </Box>

                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                <Typography component="span" variant="h5" sx={{ verticalAlign: 'top', opacity: 0.8, mr: 0.5 }}>LKR</Typography>
                                {teacherEarning.toLocaleString()}
                            </Typography>
                            
                            <Box sx={{ mt: 3, p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Expected Potential Earnings</Typography>
                                    <Typography variant="body2" fontWeight="bold">LKR {teacherExpected.toLocaleString()}</Typography>
                                </Box>
                                <BorderLinearProgress value={teacherExpected > 0 ? (teacherEarning / teacherExpected) * 100 : 0} color="#34d399" />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Detailed Class Breakdown */}
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
                            <Paper
                                component={motion.div}
                                variants={itemFadeUp}
                                whileHover={{ y: -5, boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}` }}
                                onClick={() => handleClassClick(cls)}
                                sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: alpha('#cbd5e1', 0.1),
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main, width: 56, height: 56, borderRadius: '16px' }}>
                                            <Class />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="700" color="text.primary">{cls.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <People fontSize="small" /> {cls.students} Total Students
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" sx={{ bgcolor: alpha('#475569', 0.1) }}>
                                        <ArrowForwardIos fontSize="inherit" />
                                    </IconButton>
                                </Box>

                                <Divider sx={{ my: 2, borderColor: alpha('#fff', 0.05) }} />

                                {/* Class Progress Grid */}
                                <Grid container spacing={3}>
                                    {/* Attendance Node */}
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Avg Attendance</Typography>
                                            <Typography variant="body2" fontWeight="bold" color="info.main">{cls.attendanceRate}%</Typography>
                                        </Box>
                                        <BorderLinearProgress value={cls.attendanceRate} color={theme.palette.info.main} />
                                    </Grid>
                                    
                                    {/* Financial Node */}
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Fee Paid</Typography>
                                            <Typography variant="body2" fontWeight="bold" color="success.main">{cls.paidCount}/{cls.students}</Typography>
                                        </Box>
                                        <BorderLinearProgress value={cls.activeRate} color={theme.palette.success.main} />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Total Class Collection</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">LKR {cls.collection.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Your Earnings (80%)</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">LKR {(cls.collection * TEACHER_SHARE_PERCENTAGE).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
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
