import React, { useEffect, useState } from 'react';
import { Box, Grid, CardContent, Typography, CircularProgress, Paper, LinearProgress, Button, Container, alpha, useTheme } from '@mui/material';
import { MenuBook, Assessment, TrendingUp, PeopleOutline, SupervisedUserCircle, VerifiedUser } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import CreateTeacherDialog from '../components/CreateTeacherDialog';
import TeacherListDialog from '../components/TeacherListDialog';
import { motion } from 'framer-motion';
import { containerStagger, itemFadeUp, hoverScale, tapScale, springFast } from '../utils/animations';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    // State for dialogs
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
    const [teacherListOpen, setTeacherListOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const { t } = useTranslation();

    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setDetailsOpen(true);
    };

    const handleFixData = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/api/payments/fix-fees`);
            alert(response.data.message || "Data fixed successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error fixing data:", error);
            alert("Failed to fix data");
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats(error.message || "Unknown Error");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
            </Box>
        );
    }

    if (!stats || typeof stats === 'string') {
        return (
            <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <Typography color="error" variant="h5" sx={{ fontWeight: 600 }}>Error loading stats</Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    {typeof stats === 'string' ? stats : "Please check your network connection or server logs."}
                </Typography>
            </Box>
        );
    }

    const StatCard = ({ title, value, icon, onClick, accentColor }) => (
        <Paper
            component={motion.div}
            whileHover={{
                scale: 1.02,
                translateY: -4,
                boxShadow: `0 20px 40px -5px ${alpha(accentColor || theme.palette.primary.main, 0.2)}`,
                border: `1px solid ${accentColor || theme.palette.primary.main}`
            }}
            whileTap={onClick ? tapScale : undefined}
            onClick={onClick}
            sx={{
                height: 180,
                width: '100%',
                borderRadius: '16px', // Sharper corners
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(12px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            elevation={0}
        >
            {/* Tech Accent Bar on Left */}
            <Box sx={{
                position: 'absolute',
                left: 0, top: '15%', bottom: '15%',
                width: '4px',
                borderRadius: '0 4px 4px 0',
                background: accentColor || theme.palette.primary.main,
                boxShadow: `0 0 10px ${accentColor || theme.palette.primary.main}`
            }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, pl: 2 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: alpha(accentColor || theme.palette.primary.main, 0.1),
                    color: accentColor || theme.palette.primary.main,
                    border: '1px solid',
                    borderColor: alpha(accentColor || theme.palette.primary.main, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { fontSize: 'medium' })}
                </Box>
                {/* Tech Background Icon */}
                <Box sx={{
                    position: 'absolute',
                    right: -20,
                    bottom: -30,
                    opacity: 0.03, // Very subtle
                    color: 'text.primary',
                    transform: 'rotate(-10deg) scale(1.5)'
                }}>
                    {React.cloneElement(icon, { sx: { fontSize: 120 } })}
                </Box>
            </Box>

            <Box sx={{ pl: 2 }}>
                <Typography variant="h3" sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    letterSpacing: '-0.02em',
                    mb: 0.5,
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    {value}
                </Typography>
                <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    opacity: 0.8
                }}>
                    {title}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ pb: 8 }}>
            <motion.div
                variants={containerStagger(0.08)}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <Box sx={{
                    mb: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: 3
                }}>
                    <Box>
                        <Typography variant="h3" fontWeight="800" sx={{
                            color: 'text.primary',
                            letterSpacing: '-0.03em',
                            mb: 1
                        }}>
                            {t('dashboard_overview')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" fontWeight="500">
                            {t('dashboard_subtitle')}
                        </Typography>
                    </Box>
                    <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={tapScale}
                        transition={springFast}
                        variant="contained"
                        startIcon={<Assessment />}
                        onClick={() => setReportOpen(true)}
                        sx={{
                            borderRadius: '16px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 700,
                            padding: '12px 32px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                boxShadow: '0 12px 24px -4px rgba(245, 158, 11, 0.5)',
                            }
                        }}
                    >
                        {t('generate_report')}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleFixData}
                        sx={{ ml: 2, borderRadius: '16px', fontWeight: 700 }}
                    >
                        Fix Data
                    </Button>
                </Box>

                {/* Main Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 8 }}>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title={t('total_students')}
                            value={stats.totalStudents}
                            icon={<PeopleOutline />}
                            accentColor="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title={t('total_subjects')}
                            value={stats.totalSubjects}
                            icon={<MenuBook />}
                            accentColor="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title="Create Teacher Account"
                            value="+"
                            icon={<SupervisedUserCircle />}
                            accentColor="#8b5cf6"
                            onClick={() => setCreateTeacherOpen(true)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title="Teachers Profile"
                            value={stats.teacherCount || "-"}
                            icon={<PeopleOutline />}
                            accentColor="#f43f5e"
                            onClick={() => setTeacherListOpen(true)}
                        />
                    </Grid>
                </Grid>

                {/* Analytics Section */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '12px' }}>
                        <TrendingUp sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="text.primary">
                        {t('performance_analytics')}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {(stats.subjectStats || []).map((sub) => (
                        <Grid item xs={12} md={6} lg={4} key={sub.subject} component={motion.div} variants={itemFadeUp}>
                            <Paper
                                component={motion.div}
                                whileHover={hoverScale}
                                onClick={() => handleSubjectClick(sub.subject)}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    borderRadius: 5,
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    background: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 10px 30px -10px rgba(0,0,0,0.3)'
                                        : '0 10px 30px -10px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 25px 50px -12px rgba(0,0,0,0.5)'
                                            : '0 25px 50px -12px rgba(59, 130, 246, 0.15)',
                                        borderColor: theme.palette.primary.main,
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5, color: 'text.primary' }}>
                                            {sub.subject}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                                            {t('class_performance')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        px: 2, py: 0.8,
                                        bgcolor: alpha(sub.studentCount > 0 && (sub.paidFees / sub.studentCount) > 0.8 ? '#10b981' : '#f59e0b', 0.1),
                                        color: sub.studentCount > 0 && (sub.paidFees / sub.studentCount) > 0.8 ? '#059669' : '#d97706',
                                        borderRadius: '30px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                                        {t('active')}
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" fontWeight="600" color="text.secondary">{t('fee_collection')}</Typography>
                                        <Typography variant="body2" fontWeight="700" color="primary.main">
                                            {Math.round((sub.paidFees / (sub.studentCount || 1)) * 100)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0}
                                        sx={{
                                            height: 12,
                                            borderRadius: 6,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 6,
                                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    pt: 3,
                                    borderTop: '1px solid',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                }}>
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>{t('students')}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PeopleOutline sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.6 }} />
                                            <Typography variant="h6" fontWeight="800" color="text.primary">{sub.studentCount}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>{t('paid')}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                            <Typography variant="h6" fontWeight="800" color="#10b981">{sub.paidFees}</Typography>
                                            <VerifiedUser sx={{ fontSize: 20, color: '#10b981', opacity: 0.8 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </motion.div>
            <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} />
            <SubjectDetailsDialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                subjectName={selectedSubject}
            />
            <CreateTeacherDialog
                open={createTeacherOpen}
                onClose={() => setCreateTeacherOpen(false)}
            />
            <TeacherListDialog
                open={teacherListOpen}
                onClose={() => setTeacherListOpen(false)}
            />
        </Container>
    );
}
