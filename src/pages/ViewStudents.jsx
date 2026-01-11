import React, { useState, useEffect } from 'react';
import { Box, TextField, Pagination, Typography, Container, CircularProgress } from '@mui/material';
import axios from 'axios';
import StudentTable from '../components/StudentTable';
import API_BASE_URL from '../config';

export default function ViewStudents() {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [subjectColors, setSubjectColors] = useState({});

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/students`, {
                params: { page, search }
            });
            setStudents(response.data.students);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/subjects`);
            const subjectMap = {};
            response.data.forEach(sub => {
                subjectMap[sub.name] = sub; // Store full object including classDay and color
            });
            setSubjectColors(subjectMap); // Renaming variable might be better but for minimal diff keeping it, logic changes though.
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStudents();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' }, fontWeight: 600 }}>Student Registry</Typography>

            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <TextField
                    label="Search by Name, Index or Subject"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <StudentTable students={students} onUpdate={fetchStudents} subjectColorMap={subjectColors} />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Container>
    );
}

