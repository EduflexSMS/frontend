import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import API_BASE_URL from '../config';

export default function AdminSettingsDialog({ open, onClose }) {
    const { mode } = useContext(ThemeContext);
    const isDark = mode === 'dark';

    // Retrieve active logged in user from sessionStorage
    const getUserInfo = () => {
        try {
            const raw = sessionStorage.getItem('userInfo');
            return raw ? JSON.parse(raw) : { username: 'admin' };
        } catch {
            return { username: 'admin' };
        }
    };

    const [currentUsername, setCurrentUsername] = useState('admin');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Reset fields on modal open
    useEffect(() => {
        if (open) {
            const u = getUserInfo();
            const uname = u?.username || 'admin';
            setCurrentUsername(uname);
            setNewUsername(uname);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccessMessage('');
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!currentPassword) {
            setError('Please enter your current admin password to verify your identity.');
            return;
        }

        const isUserChanging = newUsername.trim() !== currentUsername.trim();
        const isPassChanging = newPassword.trim().length > 0;

        if (!isUserChanging && !isPassChanging) {
            setError('Please enter a new username or a new password to update.');
            return;
        }

        if (isPassChanging) {
            if (newPassword.trim().length < 4) {
                setError('New password must be at least 4 characters long.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('New passwords do not match.');
                return;
            }
        }

        setLoading(true);

        try {
            let updatedUsername = newUsername.trim() || currentUsername;
            let updatedUser = null;

            // 1. First attempt: Dedicated admin-credentials endpoint
            try {
                const res = await axios.put(`${API_BASE_URL}/api/auth/admin-credentials`, {
                    currentUsername,
                    currentPassword,
                    newUsername: isUserChanging ? newUsername.trim() : undefined,
                    newPassword: isPassChanging ? newPassword.trim() : undefined
                });

                if (res.data && res.data.success) {
                    updatedUser = res.data.user;
                }
            } catch (err1) {
                // If 404 (endpoint not deployed on remote vercel yet), use fallback verification & registration
                if (err1.response?.status === 404) {
                    // Verify current credentials first
                    await axios.post(`${API_BASE_URL}/api/auth/login`, {
                        username: currentUsername,
                        password: currentPassword,
                        role: 'admin'
                    });

                    // If username is changing, register new admin account
                    if (isUserChanging) {
                        const regRes = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                            username: newUsername.trim(),
                            password: isPassChanging ? newPassword.trim() : currentPassword
                        });
                        updatedUser = regRes.data;
                    } else {
                        // Same username on remote without admin-credentials endpoint
                        throw new Error('Please ensure local backend is running or backend updates are deployed to change password for existing username.');
                    }
                } else {
                    throw err1;
                }
            }

            // Update sessionStorage with new credentials so active session remains valid
            const currentInfo = getUserInfo();
            const newInfo = {
                ...currentInfo,
                username: updatedUsername,
                token: updatedUser?.token || currentInfo?.token
            };
            sessionStorage.setItem('userInfo', JSON.stringify(newInfo));

            setSuccessMessage(
                `Admin credentials updated successfully! New Username: "${updatedUsername}". Please keep your new password safe.`
            );

            // Clear inputs
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setCurrentUsername(updatedUsername);

        } catch (err) {
            console.error('Update credentials failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to update credentials. Please check current password.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}>
                {/* Backdrop Click to close */}
                <div
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0 }}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 480,
                        background: isDark
                            ? 'radial-gradient(120% 120% at 50% 0%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
                            : 'radial-gradient(120% 120% at 50% 0%, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 22,
                        boxShadow: isDark
                            ? '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px rgba(99,102,241,0.15)'
                            : '0 25px 50px -12px rgba(99,102,241,0.18)',
                        padding: '28px 30px',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        overflow: 'hidden',
                        zIndex: 2,
                    }}
                >
                    {/* Top Accent Bar */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                    }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 46,
                                height: 46,
                                borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 22,
                                color: '#6366f1',
                                flexShrink: 0
                            }}>
                                🛡️
                            </div>
                            <div>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 800,
                                    letterSpacing: '-0.3px',
                                    color: isDark ? '#f8fafc' : '#0f172a'
                                }}>
                                    Admin Credentials
                                </h2>
                                <p style={{
                                    margin: '3px 0 0',
                                    fontSize: 12.5,
                                    color: isDark ? '#94a3b8' : '#64748b'
                                }}>
                                    ගිණුමේ නම සහ මුරපදය වෙනස් කිරීම
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                color: isDark ? '#cbd5e1' : '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                fontWeight: 700
                            }}
                        >
                            ✕
                        </motion.button>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 12,
                                background: 'rgba(244, 63, 94, 0.12)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#f43f5e',
                                fontSize: 12.5,
                                fontWeight: 600,
                                marginBottom: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <span>⚠️</span>
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '12px 14px',
                                borderRadius: 12,
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#10b981',
                                fontSize: 12.5,
                                fontWeight: 600,
                                marginBottom: 16,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10
                            }}
                        >
                            <span style={{ fontSize: 16 }}>✅</span>
                            <span>{successMessage}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Current Username Info Banner */}
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: 12,
                            background: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            fontSize: 12,
                            color: isDark ? '#c7d2fe' : '#4f46e5',
                            marginBottom: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>Active Admin Username:</span>
                            <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 13 }}>
                                {currentUsername}
                            </span>
                        </div>

                        {/* Current Password Field (Verification) */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 6,
                                color: isDark ? '#cbd5e1' : '#475569'
                            }}>
                                Current Admin Password <span style={{ color: '#f43f5e' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password to verify..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 42px 10px 14px',
                                        borderRadius: 11,
                                        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                                        color: isDark ? '#f8fafc' : '#0f172a',
                                        fontSize: 13.5,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        fontSize: 14,
                                        padding: 0
                                    }}
                                >
                                    {showCurrentPass ? '👁️' : '🔒'}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{
                            height: 1,
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            margin: '18px 0 16px'
                        }} />

                        {/* New Username Field */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 6,
                                color: isDark ? '#cbd5e1' : '#475569'
                            }}>
                                New Username (අලුත් පරිශීලක නාමය)
                            </label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username..."
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 11,
                                    background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                                    color: isDark ? '#f8fafc' : '#0f172a',
                                    fontSize: 13.5,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* New Password Field */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 700,
                                marginBottom: 6,
                                color: isDark ? '#cbd5e1' : '#475569'
                            }}>
                                New Password (අලුත් මුරපදය)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 4 chars)..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 42px 10px 14px',
                                        borderRadius: 11,
                                        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                                        color: isDark ? '#f8fafc' : '#0f172a',
                                        fontSize: 13.5,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        fontSize: 14,
                                        padding: 0
                                    }}
                                >
                                    {showNewPass ? '👁️' : '🔒'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password Field */}
                        {newPassword.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginBottom: 18 }}
                            >
                                <label style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    marginBottom: 6,
                                    color: isDark ? '#cbd5e1' : '#475569'
                                }}>
                                    <span>Confirm New Password (මුරපදය නැවත සටහන් කරන්න)</span>
                                    {confirmPassword && (
                                        <span style={{ color: newPassword === confirmPassword ? '#10b981' : '#f43f5e' }}>
                                            {newPassword === confirmPassword ? '✓ Matches' : '✗ Mismatch'}
                                        </span>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPass ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 42px 10px 14px',
                                            borderRadius: 11,
                                            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                            border: confirmPassword
                                                ? (newPassword === confirmPassword ? '1px solid #10b981' : '1px solid #f43f5e')
                                                : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'),
                                            color: isDark ? '#f8fafc' : '#0f172a',
                                            fontSize: 13.5,
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: isDark ? '#94a3b8' : '#64748b',
                                            fontSize: 14,
                                            padding: 0
                                        }}
                                    >
                                        {showConfirmPass ? '👁️' : '🔒'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onClose}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 12,
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                    background: 'transparent',
                                    color: isDark ? '#cbd5e1' : '#64748b',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span>⏳</span>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        <span>Save Credentials</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
