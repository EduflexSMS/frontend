
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
    Avatar
} from '@mui/material';
import axios from 'axios';
import { Person, Phone, EventAvailable, Book, Assessment, FilterList, Search } from '@mui/icons-material';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
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
    };

    const countAttendance = (attendanceArray) => {
        if (!attendanceArray) return 0;
        return attendanceArray.filter(Boolean).length;
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
                sx={{
                    mb: 2,
                    borderRadius: 4,
                    boxShadow: 'var(--card-shadow)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}
            >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'var(--primary-color)' }}>{row.name.charAt(0)}</Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            #{row.indexNumber}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={row.feePaid ? "Paid" : "Unpaid"}
                                    color={row.feePaid ? "success" : "error"}
                                    size="small"
                                    sx={{ borderRadius: 2, fontWeight: 600 }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 0.5 }} />
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone fontSize="small" /> Mobile
                            </Typography>
                            <Typography variant="body2">{row.mobile}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EventAvailable fontSize="small" /> Attendance
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">{attendanceCount}/{maxDays}</Typography>
                                <CircularProgress
                                    variant="determinate"
                                    value={(attendanceCount / maxDays) * 100}
                                    size={16}
                                    color="secondary"
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 3 }}>
                                <Book fontSize="small" color="action" />
                                <Typography variant="body2" sx={{ flexGrow: 1 }}>Tutes Given</Typography>
                                <Chip
                                    label={row.tutesGiven ? "Given" : "Pending"}
                                    color={row.tutesGiven ? "success" : "default"}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )
    };

    return (
        <Container maxWidth="lg">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <Assessment color="primary" fontSize="large" />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Class Reports</Typography>
                        <Typography variant="body2" color="text.secondary">Generate and view detailed class performance reports.</Typography>
                    </Box>
                </Box>

                <Paper
                    component={motion.div}
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 4 },
                        mb: 4,
                        borderRadius: 4,
                        boxShadow: 'var(--card-shadow)',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid white'
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterList /> Filter Criteria
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}>
                                <InputLabel>Grade</InputLabel>
                                <Select
                                    value={grade}
                                    label="Grade"
                                    onChange={(e) => setGrade(e.target.value)}
                                >
                                    {[...Array(13)].map((_, i) => {
                                        const gradeNum = (i + 1).toString().padStart(2, '0');
                                        return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>Grade {gradeNum}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                    value={subject}
                                    label="Subject"
                                    onChange={(e) => setSubject(e.target.value)}
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
                            <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={month}
                                    label="Month"
                                    onChange={(e) => setMonth(e.target.value)}
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
                                color="primary"
                                onClick={handleGenerate}
                                disabled={loading}
                                fullWidth
                                startIcon={!loading && <Search />}
                                sx={{
                                    height: '56px',
                                    borderRadius: 3,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.24)'
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

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
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress size={50} thickness={4} />
                    </Box>
                )}

                {reportData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Results: {reportData.length} Students</Typography>
                        </Box>

                        {isMobile ? (
                            <Box>
                                {reportData.length === 0 ? (
                                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                                        <Typography color="text.secondary">No students found.</Typography>
                                    </Paper>
                                ) : (
                                    reportData.map((row) => (
                                        <ReportCard key={row.id} row={row} />
                                    ))
                                )}
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'var(--primary-color)' }}>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Name</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Index No</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Attendance (Days)</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Fee Paid</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Tutes Given</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">No students found matching these criteria.</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reportData.map((row, index) => (
                                                <TableRow
                                                    component={motion.tr}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    key={row.id}
                                                    hover
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 500 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'var(--secondary-color)' }}>{row.name.charAt(0)}</Avatar>
                                                            {row.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={row.indexNumber} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>{row.mobile}</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                            <CircularProgress
                                                                variant="determinate"
                                                                value={(countAttendance(row.attendance) / 5) * 100}
                                                                size={24}
                                                                color="primary"
                                                                thickness={5}
                                                            />
                                                            <Typography fontWeight="bold">{countAttendance(row.attendance)} / 5</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={row.feePaid ? "Paid" : "Unpaid"}
                                                            color={row.feePaid ? "success" : "error"}
                                                            variant="filled" // Bold filled style for importance
                                                            size="small"
                                                            sx={{ minWidth: 80, fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={row.tutesGiven ? "Given" : "Pending"}
                                                            color={row.tutesGiven ? "success" : "warning"}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ minWidth: 80 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </Container>
    );
}
