import { createTheme, alpha } from '@mui/material/styles';

// MODERN EDUCATIONAL THEME - 2026 Professional Style
const theme = createTheme({
    palette: {
        mode: 'dark', // Keeping dark mode but making it "Professional Dark"
        primary: {
            main: '#3b82f6', // Royal Blue - Trust & Intelligence
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f59e0b', // Warm Amber/Gold - Achievement
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#000000',
        },
        background: {
            default: '#0f172a', // Slate 900 - Professional Dark Navy
            paper: '#1e293b',   // Slate 800
        },
        text: {
            primary: '#f8fafc', // Slate 50
            secondary: '#cbd5e1', // Slate 300
        },
        error: {
            main: '#ef4444', // Red 500
        },
        warning: {
            main: '#f59e0b', // Amber 500
        },
        success: {
            main: '#10b981', // Emerald 500
        },
        info: {
            main: '#0ea5e9', // Sky 500
        },
        divider: 'rgba(148, 163, 184, 0.1)', // Slate 400 with opacity
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif", // Outfit is great for modern education
        h1: { fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#f8fafc' },
        h3: { fontWeight: 700, color: '#f1f5f9' },
        h4: { fontWeight: 600, color: '#f1f5f9' },
        h5: { fontWeight: 600, color: '#f1f5f9' },
        h6: { fontWeight: 600, color: '#f1f5f9' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        body1: { lineHeight: 1.7 },
        body2: { lineHeight: 1.6 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#475569 #1e293b",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '8px',
                        height: '8px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#475569", // Slate 600
                        minHeight: 24,
                        border: "3px solid transparent",
                        backgroundClip: "content-box",
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#64748b", // Slate 500
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "#64748b",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#64748b",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "transparent",
                    },
                    background: '#0f172a', // Fallback
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '10px', // Slightly less rounded for professional look
                    transition: 'all 0.2s ease-in-out',
                    textTransform: 'none',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                    color: '#fff',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)', // Slate 400
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                },
                head: {
                    fontWeight: 700,
                    color: '#bae6fd', // Sky 200
                    background: 'rgba(15, 23, 42, 0.9)', // Slate 900
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.3)',
                        '& fieldset': {
                            borderColor: 'rgba(148, 163, 184, 0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(148, 163, 184, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6', // Primary Main
                        },
                    },
                },
            }
        }
    },
});

export default theme;
