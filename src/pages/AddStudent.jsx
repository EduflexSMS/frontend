import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Paper,
    InputAdornment,
    useTheme,
    alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { Person, School, Phone, MenuBook, PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

export default function AddStudent() {
    const navigate = useNavigate();
    const theme = useTheme();

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

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <MotionContainer
            maxWidth="sm"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            sx={{
                py: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}
        >
            <MotionPaper
                elevation={0}
                variants={itemVariants}
                sx={{
                    p: { xs: 3, sm: 5 },
                    width: '100%',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Decorative background blob */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb33 0%, #3b82f611 100%)',
                        zIndex: 0,
                    }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h4"
                        component={motion.h4}
                        variants={itemVariants}
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: '#1e40af',
                            textAlign: 'center',
                            mb: 4,
                            fontSize: { xs: '1.75rem', sm: '2.125rem' }
                        }}
                    >
                        Add New Student
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <motion.div variants={itemVariants}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                variant="outlined"
                                required
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: 'primary.main' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                    }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <FormControl fullWidth>
                                <InputLabel id="grade-label">Grade</InputLabel>
                                <Select
                                    labelId="grade-label"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    required
                                    input={
                                        <OutlinedInput
                                            label="Grade"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <School sx={{ color: 'primary.main' }} />
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    sx={{ borderRadius: 2 }}
                                >
                                    {[...Array(13)].map((_, i) => {
                                        const gradeNum = (i + 1).toString().padStart(2, '0');
                                        return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>Grade {gradeNum}</MenuItem>;
                                    })}
                                </Select>
                            </FormControl>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <TextField
                                fullWidth
                                label="Mobile Number"
                                name="mobile"
                                required
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone sx={{ color: 'primary.main' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                    }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <FormControl fullWidth>
                                <InputLabel>Subjects</InputLabel>
                                <Select
                                    multiple
                                    value={formData.subjects}
                                    onChange={handleSubjectChange}
                                    input={
                                        <OutlinedInput
                                            label="Subjects"
                                            startAdornment={
                                                <InputAdornment position="start" sx={{ pl: 1 }}>
                                                    <MenuBook sx={{ color: 'primary.main' }} />
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        color: 'primary.main',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {subjectsList.map((sub) => (
                                        <MenuItem key={sub._id} value={sub.name}>
                                            {sub.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Button
                                component={motion.button}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                variant="contained"
                                fullWidth
                                startIcon={<PersonAdd />}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                                    textTransform: 'none'
                                }}
                            >
                                Register Student
                            </Button>
                        </motion.div>

                    </Box>
                </Box>
            </MotionPaper>
        </MotionContainer>
    );
}
