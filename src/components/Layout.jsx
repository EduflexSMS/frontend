import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton } from '@mui/material';
import { Dashboard, People, Class, AddBox, Assessment } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                {/* Optional Logo or just spacing */}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: 1 }}>
                    EDUFLEX
                </Typography>
            </Toolbar>
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }}
                        selected={location.pathname === item.path}
                        sx={{
                            borderRadius: '12px',
                            mb: 1,
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
                                '& .MuiListItemIcon-root': { color: '#ffd700' },
                                '& .MuiTypography-root': { fontWeight: 600, color: 'white' },
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                transform: 'translateX(5px)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 45 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.95rem' }} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: 'var(--background-color)', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0px 2px 20px rgba(0,0,0,0.05)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: '#1565c0' }}>
                        Tuition Management System
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* Mobile Drawer (Temporary) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)',
                            color: 'white',
                            border: 'none'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop Drawer (Permanent) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
