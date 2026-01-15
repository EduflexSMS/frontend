import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import StatusCell from './StatusCell';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper to get class day based on student grade
const getClassDayInfo = (subject, studentGrade) => {
    if (subject && subject.gradeSchedules && subject.gradeSchedules.length > 0) {
        const schedule = subject.gradeSchedules.find(s => s.grade === studentGrade);
        if (schedule) return { day: schedule.day, startDate: schedule.startDate };
    }
    return { day: subject ? (subject.classDay || 'Monday') : 'Monday', startDate: null };
};

const getDaysInMonth = (monthIndex, year, dayInfo) => {
    const { day: dayName, startDate } = dayInfo || { day: 'Monday', startDate: null };
    const dates = [];
    const date = new Date(year, monthIndex, 1);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Normalize Start Date (ignore time)
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);

    while (date.getMonth() === monthIndex) {
        if (days[date.getDay()] === dayName) {
            // Check if date is on or after start date
            const currentDate = new Date(date);
            currentDate.setHours(0, 0, 0, 0);

            if (!start || currentDate >= start) {
                dates.push(new Date(date));
            }
        }
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

const SubjectGrid = ({ studentId, studentGrade, enrollments, onUpdate, subjectColorMap, isMobile }) => {
    const currentYear = new Date().getFullYear();

    return (
        <Box sx={{ p: isMobile ? 0 : 2 }}>
            {enrollments.map((enrollment) => {
                const subjectData = subjectColorMap ? subjectColorMap[enrollment.subject] : null;
                const color = subjectData ? subjectData.color : '#f5f5f5';

                return (
                    <Paper
                        key={enrollment.subject}
                        sx={{
                            mb: 2,
                            p: isMobile ? 1.5 : 2,
                            backgroundColor: color || '#f5f5f5',
                            borderRadius: 3
                        }}
                        elevation={1}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 600 }}>
                            {enrollment.subject}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            pb: 1, // Padding for scrollbar
                            gap: 1,
                            scrollbarWidth: 'thin', /* Firefox */
                            '&::-webkit-scrollbar': { height: '6px' },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '3px' }
                        }}>
                            {enrollment.monthlyRecords.map((record) => {
                                const slots = Array.from({ length: 5 });

                                return (
                                    <Box
                                        key={record.monthIndex}
                                        sx={{
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            minWidth: 160, // Increased slightly to fit 5 icons comfortably
                                            p: 1.5,
                                            textAlign: 'center',
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            flexShrink: 0 // Prevent shrinking
                                        }}
                                    >
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569' }}>
                                            {months[record.monthIndex]}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
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

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
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

