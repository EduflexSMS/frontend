import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, TextField, Pagination, Typography, Container,
    Grid, Card, Paper, IconButton, InputAdornment,
    Chip, Stack, Skeleton, Fade
} from '@mui/material';
import {
    ArrowBack, Search, School, MenuBook, PeopleAlt
} from '@mui/icons-material';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

// ------------------- Animations -------------------
const pageTransition = {
    initial: { opacity: 0, scale: 0.98, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -30 },
    transition: { duration: 0.4 }
};

const cardHover = {
    whileHover: {
        scale: 1.05,
        rotateX: 5,
        rotateY: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    }
};

// ------------------- Component -------------------
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

    // ------------------- API -------------------
    const fetchGrades = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/students/grades`);
            setGrades(res.data);
        } finally { setLoading(false); }
    };

    const fetchSubjects = async () => {
        const res = await axios.get(`${API_BASE_URL}/api/subjects`);
        setSubjects(res.data);
        const map = {};
        res.data.forEach(s => map[s.name] = s);
        setSubjectColors(map);
    };

    const fetchStudents = useCallback(async (bg = false) => {
        if (!bg) setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/students`, {
                params: { page, search, grade: selectedGrade, subject: selectedSubject }
            });
            setStudents(res.data.students);
            setTotalPages(res.data.totalPages);
        } finally { if (!bg) setLoading(false); }
    }, [page, search, selectedGrade, selectedSubject]);

    useEffect(() => {
        fetchGrades();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (viewMode === 'students') fetchStudents();
    }, [viewMode, fetchStudents]);

    // ------------------- Search -------------------
    const debouncedSearch = useCallback(
        debounce((val) => {
            setSearch(val);
            setPage(1);
        }, 300),
        []
    );

    // ------------------- UI Helpers -------------------
    const neonCard = {
        borderRadius: "24px",
        background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative"
    };

    const glow = {
        "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, transparent, rgba(0,255,255,0.3), transparent)",
            opacity: 0,
            transition: "0.5s"
        },
        "&:hover::before": {
            opacity: 1
        }
    };

    // ------------------- Render -------------------
    return (
        <Box sx={{
            minHeight: "100vh",
            background: "radial-gradient(circle at top, #0f172a, #020617)",
            color: "#fff",
            py: 4
        }}>
            <Container maxWidth="xl">

                {/* HEADER */}
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                    {viewMode !== 'grades' && (
                        <IconButton onClick={() => setViewMode('grades')}>
                            <ArrowBack sx={{ color: "#fff" }} />
                        </IconButton>
                    )}
                    <Typography variant="h4" fontWeight="900">
                        {viewMode.toUpperCase()}
                    </Typography>
                </Box>

                <AnimatePresence mode="wait">

                    {/* ---------------- GRADES ---------------- */}
                    {viewMode === 'grades' && (
                        <motion.div key="grades" {...pageTransition}>
                            <Grid container spacing={3}>

                                <Grid item xs={12} md={3}>
                                    <Card
                                        component={motion.div}
                                        {...cardHover}
                                        sx={{ ...neonCard, ...glow, p: 4, textAlign: "center" }}
                                        onClick={() => setViewMode('students')}
                                    >
                                        <PeopleAlt sx={{ fontSize: 60 }} />
                                        <Typography mt={2}>All Students</Typography>
                                    </Card>
                                </Grid>

                                {grades.map(g => (
                                    <Grid item xs={12} md={3} key={g}>
                                        <Card
                                            component={motion.div}
                                            {...cardHover}
                                            sx={{ ...neonCard, ...glow, p: 4, textAlign: "center" }}
                                            onClick={() => {
                                                setSelectedGrade(g);
                                                setViewMode('subjects');
                                            }}
                                        >
                                            <School sx={{ fontSize: 50 }} />
                                            <Typography mt={2}>{g}</Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}

                    {/* ---------------- SUBJECTS ---------------- */}
                    {viewMode === 'subjects' && (
                        <motion.div key="subjects" {...pageTransition}>
                            <Grid container spacing={3}>
                                {subjects.map(s => (
                                    <Grid item xs={12} md={3} key={s._id}>
                                        <Card
                                            component={motion.div}
                                            {...cardHover}
                                            sx={{ ...neonCard, ...glow, p: 4, textAlign: "center" }}
                                            onClick={() => {
                                                setSelectedSubject(s.name);
                                                setViewMode('students');
                                            }}
                                        >
                                            <MenuBook sx={{ fontSize: 40 }} />
                                            <Typography mt={2}>{s.name}</Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}

                    {/* ---------------- STUDENTS ---------------- */}
                    {viewMode === 'students' && (
                        <motion.div key="students" {...pageTransition}>

                            {/* SEARCH BAR (Floating Glass) */}
                            <Box mb={3}>
                                <TextField
                                    fullWidth
                                    placeholder="🔍 Search students..."
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    sx={{
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "20px"
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: "#aaa" }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>

                            {/* FILTER CHIPS */}
                            <Stack direction="row" spacing={1} mb={2}>
                                {selectedGrade && <Chip label={selectedGrade} />}
                                {selectedSubject && <Chip label={selectedSubject} />}
                            </Stack>

                            {/* TABLE */}
                            {loading ? (
                                <Grid container spacing={2}>
                                    {[...Array(6)].map((_, i) => (
                                        <Grid item xs={12} key={i}>
                                            <Skeleton height={60} sx={{ borderRadius: 2 }} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <>
                                    <Paper sx={{
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        background: "rgba(255,255,255,0.03)",
                                        backdropFilter: "blur(12px)"
                                    }}>
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
                                                <PeopleAlt sx={{ fontSize: 70, opacity: 0.2 }} />
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
                        </motion.div>
                    )}

                </AnimatePresence>

            </Container>
        </Box>
    );
}