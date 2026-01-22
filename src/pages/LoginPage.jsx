import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, CircularProgress, Alert, InputAdornment, IconButton, useTheme, alpha, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline, School } from '@mui/icons-material';
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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const { t } = useTranslation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    // Staggered variants for children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0f172a' // Base dark color to prevent flash
        }}>
            {/* 1. Ken Burns Effect Background */}
            <Box
                component={motion.div}
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                sx={{
                    position: 'absolute',
                    inset: -50, // Allow scaling without edges showing
                    backgroundImage: `url(${loginBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />

            {/* 2. Premium Gradient Overlay */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                // Darker, richer gradient
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.85) 100%)',
                zIndex: 1
            }} />

            {/* 3. Ambient Particles */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
                <Particle delay={0} duration={15} x="10%" y="20%" size={150} />
                <Particle delay={2} duration={20} x="80%" y="10%" size={200} />
                <Particle delay={5} duration={18} x="20%" y="80%" size={180} />
                <Particle delay={1} duration={12} x="90%" y="90%" size={120} />
            </Box>

            <Container component="main" maxWidth="xs" sx={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                px: 2
            }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%' }}
                >
                    <Paper
                        component={motion.div}
                        whileHover={{
                            y: -5,
                            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)'
                        }}
                        elevation={24}
                        sx={{
                            p: { xs: 4, sm: 5 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: '32px',
                            // Advanced Glassmorphism
                            backdropFilter: 'blur(16px)',
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderTopColor: 'rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {/* Logo Section */}
                        <motion.div variants={itemVariants}>
                            <Box sx={{
                                position: 'relative',
                                mb: 3,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -3,
                                    borderRadius: '50%',
                                    padding: '2px',
                                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    opacity: 0.8,
                                    animation: 'spin 3s linear infinite' // Add spin in CSS if wanted, or static gradient
                                },
                            }}>
                                <Avatar
                                    src={logo}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '4px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
                                    }}
                                />
                            </Box>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ width: '100%', textAlign: 'center' }}>
                            <Typography component="h1" variant="h4" fontWeight="800" sx={{
                                mb: 0.5,
                                background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                textShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                {t('welcome_back')}
                            </Typography>

                            <Typography variant="body2" sx={{
                                mb: 5,
                                color: 'rgba(255,255,255,0.5)',
                                fontWeight: 500,
                                fontSize: '0.95rem'
                            }}>
                                {t('access_dashboard')}
                            </Typography>
                        </motion.div>

                        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, mb: 0 }}
                                        animate={{ opacity: 1, height: 'auto', mb: 24 }}
                                        exit={{ opacity: 0, height: 0, mb: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <Alert
                                            severity="error"
                                            variant="filled"
                                            sx={{
                                                borderRadius: '16px',
                                                bgcolor: alpha(theme.palette.error.main, 0.9),
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${theme.palette.error.main}`
                                            }}
                                        >
                                            {error}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutline sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: 'white',
                                            bgcolor: 'rgba(0, 0, 0, 0.2)', // Darker input bg
                                            borderRadius: '16px',
                                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                                            '&.Mui-focused': {
                                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                                            },
                                            transition: 'all 0.3s ease',
                                            height: 56,
                                            '& .MuiInputBase-input:-webkit-autofill': {
                                                WebkitBoxShadow: '0 0 0 100px rgba(30, 41, 59, 0.8) inset',
                                                WebkitTextFillColor: '#ffffff',
                                                borderRadius: '16px',
                                                transition: 'background-color 5000s ease-in-out 0s',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                                fontWeight: 500
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        mb: 2.5
                                    }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    placeholder="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white' } }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: 'white',
                                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '16px',
                                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                                            '&.Mui-focused': {
                                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                                            },
                                            transition: 'all 0.3s ease',
                                            height: 56,
                                            '& .MuiInputBase-input:-webkit-autofill': {
                                                WebkitBoxShadow: '0 0 0 100px rgba(30, 41, 59, 0.8) inset',
                                                WebkitTextFillColor: '#ffffff',
                                                borderRadius: '16px',
                                                transition: 'background-color 5000s ease-in-out 0s',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                                fontWeight: 500
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        mb: 4
                                    }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button
                                    component={motion.button}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: '16px',
                                        fontWeight: '700',
                                        fontSize: '1.05rem',
                                        background: 'linear-gradient(45deg, #2563eb 0%, #7c3aed 100%)', // Brighter gradient
                                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
                                        textTransform: 'none',
                                        letterSpacing: '0.5px',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #1d4ed8 0%, #6d28d9 100%)',
                                            boxShadow: '0 20px 35px -5px rgba(37, 99, 235, 0.6)',
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={26} color="inherit" /> : t('sign_in')}
                                </Button>
                            </motion.div>
                        </Box>

                        <motion.div variants={itemVariants} style={{ marginTop: '32px' }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                opacity: 0.5,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 0.8 }
                            }}>
                                <School fontSize="small" sx={{ color: 'white' }} />
                                <Typography variant="caption" sx={{ color: 'white', letterSpacing: 1 }}>
                                    EDUFLEX INSTITUTE • 2026
                                </Typography>
                            </Box>
                        </motion.div>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}
