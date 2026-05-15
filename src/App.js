import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeContextProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ViewStudents from './pages/ViewStudents';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AddStudent from './pages/AddStudent';
import ClassReport from './pages/ClassReport';
import DailyReport from './pages/DailyReport';
import AddSubject from './pages/AddSubject';
import Dashboard from './pages/Dashboard';
import PageTransition from './components/PageTransition';
import QRScanner from './pages/QRScanner';
import POS from './pages/POS';
import Exams from './pages/Exams';
import logo from './assets/logo.jpg';

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0a0c', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <img 
          src={logo} 
          alt="EduFlex Logo" 
          style={{ 
            width: 140, height: 140, borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 0 50px rgba(0, 229, 255, 0.3)'
          }} 
        />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          margin: '24px 0 0', fontSize: 36, fontWeight: 900, color: '#f2f1ee',
          fontFamily: "'Outfit', 'DM Sans', sans-serif", letterSpacing: '4px'
        }}
      >
        EDUFLEX
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          color: '#00e5ff', fontSize: 13, letterSpacing: '6px',
          textTransform: 'uppercase', marginTop: 12,
          fontWeight: 700, fontFamily: "'DM Sans', sans-serif"
        }}
      >
        Institute Management System
      </motion.p>
      
      <motion.div 
        style={{
           width: 200, height: 3, background: 'rgba(255,255,255,0.1)',
           borderRadius: 4, marginTop: 40, overflow: 'hidden'
        }}
      >
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
               height: '100%',
               background: 'linear-gradient(90deg, #00e5ff, #6c63ff)'
            }}
         />
      </motion.div>
    </motion.div>
  );
}

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
        <div style={{ padding: 20, color: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location}>
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
          <Route path="exams" element={<Exams />} />
          <Route path="daily-report" element={<DailyReport />} />
          <Route path="pos" element={<POS />} />
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
    </AnimatePresence>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds loading screen
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeContextProvider>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            {loading ? (
              <SplashScreen key="splash" />
            ) : (
              <motion.div key="main-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                <AnimatedRoutes />
              </motion.div>
            )}
          </AnimatePresence>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeContextProvider>
  );
}

export default App;
