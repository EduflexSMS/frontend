import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Pagination, Typography, Container, CircularProgress, Grid, Card, Button, Paper, useTheme, useMediaQuery, IconButton, InputAdornment } from '@mui/material';
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
            background: '#f0f4f8',
            backgroundImage: `
                radial-gradient(at 0% 0%, hsla(210,100%,96%,1) 0, transparent 50%), 
                radial-gradient(at 50% 0%, hsla(210,100%,94%,1) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(210,100%,96%,1) 0, transparent 50%)
            `,
            pt: 4, pb: 8
        }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {viewMode !== 'grades' && (
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                bgcolor: 'white',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.1)' },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <ArrowBackIcon sx={{ color: '#1a1a1a' }} />
                        </IconButton>
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={viewMode}
                    >
                        <Typography variant="h3" sx={{
                            fontWeight: 900,
                            color: '#1a202c',
                            letterSpacing: '-1.5px',
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                        }}>
                            {/* Breadcrumb-style Header */}
                            {viewMode === 'grades' && 'Select Grade'}
                            {viewMode === 'subjects' && (
                                <>
                                    <span style={{ opacity: 0.4 }}>{selectedGrade}</span>
                                    <span style={{ opacity: 0.2 }}>/</span>
                                    <span style={{ color: '#2196f3' }}>Select Subject</span>
                                </>
                            )}
                            {viewMode === 'students' && (
                                <>
                                    <span style={{ opacity: 0.4 }}>Students</span>
                                    {selectedGrade && (
                                        <>
                                            <span style={{ opacity: 0.2 }}>/</span>
                                            <span style={{ color: '#2196f3' }}>{selectedSubject || 'All'}</span>
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
                                whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(33, 150, 243, 0.5)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAllStudentsClick}
                                sx={{
                                    height: '100%', minHeight: 240,
                                    cursor: 'pointer', borderRadius: '32px',
                                    background: 'linear-gradient(135deg, #0D47A1 0%, #2196F3 100%)',
                                    padding: 4, position: 'relative', overflow: 'hidden',
                                    boxShadow: '0 20px 25px -5px rgba(33, 150, 243, 0.3)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                                }}
                            >
                                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                <PeopleAltIcon sx={{ fontSize: 64, color: 'white', mb: 2, zIndex: 1 }} />
                                <Typography variant="h5" fontWeight="800" color="white" align="center" sx={{ zIndex: 1 }}>
                                    View All Students
                                </Typography>
                                <Paper sx={{ mt: 2, px: 2, py: 0.5, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    <Typography variant="caption" fontWeight="bold">Total Records</Typography>
                                </Paper>
                            </Card>
                        </Grid>

                        {grades.map((grade) => (
                            <Grid item xs={6} sm={4} md={3} key={grade} component={motion.div} variants={itemVariants}>
                                <Card
                                    component={motion.div}
                                    whileHover={{ y: -10, scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleGradeClick(grade)}
                                    sx={{
                                        height: '100%', minHeight: 240,
                                        p: 0, borderRadius: '32px',
                                        cursor: 'pointer',
                                        bgcolor: 'white',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '8px',
                                        background: 'linear-gradient(90deg, #2196f3, #00BCD4)'
                                    }} />

                                    <Box sx={{
                                        width: 100, height: 100, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(0,188,212,0.1))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mb: 3
                                    }}>
                                        <SchoolIcon sx={{ fontSize: 48, color: '#2196f3' }} />
                                    </Box>

                                    <Typography variant="h5" fontWeight="800" color="#1a202c">
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
                                <Grid item xs={6} sm={6} md={3} key={subject._id} component={motion.div} variants={itemVariants}>
                                    <Card
                                        component={motion.div}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubjectClick(subject.name)}
                                        sx={{
                                            height: '100%', minHeight: 220,
                                            borderRadius: '32px', p: 3,
                                            cursor: 'pointer',
                                            bgcolor: 'white',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(255,255,255,0.8)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                                            position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        <Box sx={{
                                            position: 'absolute', inset: 0, opacity: 0,
                                            background: `linear-gradient(135deg, ${isActiveColor}22 0%, transparent 100%)`,
                                            transition: 'opacity 0.3s ease',
                                            '.MuiCard-root:hover &': { opacity: 1 }
                                        }} />

                                        <Box sx={{
                                            p: 2.5, borderRadius: '24px',
                                            bgcolor: `${isActiveColor}15`,
                                            color: isActiveColor,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            zIndex: 1,
                                            '.MuiCard-root:hover &': { transform: 'scale(1.1) rotate(-5deg)' }
                                        }}>
                                            <MenuBookIcon sx={{ fontSize: 40 }} />
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" align="center" sx={{
                                            color: '#2d3748',
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
                                bgcolor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                                }
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
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
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
                            />
                        </Box>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
}
