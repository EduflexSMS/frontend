import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Pagination, Typography, Container, CircularProgress, Grid, Card, Button, Paper, useTheme, useMediaQuery, IconButton, InputAdornment, alpha } from '@mui/material';
import { ArrowBack as ArrowBackIcon, MenuBook as MenuBookIcon, School as SchoolIcon, PeopleAlt as PeopleAltIcon, Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';
import { motion } from 'framer-motion';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

// ViewStudents Component - v2.2 (Animated)
export default function ViewStudents() {
    const theme = useTheme();
    // View States: 'grades', 'subjects', 'students'
    const [viewMode, setViewMode] = useState('grades');
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Data
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [subjectColors, setSubjectColors] = useState({});

    // Fetch Distinct Grades
    const fetchGrades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/students/grades`);
            setGrades(response.data);
        } catch (error) {
            console.error("Error fetching grades:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Subjects
    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/subjects`);
            setSubjects(response.data);

            const subjectMap = {};
            response.data.forEach(sub => {
                subjectMap[sub.name] = sub;
            });
            setSubjectColors(subjectMap);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    // Fetch Students
    const fetchStudents = useCallback(async (background = false) => {
        if (!background) setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/students`, {
                params: {
                    page,
                    search,
                    grade: selectedGrade,
                    subject: selectedSubject
                }
            });
            setStudents(response.data.students);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            if (!background) setLoading(false);
        }
    }, [page, search, selectedGrade, selectedSubject]);

    // Initial Load
    useEffect(() => {
        fetchGrades();
        fetchSubjects();
    }, []);

    // Fetch students when entering 'students' view
    useEffect(() => {
        if (viewMode === 'students') {
            fetchStudents();
        }
    }, [viewMode, fetchStudents]);

    // Handlers
    const handleGradeClick = (grade) => {
        setSelectedGrade(grade);
        setViewMode('subjects');
    };

    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setViewMode('students');
        setPage(1);
    };

    const handleAllStudentsClick = () => {
        setSelectedGrade(null);
        setSelectedSubject(null);
        setViewMode('students');
        setPage(1);
    };

    const handleBack = () => {
        if (viewMode === 'students') {
            // If we came from "All Students" (no grade/subject), go back to grades
            if (!selectedGrade) {
                setViewMode('grades');
            } else {
                setViewMode('subjects');
            }
        } else if (viewMode === 'subjects') {
            setViewMode('grades');
            setSelectedGrade(null);
        }
    };

    // Dynamic Subject Colors for Visual Vibrancy
    const getSubjectColor = (name) => {
        if (name.includes('Mathematics')) return '#FF4B2B'; // Red/Orange
        if (name.includes('Science')) return '#2196F3'; // Blue
        if (name.includes('English')) return '#00E676'; // Green
        if (name.includes('ICT')) return '#651FFF'; // Purple
        if (name.includes('Business')) return '#F50057'; // Pink
        if (name.includes('Scholarship')) return '#FFD600'; // Gold
        return '#2196F3'; // Default
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            // TRANSPARENT BACKGROUND TO SHOW 3D HOLOGRAMS
            background: 'transparent',
            pt: 4, pb: 8
        }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {viewMode !== 'grades' && (
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                color: 'text.primary',
                                bgcolor: alpha(theme.palette.background.paper, 0.3),
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2), transform: 'scale(1.1)' },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={viewMode}
                    >
                        <Typography variant="h3" sx={{
                            fontWeight: 900,
                            color: 'text.primary',
                            letterSpacing: '-1.5px',
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' // Neon Glow Title
                        }}>
                            {/* Breadcrumb-style Header */}
                            {viewMode === 'grades' && 'Select Grade'}
                            {viewMode === 'subjects' && (
                                <>
                                    <span style={{ opacity: 0.4 }}>{selectedGrade}</span>
                                    <span style={{ opacity: 0.2 }}>/</span>
                                    <span style={{ color: theme.palette.primary.main }}>Select Subject</span>
                                </>
                            )}
                            {viewMode === 'students' && (
                                <>
                                    <span style={{ opacity: 0.4 }}>Students</span>
                                    {selectedGrade && (
                                        <>
                                            <span style={{ opacity: 0.2 }}>/</span>
                                            <span style={{ color: theme.palette.primary.main }}>{selectedSubject || 'All'}</span>
                                        </>
                                    )}
                                </>
                            )}
                        </Typography>
                    </motion.div>
                </Box>

                {/* GRADES VIEW */}
                {viewMode === 'grades' && (
                    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                        {/* All Students Card - Hero Style */}
                        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
                            <Card
                                component={motion.div}
                                whileHover={{ y: -10, boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAllStudentsClick}
                                sx={{
                                    height: '100%', minHeight: 240,
                                    cursor: 'pointer', borderRadius: '24px',
                                    background: 'rgba(59, 130, 246, 0.2)', // Semi-transparent Blue
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    padding: 4, position: 'relative', overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                                }}
                            >
                                <PeopleAltIcon sx={{ fontSize: 64, color: '#60a5fa', mb: 2, zIndex: 1, filter: 'drop-shadow(0 0 10px #3b82f6)' }} />
                                <Typography variant="h5" fontWeight="800" color="text.primary" align="center" sx={{ zIndex: 1 }}>
                                    View All Students
                                </Typography>
                                <Paper sx={{ mt: 2, px: 2, py: 0.5, borderRadius: '20px', bgcolor: 'rgba(0,0,0,0.3)', color: 'text.secondary', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="caption" fontWeight="bold">Total Records</Typography>
                                </Paper>
                            </Card>
                        </Grid>

                        {grades.map((grade) => (
                            <Grid item xs={12} sm={6} md={3} key={grade} component={motion.div} variants={itemVariants}>
                                <Card
                                    component={motion.div}
                                    whileHover={{
                                        y: -10, scale: 1.02,
                                        boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)', // Cyan Neon Glow
                                        borderColor: '#06b6d4'
                                    }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleGradeClick(grade)}
                                    sx={{
                                        height: '100%', minHeight: 240,
                                        p: 4, borderRadius: '24px',
                                        cursor: 'pointer',
                                        bgcolor: 'rgba(30, 41, 59, 0.6)', // Dark Glass
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden',
                                        transition: 'border-color 0.3s'
                                    }}
                                >
                                    <Box sx={{
                                        width: 80, height: 80, borderRadius: '50%',
                                        background: 'rgba(6, 182, 212, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mb: 3, border: '1px solid rgba(6, 182, 212, 0.3)'
                                    }}>
                                        <SchoolIcon sx={{ fontSize: 40, color: '#22d3ee' }} />
                                    </Box>

                                    <Typography variant="h5" fontWeight="800" color="text.primary">
                                        {grade}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Click to view subjects
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* SUBJECTS VIEW */}
                {viewMode === 'subjects' && (
                    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                        {subjects.map((subject) => {
                            // Grade-Specific Subject Filtering
                            let shouldShow = true;
                            if (selectedGrade) {
                                const gradeNum = parseInt(selectedGrade.replace(/\D/g, ''));
                                const sName = subject.name;

                                if (gradeNum >= 6 && gradeNum <= 9) {
                                    shouldShow = ['Mathematics', 'Science', 'English', 'ICT'].includes(sName);
                                } else if (gradeNum === 10 || gradeNum === 11) {
                                    shouldShow = ['Mathematics', 'Science', 'English', 'ICT', 'Business and Accounting Studies'].includes(sName);
                                } else if (gradeNum >= 3 && gradeNum <= 5) {
                                    shouldShow = sName.toLowerCase().includes('scholarship');
                                }
                            }

                            if (!shouldShow) return null;

                            const isActiveColor = getSubjectColor(subject.name);

                            return (
                                <Grid item xs={12} sm={6} md={3} key={subject._id} component={motion.div} variants={itemVariants}>
                                    <Card
                                        component={motion.div}
                                        whileHover={{ y: -8, scale: 1.02, boxShadow: `0 0 20px ${isActiveColor}66`, borderColor: isActiveColor }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubjectClick(subject.name)}
                                        sx={{
                                            height: '100%', minHeight: 240,
                                            borderRadius: '24px', p: 4,
                                            cursor: 'pointer',
                                            bgcolor: 'rgba(30, 41, 59, 0.6)', // Dark Glass
                                            backdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                                            position: 'relative', overflow: 'hidden',
                                            transition: 'border-color 0.3s'
                                        }}
                                    >
                                        <Box sx={{
                                            p: 2.5, borderRadius: '20px',
                                            bgcolor: `${isActiveColor}22`,
                                            color: isActiveColor,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            zIndex: 1,
                                            border: `1px solid ${isActiveColor}44`,
                                            '.MuiCard-root:hover &': { transform: 'scale(1.1) rotate(-5deg)' }
                                        }}>
                                            <MenuBookIcon sx={{ fontSize: 36 }} />
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" align="center" sx={{
                                            color: 'text.primary',
                                            lineHeight: 1.2,
                                            zIndex: 1
                                        }}>
                                            {subject.name}
                                        </Typography>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}

                {/* STUDENTS VIEW */}
                {viewMode === 'students' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <TextField
                            label="Search Student"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            sx={{
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'text.primary',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                                <CircularProgress size={60} thickness={4} />
                            </Box>
                        ) : (
                            <Paper elevation={0} sx={{
                                borderRadius: '24px', overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                bgcolor: 'rgba(30, 41, 59, 0.6)',
                                backdropFilter: 'blur(16px)'
                            }}>
                                <StudentTable
                                    students={students}
                                    onUpdate={() => fetchStudents(true)}
                                    subjectColorMap={subjectColors}
                                />
                            </Paper>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                shape="circular"
                                size="large"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: 'text.secondary',
                                        '&.Mui-selected': {
                                            bgcolor: theme.palette.primary.main,
                                            color: '#fff'
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
}
