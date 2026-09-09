import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Snackbar,
    Grid,
    Chip,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    QrCodeScanner,
    ArrowBack,
    Cameraswitch,
    WhatsApp,
    Wifi,
    WifiOff,
    Sync
} from '@mui/icons-material';
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
    } catch (e) {}
};

const playWarningSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
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
    } catch (e) {}
};

const speakText = (text) => {
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'en-US';
            msg.rate = 1.15;
            window.speechSynthesis.speak(msg);
        } catch (e) {}
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

    // Offline mode & Sync Queue
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineQueue, setOfflineQueue] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('eduflex_offline_scans') || '[]');
        } catch {
            return [];
        }
    });
    const [isSyncing, setIsSyncing] = useState(false);

    const scannerRef = useRef(null);
    const lastScanData = useRef('');
    const lastScanTime = useRef(0);
    const navigate = useNavigate();

    // Listen to online/offline network changes
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load initial grades & subjects
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

                if (filteredSubjects.length === 1) {
                    setSelectedSubject(filteredSubjects[0].name);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [navigate]);

    // Save offline queue to localStorage
    const updateOfflineQueue = (newQueue) => {
        setOfflineQueue(newQueue);
        try {
            localStorage.setItem('eduflex_offline_scans', JSON.stringify(newQueue));
        } catch (e) {
            console.error('Failed to persist offline scans', e);
        }
    };

    // Auto-sync offline scans when back online
    const flushOfflineQueue = useCallback(async () => {
        if (!isOnline || isSyncing || offlineQueue.length === 0) return;

        setIsSyncing(true);
        let remaining = [...offlineQueue];
        let syncedCount = 0;

        for (const item of offlineQueue) {
            try {
                await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                    indexNumber: item.indexNumber,
                    subject: item.subject,
                    grade: item.grade
                });
                remaining = remaining.filter(q => q.id !== item.id);
                syncedCount++;
            } catch (err) {
                // If it fails with already marked or business error, we can safely remove it
                if (err.response && err.response.status < 500) {
                    remaining = remaining.filter(q => q.id !== item.id);
                } else {
                    // Server down or network failure, stop syncing
                    break;
                }
            }
        }

        updateOfflineQueue(remaining);
        setIsSyncing(false);

        if (syncedCount > 0) {
            setMessage({ type: 'success', text: `Successfully synced ${syncedCount} offline attendance records!` });
            setOpenSnackbar(true);
        }
    }, [isOnline, isSyncing, offlineQueue]);

    // Trigger auto-sync when online status changes to true
    useEffect(() => {
        if (isOnline && offlineQueue.length > 0) {
            flushOfflineQueue();
        }
    }, [isOnline, offlineQueue.length, flushOfflineQueue]);

    // Start scanner
    useEffect(() => {
        if (!selectedGrade || !selectedSubject) return;

        const startScanner = async () => {
            try {
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

                    // If currently offline, queue locally immediately
                    if (!navigator.onLine) {
                        const offlineItem = {
                            id: `${decodedText}_${now}`,
                            indexNumber: decodedText,
                            subject: selectedSubject,
                            grade: selectedGrade,
                            scannedAt: new Date().toLocaleTimeString()
                        };
                        const nextQueue = [...offlineQueue, offlineItem];
                        updateOfflineQueue(nextQueue);

                        setScannedStudent({
                            name: `Student (${decodedText})`,
                            indexNumber: decodedText,
                            subject: selectedSubject,
                            grade: selectedGrade,
                            status: 'offline_queued'
                        });

                        playSuccessSound();
                        speakText("Saved offline.");
                        setMessage({ type: 'info', text: `Saved offline (${decodedText}). Will sync automatically.` });
                        setOpenSnackbar(true);
                        return;
                    }

                    // Online attempt
                    try {
                        const response = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                            indexNumber: decodedText,
                            subject: selectedSubject,
                            grade: selectedGrade
                        });

                        const { student, indexNumber, mobile, week, status, feePaid, isFreeCard } = response.data;
                        const firstName = student ? student.split(' ')[0] : 'Student';

                        setScannedStudent({
                            name: student,
                            indexNumber: indexNumber || decodedText,
                            mobile: mobile || '',
                            subject: selectedSubject,
                            grade: selectedGrade,
                            week: week,
                            status: status,
                            feePaid: feePaid,
                            isFreeCard: isFreeCard
                        });

                        if (status === 'already_marked') {
                            setMessage({ type: 'info', text: `Already Marked: ${student}` });
                            playSuccessSound();
                            speakText(`${firstName} already marked.`);
                        } else {
                            if (isFreeCard) {
                                setMessage({ type: 'success', text: `Marked Present: ${student} (Free Card)` });
                                playSuccessSound();
                                speakText(`${firstName} present. Free card.`);
                            } else if (feePaid === false) {
                                setMessage({ type: 'warning', text: `Marked Present: ${student} (⚠️ Fee Pending)` });
                                playWarningSound();
                                speakText(`${firstName} present. Fee pending.`);
                            } else {
                                setMessage({ type: 'success', text: `Marked Present: ${student} (Week ${week})` });
                                playSuccessSound();
                                speakText(`${firstName} present.`);
                            }
                        }
                        setOpenSnackbar(true);

                    } catch (error) {
                        console.error("Scan Error", error);
                        // If network disconnected during request
                        if (!error.response || error.code === 'ERR_NETWORK') {
                            const offlineItem = {
                                id: `${decodedText}_${now}`,
                                indexNumber: decodedText,
                                subject: selectedSubject,
                                grade: selectedGrade,
                                scannedAt: new Date().toLocaleTimeString()
                            };
                            updateOfflineQueue([...offlineQueue, offlineItem]);
                            playSuccessSound();
                            speakText("Queued offline.");
                            setMessage({ type: 'info', text: `Network error. Saved offline (${decodedText}).` });
                        } else {
                            const errMsg = error.response?.data?.message || "Scan Failed";
                            setMessage({ type: 'error', text: errMsg });
                            playErrorSound();
                            speakText("Error. Check student details.");
                        }
                        setOpenSnackbar(true);
                    }
                };

                const onScanFailure = () => {};

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
                            await scannerRef.current.start(
                                { facingMode: "user" },
                                config,
                                onScanSuccess,
                                onScanFailure
                            );
                            setFacingMode("user");
                        } catch (fallbackErr) {
                            setMessage({ type: 'error', text: 'Camera access failed. Please grant camera permissions.' });
                            setOpenSnackbar(true);
                        }
                    } else {
                        setMessage({ type: 'error', text: 'Failed to access camera.' });
                        setOpenSnackbar(true);
                    }
                }
            } catch (err) {
                console.error("Error initializing scanner:", err);
            }
        };

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
    }, [selectedGrade, selectedSubject, facingMode, offlineQueue]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                    Back to Dashboard
                </Button>

                {/* Online / Offline Status Badge */}
                <Stack direction="row" spacing={1} alignItems="center">
                    {isOnline ? (
                        <Chip
                            icon={<Wifi fontSize="small" />}
                            label="Online"
                            color="success"
                            size="small"
                            variant="outlined"
                        />
                    ) : (
                        <Chip
                            icon={<WifiOff fontSize="small" />}
                            label="Offline Mode"
                            color="warning"
                            size="small"
                        />
                    )}

                    {offlineQueue.length > 0 && (
                        <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={isSyncing ? <CircularProgress size={14} color="inherit" /> : <Sync />}
                            onClick={flushOfflineQueue}
                            disabled={!isOnline || isSyncing}
                        >
                            Sync {offlineQueue.length} Scans
                        </Button>
                    )}
                </Stack>
            </Box>

            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Attendance Scanner
                </Typography>

                {/* Offline alert banner */}
                {offlineQueue.length > 0 && (
                    <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                        <strong>{offlineQueue.length} scans saved offline.</strong> They will automatically sync to the database once connection is restored.
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mb: 4, mt: 1 }}>
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

                {/* Scanned Student Card */}
                {scannedStudent && (
                    <Box sx={{
                        mb: 4, p: 2.5,
                        borderRadius: '16px',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: scannedStudent.feePaid === false ? 'warning.main' : 'divider',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 1 }}>
                                Last Scanned Student
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
                                {scannedStudent.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Index: <strong>{scannedStudent.indexNumber}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">|</Typography>
                                {scannedStudent.status === 'already_marked' ? (
                                    <Chip label="Already Marked" size="small" color="warning" />
                                ) : scannedStudent.status === 'offline_queued' ? (
                                    <Chip label="Queued Offline" size="small" color="info" />
                                ) : (
                                    <Chip label="Marked Present" size="small" color="success" />
                                )}

                                {/* Fee Status Badge */}
                                {scannedStudent.isFreeCard ? (
                                    <Chip label="Free Card" size="small" color="secondary" />
                                ) : scannedStudent.feePaid === true ? (
                                    <Chip label="Fees Paid" size="small" color="success" variant="outlined" />
                                ) : scannedStudent.feePaid === false ? (
                                    <Chip label="Fees Pending" size="small" color="error" variant="filled" />
                                ) : null}
                            </Stack>
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

Has attended class today.
Thank you!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
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
                        </Box>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={message.type || 'info'}
                    sx={{ width: '100%', borderRadius: '12px' }}
                >
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
}
