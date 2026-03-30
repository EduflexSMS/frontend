import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, Avatar, useTheme, useMediaQuery, InputBase, alpha, Button } from '@mui/material';
import { Dashboard, People, Class, AddBox, Assessment, Menu as MenuIcon, NotificationsOutlined, Search as SearchIcon, SettingsOutlined, Logout as LogoutIcon, Language, Today, WbSunny, NightlightRound } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpg';

import { containerStagger, itemFadeUp, tapScale, springFast } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import Background3D from './Background3D';
import VoiceCommander from './VoiceCommander';
import PageTransition from './PageTransition'; // Import the new component
import { ThemeContext } from '../contexts/ThemeContext';

const drawerWidth = 280;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { toggleColorMode, mode } = React.useContext(ThemeContext);

    const { t, i18n } = useTranslation();

    const menuItems = [
        { text: t('dashboard'), icon: <Dashboard />, path: '/' },
        { text: t('view_students'), icon: <People />, path: '/students' },
        { text: 'Daily Report', icon: <Today />, path: '/daily-report' },
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
            variants={containerStagger(0.08)}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                color: theme.palette.text.primary,
                background: 'transparent',
                position: 'relative',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: alpha(theme.palette.text.primary, 0.1), borderRadius: '4px' }
            }}
        >

            <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1, mb: 2 }}>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springFast}
                    layout
                >
                    <Avatar
                        src={logo}
                        sx={{
                            width: { xs: 40, md: 52 },
                            height: { xs: 40, md: 52 },
                            border: `2px solid rgba(255,255,255,0.1)`,
                            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' 
                        }}
                    >E</Avatar>
                </motion.div>
                <Box component={motion.div} layout>
                    <Typography variant="h5" sx={{
                        fontWeight: 900,
                        letterSpacing: 1,
                        background: theme.palette.mode === 'dark' ? 'linear-gradient(45deg, #fff, #60a5fa)' : 'linear-gradient(45deg, #0f172a, #3b82f6)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        fontSize: { xs: '1.2rem', md: '1.5rem' }
                    }}>
                        EDUFLEX
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.secondary.main, letterSpacing: 4, fontSize: '0.6rem', fontWeight: 800 }}>
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
                                whileHover={{ scale: 1.02, x: 8 }}
                                whileTap={tapScale}
                                transition={springFast}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: '16px 20px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    color: active ? '#ffffff' : theme.palette.text.secondary,
                                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                    '&:hover': {
                                        color: active ? '#ffffff' : theme.palette.primary.main,
                                        bgcolor: active ? 'transparent' : alpha(theme.palette.text.primary, 0.04)
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
                                            borderRadius: '20px',
                                            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                                            zIndex: 0
                                        }}
                                        transition={springFast}
                                    />
                                )}

                                <ListItemIcon sx={{
                                    color: active ? '#ffd700' : 'inherit',
                                    minWidth: 42,
                                    zIndex: 1,
                                    transition: 'all 0.3s ease',
                                    transform: active ? 'scale(1.1)' : 'scale(1)'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{ zIndex: 1 }}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 800 : 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.02em',
                                        color: active ? '#ffffff' : 'inherit'
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
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(244, 63, 94, 0.15)' }}
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
                        borderRadius: '20px',
                        cursor: 'pointer',
                        color: theme.palette.error.main,
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.1),
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 42 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t('logout')}
                        primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
                    />
                </Box>
            </Box>

            <Box sx={{ p: 3, opacity: 0.6, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, letterSpacing: 2, fontWeight: 700 }}>
                    EDUFLEX v2.5 • 2026
                </Typography>
            </Box>
        </Box >
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default, transition: 'background-color 0.5s ease-in-out' }}>
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
                            background: alpha(theme.palette.background.paper, 0.4),
                            border: 'none',
                            backdropFilter: 'blur(32px)',
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
                        background: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(40px)',
                        border: 'none',
                        borderRight: '1px solid rgba(255,255,255,0.08)'
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
                    p: { xs: 1.5, sm: 3 },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Header / AppBar */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        borderRadius: { xs: '16px', md: '24px' },
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(32px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'text.primary',
                        top: { xs: 12, md: 20 }, 
                        mb: { xs: 2, md: 4 },
                        width: 'calc(100% - 24px)',
                        mx: 'auto',
                        zIndex: 1100,
                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            borderColor: theme.palette.divider,
                        }
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 1, display: { md: 'none' }, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '12px' }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${theme.palette.divider}`, borderRadius: '14px', px: 2, py: 0.8 }}>
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 18 }} />
                                <InputBase placeholder={t('search')} sx={{ fontSize: '0.85rem', color: 'text.primary', fontWeight: 500 }} />
                            </Box>
                        </Box>

                        {/* Voice Commander */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                            <VoiceCommander />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Button
                                startIcon={<Language />}
                                onClick={toggleLanguage}
                                sx={{
                                    color: theme.palette.text.primary,
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    borderRadius: '14px',
                                    px: { xs: 1, sm: 2.5 },
                                    py: 1,
                                    minWidth: { xs: 40, sm: 'auto' },
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    '& .MuiButton-startIcon': { margin: { xs: 0, sm: 1 } },
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.25),
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {i18n.language === 'si' ? 'සිංහල' : 'English'}
                                </Box>
                            </Button>
                            
                             <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                                 <IconButton 
                                     onClick={toggleColorMode} 
                                     size="small" 
                                     sx={{ 
                                         color: mode === 'dark' ? '#fbbf24' : '#64748b', 
                                         bgcolor: alpha(theme.palette.text.primary, 0.03), 
                                         borderRadius: '12px', 
                                         p: 1, 
                                         mr: 1 
                                     }}>
                                     {mode === 'dark' ? <WbSunny fontSize="small" /> : <NightlightRound fontSize="small" />}
                                 </IconButton>
                                 <IconButton size="small" sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.text.primary, 0.03), borderRadius: '12px', p: 1 }}>
                                     <NotificationsOutlined fontSize="small" />
                                 </IconButton>
                             </Box>
                            
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5, 
                                ml: { xs: 0.5, sm: 1 }, 
                                p: 0.6, 
                                pr: { xs: 0.6, sm: 2 }, 
                                borderRadius: '18px', 
                                bgcolor: alpha(theme.palette.background.default, 0.3),
                                border: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.5), borderColor: theme.palette.divider }
                            }}>
                                <Avatar sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    bgcolor: 'primary.main', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 800,
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                }}>A</Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" sx={{ lineHeight: 1.1, color: 'text.primary', fontWeight: 800, fontSize: '0.85rem' }}>{t('admin_user')}</Typography>
                                    <Typography variant="caption" sx={{ color: 'primary.light', lineHeight: 1, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>{t('administrator')}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page Transitions */}
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </Box>
        </Box>
    );
}
