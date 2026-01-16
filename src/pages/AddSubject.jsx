import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Card, CardContent, Grid } from '@mui/material';
import API_BASE_URL from '../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = [
    '#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5', '#ffebee', '#f1f8e9', '#e0f7fa', '#fff8e1'
];

export default function AddSubject() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        classDay: 'Monday',
        color: colors[0]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/subjects`, formData);
            alert('Subject Added Successfully');
            navigate('/'); // Or remain to add more
        } catch (error) {
            console.error(error);
            alert('Error adding subject');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 2, md: 5 } }}>
            <Card elevation={5} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)' }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#37474f' }}>
                        Create New Subject
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Define new subjects for your tuition center. Choose a unique color theme for better visualization.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Subject Name"
                                    name="name"
                                    variant="outlined"
                                    required
                                    onChange={handleChange}
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Description (Optional)"
                                    name="description"
                                    variant="outlined"
                                    onChange={handleChange}
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        mt: 2,
                                        px: 5,
                                        borderRadius: 5,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                    }}
                                >
                                    Add Subject
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}
