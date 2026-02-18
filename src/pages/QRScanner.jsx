import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Button, Alert, Snackbar } from '@mui/material';
import { QrCodeScanner, ArrowBack } from '@mui/icons-material';
import QrReader from 'react-qr-scanner';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

export default function QRScanner() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [scanResult, setScanResult] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [lastScanned, setLastScanned] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch subjects for the teacher
        const fetchSubjects = async () => {
            try {
                const user = JSON.parse(sessionStorage.getItem('userInfo'));
                if (!user || user.role !== 'teacher') {
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
                // Filter if teacher is assigned to specific subject, or show all
                const assigned = user.assignedSubject;
                if (assigned) {
                    setSubjects(data.filter(s => s.name === assigned));
                    setSelectedSubject(assigned);
                } else {
                    setSubjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }
        };
        fetchSubjects();
    }, [navigate]);

    const handleScan = async (data) => {
        if (data && data.text && data.text !== lastScanned) {
            setLastScanned(data.text);
            const indexNumber = data.text;

            if (!selectedSubject) {
                setMessage({ type: 'warning', text: 'Please select a subject first' });
                setOpenSnackbar(true);
                return;
            }

            try {
                // Play beep sound
                const audio = new Audio('/beep.mp3'); // Ensure beep.mp3 exists or remove
                if (audio) audio.play().catch(e => console.log('Audio play failed', e));

                const response = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                    indexNumber: indexNumber,
                    subject: selectedSubject
                });

                const { student, week, status } = response.data;

                if (status === 'already_marked') {
                    setMessage({ type: 'info', text: `Already Marked: ${student}` });
                } else {
                    setMessage({ type: 'success', text: `Marked Present: ${student} (Week ${week})` });
                }
                setOpenSnackbar(true);

                // Reset last scanned after delay to allow re-scanning same code if needed (e.g. mistake)
                // But for now, we keep it to prevent double hits
                setTimeout(() => setLastScanned(''), 3000);

            } catch (error) {
                console.error("Scan Error", error);
                const errMsg = error.response?.data?.message || "Scan Failed";
                setMessage({ type: 'error', text: errMsg });
                setOpenSnackbar(true);
                setTimeout(() => setLastScanned(''), 3000);
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>

            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Attendance Scanner
                </Typography>

                <FormControl fullWidth sx={{ mb: 4, mt: 2 }}>
                    <InputLabel>Select Subject to Mark Attendance</InputLabel>
                    <Select
                        value={selectedSubject}
                        label="Select Subject to Mark Attendance"
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        {subjects.map((sub) => (
                            <MenuItem key={sub._id} value={sub.name}>
                                {sub.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedSubject && (
                    <Box sx={{
                        mt: 2,
                        border: '2px dashed #ccc',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        maxWidth: '500px',
                        margin: '0 auto',
                        bgcolor: '#000'
                    }}>
                        {/* Note: react-qr-scanner might need legacy Mode or specific styling */}
                        <QrReader
                            delay={300}
                            style={{ width: '100%' }}
                            onError={handleError}
                            onScan={handleScan}
                            constraints={{
                                audio: false,
                                video: { facingMode: "environment" }
                            }}
                        />
                        <Typography variant="caption" sx={{ color: 'white', display: 'block', p: 1 }}>
                            Point camera at student QR code
                        </Typography>
                    </Box>
                )}

                {!selectedSubject && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Please select a subject to enable the camera.
                    </Alert>
                )}
            </Paper>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={message.type || 'info'} sx={{ width: '100%', fontSize: '1.2rem' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
}
