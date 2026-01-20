import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    IconButton,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Close as CloseIcon, School as SchoolIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const teachers = [
    { subject: 'Mathematics', name: 'Keshara Rathnayaka', qual: 'Software Engineering(Hons)' },
    { subject: 'Science', name: 'Yasiru Hasaranga', qual: 'National Diploma in Teaching(Science)' },
    { subject: 'English', name: 'Malith Jayawardhana', qual: 'Diploma in English' },
    { subject: 'ICT', name: 'Nilushka Purnima', qual: 'Software Engineering(Hons)' },
    { subject: 'Business and Accounting Studies', name: 'Danushpa C Rajapaksha', qual: 'Bsc Business Managemenet SP' },
    { subject: 'Scholarships Grade 03-05', name: 'Rawindra Sirimanne', qual: 'Government National School Teacher' },
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
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
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

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    fullScreen={fullScreen}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        component: motion.div,
                        initial: { opacity: 0, scale: 0.9, rotateX: 10 },
                        animate: { opacity: 1, scale: 1, rotateX: 0 },
                        exit: { opacity: 0, scale: 0.9, rotateX: -10 },
                        transition: { duration: 0.4, type: "spring" },
                        style: {
                            borderRadius: fullScreen ? 0 : 28,
                            padding: 0,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.05) 100%)',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <Box>
                            <Typography variant="h5" fontWeight="800" sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.5px'
                            }}>
                                Teacher Profiles
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Meet our qualified academic staff
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            component={motion.button}
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                                bgcolor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: 'white' }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: '0 !important' }}>
                        <List component={motion.ul} variants={containerVariants} initial="hidden" animate="visible" sx={{ p: 2 }}>
                            {teachers.map((teacher, index) => (
                                <ListItem
                                    key={index}
                                    component={motion.li}
                                    variants={itemVariants}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        borderRadius: '20px',
                                        bgcolor: 'white',
                                        border: '1px solid rgba(0,0,0,0.03)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px) scale(1.02)',
                                            boxShadow: '0 12px 24px rgba(33, 150, 243, 0.15)',
                                            borderColor: 'rgba(33, 150, 243, 0.3)',
                                            '& .MuiAvatar-root': {
                                                transform: 'scale(1.1) rotate(-5deg)',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{
                                            width: 56,
                                            height: 56,
                                            bgcolor: `hsl(${210 + index * 30}, 80%, 96%)`,
                                            color: `hsl(${210 + index * 30}, 90%, 60%)`,
                                            fontWeight: 'bold',
                                            fontSize: '1.5rem',
                                            transition: 'transform 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            {teacher.name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ lineHeight: 1.2 }}>
                                                    {teacher.name}
                                                </Typography>
                                                <VerifiedIcon sx={{ fontSize: 16, color: '#2196F3' }} />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography component="span" variant="body2" sx={{
                                                    color: 'primary.main',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mb: 0.5
                                                }}>
                                                    {teacher.subject}
                                                </Typography>
                                                <Typography component="span" variant="caption" sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    color: 'text.secondary',
                                                    bgcolor: 'rgba(0,0,0,0.03)',
                                                    py: 0.5,
                                                    px: 1,
                                                    borderRadius: '10px',
                                                    width: 'fit-content'
                                                }}>
                                                    <SchoolIcon sx={{ fontSize: 14 }} />
                                                    {teacher.qual}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default TeacherProfilesDialog;
