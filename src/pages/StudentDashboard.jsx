import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, LinearProgress, Chip, Avatar, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Pending, School, EventAvailable, MonetizationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { itemFadeUp, containerStagger, hoverScale } from '../utils/animations';

// Mock Data - Replace with API call
const mockStudentData = {
    name: "Keshara Rathnayaka",
    id: "STU-2026-001",
    grade: "Grade 12",
    attendance: {
        total: 45,
        attended: 38,
        percentage: 84
    },
    subjects: [
        { name: "Combined Mathematics", teacher: "Mr. Perera", feesStart: "Jan", feesPaid: true, attendance: 90 },
        { name: "Physics", teacher: "Mrs. Silva", feesStart: "Jan", feesPaid: false, attendance: 75 },
        { name: "Chemistry", teacher: "Mr. Fernando", feesStart: "Jan", feesPaid: true, attendance: 88 }
    ]
};

export default function StudentDashboard() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [student, setStudent] = useState(mockStudentData);

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
