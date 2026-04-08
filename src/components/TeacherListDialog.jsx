import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Button, Grid, Chip, Avatar,
    Box, Typography, alpha, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import {
    Person, Close, AutoAwesome, School,
    FileDownload, Share, CheckCircle
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import TeacherPaymentDialog from './TeacherPaymentDialog';
import { useTheme } from '@mui/material/styles';

/* ─── Inject CSS once ─── */
const injectStyles = () => {
    if (document.getElementById('tlg-styles')) return;
    const s = document.createElement('style');
    s.id = 'tlg-styles';
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes tlg-fadeUp {
            from { opacity:0; transform:translateY(20px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes tlg-pulse-ring {
            0%   { transform:scale(1);   opacity:0.5; }
            100% { transform:scale(1.6); opacity:0; }
        }
        @keyframes tlg-spin { to { transform:rotate(360deg); } }
        @keyframes tlg-shimmer {
            0%   { background-position:-200% center; }
            100% { background-position: 200% center; }
        }

        .tlg-card { animation: tlg-fadeUp 0.45s ease both; }
        .tlg-card:nth-child(1){ animation-delay:0.04s }
        .tlg-card:nth-child(2){ animation-delay:0.08s }
        .tlg-card:nth-child(3){ animation-delay:0.12s }
        .tlg-card:nth-child(4){ animation-delay:0.16s }
        .tlg-card:nth-child(5){ animation-delay:0.20s }
        .tlg-card:nth-child(6){ animation-delay:0.24s }
        .tlg-card:nth-child(7){ animation-delay:0.28s }

        .tlg-card-inner {
            height: 100%;
            transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                        box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .tlg-card-inner:hover {
            transform: translateY(-8px) scale(1.012) !important;
            box-shadow: 0 24px 48px -6px rgba(0,0,0,0.22) !important;
        }

        .tlg-pay-btn {
            position: relative; overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .tlg-pay-btn::after {
            content:''; position:absolute; inset:0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            background-size: 200% auto; opacity:0; transition:opacity 0.2s;
        }
        .tlg-pay-btn:hover { transform:translateY(-2px) !important; box-shadow:0 10px 24px rgba(16,185,129,0.4) !important; }
        .tlg-pay-btn:hover::after { opacity:1; animation:tlg-shimmer 1s linear infinite; }

        .tlg-action-btn { transition: transform 0.2s ease !important; }
        .tlg-action-btn:hover { transform: scale(1.15) !important; }
    `;
    document.head.appendChild(s);
};

/* ─── Palettes ─── */
const PALETTES = [
    { from: '#f59e0b', to: '#ef4444' },
    { from: '#6366f1', to: '#8b5cf6' },
    { from: '#10b981', to: '#14b8a6' },
    { from: '#f43f5e', to: '#ec4899' },
    { from: '#0ea5e9', to: '#6366f1' },
    { from: '#f97316', to: '#eab308' },
    { from: '#a855f7', to: '#ec4899' },
];
const getPal = (i) => PALETTES[i % PALETTES.length];

/* ─── Download profile photo ─── */
const downloadProfileImage = async (teacher) => {
    const src = teacher.image || teacher.profileImage;
    if (!src) {
        // Generate initials avatar on canvas
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const pal = getPal(0);
        const g = ctx.createLinearGradient(0, 0, 400, 400);
        g.addColorStop(0, pal.from); g.addColorStop(1, pal.to);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 160px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((teacher.username || '??').slice(0, 2).toUpperCase(), 200, 210);
        const a = document.createElement('a');
        a.download = `${teacher.username || 'teacher'}-photo.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        return;
    }
    try {
        const res = await fetch(src, { mode: 'cors' });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `${teacher.username || 'teacher'}-photo.${blob.type.split('/')[1] || 'jpg'}`;
        a.href = url; a.click();
        URL.revokeObjectURL(url);
    } catch {
        window.open(src, '_blank');
    }
};

/* ─── Generate profile card PNG for sharing ─── */
const generateShareCard = async (teacher, index) => {
    const pal = getPal(index);
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // BG
    ctx.fillStyle = '#0f0f1a';
    ctx.roundRect(0, 0, 600, 680, 32); ctx.fill();

    // Header gradient
    const hg = ctx.createLinearGradient(0, 0, 600, 190);
    hg.addColorStop(0, pal.from); hg.addColorStop(1, pal.to);
    ctx.fillStyle = hg;
    ctx.roundRect(0, 0, 600, 190, [32, 32, 0, 0]); ctx.fill();

    // Deco circle
    ctx.beginPath(); ctx.arc(545, 35, 85, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fill();

    // Avatar circle bg
    ctx.beginPath(); ctx.arc(300, 200, 68, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#0f0f1a'; ctx.stroke();

    // Avatar image or initials
    const imgSrc = teacher.image || teacher.profileImage;
    if (imgSrc) {
        await new Promise((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.save();
                ctx.beginPath(); ctx.arc(300, 200, 63, 0, Math.PI * 2); ctx.clip();
                ctx.drawImage(img, 237, 137, 126, 126);
                ctx.restore(); res();
            };
            img.onerror = res;
            img.src = imgSrc;
        });
    } else {
        ctx.fillStyle = pal.from;
        ctx.font = 'bold 52px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((teacher.username || '??').slice(0, 2).toUpperCase(), 300, 202);
    }

    // Subject pill
    const subj = teacher.assignedSubject || 'General Science';
    ctx.font = '500 17px sans-serif';
    ctx.textAlign = 'center';
    const sw = ctx.measureText(subj).width + 30;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.roundRect((600 - sw) / 2, 285, sw, 30, 15); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(subj, 300, 305);

    // Name
    ctx.fillStyle = '#f0f0f0'; ctx.font = 'bold 30px serif';
    ctx.fillText(teacher.username || '', 300, 358);

    // Divider
    const dg = ctx.createLinearGradient(230, 0, 370, 0);
    dg.addColorStop(0, pal.from); dg.addColorStop(1, pal.to);
    ctx.fillStyle = dg;
    ctx.roundRect(265, 372, 70, 4, 2); ctx.fill();

    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '15px sans-serif'; ctx.textAlign = 'center';
    const desc = teacher.description || `Expert in ${subj}. Dedicated to student success.`;
    const words = desc.split(' ');
    let line = '', y = 408;
    for (const w of words) {
        const t = line + w + ' ';
        if (ctx.measureText(t).width > 480 && line) {
            ctx.fillText(line.trim(), 300, y); line = w + ' '; y += 25;
            if (y > 510) { ctx.fillText('...', 300, y); break; }
        } else line = t;
    }
    if (y <= 510) ctx.fillText(line.trim(), 300, y);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 610, 600, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = '13px sans-serif';
    ctx.fillText('Expert Teacher · Our Academy', 300, 650);

    return canvas.toDataURL('image/png');
};

/* ─── Share / save card ─── */
const handleShareCard = async (teacher, index, setCopied) => {
    const dataUrl = await generateShareCard(teacher, index);
    if (navigator.share) {
        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${teacher.username}-card.png`, { type: 'image/png' });
            await navigator.share({ title: teacher.username, files: [file] });
            return;
        } catch { /* fallthrough to download */ }
    }
    const a = document.createElement('a');
    a.download = `${teacher.username || 'teacher'}-card.png`;
    a.href = dataUrl; a.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
};

/* ═══════════════════════════════════════════
   Teacher Card
═══════════════════════════════════════════ */
function TeacherCard({ teacher, index, onPayment }) {
    const theme = useTheme();
    const pal = getPal(index);
    const isDark = theme.palette.mode === 'dark';
    const initials = (teacher.username || '??').slice(0, 2).toUpperCase();
    const [copied, setCopied] = useState(false);
    const [hovering, setHovering] = useState(false);

    return (
        /* display:'flex' on the Grid item makes all cards in a row stretch to equal height */
        <Grid item xs={12} sm={6} md={4} className="tlg-card" sx={{ display: 'flex' }}>
            <Box
                className="tlg-card-inner"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                sx={{
                    width: '100%',
                    borderRadius: '24px',
                    border: '1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                }}
            >
                {/* ── Gradient header ── */}
                <Box sx={{
                    height: 100, flexShrink: 0, position: 'relative',
                    background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`,
                }}>
                    {/* Deco */}
                    <Box sx={{ position:'absolute', top:-20, right:-20, width:88, height:88, borderRadius:'50%', bgcolor:'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ position:'absolute', bottom:-12, left:16, width:44, height:44, borderRadius:'50%', bgcolor:'rgba(255,255,255,0.07)' }} />

                    {/* Subject chip */}
                    <Chip
                        icon={<School sx={{ fontSize:'12px !important', color:'#fff !important' }} />}
                        label={teacher.assignedSubject || 'General Science'}
                        size="small"
                        sx={{
                            position:'absolute', top:12, right:12,
                            fontFamily:"'DM Sans', sans-serif",
                            fontWeight:600, fontSize:'0.67rem',
                            bgcolor:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)',
                            color:'#fff', border:'1px solid rgba(255,255,255,0.28)',
                            height:24, maxWidth:'65%',
                            '& .MuiChip-label':{ px:0.8, overflow:'hidden', textOverflow:'ellipsis' },
                        }}
                    />

                    {/* Hover: download + share buttons */}
                    <Box sx={{
                        position:'absolute', top:10, left:10,
                        display:'flex', gap:0.8,
                        opacity: hovering ? 1 : 0,
                        transform: hovering ? 'translateY(0)' : 'translateY(-6px)',
                        transition:'opacity 0.25s, transform 0.25s',
                    }}>
                        <Tooltip title="Download Photo" placement="bottom">
                            <IconButton
                                size="small"
                                className="tlg-action-btn"
                                onClick={() => downloadProfileImage(teacher)}
                                sx={{
                                    bgcolor:'rgba(0,0,0,0.38)', backdropFilter:'blur(8px)',
                                    color:'#fff', width:30, height:30,
                                    '&:hover':{ bgcolor:'rgba(0,0,0,0.6)' },
                                }}
                            >
                                <FileDownload sx={{ fontSize:15 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={copied ? 'Card Saved!' : 'Save Profile Card'} placement="bottom">
                            <IconButton
                                size="small"
                                className="tlg-action-btn"
                                onClick={() => handleShareCard(teacher, index, setCopied)}
                                sx={{
                                    bgcolor: copied ? 'rgba(16,185,129,0.55)' : 'rgba(0,0,0,0.38)',
                                    backdropFilter:'blur(8px)',
                                    color:'#fff', width:30, height:30,
                                    transition:'background 0.3s',
                                    '&:hover':{ bgcolor:'rgba(99,102,241,0.65)' },
                                }}
                            >
                                {copied
                                    ? <CheckCircle sx={{ fontSize:15 }} />
                                    : <Share sx={{ fontSize:15 }} />
                                }
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* ── Avatar on the seam ── */}
                <Box sx={{ display:'flex', justifyContent:'center', mt:'-38px', mb:1.5, position:'relative', zIndex:2 }}>
                    <Box sx={{ position:'relative' }}>
                        <Box sx={{
                            position:'absolute', inset:-5, borderRadius:'50%',
                            border:`2px solid ${pal.from}`,
                            animation:'tlg-pulse-ring 2.6s ease-out infinite', opacity:0,
                        }} />
                        <Avatar
                            src={teacher.image || teacher.profileImage}
                            sx={{
                                width:76, height:76,
                                border:'4px solid',
                                borderColor: isDark ? '#0f0f1a' : '#fff',
                                boxShadow:'0 6px 20px rgba(0,0,0,0.2)',
                                bgcolor: pal.from,
                                fontFamily:"'Playfair Display', serif",
                                fontWeight:700, fontSize:'1.4rem', color:'#fff',
                            }}
                        >
                            {!teacher.image && !teacher.profileImage && initials}
                        </Avatar>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <Box sx={{
                    px:2.5, pb:2.5,
                    display:'flex', flexDirection:'column',
                    flexGrow:1,                   // fill remaining height
                    alignItems:'center', textAlign:'center',
                }}>
                    {/* Name — single line, never wraps */}
                    <Typography sx={{
                        fontFamily:"'Playfair Display', serif",
                        fontWeight:700, fontSize:'1.05rem',
                        color: isDark ? '#f0f0f0' : '#111827',
                        lineHeight:1.25, mb:0.5, width:'100%',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    }}>
                        {teacher.username}
                    </Typography>

                    {/* Accent bar */}
                    <Box sx={{
                        width:32, height:3, borderRadius:2, mb:1.5, flexShrink:0,
                        background:`linear-gradient(90deg, ${pal.from}, ${pal.to})`,
                    }} />

                    {/* Description — clamped to 3 lines, FIXED min-height keeps all cards aligned */}
                    <Typography sx={{
                        fontFamily:"'DM Sans', sans-serif",
                        color:'text.secondary', fontSize:'0.8rem', lineHeight:1.65,
                        display:'-webkit-box', WebkitBoxOrient:'vertical', WebkitLineClamp:3,
                        overflow:'hidden', width:'100%',
                        minHeight:'3.95em',  // 3 lines reserved — cards stay same height
                        flexShrink:0,
                    }}>
                        {teacher.description ||
                            `Dedicated instructor specializing in ${teacher.assignedSubject || 'various subjects'}, committed to unlocking every student's potential.`}
                    </Typography>

                    {/* Flexible space — pushes button to the very bottom */}
                    <Box sx={{ flexGrow:1 }} />

                    {/* Process Payment */}
                    <Button
                        variant="contained"
                        fullWidth
                        className="tlg-pay-btn"
                        onClick={() => onPayment(teacher)}
                        sx={{
                            mt:2, borderRadius:'12px',
                            textTransform:'none',
                            fontFamily:"'DM Sans', sans-serif",
                            fontWeight:700, fontSize:'0.88rem',
                            py:1.3, boxShadow:'none', flexShrink:0,
                            bgcolor:'#10b981', color:'#fff',
                            '&:hover':{ bgcolor:'#059669' },
                        }}
                    >
                        Process Payment
                    </Button>
                </Box>
            </Box>
        </Grid>
    );
}

/* ═══════════════════════════════════════════
   Main Dialog
═══════════════════════════════════════════ */
export default function TeacherListDialog({ open, onClose }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [teachers, setTeachers]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => { injectStyles(); }, []);
    useEffect(() => { if (open) fetchTeachers(); }, [open]);

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

    return (
        <>
            <Dialog
                open={open} onClose={onClose}
                maxWidth="lg" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius:'28px',
                        background: isDark
                            ? 'linear-gradient(145deg,#0f0f1a 0%,#1a1a2e 100%)'
                            : 'linear-gradient(145deg,#f8f8fc 0%,#efeff5 100%)',
                        border:'1.5px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        boxShadow: isDark ? '0 32px 72px rgba(0,0,0,0.65)' : '0 32px 72px rgba(0,0,0,0.13)',
                        overflow:'hidden',
                    }
                }}
            >
                {/* ── Header ── */}
                <Box sx={{
                    px:{ xs:3, sm:4 }, pt:{ xs:3, sm:4 }, pb:2.5,
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    borderBottom:'1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                        <Box sx={{
                            width:48, height:48, borderRadius:'15px', flexShrink:0,
                            background:'linear-gradient(135deg,#10b981,#6366f1)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 6px 18px rgba(16,185,129,0.4)',
                        }}>
                            <Person sx={{ color:'#fff', fontSize:24 }} />
                        </Box>
                        <Box>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.2 }}>
                                <Typography sx={{
                                    fontFamily:"'Playfair Display', serif",
                                    fontWeight:800, fontSize:{ xs:'1.2rem', sm:'1.5rem' },
                                    color: isDark ? '#f0f0f0' : '#111827', lineHeight:1.1,
                                }}>
                                    Expert Teachers
                                </Typography>
                                <AutoAwesome sx={{ fontSize:17, color:'#f59e0b' }} />
                            </Box>
                            <Typography sx={{
                                fontFamily:"'DM Sans', sans-serif",
                                color:'text.secondary', fontSize:'0.82rem',
                            }}>
                                Browse faculty & process salary payments
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display:'flex', alignItems:'center', gap:1.2 }}>
                        {!loading && teachers.length > 0 && (
                            <Chip
                                label={`${teachers.length} Teachers`}
                                size="small"
                                sx={{
                                    fontFamily:"'DM Sans', sans-serif",
                                    fontWeight:700, fontSize:'0.72rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color:'primary.main',
                                    border:`1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    display:{ xs:'none', sm:'flex' },
                                }}
                            />
                        )}
                        <IconButton
                            onClick={onClose} size="small"
                            sx={{
                                borderRadius:'10px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                                '&:hover':{ bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)' },
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Body ── */}
                <DialogContent sx={{ p:{ xs:2.5, sm:3.5 } }}>
                    {loading ? (
                        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', py:10, gap:2 }}>
                            <Box sx={{
                                width:48, height:48, borderRadius:'50%',
                                border:'3px solid transparent',
                                borderTopColor:'#10b981', borderRightColor:'#6366f1',
                                animation:'tlg-spin 0.8s linear infinite',
                            }} />
                            <Typography sx={{ fontFamily:"'DM Sans', sans-serif", color:'text.secondary', fontSize:'0.88rem' }}>
                                Loading teachers…
                            </Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ textAlign:'center', py:10 }}>
                            <Typography sx={{ color:'error.main', fontFamily:"'DM Sans', sans-serif", mb:2 }}>{error}</Typography>
                            <Button onClick={fetchTeachers} variant="outlined"
                                sx={{ borderRadius:'12px', textTransform:'none', fontWeight:600 }}>
                                Retry
                            </Button>
                        </Box>
                    ) : teachers.length === 0 ? (
                        <Box sx={{ textAlign:'center', py:12 }}>
                            <Typography sx={{ fontFamily:"'Playfair Display', serif", fontSize:'1.15rem', color:'text.secondary' }}>
                                No teachers found
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily:"'DM Sans', sans-serif", color:'text.disabled', mt:0.5 }}>
                                Teacher accounts will appear here once added.
                            </Typography>
                        </Box>
                    ) : (
                        /* alignItems="stretch" is what makes every card in a row the same height */
                        <Grid container spacing={{ xs:2, sm:2.5 }} alignItems="stretch">
                            {teachers.map((teacher, i) => (
                                <TeacherCard
                                    key={teacher._id || i}
                                    teacher={teacher}
                                    index={i}
                                    onPayment={(t) => { setSelectedTeacher(t); setPaymentOpen(true); }}
                                />
                            ))}
                        </Grid>
                    )}
                </DialogContent>

                {/* ── Footer ── */}
                <Box sx={{
                    px:{ xs:3, sm:4 }, py:2.5,
                    borderTop:'1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    display:'flex', justifyContent:'flex-end',
                }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            borderRadius:'12px', px:4, py:1.1,
                            fontFamily:"'DM Sans', sans-serif",
                            fontWeight:600, fontSize:'0.88rem',
                            textTransform:'none', color:'text.secondary',
                            border:'1.5px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            '&:hover':{
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)',
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