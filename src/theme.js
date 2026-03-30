import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

// MODERN EDUCATIONAL THEME - 2026 Professional Style
// Dual Light/Dark Mode with Massive UI Updates & Smooth Animations

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // LIGHT MODE
                primary: {
                    main: '#0ea5e9',
                    light: '#38bdf8',
                    dark: '#0284c7',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#8b5cf6',
                    light: '#a78bfa',
                    dark: '#7c3aed',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f8fafc', // Ultra-light Slate
                    paper: 'rgba(255, 255, 255, 0.8)', // Frosted glass light
                },
                text: {
                    primary: '#0f172a', // Slate 900
                    secondary: '#475569', // Slate 600
                },
                error: { main: '#e11d48' },
                success: { main: '#10b981' },
                warning: { main: '#f59e0b' },
                info: { main: '#3b82f6' },
                divider: 'rgba(15, 23, 42, 0.08)',
            }
            : {
                // DARK MODE
                primary: {
                    main: '#0ea5e9',
                    light: '#38bdf8',
                    dark: '#0284c7',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#8b5cf6',
                    light: '#a78bfa',
                    dark: '#7c3aed',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#020617', // Deeper black/navy
                    paper: 'rgba(15, 23, 42, 0.6)',   // Slate 900 Glass
                },
                text: {
                    primary: '#f8fafc', // Slate 50
                    secondary: '#94a3b8', // Slate 400
                },
                error: { main: '#f43f5e' },
                success: { main: '#10b981' },
                warning: { main: '#f59e0b' },
                info: { main: '#3b82f6' },
                divider: 'rgba(248, 250, 252, 0.08)',
            }),
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 900, letterSpacing: '-0.04em' },
        h2: { fontWeight: 800, letterSpacing: '-0.03em' },
        h3: { fontWeight: 800, letterSpacing: '-0.02em' },
        h4: { fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600, letterSpacing: '0.01em' },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.03em' },
        body1: { lineHeight: 1.8, fontSize: '1rem', letterSpacing: '0.01em' },
        body2: { lineHeight: 1.7, fontSize: '0.875rem' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'dark' ? "#1e293b #020617" : "#cbd5e1 #f8fafc",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '8px',
                        height: '8px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 10,
                        backgroundColor: mode === 'dark' ? "#334155" : "#94a3b8",
                        border: `2px solid ${mode === 'dark' ? '#020617' : '#f8fafc'}`,
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: mode === 'dark' ? "#475569" : "#64748b",
                    },
                    transition: 'background-color 0.5s ease-in-out, color 0.5s ease-in-out',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    padding: '10px 24px',
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    backgroundSize: '200% auto',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    },
                    '&:hover': {
                        transform: 'translateY(-4px) scale(1.03)',
                        boxShadow: mode === 'dark' 
                            ? '0 20px 30px -8px rgba(0, 0, 0, 0.8)' 
                            : '0 20px 30px -8px rgba(15, 23, 42, 0.2)',
                        '&::after': {
                            transform: 'translateX(100%)',
                        }
                    },
                    '&:active': {
                        transform: 'translateY(-1px) scale(0.97)',
                        transition: 'all 0.1s ease',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: mode === 'dark' 
                        ? '0 8px 25px rgba(14, 165, 233, 0.5)'
                        : '0 8px 20px rgba(14, 165, 233, 0.4)',
                    color: '#fff',
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: mode === 'dark' 
                            ? '0 15px 35px rgba(14, 165, 233, 0.7)'
                            : '0 12px 28px rgba(14, 165, 233, 0.5)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #7c3aed 100%)',
                    backgroundSize: '200% auto',
                    color: '#fff',
                    boxShadow: mode === 'dark' 
                        ? '0 8px 25px rgba(139, 92, 246, 0.5)'
                        : '0 8px 20px rgba(139, 92, 246, 0.4)',
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: mode === 'dark' 
                            ? '0 15px 35px rgba(139, 92, 246, 0.7)'
                            : '0 12px 28px rgba(139, 92, 246, 0.5)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(15, 23, 42, 0.05)',
                    borderRadius: '24px',
                    boxShadow: mode === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: 'translateZ(0)',
                    '&:hover': {
                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)',
                        boxShadow: mode === 'dark' ? '0 30px 60px rgba(14, 165, 233, 0.15)' : '0 30px 60px rgba(14, 165, 233, 0.1)',
                        transform: 'translateY(-6px) scale(1.02) perspective(1000px) rotateX(2deg)',
                    }
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                    transition: 'background 0.4s ease, box-shadow 0.4s ease',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: mode === 'dark' ? '1px solid rgba(248, 250, 252, 0.08)' : '1px solid rgba(15, 23, 42, 0.06)',
                    padding: '20px 24px',
                    transition: 'all 0.3s ease',
                },
                head: {
                    fontWeight: 700,
                    color: mode === 'dark' ? '#94a3b8' : '#475569',
                    background: mode === 'dark' ? 'rgba(2, 6, 23, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: mode === 'dark' ? '#0f172a' : '#ffffff',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.05)',
                    borderRadius: '32px',
                    boxShadow: mode === 'dark' ? '0 50px 100px -20px rgba(0, 0, 0, 0.6)' : '0 50px 100px -20px rgba(15, 23, 42, 0.2)',
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(20px)',
                    backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '18px',
                        backgroundColor: mode === 'dark' ? 'rgba(2, 6, 23, 0.4)' : 'rgba(241, 245, 249, 0.6)',
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                        '& fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'dark' ? 'rgba(2, 6, 23, 0.6)' : 'rgba(241, 245, 249, 0.9)',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.2)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: mode === 'dark' ? 'rgba(2, 6, 23, 0.8)' : '#ffffff',
                            boxShadow: `0 0 0 4px ${mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)'}`,
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
                        transform: 'scale(1.08) translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    },
});
