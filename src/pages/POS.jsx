import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, InputAdornment, IconButton, Button, Divider, CircularProgress, alpha, useTheme, Card, CardContent, Chip, Avatar, Snackbar, Alert, Tooltip, Badge } from '@mui/material';
import { Search, AddShoppingCart, PointOfSale, Delete, Download, CheckCircleOutline, WhatsApp, Receipt, Person, School, Phone, KeyboardArrowRight, CreditCard, LocalAtm, TrendingUp, Close, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import { generateBillPDF } from '../utils/generateBillPDF';

const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const subjectColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: 'rgba(102,126,234,0.12)', border: 'rgba(102,126,234,0.3)', text: '#667eea' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: 'rgba(240,147,251,0.12)', border: 'rgba(240,147,251,0.3)', text: '#f093fb' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: 'rgba(79,172,254,0.12)', border: 'rgba(79,172,254,0.3)', text: '#4facfe' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', light: 'rgba(67,233,123,0.12)', border: 'rgba(67,233,123,0.3)', text: '#43e97b' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', light: 'rgba(250,112,154,0.12)', border: 'rgba(250,112,154,0.3)', text: '#fa709a' },
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', light: 'rgba(161,140,209,0.12)', border: 'rgba(161,140,209,0.3)', text: '#a18cd1' },
];

const PAID_COLOR = { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', light: 'rgba(17,153,142,0.1)', border: 'rgba(17,153,142,0.25)', text: '#11998e' };

function StudentAvatar({ name, size = 52 }) {
    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const hue = name?.charCodeAt(0) * 17 % 360 || 200;
    return (
        <Box sx={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 40) % 360},80%,45%) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: size * 0.3,
            letterSpacing: '0.03em', boxShadow: `0 4px 16px hsl(${hue},60%,45%,0.4)`
        }}>
            {initials}
        </Box>
    );
}

