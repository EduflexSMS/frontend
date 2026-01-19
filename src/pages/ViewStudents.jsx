import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Pagination, Typography, Container, CircularProgress, Grid, Card, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, MenuBook as MenuBookIcon } from '@mui/icons-material';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';

// ViewStudents Component - v2.1
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

    // Fetch Subjects (Global list, filtered by UI context if needed)
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

    // Fetch Students (Filtered by Grade & Subject)
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
    }, [viewMode, fetchStudents]); // Search/Page dependencies handled by callback

    // Handlers
    const handleGradeClick = (grade) => {
        setSelectedGrade(grade);
        setViewMode('subjects');
    };

    const handleSubjectClick = (subjectName) => {
        setSelectedSubject(subjectName);
        setViewMode('students');
        setPage(1); // Reset page
    };

    const handleBack = () => {
        if (viewMode === 'students') setViewMode('subjects');
        else if (viewMode === 'subjects') {
            setViewMode('grades');
            setSelectedGrade(null);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                {viewMode !== 'grades' && (
                    <Button onClick={handleBack} variant="outlined" startIcon={<ArrowBackIcon />}>
                        Back
                    </Button>
                )}
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {viewMode === 'grades' && 'Select Grade'}
                    {viewMode === 'subjects' && `${selectedGrade} - Select Subject`}
                    {viewMode === 'students' && `${selectedGrade} - ${selectedSubject}`}
                </Typography>
            </Box>

            {/* GRADES VIEW */}
            {viewMode === 'grades' && (
                <Grid container spacing={3}>
                    {grades.map((grade) => (
                        <Grid item xs={12} sm={6} md={4} key={grade}>
                            <Card
                                onClick={() => handleGradeClick(grade)}
                                sx={{
                                    p: 4, cursor: 'pointer', textAlign: 'center',
                                    borderRadius: '16px',
                                    bgcolor: 'primary.main', color: 'white',
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                                }}
                            >
                                <Typography variant="h5" fontWeight="bold">{grade}</Typography>
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
                <Grid container spacing={3}>
                    {subjects.map((subject) => {
                        // Optional: Filter subjects that actually exist for this grade? 
                        // For now, showing all subjects as requested/implied or filter by gradeSchedules if present
                        // Checking if subject has schedule for this grade
                        const hasSchedule = subject.gradeSchedules && subject.gradeSchedules.some(s => s.grade === selectedGrade);
                        // If no schedules defined at all, maybe global subject? Let's show all for safety or filter.
                        // Better to show all and let user decide, or filtered if strict.
                        // Giving strict filtering based on schema structure can be better UX.
                        if (!hasSchedule && subject.gradeSchedules.length > 0) return null;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={subject._id}>
                                <Card
                                    onClick={() => handleSubjectClick(subject.name)}
                                    sx={{
                                        p: 3, cursor: 'pointer', textAlign: 'center',
                                        borderRadius: '16px',
                                        border: `2px solid ${subject.color || '#2196f3'}`,
                                        transition: '0.3s',
                                        '&:hover': { bgcolor: `${subject.color}11`, transform: 'scale(1.02)' }
                                    }}
                                >
                                    <MenuBookIcon sx={{ fontSize: 40, color: subject.color || '#2196f3', mb: 1 }} />
                                    <Typography variant="h6" fontWeight="bold">{subject.name}</Typography>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* STUDENTS VIEW */}
            {viewMode === 'students' && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Search Student"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <StudentTable
                            students={students}
                            onUpdate={() => fetchStudents(true)}
                            subjectColorMap={subjectColors}
                        />
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
}

