import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Button, Alert, Snackbar } from '@mui/material';
import { QrCodeScanner, ArrowBack, Cameraswitch } from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

// Sound generators and Speech Synthesizer
const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch(e){}
};

const playErrorSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e){}
};

const speakText = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US';
        msg.rate = 1.1; // Slightly faster
        window.speechSynthesis.speak(msg);
    }
};

export default function QRScanner() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    
    // We use a ref to ensure we don't start multiple scanners
    const scannerRef = useRef(null);
    const lastScanData = useRef('');
    const lastScanTime = useRef(0);
    
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!selectedSubject) return;

        const startScanner = async () => {
            try {
                // Initialize if not already initialized
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode("qr-reader");
                }

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                
                const onScanSuccess = async (decodedText) => {
                    const now = Date.now();
                    // Prevent duplicate scans within 3 seconds
                    if (decodedText === lastScanData.current && (now - lastScanTime.current) < 3000) {
                        return;
                    }
                    
                    lastScanData.current = decodedText;
                    lastScanTime.current = now;

                    try {
                        const response = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                            indexNumber: decodedText,
                            subject: selectedSubject
                        });

                        const { student, week, status } = response.data;
                        const firstName = student ? student.split(' ')[0] : 'Student';

                        if (status === 'already_marked') {
                            setMessage({ type: 'info', text: `Already Marked: ${student}` });
                            playSuccessSound();
                            speakText(`${firstName} is already marked.`);
                        } else {
                            setMessage({ type: 'success', text: `Marked Present: ${student} (Week ${week})` });
                            playSuccessSound();
                            speakText(`${firstName} is marked present.`);
                        }
                        setOpenSnackbar(true);

                    } catch (error) {
                        console.error("Scan Error", error);
                        const errMsg = error.response?.data?.message || "Scan Failed";
                        setMessage({ type: 'error', text: errMsg });
                        setOpenSnackbar(true);
                        playErrorSound();
                        speakText("Error. Attendance not marked.");
                    }
                };

                const onScanFailure = (error) => {
                    // Ignore frame failures
                };

                try {
                    await scannerRef.current.start(
                        { facingMode: facingMode },
                        config,
                        onScanSuccess,
                        onScanFailure
                    );
                } catch (err) {
                    console.error("Camera start failed:", err);
                    if (facingMode === 'environment') {
                        try {
                            console.warn("Falling back to user camera...");
                            await scannerRef.current.start(
                                { facingMode: "user" },
                                config,
                                onScanSuccess,
                                onScanFailure
                            );
                            setFacingMode("user");
                        } catch (fallbackErr) {
                             console.error("All camera fallback failed:", fallbackErr);
                             setMessage({ type: 'error', text: 'Camera access failed. Please grant camera permissions.' });
                             setOpenSnackbar(true);
                        }
                    } else {
                         setMessage({ type: 'error', text: 'Failed to access camera. It might be in use or permissions denied.' });
                         setOpenSnackbar(true);
                    }
                }
            } catch (err) {
                console.error("Error initializing scanner:", err);
            }
        };

        // Delay starting slightly to ensure DOM element is mounted
        const timer = setTimeout(() => {
            startScanner();
        }, 300);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => {
                    console.error("Failed to stop scanner", err);
                });
            }
        };
    }, [selectedSubject, facingMode]);

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
                    <Box sx={{ maxWidth: '500px', margin: '0 auto', textAlign: 'right' }}>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<Cameraswitch />} 
                            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                            sx={{ mb: 2, borderRadius: '20px', textTransform: 'none' }}
                        >
                            Switch Camera
                        </Button>
                        <Box sx={{
                            border: '2px dashed #ccc',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            bgcolor: '#000',
                            position: 'relative'
                        }}>
                            <div id="qr-reader" style={{ width: '100%', minHeight: '300px' }}></div>
                            <Typography variant="caption" sx={{ 
                                color: 'white', 
                                display: 'block', 
                                p: 1, 
                                position: 'absolute', 
                                bottom: 0, 
                                width: '100%', 
                                textAlign: 'center', 
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 10
                            }}>
                                Point camera at student QR code
                            </Typography>
                        </Box>
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
