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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Create Teacher Account</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Create a login account for a teacher. They will only see data for their assigned subject.
                    </Alert>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label="Assign Subject"
                            fullWidth
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
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
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={loading || !username || !password || !selectedSubject}
                >
                    {loading ? "Creating..." : "Create Teacher Account"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
