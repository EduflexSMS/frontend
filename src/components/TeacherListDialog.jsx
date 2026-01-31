import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Paper, Chip, Avatar, Box, Typography, CircularProgress, alpha } from '@mui/material';
import { Person } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import TeacherPaymentDialog from './TeacherPaymentDialog';

import { useTheme } from '@mui/material/styles';

export default function TeacherListDialog({ open, onClose }) {
    const theme = useTheme();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        if (open) {
            fetchTeachers();
        }
    }, [open]);

    const fetchTeachers = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/auth/teachers`);
            setTeachers(data);
        } catch (err) {
            console.error("Failed to fetch teachers", err);
            setError("Failed to load teachers.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (teacher) => {
        setSelectedTeacher(teacher);
        setPaymentOpen(true);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{
                sx: {
                    borderRadius: '32px',
                    background: alpha(theme.palette.background.paper, 0.8), // Glass effect
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                }
            }}>
                <DialogTitle sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: '16px',
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <Person sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="800">Expert Teachers</Typography>
                            <Typography variant="body2" color="text.secondary">Select a teacher to view details or process payments</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error" align="center">{error}</Typography>
                    ) : teachers.length === 0 ? (
                        <Typography align="center" sx={{ py: 8, color: 'text.secondary' }}>
                            No teacher accounts found.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {teachers.map((teacher, index) => (
                                <Grid item xs={12} sm={6} md={4} key={teacher._id || index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 0,
                                            height: '100%',
                                            minHeight: '320px', // Minimum height for uniformity
                                            borderRadius: '24px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 20px 40px -4px rgba(0,0,0,0.1)',
                                                borderColor: 'primary.main'
                                            }
                                        }}
                                    >
                                        {/* Header Gradient */}
                                        <Box sx={{
                                            width: '100%',
                                            height: '100px',
                                            background: `linear-gradient(135deg, ${alpha(teacher.color || theme.palette.primary.main, 0.2)} 0%, ${alpha(teacher.color || theme.palette.secondary.main, 0.1)} 100%)`,
                                            mb: -6
                                        }} />

                                        <Avatar
                                            src={teacher.image || teacher.profileImage}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mb: 2,
                                                border: '4px solid',
                                                borderColor: 'background.paper',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                                bgcolor: 'background.paper',
                                                color: 'primary.main',
                                                fontSize: '2rem',
                                                fontWeight: '800'
                                            }}
                                        >
                                            {!teacher.image && !teacher.profileImage && teacher.username?.charAt(0).toUpperCase()}
                                        </Avatar>

                                        <Box sx={{ px: 3, pb: 4, width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                                                {teacher.username}
                                            </Typography>

                                            <Chip
                                                label={teacher.assignedSubject || "General Science"}
                                                size="small"
                                                sx={{
                                                    mb: 2,
                                                    fontWeight: 600,
                                                    bgcolor: alpha(teacher.color || theme.palette.primary.main, 0.1),
                                                    color: teacher.color || theme.palette.primary.main,
                                                    borderRadius: '8px',
                                                    height: '24px'
                                                }}
                                            />

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.875rem' }}>
                                                {teacher.description || `Expert instructor for ${teacher.assignedSubject || 'various subjects'}. Dedicated to student success.`}
                                            </Typography>

                                            <Box sx={{ mt: 'auto', width: '100%', display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handlePaymentClick(teacher)}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        boxShadow: 'none',
                                                        py: 1,
                                                        bgcolor: '#10b981',
                                                        '&:hover': { bgcolor: '#059669' }
                                                    }}
                                                >
                                                    Process Payment
                                                </Button>
                                                <Chip
                                                    label={teacher.role || "Verified Teacher"}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: '6px', borderColor: 'transparent', color: 'text.disabled', fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0 }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            color: 'text.secondary',
                            fontWeight: 600,
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <TeacherPaymentDialog
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                teacherId={selectedTeacher?._id}
                teacherName={selectedTeacher?.username}
            />
        </>
    );
}
