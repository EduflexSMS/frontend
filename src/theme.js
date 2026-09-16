// ─── EDUFLEX 2026 FLUID NEO-GLASS THEME ──────────────────────────────────────
// Butter-smooth 120fps physics, multi-layer glass depth & vibrant color system

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // LIGHT MODE - Crisp Neo-Glass Luminous
                primary: {
                    main: '#4f46e5', // Vibrant Indigo
                    light: '#6366f1',
                    dark: '#4338ca',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#7c3aed', // Luminous Violet
                    light: '#8b5cf6',
                    dark: '#6d28d9',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f8fafc', // Ultra-light Slate
                    paper: 'rgba(255, 255, 255, 0.88)', // Frosted glass light
                },
                text: {
                    primary: '#0f172a', // Slate 900
                    secondary: '#475569', // Slate 600
                },
                error: { main: '#f43f5e' },
                success: { main: '#10b981' },
                warning: { main: '#f59e0b' },
                info: { main: '#06b6d4' },
                divider: 'rgba(15, 23, 42, 0.08)',
            }
            : {
                // DARK MODE - Cosmic Obsidian & Luminous Accents
                primary: {
                    main: '#6366f1', // Luminous Cyber Indigo
                    light: '#818cf8',
                    dark: '#4f46e5',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#8b5cf6', // Cyber Violet
                    light: '#a78bfa',
                    dark: '#7c3aed',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#030712', // Deep Void Obsidian
                    paper: 'rgba(15, 23, 42, 0.72)', // Frosted Slate Glass
                },
                text: {
                    primary: '#f8fafc', // Slate 50
                    secondary: '#94a3b8', // Slate 400
                },
                error: { main: '#f43f5e' },
                success: { main: '#10b981' },
                warning: { main: '#f59e0b' },
                info: { main: '#06b6d4' },
                divider: 'rgba(248, 250, 252, 0.09)',
            }),
    },
    typography: {
        fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        h1: { fontWeight: 900, letterSpacing: '-0.04em' },
        h2: { fontWeight: 800, letterSpacing: '-0.03em' },
        h3: { fontWeight: 800, letterSpacing: '-0.025em' },
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.015em' },
        h6: { fontWeight: 700, letterSpacing: '-0.01em' },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '-0.01em' },
        body1: { lineHeight: 1.7, fontSize: '0.975rem' },
        body2: { lineHeight: 1.65, fontSize: '0.875rem' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'dark' ? "rgba(99, 102, 241, 0.3) transparent" : "rgba(99, 102, 241, 0.25) transparent",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '6px',
                        height: '6px',
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 99,
                        backgroundColor: mode === 'dark' ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.25)",
                        transition: 'background-color 0.2s ease',
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: mode === 'dark' ? "rgba(99, 102, 241, 0.6)" : "rgba(99, 102, 241, 0.5)",
                    },
                    transition: 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '14px',
                    padding: '9px 20px',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-2px) scale(1.01)',
                        boxShadow: mode === 'dark' 
                            ? '0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.3)' 
                            : '0 12px 24px -6px rgba(79, 70, 229, 0.25)',
                    },
                    '&:active': {
                        transform: 'translateY(0) scale(0.97)',
                        transition: 'all 0.08s ease',
                    }
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                    boxShadow: mode === 'dark' 
                        ? '0 6px 20px -2px rgba(99, 102, 241, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)' 
                        : '0 6px 18px -2px rgba(79, 70, 229, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
                        boxShadow: mode === 'dark' 
                            ? '0 10px 28px -2px rgba(99, 102, 241, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.35)' 
                            : '0 10px 26px -2px rgba(79, 70, 229, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
                    }
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                    color: '#fff',
                    boxShadow: mode === 'dark' 
                        ? '0 6px 20px -2px rgba(139, 92, 246, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)' 
                        : '0 6px 18px -2px rgba(124, 58, 237, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
                        boxShadow: mode === 'dark' 
                            ? '0 10px 28px -2px rgba(139, 92, 246, 0.55)' 
                            : '0 10px 26px -2px rgba(124, 58, 237, 0.45)',
                    }
                },
                outlined: {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        borderColor: mode === 'dark' ? '#6366f1' : '#4f46e5',
                        background: mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.08)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode === 'dark' 
                        ? 'rgba(15, 23, 42, 0.72)' 
                        : 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: mode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '20px',
                    boxShadow: mode === 'dark' 
                        ? '0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)' 
                        : '0 10px 30px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
                    transition: 'border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                        borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.35)',
                        boxShadow: mode === 'dark' 
                            ? '0 24px 48px -10px rgba(0, 0, 0, 0.7), 0 0 24px rgba(99, 102, 241, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' 
                            : '0 18px 36px -8px rgba(79, 70, 229, 0.15), inset 0 1px 0 0 #ffffff',
                        transform: 'translateY(-3px)',
                    }
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: mode === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '20px',
                    transition: 'background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: mode === 'dark' ? '1px solid rgba(248, 250, 252, 0.07)' : '1px solid rgba(15, 23, 42, 0.06)',
                    padding: '16px 20px',
                    transition: 'all 0.18s ease',
                },
                head: {
                    fontWeight: 800,
                    color: mode === 'dark' ? '#94a3b8' : '#64748b',
                    background: mode === 'dark' ? 'rgba(11, 15, 28, 0.85)' : 'rgba(241, 245, 249, 0.85)',
                    backdropFilter: 'blur(12px)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: mode === 'dark' ? 'rgba(11, 15, 28, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(15, 23, 42, 0.1)',
                    borderRadius: '24px',
                    boxShadow: mode === 'dark' 
                        ? '0 32px 72px -16px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' 
                        : '0 28px 60px -15px rgba(15, 23, 42, 0.22), inset 0 1px 0 0 #ffffff',
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'dark' ? 'rgba(3, 7, 18, 0.75)' : 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transition: 'opacity 0.25s ease',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        backgroundColor: mode === 'dark' ? 'rgba(3, 7, 18, 0.55)' : 'rgba(241, 245, 249, 0.7)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        '& fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'dark' ? 'rgba(3, 7, 18, 0.75)' : 'rgba(241, 245, 249, 0.95)',
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.35)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: mode === 'dark' ? 'rgba(3, 7, 18, 0.9)' : '#ffffff',
                            boxShadow: mode === 'dark' 
                                ? '0 0 0 4px rgba(99, 102, 241, 0.25)' 
                                : '0 0 0 4px rgba(79, 70, 229, 0.18)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px',
                        },
                    },
                },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px) scale(1.04)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                    }
                }
            }
        }
    },
});
