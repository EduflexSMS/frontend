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
          mode,
          primary: {
            main: '#4f46e5', // Indigo 600
            light: '#818cf8',
            dark: '#3730a3',
          },
          secondary: {
            main: '#ec4899', // Pink 500
            light: '#f472b6',
            dark: '#db2777',
          },
          background: mode === 'dark'
            ? {
              default: '#030712', // Gray 950 (Rich Black)
              paper: '#111827',   // Gray 900
            }
            : {
              default: '#f8fafc', // Slate 50
              paper: '#ffffff',
            },
          text: mode === 'dark'
            ? {
              primary: '#f8fafc',
              secondary: '#94a3b8',
            }
            : {
              primary: '#0f172a',
              secondary: '#475569',
            },
        },
        typography: {
          fontFamily: "'Inter', 'Poppins', sans-serif",
          h1: { fontWeight: 800, letterSpacing: '-0.025em' },
          h2: { fontWeight: 800, letterSpacing: '-0.025em' },
          h3: { fontWeight: 700, letterSpacing: '-0.02em' },
          h4: { fontWeight: 700, letterSpacing: '-0.02em' },
          h5: { fontWeight: 600, letterSpacing: '-0.015em' },
          h6: { fontWeight: 600, letterSpacing: '-0.01em' },
          button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                borderRadius: 16,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: 'none',
              },
              contained: {
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: mode === 'light'
                  ? '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)'
                  : '0 10px 20px -5px rgba(0,0,0,0.3)',
                border: mode === 'light' ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(30, 41, 59, 0.5)',
              },
            },
          },
        },
      }),
    [mode],
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
