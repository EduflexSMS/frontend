import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, TextField, Pagination, Typography, Container,
    CircularProgress, Grid, Card, Button, Paper,
    IconButton, InputAdornment, alpha,
    Chip, Stack, Skeleton, Fade
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
import { debounce } from 'lodash';

// ------------------ Animation ------------------
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

// ------------------ Icons ------------------
const subjectIcons = {
    Mathematics: <SchoolIcon />,
    Science: <MenuBookIcon />,
    English: <MenuBookIcon />,
    ICT: <MenuBookIcon />,
    "Business and Accounting Studies": <MenuBookIcon />,
    Scholarship: <MenuBookIcon />
};

// ------------------ Component ------------------
export default function ViewStudents() {

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
    const [subjectColors, setSubjectColors] = useState({});

    // ------------------ API ------------------
    const fetchGrades = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/students/grades`);
            setGrades(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/subjects`);
            setSubjects(res.data);

            const map = {};
            res.data.forEach(s => map[s.name] = s);
            setSubjectColors(map);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchStudents = useCallback(async (bg = false) => {
        if (!bg) setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/students`, {
                params: {
                    page,
                    search,
                    grade: selectedGrade,
                    subject: selectedSubject
                }
            });
            setStudents(res.data.students);
            setTotalPages(res.data.totalPages);
        } catch (e) {
            console.error(e);
        } finally {
            if (!bg) setLoading(false);
        }
    }, [page, search, selectedGrade, selectedSubject]);

    // ------------------ Effects ------------------
    useEffect(() => {
        fetchGrades();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (viewMode === 'students') fetchStudents();
    }, [viewMode, fetchStudents]);

    // Auto refresh
    useEffect(() => {
        const interval = setInterval(() => {
            if (viewMode === 'students') fetchStudents(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [viewMode, fetchStudents]);

    // ------------------ Search ------------------
    const debouncedSearch = useCallback(
        debounce((val) => {
            setSearch(val);
            setPage(1);
        }, 400),
        []
    );

    // ------------------ Handlers ------------------
    const handleBack = () => {
        if (viewMode === 'students') {
            if (!selectedGrade) setViewMode('grades');
            else setViewMode('subjects');
        } else {
            setViewMode('grades');
        }
    };

    // ------------------ UI ------------------
    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">

                {/* HEADER */}
                <Box display="flex" alignItems="center" mb={4} gap={2}>
                    {viewMode !== 'grades' && (
                        <IconButton onClick={handleBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h4" fontWeight="bold">
                        {viewMode === 'grades' && 'Select Grade'}
                        {viewMode === 'subjects' && 'Select Subject'}
                        {viewMode === 'students' && 'Students'}
                    </Typography>
                </Box>

                {/* ---------------- GRADES ---------------- */}
                {viewMode === 'grades' && (
                    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">

                        {/* ALL STUDENTS */}
                        <Grid item xs={12} md={3}>
                            <Card
                                component={motion.div}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setViewMode('students')}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg,#3b82f620,#00000020)'
                                }}
                            >
                                <PeopleAltIcon sx={{ fontSize: 50 }} />
                                <Typography mt={2}>All Students</Typography>
                            </Card>
                        </Grid>

                        {grades.map(g => (
                            <Grid item xs={12} md={3} key={g}>
                                <Card
                                    component={motion.div}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => {
                                        setSelectedGrade(g);
                                        setViewMode('subjects');
                                    }}
                                    sx={{ p: 4, borderRadius: 4, cursor: 'pointer', textAlign: 'center' }}
                                >
                                    <SchoolIcon sx={{ fontSize: 40 }} />
                                    <Typography mt={2}>{g}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* ---------------- SUBJECTS ---------------- */}
                {viewMode === 'subjects' && (
                    <Grid container spacing={3}>
                        {subjects.map(s => (
                            <Grid item xs={12} md={3} key={s._id}>
                                <Card
                                    component={motion.div}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => {
                                        setSelectedSubject(s.name);
                                        setViewMode('students');
                                    }}
                                    sx={{ p: 4, borderRadius: 4, textAlign: 'center', cursor: 'pointer' }}
                                >
                                    {subjectIcons[s.name] || <MenuBookIcon />}
                                    <Typography mt={2}>{s.name}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* ---------------- STUDENTS ---------------- */}
                {viewMode === 'students' && (
                    <>
                        {/* SEARCH */}
                        <Box mb={3}>
                            <TextField
                                fullWidth
                                placeholder="Search student..."
                                onChange={(e) => debouncedSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* FILTERS */}
                        <Stack direction="row" spacing={1} mb={2}>
                            {selectedGrade && <Chip label={selectedGrade} />}
                            {selectedSubject && <Chip label={selectedSubject} />}
                        </Stack>

                        {/* LOADING */}
                        {loading ? (
                            <Grid container spacing={2}>
                                {[...Array(6)].map((_, i) => (
                                    <Grid item xs={12} key={i}>
                                        <Skeleton height={60} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <>
                                <Paper sx={{ borderRadius: 3 }}>
                                    <StudentTable
                                        students={students}
                                        onUpdate={() => fetchStudents(true)}
                                        subjectColorMap={subjectColors}
                                    />
                                </Paper>

                                {/* EMPTY */}
                                {students.length === 0 && (
                                    <Fade in>
                                        <Box textAlign="center" p={5}>
                                            <PeopleAltIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                                            <Typography>No students found</Typography>
                                        </Box>
                                    </Fade>
                                )}

                                {/* PAGINATION */}
                                <Box mt={3} display="flex" justifyContent="center">
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(e, v) => setPage(v)}
                                    />
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}