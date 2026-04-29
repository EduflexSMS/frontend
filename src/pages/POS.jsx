import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, InputAdornment, IconButton, Button, Divider, CircularProgress, alpha, useTheme, Card, CardContent, Chip, Avatar, Snackbar, Alert } from '@mui/material';
import { Search, AddShoppingCart, PointOfSale, Delete, Download, CheckCircleOutline, WhatsApp } from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import { generateBillPDF } from '../utils/generateBillPDF';

const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function POS() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [subjectsMap, setSubjectsMap] = useState({});
    
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    // Fetch subjects on load to get fees
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/subjects`);
                const map = {};
                res.data.forEach(s => { map[s.name] = s; });
                setSubjectsMap(map);
            } catch (error) {
                console.error("Failed to load subjects", error);
            }
        };
        fetchSubjects();
    }, []);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 3) {
                setIsSearching(true);
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/students`, { params: { search: searchTerm, limit: 10 } });
                    setSearchResults(res.data.students);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        setSearchTerm('');
        setCart([]); // Clear cart on new student
    };

    const handleAddToCart = (subjectName, monthIndex) => {
        const fee = subjectsMap[subjectName]?.fee || 0;
        
        // Prevent duplicate entries
        if (cart.find(item => item.subject === subjectName && item.month === monthIndex)) {
            return;
        }

        setCart([...cart, {
            id: `${subjectName}-${monthIndex}`,
            subject: subjectName,
            month: monthIndex,
            monthName: monthsList[monthIndex],
            amount: fee
        }]);
    };

    const handleRemoveFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    const handleCheckout = async () => {
        if (!selectedStudent || cart.length === 0) return;
        
        setIsProcessing(true);
        try {
            const payload = {
                studentId: selectedStudent._id,
                items: cart,
                totalAmount
            };

            const res = await axios.post(`${API_BASE_URL}/api/pos/checkout`, payload);
            
            // Download PDF Bill automatically
            generateBillPDF(res.data.transaction);

            // Update local student state so the UI reflects "Paid"
            const updatedStudent = { ...selectedStudent };
            cart.forEach(item => {
                const enrollment = updatedStudent.enrollments.find(e => e.subject === item.subject);
                if (enrollment) {
                    const record = enrollment.monthlyRecords.find(r => r.monthIndex === item.month);
                    if (record) {
                        record.feePaid = true;
                    }
                }
            });
            setSelectedStudent(updatedStudent);
            
            // Show notification
            let msg = `Payment Successful! TXN: ${res.data.transaction.transactionId}.`;
            if (res.data.waStatus === 'sent') msg += ' WhatsApp receipt sent!';
            else if (res.data.waStatus === 'failed') msg += ' WhatsApp sending failed.';
            
            setNotification({ open: true, message: msg, type: 'success' });
            setCart([]); // Clear cart after successful payment

        } catch (error) {
            console.error("Checkout Error:", error);
            setNotification({ open: true, message: error.response?.data?.message || 'Checkout Failed', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
                    <PointOfSale fontSize="large" />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Point of Sale</Typography>
                    <Typography variant="body2" color="text.secondary">Process student fees and issue receipts</Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* LEFT PANE - Search & Selection */}
                <Grid item xs={12} md={7} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(24px)', border: `1px solid ${theme.palette.divider}`, minHeight: '75vh', position: 'relative' }}>
                        
                        {/* Search Bar */}
                        <Box sx={{ position: 'relative', zIndex: 10 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search student by Name or Index Number... (min 3 chars)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: isSearching && (
                                        <InputAdornment position="end">
                                            <CircularProgress size={20} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                }}
                            />
                            
                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <Paper component={motion.div} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} elevation={4} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, maxHeight: 300, overflowY: 'auto', borderRadius: 3, border: `1px solid ${theme.palette.divider}`, zIndex: 20 }}>
                                        {searchResults.map(student => (
                                            <Box key={student._id} onClick={() => handleSelectStudent(student)} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', borderBottom: `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{student.name.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={700}>{student.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{student.indexNumber} • {student.grade}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Paper>
                                )}
                            </AnimatePresence>
                        </Box>

                        {/* Selected Student Details */}
                        {selectedStudent ? (
                            <Box sx={{ mt: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Card elevation={0} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(30,64,175,0.05) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800 }}>{selectedStudent.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={800}>{selectedStudent.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                <span>Index: <b>{selectedStudent.indexNumber}</b></span>
                                                <span>Grade: <b>{selectedStudent.grade}</b></span>
                                                <span>Mobile: <b>{selectedStudent.mobile}</b></span>
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>Enrolled Subjects & Pending Fees</Typography>
                                <Grid container spacing={2}>
                                    {selectedStudent.enrollments.map(enrollment => {
                                        const subjectInfo = subjectsMap[enrollment.subject];
                                        const currentMonth = new Date().getMonth();
                                        
                                        // Show current month and previous month if unpaid
                                        const displayMonths = [currentMonth - 1, currentMonth].filter(m => m >= 0);
                                        
                                        return (
                                            <Grid item xs={12} sm={6} key={enrollment.subject}>
                                                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Typography variant="subtitle1" fontWeight={700}>{enrollment.subject}</Typography>
                                                        <Chip label={`Rs. ${subjectInfo?.fee || 0}`} size="small" color="primary" variant="outlined" />
                                                    </Box>
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        {displayMonths.map(mIndex => {
                                                            const record = enrollment.monthlyRecords.find(r => r.monthIndex === mIndex);
                                                            const isPaid = record?.feePaid;
                                                            const isAdded = cart.some(c => c.id === `${enrollment.subject}-${mIndex}`);

                                                            return (
                                                                <Box key={mIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="body2" fontWeight={600} color={isPaid ? 'success.main' : 'text.primary'}>
                                                                        {monthsList[mIndex]}
                                                                    </Typography>
                                                                    {isPaid ? (
                                                                        <Chip icon={<CheckCircleOutline />} label="Paid" color="success" size="small" sx={{ fontWeight: 600 }} />
                                                                    ) : (
                                                                        <Button 
                                                                            variant="contained" 
                                                                            size="small" 
                                                                            disabled={isAdded}
                                                                            onClick={() => handleAddToCart(enrollment.subject, mIndex)}
                                                                            startIcon={isAdded ? <CheckCircleOutline /> : <AddShoppingCart />}
                                                                            sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontWeight: 700 }}
                                                                        >
                                                                            {isAdded ? "Added to Bill" : "Add to Bill"}
                                                                        </Button>
                                                                    )}
                                                                </Box>
                                                            );
                                                        })}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, mt: 10 }}>
                                <Search sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                                <Typography variant="h6" color="text.secondary">Search & Select a Student</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT PANE - Cart & Checkout */}
                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(24px)', border: `1px solid ${theme.palette.divider}`, minHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Current Bill</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                            {selectedStudent ? `For: ${selectedStudent.name}` : "No student selected"}
                        </Typography>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3, pr: 1 }}>
                            <AnimatePresence>
                                {cart.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: `1px dashed ${theme.palette.divider}`, borderRadius: 3 }}>
                                            Cart is empty
                                        </Box>
                                    </motion.div>
                                ) : (
                                    cart.map(item => (
                                        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>{item.subject}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{item.monthName}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={700}>Rs. {item.amount}</Typography>
                                                    <IconButton size="small" color="error" onClick={() => handleRemoveFromCart(item.id)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </Box>

                        <Box sx={{ pt: 3, borderTop: `2px dashed ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight={700}>Total Due</Typography>
                                <Typography variant="h5" fontWeight={800} color="primary.main">
                                    Rs. {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                            
                            <Button 
                                fullWidth 
                                variant="contained" 
                                size="large"
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCheckout}
                                sx={{ 
                                    py: 1.8, 
                                    borderRadius: 3, 
                                    fontWeight: 800, 
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                                    '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
                                }}
                            >
                                {isProcessing ? <CircularProgress size={28} color="inherit" /> : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        Process Payment <Download fontSize="small" /> <WhatsApp fontSize="small" />
                                    </Box>
                                )}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.type} variant="filled" sx={{ width: '100%', borderRadius: 3, fontWeight: 600 }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
