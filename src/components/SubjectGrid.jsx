import React from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import StatusCell from './StatusCell';
import { motion } from 'framer-motion';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SubjectGrid = ({ studentId, studentGrade, enrollments, onUpdate, subjectColorMap, isMobile }) => {
    const theme = useTheme();

    return (
        <Box sx={{ p: isMobile ? 0 : 1 }}>
            {enrollments.map((enrollment, index) => {
                const subjectData = subjectColorMap ? subjectColorMap[enrollment.subject] : null;
                const color = subjectData ? subjectData.color : '#ffffff';

                return (
                    <Paper
                        key={enrollment.subject}
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        sx={{
                            mb: 3,
                            p: isMobile ? 2 : 3,
                            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha('#050510', 0.8)} 100%)`,
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: `1px solid ${alpha(color, 0.2)}`,
                            boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.5)}`,
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                        elevation={0}
                    >
                        {/* Decorative Glow */}
                        <Box sx={{
                            position: 'absolute', top: -50, right: -50, width: 150, height: 150,
                            background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
                            borderRadius: '50%', pointerEvents: 'none'
                        }} />

                        <Typography variant="h6" gutterBottom sx={{
                            fontSize: isMobile ? '1.1rem' : '1.3rem',
                            fontWeight: 700,
                            color: color,
                            textShadow: `0 0 20px ${alpha(color, 0.5)}`,
                            mb: 3,
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            pl: 1
                        }}>
                            <Box component={motion.div}
                                animate={{ boxShadow: [`0 0 10px ${color}`, `0 0 20px ${color}`, `0 0 10px ${color}`] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }}
                            />
                            {enrollment.subject}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            pb: 2,
                            gap: 2,
                            scrollbarWidth: 'thin',
                            '&::-webkit-scrollbar': { height: '8px' },
                            '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.02)', borderRadius: '4px' },
                            '&::-webkit-scrollbar-thumb': {
                                background: `linear-gradient(90deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.5)} 100%)`,
                                borderRadius: '4px',
                                border: '2px solid rgba(0,0,0,0)' // creates padding around thumb
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: `linear-gradient(90deg, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.8)} 100%)`,
                            }
                        }}>
                            {enrollment.monthlyRecords.map((record, rIndex) => {
                                const slots = Array.from({ length: 5 });

                                return (
                                    <Box
                                        key={record.monthIndex}
                                        component={motion.div}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 + (rIndex * 0.05) }}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'rgba(255,255,255,0.08)',
                                            minWidth: 170,
                                            p: 2.5,
                                            textAlign: 'center',
                                            bgcolor: 'rgba(255,255,255,0.015)',
                                            borderRadius: '20px',
                                            flexShrink: 0,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: alpha(color, 0.4),
                                                transform: 'translateY(-4px)',
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                boxShadow: `0 10px 20px -5px ${alpha(color, 0.15)}`
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" display="block" sx={{
                                            fontWeight: '800',
                                            mb: 2,
                                            textTransform: 'uppercase',
                                            letterSpacing: 3,
                                            color: 'text.secondary',
                                            fontSize: '0.75rem'
                                        }}>
                                            {months[record.monthIndex]}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2.5 }}>
                                            <StatusCell
                                                studentId={studentId}
                                                subject={enrollment.subject}
                                                monthIndex={record.monthIndex}
                                                type="fee"
                                                initialStatus={record.feePaid}
                                                onUpdate={onUpdate}
                                            />
                                            <StatusCell
                                                studentId={studentId}
                                                subject={enrollment.subject}
                                                monthIndex={record.monthIndex}
                                                type="tute"
                                                initialStatus={record.tutesGiven}
                                                onUpdate={onUpdate}
                                            />
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: 0.5,
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            p: 1.5,
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.02)'
                                        }}>
                                            {slots.map((_, idx) => {
                                                return (
                                                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <StatusCell
                                                            studentId={studentId}
                                                            subject={enrollment.subject}
                                                            monthIndex={record.monthIndex}
                                                            weekIndex={idx}
                                                            type="attendance"
                                                            initialStatus={record.attendance[idx] || false}
                                                            onUpdate={onUpdate}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};

export default SubjectGrid;

