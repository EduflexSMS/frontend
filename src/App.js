import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import theme from './theme'; // Import the Void Glass Theme
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
