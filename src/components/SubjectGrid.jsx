import React from 'react';
import { Box, Typography, Paper, alpha } from '@mui/material';
import StatusCell from './StatusCell';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];





const SubjectGrid = ({ studentId, studentGrade, enrollments, onUpdate, subjectColorMap, isMobile }) => {


    return (
        <Box sx={{ p: isMobile ? 0 : 2 }}>
            {enrollments.map((enrollment) => {
                const subjectData = subjectColorMap ? subjectColorMap[enrollment.subject] : null;
                const color = subjectData ? subjectData.color : '#ffffff';

                return (
                    <Paper
                        key={enrollment.subject}
                        sx={{
                            mb: 2,
                            p: isMobile ? 1.5 : 2,
                            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha('black', 0.6)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            border: `1px solid ${alpha(color, 0.3)}`,
                            boxShadow: `0 8px 32px 0 ${alpha('black', 0.5)}`
                        }}
                        elevation={0}
                    >
                        <Typography variant="h6" gutterBottom sx={{
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            fontWeight: 700,
                            color: color,
                            textShadow: `0 0 20px ${alpha(color, 0.5)}`,
                            mb: 2,
                            display: 'flex', alignItems: 'center', gap: 1
                        }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 10px ${color}` }} />
                            {enrollment.subject}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            pb: 2, // Padding for scrollbar
                            gap: 2,
                            scrollbarWidth: 'thin', /* Firefox */
                            '&::-webkit-scrollbar': { height: '6px' },
                            '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.02)' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(color, 0.3), borderRadius: '3px' }
                        }}>
                            {enrollment.monthlyRecords.map((record) => {
                                const slots = Array.from({ length: 5 });

                                return (
                                    <Box
                                        key={record.monthIndex}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            minWidth: 160,
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: 'rgba(0,0,0,0.6)', // Deep Void Card
                                            borderRadius: 3,
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: alpha(color, 0.5),
                                                transform: 'translateY(-2px)',
                                                bgcolor: 'rgba(0,0,0,0.8)'
                                            }
                                        }}
                                    >
                                        <Typography variant="caption" display="block" sx={{
                                            fontWeight: '800',
                                            mb: 2,
                                            textTransform: 'uppercase',
                                            letterSpacing: 2,
                                            color: '#94a3b8'
                                        }}>
                                            {months[record.monthIndex]}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
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

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.03)', p: 1, borderRadius: '12px' }}>
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

