import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Container, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Button, Alert, Snackbar } from '@mui/material';
import { QrCodeScanner, ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

export default function QRScanner() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [lastScanned, setLastScanned] = useState('');
    const [showSuccessMark, setShowSuccessMark] = useState(false);
    const audioCtxRef = useRef(null);

    // Use refs to access latest state in the scan callback without recreating scanner
    const selectedSubjectRef = useRef(selectedSubject);
    const lastScannedRef = useRef(lastScanned);

    const navigate = useNavigate();

    useEffect(() => {
        selectedSubjectRef.current = selectedSubject;
    }, [selectedSubject]);

    useEffect(() => {
        lastScannedRef.current = lastScanned;
    }, [lastScanned]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const user = JSON.parse(sessionStorage.getItem('userInfo'));
                if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
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

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playBeep = (type = 'success') => {
        try {
            initAudio();
            const audioCtx = audioCtxRef.current;
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = type === 'success' ? 'sine' : 'sawtooth';
            oscillator.frequency.value = type === 'success' ? 800 : 200;
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
            }, type === 'success' ? 150 : 300);
        } catch (e) {
            console.error("Audio Context failed", e);
        }
    };

    const handleScanSuccess = useCallback(async (decodedText, decodedResult) => {
        if (decodedText && decodedText !== lastScannedRef.current) {
            setLastScanned(decodedText);
            const indexNumber = decodedText;
            const currentSubject = selectedSubjectRef.current;

            if (!currentSubject) {
                setMessage({ type: 'warning', text: 'Please select a subject first' });
                setOpenSnackbar(true);
                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                    indexNumber: indexNumber,
                    subject: currentSubject
                });

                const { student, week, status } = response.data;

                playBeep();
                setShowSuccessMark(true);
                setTimeout(() => setShowSuccessMark(false), 1500);

                if (status === 'already_marked') {
                    setMessage({ type: 'info', text: `Already Marked: ${student}` });
                } else {
                    setMessage({ type: 'success', text: `Marked Present: ${student} (Week ${week})` });
                }
                setOpenSnackbar(true);

                // Allow re-scanning same code after 3s
                setTimeout(() => setLastScanned(''), 3000);

            } catch (error) {
                console.error("Scan Error", error);

                // Play beep to acknowledge scan even if it failed? (Optional, maybe not for failure)
                // Let's add a lower beep for failure
                playBeep('error');

                const errMsg = error.response?.data?.message || "Scan Failed";
                setMessage({ type: 'error', text: errMsg });
                setOpenSnackbar(true);

                setTimeout(() => setLastScanned(''), 3000);
            }
        }
    }, []);

    const handleScanFailure = (error) => {
        // Ignored to avoid cluttering console with continuous normal failures
    };

    useEffect(() => {
        if (!selectedSubject) return;

        const scannerId = "qr-reader";
        let html5QrcodeScanner;

        const timer = setTimeout(() => {
            html5QrcodeScanner = new Html5QrcodeScanner(
                scannerId,
                { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
                /* verbose= */ false
            );

            html5QrcodeScanner.render(handleScanSuccess, handleScanFailure);
        }, 300);

        return () => {
            clearTimeout(timer);
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [selectedSubject, handleScanSuccess]);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>

            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center', position: 'relative' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" onClick={initAudio}>
                    <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Attendance Scanner
                </Typography>

                <FormControl fullWidth sx={{ mb: 4, mt: 2 }}>
                    <InputLabel>Select Subject to Mark Attendance</InputLabel>
                    <Select
                        value={selectedSubject}
                        label="Select Subject to Mark Attendance"
                        onChange={(e) => {
                            initAudio(); // Initialize audio on user interaction
                            setSelectedSubject(e.target.value);
                        }}
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
                        borderRadius: '16px',
                        overflow: 'hidden',
                        maxWidth: '500px',
                        margin: '0 auto',
                        position: 'relative',
                        border: '2px dashed #999',
                        bgcolor: '#fafafa'
                    }}>
                        <div id="qr-reader" style={{ width: '100%' }}></div>

                        {showSuccessMark && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: 10,
                                animation: 'fadeInOut 1.5s ease-in-out'
                            }}>
                                <CheckCircleOutline sx={{ fontSize: 120, color: '#4caf50' }} />
                            </Box>
                        )}
                        <style>
                            {`
                                @keyframes fadeInOut {
                                    0% { opacity: 0; transform: scale(0.5); }
                                    20% { opacity: 1; transform: scale(1.2); }
                                    30% { transform: scale(1); }
                                    80% { opacity: 1; transform: scale(1); }
                                    100% { opacity: 0; transform: scale(1.5); }
                                }
                                #qr-reader {
                                    border: none !important;
                                }
                                #qr-reader button {
                                    padding: 8px 16px;
                                    margin: 10px;
                                    background: #1976d2;
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-weight: bold;
                                }
                                #qr-reader select {
                                    padding: 8px;
                                    margin: 10px;
                                    border-radius: 4px;
                                }
                                #qr-reader a {
                                    color: #1976d2;
                                    text-decoration: none;
                                }
                            `}
                        </style>
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
                autoHideDuration={4000}
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
