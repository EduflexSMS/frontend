import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, Box, Typography, CircularProgress } from '@mui/material';
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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Teacher Profiles
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : teachers.length === 0 ? (
                    <Typography align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No teacher accounts found.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Assigned Subject</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teachers.map((teacher) => (
                                    <TableRow key={teacher._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {teacher.username?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography fontWeight="500">{teacher.username}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={teacher.assignedSubject}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={teacher.role} size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
