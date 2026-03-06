import React, { useState, useContext } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, Avatar, useTheme, useMediaQuery, InputBase, alpha, Button, Switch, Divider } from '@mui/material';
import { Dashboard, People, Class, AddBox, Assessment, Menu as MenuIcon, NotificationsOutlined, Search as SearchIcon, SettingsOutlined, Logout as LogoutIcon, Language, Brightness4, Brightness7, Close, NotificationsActive, Speed } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpg';

import { containerStagger, itemFadeUp, tapScale, springFast } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import VoiceCommander from './VoiceCommander';
import PageTransition from './PageTransition';
import { ColorModeContext } from '../App';

const drawerWidth = 280;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjusted breakpoint
    const { toggleColorMode } = useContext(ColorModeContext);

    const { t, i18n } = useTranslation();

    const menuItems = [
        { text: t('dashboard'), icon: <Dashboard />, path: '/' },
        { text: t('view_students'), icon: <People />, path: '/students' },
        { text: t('class_reports'), icon: <Assessment />, path: '/reports' },
        { text: t('add_student'), icon: <AddBox />, path: '/add-student' },
        { text: t('add_subject'), icon: <Class />, path: '/add-subject' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'si' : 'en';
        i18n.changeLanguage(newLang);
    };

    const drawerContent = (
        <Box
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={containerStagger(0.05)}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                color: theme.palette.text.primary,
                background: 'transparent',
                position: 'relative',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }
            }}
        >
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1, mb: 2 }}>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springFast}
                >
                    <Avatar
                        src={logo}
                        sx={{
                            width: 56,
                            height: 56,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
                        }}
                    />
                </motion.div>
                <Box>
                    <Typography variant="h5" sx={{
                        fontWeight: 900,
                        letterSpacing: 1,
                        background: theme.palette.mode === 'light' ? 'linear-gradient(45deg, #0f172a, #3b82f6)' : 'linear-gradient(45deg, #fff, var(--aurora-cyan))',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                    }}>
                        EDUFLEX
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.secondary.main, letterSpacing: 2, fontSize: '0.65rem', fontWeight: 800 }}>
                        INSTITUTE
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 2, flex: 1, position: 'relative', zIndex: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem
                            component={motion.div}
                            variants={itemFadeUp}
                            key={item.text}
                            disablePadding
                            sx={{ mb: 1.5, display: 'block' }}
                        >
                            <Box
                                component={motion.div}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={tapScale}
                                transition={springFast}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: '14px 20px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    color: active ? (theme.palette.mode === 'light' ? '#fff' : '#000') : theme.palette.text.secondary,
                                    transition: 'color 0.3s ease',
                                    '&:hover': {
                                        color: active ? (theme.palette.mode === 'light' ? '#fff' : '#000') : theme.palette.primary.main,
                                        bgcolor: active ? 'transparent' : alpha(theme.palette.primary.main, 0.08)
                                    }
                                }}
                            >
                                {active && (
                                    <Box
                                        component={motion.div}
                                        layoutId="activeTab"
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '16px',
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                            boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            zIndex: 0
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <ListItemIcon sx={{
                                    color: active ? 'inherit' : 'inherit',
                                    minWidth: 45,
                                    zIndex: 1,
                                    filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{ zIndex: 1 }}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 800 : 600,
                                        fontSize: '0.95rem',
                                    }}
                                />
                            </Box>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                <Box
                    component={motion.div}
                    variants={itemFadeUp}
                    whileHover={{ scale: 1.02, backgroundColor: alpha(theme.palette.error.main, 0.15) }}
                    whileTap={tapScale}
                    transition={springFast}
                    onClick={() => {
                        sessionStorage.removeItem('userInfo');
                        localStorage.removeItem('userInfo');
                        navigate('/login');
                    }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: '14px 20px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        color: theme.palette.error.main,
                        backgroundColor: alpha(theme.palette.error.main, 0.05),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.1),
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('logout')}
                        primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }}
                    />
                </Box>
            </Box>

            <Box sx={{ p: 3, opacity: 0.6, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled, letterSpacing: 1, fontWeight: 700 }}>
                    EDUFLEX v2.0
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
            <CssBaseline />

            {/* Sidebar Navigation - Desktop Floating Island */}
            <Box
                component="nav"
                sx={{
                    width: { md: drawerWidth },
                    flexShrink: { md: 0 },
                    display: { xs: 'none', md: 'block' },
                    p: 2, // Spacing to make it float
                    zIndex: 1200
                }}
            >
                <Drawer
                    variant="permanent"
                    open
                    PaperProps={{
                        sx: {
                            boxSizing: 'border-box',
                            width: drawerWidth - 32, // Accommodate padding
                            margin: '16px', // Floating effect
                            height: 'calc(100vh - 32px)',
                            background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.5)',
                            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '32px', // Rounder curves
                            backdropFilter: 'blur(40px)',
                            boxShadow: theme.palette.mode === 'light' ? '0 10px 40px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.4)',
                            overflow: 'hidden'
                        }
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 15, 15, 0.9)',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backdropFilter: 'blur(40px)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    pt: { md: 2 } // Align with floating sidebar
                }}
            >
                {/* Floating Header / AppBar */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        borderRadius: { xs: '16px', md: '24px' },
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(20, 20, 20, 0.6)',
                        backdropFilter: 'blur(24px)',
                        border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'}`,
                        color: 'text.primary',
                        top: { xs: 0, md: 0 },
                        mb: { xs: 3, md: 4 },
                        width: '100%',
                        zIndex: 1100,
                        boxShadow: theme.palette.mode === 'light' ? '0 4px 20px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2, display: { md: 'none' }, color: 'primary.main' }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', bgcolor: alpha(theme.palette.text.primary, 0.05), borderRadius: '16px', px: 2, py: 0.75 }}>
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 22 }} />
                                <InputBase placeholder={t('search')} sx={{ fontSize: '0.95rem', color: 'text.primary', fontWeight: 500 }} />
                            </Box>
                        </Box>

                        {/* Voice Commander */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: { xs: '80px', sm: 'auto' } }}>
                            <VoiceCommander />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
                            <Button
                                startIcon={<Language sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                                onClick={toggleLanguage}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: '12px',
                                    px: { xs: 1.5, sm: 2 },
                                    minWidth: { xs: 'auto', sm: '64px' },
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2)
                                    }
                                }}
                            >
                                {i18n.language === 'si' ? 'සිං' : 'EN'}
                            </Button>

                            <IconButton onClick={toggleColorMode} sx={{ color: 'text.primary', bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main' } }}>
                                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>

                            <IconButton size="small" sx={{ color: 'text.secondary', display: { xs: 'none', md: 'inline-flex' }, '&:hover': { color: 'primary.main' } }}>
                                <NotificationsOutlined />
                            </IconButton>
                            <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: 'text.secondary', display: { xs: 'none', md: 'inline-flex' }, '&:hover': { color: 'primary.main', transform: 'rotate(90deg)', transition: 'transform 0.3s' } }}>
                                <SettingsOutlined />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 0, sm: 1 }, p: 0.5, pr: { xs: 0.5, sm: 1.5 }, borderRadius: '24px', border: { xs: 'none', sm: `1px solid ${theme.palette.divider}` }, bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)' }}>
                                <Avatar sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 800, color: '#000' }}>A</Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2, color: 'text.primary', fontWeight: 800 }}>{t('admin_user')}</Typography>
                                    <Typography variant="caption" sx={{ color: 'primary.main', lineHeight: 1, fontWeight: 700 }}>{t('administrator')}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page Transitions with AnimatePresence */}
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>

                {/* Settings Drawer */}
                <Drawer
                    anchor="right"
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    PaperProps={{
                        sx: {
                            width: { xs: '100%', sm: 340 },
                            background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 15, 0.95)',
                            backdropFilter: 'blur(40px)',
                            borderLeft: `1px solid ${theme.palette.divider}`
                        }
                    }}
                >
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SettingsOutlined color="primary" /> {t('settings') || 'Settings'}
                        </Typography>
                        <IconButton onClick={() => setSettingsOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: 'block' }}>App Preferences</Typography>

                        {/* Theme Toggle in Settings */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {theme.palette.mode === 'dark' ? <Brightness7 color="warning" /> : <Brightness4 color="secondary" />}
                                <Box>
                                    <Typography variant="body1" fontWeight={700}>Dark Mode</Typography>
                                    <Typography variant="caption" color="text.secondary">Toggle app appearance</Typography>
                                </Box>
                            </Box>
                            <Switch checked={theme.palette.mode === 'dark'} onChange={toggleColorMode} color="primary" />
                        </Box>

                        {/* Language Toggle in Settings */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Language color="info" />
                                <Box>
                                    <Typography variant="body1" fontWeight={700}>Language</Typography>
                                    <Typography variant="caption" color="text.secondary">{i18n.language === 'si' ? 'Sinhala' : 'English'}</Typography>
                                </Box>
                            </Box>
                            <Button variant="outlined" size="small" onClick={toggleLanguage} sx={{ borderRadius: 2 }}>
                                {i18n.language === 'si' ? 'SWITCH EN' : 'SWITCH SI'}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />
                        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: 'block' }}>Features & Alerts</Typography>

                        {/* Notifications Toggle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <NotificationsActive color="error" />
                                <Box>
                                    <Typography variant="body1" fontWeight={700}>Email Alerts</Typography>
                                    <Typography variant="caption" color="text.secondary">Daily summary reports</Typography>
                                </Box>
                            </Box>
                            <Switch defaultChecked color="success" />
                        </Box>

                        {/* Compact mode / performance */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Speed color="success" />
                                <Box>
                                    <Typography variant="body1" fontWeight={700}>Animations</Typography>
                                    <Typography variant="caption" color="text.secondary">UI spring physics</Typography>
                                </Box>
                            </Box>
                            <Switch defaultChecked color="primary" />
                        </Box>
                    </Box>
                    <Box sx={{ mt: 'auto', p: 3, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Eduflex Version 2.0.1</Typography>
                    </Box>
                </Drawer>
            </Box>
        </Box>
    );
}
