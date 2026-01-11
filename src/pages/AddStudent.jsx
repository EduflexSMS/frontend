
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function AddStudent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        mobile: '',
        subjects: []
    });

    const [subjectsList, setSubjectsList] = useState([]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/subjects`);
                setSubjectsList(response.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }
        };
        fetchSubjects();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubjectChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData({
            ...formData,
            subjects: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/students`, formData);
            alert('Student Added Successfully');
            navigate('/students');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Error adding student';
            alert(message);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Add New Student</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField fullWidth label="Name" name="name" margin="normal" required onChange={handleChange} />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="grade-label">Grade</InputLabel>
                    <Select
                        labelId="grade-label"
                        name="grade"
                        value={formData.grade}
                        label="Grade"
                        onChange={handleChange}
                        required
                    >
                        {[...Array(13)].map((_, i) => {
                            const gradeNum = (i + 1).toString().padStart(2, '0');
                            return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>Grade {gradeNum}</MenuItem>;
                        })}
                    </Select>
                </FormControl>
                <TextField fullWidth label="Mobile" name="mobile" margin="normal" required onChange={handleChange} />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Subjects</InputLabel>
                    <Select
                        multiple
                        value={formData.subjects}
                        onChange={handleSubjectChange}
                        input={<OutlinedInput label="Subjects" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {subjectsList.map((sub) => (
                            <MenuItem key={sub._id} value={sub.name}>
                                {sub.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                    Register Student
                </Button>
            </Box>
        </Container>
    );
}
