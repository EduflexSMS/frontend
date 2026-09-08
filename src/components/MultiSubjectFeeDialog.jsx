import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Checkbox, Chip, IconButton,
    Divider, CircularProgress, Alert, Stack,
    Paper, useTheme
} from '@mui/material';
import {
    Close, CheckCircle, MonetizationOn, Send, PhoneAndroid,
    WhatsApp, PictureAsPdf, SelectAll, ClearAll,
    CalendarMonth, ErrorOutline
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { generateBillPDF } from '../utils/generateBillPDF';

const monthsListEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthsListSi = ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"];

export const openWhatsAppDirect = (mobile, message) => {
    if (!mobile) return;
    let cleaned = mobile.replace(/[^\d+]/g, '').trim().replace('+', '');
    if (cleaned.startsWith('0')) cleaned = '94' + cleaned.slice(1);
    if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message || '')}`, '_blank');
};

export const openDefaultSMS = (rawMobile, message) => {
    if (!rawMobile) return;
    let mobile = rawMobile.replace(/[^\d+]/g, '').trim();
    if (mobile.startsWith('+94')) mobile = '0' + mobile.slice(3);
    else if (mobile.startsWith('94') && mobile.length === 11) mobile = '0' + mobile.slice(2);
    else if (mobile.length === 9 && mobile.startsWith('7')) mobile = '0' + mobile;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${mobile}${separator}body=${encodeURIComponent(message || '')}`;
};

