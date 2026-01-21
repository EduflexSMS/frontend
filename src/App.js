import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import ViewStudents from './pages/ViewStudents';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';


// Placeholder components for other routes
import AddStudent from './pages/AddStudent';

import ClassReport from './pages/ClassReport';
import AddSubject from './pages/AddSubject';

import Dashboard from './pages/Dashboard';

// const Dashboard = () => <Box p={3}><Typography variant="h4">Dashboard (Coming Soon)</Typography></Box>;
// const AddStudent = () => <Box p={3}><Typography variant="h4">Add Student Form (Coming Soon)</Typography></Box>;
// const AddSubject = () => <Box p={3}><Typography variant="h4">Add Subject Form (Coming Soon)</Typography></Box>;




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

// Imports moved to top

// ... (ErrorBoundary remains same)

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
            main: '#2563eb', // Royal Blue
            light: '#60a5fa',
            dark: '#1e40af',
          },
          secondary: {
            main: '#3b82f6',
            light: '#93c5fd',
            dark: '#2563eb',
          },
          ...(mode === 'dark'
            ? {
              background: {
                default: '#0f172a', // Slate 900
                paper: '#1e293b',   // Slate 800
              },
              text: {
                primary: '#f1f5f9',
                secondary: '#94a3b8',
              },
            }
            : {
              background: {
                default: '#f0f2f5', // Slate 50
                paper: '#ffffff',
              },
              text: {
                primary: '#1e293b',
                secondary: '#64748b',
              },
            }),
        },
        typography: {
          fontFamily: "'Poppins', sans-serif",
          h1: { fontWeight: 800 },
          h2: { fontWeight: 800 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none', // Reset default dark mode overlay
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
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="students" element={<ViewStudents />} />
                  <Route path="add-student" element={<AddStudent />} />
                  <Route path="add-subject" element={<AddSubject />} />
                  <Route path="reports" element={<ClassReport />} />
                </Route>
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
