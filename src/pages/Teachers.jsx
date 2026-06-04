import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Box, Typography, Button, Card, Avatar, Chip, Tooltip,
    IconButton, alpha, useTheme, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, Snackbar
} from '@mui/material';
import {
    Person, AutoAwesome, School, FileDownload, Share, CheckCircle, Edit, Delete,
    AddCircleOutline, CloudUpload, ArrowBack, VpnKey
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';
import TeacherPaymentDialog from '../components/TeacherPaymentDialog';
import { useNavigate } from 'react-router-dom';

/* ─── Palettes ─── */
const PALETTES = [
    { from: '#ff5c7c', to: '#ff3d6b' }, // Coral / Rose
    { from: '#6c5fff', to: '#8b5cf6' }, // Indigo / Violet
    { from: '#00d4a0', to: '#14b8a6' }, // Emerald / Teal
    { from: '#ffb84d', to: '#f97316' }, // Amber / Orange
    { from: '#00cfff', to: '#6366f1' }, // Cyan / Indigo
    { from: '#a855f7', to: '#ec4899' }, // Purple / Pink
];
const getPal = (i) => PALETTES[i % PALETTES.length];

export default function Teachers() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Payment Dialog state
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedTeacherForPayment, setSelectedTeacherForPayment] = useState(null);

    // Edit/Create Dialog state
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'
    const [editingTeacherId, setEditingTeacherId] = useState(null);
    const [editorForm, setEditorForm] = useState({
        username: '',
        password: '',
        assignedSubject: '',
        description: '',
        image: ''
    });

    // Alert / Toast state
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [copiedStates, setCopiedStates] = useState({});

    // Fetch teachers & subjects on mount
    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/auth/teachers`);
            setTeachers(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load teachers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
            setSubjects(data);
        } catch (err) {
            console.error('Failed to load subjects', err);
        }
    };

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    // Convert file to Base64
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('Image size must be under 2MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setEditorForm(prev => ({ ...prev, image: reader.result }));
            };
            reader.onerror = (err) => {
                console.error(err);
                showToast('Error reading file', 'error');
            };
        }
    };

    // Open editor for creating
    const handleOpenCreate = () => {
        setEditorMode('create');
        setEditingTeacherId(null);
        setEditorForm({
            username: '',
            password: '',
            assignedSubject: subjects[0]?.name || '',
            description: '',
            image: ''
        });
        setEditorOpen(true);
    };

    // Open editor for editing
    const handleOpenEdit = (teacher) => {
        setEditorMode('edit');
        setEditingTeacherId(teacher._id);
        setEditorForm({
            username: teacher.username || '',
            password: '', // blank by default
            assignedSubject: teacher.assignedSubject || '',
            description: teacher.description || '',
            image: teacher.image || ''
        });
        setEditorOpen(true);
    };

    // Submit Create/Edit
    const handleEditorSubmit = async (e) => {
        e.preventDefault();
        if (!editorForm.username.trim()) {
            showToast('Teacher Name is required', 'error');
            return;
        }
        if (editorMode === 'create' && !editorForm.password) {
            showToast('Password is required for new accounts', 'error');
            return;
        }
        if (!editorForm.assignedSubject) {
            showToast('Please assign a subject', 'error');
            return;
        }

        try {
            if (editorMode === 'create') {
                await axios.post(`${API_BASE_URL}/api/auth/create-teacher`, editorForm);
                showToast('Teacher created successfully!');
            } else {
                // Remove password field if not changing it
                const updatePayload = { ...editorForm };
                if (!updatePayload.password) {
                    delete updatePayload.password;
                }
                await axios.put(`${API_BASE_URL}/api/auth/teachers/${editingTeacherId}`, updatePayload);
                showToast('Teacher updated successfully!');
            }
            setEditorOpen(false);
            fetchTeachers();
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'Operation failed', 'error');
        }
    };

    // Delete Teacher
    const handleDeleteTeacher = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            try {
                await axios.delete(`${API_BASE_URL}/api/auth/teachers/${id}`);
                showToast('Teacher deleted successfully!');
                fetchTeachers();
            } catch (err) {
                console.error(err);
                showToast('Failed to delete teacher', 'error');
            }
        }
    };

    /* ─── Share Profile Card ─── */
    const downloadProfileImage = async (teacher, index) => {
        const src = teacher.image;
        if (!src) {
            // Generate initials avatar on canvas
            const canvas = document.createElement('canvas');
            canvas.width = 400; canvas.height = 400;
            const ctx = canvas.getContext('2d');
            const pal = getPal(index);
            const g = ctx.createLinearGradient(0, 0, 400, 400);
            g.addColorStop(0, pal.from); g.addColorStop(1, pal.to);
            ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 400);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 160px sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText((teacher.username || '??').slice(0, 2).toUpperCase(), 200, 200);
            const a = document.createElement('a');
            a.download = `${teacher.username || 'teacher'}-photo.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
            return;
        }

        if (src.startsWith('data:')) {
            const a = document.createElement('a');
            a.download = `${teacher.username || 'teacher'}-photo.png`;
            a.href = src;
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

    const generateShareCard = async (teacher, index) => {
        const pal = getPal(index);
        const canvas = document.createElement('canvas');
        canvas.width = 600; canvas.height = 680;
        const ctx = canvas.getContext('2d');

        // BG
        ctx.fillStyle = '#0f0f1a';
        ctx.beginPath();
        ctx.roundRect(0, 0, 600, 680, 32);
        ctx.fill();

        // Header gradient
        const hg = ctx.createLinearGradient(0, 0, 600, 190);
        hg.addColorStop(0, pal.from); hg.addColorStop(1, pal.to);
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.roundRect(0, 0, 600, 190, [32, 32, 0, 0]);
        ctx.fill();

        // Deco circle
        ctx.beginPath(); ctx.arc(545, 35, 85, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.09)'; ctx.fill();

        // Avatar circle bg
        ctx.beginPath(); ctx.arc(300, 200, 68, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e'; ctx.fill();

        // Avatar image or initials
        const imgSrc = teacher.image;
        if (imgSrc) {
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    ctx.save();
                    ctx.beginPath(); ctx.arc(300, 200, 63, 0, Math.PI * 2); ctx.clip();
                    ctx.drawImage(img, 237, 137, 126, 126);
                    ctx.restore(); resolve();
                };
                img.onerror = resolve;
                img.src = imgSrc;
            });
        } else {
            ctx.fillStyle = pal.from;
            ctx.font = 'bold 52px sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText((teacher.username || '??').slice(0, 2).toUpperCase(), 300, 200);
        }

        // Subject pill
        const subj = teacher.assignedSubject || 'General Subject';
        ctx.font = '500 17px sans-serif';
        ctx.textAlign = 'center';
        const sw = ctx.measureText(subj).width + 30;
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath();
        ctx.roundRect((600 - sw) / 2, 285, sw, 30, 15);
        ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText(subj, 300, 305);

        // Name
        ctx.fillStyle = '#f0f0f0'; ctx.font = 'bold 30px Georgia, serif';
        ctx.fillText(teacher.username || '', 300, 358);

        // Divider
        const dg = ctx.createLinearGradient(265, 0, 335, 0);
        dg.addColorStop(0, pal.from); dg.addColorStop(1, pal.to);
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.roundRect(265, 372, 70, 4, 2);
        ctx.fill();

        // Description
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '15px sans-serif'; ctx.textAlign = 'center';
        const desc = teacher.description || `Expert instructor in ${subj}.`;
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
        ctx.fillText('Expert Teacher · EduFlex Institute', 300, 650);

        return canvas.toDataURL('image/png');
    };

    const handleShareCard = async (teacher, index) => {
        const dataUrl = await generateShareCard(teacher, index);
        if (navigator.share) {
            try {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `${teacher.username}-card.png`, { type: 'image/png' });
                await navigator.share({ title: teacher.username, files: [file] });
                return;
            } catch { /* fall back to download */ }
        }
        const a = document.createElement('a');
        a.download = `${teacher.username || 'teacher'}-card.png`;
        a.href = dataUrl; a.click();
        setCopiedStates(prev => ({ ...prev, [teacher._id]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [teacher._id]: false })), 2500);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
            {/* Ambient glows */}
            <Box sx={{
                position: 'fixed', top: '15%', left: '5%', width: 500, height: 500,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,95,255,0.08) 0%, transparent 70%)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
            }} />
            <Box sx={{
                position: 'fixed', bottom: '10%', right: '5%', width: 450, height: 450,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,207,255,0.08) 0%, transparent 70%)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* ── Page Header ── */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    mb: 5, flexWrap: 'wrap', gap: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    pb: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={() => navigate('/')}
                            sx={{
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                borderRadius: 3, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h4" fontWeight={900} letterSpacing="-1px" sx={{
                                    fontFamily: "'Outfit', 'DM Sans', sans-serif",
                                    background: isDark ? 'linear-gradient(135deg, #fff 40%, #00cfff 100%)' : 'linear-gradient(135deg, #111827 40%, #6c5fff 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>
                                    Teachers Faculty
                                </Typography>
                                <AutoAwesome sx={{ color: '#ffb84d', fontSize: 22 }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Manage academic instructors, edit profile details, and process salary payments.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={handleOpenCreate}
                        startIcon={<AddCircleOutline />}
                        sx={{
                            borderRadius: '14px', textTransform: 'none', py: 1.5, px: 3,
                            fontWeight: 700, fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #6c5fff 0%, #8b5cf6 100%)',
                            boxShadow: '0 4px 20px rgba(108,95,255,0.3)',
                            '&:hover': { background: 'linear-gradient(135deg, #5b4feb 0%, #7c4bf2 100%)' }
                        }}
                    >
                        Add New Teacher
                    </Button>
                </Box>

                {/* ── Main Loading/Error states ── */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15, gap: 2 }}>
                        <CircularProgress thickness={4} size={50} sx={{ color: '#6c5fff' }} />
                        <Typography color="text.secondary" variant="body2">Loading teachers roster...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ py: 8 }}>
                        <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
                            {error}
                            <Button onClick={fetchTeachers} variant="text" size="small" sx={{ ml: 2, fontWeight: 700 }}>Retry</Button>
                        </Alert>
                    </Box>
                ) : teachers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 12, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 6, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                        <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" fontWeight={700} color="text.secondary">No Teachers Registered</Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 3 }}>
                            Add your first teacher directly or while creating a subject.
                        </Typography>
                        <Button variant="outlined" onClick={handleOpenCreate} sx={{ borderRadius: 3, textTransform: 'none' }}>
                            Add Teacher
                        </Button>
                    </Box>
                ) : (
                    /* ── Roster Grid ── */
                    <Grid container spacing={3.5}>
                        {teachers.map((teacher, i) => {
                            const pal = getPal(i);
                            const initials = (teacher.username || '??').slice(0, 2).toUpperCase();
                            const copied = copiedStates[teacher._id];

                            return (
                                <Grid item xs={12} sm={6} md={4} key={teacher._id} sx={{ display: 'flex' }}>
                                    <Card
                                        component={motion.div}
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.3 }}
                                        sx={{
                                            width: '100%', borderRadius: '24px', display: 'flex', flexDirection: 'column',
                                            bgcolor: isDark ? 'rgba(18,18,22,0.6)' : '#ffffff',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
                                            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.05)',
                                            backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        {/* Top Color Banner */}
                                        <Box sx={{
                                            height: 100, flexShrink: 0, position: 'relative',
                                            background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`
                                        }}>
                                            {/* Subject Chip */}
                                            <Chip
                                                icon={<School sx={{ fontSize: '12px !important', color: '#fff !important' }} />}
                                                label={teacher.assignedSubject || 'Unassigned'}
                                                size="small"
                                                sx={{
                                                    position: 'absolute', top: 12, right: 12,
                                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.67rem',
                                                    bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                                    color: '#fff', border: '1px solid rgba(255,255,255,0.28)', height: 24, maxWidth: '65%'
                                                }}
                                            />

                                            {/* Image Share & Download actions */}
                                            <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.8 }}>
                                                <Tooltip title="Download Photo">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => downloadProfileImage(teacher, i)}
                                                        sx={{
                                                            bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', width: 30, height: 30,
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
                                                        }}
                                                    >
                                                        <FileDownload sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={copied ? 'Card Saved!' : 'Save Profile Card'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleShareCard(teacher, i)}
                                                        sx={{
                                                            bgcolor: copied ? 'rgba(16,185,129,0.7)' : 'rgba(0,0,0,0.4)',
                                                            color: '#fff', width: 30, height: 30, '&:hover': { bgcolor: '#6c5fff' }
                                                        }}
                                                    >
                                                        {copied ? <CheckCircle sx={{ fontSize: 15 }} /> : <Share sx={{ fontSize: 15 }} />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* Teacher Avatar */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-38px', mb: 1.5, position: 'relative', zIndex: 2 }}>
                                            <Avatar
                                                src={teacher.image}
                                                sx={{
                                                    width: 76, height: 76, border: '4px solid',
                                                    borderColor: isDark ? '#121216' : '#fff',
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)', bgcolor: pal.from,
                                                    fontWeight: 700, fontSize: '1.4rem', color: '#fff'
                                                }}
                                            >
                                                {!teacher.image && initials}
                                            </Avatar>
                                        </Box>

                                        {/* Card Contents */}
                                        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{
                                                fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem',
                                                color: isDark ? '#fff' : '#111827', mb: 0.5, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {teacher.username}
                                            </Typography>
                                            <Box sx={{ width: 32, height: 3, borderRadius: 2, mb: 2, background: `linear-gradient(90deg, ${pal.from}, ${pal.to})` }} />

                                            <Typography variant="body2" color="text.secondary" sx={{
                                                fontSize: '0.8rem', lineHeight: 1.6, minHeight: '4.8em', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', mb: 3
                                            }}>
                                                {teacher.description || `Expert instructor assigned to ${teacher.assignedSubject || 'academic courses'}. Dedicated to boosting student performance.`}
                                            </Typography>

                                            <Box sx={{ flexGrow: 1 }} />

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => { setSelectedTeacherForPayment(teacher); setPaymentOpen(true); }}
                                                    sx={{
                                                        flex: 2, borderRadius: '12px', textTransform: 'none', py: 1.1,
                                                        fontWeight: 700, fontSize: '0.82rem', bgcolor: '#00d4a0', color: '#fff',
                                                        boxShadow: 'none', '&:hover': { bgcolor: '#05b88a' }
                                                    }}
                                                >
                                                    Payment
                                                </Button>
                                                <IconButton
                                                    onClick={() => handleOpenEdit(teacher)}
                                                    sx={{
                                                        borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                        color: 'text.secondary', p: 1.2
                                                    }}
                                                >
                                                    <Edit sx={{ fontSize: 18 }} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteTeacher(teacher._id, teacher.username)}
                                                    sx={{
                                                        borderRadius: '12px', border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                                                        color: 'error.main', p: 1.2
                                                    }}
                                                >
                                                    <Delete sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            {/* ── TEACHER CREATE/EDIT DIALOG ── */}
            <Dialog
                open={editorOpen}
                onClose={() => setEditorOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        bgcolor: isDark ? 'rgba(20, 20, 26, 0.95)' : '#ffffff',
                        backdropFilter: 'blur(20px)',
                        backgroundImage: 'none',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                    }
                }}
            >
                <form onSubmit={handleEditorSubmit}>
                    <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.4rem', pb: 1 }}>
                        {editorMode === 'create' ? 'Add New Teacher' : 'Edit Teacher Profile'}
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '12px !important' }}>
                        {/* File Upload (Photo) & Preview Row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                            <Avatar
                                src={editorForm.image}
                                sx={{ width: 80, height: 80, border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
                            />
                            <Box>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem', py: 0.8 }}
                                >
                                    Upload Photo
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                </Button>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Recommend square image under 2MB.
                                </Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Teacher Name"
                            value={editorForm.username}
                            onChange={(e) => setEditorForm(prev => ({ ...prev, username: e.target.value }))}
                            variant="outlined"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
                            }}
                        />

                        <FormControl fullWidth variant="outlined" required>
                            <InputLabel id="assigned-subject-label">Assigned Subject</InputLabel>
                            <Select
                                labelId="assigned-subject-label"
                                value={editorForm.assignedSubject}
                                onChange={(e) => setEditorForm(prev => ({ ...prev, assignedSubject: e.target.value }))}
                                label="Assigned Subject"
                                sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                            >
                                {subjects.map((sub) => (
                                    <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Qualifications / Bio"
                            value={editorForm.description}
                            onChange={(e) => setEditorForm(prev => ({ ...prev, description: e.target.value }))}
                            multiline
                            rows={3}
                            placeholder="e.g. B.Sc. in Physics, 5 years teaching experience"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
                            }}
                        />

                        {/* Password change/input */}
                        <TextField
                            fullWidth
                            label={editorMode === 'create' ? "Password" : "New Password (Leave empty to keep current)"}
                            type="password"
                            value={editorForm.password}
                            onChange={(e) => setEditorForm(prev => ({ ...prev, password: e.target.value }))}
                            required={editorMode === 'create'}
                            InputProps={{
                                startAdornment: <VpnKey sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                            }}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button
                            onClick={() => setEditorOpen(false)}
                            sx={{ borderRadius: 3, textTransform: 'none', px: 3, color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 3, textTransform: 'none', px: 4, py: 1.1,
                                background: 'linear-gradient(135deg, #6c5fff 0%, #8b5cf6 100%)',
                                fontWeight: 700, boxShadow: '0 4px 14px rgba(108,95,255,0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #5b4feb 0%, #7c4bf2 100%)' }
                            }}
                        >
                            {editorMode === 'create' ? 'Create Teacher' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* ── TEACHER PAYMENT DIALOG ── */}
            <TeacherPaymentDialog
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                teacherId={selectedTeacherForPayment?._id}
                teacherName={selectedTeacherForPayment?.username}
            />

            {/* ── Snackbar Alert Toast ── */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setToast(prev => ({ ...prev, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ borderRadius: '12px', width: '100%', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
