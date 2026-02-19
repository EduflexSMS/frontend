import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Paper, LinearProgress, Button, Container, alpha, useTheme, IconButton, Tooltip } from '@mui/material';
import { MenuBook, Assessment, PeopleOutline, SupervisedUserCircle, VerifiedUser, Refresh, AutoFixHigh, QrCodeScanner } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import CreateTeacherDialog from '../components/CreateTeacherDialog';
import TeacherListDialog from '../components/TeacherListDialog';
import { motion, useSpring, useTransform } from 'framer-motion';
import { containerStagger, itemFadeUp, hoverScale, tapScale, springFast } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import AnalyticsChart from '../components/AnalyticsChart';

// Counting Animation Component
const AnimatedNumber = ({ value }) => {
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
};

export default function Dashboard() {
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
    const [teacherListOpen, setTeacherListOpen] = useState(false);
    const [teacherListOpen, setTeacherListOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats(error.message || "Unknown Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setDetailsOpen(true);
    };

    const handleFixData = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/api/payments/fix-fees`);
            alert(response.data.message || "Data fixed successfully");
            fetchStats();
        } catch (error) {
            console.error("Error fixing data:", error);
            alert("Failed to fix data");
            setLoading(false);
        }
    };

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
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchStats} sx={{ mt: 2 }}>Retry</Button>
            </Box>
        );
    }

    const StatCard = ({ title, value, icon, onClick, accentColor }) => (
        <Paper
            component={motion.div}
            whileHover={{
                y: -5,
                boxShadow: `0 0 30px ${alpha(accentColor || theme.palette.primary.main, 0.3)}`,
                borderColor: accentColor || theme.palette.primary.main
            }}
            whileTap={onClick ? tapScale : undefined}
            onClick={onClick}
            sx={{
                height: 180,
                width: '100%',
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 3,
                transition: 'all 0.3s ease'
            }}
            elevation={0}
        >
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, transform: 'rotate(15deg)' }}>
                {React.cloneElement(icon, { sx: { fontSize: 150, color: accentColor } })}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor || theme.palette.primary.main,
                    bgcolor: alpha(accentColor || theme.palette.primary.main, 0.15),
                    boxShadow: `0 0 20px ${alpha(accentColor || theme.palette.primary.main, 0.2)}`
                }}>
                    {React.cloneElement(icon, { fontSize: 'medium' })}
                </Box>
            </Box>

            <Box sx={{ pl: 1, position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    letterSpacing: '-1px',
                    mb: 0.5,
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                </Typography>
                <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
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
                        <Typography variant="h3" fontWeight="900" sx={{
                            background: 'linear-gradient(45deg, #fff, #a5f3fc)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            letterSpacing: '-1px',
                            mb: 1
                        }}>
                            {t('dashboard_overview')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" fontWeight="500">
                            {t('dashboard_subtitle')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Tooltip title="Fix Data Inconsistencies">
                            <IconButton onClick={handleFixData} sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) } }}>
                                <AutoFixHigh />
                            </IconButton>
                        </Tooltip>
                        <Button
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={tapScale}
                            variant="contained"
                            startIcon={<Assessment />}
                            onClick={() => setReportOpen(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #00f7ff 0%, #0099ff 100%)',
                                boxShadow: '0 0 20px rgba(0, 247, 255, 0.4)',
                                color: '#000'
                            }}
                        >
                            {t('generate_report')}
                            {t('generate_report')}
                        </Button>
                        <Button
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={tapScale}
                            variant="contained"
                            startIcon={<QrCodeScanner />}
                            onClick={() => navigate('/qr-scanner')}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                                color: '#fff'
                            }}
                        >
                            Scan
                        </Button>
                    </Box>
                </Box>

                {/* Main Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 8 }}>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title={t('total_students')}
                            value={stats.totalStudents}
                            icon={<PeopleOutline />}
                            accentColor={theme.palette.primary.main} // Royal Blue
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title={t('total_subjects')}
                            value={stats.totalSubjects}
                            icon={<MenuBook />}
                            accentColor={theme.palette.secondary.main} // Gold
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title="New Teacher"
                            value="+"
                            icon={<SupervisedUserCircle />}
                            accentColor={theme.palette.info.main} // Sky Blue
                            onClick={() => setCreateTeacherOpen(true)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemFadeUp}>
                        <StatCard
                            title="Teachers"
                            value={stats.teacherCount || "-"}
                            icon={<PeopleOutline />}
                            accentColor={theme.palette.success.main} // Emerald
                            onClick={() => setTeacherListOpen(true)}
                        />
                    </Grid>
                </Grid>

                {/* Analytics & Subjects */}
                <Box sx={{ mb: 6 }}>
                    <AnalyticsChart />
                </Box>

                <Typography variant="h4" fontWeight="800" sx={{ mb: 3, color: 'text.primary' }}>
                    Subject Performance
                </Typography>

                <Grid container spacing={4}>
                    {(stats.subjectStats || []).map((sub) => {
                        const paidPercentage = sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0;
                        const isGood = paidPercentage > 80;

                        return (
                            <Grid item xs={12} md={6} lg={4} key={sub.subject} component={motion.div} variants={itemFadeUp}>
                                <Paper
                                    component={motion.div}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => handleSubjectClick(sub.subject)}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        borderRadius: '20px',
                                        background: alpha(theme.palette.background.paper, 0.4),
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid',
                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            borderColor: isGood ? '#00ff66' : '#ff2a2a',
                                            boxShadow: `0 0 30px ${isGood ? 'rgba(0, 255, 102, 0.2)' : 'rgba(255, 42, 42, 0.2)'}`
                                        }
                                    }}
                                >
                                    {/* Background Glow */}
                                    <Box sx={{
                                        position: 'absolute', top: 0, right: 0, width: '150px', height: '150px',
                                        background: `radial-gradient(circle, ${isGood ? alpha('#00ff66', 0.1) : alpha('#ff2a2a', 0.1)} 0%, transparent 70%)`,
                                        borderRadius: '50%', transform: 'translate(30%, -30%)', pointerEvents: 'none'
                                    }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, position: 'relative' }}>
                                        <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary' }}>
                                            {sub.subject}
                                        </Typography>
                                        <VerifiedUser sx={{ color: isGood ? '#00ff66' : '#ff2a2a', filter: `drop-shadow(0 0 5px ${isGood ? '#00ff66' : '#ff2a2a'})` }} />
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">Collection Rate</Typography>
                                            <Typography variant="body2" fontWeight="700" color={isGood ? '#00ff66' : '#ff2a2a'}>
                                                {Math.round(paidPercentage)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={paidPercentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: alpha(theme.palette.text.secondary, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    background: isGood
                                                        ? 'linear-gradient(90deg, #00ff66, #00c4cc)'
                                                        : 'linear-gradient(90deg, #ff2a2a, #ffcc00)'
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PeopleOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="h6" fontWeight="700">{sub.studentCount}</Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{
                                            bgcolor: alpha(isGood ? '#00ff66' : '#ff2a2a', 0.1),
                                            color: isGood ? '#00ff66' : '#ff2a2a',
                                            px: 1.5, py: 0.5, borderRadius: '10px', fontWeight: 700
                                        }}>
                                            {sub.paidFees} Paid
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
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
