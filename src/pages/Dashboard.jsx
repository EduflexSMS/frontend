import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Paper, LinearProgress, Button, Container, alpha, useTheme, Avatar } from '@mui/material';
import { MenuBook, Assessment, TrendingUp, PeopleOutline, SupervisedUserCircle, VerifiedUser } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import ReportDialog from '../components/ReportDialog';
import SubjectDetailsDialog from '../components/SubjectDetailsDialog';
import TeacherProfilesDialog from '../components/TeacherProfilesDialog';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

export default function Dashboard() {
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    // State for dialogs
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [teachersOpen, setTeachersOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setDetailsOpen(true);
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

    const StatCard = ({ title, value, icon, gradient1, gradient2, delay, onClick }) => (
        <Paper
            component={motion.div}
            whileHover={{
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            sx={{
                height: 220, // Fixed height
                width: '100%',
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                background: `linear-gradient(135deg, ${gradient1} 0%, ${gradient2} 100%)`,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}
            elevation={0}
        >
            {/* Decorative Circles */}
            <Box sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                zIndex: 0
            }} />

            <CardContent sx={{ position: 'relative', zIndex: 1, width: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Box sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            display: 'inline-flex',
                            mb: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {React.cloneElement(icon, { sx: { fontSize: 32, color: 'white' } })}
                        </Box>
                        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600, fontSize: '1.1rem' }}>
                            {title}
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, letterSpacing: '-0.02em', fontSize: '3.5rem' }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ opacity: 0.3 }}>
                        {React.cloneElement(icon, { sx: { fontSize: 100 } })}
                    </Box>
                </Box>
            </CardContent>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ pb: 8 }}>
            <motion.div
                variants={containerVariants}
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
                            color: '#1e293b',
                            letterSpacing: '-0.03em',
                            mb: 1
                        }}>
                            Dashboard Overview
                        </Typography>
                        <Typography variant="h6" color="text.secondary" fontWeight="500">
                            Welcome back, here's what's happening today.
                        </Typography>
                    </Box>
                    <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                        Generate Report
                    </Button>
                </Box>

                {/* Main Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 8 }}>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <StatCard
                            title="Total Students"
                            value={stats.totalStudents}
                            icon={<PeopleOutline />}
                            gradient1="#3b82f6"
                            gradient2="#1d4ed8"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <StatCard
                            title="Total Subjects"
                            value={stats.totalSubjects}
                            icon={<MenuBook />}
                            gradient1="#10b981"
                            gradient2="#047857"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <StatCard
                            title="Expert Teachers"
                            value={6}
                            icon={<SupervisedUserCircle />}
                            gradient1="#8b5cf6"
                            gradient2="#6d28d9"
                            onClick={() => setTeachersOpen(true)}
                        />
                    </Grid>
                </Grid>

                {/* Analytics Section */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '12px' }}>
                        <TrendingUp sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="#1e293b">
                        Performance Analytics
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {(stats.subjectStats || []).map((sub) => (
                        <Grid item xs={12} md={6} lg={4} key={sub.subject} component={motion.div} variants={itemVariants}>
                            <Paper
                                component={motion.div}
                                whileHover={{
                                    y: -8,
                                    transition: { type: "spring", stiffness: 300, damping: 20 }
                                }}
                                onClick={() => handleSubjectClick(sub.subject)}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    borderRadius: 5,
                                    border: '1px solid rgba(255,255,255,0.6)',
                                    background: 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15)',
                                        borderColor: 'rgba(59, 130, 246, 0.4)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5, color: '#0f172a' }}>
                                            {sub.subject}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                                            Class Performance
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
                                        Active
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" fontWeight="600" color="text.secondary">Fee Collection</Typography>
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
                                    borderColor: 'rgba(0,0,0,0.05)'
                                }}>
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>STUDENTS</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PeopleOutline sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.6 }} />
                                            <Typography variant="h6" fontWeight="800" color="#334155">{sub.studentCount}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" display="block" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>PAID</Typography>
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
            <TeacherProfilesDialog
                open={teachersOpen}
                onClose={() => setTeachersOpen(false)}
            />
        </Container>
    );
}
