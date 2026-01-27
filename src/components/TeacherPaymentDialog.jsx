import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, TextField, CircularProgress, Alert, MenuItem, Grid
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

const TeacherPaymentDialog = ({ open, onClose, teacherId, teacherName }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    // Form state
    const [paidAmount, setPaidAmount] = useState('');

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchStats = async () => {
        if (!teacherId) return;
        setLoading(true);
        setError(null);
        setStats(null);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/payments/stats/${teacherId}?month=${selectedMonth}&year=${selectedYear}`
            );
            setStats(response.data);
            setPaidAmount(response.data.existingPayment ? response.data.existingPayment.paidAmount : response.data.suggestedPayment);
        } catch (err) {
            console.error("Error fetching payment stats:", err);
            setError(err.response?.data?.message || "Failed to load payment info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && teacherId) {
            fetchStats();
            setSuccess(null);
        }
    }, [open, teacherId, selectedMonth, selectedYear]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/api/payments`, {
                teacherId,
                month: selectedMonth,
                year: selectedYear,
                totalCollected: stats.totalCollected,
                paidAmount: parseFloat(paidAmount)
            });
            setSuccess("Payment recorded successfully!");
            // Refresh stats to show update
            fetchStats();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Teacher Payment: {teacherName}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Month"
                            fullWidth
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((m, index) => (
                                <MenuItem key={index} value={index}>{m}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            type="number"
                            label="Year"
                            fullWidth
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        />
                    </Grid>
                </Grid>

                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                {stats && !loading && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Subject: {stats.subjectName} (Fee: {stats.subjectFee})
                        </Typography>

                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Paid Student Count:</Typography>
                                <Typography fontWeight="bold">{stats.paidStudentCount}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Total Collected:</Typography>
                                <Typography fontWeight="bold" color="primary">{stats.totalCollected.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>80% Share:</Typography>
                                <Typography fontWeight="bold" color="secondary">{stats.suggestedPayment.toLocaleString()}</Typography>
                            </Box>
                        </Box>

                        {stats.existingPayment && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Payment already recorded for this month on {new Date(stats.existingPayment.paidDate).toLocaleDateString()}.
                            </Alert>
                        )}

                        <TextField
                            label="Payment Amount"
                            type="number"
                            fullWidth
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            helperText="Enter the actual amount paid to the teacher"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !stats}
                >
                    {stats?.existingPayment ? "Update Payment" : "Record Payment"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TeacherPaymentDialog;
