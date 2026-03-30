import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

// MODERN EDUCATIONAL THEME - 2026 Professional Style
// "Butter Smooth" & "Color Accurate" Redesign

let theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#0ea5e9', // Cyber/Electric Blue
            light: '#38bdf8',
            dark: '#0284c7',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#8b5cf6', // Violet/Indigo
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
        },
        background: {
            default: '#020617', // Deeper black/navy
            paper: '#0f172a',   // Slate 900
        },
        text: {
            primary: '#f8fafc', // Slate 50
            secondary: '#94a3b8', // Slate 400
        },
        error: {
            main: '#f43f5e',
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
        divider: 'rgba(148, 163, 184, 0.1)',
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 900, letterSpacing: '-0.04em', color: '#f8fafc' },
        h2: { fontWeight: 800, letterSpacing: '-0.03em', color: '#f8fafc' },
        h3: { fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' },
        h4: { fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' },
        h5: { fontWeight: 700, color: '#f1f5f9' },
        h6: { fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.01em' },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.03em' },
        body1: { lineHeight: 1.8, fontSize: '1rem', letterSpacing: '0.01em' },
        body2: { lineHeight: 1.7, fontSize: '0.875rem' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#1e293b #020617",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '8px', 
                        height: '8px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 10,
                        backgroundColor: "#334155",
                        border: '2px solid #020617',
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#475569",
                    },
                    background: '#020617',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    padding: '10px 24px',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.5)',
                    },
                    '&:active': {
                        transform: 'translateY(-1px)',
                    }
                },
                containedPrimary: {
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)',
            '&:hover': {
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                boxShadow: '0 10px 30px -5px rgba(14, 165, 233, 0.6)',
            }
        },
        containedSecondary: {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
            '&:hover': {
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.6)',
            }
        }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(15, 23, 42, 0.45)', // More transparent for better glass
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)', // For Safari
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
                        transform: 'translateY(-4px)',
                    }
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    padding: '20px 24px',
                },
                head: {
                    fontWeight: 700,
                    color: '#64748b',
                    background: 'rgba(2, 6, 23, 0.8)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '32px',
                    boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.6)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '18px',
                        backgroundColor: 'rgba(2, 6, 23, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(2, 6, 23, 0.6)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(2, 6, 23, 0.8)',
                            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '2px',
                        },
                    },
                },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.05)',
                    }
                }
            }
        }
    },
});

theme = responsiveFontSizes(theme);

export default theme;
