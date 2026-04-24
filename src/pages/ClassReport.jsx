import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Divider,
    Chip,
    Avatar,
    InputAdornment,
    alpha
} from '@mui/material';
import axios from 'axios';
import {
    Phone,
    EventAvailable,
    Book,
    Assessment,
    FilterList,
    Search,
    Download,
    Class,
    CalendarToday
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { setupPdfFont, formatDate } from '../utils/pdfUtils';

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionTableRow = motion(TableRow);

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ClassReport() {
    const { t, i18n } = useTranslation();
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [month, setMonth] = useState('');
    const [subjectsList, setSubjectsList] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [gradeReportData, setGradeReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [error, setError] = useState(null);
    
    const [reportType, setReportType] = useState('single');
    const [language, setLanguage] = useState('en');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/subjects`);
                setSubjectsList(response.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }
        };
        fetchSubjects();
    }, []);

    const handleGenerate = async () => {
        if (!grade || month === '') {
            setError("Please select grade and month");
            return;
        }
        if (reportType === 'single' && !subject) {
            setError("Please select a subject");
            return;
        }
        
        setError(null);
        setLoading(true);
        // Simulate a small delay for animation feel if network is too fast
        setTimeout(async () => {
            try {
                if (reportType === 'single') {
                    const response = await axios.get(`${API_BASE_URL}/api/reports/class-report`, {
                        params: { grade, subject, month }
                    });
                    setReportData(response.data);
                    setGradeReportData(null);
                } else {
                    const response = await axios.get(`${API_BASE_URL}/api/reports/grade-report`, {
                        params: { grade, month }
                    });
                    setGradeReportData(response.data);
                    setReportData(null);
                }
            } catch (err) {
                console.error("Error fetching report", err);
                setError("Failed to fetch report");
                setReportData(null);
                setGradeReportData(null);
            } finally {
                setLoading(false);
            }
        }, 600);
    };

    const countAttendance = (attendanceArray) => {
        if (!attendanceArray) return 0;
        return attendanceArray.filter(status => status === 'present' || status === true || status === 'true').length;
    };

    const handleDownloadPDF = () => {
        if (!reportData || reportData.length === 0) return;

        const doc = new jsPDF();
        const currentLang = i18n.language;
        setupPdfFont(doc, currentLang);

        const monthName = t(months[month].toLowerCase());
        const dateStr = formatDate(new Date(), currentLang);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Primary Blue
        doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
        doc.text("Eduflex Institute", 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(t('class_performance'), 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
        doc.text(`${t('grade')}: ${grade}`, 14, 40);
        doc.text(`${t('add_subject').replace(' එක් කරන්න', '').replace('Add ', '')}: ${subject}`, 14, 45);
        doc.text(`${t('month')}: ${monthName}`, 14, 50);
        doc.text(`${t('generated_on')}: ${dateStr}`, 14, 55);

        // Table
        const tableColumn = ["#", t('student_name'), t('attendance'), t('fee_status'), "Tutes"];
        const tableRows = [];

        reportData.forEach((student, idx) => {
            const attendanceCount = countAttendance(student.attendance);
            const studentData = [
                idx + 1,
                student.name,
                `${attendanceCount}/5`,
                student.feePaid ? t('paid') : t('not_paid'),
                student.tutesGiven ? (currentLang === 'si' ? "ලබාදී ඇත" : "Given") : (currentLang === 'si' ? "ප්‍රමාදයි" : "Pending")
            ];
            tableRows.push(studentData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                halign: 'center',
                font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
            },
            bodyStyles: {
                font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
            },
            columnStyles: {
                0: { cellWidth: 15 }, // Index
                1: { cellWidth: 'auto' }, // Name
                2: { halign: 'center' }, // Attendance
                3: { halign: 'center' }, // Fee
                4: { halign: 'center' } // Tutes
            },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 60 }
        });

        doc.save(`Eduflex_Report_${grade}_${subject}_${monthName}.pdf`);
    };

    const handleDownloadPNG = async () => {
        const element = document.getElementById('report-container');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `Eduflex_Report_${grade}_${subject}_${month}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate PNG", err);
        }
    };

    const handleDownloadGradePDF = async () => {
        if (!gradeReportData) return;
        setGeneratingPDF(true);

        try {
            const doc = new jsPDF();
            const currentLang = i18n.language;
            setupPdfFont(doc, currentLang);

            const monthName = t(months[month].toLowerCase());
            const dateStr = formatDate(new Date(), currentLang);

            const subjects = Object.keys(gradeReportData);

            subjects.forEach((subjectKey, index) => {
                if (index > 0) {
                    doc.addPage();
                }

                const students = gradeReportData[subjectKey];

                doc.setFontSize(22);
                doc.setTextColor(30, 41, 59); // Slate 800
                doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
                doc.text("Eduflex Institute", 14, 20);

                doc.setFontSize(14);
                doc.setTextColor(37, 99, 235); // Blue 600
                doc.text(currentLang === 'si' ? `${grade} ${t('grade')} - ${subjectKey}` : `${grade} - ${subjectKey} Overview`, 14, 28);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
                doc.text(`${t('class_performance')} | ${t('month')}: ${monthName}`, 14, 34);

                // Summary Stats
                const totalStudents = students.length;
                const paidCount = students.filter(s => s.feePaid).length;
                const pendingCount = totalStudents - paidCount;

                doc.setDrawColor(59, 130, 246); // Blue 500
                doc.setFillColor(241, 245, 249); // Slate 100
                doc.roundedRect(14, 40, 55, 20, 2, 2, 'FD');
                doc.setLineWidth(1);
                doc.line(14, 40, 14, 60); // Left border

                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(t('total_students').toUpperCase(), 18, 46);
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42);
                doc.text(`${totalStudents}`, 18, 55);

                doc.setDrawColor(34, 197, 94); // Green 500
                doc.setFillColor(240, 253, 244); // Green 50
                doc.roundedRect(74, 40, 55, 20, 2, 2, 'FD');
                doc.setFillColor(34, 197, 94);
                doc.rect(74, 40, 2, 20, 'F');

                doc.setFontSize(8);
                doc.setTextColor(22, 101, 52);
                doc.text(t('paid_count').toUpperCase(), 78, 46);
                doc.setFontSize(16);
                doc.setTextColor(21, 128, 61);
                doc.text(`${paidCount}`, 78, 55);

                doc.setDrawColor(239, 68, 68); // Red 500
                doc.setFillColor(254, 242, 242); // Red 50
                doc.roundedRect(134, 40, 55, 20, 2, 2, 'FD');
                doc.setFillColor(239, 68, 68); 
                doc.rect(134, 40, 2, 20, 'F');

                doc.setFontSize(8);
                doc.setTextColor(153, 27, 27);
                doc.text(t('pending').toUpperCase(), 138, 46);
                doc.setFontSize(16);
                doc.setTextColor(185, 28, 28);
                doc.text(`${pendingCount}`, 138, 55);

                // Table
                const tableColumn = ["#", t('student_name'), t('index_number'), t('attendance'), t('fee_status')];
                const tableRows = [];

                students.forEach((student, idx) => {
                    const attendanceCount = countAttendance(student.attendance);
                    const studentData = [
                        idx + 1,
                        student.name,
                        student.indexNumber,
                        `${attendanceCount}/5`,
                        student.feePaid ? t('paid') : t('not_paid')
                    ];
                    tableRows.push(studentData);
                });

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 65,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [37, 99, 235],
                        textColor: 255,
                        halign: 'center',
                        font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                    },
                    bodyStyles: {
                        font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 40 },
                        3: { halign: 'center', cellWidth: 30 },
                        4: { halign: 'center', cellWidth: 30 }
                    },
                    alternateRowStyles: { fillColor: [245, 247, 250] },
                    margin: { top: 60 }
                });
            });

            doc.save(`Eduflex_Grade_Report_${grade}_${months[month]}.pdf`);
        } catch (error) {
            console.error("Error generating full PDF:", error);
            setError("Failed to generate PDF.");
        } finally {
            setGeneratingPDF(false);
        }
    };

    const ReportCard = ({ row }) => {
        const attendanceCount = countAttendance(row.attendance);
        const maxDays = 5;

        return (
            <Card
                component={motion.div}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                layout
                sx={{
                    mb: 2,
                    borderRadius: 3,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 'bold' }}>
                                        {row.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{row.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.04)', px: 1, py: 0.2, borderRadius: 1, width: 'fit-content', mt: 0.5 }}>
                                            ID: {row.indexNumber}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={row.feePaid ? "Paid" : "Unpaid"}
                                    color={row.feePaid ? "success" : "error"}
                                    size="small"
                                    sx={{ borderRadius: 1.5, fontWeight: 700, px: 0.5 }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 0.5, borderColor: 'rgba(0,0,0,0.06)' }} />
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone fontSize="small" sx={{ fontSize: '14px' }} /> Mobile
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>{row.mobile}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventAvailable fontSize="small" sx={{ fontSize: '14px' }} /> Attendance
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold" color={attendanceCount >= 4 ? "success.main" : "text.primary"}>
                                    {attendanceCount}/{maxDays}
                                </Typography>
                                <CircularProgress
                                    variant="determinate"
                                    value={(attendanceCount / maxDays) * 100}
                                    size={14}
                                    color={attendanceCount >= 4 ? "success" : "primary"}
                                    thickness={6}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
                                <Book fontSize="small" color="secondary" />
                                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500, color: 'text.secondary' }}>Tutes Status</Typography>
                                <Chip
                                    label={row.tutesGiven ? "Collected" : "Pending"}
                                    color={row.tutesGiven ? "success" : "warning"}
                                    size="small"
                                    variant="filled"
                                    sx={{ borderRadius: 1.5, height: 24 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )
    };

    return (
        <MotionContainer
            id="report-container"
            maxWidth="lg"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            sx={{ py: { xs: 2, md: 4 }, position: 'relative' }}
        >
            {/* Background Decorations */}
            <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: -1,
                }}
            />

            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
                            color: 'white'
                        }}
                    >
                        <Assessment fontSize="large" color="inherit" />
                    </Box>
                    <Box component={motion.div} variants={itemVariants}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            Class Performance
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate detailed insights and download reports
                        </Typography>
                    </Box>
                </Box>

                {reportType === 'single' && reportData && reportData.length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="contained"
                            onClick={handleDownloadPNG}
                            startIcon={<Download />}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.3)',
                                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                            }}
                        >
                            Export PNG
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Download />}
                            onClick={handleDownloadPDF}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.3)',
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                            }}
                        >
                            Export PDF
                        </Button>
                    </motion.div>
                )}

                {reportType === 'full' && gradeReportData && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={generatingPDF ? <CircularProgress size={20} color="inherit" /> : <Download />}
                            disabled={generatingPDF}
                            onClick={handleDownloadGradePDF}
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1.5,
                                fontSize: '1rem',
                                boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.3)',
                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                            }}
                        >
                            {generatingPDF ? "Compiling PDF..." : language === 'si' ? "සිංහල PDF ලබාගන්න" : "Download Grade PDF"}
                        </Button>
                    </motion.div>
                )}
            </Box>

            <MotionPaper
                elevation={0}
                variants={itemVariants}
                sx={{
                    p: { xs: 2.5, md: 4 },
                    mb: 4,
                    borderRadius: 4,
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    background: alpha(theme.palette.background.paper, 0.6), // Dark Glass
                    backdropFilter: 'blur(24px)',
                    border: `1px solid ${theme.palette.divider}`
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
                                <FilterList fontSize="small" sx={{ color: 'primary.main' }} /> {t('report_filters')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                     label={t('single_subject')} 
                                     onClick={() => setReportType('single')} 
                                     color={reportType === 'single' ? 'primary' : 'default'} 
                                     variant={reportType === 'single' ? 'filled' : 'outlined'} 
                                     sx={{ fontWeight: 600 }}
                                 />
                                <Chip 
                                     label={t('entire_grade')} 
                                     onClick={() => setReportType('full')} 
                                     color={reportType === 'full' ? 'primary' : 'default'} 
                                     variant={reportType === 'full' ? 'filled' : 'outlined'} 
                                     sx={{ fontWeight: 600 }}
                                 />
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" variant="outlined">
                            <InputLabel>{t('grade')}</InputLabel>
                            <Select
                                value={grade}
                                label={t('grade')}
                                onChange={(e) => setGrade(e.target.value)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    color: 'text.primary',
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Class color="action" fontSize="small" />
                                    </InputAdornment>
                                }
                            >
                                {[...Array(13)].map((_, i) => {
                                    const gradeNum = (i + 1).toString().padStart(2, '0');
                                    return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>{t('grade')} {gradeNum}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    {reportType === 'single' ? (
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('add_subject').replace(' එක් කරන්න', '').replace('Add ', '')}</InputLabel>
                                <Select
                                    value={subject}
                                    label={t('add_subject').replace(' එක් කරන්න', '').replace('Add ', '')}
                                    onChange={(e) => setSubject(e.target.value)}
                                    sx={{
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                    }}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Book color="action" fontSize="small" />
                                        </InputAdornment>
                                    }
                                >
                                    {subjectsList.map((sub) => (
                                        <MenuItem key={sub._id} value={sub.name}>
                                            {sub.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    ) : (
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('report_language')}</InputLabel>
                                <Select
                                    value={language}
                                    label={t('report_language')}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    sx={{
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                    }}
                                >
                                    <MenuItem value="en">English View (Downloading is instant)</MenuItem>
                                    <MenuItem value="si">Sinhala Print (සිංහල)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('month')}</InputLabel>
                            <Select
                                value={month}
                                label={t('month')}
                                onChange={(e) => setMonth(e.target.value)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    color: 'text.primary',
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <CalendarToday color="action" fontSize="small" />
                                    </InputAdornment>
                                }
                            >
                                {months.map((m, index) => (
                                    <MenuItem key={index} value={index}>{t(m.toLowerCase())}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            component={motion.button}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            variant="contained"
                            onClick={handleGenerate}
                            disabled={loading}
                            fullWidth
                            startIcon={!loading && <Search />}
                            sx={{
                                height: 44,
                                borderRadius: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : t('generate_report')}
                        </Button>
                    </Grid>
                </Grid>
            </MotionPaper>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: '#3b82f6' }} />
                    <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>Generating analytics...</Typography>
                </Box>
            )}

            {!loading && reportData && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1 }}>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            Search Results
                            <Chip
                                label={reportData.length}
                                size="small"
                                color="primary"
                                sx={{ ml: 1.5, fontWeight: 'bold', borderRadius: 1.5 }}
                            />
                        </Typography>
                    </Box>

                    {isMobile ? (
                        <Box>
                            {reportData.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(10px)', border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography color="text.secondary">No students found matching your criteria.</Typography>
                                </Paper>
                            ) : (
                                <AnimatePresence>
                                    {reportData.map((row) => (
                                        <ReportCard key={row.id} row={row} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </Box>
                    ) : (
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.background.paper, 0.6), // Dark Glass
                                backdropFilter: 'blur(20px)'
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                                        <TableCell sx={{ color: 'text.primary', fontWeight: 700, py: 2.5, pl: 4 }}>Student Details</TableCell>
                                        <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Index No</TableCell>
                                        <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Mobile</TableCell>
                                        <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 700 }}>Attendance</TableCell>
                                        <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 700 }}>Fee Status</TableCell>
                                        <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 700 }}>Tutes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                    <Search sx={{ fontSize: 48, color: 'text.disabled' }} />
                                                    <Typography color="text.secondary" fontWeight={500}>No students found matching these criteria.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reportData.map((row, index) => (
                                            <MotionTableRow
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                key={row.id}
                                                hover
                                                sx={{
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    cursor: 'default',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                                    transition: 'background-color 0.2s',
                                                    borderBottom: `1px solid ${theme.palette.divider}`
                                                }}
                                            >
                                                <TableCell sx={{ pl: 4 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{
                                                            width: 40,
                                                            height: 40,
                                                            fontSize: '1rem',
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}>
                                                            {row.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography fontWeight={600} color="text.primary">{row.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.indexNumber} size="small" sx={{ borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.4), fontWeight: 600, color: 'text.secondary', border: `1px solid ${theme.palette.divider}` }} />
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', color: '#64748b' }}>{row.mobile}</TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                                            <CircularProgress
                                                                variant="determinate"
                                                                value={(countAttendance(row.attendance) / 5) * 100}
                                                                size={28}
                                                                thickness={5}
                                                                sx={{ color: countAttendance(row.attendance) >= 4 ? '#22c55e' : '#3b82f6' }}
                                                            />
                                                        </Box>
                                                        <Typography fontWeight={700} color={countAttendance(row.attendance) >= 4 ? "success.main" : "text.secondary"}>
                                                            {countAttendance(row.attendance)}/5
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.feePaid ? "Paid" : "Unpaid"}
                                                        color={row.feePaid ? "success" : "error"}
                                                        variant={row.feePaid ? "filled" : "outlined"}
                                                        size="small"
                                                        sx={{ minWidth: 80, fontWeight: 700, borderRadius: 1.5 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.tutesGiven ? "Given" : "Pending"}
                                                        color={row.tutesGiven ? "success" : "warning"}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ minWidth: 80, fontWeight: 600, border: '1px solid', borderRadius: 1.5 }}
                                                    />
                                                </TableCell>
                                            </MotionTableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </motion.div>
            )}

            {!loading && reportType === 'full' && gradeReportData && (
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 3, alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={600}>
                            {language === 'si' ? "වාර්තාව සූදානම්!" : "Grade Report Ready!"}
                        </Typography>
                        <Typography variant="body2">
                            {language === 'si' 
                                ? `${grade} ශ්‍රේණියේ විෂයන් ${Object.keys(gradeReportData).length} ක දත්ත ඇතුලත් වේ. ` 
                                : `Contains data for ${Object.keys(gradeReportData).length} subjects in ${grade}. `}
                            {language === 'si' ? "ඉහත බොත්තම ඔබා PDF ලබාගන්න." : "Click the button above to generate the compiled PDF."}
                        </Typography>
                    </Alert>
                </motion.div>
            )}

            {/* Removed Hidden Templates */}

        </MotionContainer>
    );
}


