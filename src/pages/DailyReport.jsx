import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Container, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Grid,
    Card, CardContent, useTheme, Chip, Avatar, InputAdornment, alpha, IconButton, Tooltip
} from '@mui/material';
import axios from 'axios';
import {
    CalendarToday, Class, Book, Search, EventBusy, EventAvailable, CheckCircle, Cancel, Edit
} from '@mui/icons-material';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionTableRow = motion(TableRow);

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function DailyReport() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [subjectsList, setSubjectsList] = useState([]);
    
    const [reportData, setReportData] = useState(null);
    const [summary, setSummary] = useState({ total: 0, attended: 0, absent: 0, pending: 0, paidMonth: 0, unpaidMonth: 0, paidToday: 0 });
    const [weekIndex, setWeekIndex] = useState(-1);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const theme = useTheme();

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

    const calculateSummary = (students) => {
        let attended = 0, absent = 0, pending = 0, paidMonth = 0, unpaidMonth = 0, paidToday = 0;
        students.forEach(s => {
            if (s.attendanceToday === true || s.attendanceToday === 'present' || s.attendanceToday === 'true') attended++;
            else if (s.attendanceToday === 'absent' || s.attendanceToday === false || s.attendanceToday === 'false') absent++;
            else pending++;

            if (s.feePaidStatus) paidMonth++;
            else unpaidMonth++;

            if (s.paidToday) paidToday++;
        });

        setSummary({
            total: students.length,
            attended, absent, pending, paidMonth, unpaidMonth, paidToday
        });
    };

    const handleGenerate = async () => {
        if (!date || !grade || !subject) {
            setError("Please select all fields");
            return;
        }
        setError(null);
        setLoading(true);
        setTimeout(async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reports/daily`, {
                    params: { date, grade, subject }
                });
                setReportData(response.data.students);
                setWeekIndex(response.data.weekIndex);
                calculateSummary(response.data.students);
            } catch (err) {
                console.error("Error fetching report", err);
                setError(err.response?.data?.message || "Failed to fetch report");
                setReportData(null);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleMarkAttendance = async (studentId, status) => {
        try {
            const reportDateObj = new Date(date);
            const month = reportDateObj.getMonth();
            
            await axios.patch(`${API_BASE_URL}/api/attendance/${studentId}/${subject}/${month}/${weekIndex}`, {
                status: status
            });
            
            // Refresh data locally
            const updatedData = reportData.map(student => {
                if (student.id === studentId) {
                    return { ...student, attendanceToday: status };
                }
                return student;
            });
            
            setReportData(updatedData);
            calculateSummary(updatedData);
        } catch (error) {
            console.error("Error updating attendance:", error);
            alert("Failed to update attendance.");
        }
    };

    const StatCard = ({ title, value, color, icon }) => (
        <Card component={motion.div} variants={itemVariants} sx={{
            height: '100%',
            background: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.2s',
            boxShadow: `0 4px 20px 0 ${alpha(color, 0.15)}`,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 25px 0 ${alpha(color, 0.25)}` }
        }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 } }}>
                <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48, mr: 2 }}>
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>{title}</Typography>
                    <Typography variant="h4" fontWeight={800} color="text.primary">{value}</Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <MotionContainer maxWidth="xl" initial="hidden" animate="visible" variants={containerVariants} sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <EventAvailable fontSize="large" />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Daily Activity Report</Typography>
                    <Typography variant="body2" color="text.secondary">Track today's attendance and fee collections</Typography>
                </Box>
            </Box>

            <MotionPaper variants={itemVariants} elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 4, borderRadius: 4, background: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <Typography variant="caption" color="text.secondary" mb={0.5} ml={1}>Select Date</Typography>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    height: '40px', padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.4), color: theme.palette.text.primary,
                                    fontSize: '1rem', fontFamily: 'inherit', outline: 'none'
                                }}
                            />
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <Typography variant="caption" color="text.secondary" mb={0.5} ml={1}>Select Grade</Typography>
                            <Select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.4) }}
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
                            <Typography variant="caption" color="text.secondary" mb={0.5} ml={1}>Select Subject</Typography>
                            <Select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.4) }}
                            >
                                {subjectsList.map((sub) => (
                                    <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box mt={2.5}>
                            <Button
                                component={motion.button} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                variant="contained" onClick={handleGenerate} disabled={loading} fullWidth
                                startIcon={!loading && <Search />}
                                sx={{ height: 44, borderRadius: 3, fontWeight: 600, textTransform: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Fetch Daily Data"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </MotionPaper>

            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: '#10b981' }} />
                </Box>
            )}

            {!loading && reportData && (
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Total Students" value={summary.total} color={theme.palette.primary.main} icon={<Class />} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Attended explicitly Today" value={summary.attended} color={theme.palette.success.main} icon={<EventAvailable />} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Pending Marking Today" value={summary.pending} color={theme.palette.warning.main} icon={<Edit />} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Absent Today" value={summary.absent} color={theme.palette.error.main} icon={<EventBusy />} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Paid Specially Today" value={summary.paidToday} color="#8b5cf6" icon={<CheckCircle />} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Left to Pay (This Month)" value={summary.unpaidMonth} color={theme.palette.error.light} icon={<Cancel />} /></Grid>
                    </Grid>

                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Index</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Monthly Fee</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Paid Today?</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Today's Attendance</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Quick Mark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No students enrolled</Typography></TableCell></TableRow>
                                ) : (
                                    reportData.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '14px' }}>{row.name.charAt(0)}</Avatar>
                                                    <Typography fontWeight={600}>{row.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Chip label={row.indexNumber} size="small" variant="outlined" /></TableCell>
                                            <TableCell align="center">
                                                <Chip label={row.feePaidStatus ? "Paid" : "Unpaid"} color={row.feePaidStatus ? "success" : "error"} size="small" variant="filled" sx={{ fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.paidToday ? <Chip label="Yes, Today!" color="secondary" size="small" /> : <Typography variant="caption" color="text.secondary">-</Typography>}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.attendanceToday === true || row.attendanceToday === 'present' || row.attendanceToday === 'true' ? "Present" : (row.attendanceToday === 'absent' || row.attendanceToday === false || row.attendanceToday === 'false' ? "Absent" : "Pending")}
                                                    color={row.attendanceToday === true || row.attendanceToday === 'present' || row.attendanceToday === 'true' ? "success" : (row.attendanceToday === 'absent' || row.attendanceToday === false || row.attendanceToday === 'false' ? "error" : "default")}
                                                    size="small"
                                                    variant={row.attendanceToday === 'pending' ? "outlined" : "filled"}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <Tooltip title="Mark Present">
                                                        <IconButton size="small" color="success" onClick={() => handleMarkAttendance(row.id, 'present')} sx={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Mark Absent">
                                                        <IconButton size="small" color="error" onClick={() => handleMarkAttendance(row.id, 'absent')} sx={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                            <Cancel fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </motion.div>
            )}
        </MotionContainer>
    );
}
