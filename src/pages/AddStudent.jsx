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
                    background: alpha(theme.palette.background.paper, 0.6), // Dark Glass
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Holographic Glows */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', // Cyan
                        filter: 'blur(40px)',
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(217,70,239,0.15) 0%, transparent 70%)', // Magenta
                        filter: 'blur(40px)',
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
                            color: 'text.primary',
                            textAlign: 'center',
                            mb: 4,
                            fontSize: { xs: '1.75rem', sm: '2.125rem' },
                            textShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
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
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                    },
                                    '& .MuiInputLabel-root': { color: 'text.secondary' }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <FormControl fullWidth>
                                <InputLabel id="grade-label" sx={{ color: 'text.secondary' }}>Grade</InputLabel>
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
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                    }}
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
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                    },
                                    '& .MuiInputLabel-root': { color: 'text.secondary' }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'text.secondary' }}>Subjects</InputLabel>
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
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                        color: 'primary.light',
                                                        fontWeight: 500,
                                                        border: '1px solid rgba(59,130,246,0.3)'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                                        color: 'text.primary',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                    }}
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
                                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' }}
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
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', // Cyan to Blue
                                    boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.4)',
                                    textTransform: 'none',
                                    border: '1px solid rgba(255,255,255,0.2)'
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
