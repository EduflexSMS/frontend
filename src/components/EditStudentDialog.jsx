import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Typography } from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function EditStudentDialog({ open, onClose, student, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        mobile: '',
        subjects: [], // New subjects to add
        freeCardSubjects: []
    });
    const [availableSubjects, setAvailableSubjects] = useState([]);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                grade: student.grade,
                mobile: student.mobile,
                subjects: student.enrollments.map(e => e.subject), // Load existing subjects
                freeCardSubjects: student.enrollments.filter(e => e.isFreeCard).map(e => e.subject) // Load existing free card subjects
            });
            fetchSubjects();
        }
    }, [student]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/subjects`);
            setAvailableSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubjectChange = (event) => {
        const { target: { value } } = event;
        const newSubjects = typeof value === 'string' ? value.split(',') : value;
        const newFree = (formData.freeCardSubjects || []).filter(s => newSubjects.includes(s));
        setFormData({
            ...formData,
            subjects: newSubjects,
            freeCardSubjects: newFree
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/students/${student._id}`, formData);
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating student", error);
            alert("Failed to update student");
        }
    };

    // Filter out subjects the student already has - REMOVED, we want full list
    // const currentSubjects = student ? student.enrollments.map(e => e.subject) : [];
    // const subjectsToAdd = availableSubjects.filter(sub => !currentSubjects.includes(sub.name));

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} margin="dense" />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="edit-grade-label">Grade</InputLabel>
                        <Select
                            labelId="edit-grade-label"
                            name="grade"
                            value={formData.grade}
                            label="Grade"
                            onChange={handleChange}
                        >
                            {[...Array(13)].map((_, i) => {
                                const gradeNum = (i + 1).toString().padStart(2, '0');
                                return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>Grade {gradeNum}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} margin="dense" />

                    <FormControl fullWidth margin="dense">
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
                            {availableSubjects.map((sub) => (
                                <MenuItem key={sub._id} value={sub.name}>
                                    {sub.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {formData.subjects.length > 0 && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 600 }}>
                                Configure Free Card Subjects
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {formData.subjects.map(subjectName => {
                                    const isFree = formData.freeCardSubjects?.includes(subjectName);
                                    return (
                                        <Box key={subjectName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{subjectName}</Typography>
                                            <Button
                                                size="small"
                                                variant={isFree ? "contained" : "outlined"}
                                                color={isFree ? "secondary" : "inherit"}
                                                onClick={() => {
                                                    const newFree = isFree 
                                                        ? (formData.freeCardSubjects || []).filter(s => s !== subjectName)
                                                        : [...(formData.freeCardSubjects || []), subjectName];
                                                    setFormData({ ...formData, freeCardSubjects: newFree });
                                                }}
                                                sx={{ borderRadius: 1, textTransform: 'none', minWidth: 130, fontWeight: 700 }}
                                            >
                                                {isFree ? "Free Card Enabled" : "Normal Pay"}
                                            </Button>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
}

