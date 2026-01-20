import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Paper, LinearProgress, Button, Container, alpha } from '@mui/material';
import { MenuBook, AttachMoney, Assessment, TrendingUp, PeopleOutline, SupervisedUserCircle } from '@mui/icons-material';
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
            staggerChildren: 0.1
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
            stiffness: 100
        }
    }
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    // State for dialogs
    const [reportOpen, setReportOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [teachersOpen, setTeachersOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const handleSubjectClick = (subjectName) => {
        console.log("Card clicked:", subjectName);
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
                <CircularProgress size={60} thickness={4} sx={{ color: 'var(--primary-color)' }} />
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

    const StatCard = ({ title, value, icon, gradient, delay }) => (
        <Card
            component={motion.div}
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            sx={{
                background: gradient,
                color: 'white',
                height: '100%',
                borderRadius: '24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 0.2,
                transform: 'rotate(15deg) scale(1.5)',
            }}>
                {icon}
            </Box>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {React.cloneElement(icon, { sx: { fontSize: 32 } })}
                    </Box>
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>{title}</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, letterSpacing: -1 }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)', backgroundClip: 'text', textFillColor: 'transparent', mb: 1 }}>
                            Dashboard Overview
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
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
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            }
                        }}
                    >
                        Generate Report
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <StatCard
                            title="Total Students"
                            value={stats.totalStudents}
                            icon={<PeopleOutline sx={{ fontSize: 100 }} />}
                            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <StatCard
                            title="Total Subjects"
                            value={stats.totalSubjects}
                            icon={<MenuBook sx={{ fontSize: 100 }} />}
                            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                        <Box
                            component={motion.div}
                            animate={{
                                y: [0, -5, 0],
                                boxShadow: [
                                    "0 10px 15px -3px rgba(139, 92, 246, 0.1)",
                                    "0 20px 25px -5px rgba(139, 92, 246, 0.3)",
                                    "0 10px 15px -3px rgba(139, 92, 246, 0.1)"
                                ]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            onClick={() => setTeachersOpen(true)}
                            sx={{ height: '100%', cursor: 'pointer' }}
                        >
                            <StatCard
                                title="Teachers Profiles"
                                value={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                                            6
                                        </Typography>
                                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, pt: 1 }}>
                                            Teachers
                                        </Typography>
                                    </Box>
                                }
                                icon={<SupervisedUserCircle sx={{ fontSize: 100 }} />}
                                gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: 'var(--primary-color)' }} /> Performance Analytics
                </Typography>

                <Grid container spacing={3}>
                    {(stats.subjectStats || []).map((sub) => (
                        <Grid item xs={12} md={6} lg={4} key={sub.subject} component={motion.div} variants={itemVariants}>
                            <Paper
                                component={motion.div}
                                whileHover={{ y: -4 }}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    background: 'rgba(255,255,255,0.7)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: 'var(--card-shadow)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSubjectClick(sub.subject)}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {sub.subject}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Class Performance
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        px: 1.5, py: 0.5,
                                        bgcolor: alpha(sub.studentCount > 0 && (sub.paidFees / sub.studentCount) > 0.8 ? '#10b981' : '#f59e0b', 0.1),
                                        color: sub.studentCount > 0 && (sub.paidFees / sub.studentCount) > 0.8 ? '#059669' : '#d97706',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        Active
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>Fee Collection</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{Math.round((sub.paidFees / (sub.studentCount || 1)) * 100)}%</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: alpha('#3b82f6', 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 5,
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">Students</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">{sub.studentCount}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" display="block" color="text.secondary">Paid</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">{sub.paidFees}</Typography>
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
