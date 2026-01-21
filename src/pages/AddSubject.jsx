import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    InputAdornment,
    Grid,
    IconButton,
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { MenuBook, Description, AddCircleOutline, CheckCircle } from '@mui/icons-material';
import API_BASE_URL from '../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

const colors = [
    '#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5',
    '#ffebee', '#f1f8e9', '#e0f7fa', '#fff8e1'
];

export default function AddSubject() {
    const navigate = useNavigate();
    const theme = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: colors[0]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleColorSelect = (selectedColor) => {
        setFormData({ ...formData, color: selectedColor });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/subjects`, formData);
            alert('Subject Added Successfully');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error adding subject');
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
            maxWidth="md"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            sx={{
                py: 5,
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <MotionPaper
                elevation={0}
                variants={itemVariants}
                sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 4,
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -60,
                        left: -60,
                        width: 180,
                        height: 180,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b33 0%, #fbbf2411 100%)', // Amber hint
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -40,
                        right: -40,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f633 0%, #2563eb11 100%)', // Blue hint
                        zIndex: 0,
                    }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h3"
                        component={motion.h3}
                        variants={itemVariants}
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: '#1e3a8a',
                            textAlign: 'center',
                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                        }}
                    >
                        Create New Subject
                    </Typography>
                    <Typography
                        variant="body1"
                        component={motion.p}
                        variants={itemVariants}
                        align="center"
                        sx={{ mb: 5, color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}
                    >
                        Define a new subject for your curriculum. Choose a distinct name and color theme to organize your schedule effectively.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={7}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <motion.div variants={itemVariants}>
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            name="name"
                                            variant="outlined"
                                            required
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <MenuBook sx={{ color: 'primary.main' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(255,255,255,0.6)',
                                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                                }
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <TextField
                                            fullWidth
                                            label="Description (Optional)"
                                            name="description"
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                                                        <Description sx={{ color: 'primary.main' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(255,255,255,0.6)',
                                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                                }
                                            }}
                                        />
                                    </motion.div>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            borderRadius: 3,
                                            bgcolor: alpha(formData.color, 0.5),
                                            border: '1px dashed',
                                            borderColor: 'primary.light',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            Theme Color
                                        </Typography>
                                        <Grid container spacing={1} justifyContent="center" sx={{ maxWidth: 200 }}>
                                            {colors.map((color) => (
                                                <Grid item key={color}>
                                                    <Tooltip title="Select Color">
                                                        <IconButton
                                                            onClick={() => handleColorSelect(color)}
                                                            sx={{
                                                                bgcolor: color,
                                                                width: 36,
                                                                height: 36,
                                                                border: formData.color === color ? '2px solid #1e3a8a' : '1px solid rgba(0,0,0,0.1)',
                                                                transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                                                                transition: 'all 0.2s',
                                                                '&:hover': { transform: 'scale(1.15)' }
                                                            }}
                                                        >
                                                            {formData.color === color && <CheckCircle sx={{ fontSize: 20, color: 'primary.dark' }} />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <Box
                                            sx={{
                                                mt: 3,
                                                p: 2,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                boxShadow: 1,
                                                width: '100%',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Typography variant="caption" display="block" color="text.secondary">Preview</Typography>
                                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                                {formData.name || "Subject Name"}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>

                            <Grid item xs={12}>
                                <motion.div variants={itemVariants}>
                                    <Button
                                        component={motion.button}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        endIcon={<AddCircleOutline />}
                                        sx={{
                                            mt: 1,
                                            py: 1.5,
                                            px: 6,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                                            display: 'block',
                                            mx: 'auto'
                                        }}
                                    >
                                        Add Subject
                                    </Button>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </MotionPaper>
        </MotionContainer>
    );
}
