import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Container, Grid, Paper, Typography, TextField, InputAdornment,
    IconButton, Button, Divider, CircularProgress, alpha, useTheme, Card,
    CardContent, Chip, Avatar, Snackbar, Alert, Tooltip, Badge,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel,
    Switch, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
    Search, AddShoppingCart, PointOfSale, Delete, Download, CheckCircleOutline,
    WhatsApp, Receipt, Person, School, Phone, KeyboardArrowRight, CreditCard,
    LocalAtm, TrendingUp, Close, CheckCircle, PhoneAndroid, Settings, Send
} from '@mui/icons-material';
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

    // SMS Gateway Settings State
    const [smsSettingsOpen, setSmsSettingsOpen] = useState(false);
    const [smsConfig, setSmsConfig] = useState({
        enabled: true,
        url: '',
        user: '',
        token: '',
        simSlot: 1
    });
    const [testMobile, setTestMobile] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const [testAlert, setTestAlert] = useState({ open: false, message: '', severity: 'info' });
    const [saveLoading, setSaveLoading] = useState(false);

    // Post-payment Receipt Dialog
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [lastReceiptData, setLastReceiptData] = useState(null);

    const fetchSmsConfig = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/sms/config`);
            if (data) {
                setSmsConfig({
                    enabled: data.enabled !== false,
                    url: data.url || '',
                    user: data.user || '',
                    token: data.token || '',
                    simSlot: data.simSlot || 1
                });
            }
        } catch (err) {
            console.error("Failed to fetch SMS config", err);
        }
    };

    useEffect(() => {
        fetchSmsConfig();
    }, []);

    const handleSaveSmsConfig = async () => {
        setSaveLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/sms/config`, smsConfig);
            setNotification({ open: true, message: 'Hutch SMS Gateway settings saved successfully!', type: 'success' });
            setSmsSettingsOpen(false);
        } catch (err) {
            setTestAlert({ open: true, message: err.response?.data?.message || err.message, severity: 'error' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSendTestSms = async () => {
        if (!testMobile.trim()) {
            setTestAlert({ open: true, message: 'Please enter a mobile number for the test SMS', severity: 'warning' });
            return;
        }
        setTestLoading(true);
        setTestAlert({ open: false, message: '', severity: 'info' });
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/sms/test`, {
                mobile: testMobile,
                url: smsConfig.url,
                user: smsConfig.user,
                token: smsConfig.token,
                simSlot: smsConfig.simSlot
            });
            setTestAlert({ open: true, message: data.message || 'Test SMS sent successfully!', severity: 'success' });
        } catch (err) {
            setTestAlert({
                open: true,
                message: err.response?.data?.message || 'Failed to reach phone gateway. Check IP address and Wi-Fi.',
                severity: 'error'
            });
        } finally {
            setTestLoading(false);
        }
    };

    const openWhatsAppDirect = (mobile, message) => {
        if (!mobile) return;
        let cleaned = mobile.replace(/[^\d+]/g, '').trim().replace('+', '');
        if (cleaned.startsWith('0')) cleaned = '94' + cleaned.slice(1);
        if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message || '')}`, '_blank');
    };

    const openDefaultSMS = (rawMobile, message) => {
        if (!rawMobile) return;
        let mobile = rawMobile.replace(/[^\d+]/g, '').trim();
        if (mobile.startsWith('+94')) mobile = '0' + mobile.slice(3);
        else if (mobile.startsWith('94') && mobile.length === 11) mobile = '0' + mobile.slice(2);
        else if (mobile.length === 9 && mobile.startsWith('7')) mobile = '0' + mobile;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const separator = isIOS ? '&' : '?';
        window.location.href = `sms:${mobile}${separator}body=${encodeURIComponent(message || '')}`;
    };

    const surface = isDark ? '#111526' : '#ffffff';
    const surfaceHover = isDark ? '#161c32' : '#f8fafc';
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const subtleBg = isDark ? '#0c1020' : '#f1f5f9';

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

    const handleAddDailyToCart = (subjectName, monthIndex, weekIndex) => {
        const fee = subjectsMap[subjectName]?.fee || 0;
        const itemId = `${subjectName}-${monthIndex}-${weekIndex}`;
        if (cart.find(item => item.id === itemId)) return;
        setCart(prev => [...prev, {
            id: itemId,
            subject: subjectName,
            month: monthIndex,
            monthName: monthsList[monthIndex],
            weekIndex: weekIndex,
            weekName: `Day ${weekIndex + 1}`,
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
            const payload = { studentId: selectedStudent._id, items: cart, totalAmount, language: 'si' };
            const res = await axios.post(`${API_BASE_URL}/api/pos/checkout`, payload);
            generateBillPDF(res.data.transaction, 'si');

            const updatedStudent = res.data.student || { ...selectedStudent };
            if (!res.data.student) {
                cart.forEach(item => {
                    const enrollment = updatedStudent.enrollments.find(e => e.subject === item.subject);
                    if (enrollment) {
                        const record = enrollment.monthlyRecords.find(r => r.monthIndex === item.month);
                        if (record) {
                            if (item.weekIndex !== undefined) {
                                const classDaysCount = subjectsMap[item.subject]?.classDaysCount || 5;
                                if (!record.dailyFeesPaid || record.dailyFeesPaid.length === 0) {
                                    record.dailyFeesPaid = Array(classDaysCount).fill(false);
                                } else if (record.dailyFeesPaid.length < classDaysCount) {
                                    while (record.dailyFeesPaid.length < classDaysCount) {
                                        record.dailyFeesPaid.push(false);
                                    }
                                }
                                record.dailyFeesPaid[item.weekIndex] = true;

                                if (!record.attendance || record.attendance.length === 0) {
                                    record.attendance = Array(classDaysCount).fill('pending');
                                } else if (record.attendance.length < classDaysCount) {
                                    while (record.attendance.length < classDaysCount) {
                                        record.attendance.push('pending');
                                    }
                                }
                                record.attendance[item.weekIndex] = 'present';
                            } else {
                                record.feePaid = true;
                            }
                        }
                    }
                });
            }
            setSelectedStudent(updatedStudent);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            let msg = `Payment of Rs. ${totalAmount.toLocaleString()} received. TXN: ${res.data.transaction.transactionId}`;
            if (res.data.smsStatus === 'sent') {
                msg += ' — 📱 SMS receipt sent via Hutch SIM!';
            } else if (res.data.smsStatus === 'failed') {
                msg += ' — ⚠️ SMS gateway unreachable (Check phone Wi-Fi)';
            } else if (res.data.waStatus === 'sent') {
                msg += ' — 💬 WhatsApp receipt sent!';
            }
            setNotification({ open: true, message: msg, type: res.data.smsStatus === 'failed' ? 'warning' : 'success' });

            setLastReceiptData({
                transaction: res.data.transaction,
                student: updatedStudent,
                smsStatus: res.data.smsStatus,
                waStatus: res.data.waStatus,
                waMessage: res.data.waMessage,
                smsMessage: res.data.smsMessage
            });
            setReceiptModalOpen(true);
            setCart([]);

            // Auto-open SMS app on device (Hutch SIM)
            if (updatedStudent.mobile && res.data.smsMessage) {
                openDefaultSMS(updatedStudent.mobile, res.data.smsMessage);
            }
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
                    {/* Stats & SMS Gateway Action */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                            { label: 'Cart Items', value: cart.length, icon: <Receipt sx={{ fontSize: 16 }} />, color: '#6366f1' },
                            { label: 'Total Due', value: `Rs. ${totalAmount.toLocaleString()}`, icon: <LocalAtm sx={{ fontSize: 16 }} />, color: '#10b981' }
                        ].map(stat => (
                            <Box key={stat.label} sx={{
                                px: 2.5, py: 1.5, borderRadius: 3,
                                background: surface, border: `1px solid ${border}`,
                                display: 'flex', alignItems: 'center', gap: 1.5
                            }}>
                                <Box sx={{ color: stat.color, display: 'flex', opacity: 0.8 }}>{stat.icon}</Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', display: 'block', lineHeight: 1 }}>{stat.label}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: stat.color, lineHeight: 1.4 }}>{stat.value}</Typography>
                                </Box>
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            onClick={() => {
                                fetchSmsConfig();
                                setTestAlert({ open: false, message: '', severity: 'info' });
                                setSmsSettingsOpen(true);
                            }}
                            startIcon={<PhoneAndroid sx={{ color: '#10b981' }} />}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                px: 2, py: 1.4,
                                border: `1px solid ${border}`,
                                background: surface,
                                color: isDark ? '#f1f5f9' : '#0f172a',
                                '&:hover': {
                                    borderColor: '#10b981',
                                    background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)'
                                }
                            }}
                        >
                            Hutch SMS Gateway
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>

                    {/* ─── LEFT PANE ─── */}
                    <Grid item xs={12} md={7} lg={8}>
                        <Box sx={{
                            borderRadius: '24px',
                            background: surface,
                            border: `1px solid ${border}`,
                            overflow: 'hidden',
                            minHeight: '78vh',
                            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)',
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
                                                background: isDark ? '#141724' : '#ffffff',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.1)',
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

                                            {/* Quick Multi-Subject Add Bar */}
                                            {(() => {
                                                const unpaidCurrentMonth = (selectedStudent.enrollments || []).filter(e => {
                                                    if (e.isFreeCard) return false;
                                                    const rec = (e.monthlyRecords || []).find(r => r.monthIndex === currentMonth);
                                                    return !rec?.feePaid;
                                                });
                                                const notInCart = unpaidCurrentMonth.filter(e => !cart.some(c => c.subject === e.subject && c.month === currentMonth));

                                                if (unpaidCurrentMonth.length === 0) return null;

                                                return (
                                                    <Box sx={{
                                                        p: 2, mb: 3, borderRadius: '16px',
                                                        background: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.08) 100%)' : 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.05) 100%)',
                                                        border: '1px solid rgba(16,185,129,0.3)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{
                                                                width: 36, height: 36, borderRadius: '10px',
                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <PointOfSale sx={{ fontSize: 20 }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                                                    ⚡ Quick Pay for {monthsList[currentMonth]}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                                                                    {unpaidCurrentMonth.length} unpaid subjects ({unpaidCurrentMonth.map(s => s.subject).join(', ')})
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                disabled={notInCart.length === 0}
                                                                onClick={() => {
                                                                    notInCart.forEach(e => {
                                                                        handleAddToCart(e.subject, currentMonth);
                                                                    });
                                                                }}
                                                                sx={{
                                                                    borderRadius: '10px', textTransform: 'none', fontWeight: 800, fontSize: '0.78rem',
                                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                    boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                                                                    color: 'white', px: 2
                                                                }}
                                                            >
                                                                {notInCart.length === 0 ? "All Added to Bill" : `Add All Unpaid to Bill (${notInCart.length})`}
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                );
                                            })()}

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
                                                                            {enrollment.subject} {enrollment.isFreeCard && <Box component="span" sx={{ ml: 1, px: 0.8, py: 0.2, borderRadius: '5px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', fontSize: '0.65rem', fontWeight: 700 }}>Free Card</Box>}
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
                                                                        const isDaily = subjectInfo?.feeType === 'daily';

                                                                        if (isDaily) {
                                                                            return (
                                                                                <Box key={mIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: col.text, fontSize: '0.85rem', mb: 0.5 }}>
                                                                                        {monthsList[mIndex]}
                                                                                        {mIndex === currentMonth && (
                                                                                            <Box component="span" sx={{ ml: 1, px: 0.8, py: 0.2, borderRadius: '5px', background: 'rgba(99,102,241,0.15)', color: '#6366f1', fontSize: '0.65rem', fontWeight: 700 }}>current</Box>
                                                                                        )}
                                                                                    </Typography>
                                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                                        {Array.from({ length: Math.max(record?.dailyFeesPaid?.length || 0, subjectInfo?.classDaysCount || 5) }).map((_, wIndex) => {
                                                                                            const isWeekPaid = record?.dailyFeesPaid ? record.dailyFeesPaid[wIndex] : false;
                                                                                            const isWeekAdded = cart.some(c => c.id === `${enrollment.subject}-${mIndex}-${wIndex}`);
                                                                                            
                                                                                            if (enrollment.isFreeCard) {
                                                                                                return (
                                                                                                    <Chip
                                                                                                        key={wIndex}
                                                                                                        label={`D${wIndex + 1} Free`}
                                                                                                        size="small"
                                                                                                        sx={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)', fontWeight: 700, fontSize: '0.72rem' }}
                                                                                                    />
                                                                                                );
                                                                                            }

                                                                                            if (isWeekPaid) {
                                                                                                return (
                                                                                                    <Chip
                                                                                                        key={wIndex}
                                                                                                        icon={<CheckCircle sx={{ fontSize: '12px !important', color: '#10b981 !important' }} />}
                                                                                                        label={`D${wIndex + 1} Paid`}
                                                                                                        size="small"
                                                                                                        sx={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 700, fontSize: '0.72rem' }}
                                                                                                    />
                                                                                                );
                                                                                            }

                                                                                            return (
                                                                                                <Button
                                                                                                    key={wIndex}
                                                                                                    variant="outlined"
                                                                                                    size="small"
                                                                                                    disabled={isWeekAdded}
                                                                                                    onClick={() => handleAddDailyToCart(enrollment.subject, mIndex, wIndex)}
                                                                                                    sx={{
                                                                                                        borderRadius: '8px',
                                                                                                        textTransform: 'none',
                                                                                                        px: 1, py: 0.2,
                                                                                                        fontWeight: 700, fontSize: '0.72rem',
                                                                                                        minWidth: 70, height: 26,
                                                                                                        borderColor: isWeekAdded ? 'rgba(16,185,129,0.3)' : col.border,
                                                                                                        color: isWeekAdded ? '#10b981' : col.text,
                                                                                                        background: isWeekAdded ? 'rgba(16,185,129,0.1)' : 'transparent',
                                                                                                        '&:hover': { background: col.light, borderColor: col.text }
                                                                                                    }}
                                                                                                >
                                                                                                    {isWeekAdded ? `D${wIndex + 1} Added` : `Pay D${wIndex + 1}`}
                                                                                                </Button>
                                                                                            );
                                                                                        })}
                                                                                    </Box>
                                                                                </Box>
                                                                            );
                                                                        }

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
                                                                                ) : enrollment.isFreeCard ? (
                                                                                    <Chip
                                                                                        label="Free Card"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            background: 'rgba(168,85,247,0.1)', color: '#a855f7',
                                                                                            border: '1px solid rgba(168,85,247,0.25)',
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
                            minHeight: '78vh',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.06)',
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
                                                                {item.monthName}{item.weekName ? ` - ${item.weekName}` : ''}
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

            {/* ─── SMS GATEWAY SETTINGS DIALOG ─── */}
            <Dialog
                open={smsSettingsOpen}
                onClose={() => setSmsSettingsOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        background: isDark ? '#111526' : '#ffffff',
                        border: `1px solid ${border}`,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex' }}>
                        <PhoneAndroid sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>Hutch SIM SMS Gateway</Typography>
                        <Typography variant="caption" color="text.secondary">Send automated SMS receipts using your phone's SIM bundle</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
                    <Alert severity="info" sx={{ borderRadius: 3, fontSize: '0.82rem' }}>
                        <strong>Easy Setup:</strong><br />
                        1. Put your Hutch SIM in any Android phone connected to this Wi-Fi router.<br />
                        2. Install <strong>Android SMS Gateway</strong> (by capcom6) or <strong>Traccar SMS Gateway</strong>.<br />
                        3. Open the app, press <strong>Start</strong>, and copy the IP URL shown on the phone below.
                    </Alert>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={smsConfig.enabled}
                                onChange={(e) => setSmsConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                                color="success"
                            />
                        }
                        label={<Typography fontWeight={700}>Enable Automated Hutch SMS Receipts</Typography>}
                    />

                    <TextField
                        fullWidth
                        label="Phone Gateway URL / IP Address"
                        placeholder="http://192.168.1.50:8080"
                        value={smsConfig.url}
                        onChange={(e) => setSmsConfig(prev => ({ ...prev, url: e.target.value }))}
                        helperText="The local IP address shown on your Android SMS Gateway app"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                                <InputLabel>SIM Card Slot</InputLabel>
                                <Select
                                    label="SIM Card Slot"
                                    value={smsConfig.simSlot}
                                    onChange={(e) => setSmsConfig(prev => ({ ...prev, simSlot: e.target.value }))}
                                >
                                    <MenuItem value={1}>SIM 1 (Hutch)</MenuItem>
                                    <MenuItem value={2}>SIM 2 (Hutch)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="App Password / Token (Optional)"
                                type="password"
                                placeholder="Leave blank if none"
                                value={smsConfig.token}
                                onChange={(e) => setSmsConfig(prev => ({ ...prev, token: e.target.value }))}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 0.5 }} />

                    {/* Test SMS Section */}
                    <Box sx={{
                        p: 2, borderRadius: 3,
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: `1px dashed ${border}`
                    }}>
                        <Typography variant="subtitle2" fontWeight={800} mb={1}>
                            Test Phone Connection
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                                size="small"
                                placeholder="e.g. 078XXXXXXX"
                                value={testMobile}
                                onChange={(e) => setTestMobile(e.target.value)}
                                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                            />
                            <Button
                                variant="contained"
                                color="success"
                                disabled={testLoading}
                                onClick={handleSendTestSms}
                                startIcon={testLoading ? <CircularProgress size={16} color="inherit" /> : <Send sx={{ fontSize: 16 }} />}
                                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5 }}
                            >
                                Send Test
                            </Button>
                        </Box>
                        {testAlert.open && (
                            <Alert severity={testAlert.severity} sx={{ mt: 1.5, borderRadius: 2 }}>
                                {testAlert.message}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
                    <Button onClick={() => setSmsSettingsOpen(false)} sx={{ borderRadius: 2.5, textTransform: 'none', color: 'text.secondary' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveSmsConfig}
                        disabled={saveLoading}
                        sx={{
                            borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                    >
                        {saveLoading ? <CircularProgress size={18} color="inherit" /> : 'Save Settings'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── POST-PAYMENT RECEIPT DIALOG ─── */}
            <Dialog
                open={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        background: isDark ? '#111526' : '#ffffff',
                        border: `1px solid ${border}`,
                        textAlign: 'center',
                        p: 2.5
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%',
                        bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CheckCircle sx={{ fontSize: 40 }} />
                    </Box>
                </Box>
                <Typography variant="h5" fontWeight={900}>Payment Complete!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {lastReceiptData?.student?.name} &bull; {lastReceiptData?.student?.indexNumber}
                </Typography>

                <Box sx={{
                    p: 2, borderRadius: 3, mb: 2.5,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${border}`,
                    textAlign: 'left'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Receipt No:</Typography>
                        <Typography variant="caption" fontWeight={700} fontFamily="monospace">{lastReceiptData?.transaction?.transactionId}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Total Paid:</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="#10b981">Rs. {lastReceiptData?.transaction?.totalAmount?.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Hutch SMS:</Typography>
                        <Chip
                            size="small"
                            label={lastReceiptData?.smsStatus === 'sent' ? 'Sent to Parent' : lastReceiptData?.smsStatus === 'failed' ? 'Failed / Unreachable' : 'Skipped'}
                            color={lastReceiptData?.smsStatus === 'sent' ? 'success' : lastReceiptData?.smsStatus === 'failed' ? 'error' : 'default'}
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {lastReceiptData?.student?.mobile && (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => openDefaultSMS(lastReceiptData.student.mobile, lastReceiptData.smsMessage)}
                            startIcon={<PhoneAndroid />}
                            sx={{
                                py: 1.3, borderRadius: 3, textTransform: 'none', fontWeight: 700,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            Open in SMS App (Hutch SIM)
                        </Button>
                    )}

                    {lastReceiptData?.student?.mobile && (
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => openWhatsAppDirect(lastReceiptData.student.mobile, lastReceiptData.waMessage)}
                            startIcon={<WhatsApp />}
                            sx={{
                                py: 1.2, borderRadius: 3, textTransform: 'none', fontWeight: 700,
                                borderColor: '#25D366', color: '#25D366',
                                '&:hover': { borderColor: '#128C7E', bgcolor: 'rgba(37, 211, 102, 0.08)' }
                            }}
                        >
                            Send via WhatsApp (Optional)
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => generateBillPDF(lastReceiptData.transaction)}
                        startIcon={<Download />}
                        sx={{ py: 1.2, borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
                    >
                        Re-Download PDF Receipt
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => setReceiptModalOpen(false)}
                        sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
                    >
                        Done & Close
                    </Button>
                </Box>
            </Dialog>

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