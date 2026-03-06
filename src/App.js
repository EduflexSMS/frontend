import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';
import getDesignTokens from './theme';
import Layout from './components/Layout';
import ViewStudents from './pages/ViewStudents';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AddStudent from './pages/AddStudent';
import ClassReport from './pages/ClassReport';
import AddSubject from './pages/AddSubject';
import Dashboard from './pages/Dashboard';
import PageTransition from './components/PageTransition';
import QRScanner from './pages/QRScanner';

export const ColorModeContext = createContext({ toggleColorMode: () => { }, mode: 'dark' });

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
        <div style={{ padding: 20, color: 'inherit' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PageTransition>
          <LoginPage />
        </PageTransition>
      } />

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

        {/* Role-Based Dashboards */}
        <Route path="/student-dashboard" element={
          <PageTransition>
            <StudentDashboard />
          </PageTransition>
        } />
        <Route path="/teacher-dashboard" element={
          <PageTransition>
            <TeacherDashboard />
          </PageTransition>
        } />
        <Route path="/qr-scanner" element={
          <PageTransition>
            <QRScanner />
          </PageTransition>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Animated Aurora Background Layers */}
        <div style={{
          position: 'fixed', top: '-50%', left: '-20%', width: '80%', height: '80%',
          background: 'radial-gradient(circle, var(--aurora-cyan) 0%, transparent 60%)',
          opacity: mode === 'light' ? 0.3 : 0.15, filter: 'blur(100px)', zIndex: -1,
          animation: 'aurora-shift 25s infinite ease-in-out alternate'
        }} />
        <div style={{
          position: 'fixed', bottom: '-40%', right: '-10%', width: '70%', height: '70%',
          background: 'radial-gradient(circle, var(--aurora-magenta) 0%, transparent 50%)',
          opacity: mode === 'light' ? 0.2 : 0.15, filter: 'blur(120px)', zIndex: -1,
          animation: 'aurora-shift 20s infinite ease-in-out alternate-reverse'
        }} />
        <ErrorBoundary>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
