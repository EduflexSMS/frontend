import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
    Box,
    useTheme,
    useMediaQuery,
    Grid,
    Paper,
    Avatar,
    Chip
} from '@mui/material';
import { Close as CloseIcon, School as SchoolIcon, Verified as VerifiedIcon, AutoStories } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const teachers = [
    { subject: 'Mathematics', name: 'Keshara Rathnayaka', qual: 'Software Engineering(Hons)', image: '/assets/teachers/keshara.jpg' },
    { subject: 'Science', name: 'Yasiru Hasaranga', qual: 'National Diploma in Teaching(Science)', image: '/assets/teachers/yasiru.jpg' },
    { subject: 'English', name: 'Malith Jayawardhana', qual: 'Diploma in English', image: '/assets/teachers/malith.jpg' },
    { subject: 'ICT', name: 'Nilushka Purnima', qual: 'Software Engineering(Hons)', image: '/assets/teachers/nilushka.jpg' },
    { subject: 'Business and Accounting Studies', name: 'Danushpa C Rajapaksha', qual: 'Bsc Business Managemenet SP', image: '/assets/teachers/danushpa.png' },
    { subject: 'Scholarships Grade 03-05', name: 'Rawindra Sirimanne', qual: 'Government National School Teacher', image: '/assets/teachers/rawindra.jpg' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    }
};

const TeacherProfilesDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const TeacherCard = ({ teacher, index }) => (
        <Paper
            component={motion.div}
            variants={itemVariants}
            whileHover={{
                y: -12,
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                width: '100%',
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.2)',
                    borderColor: 'rgba(37, 99, 235, 0.4)',
                    background: 'rgba(255, 255, 255, 0.9)',
                }
            }}
        >
            {/* Decorative Top Gradient - Animated on hover */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
                zIndex: 0,
                transition: 'opacity 0.3s ease',
            }} />

            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 0
                }}
            />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                style={{ position: 'relative', zIndex: 1, marginBottom: 20, marginTop: 10 }}
            >
                <Box sx={{ p: 0.5, bgcolor: 'white', borderRadius: '50%', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                    <Avatar
                        src={teacher.image}
                        alt={teacher.name}
                        imgProps={{ style: { objectPosition: 'top' } }}
                        sx={{
                            width: 110,
                            height: 110,
                            border: `4px solid ${theme.palette.background.paper}`,
                            bgcolor: `hsl(${210 + index * 40}, 80%, 96%)`,
                            color: `hsl(${210 + index * 40}, 90%, 60%)`,
                            fontSize: '2.5rem',
                            fontWeight: 700
                        }}
                    >
                        {!teacher.image && teacher.name.charAt(0)}
                    </Avatar>
                </Box>
                <Box sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <VerifiedIcon sx={{ fontSize: 22, color: '#0ea5e9' }} />
                </Box>
            </motion.div>

            <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" fontWeight="800" align="center" sx={{
                    mb: 1,
                    minHeight: '3.6rem', // Fixed height for 2 lines of text
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {teacher.name}
                </Typography>

                <Chip
                    icon={<AutoStories sx={{ fontSize: 16 }} />}
                    label={teacher.subject}
                    size="small"
                    sx={{
                        mb: 2.5,
                        fontWeight: 700,
                        color: 'primary.700',
                        bgcolor: 'primary.50',
                        border: '1px solid',
                        borderColor: 'primary.100',
                        height: 28,
                        '& .MuiChip-label': { px: 1.5 }
                    }}
                />

                <Box sx={{
                    mt: 'auto',
                    p: 2,
                    width: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    minHeight: '72px',
                    border: '1px solid rgba(255,255,255,0.6)'
                }}>
                    <SchoolIcon sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} align="center" sx={{ lineHeight: 1.4, fontSize: '0.75rem' }}>
                        {teacher.qual}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    fullScreen={fullScreen}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        component: motion.div,
                        initial: { opacity: 0, scale: 0.95, y: 30 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.95, y: 30 },
                        transition: { duration: 0.5, type: "spring", damping: 25, stiffness: 300 },
                        style: {
                            borderRadius: fullScreen ? 0 : 32,
                            background: 'rgba(248, 250, 252, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.2)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 3, md: 5 },
                        pb: { xs: 1, md: 2 }
                    }}>
                        <Box>
                            <Typography variant="h3" fontWeight="800" sx={{
                                color: '#0f172a',
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                letterSpacing: '-0.03em',
                                mb: 0.5
                            }}>
                                Expert Faculty
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Meet the dedicated educators shaping your future
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#64748b',
                                bgcolor: 'white',
                                width: 48,
                                height: 48,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: '#ef4444',
                                    color: 'white',
                                    transform: 'rotate(90deg) scale(1.1)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: { xs: 2.5, md: 5 } }}>
                        <Box
                            component={motion.div}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid container spacing={3} alignItems="stretch">
                                {teachers.map((teacher, index) => (
                                    <Grid item xs={12} sm={6} md={6} key={index} sx={{ display: 'flex' }}>
                                        <TeacherCard teacher={teacher} index={index} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default TeacherProfilesDialog;
