import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Button, Alert, Snackbar, Grid } from '@mui/material';
import { QrCodeScanner, ArrowBack, Cameraswitch, WhatsApp } from '@mui/icons-material';
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
    const [grades, setGrades] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [scannedStudent, setScannedStudent] = useState(null);
    
    // We use a ref to ensure we don't start multiple scanners
    const scannerRef = useRef(null);
    const lastScanData = useRef('');
    const lastScanTime = useRef(0);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(sessionStorage.getItem('userInfo'));
                if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
                    navigate('/login');
                    return;
                }

                const [subjectsRes, gradesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/subjects`),
                    axios.get(`${API_BASE_URL}/api/students/grades`)
                ]);

                const assigned = user.assignedSubject;
                const filteredSubjects = assigned ? subjectsRes.data.filter(s => s.name === assigned) : subjectsRes.data;

                setSubjects(filteredSubjects);
                setGrades(gradesRes.data);
                
                // If there's only one subject option, pre-select it
                if (filteredSubjects.length === 1) {
                    setSelectedSubject(filteredSubjects[0].name);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (!selectedGrade || !selectedSubject) return;

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
                            subject: selectedSubject,
                            grade: selectedGrade
                        });

                        const { student, indexNumber, mobile, week, status } = response.data;
                        const firstName = student ? student.split(' ')[0] : 'Student';

                        setScannedStudent({
                            name: student,
                            indexNumber: indexNumber || decodedText,
                            mobile: mobile || '',
                            subject: selectedSubject,
                            grade: selectedGrade,
                            week: week,
                            status: status
                        });

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
    }, [selectedGrade, selectedSubject, facingMode]);

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

                <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Grade</InputLabel>
                            <Select
                                value={selectedGrade}
                                label="Select Grade"
                                onChange={(e) => setSelectedGrade(e.target.value)}
                            >
                                {grades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Subject</InputLabel>
                            <Select
                                value={selectedSubject}
                                label="Select Subject"
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                {subjects.map((sub) => (
                                    <MenuItem key={sub._id} value={sub.name}>
                                        {sub.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {scannedStudent && (
                    <Box sx={{
                        mb: 4, p: 2.5,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1 }}>Last Scanned Student</Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>{scannedStudent.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Index: {scannedStudent.indexNumber} | Status: <span style={{ color: scannedStudent.status === 'already_marked' ? '#ff9800' : '#4caf50', fontWeight: 'bold' }}>{scannedStudent.status === 'already_marked' ? 'Already Marked' : 'Present'}</span></Typography>
                        </Box>
                        {scannedStudent.mobile && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<WhatsApp />}
                                href={`https://wa.me/${(() => {
                                    let cleaned = scannedStudent.mobile.replace(/[^\d+]/g, '').trim().replace('+', '');
                                    if (cleaned.startsWith('0')) cleaned = '94' + cleaned.slice(1);
                                    if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
                                    return cleaned;
                                })()}?text=${encodeURIComponent(
                                    `Dear Parent,
*Eduflex Institute*

Student: *${scannedStudent.name}*
Index: *${scannedStudent.indexNumber}*
Subject: *${scannedStudent.subject}* (${scannedStudent.grade})

Has attended the class today.
Thank you!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                                }}
                            >
                                WhatsApp Parent
                            </Button>
                        )}
                    </Box>
                )}

                {(selectedGrade && selectedSubject) && (
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

                {(!selectedGrade || !selectedSubject) && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Please select both Grade and Subject to enable the camera.
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
