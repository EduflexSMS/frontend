import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import ViewStudents from './pages/ViewStudents';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// Placeholder components for other routes
import AddStudent from './pages/AddStudent';
import ClassReport from './pages/ClassReport';
import AddSubject from './pages/AddSubject';
import Dashboard from './pages/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

function App() {
  const [mode, setMode] = React.useState('light');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark', // FORCE DARK MODE for optimal Enterprise V4 look
          primary: {
            main: '#3b82f6', // Electric Blue (Professional Tech)
            light: '#60a5fa',
            dark: '#2563eb',
          },
          secondary: {
            main: '#06b6d4', // Cyan/Teal (Accents)
            light: '#22d3ee',
            dark: '#0891b2',
          },
          background: {
            default: '#000000', // Void Black (OLED)
            paper: '#050505',   // Deepest Grey
          },
          text: {
            primary: '#ffffff', // Pure White
            secondary: '#94a3b8', // Slate 400
          },
          action: {
            active: '#94a3b8',
            hover: 'rgba(59, 130, 246, 0.08)',
            selected: 'rgba(59, 130, 246, 0.16)',
          },
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          h1: { fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' },
          h2: { fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' },
          h3: { fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' },
          h4: { fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' },
          h5: { fontWeight: 600, letterSpacing: '-0.015em', color: '#f1f5f9' },
          h6: { fontWeight: 600, letterSpacing: '-0.01em', color: '#f1f5f9' },
          button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
          body1: { letterSpacing: '0.01em', color: '#e2e8f0' },
          body2: { letterSpacing: '0.01em', color: '#94a3b8' },
        },
        shape: {
          borderRadius: 12, // Sharper, professional corners (down from 16/24)
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: "#334155 #000000",
                "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                  backgroundColor: "#000000",
                  width: '8px',
                },
                "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                  borderRadius: 8,
                  backgroundColor: "#334155", // Slate 700
                  minHeight: 24,
                  border: "2px solid #000000",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: 'rgba(5, 5, 5, 0.7)', // Semi-transparent Void
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)', // Thin crisp border
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8, // Sharp buttons
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
              contained: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.5)',
                },
              },
              outlined: {
                borderColor: 'rgba(59, 130, 246, 0.5)',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6, // Very sharp chips
                fontWeight: 600,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.4)', // Tech Blue border on hover
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(59, 130, 246, 0.2)', // Glow
                  transform: 'translateY(-2px)',
                }
              },
            },
          },
        },
      }),
    [mode]
  );


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                {/* Admin Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="students" element={<ViewStudents />} />
                  <Route path="add-student" element={<AddStudent />} />
                  <Route path="add-subject" element={<AddSubject />} />
                  <Route path="reports" element={<ClassReport />} />
                </Route>

                {/* Student Route - Assuming they might share Layout or have none. 
                    If they need sidebar, keep in Layout. If not, separate. 
                    For now, putting them separate but protected. */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
