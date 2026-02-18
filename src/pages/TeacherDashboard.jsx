import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, useTheme, alpha, IconButton, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Class, People, MonetizationOn, ArrowForwardIos, QrCodeScanner } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { itemFadeUp, containerStagger, hoverScale } from '../utils/animations';
import StudentListDialog from '../components/StudentListDialog';

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
                // Fetch Subjects
                const { data: subjects } = await axios.get(`${API_BASE_URL}/api/subjects`);

                // Fetch Students to aggregate data
                // In a real large-scale app, we would use a dedicated stats endpoint.
                // For this prototype, we'll fetch a page of students or all if possible, 
                // but checking individual class reports is safer for accuracy.

                // Strategy: Iterate over subjects and build class list
                const classesData = [];
                let totalStudents = 0;
                let totalCollection = 0;
                const currentMonth = new Date().getMonth();

                // Flatten subjects into classes (Subject + Grade)
                // Since subjects have gradeSchedules, we can iterate those.

                const promises = subjects.map(async (subject) => {
                    const gradePromises = subject.gradeSchedules.map(async (schedule) => {
                        // Fetch Report for this Subject + Grade + Month
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

                            // Corrected Fee Calculation: Using 1000 LKR as base based on user feedback (was 2000)
                            // Ideally this should be in the database per subject.
                            const estimatedFee = subject.fee || 1000;
                            const collection = paidCount * estimatedFee;

                            totalStudents += studentCount;
                            totalCollection += collection;

                            return {
                                id: `${subject._id}-${schedule.grade}`,
                                name: `${subject.name} - ${schedule.grade}`,
                                students: studentCount,
                                collection: collection,
                                studentList: report, // Store full list for dialog
                                activeRate: studentCount > 0 ? Math.round((paidCount / studentCount) * 100) : 0
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

                // Filter by assigned subject if it exists
                const user = JSON.parse(sessionStorage.getItem('userInfo'));
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
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                variants={containerStagger(0.1)}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                            {teacherData?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="800">{teacherData?.name}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">{teacherData?.subject}</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleLogout} sx={{ bgcolor: 'rgba(255,0,0,0.1)', color: 'error.main', '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' } }}>
                        {/* Need to import Logout icon or use generic */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor" />
                        </svg>
                    </IconButton>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<QrCodeScanner />}
                        onClick={() => navigate('/qr-scanner')}
                        sx={{
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 4
                        }}
                    >
                        Scan Attendance
                    </Button>
                </Box>

                {/* Stats Overview */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            component={motion.div}
                            variants={itemFadeUp}
                            sx={{
                                p: 3,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{t('total_students_enrolled')}</Typography>
                            {/* Use calculated total if available, else sum classes */}
                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                {teacherData?.classes.reduce((acc, curr) => acc + curr.students, 0)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            component={motion.div}
                            variants={itemFadeUp}
                            sx={{
                                p: 3,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{t('monthly_collection')}</Typography>
                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                LKR {(teacherData?.classes.reduce((acc, curr) => acc + curr.collection, 0) / 1000).toFixed(1)}k
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Class List */}
                <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>{t('my_classes')}</Typography>
                <Grid container spacing={3}>
                    {teacherData?.classes.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info" variant="outlined">No active classes found.</Alert>
                        </Grid>
                    ) : teacherData?.classes.map((cls) => (
                        <Grid item xs={12} key={cls.id}>
                            <Paper
                                component={motion.div}
                                variants={itemFadeUp}
                                whileHover={hoverScale}
                                onClick={() => handleClassClick(cls)}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 56, height: 56 }}>
                                        <Class />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="700">{cls.name}</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <People fontSize="small" /> {cls.students} Students
                                            </Typography>
                                            <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                <MonetizationOn fontSize="small" /> {cls.collection.toLocaleString()} LKR Collected
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <IconButton>
                                    <ArrowForwardIos />
                                </IconButton>
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
