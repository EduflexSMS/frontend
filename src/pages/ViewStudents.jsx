import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Pagination, Typography, Container, CircularProgress, Grid, Card, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, MenuBook as MenuBookIcon, School as SchoolIcon } from '@mui/icons-material';
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

    const handleBack = () => {
        if (viewMode === 'students') setViewMode('subjects');
        else if (viewMode === 'subjects') {
            setViewMode('grades');
            setSelectedGrade(null);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ minHeight: '80vh', py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                {viewMode !== 'grades' && (
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Back
                    </Button>
                )}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={viewMode} // Re-animate on change
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {viewMode === 'grades' && 'Select Grade'}
                        {viewMode === 'subjects' && `${selectedGrade} - Select Subject`}
                        {viewMode === 'students' && `${selectedGrade} - ${selectedSubject}`}
                    </Typography>
                </motion.div>
            </Box>

            {/* GRADES VIEW */}
            {viewMode === 'grades' && (
                <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                    {grades.map((grade) => (
                        <Grid item xs={6} sm={4} md={3} key={grade} component={motion.div} variants={itemVariants} sx={{ display: 'flex' }}>
                            <Card
                                component={motion.div}
                                whileHover={{ scale: 1.05, translateY: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleGradeClick(grade)}
                                sx={{
                                    width: '100%',
                                    minHeight: 180,
                                    p: { xs: 2, md: 3 },
                                    cursor: 'pointer', textAlign: 'center',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
                                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
                                }}
                            >
                                <Box sx={{
                                    p: 2, borderRadius: '50%',
                                    bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#2196f3',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <SchoolIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">{grade}</Typography>
                            </Card>
                        </Grid>
                    ))}
                    {grades.length === 0 && !loading && (
                        <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>No grades found.</Typography>
                    )}
                </Grid>
            )}

            {/* SUBJECTS VIEW */}
            {viewMode === 'subjects' && (
                <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                    {subjects.map((subject) => {
                        const hasSchedule = subject.gradeSchedules && subject.gradeSchedules.some(s => s.grade === selectedGrade);
                        if (!hasSchedule) return null;

                        return (
                            <Grid item xs={6} sm={4} md={3} key={subject._id} component={motion.div} variants={itemVariants} sx={{ display: 'flex' }}>
                                <Card
                                    component={motion.div}
                                    whileHover={{ scale: 1.05, translateY: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSubjectClick(subject.name)}
                                    sx={{
                                        width: '100%',
                                        minHeight: 180,
                                        p: { xs: 2, md: 3 },
                                        cursor: 'pointer', textAlign: 'center',
                                        borderRadius: '24px',
                                        // Dynamic gradient based on subject color or default blue
                                        background: `linear-gradient(135deg, ${subject.color || '#2196f3'}15 0%, #ffffff 100%)`,
                                        border: `1px solid ${subject.color || '#2196f3'}40`,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <MenuBookIcon sx={{ fontSize: { xs: 30, md: 40 }, color: subject.color || '#2196f3', mb: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3 }}>{subject.name}</Typography>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* STUDENTS VIEW */}
            {viewMode === 'students' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Search Student"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                            <StudentTable
                                students={students}
                                onUpdate={() => fetchStudents(true)}
                                subjectColorMap={subjectColors}
                            />
                        </Paper>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                </motion.div>
            )}
        </Container>
    );
}
