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
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [month, setMonth] = useState('');
    const [subjectsList, setSubjectsList] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        if (!grade || !subject || month === '') {
            setError("Please select all fields");
            return;
        }
        setError(null);
        setLoading(true);
        // Simulate a small delay for animation feel if network is too fast
        setTimeout(async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reports/class-report`, {
                    params: { grade, subject, month }
                });
                setReportData(response.data);
            } catch (err) {
                console.error("Error fetching report", err);
                setError("Failed to fetch report");
                setReportData(null);
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
        const monthName = months[month];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Primary Blue
        doc.text("Eduflex Institute", 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text("Class Performance Report", 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Grade: ${grade}`, 14, 40);
        doc.text(`Subject: ${subject}`, 14, 45);
        doc.text(`Month: ${monthName}`, 14, 50);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 55);

        // Table
        const tableColumn = ["Index", "Name", "Mobile", "Attendance", "Fee Status", "Tutes"];
        const tableRows = [];

        reportData.forEach(student => {
            const attendanceCount = countAttendance(student.attendance);
            const studentData = [
                student.indexNumber,
                student.name,
                student.mobile,
                `${attendanceCount}/5`,
                student.feePaid ? "Paid" : "Unpaid",
                student.tutesGiven ? "Given" : "Pending"
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
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 30 }, // Index
                1: { cellWidth: 'auto' }, // Name
                2: { cellWidth: 30 }, // Mobile
                3: { halign: 'center' }, // Attendance
                4: { halign: 'center' }, // Fee
                5: { halign: 'center' } // Tutes
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
                    border: '1px solid rgba(255,255,255,0.1)',
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
            sx={{ py: 4, position: 'relative' }}
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

                {reportData && reportData.length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="contained"
                            onClick={handleDownloadPNG}
                            startIcon={<Download />} // Using same icon for now, or could use Image icon
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.3)',
                                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' // Orange-ish for PNG
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
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
                            <FilterList fontSize="small" sx={{ color: 'primary.main' }} /> Report Filters
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" variant="outlined">
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={grade}
                                label="Grade"
                                onChange={(e) => setGrade(e.target.value)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    color: 'text.primary',
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
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
                                    return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>Grade {gradeNum}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={subject}
                                label="Subject"
                                onChange={(e) => setSubject(e.target.value)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    color: 'text.primary',
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
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

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={month}
                                label="Month"
                                onChange={(e) => setMonth(e.target.value)}
                                sx={{
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    color: 'text.primary',
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <CalendarToday color="action" fontSize="small" />
                                    </InputAdornment>
                                }
                            >
                                {months.map((m, index) => (
                                    <MenuItem key={index} value={index}>{m}</MenuItem>
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
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
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
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
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
                                                    <Chip label={row.indexNumber} size="small" sx={{ borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.4), fontWeight: 600, color: 'text.secondary', border: '1px solid rgba(255,255,255,0.1)' }} />
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
        </MotionContainer>
    );
}


