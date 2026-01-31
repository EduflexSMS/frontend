import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, MenuItem } from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function CreateTeacherDialog({ open, onClose }) {
    const [subjects, setSubjects] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSubjects();
            setError('');
            setSuccess('');
            setUsername('');
            setPassword('');
            setSelectedSubject('');
        }
    }, [open]);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
            setSubjects(data);
        } catch (err) {
            console.error("Failed to fetch subjects", err);
        }
    };

    const handleCreate = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/auth/create-teacher`, {
                username,
                password,
                assignedSubject: selectedSubject
            });
            setSuccess(`Teacher account '${username}' created for ${selectedSubject}!`);
            setUsername('');
            setPassword('');
            setSelectedSubject('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    bgcolor: 'rgba(30, 41, 59, 0.85)', // Dark Glass
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Create Teacher Account
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ mt: 1 }}>
                    <Alert severity="info" sx={{
                        mb: 3,
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: 'primary.light',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        Create a login account for a teacher. They will only see data for their assigned subject.
                    </Alert>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            label="Assign Subject"
                            fullWidth
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' },
                                '& .MuiSelect-icon': { color: 'text.secondary' }
                            }}
                        >
                            {subjects.map((sub) => (
                                <MenuItem key={sub._id} value={sub.name}>
                                    {sub.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Username"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' }
                            }}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={loading || !username || !password || !selectedSubject}
                    sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? "Creating..." : "Create Teacher Account"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
