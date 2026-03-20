import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, TextField, CircularProgress, Alert, MenuItem, Grid,
    Paper, alpha, useTheme
} from '@mui/material';
import { MonetizationOn, DateRange, AccountBalanceWallet, CheckCircle, Warning, AutoFixHigh } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

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

    const theme = useTheme();

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

    const handleFixData = async () => {
        if (!window.confirm("This will recalculate all payment records and correct fee discrepancies. Continue?")) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/payments/fix-fees`);
            alert(res.data.message + "\n" + (res.data.changes.join("\n") || "No changes needed."));
            fetchStats();
        } catch (err) {
            console.error(err);
            alert("Error fixing data: " + (err.response?.data?.message || err.message));
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
                style: {
                    borderRadius: 24,
                    background: 'rgba(12, 12, 24, 0.75)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
            TransitionProps={{
                onEnter: (node) => {
                    node.style.transformOrigin = 'center center';
                }
            }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                pt: 4, pb: 1
            }}>
                Teacher Payment
            </DialogTitle>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Processing for <span style={{ color: '#00f7ff', fontWeight: 600 }}>{teacherName}</span>
            </Typography>

            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Month"
                            fullWidth
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#00f7ff' }
                                }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#00f7ff' }
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress sx={{ color: '#00f7ff' }} /></Box>}

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="error" sx={{ mt: 2, borderRadius: '12px', bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>{error}</Alert>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Alert severity="success" sx={{ mt: 2, borderRadius: '12px', bgcolor: 'rgba(56, 142, 60, 0.1)', color: '#a5d6a7' }}>{success}</Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {stats && !loading && (
                    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ mt: 3 }}>
                        <Paper sx={{
                            p: 3,
                            borderRadius: '20px',
                            mb: 3,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle fontSize="small" color="success" /> Subject Overview
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#fff' }}>
                                {stats.subjectName} <span style={{ fontSize: '0.8em', opacity: 0.7, fontWeight: 400 }}>({stats.subjectFee}/= per student)</span>
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography color="text.secondary">Paid Student Count</Typography>
                                    <Typography fontWeight="bold" sx={{ color: '#fff' }}>{stats.paidStudentCount}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography color="text.secondary">Total Collected</Typography>
                                    <Typography fontWeight="bold" sx={{ color: '#00f7ff', fontSize: '1.1rem' }}>{stats.totalCollected.toLocaleString()}/=</Typography>
                                </Box>
                                <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography color="text.secondary">80% Share (Suggested)</Typography>
                                    <Typography fontWeight="800" sx={{ color: '#ffd700', fontSize: '1.2rem', textShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
                                        {stats.suggestedPayment.toLocaleString()}/=
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {stats.existingPayment && (
                            <Alert icon={<CheckCircle fontSize="inherit" />} severity="info" sx={{ mb: 3, borderRadius: ('12px'), bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#81d4fa' }}>
                                Payment of Rs. {stats.existingPayment.paidAmount.toLocaleString()} recorded on {new Date(stats.existingPayment.paidDate).toLocaleDateString()}.
                            </Alert>
                        )}

                        <TextField
                            label="Payment Amount"
                            type="number"
                            fullWidth
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            helperText="Enter the actual amount paid to the teacher"
                            InputProps={{
                                startAdornment: <MonetizationOn sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ffd700' } // Gold focus for money
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#ffd700' }
                            }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 4, justifyContent: 'space-between' }}>
                <Button
                    onClick={handleFixData}
                    startIcon={<AutoFixHigh />}
                    sx={{
                        color: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        '&:hover': { color: '#ff9800', bgcolor: 'rgba(255, 152, 0, 0.1)' }
                    }}
                >
                    Fix Data
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={onClose} sx={{ color: 'text.secondary', borderRadius: '12px', textTransform: 'none' }}>Close</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || !stats}
                        startIcon={stats?.existingPayment ? <CheckCircle /> : <AccountBalanceWallet />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            background: stats?.existingPayment
                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                : 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                            color: stats?.existingPayment ? '#fff' : '#000',
                            boxShadow: stats?.existingPayment
                                ? '0 4px 15px rgba(5, 150, 105, 0.3)'
                                : '0 4px 15px rgba(255, 215, 0, 0.3)',
                            '&:hover': {
                                background: stats?.existingPayment
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #ffed4a 0%, #f59e0b 100%)',
                            }
                        }}
                    >
                        {stats?.existingPayment ? "Update Payment" : "Record Payment"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TeacherPaymentDialog;
