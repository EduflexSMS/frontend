import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Paper, Chip, Avatar, Box, Typography, CircularProgress, alpha } from '@mui/material';
import { Person } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function TeacherListDialog({ open, onClose }) {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', opacity: 0.98, backdropFilter: 'blur(10px)' } }}>
            <DialogTitle sx={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: 1.5, py: 3, px: 4, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}>
                <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '12px', color: 'white', display: 'flex' }}>
                    <Person />
                </Box>
                <Typography variant="h5" fontWeight="800">Expert Teachers</Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4, bgcolor: 'background.default' }}>
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
                        {teachers.map((teacher) => (
                            <Grid item xs={12} sm={6} md={4} key={teacher._id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        borderRadius: '24px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    {/* Abstract Background Decoration */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '80px',
                                        background: `linear-gradient(135deg, ${teacher.color || 'var(--mui-palette-primary-main)'} 0%, ${alpha(teacher.color || '#3b82f6', 0.6)} 100%)`,
                                        opacity: 0.1
                                    }} />

                                    <Avatar
                                        src={teacher.image || teacher.profileImage} // Try to get image if available
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            mb: 2,
                                            border: '4px solid',
                                            borderColor: 'background.paper',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                            bgcolor: 'primary.main',
                                            fontSize: '2.5rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {!teacher.image && !teacher.profileImage && teacher.username?.charAt(0).toUpperCase()}
                                    </Avatar>

                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                                        {teacher.username}
                                    </Typography>

                                    <Chip
                                        label={teacher.assignedSubject}
                                        size="small"
                                        sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            bgcolor: alpha(teacher.color || '#3b82f6', 0.1),
                                            color: teacher.color || 'primary.main',
                                            borderRadius: '8px'
                                        }}
                                    />

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                        {teacher.description || `Expert in ${teacher.assignedSubject} with a passion for teaching.`}
                                    </Typography>

                                    <Box sx={{ width: '100%', display: 'flex', gap: 1, justifyContent: 'center' }}>
                                        <Chip
                                            label={teacher.role || "Teacher"}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderRadius: '6px' }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: '12px', px: 4 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
