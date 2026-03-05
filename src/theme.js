import { alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // LIGHT MODE - Clean, crisp white & slate with vibrant brand accents
                primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#ffffff' },
                secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', contrastText: '#ffffff' },
                background: { default: '#f8fafc', paper: '#ffffff' },
                text: { primary: '#0f172a', secondary: '#64748b' },
                divider: 'rgba(15, 23, 42, 0.06)',
            }
            : {
                // DARK MODE - Deep sophisticated slate night (not muddy blue)
                primary: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', contrastText: '#ffffff' },
                secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', contrastText: '#ffffff' },
                background: { default: '#0b0f19', paper: '#111827' },
                text: { primary: '#f8fafc', secondary: '#94a3b8' },
                divider: 'rgba(248, 250, 252, 0.06)',
            }),
        error: { main: '#ef4444', light: '#f87171' },
        success: { main: '#10b981', light: '#34d399' },
        warning: { main: '#f59e0b', light: '#fbbf24' },
        info: { main: '#06b6d4', light: '#22d3ee' },
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 800, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, letterSpacing: '-0.015em' },
        h4: { fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
        body1: { lineHeight: 1.7, fontSize: '1rem' },
        body2: { lineHeight: 1.6, fontSize: '0.875rem' },
    },
    shape: {
        borderRadius: 16
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'light' ? "#cbd5e1 transparent" : "#334155 transparent",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '8px',
                        height: '8px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: mode === 'light' ? "#cbd5e1" : "#334155",
                        minHeight: 24,
                        border: '2px solid transparent',
                        backgroundClip: 'content-box'
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: mode === 'light' ? "#94a3b8" : "#475569",
                    },
                    background: mode === 'light' ? '#f8fafc' : '#0b0f19',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    padding: '8px 24px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(1px)',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        boxShadow: '0 8px 25px -5px rgba(59, 130, 246, 0.4)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                        boxShadow: '0 8px 25px -5px rgba(139, 92, 246, 0.4)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode === 'light' ? '#ffffff' : '#111827',
                    border: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
                    borderRadius: '24px',
                    boxShadow: mode === 'light' ? '0 12px 32px -8px rgba(15, 23, 42, 0.04)' : '0 12px 32px -8px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: mode === 'light' ? '#ffffff' : '#111827',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
                    padding: '16px 24px',
                },
                head: {
                    fontWeight: 700,
                    color: mode === 'light' ? '#64748b' : '#94a3b8',
                    background: mode === 'light' ? '#f8fafc' : '#0b0f19',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: mode === 'light' ? '#ffffff' : '#111827',
                    border: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '24px',
                    boxShadow: mode === 'light' ? '0 25px 50px -12px rgba(15, 23, 42, 0.1)' : '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: mode === 'light' ? '#f8fafc' : '#0b0f19',
                        transition: 'all 0.2s ease',
                        '& fieldset': {
                            borderColor: mode === 'light' ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            borderWidth: '1px',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'light' ? '#f1f5f9' : '#1e293b',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'light' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
                            boxShadow: mode === 'light' ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 4px 12px rgba(59, 130, 246, 0.15)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
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
                    borderRadius: '8px',
                    fontWeight: 600,
                }
            }
        }
    },
});

export default getDesignTokens;
