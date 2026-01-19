import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  console.log("🔥 APP VERSION 3.0 - AUTH ENABLED 🔥");
  return (
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
  );
}

export default App;