export default function MultiSubjectFeeDialog({
    open,
    onClose,
    student,
    subjectColors = {},
    onPaymentComplete,
    initialMonth,
    preSelectedSubject
}) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const currentMonthIndex = new Date().getMonth();
    const [selectedMonth, setSelectedMonth] = useState(initialMonth !== undefined ? initialMonth : currentMonthIndex);
    const [selectedSubjectMap, setSelectedSubjectMap] = useState({});
    const [language, setLanguage] = useState('si'); // 'si' or 'en'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [receiptData, setReceiptData] = useState(null);

    // Sync month & selections when dialog opens or initialMonth/preSelectedSubject changes
    useEffect(() => {
        if (open && student) {
            const m = initialMonth !== undefined ? initialMonth : currentMonthIndex;
            setSelectedMonth(m);
            setError('');
            setReceiptData(null);

            // Pre-select subjects
            const newMap = {};
            (student.enrollments || []).forEach(e => {
                const rec = (e.monthlyRecords || []).find(r => r.monthIndex === m);
                const isPaid = rec?.feePaid;
                const isFree = e.isFreeCard;

                if (!isPaid && !isFree) {
                    if (preSelectedSubject) {
                        newMap[e.subject] = e.subject === preSelectedSubject;
                    } else {
                        // By default select all unpaid
                        newMap[e.subject] = true;
                    }
                } else {
                    newMap[e.subject] = false;
                }
            });
            setSelectedSubjectMap(newMap);
        }
    }, [open, student, initialMonth, preSelectedSubject, currentMonthIndex]);

    // When month is changed within dialog, re-evaluate default selections
    const handleMonthChange = (newMonth) => {
        setSelectedMonth(newMonth);
        setError('');
        if (!student) return;

        const newMap = {};
        (student.enrollments || []).forEach(e => {
            const rec = (e.monthlyRecords || []).find(r => r.monthIndex === newMonth);
            const isPaid = rec?.feePaid;
            const isFree = e.isFreeCard;
            if (!isPaid && !isFree) {
                newMap[e.subject] = true;
            } else {
                newMap[e.subject] = false;
            }
        });
        setSelectedSubjectMap(newMap);
    };

    // Toggle individual subject selection
    const handleToggleSubject = (subjectName) => {
        setSelectedSubjectMap(prev => ({
            ...prev,
            [subjectName]: !prev[subjectName]
        }));
    };

    // Quick select all unpaid
    const handleSelectAllUnpaid = () => {
        if (!student) return;
        const newMap = {};
        (student.enrollments || []).forEach(e => {
            const rec = (e.monthlyRecords || []).find(r => r.monthIndex === selectedMonth);
            const isPaid = rec?.feePaid;
            const isFree = e.isFreeCard;
            if (!isPaid && !isFree) {
                newMap[e.subject] = true;
            } else {
                newMap[e.subject] = false;
            }
        });
        setSelectedSubjectMap(newMap);
    };

    const handleClearAll = () => {
        const newMap = {};
        Object.keys(selectedSubjectMap).forEach(k => { newMap[k] = false; });
        setSelectedSubjectMap(newMap);
    };

    // Calculate totals and items to pay
    const { itemsToPay, totalAmount, unpaidCount } = useMemo(() => {
        if (!student) return { itemsToPay: [], totalAmount: 0, unpaidCount: 0 };

        let total = 0;
        let unpaid = 0;
        const items = [];

        (student.enrollments || []).forEach(e => {
            const rec = (e.monthlyRecords || []).find(r => r.monthIndex === selectedMonth);
            const isPaid = rec?.feePaid;
            const isFree = e.isFreeCard;
            const fee = subjectColors?.[e.subject]?.fee || 0;

            if (!isPaid && !isFree) {
                unpaid++;
                if (selectedSubjectMap[e.subject]) {
                    total += fee;
                    items.push({
                        subject: e.subject,
                        month: selectedMonth,
                        monthName: monthsListEn[selectedMonth],
                        amount: fee
                    });
                }
            }
        });

        return { itemsToPay: items, totalAmount: total, unpaidCount: unpaid };
    }, [student, selectedMonth, selectedSubjectMap, subjectColors]);

    // Live preview of the single combined message
    const messagePreview = useMemo(() => {
        if (!student || itemsToPay.length === 0) return '';

        const monthName = language === 'si' ? monthsListSi[selectedMonth] : monthsListEn[selectedMonth];
        const dateStr = new Date().toLocaleDateString();

        if (language === 'si') {
            let msg = `Eduflex පන්ති ගාස්තු ලදුපත:\n`;
            msg += `සිසුවා: ${student.name} (${student.indexNumber})\n`;
            msg += `අංකය: TXN-XXXX\n`;
            msg += `මාසය: ${monthName}\n\n`;
            msg += `ගෙවූ විෂයන්:\n`;
            itemsToPay.forEach(item => {
                msg += `- ${item.subject}: රු. ${item.amount.toLocaleString()}\n`;
            });
            msg += `\nමුළු මුදල: රු. ${totalAmount.toLocaleString()}\n`;
            msg += `දිනය: ${dateStr}\n`;
            msg += `ස්තූතියි! Eduflex Institute`;
            return msg;
        } else {
            let msg = `Eduflex Receipt:\n`;
            msg += `Student: ${student.name} (${student.indexNumber})\n`;
            msg += `Receipt: TXN-XXXX\n`;
            msg += `Month: ${monthName}\n\n`;
            msg += `Paid Subjects:\n`;
            itemsToPay.forEach(item => {
                msg += `- ${item.subject}: Rs. ${item.amount.toLocaleString()}\n`;
            });
            msg += `\nTotal: Rs. ${totalAmount.toLocaleString()}\n`;
            msg += `Date: ${dateStr}\n`;
            msg += `Thank you! Eduflex`;
            return msg;
        }
    }, [student, itemsToPay, selectedMonth, totalAmount, language]);

    // Process checkout
    const handleConfirmPayment = async () => {
        if (!student || itemsToPay.length === 0) return;

        setLoading(true);
        setError('');
        try {
            const payload = {
                studentId: student._id,
                items: itemsToPay,
                totalAmount,
                language
            };

            const res = await axios.post(`${API_BASE_URL}/api/pos/checkout`, payload);

            setReceiptData({
                transaction: res.data.transaction,
                student: res.data.student || student,
                smsStatus: res.data.smsStatus,
                waStatus: res.data.waStatus,
                smsMessage: res.data.smsMessage,
                waMessage: res.data.waMessage,
                studentMobile: res.data.studentMobile || student.mobile
            });

            // Auto trigger native SMS on supported device
            if (student.mobile && res.data.smsMessage) {
                openDefaultSMS(student.mobile, res.data.smsMessage);
            }

            // Notify parent to update local state immediately
            if (onPaymentComplete) {
                onPaymentComplete(res.data.student, res.data);
            }
        } catch (err) {
            console.error("Multi-subject fee payment failed:", err);
            setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog
            open={open}
            onClose={() => !loading && onClose()}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    background: isDark ? '#0f1322' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                p: 2.5, pb: 1.5,
                background: isDark ? 'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 42, height: 42, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
                    }}>
                        <MonetizationOn sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                            {receiptData ? "Payment Complete! / ගෙවීම සාර්ථකයි" : "Mark Fee Payment / ගාස්තු ගෙවීම"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', fontWeight: 500 }}>
                            {student.name} • {student.indexNumber} • {student.grade}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ opacity: isDark ? 0.1 : 0.08 }} />

            <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* ─── SUCCESS / RECEIPT VIEW ─── */}
                {receiptData ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
                        <Box sx={{
                            textAlign: 'center', p: 3, borderRadius: '16px',
                            background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
                            border: '1px solid rgba(16,185,129,0.25)'
                        }}>
                            <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                                Rs. {receiptData.transaction?.totalAmount?.toLocaleString()} Received!
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', mt: 0.5 }}>
                                Receipt No: <strong>{receiptData.transaction?.transactionId}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', mt: 0.5 }}>
                                {receiptData.transaction?.items?.length || 0} subjects marked as paid for {monthsListEn[selectedMonth]}
                            </Typography>

                            {/* Gateway Status Pill */}
                            <Box sx={{ mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '20px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    📱 Hutch SIM SMS:
                                </Typography>
                                <Chip
                                    label={receiptData.smsStatus === 'sent' ? 'Dispatched' : receiptData.smsStatus === 'skipped' ? 'Skipped (Offline)' : 'Failed'}
                                    size="small"
                                    color={receiptData.smsStatus === 'sent' ? 'success' : 'default'}
                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                                />
                            </Box>
                        </Box>

                        {/* Direct Notification Buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                                Quick Delivery & Receipt Options:
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PhoneAndroid />}
                                onClick={() => openDefaultSMS(receiptData.studentMobile, receiptData.smsMessage)}
                                sx={{
                                    borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                                }}
                            >
                                Open SMS App on Device (තනි SMS පණිවිඩය)
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<WhatsApp />}
                                onClick={() => openWhatsAppDirect(receiptData.studentMobile, receiptData.waMessage || receiptData.smsMessage)}
                                sx={{
                                    borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700,
                                    color: '#22c55e', borderColor: 'rgba(34,197,94,0.4)',
                                    background: 'rgba(34,197,94,0.06)',
                                    '&:hover': { background: 'rgba(34,197,94,0.12)', borderColor: '#22c55e' }
                                }}
                            >
                                Send via WhatsApp (වට්ස්ඇප් යවන්න)
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<PictureAsPdf />}
                                onClick={() => generateBillPDF(receiptData.transaction, language)}
                                sx={{
                                    borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700,
                                    color: '#06b6d4', borderColor: 'rgba(6,182,212,0.4)',
                                    background: 'rgba(6,182,212,0.06)',
                                    '&:hover': { background: 'rgba(6,182,212,0.12)', borderColor: '#06b6d4' }
                                }}
                            >
                                Download / Print Bill PDF
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    /* ─── PAYMENT SELECTION FORM ─── */
                    <>
                        {error && (
                            <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}

                        {/* Month Selector */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                                    Select Month / මාසය තෝරන්න:
                                </Typography>
                                <Chip
                                    icon={<CalendarMonth sx={{ fontSize: '14px !important' }} />}
                                    label={language === 'si' ? monthsListSi[selectedMonth] : monthsListEn[selectedMonth]}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, scrollbarWidth: 'thin' }}>
                                {monthsListEn.map((mName, idx) => {
                                    const isSelected = selectedMonth === idx;
                                    const isCurrent = idx === currentMonthIndex;
                                    return (
                                        <Button
                                            key={mName}
                                            size="small"
                                            onClick={() => handleMonthChange(idx)}
                                            variant={isSelected ? "contained" : "outlined"}
                                            sx={{
                                                minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: '10px',
                                                textTransform: 'none', fontWeight: isSelected ? 800 : 500,
                                                fontSize: '0.75rem', flexShrink: 0,
                                                background: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                                                borderColor: isSelected ? 'transparent' : isCurrent ? 'rgba(99,102,241,0.4)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                color: isSelected ? 'white' : isCurrent ? '#6366f1' : 'inherit'
                                            }}
                                        >
                                            {mName.slice(0, 3)}
                                            {isCurrent && !isSelected && ' •'}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </Box>

                        <Divider sx={{ opacity: isDark ? 0.08 : 0.06 }} />

                        {/* Subject Selection Section */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                                    Enrolled Subjects ({student.enrollments?.length || 0}):
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        startIcon={<SelectAll sx={{ fontSize: '14px !important' }} />}
                                        onClick={handleSelectAllUnpaid}
                                        disabled={unpaidCount === 0}
                                        sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, py: 0.2, px: 1, color: '#10b981' }}
                                    >
                                        Select All Unpaid
                                    </Button>
                                    <Button
                                        size="small"
                                        startIcon={<ClearAll sx={{ fontSize: '14px !important' }} />}
                                        onClick={handleClearAll}
                                        disabled={itemsToPay.length === 0}
                                        sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, py: 0.2, px: 1, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                            </Box>

                            {/* Subjects Checklist */}
                            <Stack spacing={1}>
                                {(student.enrollments || []).map((enrollment) => {
                                    const rec = (enrollment.monthlyRecords || []).find(r => r.monthIndex === selectedMonth);
                                    const isPaid = rec?.feePaid;
                                    const isFree = enrollment.isFreeCard;
                                    const fee = subjectColors?.[enrollment.subject]?.fee || 0;
                                    const isChecked = !!selectedSubjectMap[enrollment.subject];
                                    const isDisabled = isPaid || isFree;

                                    return (
                                        <Paper
                                            key={enrollment.subject}
                                            onClick={() => !isDisabled && handleToggleSubject(enrollment.subject)}
                                            elevation={0}
                                            sx={{
                                                p: 1.4, px: 1.8, borderRadius: '14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                cursor: isDisabled ? 'default' : 'pointer',
                                                background: isChecked
                                                    ? isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'
                                                    : isDisabled
                                                    ? isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                                                    : isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                                border: `1.5px solid ${
                                                    isChecked
                                                        ? '#10b981'
                                                        : isDisabled
                                                        ? 'transparent'
                                                        : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
                                                }`,
                                                transition: 'all 0.15s ease',
                                                '&:hover': {
                                                    borderColor: !isDisabled && !isChecked ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)') : undefined
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Checkbox
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={() => handleToggleSubject(enrollment.subject)}
                                                    sx={{
                                                        p: 0,
                                                        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                                        '&.Mui-checked': { color: '#10b981' }
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDisabled ? (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)') : 'inherit' }}>
                                                        {enrollment.subject}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                                                        Rs. {fee.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {isPaid ? (
                                                    <Chip
                                                        icon={<CheckCircle sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
                                                        label="Already Paid"
                                                        size="small"
                                                        sx={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }}
                                                    />
                                                ) : isFree ? (
                                                    <Chip
                                                        label="Free Card"
                                                        size="small"
                                                        sx={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontWeight: 700, fontSize: '0.7rem' }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: isChecked ? '#10b981' : isDark ? '#f8fafc' : '#0f172a' }}>
                                                        Rs. {fee.toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Box>

                        {/* Summary & Live SMS Preview */}
                        <Box sx={{
                            p: 2, borderRadius: '16px',
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                        }}>
                            {/* Summary Bar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', display: 'block' }}>
                                        Selected for Payment:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#6366f1' }}>
                                        {itemsToPay.length} {itemsToPay.length === 1 ? 'Subject' : 'Subjects'}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', display: 'block' }}>
                                        Total Fee (මුළු මුදල):
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                                        Rs. {totalAmount.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Language Switcher */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                    Message Language / භාෂාව:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                        size="small"
                                        variant={language === 'si' ? "contained" : "text"}
                                        onClick={() => setLanguage('si')}
                                        sx={{
                                            py: 0.2, px: 1.2, minWidth: 'auto', fontSize: '0.7rem', fontWeight: 700,
                                            borderRadius: '6px',
                                            background: language === 'si' ? '#6366f1' : 'transparent',
                                            color: language === 'si' ? 'white' : 'inherit'
                                        }}
                                    >
                                        සිංහල
                                    </Button>
                                    <Button
                                        size="small"
                                        variant={language === 'en' ? "contained" : "text"}
                                        onClick={() => setLanguage('en')}
                                        sx={{
                                            py: 0.2, px: 1.2, minWidth: 'auto', fontSize: '0.7rem', fontWeight: 700,
                                            borderRadius: '6px',
                                            background: language === 'en' ? '#6366f1' : 'transparent',
                                            color: language === 'en' ? 'white' : 'inherit'
                                        }}
                                    >
                                        English
                                    </Button>
                                </Box>
                            </Box>

                            {/* Message Preview Box */}
                            {itemsToPay.length > 0 && (
                                <Box sx={{
                                    mt: 1.5, p: 1.5, borderRadius: '10px',
                                    background: isDark ? '#080a12' : '#ffffff',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                                }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Send sx={{ fontSize: 12 }} /> Single Combined SMS Preview:
                                    </Typography>
                                    <Typography
                                        component="pre"
                                        sx={{
                                            m: 0, fontSize: '0.72rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            color: isDark ? 'rgba(255,255,255,0.85)' : '#334155'
                                        }}
                                    >
                                        {messagePreview}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>

            <Divider sx={{ opacity: isDark ? 0.1 : 0.08 }} />

            {/* Actions */}
            <DialogActions sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                >
                    {receiptData ? "Close / අවසන්" : "Cancel"}
                </Button>

                {!receiptData && (
                    <Button
                        variant="contained"
                        disabled={loading || itemsToPay.length === 0}
                        onClick={handleConfirmPayment}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <MonetizationOn />}
                        sx={{
                            borderRadius: '12px', px: 3, py: 1, textTransform: 'none', fontWeight: 800,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                boxShadow: '0 6px 20px rgba(16,185,129,0.5)'
                            }
                        }}
                    >
                        {loading
                            ? "Marking Payment..."
                            : itemsToPay.length === 0
                            ? "Select Subjects"
                            : `Mark Paid & Send SMS (Rs. ${totalAmount.toLocaleString()})`}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
