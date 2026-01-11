import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Paper, LinearProgress, Button } from '@mui/material';
import { School, MenuBook, AttachMoney, Assessment } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import ReportDialog from '../components/ReportDialog';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);


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
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    if (!stats || typeof stats === 'string') {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" variant="h6">Error loading stats</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {typeof stats === 'string' ? stats : "Please check your network connection or server logs."}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: { xs: 2, md: 4 }, fontSize: { xs: '1.75rem', md: '2.125rem' }, letterSpacing: '-0.5px' }}>
                Dashboard Overview
            </Typography>

            {/* Top Cards */}
            <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                        color: 'white',
                        height: '100%',
                        borderRadius: 4,
                        boxShadow: '0 10px 20px rgba(30, 136, 229, 0.3)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                <School fontSize="large" sx={{ opacity: 1, fontSize: 40 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6">Total Students</Typography>
                                <Typography variant="h3" fontWeight="bold">{stats.totalStudents}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                        color: 'white',
                        height: '100%',
                        borderRadius: 4,
                        boxShadow: '0 10px 20px rgba(67, 160, 71, 0.3)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                <MenuBook fontSize="large" sx={{ opacity: 1, fontSize: 40 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6">Total Subjects</Typography>
                                <Typography variant="h3" fontWeight="bold">{stats.totalSubjects}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                        color: 'white',
                        height: '100%',
                        borderRadius: 4,
                        boxShadow: '0 10px 20px rgba(251, 140, 0, 0.3)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                                <Assessment fontSize="large" sx={{ opacity: 1, fontSize: 40 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6">Reports</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        bgcolor: 'white',
                                        color: '#fb8c00',
                                        fontWeight: 'bold',
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                    }}
                                    onClick={() => setReportOpen(true)}
                                >
                                    Generate
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Monthly Performance by Subject
            </Typography>

            <Grid container spacing={3}>
                {(stats.subjectStats || []).map((sub) => (
                    <Grid item xs={12} md={6} lg={4} key={sub.subject}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                {sub.subject}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Enrolled Students</Typography>
                                <Typography variant="h5">{sub.studentCount}</Typography>
                            </Box>

                            <Box sx={{ mb: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AttachMoney fontSize="inherit" /> Fees Paid (Current Month)
                                    </Typography>
                                    <Typography variant="caption">{sub.paidFees} / {sub.studentCount}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={sub.studentCount > 0 ? (sub.paidFees / sub.studentCount) * 100 : 0}
                                    color="success"
                                    sx={{ height: 8, borderRadius: 1 }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} />
        </Box>
    );
}
