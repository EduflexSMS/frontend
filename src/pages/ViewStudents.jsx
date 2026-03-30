import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, TextField, Pagination, Typography, Container,
  CircularProgress, Grid, Card, IconButton,
  InputAdornment, alpha
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  PeopleAlt as PeopleAltIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

/* ---------------- Animations ---------------- */
const fadeContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

/* ---------------- Component ---------------- */
export default function ViewStudents() {
  const theme = useTheme();

  const [viewMode, setViewMode] = useState('grades');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/students/grades`).then(r => setGrades(r.data));
    axios.get(`${API_BASE_URL}/api/subjects`).then(r => setSubjects(r.data));
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE_URL}/api/students`, {
        params: { page, search, grade: selectedGrade, subject: selectedSubject }
      });
      setStudents(r.data.students);
      setTotalPages(r.data.totalPages);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page, search, selectedGrade, selectedSubject]);

  useEffect(() => {
    if (viewMode === 'students') fetchStudents();
  }, [viewMode, fetchStudents]);

  /* ---------------- Handlers ---------------- */
  const handleBack = () => {
    if (viewMode === 'students') {
      if (!selectedGrade) setViewMode('grades');
      else setViewMode('subjects');
    } else if (viewMode === 'subjects') {
      setViewMode('grades');
      setSelectedGrade(null);
    }
  };

  /* ---------------- UI Helpers ---------------- */
  const glassCard = {
    borderRadius: "20px",
    backdropFilter: "blur(14px)",
    background: alpha(theme.palette.background.paper, 0.6),
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer"
  };

  /* ---------------- Render ---------------- */
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #0f172a, #020617)',
      color: '#fff',
      py: 4
    }}>
      <Container maxWidth="xl">

        {/* HEADER */}
        <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 2 }}>
          {viewMode !== 'grades' && (
            <IconButton onClick={handleBack} sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              color: "#fff",
              "&:hover": { bgcolor: "primary.main" }
            }}>
              <ArrowBackIcon />
            </IconButton>
          )}

          <Typography variant="h4" fontWeight="bold">
            {viewMode === "grades" && "Select Grade"}
            {viewMode === "subjects" && `${selectedGrade} / Subjects`}
            {viewMode === "students" && "Students"}
          </Typography>
        </Box>

        {/* GRADES */}
        {viewMode === "grades" && (
          <Grid container spacing={3}
            component={motion.div}
            variants={fadeContainer}
            initial="hidden"
            animate="show"
          >

            {/* All Students */}
            <Grid item xs={12} sm={6} md={3} component={motion.div} variants={fadeItem}>
              <Card sx={glassCard}
                onClick={() => {
                  setSelectedGrade(null);
                  setSelectedSubject(null);
                  setViewMode("students");
                }}>
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <PeopleAltIcon sx={{ fontSize: 50, color: "#38bdf8" }} />
                  <Typography mt={2} fontWeight="bold">All Students</Typography>
                </Box>
              </Card>
            </Grid>

            {grades.map(g => (
              <Grid item xs={12} sm={6} md={3} key={g} component={motion.div} variants={fadeItem}>
                <Card sx={glassCard}
                  onClick={() => {
                    setSelectedGrade(g);
                    setViewMode("subjects");
                  }}>
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <SchoolIcon sx={{ fontSize: 50, color: "#22c55e" }} />
                    <Typography mt={2} fontWeight="bold">{g}</Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* SUBJECTS */}
        {viewMode === "subjects" && (
          <Grid container spacing={3}
            component={motion.div}
            variants={fadeContainer}
            initial="hidden"
            animate="show"
          >
            {subjects.map(sub => (
              <Grid item xs={12} sm={6} md={3} key={sub._id} component={motion.div} variants={fadeItem}>
                <Card sx={glassCard}
                  onClick={() => {
                    setSelectedSubject(sub.name);
                    setViewMode("students");
                  }}>
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <MenuBookIcon sx={{ fontSize: 50, color: "#a78bfa" }} />
                    <Typography mt={2}>{sub.name}</Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* STUDENTS */}
        {viewMode === "students" && (
          <>
            <TextField
              fullWidth
              placeholder="Search students..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            {loading ? (
              <Box textAlign="center"><CircularProgress /></Box>
            ) : (
              <StudentTable students={students} />
            )}

            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
              />
            </Box>
          </>
        )}

      </Container>
    </Box>
  );
}