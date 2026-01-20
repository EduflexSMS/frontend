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
import { Close as CloseIcon, School as SchoolIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const teachers = [
    { subject: 'Mathematics', name: 'Keshara Rathnayaka', qual: 'Software Engineering(Hons)' },
    { subject: 'Science', name: 'Yasiru Hasaranga', qual: 'National Diploma in Teaching(Science)' },
    { subject: 'English', name: 'Malith Jayawardhana', qual: 'Diploma in English' },
    { subject: 'ICT', name: 'Nilushka Purnima', qual: 'Software Engineering(Hons)' },
    { subject: 'Business and Accounting Studies', name: 'Danushpa C Rajapaksha', qual: 'Bsc Business Managemenet SP' },
    { subject: 'Scholarships Grade 03-05', name: 'Rawindra Sirimanne', qual: 'Government National School Teacher' },
];

const TeacherProfilesDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                component: motion.div,
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.3 },
                style: { borderRadius: fullScreen ? 0 : 24, padding: 10 }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Teacher Profiles
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ border: 'none' }}>
                <List sx={{ width: '100%' }}>
                    {teachers.map((teacher, index) => (
                        <ListItem
                            key={index}
                            component={motion.div}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            sx={{
                                mb: 2,
                                borderRadius: '16px',
                                bgcolor: 'background.paper',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                                    {teacher.name.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <React.Fragment>
                                        <Typography component="span" variant="subtitle2" color="primary" fontWeight="bold">
                                            {teacher.subject}
                                        </Typography>
                                        <Typography variant="h6" fontWeight="600" color="text.primary">
                                            {teacher.name}
                                        </Typography>
                                    </React.Fragment>
                                }
                                secondary={
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <SchoolIcon fontSize="small" sx={{ fontSize: 16 }} />
                                        {teacher.qual}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default TeacherProfilesDialog;
