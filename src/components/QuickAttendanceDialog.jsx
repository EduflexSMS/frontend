import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Chip,
    Avatar,
    InputAdornment,
    Alert,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search,
    CheckCircle,
    WhatsApp,
    Bolt,
    Close,
    School,
    Person
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

// Sound generators & speech synthesizer
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

export default function QuickAttendanceDialog({
    open,
    onClose,
    teacherSubject,
    classes = [],
    onAttendanceMarked
}) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [selectedGrade, setSelectedGrade] = useState('');
    const [quickIndexInput, setQuickIndexInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [markingIndex, setMarkingIndex] = useState(null);
    const [lastMarked, setLastMarked] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const indexInputRef = useRef(null);

    // Color tokens based on theme
    const colors = useMemo(() => ({
        bgDialog: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
        textPrimary: isDark ? '#f8fafc' : '#0f172a',
        textSecondary: isDark ? '#94a3b8' : '#475569',
        textMuted: isDark ? '#64748b' : '#64748b',
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)',
        borderStrong: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.14)',
        inputBg: isDark ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
        rowBg: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
        rowHoverBg: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
        chipUnselectedBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
        indexBoxBg: isDark
            ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(245,158,11,0.06) 100%)'
            : 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(245,158,11,0.05) 100%)',
        indexBoxBorder: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)'
    }), [isDark]);

    // Default to first class if available
    useEffect(() => {
        if (open) {
            setAlertMsg(null);
            setQuickIndexInput('');
            setSearchQuery('');
            if (classes && classes.length > 0 && !selectedGrade) {
                setSelectedGrade(classes[0].name || classes[0].grade || '');
            }
            setTimeout(() => {
                if (indexInputRef.current) indexInputRef.current.focus();
            }, 250);
        }
    }, [open, classes, selectedGrade]);

    // Active class data
    const activeClass = useMemo(() => {
        return classes.find(c => (c.name || c.grade) === selectedGrade) || classes[0] || null;
    }, [classes, selectedGrade]);

    const studentList = useMemo(() => activeClass?.studentList || [], [activeClass]);

    // Filter students
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return studentList;
        const q = searchQuery.toLowerCase();
        return studentList.filter(s =>
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.indexNumber && s.indexNumber.toLowerCase().includes(q))
        );
    }, [studentList, searchQuery]);

    // Mark attendance via API
    const handleMarkAttendance = async (indexNum, studentObj = null) => {
        const indexToUse = (indexNum || '').trim();
        if (!indexToUse) return;

        setMarkingIndex(indexToUse);
        setAlertMsg(null);

        try {
            const subjectToUse = teacherSubject || activeClass?.subject || '';
            const gradeToUse = selectedGrade || activeClass?.name || '';

            const res = await axios.post(`${API_BASE_URL}/api/attendance/qr`, {
                indexNumber: indexToUse,
                subject: subjectToUse,
                grade: gradeToUse
            });

            const data = res.data;
            playSuccessSound();

            const displayName = data.student || studentObj?.name || indexToUse;
            speakText(`${displayName.split(' ')[0]} present.`);

            setLastMarked({
                name: displayName,
                indexNumber: data.indexNumber || indexToUse,
                mobile: data.mobile || studentObj?.mobile,
                feePaid: data.feePaid !== undefined ? data.feePaid : studentObj?.feePaid,
                isFreeCard: data.isFreeCard !== undefined ? data.isFreeCard : studentObj?.isFreeCard,
                status: data.status || 'present',
                week: data.week
            });

            setAlertMsg({
                type: data.status === 'already_marked' ? 'warning' : 'success',
                text: data.status === 'already_marked'
                    ? `${displayName} is already marked present for this session.`
                    : `Marked Present: ${displayName} (${indexToUse})`
            });

            setQuickIndexInput('');
            if (onAttendanceMarked) onAttendanceMarked();

        } catch (err) {
            console.error('Quick Attendance error:', err);
            const msg = err.response?.data?.message || 'Failed to mark attendance. Check index number.';
            setAlertMsg({ type: 'error', text: msg });
        } finally {
            setMarkingIndex(null);
            if (indexInputRef.current) indexInputRef.current.focus();
        }
    };

    const handleQuickInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleMarkAttendance(quickIndexInput);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    bgcolor: colors.bgDialog,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.borderStrong}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: isDark
                        ? '0 25px 60px -12px rgba(0, 0, 0, 0.7)'
                        : '0 25px 50px -12px rgba(15, 23, 42, 0.15)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1.5,
                    borderBottom: `1px solid ${colors.border}`
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '14px',
                            bgcolor: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f59e0b'
                        }}
                    >
                        <Bolt sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', color: colors.textPrimary }}>
                            Quick Attendance Marking
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                            {teacherSubject ? `${teacherSubject} Class` : 'Manual Attendance Entry'} • For students without cards
                        </Typography>
                    </Box>
                </Box>

                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: colors.textSecondary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '10px',
                        '&:hover': { color: colors.textPrimary, bgcolor: colors.rowHoverBg }
                    }}
                >
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                {/* ── Class / Grade Selector Chips ── */}
                {classes.length > 0 && (
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.textSecondary,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                                display: 'block',
                                mb: 1.2
                            }}
                        >
                            Select Class / Grade:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {classes.map(c => {
                                const gName = c.name || c.grade;
                                const isSelected = selectedGrade === gName;
                                const count = c.studentList?.length || c.totalStudents || 0;

                                return (
                                    <Chip
                                        key={c.id || gName}
                                        label={`${gName} (${count})`}
                                        icon={<School sx={{ fontSize: 16, color: isSelected ? '#fff !important' : `${colors.textSecondary} !important` }} />}
                                        clickable
                                        onClick={() => {
                                            setSelectedGrade(gName);
                                            setAlertMsg(null);
                                        }}
                                        sx={{
                                            fontWeight: isSelected ? 800 : 600,
                                            fontSize: '0.84rem',
                                            py: 2.2,
                                            px: 0.8,
                                            bgcolor: isSelected ? 'primary.main' : colors.chipUnselectedBg,
                                            color: isSelected ? '#ffffff' : colors.textPrimary,
                                            border: isSelected ? '1px solid transparent' : `1px solid ${colors.border}`,
                                            boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
                                            transition: 'all 0.18s ease',
                                            '&:hover': {
                                                bgcolor: isSelected ? 'primary.dark' : colors.rowHoverBg
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* ── Direct Index Number Quick Entry Bar ── */}
                <Box
                    sx={{
                        p: 2.2,
                        borderRadius: '18px',
                        background: colors.indexBoxBg,
                        border: `1.5px solid ${colors.indexBoxBorder}`
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#f59e0b',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1
                        }}
                    >
                        <Bolt sx={{ fontSize: 16 }} />
                        Instant Index Number Entry (Press Enter):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                        <TextField
                            inputRef={indexInputRef}
                            value={quickIndexInput}
                            onChange={(e) => setQuickIndexInput(e.target.value)}
                            onKeyDown={handleQuickInputKeyDown}
                            placeholder="Type student index e.g. 2026-0001 (or scan barcode)..."
                            size="small"
                            fullWidth
                            autoComplete="off"
                            sx={{
                                '& .MuiInputBase-root': {
                                    color: colors.textPrimary,
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    borderRadius: '12px',
                                    bgcolor: colors.inputBg
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.borderStrong
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f59e0b'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            disabled={!quickIndexInput.trim() || markingIndex !== null}
                            onClick={() => handleMarkAttendance(quickIndexInput)}
                            sx={{
                                px: 3,
                                borderRadius: '12px',
                                bgcolor: '#f59e0b',
                                color: '#fff',
                                fontWeight: 800,
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
                                '&:hover': { bgcolor: '#d97706' }
                            }}
                        >
                            {markingIndex === quickIndexInput.trim() ? (
                                <CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} />
                            ) : (
                                <Bolt sx={{ mr: 0.5, fontSize: 18 }} />
                            )}
                            Mark Present
                        </Button>
                    </Box>
                </Box>

                {/* ── Status Alert / Message ── */}
                {alertMsg && (
                    <Alert
                        severity={alertMsg.type}
                        onClose={() => setAlertMsg(null)}
                        sx={{
                            borderRadius: '14px',
                            fontWeight: 700,
                            fontSize: '0.88rem'
                        }}
                    >
                        {alertMsg.text}
                    </Alert>
                )}

                {/* ── Last Marked Student Feedback Card ── */}
                {lastMarked && (
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                            border: '1.5px solid rgba(16, 185, 129, 0.35)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1.5
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#10b981', color: '#fff', width: 42, height: 42, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {lastMarked.name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.2 }}>
                                    {lastMarked.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700 }}>
                                        Index: <strong>{lastMarked.indexNumber}</strong>
                                    </Typography>
                                    <Chip
                                        label={lastMarked.isFreeCard ? 'Free Card' : (lastMarked.feePaid ? 'Fee Paid' : 'Fee Pending')}
                                        size="small"
                                        color={lastMarked.isFreeCard ? 'secondary' : (lastMarked.feePaid ? 'success' : 'warning')}
                                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {lastMarked.mobile && (
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<WhatsApp />}
                                href={`https://wa.me/${(() => {
                                    let cleaned = lastMarked.mobile.replace(/[^\d+]/g, '').trim().replace('+', '');
                                    if (cleaned.startsWith('0')) cleaned = '94' + cleaned.slice(1);
                                    if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
                                    return cleaned;
                                })()}?text=${encodeURIComponent(
                                    `Dear Parent,\n*Eduflex Institute*\n\nStudent: *${lastMarked.name}*\nIndex: *${lastMarked.indexNumber}*\nSubject: *${teacherSubject}* (${selectedGrade})\n\nHas attended class today.\nThank you!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    px: 2,
                                    py: 0.7,
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                                }}
                            >
                                WhatsApp Receipt
                            </Button>
                        )}
                    </Box>
                )}

                {/* ── Student List & Search Header ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Class Roster ({filteredStudents.length} Students)
                        </Typography>
                        <TextField
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by name or index..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ fontSize: 18, color: colors.textSecondary }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                width: { xs: '100%', sm: 240 },
                                '& .MuiInputBase-root': {
                                    color: colors.textPrimary,
                                    fontSize: '0.85rem',
                                    borderRadius: '10px',
                                    bgcolor: colors.inputBg
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.border
                                }
                            }}
                        />
                    </Box>

                    {/* Student cards roster list */}
                    <Box
                        sx={{
                            maxHeight: '340px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            pr: 0.5
                        }}
                    >
                        {filteredStudents.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: colors.textSecondary }}>
                                <Person sx={{ fontSize: 40, opacity: 0.4, mb: 0.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    No students found matching "{searchQuery}"
                                </Typography>
                            </Box>
                        ) : (
                            filteredStudents.map(student => {
                                const isMarkedToday = lastMarked?.indexNumber === student.indexNumber;

                                return (
                                    <Box
                                        key={student.id || student.indexNumber}
                                        sx={{
                                            p: 1.4,
                                            px: 2,
                                            borderRadius: '14px',
                                            bgcolor: isMarkedToday
                                                ? (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)')
                                                : colors.rowBg,
                                            border: isMarkedToday
                                                ? '1.5px solid rgba(16, 185, 129, 0.35)'
                                                : `1px solid ${colors.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1.5,
                                            transition: 'all 0.15s ease',
                                            '&:hover': {
                                                bgcolor: colors.rowHoverBg
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    bgcolor: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)',
                                                    color: 'primary.main'
                                                }}
                                            >
                                                {student.name?.charAt(0) || 'S'}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: colors.textPrimary,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {student.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    Index: <strong>{student.indexNumber}</strong>
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                            <Chip
                                                label={student.isFreeCard ? 'Free Card' : (student.feePaid ? 'Paid' : 'Pending')}
                                                size="small"
                                                color={student.isFreeCard ? 'secondary' : (student.feePaid ? 'success' : 'warning')}
                                                variant={student.isFreeCard || student.feePaid ? 'filled' : 'outlined'}
                                                sx={{ height: 24, fontSize: '0.72rem', fontWeight: 800, minWidth: 64 }}
                                            />

                                            <Button
                                                size="small"
                                                variant={isMarkedToday ? 'outlined' : 'contained'}
                                                color={isMarkedToday ? 'success' : 'primary'}
                                                disabled={markingIndex === student.indexNumber}
                                                onClick={() => handleMarkAttendance(student.indexNumber, student)}
                                                sx={{
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    fontSize: '0.78rem',
                                                    py: 0.6,
                                                    px: 1.8,
                                                    minWidth: 110,
                                                    boxShadow: isMarkedToday ? 'none' : '0 3px 10px rgba(99, 102, 241, 0.3)',
                                                    '&:hover': {
                                                        bgcolor: isMarkedToday ? 'rgba(16, 185, 129, 0.15)' : 'primary.dark'
                                                    }
                                                }}
                                            >
                                                {markingIndex === student.indexNumber ? (
                                                    <CircularProgress size={14} sx={{ color: 'inherit' }} />
                                                ) : isMarkedToday ? (
                                                    <>
                                                        <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
                                                        Present
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bolt sx={{ fontSize: 16, mr: 0.4 }} />
                                                        Mark Present
                                                    </>
                                                )}
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    borderTop: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                    💡 Tip: Type student index number &amp; press Enter for high-speed marking.
                </Typography>
                <Button
                    onClick={onClose}
                    variant="contained"
                    size="small"
                    sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#0f172a',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#1e293b'
                        }
                    }}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}
