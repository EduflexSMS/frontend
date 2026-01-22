import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, CircularProgress, Alert, InputAdornment, IconButton, useTheme, alpha, Avatar, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline, School, AdminPanelSettings, SupervisedUserCircle } from '@mui/icons-material';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';

import logo from '../assets/logo.jpg';
import loginBg from '../assets/login-bg.jpg';

// Floating particle component
const Particle = ({ delay, duration, x, y, size }) => (
    <motion.div
        animate={{
            y: [0, -100, 0],
            x: [0, 50, -50, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        style={{
            position: 'absolute',
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
            filter: 'blur(8px)',
            zIndex: 1
        }}
    />
);

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState(null); // 'admin', 'teacher', 'student'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
                setSubjects(data);
            } catch (err) {
                console.error("Failed to fetch subjects", err);
            }
        };
        fetchSubjects();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock Login Logic for Prototype
            let userData = null;
            let redirectUrl = '/';

            if (selectedRole === 'student') {
                if (!studentId) throw new Error("Student ID is required");
                userData = { role: 'student', id: studentId, name: "Student User" };
                redirectUrl = '/student-dashboard';
            } else {
                if (!username || !password) throw new Error("Username and password required");
                // In a real app, call API here
                const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
                userData = data;

                if (selectedRole === 'teacher') {
                    // Check if selected subject matches assigned subject (optional security check or just context)
                    // if (userData.assignedSubject && !username.includes(userData.assignedSubject)) ...
                    redirectUrl = '/teacher-dashboard';
                } else {
                    redirectUrl = '/';
                }
            }

            localStorage.setItem('userInfo', JSON.stringify(userData));
            window.location.href = redirectUrl;

        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    const RoleCard = ({ role, icon, title, delay }) => (
        <Paper
            component={motion.div}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole(role)}
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: '24px',
                cursor: 'pointer',
                bgcolor: selectedRole === role ? alpha(theme.palette.primary.main, 0.2) : 'rgba(255,255,255,0.05)',
                border: '2px solid',
                borderColor: selectedRole === role ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
            }}
        >
            <Avatar sx={{
                width: 70,
                height: 70,
                mb: 2,
                bgcolor: selectedRole === role ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
                color: 'white'
            }}>
                {icon}
            </Avatar>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                {title}
            </Typography>
        </Paper>
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0f172a'
        }}>
            {/* Background elements same as before */}
            <Box
                component={motion.div}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    position: 'absolute',
                    inset: -50,
                    backgroundImage: `url(${loginBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)', zIndex: 1 }} />
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <Particle delay={0} duration={15} x="10%" y="20%" size={150} />
                <Particle delay={2} duration={20} x="80%" y="10%" size={200} />
            </Box>

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', py: 4 }}>

                {/* Header Logo */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <Avatar src={logo} sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '4px solid rgba(255,255,255,0.1)' }} />
                    </motion.div>
                    <Typography variant="h3" fontWeight="900" sx={{ background: 'linear-gradient(45deg, #fff, #60a5fa)', backgroundClip: 'text', textFillColor: 'transparent' }}>
                        EDUFLEX
                    </Typography>
                </Box>

                {!selectedRole ? (
                    <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                        <Grid item xs={12} sm={4}>
                            <RoleCard
                                role="admin"
                                title={t('admin_portal')}
                                icon={<AdminPanelSettings fontSize="large" />}
                                delay={0.1}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <RoleCard
                                role="teacher"
                                title={t('teacher_portal')}
                                icon={<SupervisedUserCircle fontSize="large" />}
                                delay={0.2}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <RoleCard
                                role="student"
                                title={t('student_portal')}
                                icon={<School fontSize="large" />}
                                delay={0.3}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <Paper
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        elevation={24}
                        sx={{
                            maxWidth: 450,
                            mx: 'auto',
                            width: '100%',
                            p: 4,
                            borderRadius: '32px',
                            backdropFilter: 'blur(16px)',
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Button
                                onClick={() => setSelectedRole(null)}
                                sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 'auto', mr: 2 }}
                            >
                                ← Back
                            </Button>
                            <Typography variant="h5" fontWeight="bold" color="white">
                                {selectedRole === 'student' ? t('login_as_student') :
                                    selectedRole === 'teacher' ? t('login_as_teacher') : t('login_as_admin')}
                            </Typography>
                        </Box>

                        <form onSubmit={handleLogin}>
                            {error && <Alert severity="error" variant="filled" sx={{ mb: 3 }}>{error}</Alert>}

                            {selectedRole === 'student' ? (
                                <TextField
                                    fullWidth
                                    placeholder={t('enter_student_id')}
                                    required
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><School sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>,
                                        sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', height: 56 }
                                    }}
                                    sx={{ mb: 4, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                />
                            ) : (
                                <>
                                    {selectedRole === 'teacher' && (
                                        <Box sx={{ mb: 2 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                value={username}
                                                // Map subject selection to username auto-fill for better UX if they don't know the handle? 
                                                // Or just let them select subject as a filter context.
                                                // User explicitly asked for "Select Subject".
                                                label="Select Your Subject"
                                                SelectProps={{ native: true }}
                                                InputProps={{
                                                    sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', height: 56 }
                                                }}
                                                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& label': { color: 'rgba(255,255,255,0.7)' } }}
                                                onChange={(e) => {
                                                    // If we want to auto-fill credential based on subject (demo mode):
                                                    // const sub = e.target.value;
                                                    // setUsername(sub.toLowerCase().split(' ')[0] + '_teacher');
                                                }}
                                            >
                                                <option value="" style={{ color: 'black' }}>Select Subject...</option>
                                                {subjects.map((sub) => (
                                                    <option key={sub._id} value={sub.name} style={{ color: 'black' }}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                            </TextField>
                                        </Box>
                                    )}

                                    <TextField
                                        fullWidth
                                        placeholder="Username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>,
                                            sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', height: 56 }
                                        }}
                                        sx={{ mb: 2, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                    />
                                    <TextField
                                        fullWidth
                                        placeholder="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment>,
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            ),
                                            sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', height: 56 }
                                        }}
                                        sx={{ mb: 4, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                    />
                                </>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                size="large"
                                sx={{
                                    py: 1.5,
                                    borderRadius: '16px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #2563eb 0%, #7c3aed 100%)'
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : t('sign_in')}
                            </Button>
                        </form>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}


