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
    Chip,
    Stack,
    CircularProgress,
    TextField,
    Avatar
} from '@mui/material';
import {
    QrCodeScanner,
    ArrowBack,
    Cameraswitch,
    WhatsApp,
    Wifi,
    WifiOff,
    Sync,
    Bolt,
    CheckCircle,
    History,
    School
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
    const [recentScans, setRecentScans] = useState([]);

    // Manual / Cardless Input State
    const [manualIndex, setManualIndex] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const manualInputRef = useRef(null);

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
                const user = JSON.parse(sessionStorage.getItem('userInfo')) || JSON.parse(localStorage.getItem('userInfo'));
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
                setGrades(gradesRes.data || []);

                if (filteredSubjects.length === 1) {
                    setSelectedSubject(filteredSubjects[0].name);
                }
            } catch (error) {
                console.error("Failed to fetch initial scanner data", error);
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
                if (err.response && err.response.status < 500) {
                    remaining = remaining.filter(q => q.id !== item.id);
                } else {
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

    useEffect(() => {
        if (isOnline && offlineQueue.length > 0) {
            flushOfflineQueue();
        }
    }, [isOnline, offlineQueue.length, flushOfflineQueue]);

    // Unified Attendance Processing Function (works for both QR scan & Manual typing)
    const processAttendance = useCallback(async (indexNumberToProcess) => {
        const indexNum = (indexNumberToProcess || '').toString().trim();
        if (!indexNum) return;

        if (!selectedSubject) {
            setMessage({ type: 'error', text: 'Please select a Subject first.' });
            setOpenSnackbar(true);
            playErrorSound();
            return;
        }

        const now = Date.now();

        // If currently offline, queue locally immediately
        if (!navigator.onLine) {
            const offlineItem = {
                id: `${indexNum}_${now}`,
                indexNumber: indexNum,
                subject: selectedSubject,
                grade: selectedGrade || '',
                scannedAt: new Date().toLocaleTimeString()
            };
            updateOfflineQueue([...offlineQueue, offlineItem]);
            playSuccessSound();
            speakText("Queued offline.");

            const studentObj = {
                name: `Student (${indexNum})`,
                indexNumber: indexNum,
                grade: selectedGrade || 'Current',
                subject: selectedSubject,
                status: 'offline_queued'
            };
            setScannedStudent(studentObj);
            setRecentScans(prev => [studentObj, ...prev.slice(0, 9)]);
            setMessage({ type: 'info', text: `Saved offline (${indexNum}). Will sync once online.` });
            setOpenSnackbar(true);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                indexNumber: indexNum,
                subject: selectedSubject,
                grade: selectedGrade || undefined
            });

            const { student, mobile, status, week, feePaid, isFreeCard } = response.data;
            const firstName = student ? student.split(' ')[0] : 'Student';

            const resultObj = {
                name: student || indexNum,
                indexNumber: indexNum,
                mobile: mobile || '',
                grade: selectedGrade || 'Current',
                subject: selectedSubject,
                status: status || 'present',
                week: week || 1,
                feePaid,
                isFreeCard
            };

            setScannedStudent(resultObj);
            setRecentScans(prev => [resultObj, ...prev.filter(s => s.indexNumber !== indexNum).slice(0, 9)]);

            if (status === 'already_marked') {
                setMessage({ type: 'warning', text: `Already Marked: ${student} (Week ${week})` });
                playWarningSound();
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
            console.error("Attendance Error:", error);
            if (!error.response || error.code === 'ERR_NETWORK') {
                const offlineItem = {
                    id: `${indexNum}_${now}`,
                    indexNumber: indexNum,
                    subject: selectedSubject,
                    grade: selectedGrade || '',
                    scannedAt: new Date().toLocaleTimeString()
                };
                updateOfflineQueue([...offlineQueue, offlineItem]);
                playSuccessSound();
                speakText("Queued offline.");
                setMessage({ type: 'info', text: `Network error. Saved offline (${indexNum}).` });
            } else {
                const errMsg = error.response?.data?.message || "Attendance Failed";
                setMessage({ type: 'error', text: errMsg });
                playErrorSound();
                speakText("Error. Check student details.");
            }
            setOpenSnackbar(true);
        }
    }, [selectedSubject, selectedGrade, offlineQueue]);

    // Handle manual form submission
    const handleManualSubmit = async () => {
        if (!manualIndex.trim()) return;
        setIsSubmitting(true);
        await processAttendance(manualIndex.trim());
        setManualIndex('');
        setIsSubmitting(false);
        if (manualInputRef.current) manualInputRef.current.focus();
    };

    // Camera scanner initialization
    useEffect(() => {
        if (!selectedGrade || !selectedSubject) return;

        const startScanner = async () => {
            try {
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode("qr-reader");
                }

                const config = { fps: 10, qrbox: { width: 260, height: 260 } };

                const onScanSuccess = async (decodedText) => {
                    const now = Date.now();
                    if (decodedText === lastScanData.current && (now - lastScanTime.current) < 3000) {
                        return;
                    }
                    lastScanData.current = decodedText;
                    lastScanTime.current = now;
                    await processAttendance(decodedText);
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
                            setMessage({ type: 'error', text: 'Camera access failed. Please allow camera permissions or use manual entry.' });
                            setOpenSnackbar(true);
                        }
                    } else {
                        setMessage({ type: 'error', text: 'Failed to access camera. You can use manual entry below.' });
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
    }, [selectedGrade, selectedSubject, facingMode, processAttendance]);

    return (
        <Container maxWidth="md" sx={{ py: 3, pb: 8 }}>
            {/* ── Top Header Navigation ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: '10px',
                        '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' }
                    }}
                >
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
                            sx={{ fontWeight: 700 }}
                        />
                    ) : (
                        <Chip
                            icon={<WifiOff fontSize="small" />}
                            label="Offline Mode"
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 700 }}
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
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
                        >
                            Sync {offlineQueue.length} Scans
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* ── Main Scanner Card ── */}
            <Paper
                sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: '24px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 20px 45px -10px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                {/* Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '14px',
                            bgcolor: 'rgba(99, 102, 241, 0.15)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <QrCodeScanner sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>
                        Attendance Scanner
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    Scan student QR cards or enter index numbers manually for instant attendance marking
                </Typography>

                {/* Offline alert banner */}
                {offlineQueue.length > 0 && (
                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: '14px' }}>
                        <strong>{offlineQueue.length} scans saved offline.</strong> They will automatically sync to the database once connection is restored.
                    </Alert>
                )}

                {/* ── Full-Width Robust Selectors (Never Squished) ── */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                        mb: 3,
                        width: '100%'
                    }}
                >
                    <FormControl fullWidth size="medium">
                        <InputLabel id="scanner-grade-label">Select Grade</InputLabel>
                        <Select
                            labelId="scanner-grade-label"
                            value={selectedGrade}
                            label="Select Grade"
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            sx={{
                                borderRadius: '14px',
                                fontWeight: 700,
                                bgcolor: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            {grades.map((grade) => (
                                <MenuItem key={grade} value={grade} sx={{ fontWeight: 600 }}>
                                    {grade}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="medium">
                        <InputLabel id="scanner-subject-label">Select Subject</InputLabel>
                        <Select
                            labelId="scanner-subject-label"
                            value={selectedSubject}
                            label="Select Subject"
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            sx={{
                                borderRadius: '14px',
                                fontWeight: 700,
                                bgcolor: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            {subjects.map((sub) => (
                                <MenuItem key={sub._id} value={sub.name} sx={{ fontWeight: 600 }}>
                                    {sub.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* ── Manual Quick Entry Bar (For Students without Cards) ── */}
                <Box
                    sx={{
                        p: 2.2,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(99,102,241,0.05) 100%)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        mb: 3.5
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Bolt sx={{ fontSize: 16 }} />
                            Cardless / Manual Quick Attendance
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Supports USB barcode scanners or typing
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                        <TextField
                            inputRef={manualInputRef}
                            value={manualIndex}
                            onChange={(e) => setManualIndex(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualSubmit();
                                }
                            }}
                            placeholder="Type student index number e.g. 2026-0001 (Press Enter)..."
                            size="small"
                            fullWidth
                            autoComplete="off"
                            sx={{
                                '& .MuiInputBase-root': {
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    bgcolor: 'rgba(0,0,0,0.18)'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(245,158,11,0.3)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f59e0b'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            disabled={!manualIndex.trim() || isSubmitting}
                            onClick={handleManualSubmit}
                            sx={{
                                borderRadius: '12px',
                                bgcolor: '#f59e0b',
                                color: '#fff',
                                fontWeight: 800,
                                px: 3,
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
                                '&:hover': { bgcolor: '#d97706' }
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : <Bolt sx={{ mr: 0.5, fontSize: 18 }} />}
                            Mark Present
                        </Button>
                    </Box>
                </Box>

                {/* ── Last Scanned Student Feedback Card ── */}
                {scannedStudent && (
                    <Box
                        sx={{
                            mb: 3.5,
                            p: 2.5,
                            borderRadius: '18px',
                            bgcolor: scannedStudent.status === 'already_marked'
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(16, 185, 129, 0.08)',
                            border: '1.5px solid',
                            borderColor: scannedStudent.status === 'already_marked'
                                ? 'rgba(245, 158, 11, 0.35)'
                                : 'rgba(16, 185, 129, 0.35)',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: scannedStudent.status === 'already_marked' ? '#f59e0b' : '#10b981',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}
                            >
                                {scannedStudent.name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1, color: 'text.secondary' }}>
                                    Latest Attendance Record
                                </Typography>
                                <Typography variant="h6" fontWeight="800" sx={{ mt: 0.2 }}>
                                    {scannedStudent.name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Index: <strong>{scannedStudent.indexNumber}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                    {scannedStudent.status === 'already_marked' ? (
                                        <Chip label="Already Marked" size="small" color="warning" sx={{ fontWeight: 700 }} />
                                    ) : scannedStudent.status === 'offline_queued' ? (
                                        <Chip label="Queued Offline" size="small" color="info" sx={{ fontWeight: 700 }} />
                                    ) : (
                                        <Chip label="Marked Present" size="small" color="success" sx={{ fontWeight: 700 }} />
                                    )}

                                    {/* Fee Status Badge */}
                                    {scannedStudent.isFreeCard ? (
                                        <Chip label="Free Card" size="small" color="secondary" sx={{ fontWeight: 700 }} />
                                    ) : scannedStudent.feePaid === true ? (
                                        <Chip label="Fees Paid" size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                                    ) : scannedStudent.feePaid === false ? (
                                        <Chip label="Fees Pending" size="small" color="error" variant="filled" sx={{ fontWeight: 700 }} />
                                    ) : null}
                                </Stack>
                            </Box>
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
                                    `Dear Parent,\n*Eduflex Institute*\n\nStudent: *${scannedStudent.name}*\nIndex: *${scannedStudent.indexNumber}*\nSubject: *${scannedStudent.subject}* (${scannedStudent.grade})\n\nHas attended class today.\nThank you!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                                }}
                            >
                                WhatsApp Receipt
                            </Button>
                        )}
                    </Box>
                )}

                {/* ── Camera Scanner Viewport ── */}
                {selectedGrade && selectedSubject ? (
                    <Box sx={{ maxWidth: '480px', margin: '0 auto', textAlign: 'right' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<Cameraswitch />}
                            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                            sx={{ mb: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                        >
                            Switch Camera
                        </Button>
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'primary.main',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                bgcolor: '#000',
                                position: 'relative',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div id="qr-reader" style={{ width: '100%', minHeight: '280px' }}></div>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            p: 4,
                            borderRadius: '20px',
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: 'rgba(255,255,255,0.01)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5
                        }}
                    >
                        <School sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.6 }} />
                        <Typography variant="h6" fontWeight="700">
                            Select Grade &amp; Subject to Enable Camera
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                            Choose the current class from the dropdowns above to activate live QR camera scanning. Or enter index numbers manually anytime above!
                        </Typography>
                    </Box>
                )}

                {/* ── Recent Scans Roster Feed ── */}
                {recentScans.length > 0 && (
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <History sx={{ fontSize: 18, color: 'primary.main' }} />
                                Recent Scans This Session ({recentScans.length})
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '200px', overflowY: 'auto' }}>
                            {recentScans.map((item, idx) => (
                                <Box
                                    key={`${item.indexNumber}_${idx}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.2,
                                        px: 2,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
                                        <Typography variant="body2" fontWeight="700">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ({item.indexNumber})
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={item.isFreeCard ? 'Free Card' : (item.feePaid ? 'Paid' : 'Pending')}
                                        size="small"
                                        color={item.isFreeCard ? 'secondary' : (item.feePaid ? 'success' : 'warning')}
                                        variant={item.isFreeCard || item.feePaid ? 'filled' : 'outlined'}
                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                                    />
                                </Box>
                            ))}
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
                    sx={{ width: '100%', borderRadius: '14px', fontWeight: 700 }}
                >
                    {message.text}
                </Alert>
            </Snackbar>
        </Container>
    );
}
