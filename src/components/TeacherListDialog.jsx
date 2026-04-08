import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Button, Grid, Chip, Avatar,
    Box, Typography, CircularProgress, alpha, IconButton
} from '@mui/material';
import { Person, Close, AutoAwesome, School } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import TeacherPaymentDialog from './TeacherPaymentDialog';
import { useTheme } from '@mui/material/styles';

// Inject keyframes once
const injectStyles = () => {
    if (document.getElementById('tlg-styles')) return;
    const style = document.createElement('style');
    style.id = 'tlg-styles';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes tlg-fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tlg-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
        @keyframes tlg-pulse-ring {
            0%   { transform: scale(1);   opacity: 0.4; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes tlg-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }

        .tlg-card {
            animation: tlg-fadeUp 0.5s ease both;
        }
        .tlg-card:nth-child(1)  { animation-delay: 0.05s; }
        .tlg-card:nth-child(2)  { animation-delay: 0.10s; }
        .tlg-card:nth-child(3)  { animation-delay: 0.15s; }
        .tlg-card:nth-child(4)  { animation-delay: 0.20s; }
        .tlg-card:nth-child(5)  { animation-delay: 0.25s; }
        .tlg-card:nth-child(6)  { animation-delay: 0.30s; }

        .tlg-pay-btn {
            position: relative;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .tlg-pay-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
            background-size: 200% auto;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .tlg-pay-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 28px rgba(16,185,129,0.38) !important;
        }
        .tlg-pay-btn:hover::after {
            opacity: 1;
            animation: tlg-shimmer 1s linear infinite;
        }

        .tlg-card-inner {
            transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                        box-shadow  0.35s ease,
                        border-color 0.35s ease;
        }
        .tlg-card-inner:hover {
            transform: translateY(-10px) scale(1.015) !important;
            box-shadow: 0 28px 56px -8px rgba(0,0,0,0.18) !important;
        }
    `;
    document.head.appendChild(style);
};

/* ─── Palette helpers ─── */
const ACCENT_PALETTES = [
    { from: '#f59e0b', to: '#ef4444', text: '#92400e' },
    { from: '#6366f1', to: '#8b5cf6', text: '#3730a3' },
    { from: '#10b981', to: '#14b8a6', text: '#065f46' },
    { from: '#f43f5e', to: '#ec4899', text: '#9f1239' },
    { from: '#0ea5e9', to: '#6366f1', text: '#0c4a6e' },
    { from: '#f97316', to: '#eab308', text: '#78350f' },
];
const getPalette = (index) => ACCENT_PALETTES[index % ACCENT_PALETTES.length];

/* ─── Teacher Card ─── */
function TeacherCard({ teacher, index, onPayment }) {
    const theme = useTheme();
    const pal = getPalette(index);
    const isDark = theme.palette.mode === 'dark';
    const initials = teacher.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <Grid item xs={12} sm={6} lg={4} className="tlg-card">
            <Box
                className="tlg-card-inner"
                sx={{
                    borderRadius: '28px',
                    border: '1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    cursor: 'default',
                    position: 'relative',
                }}
            >
                {/* Gradient band */}
                <Box sx={{
                    height: 110,
                    background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`,
                    flexShrink: 0,
                    position: 'relative',
                }}>
                    {/* Decorative circles */}
                    <Box sx={{
                        position: 'absolute', top: -18, right: -18,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.12)',
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: -10, left: 20,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                    }} />
                    {/* Subject badge */}
                    <Chip
                        label={teacher.assignedSubject || 'General Science'}
                        size="small"
                        icon={<School sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
                        sx={{
                            position: 'absolute', top: 14, right: 14,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600, fontSize: '0.7rem',
                            bgcolor: 'rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            height: 24,
                            '& .MuiChip-label': { px: 1 },
                        }}
                    />
                </Box>

                {/* Avatar sits on the seam */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-40px', mb: 1.5, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                        {/* Pulse ring */}
                        <Box sx={{
                            position: 'absolute', inset: -6,
                            borderRadius: '50%',
                            border: `2px solid ${pal.from}`,
                            animation: 'tlg-pulse-ring 2.4s ease-out infinite',
                            opacity: 0,
                        }} />
                        <Avatar
                            src={teacher.image || teacher.profileImage}
                            sx={{
                                width: 80, height: 80,
                                border: '4px solid',
                                borderColor: isDark ? '#1e1e2e' : '#fff',
                                boxShadow: `0 8px 24px rgba(0,0,0,0.18)`,
                                bgcolor: pal.from,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, fontSize: '1.5rem',
                                color: '#fff',
                            }}
                        >
                            {!teacher.image && !teacher.profileImage && initials}
                        </Avatar>
                    </Box>
                </Box>

                {/* Body */}
                <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', textAlign: 'center' }}>
                    <Typography sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700, fontSize: '1.15rem',
                        lineHeight: 1.25, mb: 0.5,
                        color: isDark ? '#f8f8f8' : '#111827',
                        width: '100%',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {teacher.username}
                    </Typography>

                    {/* Divider accent */}
                    <Box sx={{
                        width: 36, height: 3, borderRadius: 2,
                        background: `linear-gradient(90deg, ${pal.from}, ${pal.to})`,
                        mb: 1.5,
                    }} />

                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: 'text.secondary',
                            fontSize: '0.83rem',
                            lineHeight: 1.65,
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                            mb: 2.5,
                            minHeight: '4.1em',
                        }}
                    >
                        {teacher.description ||
                            `Dedicated instructor specializing in ${teacher.assignedSubject || 'various subjects'}, committed to unlocking every student's potential.`}
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        className="tlg-pay-btn"
                        onClick={() => onPayment(teacher)}
                        sx={{
                            mt: 'auto',
                            borderRadius: '14px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            py: 1.4,
                            boxShadow: 'none',
                            bgcolor: '#10b981',
                            color: '#fff',
                            letterSpacing: '0.02em',
                            '&:hover': { bgcolor: '#059669' },
                        }}
                    >
                        Process Payment
                    </Button>
                </Box>
            </Box>
        </Grid>
    );
}

