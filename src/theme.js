import { alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // LIGHT MODE - Clean, icy glass
                primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#ffffff' },
                secondary: { main: '#f43f5e', light: '#fb7185', dark: '#e11d48', contrastText: '#ffffff' },
                background: { default: '#f4f6f8', paper: 'rgba(255, 255, 255, 0.8)' },
                text: { primary: '#1e293b', secondary: '#64748b' },
                divider: 'rgba(0, 0, 0, 0.08)',
            }
            : {
                // DARK MODE - Deep obsidian with neon
                primary: { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', contrastText: '#0f172a' },
                secondary: { main: '#fb7185', light: '#fda4af', dark: '#e11d48', contrastText: '#ffffff' },
                background: { default: '#0f172a', paper: 'rgba(30, 41, 59, 0.7)' },
                text: { primary: '#f8fafc', secondary: '#94a3b8' },
                divider: 'rgba(255, 255, 255, 0.1)',
            }),
        error: { main: '#ef4444', light: '#f87171' },
        success: { main: '#10b981', light: '#34d399' },
        warning: { main: '#f59e0b', light: '#fbbf24' },
        info: { main: '#3b82f6', light: '#60a5fa' },
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 900, letterSpacing: '-0.04em' },
        h2: { fontWeight: 800, letterSpacing: '-0.03em' },
        h3: { fontWeight: 800, letterSpacing: '-0.02em' },
        h4: { fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
        body1: { lineHeight: 1.7, fontSize: '1.05rem' },
        body2: { lineHeight: 1.6, fontSize: '0.9rem' },
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: mode === 'light' ? '#f0f2f5' : '#050505',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '8px 24px',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(1px)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.23)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.39)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)',
                        boxShadow: '0 6px 20px rgba(244, 63, 94, 0.23)',
                    }
                },
                outlinedPrimary: {
                    border: '2px solid rgba(0, 242, 254, 0.5)',
                    color: mode === 'light' ? '#0082c8' : '#00f2fe',
                    '&:hover': {
                        border: '2px solid rgba(0, 242, 254, 1)',
                        background: 'rgba(0, 242, 254, 0.1)'
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.7)',
                    border: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' : 'none',
                    transition: 'all 0.2s ease-in-out',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '12px',
                    border: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.05)'}`,
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'}`,
                    padding: '18px 24px',
                },
                head: {
                    fontWeight: 800,
                    color: mode === 'light' ? '#475569' : '#cbd5e1',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30, 41, 59, 0.95)',
                    border: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '16px',
                    backdropFilter: 'blur(40px)',
                    boxShadow: mode === 'light' ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(30, 41, 59, 0.5)',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                            borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(30, 41, 59, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '2px',
                        },
                        '& input': {
                            paddingLeft: '14px',
                        }
                    },
                },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '6px',
                    fontWeight: 600,
                    border: 'none',
                    backdropFilter: 'blur(10px)'
                }
            }
        }
    },
});

export default getDesignTokens;
