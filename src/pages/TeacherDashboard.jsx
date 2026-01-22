import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, useTheme, alpha, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Class, People, MonetizationOn, ArrowForwardIos } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { itemFadeUp, containerStagger, hoverScale } from '../utils/animations';

// Mock Data
const mockTeacherData = {
    name: "Mr. Amal Perera",
    subject: "Combined Mathematics",
    classes: [
        { id: 1, name: "2026 Theory", students: 120, collection: 240000, activeRate: 92 },
        { id: 2, name: "2025 Revision", students: 85, collection: 170000, activeRate: 88 },
        { id: 3, name: "2027 Paper Class", students: 40, collection: 60000, activeRate: 95 }
    ]
};

export default function TeacherDashboard() {
    const theme = useTheme();
    const { t } = useTranslation();
    const [teacher] = useState(mockTeacherData);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                variants={containerStagger(0.1)}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                        {teacher.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="800">{teacher.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{teacher.subject}</Typography>
                    </Box>
                </Box>

                {/* Stats Overview */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            component={motion.div}
                            variants={itemFadeUp}
                            sx={{
                                p: 3,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{t('total_students_enrolled')}</Typography>
                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                {teacher.classes.reduce((acc, curr) => acc + curr.students, 0)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            component={motion.div}
                            variants={itemFadeUp}
                            sx={{
                                p: 3,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{t('monthly_collection')}</Typography>
                            <Typography variant="h2" fontWeight="800" sx={{ mt: 1 }}>
                                LKR {(teacher.classes.reduce((acc, curr) => acc + curr.collection, 0) / 1000).toFixed(1)}k
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Class List */}
                <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>{t('my_classes')}</Typography>
                <Grid container spacing={3}>
                    {teacher.classes.map((cls) => (
                        <Grid item xs={12} key={cls.id}>
                            <Paper
                                component={motion.div}
                                variants={itemFadeUp}
                                whileHover={hoverScale}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 56, height: 56 }}>
                                        <Class />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight="700">{cls.name}</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <People fontSize="small" /> {cls.students} Students
                                            </Typography>
                                            <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                <MonetizationOn fontSize="small" /> Paid
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <IconButton>
                                    <ArrowForwardIos />
                                </IconButton>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </motion.div>
        </Container>
    );
}
