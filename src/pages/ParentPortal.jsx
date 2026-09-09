import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    LinearProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    Search,
    School,
    MonetizationOn,
    EventAvailable,
    Assessment,
    Download,
    CheckCircle,
    HourglassEmpty,
    EmojiEvents,
    Language
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ParentPortal() {
    const [searchParams] = useSearchParams();
    const [identifier, setIdentifier] = useState(searchParams.get('id') || '');
    const [loading, setLoading] = useState(false);
    const [portalData, setPortalData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [lang, setLang] = useState('si'); // 'si' or 'en'

    const fetchPortalData = async (queryId) => {
        const idToSearch = (queryId || identifier).trim();
        if (!idToSearch) return;

        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/api/portal/student/${encodeURIComponent(idToSearch)}`);
            setPortalData(res.data);
        } catch (err) {
            console.error('Failed to load portal data', err);
            setPortalData(null);
            setError(err.response?.data?.error || 'No student records found. Please double check the Index Number or Mobile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialId = searchParams.get('id');
        if (initialId) {
            setIdentifier(initialId);
            fetchPortalData(initialId);
        }
    }, [searchParams]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPortalData();
    };

    // Generate PDF Receipt for paid month
    const handleDownloadReceipt = (enrollment, record) => {
        if (!portalData) return;
        const doc = new jsPDF();
        const student = portalData.student;

        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUFLEX INSTITUTE', 105, 18, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Fee Payment Receipt / ගෙවීම් රිසිට්පත', 105, 26, { align: 'center' });

        // Metadata
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);

        doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 14, 50);
        doc.text(`Student Name: ${student.name}`, 14, 57);
        doc.text(`Index Number: ${student.indexNumber}`, 14, 64);
        doc.text(`Grade: ${student.grade}`, 14, 71);

        doc.text(`Subject: ${enrollment.subject}`, 130, 57);
        doc.text(`Fee Month: ${record.monthName} (${record.monthNameSi})`, 130, 64);
        doc.text(`Status: PAID (ගෙවා ඇත)`, 130, 71);

        // Payment Table
        doc.autoTable({
            startY: 80,
            head: [['Description', 'Type', 'Amount (LKR)']],
            body: [
                [
                    `${enrollment.subject} Tuition Fee - ${record.monthName}`,
                    record.feeType === 'daily' ? 'Daily / Per Session' : 'Monthly Fee',
                    `Rs. ${record.feeAmount.toLocaleString()}`
                ]
            ],
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fontSize: 10 },
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Paid: Rs. ${record.feeAmount.toLocaleString()}`, 14, finalY);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text('This is a computer-generated receipt from Eduflex Management System. No signature required.', 105, finalY + 25, { align: 'center' });

        doc.save(`Eduflex_Receipt_${student.indexNumber}_${record.monthName}.pdf`);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: 4, px: 2, color: '#f8fafc' }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 44, height: 44, borderRadius: 2,
                            bgcolor: '#6366f1', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: 20
                        }}>E</Box>
                        <Box>
                            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: -0.5 }}>
                                EduFlex
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {lang === 'si' ? 'ශිෂ්‍ය & දෙමාපිය Portal' : 'Student & Parent Portal'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Language />}
                        onClick={() => setLang(l => l === 'si' ? 'en' : 'si')}
                        sx={{ color: '#cbd5e1', borderColor: '#334155' }}
                    >
                        {lang === 'si' ? 'English' : 'සිංහල'}
                    </Button>
                </Box>

                {/* Search Box */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid #334155' }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, color: '#f1f5f9' }}>
                        {lang === 'si' ? 'විස්තර ලබාගැනීමට Student Index Number හෝ Phone Number ඇතුළත් කරන්න:' : 'Enter Student Index Number or Registered Phone Number:'}
                    </Typography>
                    <form onSubmit={handleSearchSubmit}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={9}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g. STD1001 or 0771234567"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    sx={{
                                        bgcolor: '#0f172a',
                                        borderRadius: 1.5,
                                        input: { color: '#fff' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    startIcon={<Search />}
                                    sx={{
                                        bgcolor: '#6366f1',
                                        '&:hover': { bgcolor: '#4f46e5' },
                                        height: '40px',
                                        fontWeight: '700'
                                    }}
                                >
                                    {lang === 'si' ? 'සොයන්න' : 'Search'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {loading && <LinearProgress sx={{ mb: 3 }} />}

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {portalData && (
                    <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
                        {/* Student Profile Banner */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid #334155' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                    <Typography variant="h5" fontWeight="bold" color="#fff">
                                        {portalData.student.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                        <Chip label={`Index: ${portalData.student.indexNumber}`} size="small" sx={{ bgcolor: '#334155', color: '#e2e8f0' }} />
                                        <Chip label={`Grade: ${portalData.student.grade}`} size="small" sx={{ bgcolor: '#334155', color: '#e2e8f0' }} />
                                        <Chip label={`Mobile: ${portalData.student.mobile}`} size="small" sx={{ bgcolor: '#334155', color: '#e2e8f0' }} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {lang === 'si' ? 'පැමිණීමේ ප්‍රතිශතය (Overall Attendance)' : 'Overall Attendance'}
                                    </Typography>
                                    <Typography variant="h4" fontWeight="900" sx={{ color: portalData.student.overallAttendancePct >= 75 ? '#4ade80' : '#fb923c' }}>
                                        {portalData.student.overallAttendancePct}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {portalData.student.totalAttendedCount} / {portalData.student.totalSessionsCount} {lang === 'si' ? 'දින පැමිණ ඇත' : 'days attended'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Navigation Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={(e, val) => setActiveTab(val)}
                            textColor="inherit"
                            sx={{
                                mb: 3,
                                borderBottom: '1px solid #334155',
                                '& .MuiTab-root': { color: '#94a3b8', fontWeight: 'bold' },
                                '& .Mui-selected': { color: '#6366f1' },
                                '& .MuiTabs-indicator': { backgroundColor: '#6366f1' }
                            }}
                        >
                            <Tab icon={<MonetizationOn fontSize="small" />} iconPosition="start" label={lang === 'si' ? 'පන්ති ගාස්තු (Fees)' : 'Fees & Receipts'} />
                            <Tab icon={<EventAvailable fontSize="small" />} iconPosition="start" label={lang === 'si' ? 'පැමිණීම (Attendance)' : 'Attendance'} />
                            <Tab icon={<Assessment fontSize="small" />} iconPosition="start" label={lang === 'si' ? 'විභාග ලකුණු (Exams)' : 'Exam Results'} />
                        </Tabs>

                        {/* TAB 0: FEES & RECEIPTS */}
                        {activeTab === 0 && (
                            <Stack spacing={3}>
                                {portalData.enrollments.map((enr) => (
                                    <Card key={enr.subject} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <School sx={{ color: '#6366f1' }} />
                                                    <Typography variant="h6" fontWeight="bold" color="#fff">
                                                        {enr.subject}
                                                    </Typography>
                                                    {enr.isFreeCard && (
                                                        <Chip label="Free Card" size="small" color="secondary" />
                                                    )}
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>
                                                    Fee: Rs. {enr.fee.toLocaleString()} ({enr.feeType})
                                                </Typography>
                                            </Box>

                                            <TableContainer component={Paper} sx={{ bgcolor: '#0f172a', borderRadius: 2 }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ color: '#94a3b8' }}>Month</TableCell>
                                                            <TableCell sx={{ color: '#94a3b8' }}>Status</TableCell>
                                                            <TableCell sx={{ color: '#94a3b8' }}>Fee</TableCell>
                                                            <TableCell align="right" sx={{ color: '#94a3b8' }}>Receipt</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {enr.monthlyRecords.map((rec) => (
                                                            <TableRow key={rec.monthIndex} hover>
                                                                <TableCell sx={{ color: '#f8fafc' }}>
                                                                    <strong>{lang === 'si' ? rec.monthNameSi : rec.monthName}</strong>
                                                                    {rec.isCurrentMonth && (
                                                                        <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {rec.feePaid ? (
                                                                        <Chip
                                                                            icon={<CheckCircle fontSize="small" />}
                                                                            label={lang === 'si' ? 'ගෙවා ඇත' : 'Paid'}
                                                                            size="small"
                                                                            color="success"
                                                                        />
                                                                    ) : (
                                                                        <Chip
                                                                            icon={<HourglassEmpty fontSize="small" />}
                                                                            label={lang === 'si' ? 'නොගෙවූ' : 'Pending'}
                                                                            size="small"
                                                                            color="warning"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell sx={{ color: '#f8fafc' }}>
                                                                    Rs. {rec.feeAmount.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {rec.feePaid ? (
                                                                        <Button
                                                                            size="small"
                                                                            variant="text"
                                                                            startIcon={<Download fontSize="small" />}
                                                                            onClick={() => handleDownloadReceipt(enr, rec)}
                                                                            sx={{ color: '#818cf8' }}
                                                                        >
                                                                            Receipt PDF
                                                                        </Button>
                                                                    ) : (
                                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                                            -
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}

                        {/* TAB 1: ATTENDANCE */}
                        {activeTab === 1 && (
                            <Stack spacing={3}>
                                {portalData.enrollments.map((enr) => (
                                    <Card key={enr.subject} sx={{ bgcolor: '#1e293b', borderRadius: 3, border: '1px solid #334155' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" fontWeight="bold" color="#fff">
                                                    {enr.subject}
                                                </Typography>
                                                <Chip
                                                    label={`${enr.attendancePct}% Attended`}
                                                    color={enr.attendancePct >= 75 ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={enr.attendancePct}
                                                sx={{ height: 8, borderRadius: 4, mb: 2, bgcolor: '#334155' }}
                                            />

                                            <Grid container spacing={1}>
                                                {enr.monthlyRecords.map((m) => (
                                                    <Grid item xs={6} sm={3} key={m.monthIndex}>
                                                        <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#0f172a', borderRadius: 2 }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                                {lang === 'si' ? m.monthNameSi : m.monthName}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="bold" sx={{ color: m.attendedDays > 0 ? '#4ade80' : '#94a3b8' }}>
                                                                {m.attendedDays} / {m.totalDays}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                                Classes Attended
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}

                        {/* TAB 2: EXAM RESULTS & RANKS */}
                        {activeTab === 2 && (
                            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', border: '1px solid #334155' }}>
                                <Typography variant="h6" fontWeight="bold" color="#fff" sx={{ mb: 2 }}>
                                    {lang === 'si' ? 'විභාග ලකුණු සහ ශ්‍රේණිගත කිරීම්' : 'Exam Results & Class Rankings'}
                                </Typography>

                                {portalData.exams.length === 0 ? (
                                    <Typography sx={{ color: '#94a3b8', py: 3, textAlign: 'center' }}>
                                        {lang === 'si' ? 'මෙම සිසුවාට අදාළ විභාග ලකුණු තවමත් ඇතුළත් කර නොමැත.' : 'No exam records found for this student.'}
                                    </Typography>
                                ) : (
                                    <TableContainer component={Paper} sx={{ bgcolor: '#0f172a', borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: '#94a3b8' }}>Exam</TableCell>
                                                    <TableCell sx={{ color: '#94a3b8' }}>Subject</TableCell>
                                                    <TableCell sx={{ color: '#94a3b8' }}>Date</TableCell>
                                                    <TableCell align="center" sx={{ color: '#94a3b8' }}>Marks</TableCell>
                                                    <TableCell align="center" sx={{ color: '#94a3b8' }}>Grade</TableCell>
                                                    <TableCell align="center" sx={{ color: '#94a3b8' }}>Rank</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {portalData.exams.map((ex) => (
                                                    <TableRow key={ex.examId} hover>
                                                        <TableCell sx={{ color: '#f8fafc', fontWeight: 'bold' }}>{ex.title}</TableCell>
                                                        <TableCell sx={{ color: '#f8fafc' }}>{ex.subject}</TableCell>
                                                        <TableCell sx={{ color: '#94a3b8' }}>{new Date(ex.date).toLocaleDateString()}</TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" fontWeight="bold" sx={{ color: ex.marks === 'AB' ? '#ef4444' : '#4ade80' }}>
                                                                {ex.marks}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={ex.gradeBadge} size="small" sx={{ bgcolor: '#334155', color: '#fff', fontWeight: 'bold' }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {ex.rank !== 'N/A' ? (
                                                                <Chip
                                                                    icon={<EmojiEvents fontSize="small" />}
                                                                    label={`#${ex.rank} / ${ex.totalStudents}`}
                                                                    size="small"
                                                                    color={ex.rank <= 3 ? 'warning' : 'default'}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
