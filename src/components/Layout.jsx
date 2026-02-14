import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, Avatar, useTheme, useMediaQuery, InputBase, alpha, Button } from '@mui/material';
import { Dashboard, People, Class, AddBox, Assessment, Menu as MenuIcon, NotificationsOutlined, Search as SearchIcon, SettingsOutlined, Logout as LogoutIcon, Language } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpg';

import { containerStagger, itemFadeUp, tapScale, springFast } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import Background3D from './Background3D';
import VoiceCommander from './VoiceCommander';
import PageTransition from './PageTransition'; // Import the new component

const drawerWidth = 280;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                color: 'white',
                background: 'transparent',
                position: 'relative',
                overflowY: 'auto',
                height: '100%',
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
                            width: 48,
                            height: 48,
                            border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            boxShadow: '0 0 20px rgba(15, 82, 186, 0.5)' // Primary glow
                        }}
                    >E</Avatar>
                </motion.div>
                <Box>
                    <Typography variant="h5" sx={{
                        fontWeight: 900,
                        letterSpacing: 1,
                        background: 'linear-gradient(45deg, #fff, #4c82ef)', // White to Light Blue
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                    }}>
                        EDUFLEX
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.secondary.main, letterSpacing: 3, fontSize: '0.65rem', fontWeight: 700 }}>
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
                            sx={{ mb: 1, display: 'block' }}
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
                                    color: active ? 'white' : theme.palette.text.secondary,
                                    transition: 'color 0.3s ease',
                                    '&:hover': {
                                        color: active ? 'white' : theme.palette.primary.light,
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
                                            background: 'linear-gradient(90deg, #0f52ba 0%, #002b8a 100%)', // Royal Blue Gradient
                                            boxShadow: '0 4px 15px rgba(15, 82, 186, 0.4)',
                                            zIndex: 0
                                        }}
                                        transition={springFast}
                                    />
                                )}

                                <ListItemIcon sx={{
                                    color: active ? '#ffd700' : 'inherit', // Gold icon when active
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
                                        fontWeight: active ? 700 : 500,
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
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                    whileTap={tapScale}
                    transition={springFast}
                    onClick={() => {
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
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                    />
                </Box>
            </Box>

            <Box sx={{ p: 3, opacity: 0.6, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled, letterSpacing: 1 }}>
                    v2.0 • 2026
                </Typography>
            </Box>
        </Box >
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
            <Background3D />
            <div className="noise-overlay" />
            <CssBaseline />

            {/* Sidebar Navigation - Floating Glass Panel */}
            <Box
                component="nav"
                sx={{
                    width: { md: drawerWidth },
                    flexShrink: { md: 0 },
                    display: { xs: 'none', md: 'block' }
                }}
            >
                <Drawer
                    variant="permanent"
                    open
                    PaperProps={{
                        sx: {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: alpha('#0b1121', 0.6),
                            borderRight: '1px solid',
                            border: 'none',
                            borderColor: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(40px)', // Crystal Blur
                            height: '100vh',
                            boxShadow: 'none',
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
                        background: 'transparent',
                        border: 'none',
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
                    p: { xs: 2, sm: 3 },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    // Improve overflow handling
                    overflowX: 'hidden'
                }}
            >
                {/* Header / AppBar - Now strictly inside the main content flow or sticky */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        borderRadius: { md: '20px' },
                        bgcolor: alpha('#151e32', 0.7), // Theme paper color with opacity
                        backdropFilter: 'blur(24px)',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: 'text.primary',
                        top: { xs: 0, md: 16 }, // Add spacing from top on desktop
                        mb: { xs: 2, md: 4 },
                        width: '100%',
                        zIndex: 1100
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
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
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', bgcolor: alpha(theme.palette.text.primary, 0.05), borderRadius: '12px', px: 2, py: 0.5 }}>
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                <InputBase placeholder={t('search')} sx={{ fontSize: '0.9rem', color: 'text.primary' }} />
                            </Box>
                        </Box>

                        {/* Voice Commander (Center-Right) */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                            <VoiceCommander />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                startIcon={<Language />}
                                onClick={toggleLanguage}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: '12px',
                                    px: 2,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2)
                                    }
                                }}
                            >
                                {i18n.language === 'si' ? 'සිංහල' : 'English'}
                            </Button>

                            <IconButton size="small" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}>
                                <NotificationsOutlined />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}>
                                <SettingsOutlined />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1, p: 0.5, pr: 1.5, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>A</Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2, color: 'text.primary' }}>{t('admin_user')}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>{t('administrator')}</Typography>
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
            </Box>
        </Box>
    );
}