export default function POS() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [subjectsMap, setSubjectsMap] = useState({});
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const searchRef = useRef(null);

    const surface = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)';
    const surfaceHover = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.95)';
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const subtleBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/subjects`);
                const map = {};
                res.data.forEach(s => { map[s.name] = s; });
                setSubjectsMap(map);
            } catch (error) { console.error("Failed to load subjects", error); }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 3) {
                setIsSearching(true);
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/students`, { params: { search: searchTerm, limit: 8 } });
                    setSearchResults(res.data.students);
                } catch (error) { console.error(error); }
                finally { setIsSearching(false); }
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        setSearchTerm('');
        setCart([]);
    };

    const handleAddToCart = (subjectName, monthIndex) => {
        const fee = subjectsMap[subjectName]?.fee || 0;
        if (cart.find(item => item.subject === subjectName && item.month === monthIndex)) return;
        setCart(prev => [...prev, {
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
            const payload = { studentId: selectedStudent._id, items: cart, totalAmount };
            const res = await axios.post(`${API_BASE_URL}/api/pos/checkout`, payload);
            generateBillPDF(res.data.transaction);

            const updatedStudent = { ...selectedStudent };
            cart.forEach(item => {
                const enrollment = updatedStudent.enrollments.find(e => e.subject === item.subject);
                if (enrollment) {
                    const record = enrollment.monthlyRecords.find(r => r.monthIndex === item.month);
                    if (record) record.feePaid = true;
                }
            });
            setSelectedStudent(updatedStudent);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            let msg = `Payment of Rs. ${totalAmount.toLocaleString()} received. TXN: ${res.data.transaction.transactionId}`;
            if (res.data.waStatus === 'sent') msg += ' — WhatsApp receipt sent!';
            setNotification({ open: true, message: msg, type: 'success' });
            setCart([]);
        } catch (error) {
            setNotification({ open: true, message: error.response?.data?.message || 'Checkout Failed', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const currentMonth = new Date().getMonth();
    const displayMonths = [currentMonth - 1, currentMonth].filter(m => m >= 0);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: isDark
                ? 'radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%), #0f1117'
                : 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 60%), #f4f6fb',
            py: { xs: 2, md: 4 }
        }}>
            <Container maxWidth="xl">

                {/* Header */}
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{
                            p: 1.8, borderRadius: '20px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                            color: 'white', display: 'flex'
                        }}>
                            <PointOfSale sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                Point of Sale
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)', mt: 0.3, letterSpacing: '0.01em' }}>
                                Process fees · Issue receipts · Send WhatsApp
                            </Typography>
                        </Box>
                    </Box>
                    {/* Stats row */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {[
                            { label: 'Cart Items', value: cart.length, icon: <Receipt sx={{ fontSize: 16 }} />, color: '#6366f1' },
                            { label: 'Total Due', value: `Rs. ${totalAmount.toLocaleString()}`, icon: <LocalAtm sx={{ fontSize: 16 }} />, color: '#10b981' }
                        ].map(stat => (
                            <Box key={stat.label} sx={{
                                px: 2.5, py: 1.5, borderRadius: 3,
                                background: surface, border: `1px solid ${border}`,
                                backdropFilter: 'blur(20px)',
                                display: 'flex', alignItems: 'center', gap: 1.5
                            }}>
                                <Box sx={{ color: stat.color, display: 'flex', opacity: 0.8 }}>{stat.icon}</Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', display: 'block', lineHeight: 1 }}>{stat.label}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: stat.color, lineHeight: 1.4 }}>{stat.value}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Grid container spacing={3}>

                    {/* ─── LEFT PANE ─── */}
                    <Grid item xs={12} md={7} lg={8}>
                        <Box sx={{
                            borderRadius: '24px',
                            background: surface,
                            border: `1px solid ${border}`,
                            backdropFilter: 'blur(40px)',
                            overflow: 'hidden',
                            minHeight: '78vh',
                            boxShadow: isDark ? '0 32px 64px rgba(0,0,0,0.5)' : '0 16px 64px rgba(99,102,241,0.08)',
                        }}>
                            {/* Search area */}
                            <Box sx={{ p: 3, pb: 0, position: 'relative', zIndex: 10 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by name or index number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    ref={searchRef}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: isSearching ? (
                                            <InputAdornment position="end"><CircularProgress size={18} sx={{ color: '#6366f1' }} /></InputAdornment>
                                        ) : searchTerm.length > 0 ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                                    <Close sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                        sx: {
                                            borderRadius: '14px',
                                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
                                            '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                            '&:hover fieldset': { borderColor: '#6366f1 !important' },
                                            '&.Mui-focused fieldset': { borderColor: '#6366f1 !important' },
                                            fontSize: '0.95rem'
                                        }
                                    }}
                                />

                                {/* Dropdown results */}
                                <AnimatePresence>
                                    {searchResults.length > 0 && (
                                        <Box
                                            component={motion.div}
                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            sx={{
                                                position: 'absolute', top: 'calc(100% - 4px)', left: 24, right: 24,
                                                background: isDark ? 'rgba(20,22,30,0.97)' : 'rgba(255,255,255,0.98)',
                                                backdropFilter: 'blur(40px)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.15)',
                                                zIndex: 50,
                                            }}
                                        >
                                            {searchResults.map((student, i) => (
                                                <Box
                                                    key={student._id}
                                                    component={motion.div}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onClick={() => handleSelectStudent(student)}
                                                    sx={{
                                                        p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
                                                        borderBottom: i < searchResults.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                                                        transition: 'all 0.15s',
                                                        '&:hover': { background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)' }
                                                    }}
                                                >
                                                    <StudentAvatar name={student.name} size={40} />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{student.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                                                            {student.indexNumber} &bull; {student.grade}
                                                        </Typography>
                                                    </Box>
                                                    <KeyboardArrowRight sx={{ fontSize: 18, opacity: 0.3 }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </AnimatePresence>
                            </Box>

                            {/* Content area */}
                            <Box sx={{ p: 3 }}>
                                <AnimatePresence mode="wait">
                                    {selectedStudent ? (
                                        <Box component={motion.div} key="student" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

                                            {/* Student card */}
                                            <Box sx={{
                                                p: 3, borderRadius: '18px', mb: 4,
                                                background: isDark
                                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)'
                                                    : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)',
                                                border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}`,
                                                display: 'flex', alignItems: 'center', gap: 3,
                                                position: 'relative', overflow: 'hidden'
                                            }}>
                                                <Box sx={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(99,102,241,0.05)' }} />
                                                <Box sx={{ position: 'absolute', right: 40, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.06)' }} />
                                                <StudentAvatar name={selectedStudent.name} size={60} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isDark ? '#f1f5f9' : '#0f172a', mb: 0.5 }}>
                                                        {selectedStudent.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                        {[
                                                            { icon: <CreditCard sx={{ fontSize: 13 }} />, text: selectedStudent.indexNumber },
                                                            { icon: <School sx={{ fontSize: 13 }} />, text: `Grade ${selectedStudent.grade}` },
                                                            { icon: <Phone sx={{ fontSize: 13 }} />, text: selectedStudent.mobile },
                                                        ].map(info => (
                                                            <Box key={info.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                                                {info.icon}
                                                                <Typography variant="caption" fontWeight={600}>{info.text}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={`${selectedStudent.enrollments?.length || 0} subjects`}
                                                    size="small"
                                                    sx={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', fontWeight: 700, border: '1px solid rgba(99,102,241,0.25)' }}
                                                />
                                            </Box>

                                            {/* Section title */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.01em' }}>
                                                    Fee Overview
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', fontWeight: 600 }}>
                                                    {monthsList[currentMonth - 1]} &amp; {monthsList[currentMonth]}
                                                </Typography>
                                            </Box>

                                            {/* Subject cards */}
                                            <Grid container spacing={2}>
                                                {selectedStudent.enrollments.map((enrollment, colorIdx) => {
                                                    const col = subjectColors[colorIdx % subjectColors.length];
                                                    const subjectInfo = subjectsMap[enrollment.subject];

                                                    return (
                                                        <Grid item xs={12} sm={6} key={enrollment.subject}>
                                                            <Box
                                                                component={motion.div}
                                                                initial={{ opacity: 0, scale: 0.96 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: colorIdx * 0.07 }}
                                                                sx={{
                                                                    p: 2.5, borderRadius: '16px',
                                                                    background: isDark ? col.light : col.light.replace('0.12', '0.06'),
                                                                    border: `1px solid ${col.border}`,
                                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${col.border}` }
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                    <Box>
                                                                        <Box sx={{
                                                                            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                                                                            background: col.bg, mr: 1, verticalAlign: 'middle',
                                                                            boxShadow: `0 0 6px ${col.text}80`
                                                                        }} />
                                                                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                                            {enrollment.subject}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        px: 1.5, py: 0.4, borderRadius: '8px',
                                                                        background: col.light,
                                                                        border: `1px solid ${col.border}`,
                                                                    }}>
                                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: col.text }}>
                                                                            Rs. {subjectInfo?.fee || 0}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Divider sx={{ mb: 2, opacity: 0.4 }} />

                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                                    {displayMonths.map(mIndex => {
                                                                        const record = enrollment.monthlyRecords.find(r => r.monthIndex === mIndex);
                                                                        const isPaid = record?.feePaid;
                                                                        const isAdded = cart.some(c => c.id === `${enrollment.subject}-${mIndex}`);

                                                                        return (
                                                                            <Box key={mIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: isPaid ? '#10b981' : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)',
                                                                                    fontSize: '0.82rem'
                                                                                }}>
                                                                                    {monthsList[mIndex]}
                                                                                    {mIndex === currentMonth && (
                                                                                        <Box component="span" sx={{
                                                                                            ml: 1, px: 0.8, py: 0.2, borderRadius: '5px',
                                                                                            background: 'rgba(99,102,241,0.15)', color: '#6366f1',
                                                                                            fontSize: '0.65rem', fontWeight: 700
                                                                                        }}>current</Box>
                                                                                    )}
                                                                                </Typography>

                                                                                {isPaid ? (
                                                                                    <Chip
                                                                                        icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
                                                                                        label="Paid"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                                                                            border: '1px solid rgba(16,185,129,0.25)',
                                                                                            fontWeight: 700, fontSize: '0.72rem', height: 26
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        disabled={isAdded}
                                                                                        onClick={() => handleAddToCart(enrollment.subject, mIndex)}
                                                                                        sx={{
                                                                                            borderRadius: '10px',
                                                                                            textTransform: 'none',
                                                                                            px: 1.8, py: 0.5,
                                                                                            fontWeight: 700, fontSize: '0.75rem',
                                                                                            minWidth: 100, height: 28,
                                                                                            background: isAdded ? 'rgba(16,185,129,0.15)' : col.bg,
                                                                                            color: isAdded ? '#10b981' : 'white',
                                                                                            border: isAdded ? '1px solid rgba(16,185,129,0.3)' : 'none',
                                                                                            boxShadow: isAdded ? 'none' : `0 4px 12px ${col.text}50`,
                                                                                            '&:hover': { opacity: 0.85, boxShadow: `0 6px 20px ${col.text}60` },
                                                                                            '&.Mui-disabled': {
                                                                                                background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                                                                                border: '1px solid rgba(16,185,129,0.25)'
                                                                                            }
                                                                                        }}
                                                                                        startIcon={isAdded ? <CheckCircleOutline sx={{ fontSize: '14px !important' }} /> : <AddShoppingCart sx={{ fontSize: '14px !important' }} />}
                                                                                    >
                                                                                        {isAdded ? "Added" : "Add to Bill"}
                                                                                    </Button>
                                                                                )}
                                                                            </Box>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                    ) : (
                                        <Box
                                            key="empty"
                                            component={motion.div}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}
                                        >
                                            <Box sx={{
                                                width: 80, height: 80, borderRadius: '24px',
                                                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                                border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Person sx={{ fontSize: 36, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>No student selected</Typography>
                                            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' }}>Search above to begin a transaction</Typography>
                                        </Box>
                                    )}
                                </AnimatePresence>
                            </Box>
                        </Box>
                    </Grid>

                    {/* ─── RIGHT PANE - Bill ─── */}
                    <Grid item xs={12} md={5} lg={4}>
                        <Box sx={{
                            borderRadius: '24px',
                            background: surface,
                            border: `1px solid ${border}`,
                            backdropFilter: 'blur(40px)',
                            minHeight: '78vh',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: isDark ? '0 32px 64px rgba(0,0,0,0.5)' : '0 16px 64px rgba(99,102,241,0.08)',
                            position: 'sticky', top: 24
                        }}>
                            {/* Bill header */}
                            <Box sx={{
                                p: 3, pb: 2.5,
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)'
                                    : 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)',
                                borderBottom: `1px solid ${border}`
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Receipt sx={{ fontSize: 20, color: '#6366f1' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                            Current Bill
                                        </Typography>
                                    </Box>
                                    {cart.length > 0 && (
                                        <Box sx={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 4px 10px rgba(99,102,241,0.4)'
                                        }}>
                                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, fontSize: '0.7rem', lineHeight: 1 }}>{cart.length}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                                    {selectedStudent ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <Person sx={{ fontSize: 13 }} /> {selectedStudent.name}
                                        </Box>
                                    ) : 'Select a student to begin'}
                                </Typography>
                            </Box>

                            {/* Cart items */}
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, pb: 1 }}>
                                <AnimatePresence mode="popLayout">
                                    {cart.length === 0 ? (
                                        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{
                                            p: 4, textAlign: 'center',
                                            border: `1px dashed ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                            borderRadius: '16px', mt: 2
                                        }}>
                                            <AddShoppingCart sx={{ fontSize: 32, color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', mb: 1 }} />
                                            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)', fontWeight: 500 }}>
                                                No items added yet
                                            </Typography>
                                        </Box>
                                    ) : (
                                        cart.map((item, idx) => {
                                            const col = subjectColors[selectedStudent?.enrollments?.findIndex(e => e.subject === item.subject) % subjectColors.length] || subjectColors[0];
                                            return (
                                                <Box
                                                    key={item.id}
                                                    component={motion.div}
                                                    layout
                                                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    sx={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        p: 2, mb: 1.5, borderRadius: '14px',
                                                        background: subtleBg,
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                                                        transition: 'all 0.2s',
                                                        '&:hover': { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{
                                                            width: 8, height: 36, borderRadius: '4px',
                                                            background: col.bg, flexShrink: 0
                                                        }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', fontSize: '0.85rem', lineHeight: 1.3 }}>
                                                                {item.subject}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                                                                {item.monthName}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                            Rs. {item.amount.toLocaleString()}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveFromCart(item.id)}
                                                            sx={{
                                                                width: 26, height: 26,
                                                                color: 'rgba(239,68,68,0.6)',
                                                                '&:hover': { background: 'rgba(239,68,68,0.1)', color: 'rgb(239,68,68)' }
                                                            }}
                                                        >
                                                            <Delete sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </Box>

                            {/* Payment method + total + checkout */}
                            <Box sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${border}` }}>

                                {/* Payment method selector */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                                    {[
                                        { id: 'cash', label: 'Cash', icon: <LocalAtm sx={{ fontSize: 16 }} /> },
                                        { id: 'card', label: 'Card', icon: <CreditCard sx={{ fontSize: 16 }} /> },
                                        { id: 'transfer', label: 'Transfer', icon: <TrendingUp sx={{ fontSize: 16 }} /> },
                                    ].map(method => (
                                        <Box
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            sx={{
                                                flex: 1, py: 1, px: 0.5, borderRadius: '12px', cursor: 'pointer',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4,
                                                border: `1px solid ${paymentMethod === method.id ? 'rgba(99,102,241,0.4)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                                background: paymentMethod === method.id ? 'rgba(99,102,241,0.12)' : subtleBg,
                                                transition: 'all 0.2s',
                                                '&:hover': { background: 'rgba(99,102,241,0.08)' }
                                            }}
                                        >
                                            <Box sx={{ color: paymentMethod === method.id ? '#6366f1' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>{method.icon}</Box>
                                            <Typography variant="caption" sx={{
                                                fontWeight: 700, fontSize: '0.68rem',
                                                color: paymentMethod === method.id ? '#6366f1' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                                            }}>{method.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Total */}
                                <Box sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    p: 2, borderRadius: '14px', mb: 2.5,
                                    background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`
                                }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontWeight: 600, display: 'block' }}>Total Amount</Typography>
                                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', fontSize: '0.7rem' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</Typography>
                                    </Box>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 900, letterSpacing: '-0.03em',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}>
                                        Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                {/* Process button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={cart.length === 0 || isProcessing}
                                    onClick={handleCheckout}
                                    component={motion.button}
                                    whileHover={cart.length > 0 ? { scale: 1.01 } : {}}
                                    whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
                                    sx={{
                                        py: 2, borderRadius: '16px',
                                        fontWeight: 900, fontSize: '1rem',
                                        textTransform: 'none',
                                        letterSpacing: '-0.01em',
                                        background: showSuccess
                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        boxShadow: showSuccess
                                            ? '0 8px 32px rgba(16,185,129,0.4)'
                                            : cart.length > 0 ? '0 8px 32px rgba(99,102,241,0.45)' : 'none',
                                        transition: 'all 0.4s ease',
                                        border: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            boxShadow: '0 12px 40px rgba(99,102,241,0.55)'
                                        },
                                        '&.Mui-disabled': {
                                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                            color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    {isProcessing ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : showSuccess ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckCircle sx={{ fontSize: 20 }} /> Payment Complete!
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            Process Payment
                                            <Box sx={{ display: 'flex', gap: 0.5, opacity: 0.8 }}>
                                                <Download sx={{ fontSize: 16 }} />
                                                <WhatsApp sx={{ fontSize: 16 }} />
                                            </Box>
                                        </Box>
                                    )}
                                </Button>

                                <Typography variant="caption" sx={{
                                    display: 'block', textAlign: 'center', mt: 1.5,
                                    color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
                                    fontSize: '0.7rem'
                                }}>
                                    PDF receipt will auto-download &bull; WhatsApp receipt sent automatically
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.type}
                    variant="filled"
                    sx={{
                        width: '100%', borderRadius: '14px', fontWeight: 600,
                        background: notification.type === 'success'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        boxShadow: notification.type === 'success' ? '0 8px 32px rgba(16,185,129,0.4)' : '0 8px 32px rgba(239,68,68,0.4)'
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}