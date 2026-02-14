import { createTheme, alpha } from '@mui/material/styles';

// MODERN EDUCATIONAL THEME - 2026 Professional Style
// "Butter Smooth" & "Color Accurate" Redesign

const theme = createTheme({
    palette: {
        mode: 'dark', // Deep Professional Dark
        primary: {
            main: '#0f52ba', // Sapphire Blue / Royal Blue - Trust, Intelligence, Authority
            light: '#4c82ef',
            dark: '#002b8a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffd700', // Gold - Achievement, Excellence, Value
            light: '#ffe44d',
            dark: '#c7a500',
            contrastText: '#000000',
        },
        background: {
            default: '#0b1121', // Deep Navy/Black (Rich depth)
            paper: '#151e32',   // Slightly lighter navy for cards
        },
        text: {
            primary: '#e2e8f0', // Slate 200 - Soft White
            secondary: '#94a3b8', // Slate 400 - Muted
        },
        error: {
            main: '#ef4444',
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        info: {
            main: '#3b82f6',
        },
        divider: 'rgba(148, 163, 184, 0.08)',
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 800, letterSpacing: '-0.025em', color: '#f8fafc' },
        h2: { fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' },
        h3: { fontWeight: 700, letterSpacing: '-0.015em', color: '#f1f5f9' },
        h4: { fontWeight: 600, color: '#f1f5f9' },
        h5: { fontWeight: 600, color: '#f1f5f9' },
        h6: { fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.01em' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
        body1: { lineHeight: 1.7, fontSize: '1rem' },
        body2: { lineHeight: 1.6, fontSize: '0.875rem' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#334155 #0f172a",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '6px', // Sleeker scrollbar
                        height: '6px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#334155",
                        minHeight: 24,
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#475569",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#475569",
                    },
                    background: '#0b1121',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    padding: '8px 20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.4)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #0f52ba 0%, #0a3d91 100%)', // Royal Blue Gradient
                    boxShadow: '0 4px 10px rgba(15, 82, 186, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1663d6 0%, #0f52ba 100%)',
                        boxShadow: '0 10px 25px -5px rgba(15, 82, 186, 0.5)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)', // Gold Gradient
                    color: '#0f172a', // Dark text on gold
                    boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #ffdf33 0%, #ffd700 100%)',
                        boxShadow: '0 10px 25px -5px rgba(255, 215, 0, 0.5)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(21, 30, 50, 0.65)', // Glassy Navy
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px', // Modern curvature
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.3)',
                    }
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default MUI gradients
                    background: 'rgba(21, 30, 50, 0.65)',
                    backdropFilter: 'blur(20px)',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                    padding: '16px 24px',
                },
                head: {
                    fontWeight: 700,
                    color: '#94a3b8',
                    background: 'rgba(11, 17, 33, 0.8)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: '#151e32',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '28px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: 'rgba(11, 17, 33, 0.4)',
                        transition: 'all 0.2s ease',
                        '& fieldset': {
                            borderColor: 'rgba(148, 163, 184, 0.1)',
                            borderWidth: '1.5px',
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(11, 17, 33, 0.6)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(148, 163, 184, 0.3)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(11, 17, 33, 0.8)',
                            transform: 'scale(1.01)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#0f52ba',
                        },
                        '& input': {
                            paddingLeft: '16px',
                        }
                    },
                },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    fontWeight: 600,
                }
            }
        }
    },
});

export default theme;
