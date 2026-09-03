import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Typography, Box, Chip, FormControl, InputLabel, Select, MenuItem,
    TextField, Grid, Tooltip, IconButton
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StudentListDialog from './StudentListDialog';
import { useTranslation } from 'react-i18next';
import { setupPdfFont, getTranslatedMonth, formatDate } from '../utils/pdfUtils';

const COLOR_PRESETS = [
    '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b',
    '#ec4899', '#ff5c7c', '#6366f1', '#14b8a6'
];

export default function SubjectDetailsDialog({ open, onClose, subjectName, onUpdate }) {
    const { t, i18n } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subjectFee, setSubjectFee] = useState(0);
    const [subjectFeeType, setSubjectFeeType] = useState('monthly');
    const [subjectClassDaysCount, setSubjectClassDaysCount] = useState(5);
    const [editingFee, setEditingFee] = useState(false);
    const [newFee, setNewFee] = useState(0);
    const [newFeeType, setNewFeeType] = useState('monthly');
    const [newClassDaysCount, setNewClassDaysCount] = useState(5);
    const [showScheduleEditor, setShowScheduleEditor] = useState(false);
    const [showEditSubject, setShowEditSubject] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [allGrades, setAllGrades] = useState([]);
    const [newSchGrade, setNewSchGrade] = useState('');
    const [newSchDay, setNewSchDay] = useState('');
    const [newSchStartTime, setNewSchStartTime] = useState('');
    const [newSchEndTime, setNewSchEndTime] = useState('');
    const [newSchStartDate, setNewSchStartDate] = useState('');

    // Full edit states
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editColor, setEditColor] = useState('#0ea5e9');
    const [editTeacherName, setEditTeacherName] = useState('');
    const [teachersList, setTeachersList] = useState([]);
    const [savingSubject, setSavingSubject] = useState(false);
    const currentLang = i18n.language;

    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();
            setupPdfFont(doc, currentLang);

            const dateStr = formatDate(new Date(), currentLang);
            const monthStr = getTranslatedMonth(selectedMonth, t);

            doc.setFontSize(18);
            doc.text(`${subjectName} - ${t('grade_breakdown')}`, 14, 20);
            
            doc.setFontSize(12);
            doc.text(`${t('month')}: ${monthStr}`, 14, 28);
            doc.text(`${t('fee')}: LKR ${subjectFee.toLocaleString()}`, 14, 34);
            
            doc.setFontSize(10);
            doc.text(`${t('generated_on')}: ${dateStr}`, 14, 40);

            const totalStudents = details.reduce((sum, row) => sum + (row.totalStudents || 0), 0);
            const totalPaid = details.reduce((sum, row) => sum + (row.paidStudents || 0), 0);
            const totalCollected = totalPaid * subjectFee;

            autoTable(doc, {
                startY: 50,
                head: [[t('grade'), t('total_students'), `${t('paid_count')} (${monthStr})`, t('collected_amount')]],
                body: details.map(row => [
                    row.grade,
                    row.totalStudents,
                    row.paidStudents,
                    `LKR ${(row.paidStudents * subjectFee).toLocaleString()}`
                ]),
                foot: [[t('total'), totalStudents, totalPaid, `LKR ${totalCollected.toLocaleString()}`]],
                theme: 'striped',
                headStyles: { 
                    fillColor: [66, 133, 244],
                    font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                },
                bodyStyles: {
                    font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                },
                footStyles: { 
                    fillColor: [40, 44, 52], 
                    fontStyle: 'bold',
                    font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                },
                columnStyles: { 3: { halign: 'right' } }
            });

            // Add Payment Summary Box
            const finalY = doc.lastAutoTable.finalY || 50;
            const instituteShare = totalCollected * 0.20;
            const netPayable = totalCollected * 0.80;

            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(14, finalY + 15, 182, 45, 3, 3, 'FD');

            doc.setFontSize(14);
            doc.setTextColor(33, 37, 41);
            doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
            doc.text(t('payment_summary'), 20, finalY + 25);

            doc.setFontSize(11);
            doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
            doc.text(`${t('total_collected')}:`, 20, finalY + 35);
            doc.text(`LKR ${totalCollected.toLocaleString()}`, 190, finalY + 35, { align: 'right' });

            doc.text(`${t('institute_share')}:`, 20, finalY + 42);
            doc.text(`- LKR ${instituteShare.toLocaleString()}`, 190, finalY + 42, { align: 'right' });

            // Draw a line
            doc.setDrawColor(200, 200, 200);
            doc.line(20, finalY + 46, 190, finalY + 46);

            doc.setFontSize(13);
            doc.setFont(currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
            doc.setTextColor(40, 167, 69); // Success Green
            doc.text(`${t('amount_to_pay')}:`, 20, finalY + 54);
            doc.text(`LKR ${netPayable.toLocaleString()}`, 190, finalY + 54, { align: 'right' });

            doc.save(`${subjectName}_${t('grade_breakdown')}.pdf`);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert(`Failed to generate PDF: ${err.message}`);
        }
    };

    useEffect(() => {
        if (open && subjectName) {
            fetchDetails();
            fetchSubjectInfo();
        }
    }, [open, subjectName, selectedMonth]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/subject/${encodeURIComponent(subjectName)}`, {
                params: { month: selectedMonth }
            });
            setDetails(response.data);
        } catch (err) {
            console.error("Error fetching subject details:", err);
            setError(t('failed_to_load'));
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectInfo = async () => {
        try {
            const [subRes, teachersRes, gradesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/subjects`),
                axios.get(`${API_BASE_URL}/api/auth/teachers`),
                axios.get(`${API_BASE_URL}/api/students/grades`)
            ]);
            const sub = subRes.data.find(s => s.name === subjectName);
            if (sub) {
                setSubjectFee(sub.fee || 0);
                setNewFee(sub.fee || 0);
                setSubjectFeeType(sub.feeType || 'monthly');
                setNewFeeType(sub.feeType || 'monthly');
                setSubjectClassDaysCount(sub.classDaysCount || 5);
                setNewClassDaysCount(sub.classDaysCount || 5);
                setSchedules(sub.gradeSchedules || []);

                setEditName(sub.name);
                setEditDescription(sub.description || '');
                setEditColor(sub.color || '#0ea5e9');
            }

            const tList = teachersRes.data || [];
            setTeachersList(tList);
            const assignedT = tList.find(t => t.assignedSubject === subjectName);
            setEditTeacherName(assignedT ? assignedT.username : '');
            setAllGrades(gradesRes.data || []);
        } catch (err) {
            console.error("Error fetching subject info", err);
        }
    };

    const handleSaveFullSubject = async () => {
        if (!editName.trim()) return alert("Subject name is required");
        setSavingSubject(true);
        try {
            await axios.put(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`, {
                name: editName.trim(),
                description: editDescription,
                color: editColor,
                fee: newFee,
                feeType: newFeeType,
                classDaysCount: newClassDaysCount,
                teacherName: editTeacherName
            });
            alert("Subject updated successfully!");
            setShowEditSubject(false);
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error("Error updating subject", err);
            alert(err.response?.data?.message || "Failed to update subject");
        } finally {
            setSavingSubject(false);
        }
    };

    const handleDeleteSubject = async () => {
        if (!window.confirm(`Are you sure you want to permanently delete "${subjectName}"? This will unlink teachers and remove enrollments.`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`);
            alert("Subject deleted successfully!");
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error("Error deleting subject", err);
            alert(err.response?.data?.message || "Failed to delete subject");
        }
    };

    const [studentListOpen, setStudentListOpen] = useState(false);
    const [selectedGradeData, setSelectedGradeData] = useState(null);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    const handleGradeClick = async (grade) => {
        try {
            setFetchingStudents(true);
            const { data: report } = await axios.get(`${API_BASE_URL}/api/reports/class-report`, {
                params: {
                    subject: subjectName,
                    grade: grade,
                    month: selectedMonth
                }
            });

            setSelectedGradeData({
                name: `${subjectName} - ${grade}`,
                studentList: report
            });
            setStudentListOpen(true);
        } catch (err) {
            console.error("Failed to fetch student list", err);
            alert(t('failed_to_load_students'));
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleSaveFee = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`, { 
                fee: newFee,
                feeType: newFeeType,
                classDaysCount: newClassDaysCount
            });
            setSubjectFee(newFee);
            setSubjectFeeType(newFeeType);
            setSubjectClassDaysCount(newClassDaysCount);
            setEditingFee(false);
            fetchDetails();
        } catch (err) {
            console.error("Error updating fee", err);
            alert(t('failed_to_update'));
        }
    };

    const handleSaveSchedules = async (updatedSchedules) => {
        try {
            await axios.put(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`, { 
                gradeSchedules: updatedSchedules 
            });
            setSchedules(updatedSchedules);
            fetchDetails();
        } catch (err) {
            console.error("Error saving schedules", err);
            alert("Failed to save schedules.");
        }
    };

    const handleDeleteSchedule = (indexToDelete) => {
        const updated = schedules.filter((_, idx) => idx !== indexToDelete);
        handleSaveSchedules(updated);
    };

    const handleAddSchedule = () => {
        if (!newSchGrade || !newSchDay) {
            alert("Please select Grade and Day");
            return;
        }
        const newEntry = {
            grade: newSchGrade,
            day: newSchDay,
            startTime: newSchStartTime || '',
            endTime: newSchEndTime || '',
            startDate: newSchStartDate ? new Date(newSchStartDate).toISOString().split('T')[0] : null
        };
        const updated = [...schedules, newEntry];
        handleSaveSchedules(updated);

        // Reset form
        setNewSchGrade('');
        setNewSchDay('');
        setNewSchStartTime('');
        setNewSchEndTime('');
        setNewSchStartDate('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <span>{subjectName}</span>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        size="small" 
                        variant={showEditSubject ? "contained" : "outlined"} 
                        color="primary"
                        onClick={() => {
                            setShowEditSubject(!showEditSubject);
                            setShowScheduleEditor(false);
                        }}
                    >
                        {showEditSubject ? "View Stats" : "✏️ Edit Subject"}
                    </Button>
                    <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={handleDeleteSubject}
                    >
                        🗑 Delete
                    </Button>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {showEditSubject ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                            Edit Subject Details
                        </Typography>

                        <TextField
                            fullWidth
                            label="Subject Name"
                            size="small"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Description (Optional)"
                            size="small"
                            multiline
                            rows={2}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ flex: 1, minWidth: 140 }}>
                                <InputLabel id="edit-feetype-label">Fee Type</InputLabel>
                                <Select
                                    labelId="edit-feetype-label"
                                    value={newFeeType}
                                    label="Fee Type"
                                    onChange={(e) => setNewFeeType(e.target.value)}
                                >
                                    <MenuItem value="monthly">Monthly Fee</MenuItem>
                                    <MenuItem value="daily">Day Fee</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Fee Amount (LKR)"
                                type="number"
                                size="small"
                                sx={{ flex: 1, minWidth: 140 }}
                                value={newFee}
                                onChange={(e) => setNewFee(parseFloat(e.target.value) || 0)}
                            />

                            <TextField
                                label="Monthly Sessions (Days)"
                                type="number"
                                size="small"
                                sx={{ flex: 1, minWidth: 140 }}
                                value={newClassDaysCount}
                                onChange={(e) => setNewClassDaysCount(parseInt(e.target.value) || 5)}
                            />
                        </Box>

                        <FormControl fullWidth size="small">
                            <InputLabel id="edit-teacher-label">Assigned Teacher</InputLabel>
                            <Select
                                labelId="edit-teacher-label"
                                value={editTeacherName}
                                label="Assigned Teacher"
                                onChange={(e) => setEditTeacherName(e.target.value)}
                            >
                                <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                                {teachersList.map((t) => (
                                    <MenuItem key={t._id} value={t.username}>{t.username}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                                Theme Color
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                {COLOR_PRESETS.map((c) => (
                                    <Box
                                        key={c}
                                        onClick={() => setEditColor(c)}
                                        sx={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            bgcolor: c, cursor: 'pointer',
                                            border: editColor === c ? '3px solid #fff' : '2px solid transparent',
                                            boxShadow: editColor === c ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                                            transition: 'transform 0.15s ease',
                                            '&:hover': { transform: 'scale(1.15)' }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSaveFullSubject}
                                disabled={savingSubject}
                                sx={{ flex: 1 }}
                            >
                                {savingSubject ? "Saving..." : "Save Subject"}
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => setShowEditSubject(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">
                            {t('fee')}: <strong>{editingFee ? '' : `LKR ${subjectFee.toLocaleString()} (${subjectFeeType === 'daily' ? `Day Fee (${subjectClassDaysCount} days)` : 'Monthly Fee'})`}</strong>
                        </Typography>
                        {editingFee ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(parseFloat(e.target.value) || 0)}
                                    title="Fee Amount"
                                    style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <select
                                    value={newFeeType}
                                    onChange={(e) => setNewFeeType(e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="monthly">Monthly Fee</option>
                                    <option value="daily">Day Fee</option>
                                </select>
                                <input
                                    type="number"
                                    value={newClassDaysCount}
                                    onChange={(e) => setNewClassDaysCount(parseInt(e.target.value) || 5)}
                                    placeholder="Days"
                                    title="Class Days Count"
                                    style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <Button size="small" variant="contained" onClick={handleSaveFee}>{t('save')}</Button>
                                <Button size="small" onClick={() => setEditingFee(false)}>{t('cancel')}</Button>
                            </Box>
                        ) : (
                            <Button size="small" onClick={() => setEditingFee(true)}>{t('edit_fee')}</Button>
                        )}
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{t('month')}</InputLabel>
                        <Select
                            value={selectedMonth}
                            label={t('month')}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {monthNames.map((m, index) => (
                                <MenuItem key={index} value={index}>{t(m)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {showScheduleEditor ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                            Configure Grade Schedules & Associations
                        </Typography>

                        {/* List of current schedules */}
                        {schedules.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No grade schedules assigned. This subject will show up for ALL grades.
                            </Typography>
                        ) : (
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {schedules.map((sch, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{sch.grade}</TableCell>
                                                <TableCell>{sch.day}</TableCell>
                                                <TableCell>{sch.startTime && sch.endTime ? `${sch.startTime} - ${sch.endTime}` : (sch.startTime || sch.endTime || 'Not specified')}</TableCell>
                                                <TableCell>{sch.startDate ? new Date(sch.startDate).toLocaleDateString() : 'Not specified'}</TableCell>
                                                <TableCell align="center">
                                                    <Button 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => handleDeleteSchedule(index)}
                                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Form to add a new schedule */}
                        <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                Add New Grade Schedule / Association
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <FormControl size="small" sx={{ minWidth: 150, flex: '1 1 150px' }}>
                                    <InputLabel id="sch-grade-label">Grade</InputLabel>
                                    <Select
                                        labelId="sch-grade-label"
                                        value={newSchGrade}
                                        label="Grade"
                                        onChange={(e) => setNewSchGrade(e.target.value)}
                                    >
                                        {allGrades.map((g) => (
                                            <MenuItem key={g} value={g}>{g}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 120, flex: '1 1 120px' }}>
                                    <InputLabel id="sch-day-label">Day</InputLabel>
                                    <Select
                                        labelId="sch-day-label"
                                        value={newSchDay}
                                        label="Day"
                                        onChange={(e) => setNewSchDay(e.target.value)}
                                    >
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                                            <MenuItem key={d} value={d}>{d}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <input
                                    type="text"
                                    placeholder="Start Time (e.g. 8:00 AM)"
                                    value={newSchStartTime}
                                    onChange={(e) => setNewSchStartTime(e.target.value)}
                                    style={{ flex: 1, padding: '8.5px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'inherit' }}
                                />
                                <input
                                    type="text"
                                    placeholder="End Time (e.g. 10:00 AM)"
                                    value={newSchEndTime}
                                    onChange={(e) => setNewSchEndTime(e.target.value)}
                                    style={{ flex: 1, padding: '8.5px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'inherit' }}
                                />
                                <input
                                    type="date"
                                    placeholder="Start Date"
                                    value={newSchStartDate}
                                    onChange={(e) => setNewSchStartDate(e.target.value)}
                                    title="Start Date"
                                    style={{ flex: 1, padding: '8.5px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'inherit' }}
                                />
                            </Box>

                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={handleAddSchedule}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                Add Schedule
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error" align="center">{error}</Typography>
                    ) : details.length === 0 ? (
                        <Typography align="center" color="text.secondary">{t('no_students')}</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('grade')}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t('total_students')}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t('paid_count')} ({t(monthNames[selectedMonth])})</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('collected_amount')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {details.map((row) => (
                                        <TableRow
                                            key={row.grade}
                                            hover
                                            onClick={() => handleGradeClick(row.grade)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.grade}
                                            </TableCell>
                                            <TableCell align="center">{row.totalStudents}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.paidStudents}
                                                    size="small"
                                                    color={row.paidStudents > 0 ? "success" : "default"}
                                                    variant={row.paidStudents > 0 ? "filled" : "outlined"}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                LKR {(row.paidStudents * subjectFee).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('total')}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                            {details.reduce((sum, row) => sum + (row.totalStudents || 0), 0)}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                            {details.reduce((sum, row) => sum + (row.paidStudents || 0), 0)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                            LKR {(details.reduce((sum, row) => sum + (row.paidStudents || 0), 0) * subjectFee).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                {!showEditSubject && (
                    <>
                        <Button onClick={() => setShowScheduleEditor(!showScheduleEditor)} variant="outlined" color="secondary">
                            {showScheduleEditor ? "Show Student Stats" : "Manage Grade Associations"}
                        </Button>
                        <Button onClick={handleDownloadPDF} variant="contained" color="primary" disabled={details.length === 0 || showScheduleEditor}>
                            {t('download_pdf')}
                        </Button>
                    </>
                )}
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>

            <StudentListDialog
                open={studentListOpen}
                onClose={() => setStudentListOpen(false)}
                classData={selectedGradeData}
            />
        </Dialog>
    );
}
