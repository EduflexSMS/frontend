import { createTheme, alpha } from '@mui/material/styles';

// VOID GLASS THEME - 2026 Future Tech Style
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00f7ff', // Neon Cyan
            light: '#5ce1e6',
            dark: '#00c4cc',
            contrastText: '#000',
        },
        secondary: {
            main: '#d000ff', // Neon Purple
            light: '#ea80fc',
            dark: '#9c00c3',
            contrastText: '#fff',
        },
        background: {
            default: '#050510', // Deep Space Black
            paper: '#12122a',   // Dark detailed background
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
        error: {
            main: '#ff2a2a', // Neon Red
        },
        warning: {
            main: '#ffcc00', // Neon Yellow
        },
        success: {
            main: '#00ff66', // Neon Green
        },
        info: {
            main: '#2979ff',
        },
    },
    typography: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        h1: { fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(0, 247, 255, 0.5)' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em', textShadow: '0 0 15px rgba(208, 0, 255, 0.5)' },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#6b6b6b #2b2b2b",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "transparent",
                        width: '8px',
                        height: '8px'
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#6b6b6b",
                        minHeight: 24,
                        border: "3px solid transparent",
                        backgroundClip: "content-box",
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#959595",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "#2b2b2b",
                    },
                    background: 'radial-gradient(circle at 50% 50%, #12122a 0%, #050510 100%)',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 20px rgba(0, 247, 255, 0.4)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #00f7ff 0%, #0099ff 100%)',
                    boxShadow: '0 4px 15px rgba(0, 247, 255, 0.3)',
                    color: '#000',
                    fontWeight: 800,
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #d000ff 0%, #9c00c3 100%)',
                    boxShadow: '0 4px 15px rgba(208, 0, 255, 0.3)',
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(18, 18, 42, 0.6)', // Glass
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(18, 18, 42, 0.6)',
                    backdropFilter: 'blur(16px)',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                },
                head: {
                    fontWeight: 700,
                    color: '#00f7ff', // Neon Cyan Headers
                    background: 'rgba(5, 5, 16, 0.8)',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: 'rgba(18, 18, 42, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 247, 255, 0.2)',
                    borderRadius: '24px',
                    boxShadow: '0 0 50px rgba(0, 247, 255, 0.1)',
                }
            }
        }
    },
});

export default theme;
