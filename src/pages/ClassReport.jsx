
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
    Grid
} from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import API_BASE_URL from '../config';

export default function ClassReport() {
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [month, setMonth] = useState('');
    const [subjectsList, setSubjectsList] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>Class Report</Typography>

            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
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
                        <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
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
                        <FormControl fullWidth sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
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
                            variant="contained"
                            color="primary"
                            onClick={handleGenerate}
                            disabled={loading}
                            fullWidth
                            sx={{
                                height: '56px',
                                borderRadius: 3,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 8px 16px rgba(30, 136, 229, 0.24)'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {reportData && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Index No</strong></TableCell>
                                <TableCell><strong>Mobile</strong></TableCell>
                                <TableCell align="center"><strong>Attendance (Days)</strong></TableCell>
                                <TableCell align="center"><strong>Fee Paid</strong></TableCell>
                                <TableCell align="center"><strong>Tutes Given</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No students found matching these criteria.</TableCell>
                                </TableRow>
                            ) : (
                                reportData.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.indexNumber}</TableCell>
                                        <TableCell>{row.mobile}</TableCell>
                                        <TableCell align="center">
                                            {(() => {
                                                const attendanceCount = countAttendance(row.attendance);
                                                // User requested simple 5 circles system.
                                                const maxDays = 5;
                                                return `${attendanceCount} / ${maxDays}`;
                                            })()}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.feePaid ?
                                                <CheckCircleIcon color="success" /> :
                                                <CancelIcon color="error" />
                                            }
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.tutesGiven ?
                                                <CheckCircleIcon color="success" /> :
                                                <CancelIcon color="disabled" /> /* or error/warning depending on preference */
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
