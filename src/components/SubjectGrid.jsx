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

const SubjectGrid = ({ studentId, studentGrade, enrollments, onUpdate, subjectColorMap }) => {
    const currentYear = new Date().getFullYear(); // Or make this selectable

    return (
        <Box sx={{ p: 2 }}>
            {enrollments.map((enrollment) => {
                const subjectData = subjectColorMap ? subjectColorMap[enrollment.subject] : null;
                const color = subjectData ? subjectData.color : '#f5f5f5';

                // Need to get student grade. In SubjectGrid we only have studentId.
                // However, the student object is what contains the enrollments. 
                // We are iterating enrollments of *a* student. 
                // But we don't have the student's grade passed into SubjectGrid explicitly, or do we?
                // Let's check props. currently: ({ studentId, enrollments, onUpdate, subjectColorMap })
                // We likely need to pass the student's grade from the parent component.

                // Assuming we update the parent to pass 'studentGrade'.
                // If not available yet, we need to add it.
                // For now, let's look at how we can get it.
                // Wait, ViewStudents passes props. Let's check ViewStudents.jsx.

                // I will add 'studentGrade' prop to SubjectGrid.

                const { day: classDay, startDate } = getClassDayInfo(subjectData, studentGrade);

                return (
                    <Paper
                        key={enrollment.subject}
                        sx={{
                            mb: 2,
                            p: 2,
                            backgroundColor: color || '#f5f5f5'
                        }}
                        elevation={1}
                    >
                        <Typography variant="h6" gutterBottom>
                            {enrollment.subject}
                            {/* {classDay && <Typography component="span" variant="caption" sx={{ ml: 2, bgcolor: 'rgba(0,0,0,0.1)', px: 1, borderRadius: 1 }}>{classDay}</Typography>} */}
                        </Typography>
                        <Box sx={{ display: 'flex', overflowX: 'auto' }}>
                            {enrollment.monthlyRecords.map((record) => {
                                // User requested 5 simple circles without dates.
                                const slots = Array.from({ length: 5 });

                                return (
                                    <Box
                                        key={record.monthIndex}
                                        sx={{
                                            border: '1px solid #ccc',
                                            minWidth: 140,
                                            p: 1,
                                            textAlign: 'center',
                                            mr: 1,
                                            bgcolor: 'white',
                                            borderRadius: 1
                                        }}
                                    >
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {months[record.monthIndex]}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
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

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
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

