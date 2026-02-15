import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, LinearProgress, Chip, Avatar, useTheme, alpha, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Pending, School, EventAvailable, MonetizationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config';
import { itemFadeUp, containerStagger, hoverScale } from '../utils/animations';

export default function StudentDashboard() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.id) {
                    throw new Error("Student ID not found. Please login again.");
                }

                const response = await axios.get(`${API_BASE_URL}/api/students?search=${userInfo.id}`);
                const students = response.data.students;

                if (!students || students.length === 0) {
                    throw new Error("Student profile not found.");
                }

                // Match exact ID to avoid partial matches
                const currentStudent = students.find(s => s.indexNumber === userInfo.id) || students[0];
                setStudent(processStudentData(currentStudent));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load dashboard data");
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    const processStudentData = (data) => {
        const currentMonth = new Date().getMonth();

        // Calculate Statistics
        let totalClasses = 0;
        let attendedClasses = 0;

        const subjects = data.enrollments.map(enrollment => {
            // Get current month record
            const monthRecord = enrollment.monthlyRecords.find(r => r.monthIndex === currentMonth);

            // Calculate Subject Attendance (Assuming 5 weeks max per month for now or calculating all time)
            // For simplicity, let's show this month's attendance or overall if desired. 
            // The mock showed overall, let's try to aggregate all months for accuracy if possible, 
            // or just use the current month for "Active Status"

            // Aggregating all months for attendance rate
            let subTotal = 0;
            let subAttended = 0;

            enrollment.monthlyRecords.forEach(rec => {
                rec.attendance.forEach(status => {
                    if (status !== 'pending') subTotal++;
                    if (status === 'present' || status === true || status === 'true') subAttended++;
                });
            });

            totalClasses += subTotal;
            attendedClasses += subAttended;

            return {
                name: enrollment.subject,
                teacher: "Eduflex Institute", // Backend doesn't store teacher yet
                feesPaid: monthRecord ? monthRecord.feePaid : false,
                attendance: subTotal === 0 ? 0 : Math.round((subAttended / subTotal) * 100)
            };
        });

        return {
            name: data.name,
            id: data.indexNumber,
            grade: data.grade,
            attendance: {
                total: totalClasses,
                attended: attendedClasses,
                percentage: totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100)
            },
            subjects: subjects
        };
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
                {/* Profile Header */}
                <Paper
                    component={motion.div}
                    variants={itemFadeUp}
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                    }} />

                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', fontSize: '2rem', fontWeight: 'bold' }}>
                        {student.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="800">{student.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, opacity: 0.9 }}>
                            <Chip label={student.id} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                            <Chip label={student.grade} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        </Box>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Attendance Stats */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            component={motion.div}
                            variants={itemFadeUp}
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: '24px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: alpha(theme.palette.background.paper, 0.8)
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <EventAvailable color="primary" />
                                <Typography variant="h6" fontWeight="700">{t('my_attendance')}</Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h2" fontWeight="800" color="primary.main">
                                    {student.attendance.percentage}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('attendance_rate')}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption">{t('attended')}: <b>{student.attendance.attended}</b></Typography>
                                    <Typography variant="caption">{t('total_classes')}: <b>{student.attendance.total}</b></Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={student.attendance.percentage}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Fees & Subjects List */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {student.subjects.map((subject, index) => (
                                <Paper
                                    key={subject.name}
                                    component={motion.div}
                                    variants={itemFadeUp}
                                    whileHover={hoverScale}
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                                            <School />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="700">{subject.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {subject.teacher} • Attendance: {subject.attendance}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" display="block" color="text.secondary">{t('payment_status')}</Typography>
                                            <Chip
                                                icon={subject.feesPaid ? <CheckCircle /> : <Pending />}
                                                label={subject.feesPaid ? t('paid') : t('pending')}
                                                color={subject.feesPaid ? "success" : "warning"}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </motion.div>
        </Container>
    );
}
