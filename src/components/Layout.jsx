import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, Avatar, useTheme, useMediaQuery, InputBase } from '@mui/material';
import { Dashboard, People, Class, AddBox, Assessment, Menu as MenuIcon, NotificationsOutlined, Search as SearchIcon, SettingsOutlined, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const drawerWidth = 280;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'View Students', icon: <People />, path: '/students' },
        { text: 'Class Reports', icon: <Assessment />, path: '/reports' },
        { text: 'Add Student', icon: <AddBox />, path: '/add-student' },
        { text: 'Add Subject', icon: <Class />, path: '/add-subject' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    import logo from '../assets/logo.jpg';
    // ... inside component ...
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={logo} sx={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.2)' }}>E</Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1, background: 'linear-gradient(45deg, #fff, #a5b4fc)', backgroundClip: 'text', textFillColor: 'transparent', color: 'white' }}>
                EDUFLEX
            </Typography>
        </Box>

        <List sx={{ px: 2, flex: 1 }}>
            {menuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                    <ListItem
                        key={item.text}
                        disablePadding
                        sx={{ mb: 1, display: 'block' }}
                    >
                        <Box
                            component={motion.div}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: '12px 16px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                backdropFilter: active ? 'blur(10px)' : 'none',
                                boxShadow: active ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
                                border: active ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: active ? '#fbbf24' : 'rgba(255,255,255,0.7)', minWidth: 45 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: active ? 600 : 400,
                                    fontSize: '0.95rem',
                                    color: active ? 'white' : 'rgba(255,255,255,0.8)'
                                }}
                            />
                            {active && (
                                <Box
                                    component={motion.div}
                                    layoutId="activeIndicator"
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: '#fbbf24',
                                        ml: 'auto'
                                    }}
                                />
                            )}
                        </Box>
                    </ListItem>
                );
            })}
        </List>

        <Box sx={{ p: 2 }}>
            <Box
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: '12px 16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    color: '#ff5252',
                    backgroundColor: 'rgba(255, 82, 82, 0.1)',
                    border: '1px solid rgba(255, 82, 82, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 82, 82, 0.2)',
                    }
                }}
            >
                <ListItemIcon sx={{ color: '#ff5252', minWidth: 45 }}>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ fontWeight: 600 }}
                />
            </Box>
        </Box>

        <Box sx={{ p: 3, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ color: 'white', display: 'block', textAlign: 'center' }}>
                © 2026 Eduflex v2.0
            </Typography>
        </Box>
    </Box >
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'var(--background-color)' }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    color: 'text.primary',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' }, color: 'var(--primary-color)' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px', px: 2, py: 0.5 }}>
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                            <InputBase placeholder="Search..." sx={{ fontSize: '0.9rem' }} />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <NotificationsOutlined />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <SettingsOutlined />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1, p: 0.5, pr: 1.5, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary-color)', fontSize: '0.9rem' }}>A</Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>Admin User</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>Administrator</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'var(--sidebar-bg)',
                            border: 'none',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'var(--sidebar-bg)',
                            border: 'none',
                            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    overflowX: 'hidden'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Outlet />
                </motion.div>
            </Box>
        </Box>
    );
}
