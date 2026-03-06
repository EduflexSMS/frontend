import { alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // LIGHT MODE - Clean, icy glass
                primary: { main: '#00d2ff', light: '#3a7bd5', dark: '#0082c8', contrastText: '#ffffff' },
                secondary: { main: '#fe0979', light: '#ff6a00', dark: '#d50057', contrastText: '#ffffff' },
                background: { default: '#f0f2f5', paper: 'rgba(255, 255, 255, 0.7)' },
                text: { primary: '#0f172a', secondary: '#64748b' },
                divider: 'rgba(0, 0, 0, 0.05)',
            }
            : {
                // DARK MODE - Deep obsidian with neon
                primary: { main: '#00f2fe', light: '#4facfe', dark: '#00c6ff', contrastText: '#000000' },
                secondary: { main: '#fe0979', light: '#ff4b2b', dark: '#c21500', contrastText: '#ffffff' },
                background: { default: '#050505', paper: 'rgba(15, 15, 15, 0.6)' },
                text: { primary: '#ffffff', secondary: '#94a3b8' },
                divider: 'rgba(255, 255, 255, 0.08)',
            }),
        error: { main: '#ff0f7b', light: '#f89b29' },
        success: { main: '#00ff87', light: '#60efff' },
        warning: { main: '#fceabb', light: '#f8b500' },
        info: { main: '#8e2de2', light: '#4a00e0' },
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
        borderRadius: 24
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
                    borderRadius: '16px',
                    padding: '10px 28px',
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                    },
                    '&:active': {
                        transform: 'translateY(1px) scale(0.98)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                    color: '#000000',
                    boxShadow: '0 8px 25px -5px rgba(0, 242, 254, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        boxShadow: '0 12px 30px -5px rgba(0, 242, 254, 0.6)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #fe0979 0%, #ff6a00 100%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 25px -5px rgba(254, 9, 121, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #ff6a00 0%, #fe0979 100%)',
                        boxShadow: '0 12px 30px -5px rgba(254, 9, 121, 0.6)',
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
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.5)',
                    border: `1px solid ${mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '28px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: mode === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.6)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    border: `1px solid ${mode === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)'}`,
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
                    background: mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(15,15,15,0.85)',
                    border: `1px solid ${mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '32px',
                    backdropFilter: 'blur(40px)',
                    boxShadow: mode === 'light' ? '0 30px 60px rgba(0,0,0,0.1)' : '0 30px 60px rgba(0,0,0,0.8)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                            borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(0,0,0,0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#00f2fe',
                            borderWidth: '2px',
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
                    fontWeight: 700,
                    border: 'none',
                    backdropFilter: 'blur(10px)'
                }
            }
        }
    },
});

export default getDesignTokens;
