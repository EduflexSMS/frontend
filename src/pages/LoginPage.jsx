import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';

import logo from '../assets/logo.jpg';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/'; // Force reload to update app state
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Animated Background Blobs */}
            <Box component={motion.div}
                animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                sx={{ position: 'absolute', top: '10%', left: '10%', width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(33, 150, 243, 0.3)', filter: 'blur(60px)', zIndex: -1 }}
            />
            <Box component={motion.div}
                animate={{ x: [0, -30, 0], y: [0, 60, 0] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                sx={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(233, 30, 99, 0.2)', filter: 'blur(70px)', zIndex: -1 }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
            >
                <Paper elevation={6} sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                    <motion.img
                        src={logo}
                        alt="Eduflex Logo"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                        style={{ width: 100, height: 100, marginBottom: 16, borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 3, background: 'linear-gradient(45deg, #2196F3, #21CBF3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Welcome Back
                    </Typography>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ width: '100%', marginBottom: 16 }}
                        >
                            <Alert severity="error">{error}</Alert>
                        </motion.div>
                    )}

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3, mb: 2, py: 1.5,
                                borderRadius: 3,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                        </Button>
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
}
