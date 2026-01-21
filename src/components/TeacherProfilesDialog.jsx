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
                y: -8,
                transition: { type: "spring", stiffness: 300 }
            }}
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                }
            }}
        >
            {/* Decorative Top Gradient */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 80,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
                zIndex: 0
            }} />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}
            >
                <Box sx={{ p: 0.5, bgcolor: 'white', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Avatar
                        src={teacher.image}
                        alt={teacher.name}
                        sx={{
                            width: 100,
                            height: 100,
                            border: `3px solid ${theme.palette.background.paper}`,
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
                    boxShadow: 1
                }}>
                    <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />
                </Box>
            </motion.div>

            <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="800" sx={{
                    mb: 0.5,
                    background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
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
                        mb: 2,
                        fontWeight: 600,
                        color: 'primary.main',
                        bgcolor: 'primary.50',
                        border: '1px solid',
                        borderColor: 'primary.100'
                    }}
                />

                <Box sx={{
                    mt: 'auto',
                    p: 1.5,
                    width: '100%',
                    bgcolor: 'rgba(241, 245, 249, 0.6)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}>
                    <SchoolIcon color="action" fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ lineHeight: 1.3 }}>
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
                        initial: { opacity: 0, scale: 0.95, y: 20 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.95, y: 20 },
                        transition: { duration: 0.4, ease: "easeOut" },
                        style: {
                            borderRadius: fullScreen ? 0 : 24,
                            background: 'rgba(248, 250, 252, 0.8)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 2.5, md: 4 },
                        pb: { xs: 1, md: 2 }
                    }}>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{
                                color: '#0f172a',
                                fontSize: { xs: '1.5rem', md: '2rem' },
                                letterSpacing: '-0.02em'
                            }}>
                                Expert Faculty
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                                Meet the dedicated educators shaping your future
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: 'text.secondary',
                                bgcolor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s',
                                '&:hover': { bgcolor: 'white', transform: 'rotate(90deg)' }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                        <Box
                            component={motion.div}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid container spacing={3}>
                                {teachers.map((teacher, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
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
