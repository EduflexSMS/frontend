import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Box, Container, Grid, Paper, Typography, LinearProgress, Chip, Avatar,
    useTheme, alpha, CircularProgress, Alert, Button, IconButton, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableRow, TableHead,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Divider, Card, CardContent,
    Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School, EventAvailable, MonetizationOn, CheckCircle, HourglassEmpty,
    Assessment, Download, Language, DarkMode, LightMode, ArrowBack, Logout,
    Print, Phone, WhatsApp, LocationOn, AccessTime, MenuBook, EmojiEvents,
    Verified, NotificationsActive, Refresh, WarningAmber, Person,
    CalendarMonth, QrCodeScanner, Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ThemeContext } from '../contexts/ThemeContext';
import logo from '../assets/logo.jpg';

// ─── BILINGUAL STRINGS ────────────────────────────────────────────────────────
const STRINGS = {
    en: {
        portal_title: 'Student & Parent Portal',
        institute_subtitle: 'EduFlex Higher Education Institute',
        back: 'Back',
        logout: 'Logout',
        logout_confirm: 'Are you sure you want to log out?',
        cancel: 'Cancel',
        active_student: 'Active Student',
        student_id: 'Student ID',
        grade: 'Grade',
        mobile: 'Contact',
        school: 'School',
        show_id: 'Digital ID & QR',
        overall_attendance: 'Overall Attendance',
        attendance_status_good: 'Regular Attendance',
        attendance_status_warn: 'Low Attendance',
        days_attended: 'Days Attended',
        total_sessions: 'Total Sessions',
        current_fees: 'Monthly Fee Status',
        all_paid: 'All Fees Settled',
        pending_fees: 'Fee Payment Pending',
        enrolled_subjects: 'Enrolled Subjects',
        exam_perf: 'Exam Performance',
        avg_marks: 'Average Marks',
        top_rank: 'Best Rank',
        tab_subjects: 'Subjects & Timetable',
        tab_fees: 'Fees & Receipts',
        tab_exams: 'Exam Results',
        tab_attendance: 'Monthly Attendance',
        tab_tutes: 'Tutes & Materials',
        tab_notices: 'Notices & Helpline',
        teacher: 'Tutor / Faculty',
        schedule: 'Class Schedule',
        fee_amount: 'Monthly Fee',
        status: 'Status',
        paid: 'Paid',
        pending: 'Pending',
        free_card: 'Free Card',
        not_enrolled: 'Not Enrolled',
        month: 'Month',
        receipt: 'Receipt',
        download_receipt: 'Receipt PDF',
        exam_title: 'Exam / Test Title',
        date: 'Date',
        marks: 'Marks',
        rank: 'Class Rank',
        out_of: 'out of',
        students: 'students',
        tute_status: 'Study Material Status',
        monthly_tute: 'Monthly Tutorial',
        term_tutes: 'Term Evaluation Books',
        issued: 'Issued & Collected',
        not_issued: 'Pending Collection',
        institute_info: 'Institute Help Desk',
        hotline: 'Hotline',
        whatsapp: 'WhatsApp Support',
        address: 'Campus Address',
        office_hours: 'Office Hours',
        print_id: 'Print ID Card',
        close: 'Close',
        refresh: 'Refresh Data',
        no_exams: 'No examination records found yet.',
        no_notices: 'No active notices at the moment.',
        id_card_note: 'Present this digital QR code to the entrance security scanner for quick attendance.'
    },
    si: {
        portal_title: 'ශිෂ්‍ය සහ දෙමාපිය පෝර්ටලය',
        institute_subtitle: 'EduFlex උසස් අධ්‍යාපන ආයතනය',
        back: 'ආපසු',
        logout: 'ඉවත් වන්න',
        logout_confirm: 'ඔබට පද්ධතියෙන් ඉවත් වීමට අවශ්‍යද?',
        cancel: 'අවලංගු කරන්න',
        active_student: 'සක්‍රීය ශිෂ්‍ය',
        student_id: 'ශිෂ්‍ය අංකය',
        grade: 'ශ්‍රේණිය',
        mobile: 'දුරකථන අංකය',
        school: 'පාසල',
        show_id: 'Digital හැඳුනුම්පත & QR',
        overall_attendance: 'පැමිණීමේ ප්‍රතිශතය',
        attendance_status_good: 'යහපත් පැමිණීම',
        attendance_status_warn: 'පැමිණීම ප්‍රමාණවත් නොවේ',
        days_attended: 'පැමිණි දින',
        total_sessions: 'පැවැත්වූ පන්ති',
        current_fees: 'මාසික ගාස්තු තත්ත්වය',
        all_paid: 'සියලු ගාස්තු ගෙවා ඇත',
        pending_fees: 'ගෙවීමට ඉතිරිව ඇත',
        enrolled_subjects: 'ලියාපදිංචි විෂයන්',
        exam_perf: 'විභාග සාමාර්ථ',
        avg_marks: 'සාමාන්‍ය ලකුණු',
        top_rank: 'විශිෂ්ටතම ස්ථානය',
        tab_subjects: 'විෂයන් & කාලසටහන',
        tab_fees: 'පන්ති ගාස්තු & රිසිට්පත්',
        tab_exams: 'විභාග ප්‍රතිඵල',
        tab_attendance: 'මාසික පැමිණීම',
        tab_tutes: 'ටියුට් & පොත්පත්',
        tab_notices: 'දැනුම්දීම් & සහය',
        teacher: 'ආචාර්ය භවතා',
        schedule: 'පන්ති දිනය / වේලාව',
        fee_amount: 'මාසික ගාස්තුව',
        status: 'තත්ත්වය',
        paid: 'ගෙවා ඇත',
        pending: 'නොගෙවූ',
        free_card: 'නිදහස් කාඩ්පත්',
        not_enrolled: 'සම්බන්ධ වී නැත',
        month: 'මාසය',
        receipt: 'රිසිට්පත',
        download_receipt: 'රිසිට්පත (PDF)',
        exam_title: 'විභාගය / පරීක්ෂණය',
        date: 'දිනය',
        marks: 'ලකුණු',
        rank: 'පන්තියේ ස්ථානය',
        out_of: 'අතුරින්',
        students: 'සිසුන්',
        tute_status: 'නිබන්ධන සහ පොත්පත් ලැබුණු තත්ත්වය',
        monthly_tute: 'මාසික නිබන්ධන',
        term_tutes: 'වාර පරීක්ෂණ පොත්',
        issued: 'ලබා දී ඇත',
        not_issued: 'ලබා ගැනීමට ඇත',
        institute_info: 'ආයතනික උපකාරක සේවාව',
        hotline: 'ක්ෂණික ඇමතුම්',
        whatsapp: 'WhatsApp සේවාව',
        address: 'ලිපිනය',
        office_hours: 'විවෘත වේලාවන්',
        print_id: 'හැඳුනුම්පත මුද්‍රණය',
        close: 'වසන්න',
        refresh: 'යාවත්කාලීන කරන්න',
        no_exams: 'විභාග වාර්තා මෙතෙක් ඇතුළත් කර නොමැත.',
        no_notices: 'දැනට නව නිවේදන නොමැත.',
        id_card_note: 'ආයතනයට ඇතුළු වීමේදී හා පිටවීමේදී මෙම QR කේතය දොරටුවේ ස්කෑනරයට පෙන්වන්න.'
    }
};