/* ─── Main Dialog ─── */
export default function TeacherListDialog({ open, onClose }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => { injectStyles(); }, []);

    useEffect(() => {
        if (open) fetchTeachers();
    }, [open]);

    const fetchTeachers = async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/auth/teachers`);
            setTeachers(data);
        } catch {
            setError('Failed to load teachers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (teacher) => {
        setSelectedTeacher(teacher);
        setPaymentOpen(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '32px',
                        background: isDark
                            ? 'linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 100%)'
                            : 'linear-gradient(145deg, #fafafa 0%, #f0f0f5 100%)',
                        backdropFilter: 'blur(24px)',
                        border: '1.5px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                        boxShadow: isDark
                            ? '0 32px 64px rgba(0,0,0,0.6)'
                            : '0 32px 64px rgba(0,0,0,0.14)',
                        overflow: 'hidden',
                    }
                }}
            >
                {/* ── Header ── */}
                <Box sx={{
                    px: { xs: 3, sm: 5 },
                    pt: { xs: 3, sm: 4.5 },
                    pb: 3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    borderBottom: '1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Icon badge */}
                        <Box sx={{
                            width: 52, height: 52,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(16,185,129,0.35)',
                            flexShrink: 0,
                        }}>
                            <Person sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                                <Typography sx={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' },
                                    color: isDark ? '#f8f8f8' : '#111827',
                                    lineHeight: 1.1,
                                }}>
                                    Expert Teachers
                                </Typography>
                                <AutoAwesome sx={{ fontSize: 18, color: '#f59e0b' }} />
                            </Box>
                            <Typography variant="body2" sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: 'text.secondary', fontSize: '0.85rem',
                            }}>
                                Browse faculty & process salary payments
                            </Typography>
                        </Box>
                    </Box>

                    {/* Count badge + close */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {!loading && teachers.length > 0 && (
                            <Chip
                                label={`${teachers.length} Teachers`}
                                size="small"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 700, fontSize: '0.75rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                            />
                        )}
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                borderRadius: '12px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)' },
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                            <Box sx={{
                                width: 52, height: 52, borderRadius: '50%',
                                border: '3px solid transparent',
                                borderTopColor: '#10b981',
                                borderRightColor: '#6366f1',
                                animation: 'tlg-spin 0.8s linear infinite',
                            }} />
                            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', fontSize: '0.9rem' }}>
                                Loading teachers…
                            </Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Typography sx={{ color: 'error.main', fontFamily: "'DM Sans', sans-serif", mb: 2 }}>{error}</Typography>
                            <Button onClick={fetchTeachers} variant="outlined" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
                                Retry
                            </Button>
                        </Box>
                    ) : teachers.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 12 }}>
                            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: 'text.secondary' }}>
                                No teachers found
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled', mt: 0.5 }}>
                                Teacher accounts will appear here once added.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                            {teachers.map((teacher, index) => (
                                <TeacherCard
                                    key={teacher._id || index}
                                    teacher={teacher}
                                    index={index}
                                    onPayment={handlePaymentClick}
                                />
                            ))}
                        </Grid>
                    )}
                </DialogContent>

                {/* ── Footer ── */}
                <Box sx={{
                    px: { xs: 3, sm: 5 }, py: 3,
                    borderTop: '1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            borderRadius: '14px',
                            px: 4, py: 1.2,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            color: 'text.secondary',
                            border: '1.5px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
                            },
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Dialog>

            <TeacherPaymentDialog
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                teacherId={selectedTeacher?._id}
                teacherName={selectedTeacher?.username}
            />
        </>
    );
}