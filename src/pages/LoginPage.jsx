import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline } from '@mui/icons-material';
import API_BASE_URL from '../config';

import logo from '../assets/logo.jpg';
import loginBg from '../assets/login-bg.jpg';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Image with Parallax-like feel */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
            }} />

            {/* Premium Dark Overlay */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 100%)',
                backdropFilter: 'blur(8px)',
                zIndex: 1
            }} />

            <Container component="main" maxWidth="xs" sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                    style={{ width: '100%' }}
                >
                    <Paper elevation={24} sx={{
                        p: { xs: 4, sm: 5 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '32px',
                        backdropFilter: 'blur(20px)',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                        >
                            <Box sx={{
                                position: 'relative',
                                mb: 3,
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -5,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                                    opacity: 0.5,
                                    filter: 'blur(10px)',
                                    zIndex: -1
                                }
                            }}>
                                <img
                                    src={logo}
                                    alt="Eduflex Logo"
                                    style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        border: '3px solid rgba(255,255,255,0.8)',
                                        display: 'block'
                                    }}
                                />
                            </Box>
                        </motion.div>

                        <Typography component="h1" variant="h4" fontWeight="800" sx={{
                            mb: 1,
                            color: 'white',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            letterSpacing: -0.5
                        }}>
                            Welcome Back
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                            Sign in to access your classroom dashboard
                        </Typography>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ width: '100%', marginBottom: 24 }}
                            >
                                <Alert
                                    severity="error"
                                    variant="filled"
                                    sx={{
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        '& .MuiAlert-icon': { color: 'white' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </motion.div>
                        )}

                        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                placeholder="Username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        color: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '16px',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                        '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderColor: '#3b82f6' },
                                        transition: 'all 0.2s',
                                        height: 56,
                                        '& .MuiInputBase-input:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 100px rgba(30, 41, 59, 0.8) inset',
                                            WebkitTextFillColor: '#ffffff',
                                            borderRadius: '16px',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                        },
                                        '& .MuiInputBase-input': {
                                            color: 'white'
                                        }
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                }}
                            />

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
                                            <LockOutlined sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'rgba(255,255,255,0.5)' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        color: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.05)', // Even more transparent
                                        borderRadius: '16px',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                        '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderColor: '#3b82f6' },
                                        transition: 'all 0.2s',
                                        height: 56,
                                        // Fix for Autofill
                                        '& .MuiInputBase-input:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 100px rgba(30, 41, 59, 0.8) inset', // Match dark overlay
                                            WebkitTextFillColor: '#ffffff',
                                            borderRadius: '16px', // Try to respect border radius
                                            transition: 'background-color 5000s ease-in-out 0s',
                                        },
                                        '& .MuiInputBase-input': {
                                            color: 'white' // Ensure typing text is white
                                        }
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    mb: 3
                                }}
                            />

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
                                    fontSize: '1rem',
                                    background: 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #2563eb 0%, #1d4ed8 100%)',
                                        boxShadow: '0 15px 30px -5px rgba(59, 130, 246, 0.6)',
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                            </Button>
                        </Box>

                        <Box sx={{ mt: 4, opacity: 0.6 }}>
                            <Typography variant="caption" sx={{ color: 'white' }}>
                                © 2026 Eduflex Institute
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}