export default function StudentDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleColorMode } = useContext(ThemeContext);
    const isDark = theme.palette.mode === 'dark';

    const [lang, setLang] = useState(() => localStorage.getItem('eduflex_lang') || 'si');
    const [portalData, setPortalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [qrOpen, setQrOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const printRef = useRef();

    const t = STRINGS[lang] || STRINGS.en;

    const toggleLanguage = () => {
        const nextLang = lang === 'si' ? 'en' : 'si';
        setLang(nextLang);
        localStorage.setItem('eduflex_lang', nextLang);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/login');
        }
    };

    const fetchStudentData = async () => {
        setLoading(true);
        setError('');
        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || JSON.parse(localStorage.getItem('userInfo'));
            const studentId = userInfo?.id || userInfo?.username;

            if (!studentId) {
                throw new Error("Student authentication information not found. Please log in.");
            }

            const res = await axios.get(`${API_BASE_URL}/api/portal/student/${encodeURIComponent(studentId)}`);
            setPortalData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading student portal data:", err);
            setError(err.response?.data?.error || err.message || "Failed to load dashboard data. Please try again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    // ── Generate PDF Receipt for paid months ───────────────────────────────────
    const handleDownloadReceipt = (enrollment, record) => {
        if (!portalData) return;
        const doc = new jsPDF();
        const student = portalData.student;

        // Banner Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 42, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUFLEX INSTITUTE', 105, 18, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Fee Payment Receipt / නිල ගාස්තු ගෙවීම් රිසිට්පත', 105, 27, { align: 'center' });

        doc.setFontSize(8);
        doc.text('Student & Parent Portal - Verified Transaction', 105, 34, { align: 'center' });

        // Metadata
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);

        const issueDate = new Date().toLocaleDateString('en-GB');
        doc.text(`Receipt Issue Date: ${issueDate}`, 14, 52);
        doc.text(`Student Name: ${student.name}`, 14, 60);
        doc.text(`Index Number: ${student.indexNumber}`, 14, 68);
        doc.text(`Grade: ${student.grade}`, 14, 76);

        doc.text(`Subject: ${enrollment.subject}`, 130, 60);
        doc.text(`Fee Month: ${record.monthName} (${record.monthNameSi})`, 130, 68);
        doc.text(`Status: PAID (ගෙවා ඇත)`, 130, 76);

        // Payment Table
        doc.autoTable({
            startY: 86,
            head: [['Description', 'Type', 'Amount (LKR)', 'Payment Status']],
            body: [
                [
                    `${enrollment.subject} Tuition Fee - ${record.monthName}`,
                    record.feeType === 'daily' ? 'Daily / Per Session' : 'Monthly Fee',
                    `Rs. ${Number(record.feeAmount || 0).toLocaleString()}`,
                    'VERIFIED PAID'
                ]
            ],
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fontSize: 10 },
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 16;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Paid: Rs. ${Number(record.feeAmount || 0).toLocaleString()}`, 14, finalY);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(110, 110, 110);
        doc.text('This is a computer-generated official receipt from Eduflex Management System. No physical signature required.', 105, finalY + 22, { align: 'center' });

        doc.save(`Eduflex_Receipt_${student.indexNumber}_${record.monthName}.pdf`);
    };

    // Print ID Card
    const handlePrintIdCard = () => {
        window.print();
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                gap: 2
            }}>
                <CircularProgress size={56} sx={{ color: 'primary.main' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    {lang === 'si' ? 'ශිෂ්‍ය විස්තර ලබාගනිමින් පවතී...' : 'Loading Student Profile...'}
                </Typography>
            </Box>
        );
    }

    if (error || !portalData) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6, px: 2 }}>
                <Container maxWidth="sm">
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <WarningAmber sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {lang === 'si' ? 'ගිණුම් දත්ත හමු නොවීය' : 'Profile Unavailable'}
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
                            {error || "Unable to retrieve student profile. Please check credentials or contact admin."}
                        </Alert>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button variant="outlined" onClick={fetchStudentData} startIcon={<Refresh />}>
                                {t.refresh}
                            </Button>
                            <Button variant="contained" onClick={() => navigate('/login')} startIcon={<Logout />}>
                                {lang === 'si' ? 'නැවත Login වන්න' : 'Return to Login'}
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const { student, enrollments = [], exams = [], institute = {}, notices = [] } = portalData;
    const currentMonthIndex = new Date().getMonth();

    // Calculate aggregate fee status for current month
    let pendingCount = 0;
    let paidCount = 0;
    enrollments.forEach(enr => {
        const curRec = (enr.monthlyRecords || []).find(r => r.monthIndex === currentMonthIndex);
        if (curRec) {
            if (curRec.notEnrolled || enr.isFreeCard) return;
            if (curRec.feePaid) paidCount++;
            else pendingCount++;
        }
    });

    // Calculate exam stats
    const validMarks = exams
        .map(e => Number(e.marks))
        .filter(m => !isNaN(m) && m >= 0);
    const avgMarks = validMarks.length > 0 ? Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length) : null;
    const bestRank = exams.reduce((min, e) => (e.rank && e.rank !== 'N/A' && (min === null || e.rank < min)) ? e.rank : min, null);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary',
            pb: 8
        }}>
            {/* ── TOP NAVIGATION BAR ── */}
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backdropFilter: 'blur(16px)',
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    px: { xs: 2, md: 4 }
                }}
            >
                <Container maxWidth="xl" sx={{ p: '0 !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        {/* Left: Back Button & Logo Brand */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Tooltip title={t.back}>
                                <IconButton
                                    onClick={handleBack}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                        '&:hover': { bgcolor: 'primary.main', color: '#fff' }
                                    }}
                                >
                                    <ArrowBack fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Avatar
                                src={logo}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    fontWeight: 'bold'
                                }}
                            >
                                E
                            </Avatar>

                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, letterSpacing: -0.3 }}>
                                    EduFlex
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {t.portal_title}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Right: Controls (Language Toggle, Theme Toggle, Refresh, Logout) */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            {/* Language Switcher */}
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={toggleLanguage}
                                startIcon={<Language />}
                                sx={{
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                                }}
                            >
                                {lang === 'si' ? 'English' : 'සිංහල'}
                            </Button>

                            {/* Theme Mode Toggle */}
                            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                                <IconButton
                                    size="small"
                                    onClick={toggleColorMode}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                                    }}
                                >
                                    {mode === 'dark' ? <LightMode fontSize="small" sx={{ color: '#f59e0b' }} /> : <DarkMode fontSize="small" sx={{ color: '#6366f1' }} />}
                                </IconButton>
                            </Tooltip>

                            {/* Refresh Button */}
                            <Tooltip title={t.refresh}>
                                <IconButton
                                    size="small"
                                    onClick={fetchStudentData}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <Refresh fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            {/* Logout Button */}
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => setLogoutConfirmOpen(true)}
                                startIcon={<Logout />}
                                sx={{
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    px: { xs: 1.5, sm: 2 }
                                }}
                            >
                                {t.logout}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Paper>

            {/* ── MAIN CONTENT CONTAINER ── */}
            <Container maxWidth="lg" sx={{ pt: 3 }}>
                {/* ── HERO STUDENT BANNER ── */}
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 3,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #4338ca 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px -15px rgba(37, 99, 235, 0.4)'
                    }}
                >
                    {/* Glowing decorative circles */}
                    <Box sx={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        pointerEvents: 'none'
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: '40%',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        pointerEvents: 'none'
                    }} />

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm="auto">
                            <Avatar
                                sx={{
                                    width: { xs: 72, sm: 90 },
                                    height: { xs: 72, sm: 90 },
                                    bgcolor: '#ffffff',
                                    color: '#2563eb',
                                    fontSize: { xs: '2rem', sm: '2.4rem' },
                                    fontWeight: 900,
                                    border: '4px solid rgba(255, 255, 255, 0.4)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                                }}
                            >
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </Avatar>
                        </Grid>

                        <Grid item xs={12} sm>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5, fontSize: { xs: '1.6rem', md: '2.1rem' } }}>
                                    {student.name}
                                </Typography>
                                <Chip
                                    icon={<Verified sx={{ fontSize: '16px !important', color: '#60a5fa !important' }} />}
                                    label={t.active_student}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        backdropFilter: 'blur(8px)'
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
                                <Chip
                                    label={`${t.student_id}: ${student.indexNumber}`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
                                />
                                <Chip
                                    label={`${t.grade}: ${student.grade}`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
                                />
                                {student.mobile && (
                                    <Chip
                                        icon={<Phone sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                                        label={student.mobile}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* Action: Open QR & Digital ID */}
                        <Grid item xs={12} sm="auto">
                            <Button
                                variant="contained"
                                onClick={() => setQrOpen(true)}
                                startIcon={<QrCodeScanner />}
                                sx={{
                                    bgcolor: '#ffffff',
                                    color: '#1d4ed8',
                                    fontWeight: 800,
                                    borderRadius: '14px',
                                    px: 2.5,
                                    py: 1.2,
                                    textTransform: 'none',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        bgcolor: '#f1f5f9',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.show_id}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── KPI STAT SUMMARY CARDS ── */}
                <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                    {/* Stat 1: Overall Attendance */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                    {t.overall_attendance}
                                </Typography>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#10b981', 0.15), color: '#10b981' }}>
                                    <EventAvailable fontSize="small" />
                                </Avatar>
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={900} sx={{ color: (student.overallAttendancePct || 0) >= 75 ? '#10b981' : '#f59e0b', lineHeight: 1.1 }}>
                                    {student.overallAttendancePct || 0}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {student.totalAttendedCount || 0} / {student.totalSessionsCount || 0} {t.days_attended}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(student.overallAttendancePct || 0, 100)}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        mt: 1.5,
                                        bgcolor: alpha('#10b981', 0.15),
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: (student.overallAttendancePct || 0) >= 75 ? '#10b981' : '#f59e0b'
                                        }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Stat 2: Fee Status */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                    {t.current_fees}
                                </Typography>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.15), color: '#6366f1' }}>
                                    <MonetizationOn fontSize="small" />
                                </Avatar>
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={800} sx={{ color: pendingCount === 0 ? '#10b981' : '#f59e0b' }}>
                                    {pendingCount === 0 ? t.all_paid : `${pendingCount} ${t.pending}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {paidCount} {t.paid} • {pendingCount} {t.pending}
                                </Typography>
                                <Chip
                                    size="small"
                                    icon={pendingCount === 0 ? <CheckCircle fontSize="small" /> : <HourglassEmpty fontSize="small" />}
                                    label={pendingCount === 0 ? t.paid : t.pending}
                                    color={pendingCount === 0 ? "success" : "warning"}
                                    sx={{ mt: 1.5, fontWeight: 700, borderRadius: '8px' }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Stat 3: Enrolled Classes */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                    {t.enrolled_subjects}
                                </Typography>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6' }}>
                                    <School fontSize="small" />
                                </Avatar>
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ lineHeight: 1.1 }}>
                                    {enrollments.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {lang === 'si' ? 'සක්‍රීය පන්ති සහභාගීත්වයන්' : 'Active subject enrollments'}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`${enrollments.length} Subjects`}
                                    sx={{ mt: 1.5, fontWeight: 700, borderRadius: '8px', bgcolor: alpha('#8b5cf6', 0.12), color: '#8b5cf6' }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Stat 4: Academic Performance / Rank */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                    {t.exam_perf}
                                </Typography>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b' }}>
                                    <EmojiEvents fontSize="small" />
                                </Avatar>
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={900} sx={{ color: '#f59e0b', lineHeight: 1.1 }}>
                                    {avgMarks !== null ? `${avgMarks}%` : 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {bestRank ? `${t.top_rank}: #${bestRank}` : `${exams.length} ${lang === 'si' ? 'විභාග' : 'Exams'}`}
                                </Typography>
                                <Chip
                                    size="small"
                                    icon={<Star sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                                    label={bestRank ? `Rank #${bestRank}` : `${exams.length} Records`}
                                    sx={{ mt: 1.5, fontWeight: 700, borderRadius: '8px', bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b' }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* ── NAVIGATION TABS ── */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '18px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                        mb: 3,
                        p: 0.5
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '14px',
                                minHeight: 48,
                                borderRadius: '12px',
                                mx: 0.5
                            }
                        }}
                    >
                        <Tab icon={<School fontSize="small" />} iconPosition="start" label={t.tab_subjects} />
                        <Tab icon={<MonetizationOn fontSize="small" />} iconPosition="start" label={t.tab_fees} />
                        <Tab icon={<Assessment fontSize="small" />} iconPosition="start" label={t.tab_exams} />
                        <Tab icon={<EventAvailable fontSize="small" />} iconPosition="start" label={t.tab_attendance} />
                        <Tab icon={<MenuBook fontSize="small" />} iconPosition="start" label={t.tab_tutes} />
                        <Tab icon={<NotificationsActive fontSize="small" />} iconPosition="start" label={t.tab_notices} />
                    </Tabs>
                </Paper>

                {/* ── TAB PANELS ── */}
                <AnimatePresence mode="wait">
                    {/* TAB 0: ENROLLED SUBJECTS & TIMETABLE */}
                    {activeTab === 0 && (
                        <motion.div
                            key="tab-0"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Grid container spacing={2.5}>
                                {enrollments.map((enr, idx) => {
                                    const curRec = (enr.monthlyRecords || []).find(r => r.monthIndex === currentMonthIndex);
                                    const isPaid = enr.isFreeCard || (curRec && curRec.feePaid);

                                    return (
                                        <Grid item xs={12} md={6} key={enr.subject}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: enr.color || 'primary.main',
                                                        boxShadow: `0 8px 24px ${alpha(enr.color || '#3b82f6', 0.15)}`
                                                    }
                                                }}
                                            >
                                                {/* Subject Header */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: alpha(enr.color || '#4f46e5', 0.15), color: enr.color || '#4f46e5', width: 48, height: 48 }}>
                                                            <School />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight={800} color="text.primary">
                                                                {enr.subject}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Person fontSize="inherit" /> {enr.teacherName || 'EduFlex Faculty'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Chip
                                                        size="small"
                                                        label={enr.isFreeCard ? t.free_card : isPaid ? t.paid : t.pending}
                                                        color={enr.isFreeCard ? "secondary" : isPaid ? "success" : "warning"}
                                                        icon={isPaid ? <CheckCircle fontSize="small" /> : <HourglassEmpty fontSize="small" />}
                                                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                                                    />
                                                </Box>

                                                <Divider sx={{ my: 1.5, opacity: 0.6 }} />

                                                {/* Details Grid */}
                                                <Grid container spacing={2} sx={{ my: 0.5 }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {t.schedule}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                                                            <AccessTime fontSize="inherit" sx={{ color: 'primary.main' }} /> {enr.classDay || 'Weekly'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {t.fee_amount}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.2 }}>
                                                            Rs. {Number(enr.fee || 0).toLocaleString()} ({enr.feeType})
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                {/* Subject Attendance Progress */}
                                                <Box sx={{ mt: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {lang === 'si' ? 'විෂය පැමිණීම' : 'Subject Attendance'}
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={700} color="text.primary">
                                                            {enr.attendancePct || 0}% ({enr.totalAttended || 0}/{enr.totalSessions || 0})
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(enr.attendancePct || 0, 100)}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: alpha(enr.color || '#4f46e5', 0.12),
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: enr.color || '#4f46e5'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </motion.div>
                    )}

                    {/* TAB 1: FEES & PAYMENT RECEIPTS */}
                    {activeTab === 1 && (
                        <motion.div
                            key="tab-1"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Stack spacing={3}>
                                {enrollments.map(enr => (
                                    <Paper
                                        key={enr.subject}
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: alpha(enr.color || '#6366f1', 0.15), color: enr.color || '#6366f1', width: 40, height: 40 }}>
                                                    <School fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800}>{enr.subject}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fee: Rs. {Number(enr.fee || 0).toLocaleString()} • {enr.feeType}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {enr.isFreeCard && (
                                                <Chip label={t.free_card} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                                            )}
                                        </Box>

                                        <TableContainer sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                                            <Table size="small">
                                                <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700 }}>{t.month}</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>{t.status}</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>{t.fee_amount}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{t.receipt}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {(enr.monthlyRecords || []).map(rec => (
                                                        <TableRow key={rec.monthIndex} hover>
                                                            <TableCell sx={{ fontWeight: 600 }}>
                                                                {lang === 'si' ? rec.monthNameSi : rec.monthName}
                                                                {rec.isCurrentMonth && (
                                                                    <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ ml: 1, height: 20, fontSize: 10, fontWeight: 700 }} />
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {rec.notEnrolled ? (
                                                                    <Chip label={t.not_enrolled} size="small" variant="outlined" sx={{ opacity: 0.6, fontSize: 11 }} />
                                                                ) : enr.isFreeCard ? (
                                                                    <Chip label={t.free_card} size="small" color="secondary" sx={{ fontSize: 11, fontWeight: 700 }} />
                                                                ) : rec.feePaid ? (
                                                                    <Chip icon={<CheckCircle fontSize="small" />} label={t.paid} size="small" color="success" sx={{ fontSize: 11, fontWeight: 700 }} />
                                                                ) : (
                                                                    <Chip icon={<HourglassEmpty fontSize="small" />} label={t.pending} size="small" color="warning" variant="outlined" sx={{ fontSize: 11, fontWeight: 700 }} />
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                Rs. {Number(rec.feeAmount || enr.fee || 0).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {rec.feePaid ? (
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        startIcon={<Download fontSize="small" />}
                                                                        onClick={() => handleDownloadReceipt(enr, rec)}
                                                                        sx={{
                                                                            borderRadius: '8px',
                                                                            textTransform: 'none',
                                                                            fontWeight: 700,
                                                                            fontSize: '11px',
                                                                            py: 0.4
                                                                        }}
                                                                    >
                                                                        {t.download_receipt}
                                                                    </Button>
                                                                ) : (
                                                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                ))}
                            </Stack>
                        </motion.div>
                    )}

                    {/* TAB 2: EXAM RESULTS */}
                    {activeTab === 2 && (
                        <motion.div
                            key="tab-2"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {exams.length === 0 ? (
                                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        {t.no_exams}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                    }}
                                >
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t.exam_title}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{lang === 'si' ? 'විෂය' : 'Subject'}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t.date}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t.marks}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{t.grade}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t.rank}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {exams.map(exam => (
                                                    <TableRow key={exam.examId} hover>
                                                        <TableCell sx={{ fontWeight: 700 }}>
                                                            {exam.title}
                                                        </TableCell>
                                                        <TableCell>{exam.subject}</TableCell>
                                                        <TableCell>
                                                            {exam.date ? new Date(exam.date).toLocaleDateString('en-GB') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={800} sx={{ color: Number(exam.marks) >= 75 ? '#10b981' : Number(exam.marks) >= 50 ? '#f59e0b' : '#f43f5e' }}>
                                                                {exam.marks}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={exam.gradeBadge}
                                                                size="small"
                                                                color={exam.gradeBadge === 'A' ? "success" : exam.gradeBadge === 'B' ? "primary" : exam.gradeBadge === 'C' ? "warning" : "default"}
                                                                sx={{ fontWeight: 800, minWidth: 32 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {exam.rank && exam.rank !== 'N/A' ? (
                                                                <Chip
                                                                    icon={<EmojiEvents sx={{ fontSize: '14px !important', color: exam.rank === 1 ? '#f59e0b !important' : 'inherit' }} />}
                                                                    label={`#${exam.rank} ${t.out_of} ${exam.totalStudents}`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        bgcolor: exam.rank === 1 ? alpha('#f59e0b', 0.15) : undefined,
                                                                        color: exam.rank === 1 ? '#f59e0b' : undefined
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography variant="caption" color="text.secondary">-</Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </motion.div>
                    )}

                    {/* TAB 3: MONTHLY ATTENDANCE BREAKDOWN */}
                    {activeTab === 3 && (
                        <motion.div
                            key="tab-3"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Grid container spacing={3}>
                                {enrollments.map(enr => (
                                    <Grid item xs={12} md={6} key={enr.subject}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(enr.color || '#10b981', 0.15), color: enr.color || '#10b981' }}>
                                                    <EventAvailable />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800}>{enr.subject}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Total Attended: {enr.totalAttended} / {enr.totalSessions} sessions ({enr.attendancePct}%)
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Stack spacing={1.5}>
                                                {(enr.monthlyRecords || []).map(rec => {
                                                    const pct = rec.totalDays > 0 ? Math.round((rec.attendedDays / rec.totalDays) * 100) : 0;
                                                    return (
                                                        <Box key={rec.monthIndex} sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="body2" fontWeight={700}>
                                                                    {lang === 'si' ? rec.monthNameSi : rec.monthName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {rec.attendedDays} / {rec.totalDays} {t.days_attended} ({pct}%)
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={pct}
                                                                sx={{
                                                                    height: 5,
                                                                    borderRadius: 2.5,
                                                                    bgcolor: alpha('#10b981', 0.15),
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e'
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}

                    {/* TAB 4: TUTES & STUDY MATERIALS */}
                    {activeTab === 4 && (
                        <motion.div
                            key="tab-4"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Grid container spacing={3}>
                                {enrollments.map(enr => (
                                    <Grid item xs={12} md={6} key={enr.subject}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6' }}>
                                                    <MenuBook />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={800}>{enr.subject}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t.tute_status}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'text.secondary' }}>
                                                {t.monthly_tute}
                                            </Typography>
                                            <Stack spacing={1} sx={{ mb: 2.5 }}>
                                                {(enr.monthlyRecords || []).slice(-4).map(rec => (
                                                    <Box key={rec.monthIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                                        <Typography variant="body2">
                                                            {lang === 'si' ? rec.monthNameSi : rec.monthName} Tute
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            icon={rec.tutesGiven ? <CheckCircle fontSize="small" /> : <HourglassEmpty fontSize="small" />}
                                                            label={rec.tutesGiven ? t.issued : t.not_issued}
                                                            color={rec.tutesGiven ? "success" : "default"}
                                                            sx={{ fontSize: 10, fontWeight: 700 }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>

                                            {/* Term Tutes */}
                                            {enr.termTutes && enr.termTutes.length > 0 && (
                                                <>
                                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: 'text.secondary' }}>
                                                        {t.term_tutes}
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        {enr.termTutes.map(tute => (
                                                            <Box key={tute.term} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                                                <Typography variant="body2">{tute.termName}</Typography>
                                                                <Chip
                                                                    size="small"
                                                                    label={tute.issued ? t.issued : t.not_issued}
                                                                    color={tute.issued ? "success" : "warning"}
                                                                    variant={tute.issued ? "filled" : "outlined"}
                                                                    sx={{ fontSize: 10, fontWeight: 700 }}
                                                                />
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </>
                                            )}
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}

                    {/* TAB 5: NOTICES & HELPLINE */}
                    {activeTab === 5 && (
                        <motion.div
                            key="tab-5"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Grid container spacing={3}>
                                {/* Left: Notice Board */}
                                <Grid item xs={12} md={7}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                            <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b' }}>
                                                <NotificationsActive />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight={800}>
                                                    {lang === 'si' ? 'ආයතනික නිවේදන පුවරුව' : 'Official Notice Board'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {lang === 'si' ? 'වැදගත් නිවේදන සහ තොරතුරු' : 'Important updates & announcements'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Stack spacing={2}>
                                            {notices.map(notice => (
                                                <Paper
                                                    key={notice.id}
                                                    elevation={0}
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                        borderLeft: '4px solid',
                                                        borderColor: notice.priority === 'important' ? '#ef4444' : notice.priority === 'normal' ? '#3b82f6' : '#10b981'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Chip
                                                            label={notice.category}
                                                            size="small"
                                                            sx={{ fontWeight: 700, fontSize: '11px', height: 22 }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {notice.date}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                                                        {notice.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                        {lang === 'si' ? notice.contentSi : notice.contentEn}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Right: Institute Contact & Helpline */}
                                <Grid item xs={12} md={5}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                                            {t.institute_info}
                                        </Typography>

                                        <Stack spacing={2.5}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.15), color: '#3b82f6', width: 38, height: 38 }}>
                                                    <Phone fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t.hotline}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {institute.hotline || '+94 11 234 5678'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: alpha('#10b981', 0.15), color: '#10b981', width: 38, height: 38 }}>
                                                    <WhatsApp fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t.whatsapp}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {institute.whatsapp || '+94 77 123 4567'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#8b5cf6', width: 38, height: 38 }}>
                                                    <LocationOn fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t.address}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {institute.address || 'EduFlex Main Campus, High Level Road, Nugegoda'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', width: 38, height: 38 }}>
                                                    <AccessTime fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {t.office_hours}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {institute.workingHours || 'Tue - Sun: 7:30 AM - 6:30 PM'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>

            {/* ── DIGITAL STUDENT ID CARD & QR DIALOG ── */}
            <Dialog
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: isDark ? '#0f172a' : '#ffffff',
                        border: '1px solid',
                        borderColor: 'divider'
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
                    <Typography variant="h6" fontWeight={800}>
                        {t.show_id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        EduFlex Higher Education Institute
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    {/* Printable ID Card Container */}
                    <Box
                        ref={printRef}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            background: isDark
                                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Institute Badge */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                            <Avatar src={logo} sx={{ width: 28, height: 28 }}>E</Avatar>
                            <Typography variant="subtitle2" fontWeight={900} letterSpacing={0.5}>
                                EDUFLEX INSTITUTE
                            </Typography>
                        </Box>

                        {/* QR Code */}
                        <Box sx={{
                            bgcolor: '#ffffff',
                            p: 2,
                            borderRadius: '16px',
                            display: 'inline-block',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                        }}>
                            <QRCode
                                size={190}
                                value={student.indexNumber || 'STU-0000'}
                                viewBox={`0 0 190 190`}
                            />
                        </Box>

                        {/* Student Details */}
                        <Typography variant="h6" fontWeight={900} sx={{ mt: 2, letterSpacing: -0.3 }}>
                            {student.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={800}>
                            {student.indexNumber}
                        </Typography>

                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                            <Chip label={student.grade} size="small" sx={{ fontWeight: 700 }} />
                            {student.mobile && <Chip label={student.mobile} size="small" />}
                        </Stack>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, px: 2 }}>
                        {t.id_card_note}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={handlePrintIdCard}
                        startIcon={<Print />}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        {t.print_id}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setQrOpen(false)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        {t.close}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── LOGOUT CONFIRMATION DIALOG ── */}
            <Dialog
                open={logoutConfirmOpen}
                onClose={() => setLogoutConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {t.logout}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        {t.logout_confirm}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setLogoutConfirmOpen(false)} sx={{ fontWeight: 700 }}>
                        {t.cancel}
                    </Button>
                    <Button variant="contained" color="error" onClick={handleLogout} sx={{ borderRadius: '10px', fontWeight: 700 }}>
                        {t.logout}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
