import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Typography, Box, Chip
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function SubjectDetailsDialog({ open, onClose, subjectName }) {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && subjectName) {
            const fetchDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/dashboard/subject/${encodeURIComponent(subjectName)}`);
                    setDetails(response.data);
                } catch (err) {
                    console.error("Error fetching subject details:", err);
                    setError("Failed to load details");
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [open, subjectName]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {subjectName} - Grade Breakdown
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : details.length === 0 ? (
                    <Typography align="center" color="text.secondary">No students enrolled yet.</Typography>
                ) : (
                    <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Students</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Paid (This Month)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.map((row) => (
                                    <TableRow key={row.grade}>
                                        <TableCell component="th" scope="row">
                                            {row.grade}
                                        </TableCell>
                                        <TableCell align="center">{row.totalStudents}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={row.paidStudents}
                                                size="small"
                                                color={row.paidStudents > 0 ? "success" : "default"}
                                                variant={row.paidStudents > 0 ? "filled" : "outlined"}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
