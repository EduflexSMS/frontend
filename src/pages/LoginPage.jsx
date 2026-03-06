import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, InputAdornment, IconButton, useTheme, alpha, Avatar, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline, School, AdminPanelSettings } from '@mui/icons-material';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';

import logo from '../assets/logo.jpg';
import educationalHero from '../assets/educational_hero.png';

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState(null); // 'admin', 'teacher', 'student'
    const [selectedSubject, setSelectedSubject] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const theme = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuth = () => {
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

            if (localStorage.getItem('userInfo')) {
                localStorage.removeItem('userInfo');
            }

            if (userInfo) {
                if (userInfo.role === 'student') window.location.href = '/student-dashboard';
                else if (userInfo.role === 'teacher') window.location.href = '/teacher-dashboard';
                else if (userInfo.role === 'admin') window.location.href = '/';
                else setIsCheckingAuth(false);
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

            const loginData = { username, password, role: selectedRole };

            if (selectedRole === 'student') {
                if (!studentId) throw new Error("Student ID is required");
                userData = { role: 'student', id: studentId, name: "Student User" };
                redirectUrl = '/student-dashboard';
            } else {
                if (!username || !password) throw new Error("Username and password required");

                const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
                userData = data;

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
            localStorage.removeItem('userInfo');
            window.location.href = redirectUrl;

        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                <CircularProgress sx={{ color: 'var(--aurora-cyan)' }} />
            </Box>
        );
    }

    const RoleCard = ({ role, icon, title, subtitle, delay }) => (
        <Paper
            component={motion.div}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 80, damping: 15 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole(role)}
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'left',
                borderRadius: '24px',
                cursor: 'pointer',
                bgcolor: selectedRole === role ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                border: '1px solid',
                borderColor: selectedRole === role ? theme.palette.primary.main : theme.palette.divider,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'none'
            }}
        >
            <Avatar sx={{
                width: 60,
                height: 60,
                mr: 3,
                bgcolor: selectedRole === role ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.05),
                color: selectedRole === role ? (theme.palette.mode === 'light' ? '#fff' : '#000') : theme.palette.text.primary,
                fontSize: '2rem',
                transition: 'all 0.3s ease'
            }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'transparent' }}>
            <Grid container sx={{ minHeight: '100vh' }}>

                {/* LEFT SIDE: Brand & Aurora Vibe (Hidden on very small screens) */}
                <Grid item xs={12} md={6} lg={7} sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRight: `1px solid ${theme.palette.divider}`
                }}>
                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                        <Avatar src={logo} sx={{ width: 120, height: 120, mb: 4, borderRadius: '32px', border: '2px solid rgba(255,255,255,0.1)' }} />
                        <Typography variant="h1" sx={{
                            fontSize: { md: '4rem', lg: '5.5rem' },
                            background: theme.palette.mode === 'light' ? 'linear-gradient(to right, #000, #475569)' : 'linear-gradient(to right, #ffffff, #94a3b8)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            lineHeight: 1.1,
                            mb: 2
                        }}>
                            Next-Gen.<br />Institute Mgmt.
                        </Typography>
                        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 500 }}>
                            Experience the fluid, responsive power of the Eduflex platform.
                        </Typography>
                    </motion.div>
                </Grid>

                {/* RIGHT SIDE: Auth Form */}
                <Grid item xs={12} md={6} lg={5} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 3, sm: 6, lg: 8 },
                    zIndex: 10,
                    position: 'relative'
                }}>
                    {/* Educational 3D Hero Image */}
                    <Box
                        component={motion.img}
                        src={educationalHero}
                        alt="Eduflex Modern Education Platform"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                        transition={{
                            opacity: { duration: 0.8 },
                            scale: { duration: 0.8 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            position: 'fixed',
                            right: '5%',
                            top: '45%',
                            transform: 'translateY(-50%) scale(1.05)',
                            width: '650px',
                            height: 'auto',
                            zIndex: 0,
                            mixBlendMode: theme.palette.mode === 'light' ? 'multiply' : 'lighten',
                            opacity: theme.palette.mode === 'light' ? 0.95 : 0.8,
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                            pointerEvents: 'none'
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        style={{ width: '100%', maxWidth: 480 }}
                    >
                        <Paper sx={{ p: { xs: 4, sm: 5 }, width: '100%' }}>
                            {/* Mobile Logo Fallback */}
                            <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
                                <Avatar src={logo} sx={{ width: 80, height: 80, mx: 'auto', mb: 2, borderRadius: '24px' }} />
                                <Typography variant="h4" fontWeight="900">EDUFLEX</Typography>
                            </Box>

                            <AnimatePresence mode="wait">
                                {!selectedRole ? (
                                    <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>Welcome Back</Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Select your role to continue securely.</Typography>

                                        <Grid container spacing={3} direction="column">
                                            <Grid item xs={12}>
                                                <RoleCard
                                                    role="admin"
                                                    title={t('admin_portal')}
                                                    subtitle="Manage institute settings & users"
                                                    icon={<AdminPanelSettings fontSize="inherit" />}
                                                    delay={0.1}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <RoleCard
                                                    role="teacher"
                                                    title={t('teacher_portal')}
                                                    subtitle="Manage classes, materials & students"
                                                    icon={<School fontSize="inherit" />}
                                                    delay={0.2}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <RoleCard
                                                    role="student"
                                                    title={t('student_portal')}
                                                    subtitle="Access dashboard & learning materials"
                                                    icon={<PersonOutline fontSize="inherit" />}
                                                    delay={0.3}
                                                />
                                            </Grid>
                                        </Grid>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: "circOut" }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                            <IconButton
                                                onClick={() => setSelectedRole(null)}
                                                sx={{ mr: 2, bgcolor: alpha(theme.palette.text.primary, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main } }}
                                            >
                                                <Typography variant="h6" component="span" sx={{ lineHeight: 1 }}>←</Typography>
                                            </IconButton>
                                            <Box>
                                                <Typography variant="h4" fontWeight="800">
                                                    {selectedRole === 'student' ? 'Student Login' :
                                                        selectedRole === 'teacher' ? 'Teacher Login' : 'Admin Access'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Enter your credentials
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <form onSubmit={handleLogin}>
                                            {error && (
                                                <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}>
                                                    {error}
                                                </Alert>
                                            )}

                                            {selectedRole === 'student' ? (
                                                <Box sx={{ mb: 4 }}>
                                                    <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: 'text.secondary' }}>STUDENT ID</Typography>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="e.g. STU-2026-001"
                                                        required
                                                        value={studentId}
                                                        onChange={(e) => setStudentId(e.target.value)}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start"><School sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <>
                                                    {selectedRole === 'teacher' && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: 'text.secondary' }}>SUBJECT</Typography>
                                                            <TextField
                                                                select
                                                                fullWidth
                                                                required
                                                                value={selectedSubject}
                                                                SelectProps={{ native: true }}
                                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                                            >
                                                                <option value="" style={{ color: theme.palette.mode === 'light' ? '#000' : '#fff', background: theme.palette.background.paper }}>Select Subject...</option>
                                                                {subjects.map((sub) => (
                                                                    <option key={sub._id} value={sub.name} style={{ color: theme.palette.mode === 'light' ? '#000' : '#fff', background: theme.palette.background.paper }}>
                                                                        {sub.name}
                                                                    </option>
                                                                ))}
                                                            </TextField>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: 'text.secondary' }}>USERNAME</Typography>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Enter username"
                                                            required
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ mb: 5 }}>
                                                        <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 700, letterSpacing: '0.05em', color: 'text.secondary' }}>PASSWORD</Typography>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="••••••••"
                                                            type={showPassword ? 'text' : 'password'}
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                                                endAdornment: (
                                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                    </IconButton>
                                                                ),
                                                            }}
                                                        />
                                                    </Box>
                                                </>
                                            )}

                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                disabled={loading}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                component={motion.button}
                                                sx={{ py: 2, fontSize: '1.1rem' }}
                                            >
                                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Authenticate →'}
                                            </Button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
}
