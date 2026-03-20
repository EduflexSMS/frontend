import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, CircularProgress, Alert, InputAdornment, IconButton, useTheme, alpha, Avatar, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline, School, AdminPanelSettings, SupervisedUserCircle } from '@mui/icons-material';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';

import logo from '../assets/logo.jpg';
import loginBg from '../assets/login-bg.jpg';
import Background3D from '../components/Background3D';

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
    const [selectedSubject, setSelectedSubject] = useState(''); // For teacher login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Prevent flash
    const theme = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuth = () => {
            // Check sessionStorage primarily
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

            // Migration/Cleanup: Check if localStorage has it, if so, maybe we want to respect it one last time or just clear it?
            // For security, if we want to enforce session only, we should probably ignore localStorage or clear it.
            // Let's clear localStorage to ensure no old sessions persist if the user manually kept them.
            if (localStorage.getItem('userInfo')) {
                localStorage.removeItem('userInfo');
            }

            if (userInfo) {
                if (userInfo.role === 'student') window.location.href = '/student-dashboard';
                else if (userInfo.role === 'teacher') window.location.href = '/teacher-dashboard';
                else if (userInfo.role === 'admin') window.location.href = '/';
                else setIsCheckingAuth(false); // Valid user but unknown role? Should log out, but for now show login
            } else {
                setIsCheckingAuth(false);
            }
        };
        checkAuth();

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
            let userData = null;
            let redirectUrl = '/';

            // 1. Prepare Login Data
            const loginData = { username, password, role: selectedRole }; // Send role to backend

            if (selectedRole === 'student') {
                if (!studentId) throw new Error("Student ID is required");
                // Mock student login for now or use API if available
                userData = { role: 'student', id: studentId, name: "Student User" };
                redirectUrl = '/student-dashboard';
            } else {
                if (!username || !password) throw new Error("Username and password required");

                // 2. Call Backend API
                const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
                userData = data;

                // 3. Strict Client-Side Role Verification (Double Check)
                if (userData.role !== selectedRole) {
                    throw new Error(`Access Denied: You cannot login as ${selectedRole} with a ${userData.role} account.`);
                }

                if (selectedRole === 'teacher') {
                    redirectUrl = '/teacher-dashboard';
                } else if (selectedRole === 'admin') {
                    redirectUrl = '/';
                }
            }

            sessionStorage.setItem('userInfo', JSON.stringify(userData));
            // Ensure we don't leave traces in localStorage
            localStorage.removeItem('userInfo');
            window.location.href = redirectUrl;

        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    // Show full screen loader while checking auth to prevent flash
    if (isCheckingAuth) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#09090b' }}>
                <CircularProgress />
            </Box>
        );
    }

    const RoleCard = ({ role, icon, title, subtitle, delay }) => (
        <Paper
            component={motion.div}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10, scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRole(role)}
            sx={{
                p: 4,
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: '32px',
                cursor: 'pointer',
                bgcolor: selectedRole === role ? alpha(theme.palette.primary.main, 0.2) : 'rgba(255,255,255,0.03)',
                border: '1px solid',
                borderColor: selectedRole === role ? theme.palette.primary.main : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: selectedRole === role
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`
                    : 'transparent',
                zIndex: 0
            }} />

            <Avatar sx={{
                width: 80,
                height: 80,
                mb: 3,
                bgcolor: selectedRole === role ? theme.palette.primary.main : 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '2.5rem',
                boxShadow: selectedRole === role ? `0 0 20px ${theme.palette.primary.main}` : 'none',
                zIndex: 1
            }}>
                {icon}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 1, zIndex: 1 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', zIndex: 1 }}>
                {subtitle}
            </Typography>
        </Paper>
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#09090b', // Deep rich black
            color: 'white'
        }}>
            {/* 3D Background */}
            <Background3D />

            {/* Overlay Gradient for readability */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', py: 4 }}>

                {/* Header Logo */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 1 }}>
                        <Box sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            mx: 'auto',
                            mb: 3,
                            borderRadius: '50%',
                            padding: '4px',
                            background: 'linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)',
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)'
                        }}>
                            <Avatar src={logo} sx={{ width: '100%', height: '100%', border: '4px solid #000' }} />
                        </Box>
                    </motion.div>
                    <Typography variant="h2" fontWeight="900" sx={{
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        mb: 1
                    }}>
                        EDUFLEX
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Institute Management System
                    </Typography>
                </Box>

                <AnimatePresence mode="wait">
                    {!selectedRole ? (
                        <Grid container spacing={4} justifyContent="center" key="role-selection">
                            <Grid item xs={12} md={4}>
                                <RoleCard
                                    role="admin"
                                    title={t('admin_portal')}
                                    subtitle="Manage institute settings & users"
                                    icon={<AdminPanelSettings fontSize="inherit" />}
                                    delay={0.1}
                                />
                            </Grid>
                            {/* <Grid item xs={12} md={4}>
                                <RoleCard
                                    role="teacher"
                                    title={t('teacher_portal')}
                                    subtitle="Manage classes, materials & students"
                                    icon={<SupervisedUserCircle fontSize="inherit" />}
                                    delay={0.2}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <RoleCard
                                    role="student"
                                    title={t('student_portal')}
                                    subtitle="Access dashboard & learning materials"
                                    icon={<School fontSize="inherit" />}
                                    delay={0.3}
                                />
                            </Grid> */}
                        </Grid>
                    ) : (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    maxWidth: 480,
                                    mx: 'auto',
                                    p: { xs: 4, sm: 6 },
                                    borderRadius: '40px',
                                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(40px)',
                                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
                                    <IconButton
                                        onClick={() => setSelectedRole(null)}
                                        sx={{
                                            color: 'rgba(255,255,255,0.6)',
                                            mr: 2,
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }
                                        }}
                                    >
                                        <Typography variant="h6" component="span">←</Typography>
                                    </IconButton>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" color="white">
                                            {selectedRole === 'student' ? 'Student Login' :
                                                selectedRole === 'teacher' ? 'Teacher Login' : 'Admin Access'}
                                        </Typography>
                                        <Typography variant="body2" color="rgba(255,255,255,0.5)">
                                            Please enter your credentials
                                        </Typography>
                                    </Box>
                                </Box>

                                <form onSubmit={handleLogin}>
                                    {error && (
                                        <Alert
                                            severity="error"
                                            variant="filled"
                                            sx={{ mb: 3, borderRadius: '12px', bgcolor: alpha(theme.palette.error.main, 0.2), color: '#ff6b6b' }}
                                        >
                                            {error}
                                        </Alert>
                                    )}

                                    {selectedRole === 'student' ? (
                                        <Box sx={{ mb: 4 }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1, mb: 1, display: 'block', fontWeight: 600 }}>STUDENT ID</Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="e.g. STU-2026-001"
                                                required
                                                value={studentId}
                                                onChange={(e) => setStudentId(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><School sx={{ color: 'rgba(255,255,255,0.4)' }} /></InputAdornment>,
                                                    sx: {
                                                        color: 'white',
                                                        bgcolor: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '16px',
                                                        height: 60,
                                                        fontSize: '1.1rem',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' },
                                                        '&.Mui-focused': { borderColor: theme.palette.primary.main, bgcolor: 'rgba(0,0,0,0.4)' }
                                                    }
                                                }}
                                                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                            />
                                        </Box>
                                    ) : (
                                        <>
                                            {selectedRole === 'teacher' && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1, mb: 1, display: 'block', fontWeight: 600 }}>SUBJECT</Typography>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        required
                                                        value={selectedSubject}
                                                        SelectProps={{ native: true }}
                                                        InputProps={{
                                                            sx: {
                                                                color: 'white',
                                                                bgcolor: 'rgba(0,0,0,0.2)',
                                                                borderRadius: '16px',
                                                                height: 60,
                                                                border: '1px solid rgba(255,255,255,0.05)'
                                                            }
                                                        }}
                                                        sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                                    >
                                                        <option value="" style={{ color: '#000' }}>Select Subject...</option>
                                                        {subjects.map((sub) => (
                                                            <option key={sub._id} value={sub.name} style={{ color: '#000' }}>
                                                                {sub.name}
                                                            </option>
                                                        ))}
                                                    </TextField>
                                                </Box>
                                            )}

                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1, mb: 1, display: 'block', fontWeight: 600 }}>USERNAME</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter username"
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: 'rgba(255,255,255,0.4)' }} /></InputAdornment>,
                                                        sx: {
                                                            color: 'white',
                                                            bgcolor: 'rgba(0,0,0,0.2)',
                                                            borderRadius: '16px',
                                                            height: 60,
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            '&.Mui-focused': { borderColor: theme.palette.primary.main }
                                                        }
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                                />
                                            </Box>

                                            <Box sx={{ mb: 5 }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 1, mb: 1, display: 'block', fontWeight: 600 }}>PASSWORD</Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="••••••••"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(255,255,255,0.4)' }} /></InputAdornment>,
                                                        endAdornment: (
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        ),
                                                        sx: {
                                                            color: 'white',
                                                            bgcolor: 'rgba(0,0,0,0.2)',
                                                            borderRadius: '16px',
                                                            height: 60,
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            '&.Mui-focused': { borderColor: theme.palette.primary.main }
                                                        }
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                                                />
                                            </Box>
                                        </>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        component={motion.button}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        sx={{
                                            py: 2,
                                            borderRadius: '16px',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                                            textTransform: 'none',
                                            '&:disabled': { opacity: 0.7 }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                    </Button>
                                </form>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </Box>
    );
}
