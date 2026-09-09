import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Chip,
    IconButton,
    LinearProgress,
    Alert,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Send,
    Close,
    WhatsApp,
    NotificationsActive,
    Refresh
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

const MONTH_OPTIONS = [
    { index: 0, name: 'January', si: 'ජනවාරි' },
    { index: 1, name: 'February', si: 'පෙබරවාරි' },
    { index: 2, name: 'March', si: 'මාර්තු' },
    { index: 3, name: 'April', si: 'අප්‍රේල්' },
    { index: 4, name: 'May', si: 'මැයි' },
    { index: 5, name: 'June', si: 'ජූනි' },
    { index: 6, name: 'July', si: 'ජූලි' },
    { index: 7, name: 'August', si: 'අගෝස්තු' },
    { index: 8, name: 'September', si: 'සැප්තැම්බර්' },
    { index: 9, name: 'October', si: 'ඔක්තෝබර්' },
    { index: 10, name: 'November', si: 'නොවැම්බර්' },
    { index: 11, name: 'December', si: 'දෙසැම්බර්' }
];

export default function FeeRemindersDialog({ open, onClose }) {
    const currentMonthIndex = new Date().getMonth();
    const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(false);
    const [unpaidStudents, setUnpaidStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

    // Message template
    const [language, setLanguage] = useState('si');
    const [customTemplateSi, setCustomTemplateSi] = useState(
        'Eduflex සිහිකැඳවීමයි: {studentName} සිසුවාගේ {monthName} මාසය සඳහා {subjects} පන්ති ගාස්තුව (රු. {totalDue}) තවමත් ගෙවා නොමැත. කරුණාකර හැකි ඉක්මනින් ගෙවීමට කටයුතු කරන්න. ස්තූතියි!'
    );
    const [customTemplateEn, setCustomTemplateEn] = useState(
        'Eduflex Reminder: Class fee of Rs. {totalDue} for {subjects} ({monthName}) for student {studentName} is pending. Please settle at your earliest convenience. Thank you!'
    );

    // Sending state
    const [sending, setSending] = useState(false);
    const [sendSummary, setSendSummary] = useState(null);

    // Load filter options
    useEffect(() => {
        if (!open) return;
        const fetchFilters = async () => {
            try {
                const [gradesRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/students/grades`),
                    axios.get(`${API_BASE_URL}/api/subjects`)
                ]);
                setGrades(gradesRes.data || []);
                setSubjects(subjectsRes.data || []);
            } catch (err) {
                console.error('Failed to load filter data', err);
            }
        };
        fetchFilters();
    }, [open]);

    // Fetch unpaid students
    const fetchUnpaid = async () => {
        setLoading(true);
        setSendSummary(null);
        try {
            const params = new URLSearchParams({
                month: selectedMonth
            });
            if (selectedGrade) params.append('grade', selectedGrade);
            if (selectedSubject) params.append('subject', selectedSubject);

            const res = await axios.get(`${API_BASE_URL}/api/fees/unpaid?${params.toString()}`);
            const list = res.data.students || [];
            setUnpaidStudents(list);
            // Default select all
            setSelectedStudentIds(new Set(list.map(s => s._id)));
        } catch (err) {
            console.error('Failed to fetch unpaid students', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchUnpaid();
        }
    }, [open, selectedMonth, selectedGrade, selectedSubject]);

    // Handle Select All toggle
    const handleToggleSelectAll = () => {
        if (selectedStudentIds.size === unpaidStudents.length) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(unpaidStudents.map(s => s._id)));
        }
    };

    const handleToggleStudent = (id) => {
        const next = new Set(selectedStudentIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedStudentIds(next);
    };

    // Format message for a student
    const generateMessage = (student) => {
        const template = language === 'si' ? customTemplateSi : customTemplateEn;
        const monthObj = MONTH_OPTIONS.find(m => m.index === selectedMonth) || MONTH_OPTIONS[0];
        const monthText = language === 'si' ? monthObj.si : monthObj.name;
        const subjectNames = student.unpaidSubjects.map(s => s.subject).join(', ');

        return template
            .replace(/{studentName}/g, student.name)
            .replace(/{monthName}/g, monthText)
            .replace(/{subjects}/g, subjectNames)
            .replace(/{totalDue}/g, student.totalDue.toLocaleString());
    };

    // Send reminders via Hutch SIM SMS Gateway
    const handleSendReminders = async () => {
        const targets = unpaidStudents.filter(s => selectedStudentIds.has(s._id) && s.mobile);
        if (targets.length === 0) return;

        setSending(true);
        setSendProgress(10);
        setSendSummary(null);

        const reminders = targets.map(s => ({
            studentId: s._id,
            studentName: s.name,
            mobile: s.mobile,
            message: generateMessage(s)
        }));

        try {
            const res = await axios.post(`${API_BASE_URL}/api/fees/send-reminders`, { reminders });
            setSendSummary(res.data);
        } catch (err) {
            console.error('Failed to send reminders', err);
            setSendSummary({
                total: targets.length,
                sent: 0,
                failed: targets.length,
                error: err.response?.data?.error || err.message
            });
        } finally {
            setSending(false);
        }
    };

    const firstSelected = unpaidStudents.find(s => selectedStudentIds.has(s._id)) || unpaidStudents[0];
    const previewMessage = firstSelected ? generateMessage(firstSelected) : '';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsActive color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        Automated Fee Reminders (SMS)
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2 }}>
                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                label="Month"
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {MONTH_OPTIONS.map((m) => (
                                    <MenuItem key={m.index} value={m.index}>
                                        {m.name} ({m.si})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={selectedGrade}
                                label="Grade"
                                onChange={(e) => setSelectedGrade(e.target.value)}
                            >
                                <MenuItem value="">All Grades</MenuItem>
                                {grades.map(g => (
                                    <MenuItem key={g} value={g}>{g}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={selectedSubject}
                                label="Subject"
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <MenuItem value="">All Subjects</MenuItem>
                                {subjects.map(s => (
                                    <MenuItem key={s._id} value={s.name}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Progress / Status Summary */}
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {sendSummary && (
                    <Alert
                        severity={sendSummary.failed === 0 ? 'success' : 'warning'}
                        sx={{ mb: 2 }}
                    >
                        <strong>Dispatch Complete!</strong> Sent: {sendSummary.sent} / {sendSummary.total} SMS messages.
                        {sendSummary.failed > 0 && ` (${sendSummary.failed} failed - check phone gateway)`}
                    </Alert>
                )}

                {/* Count Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        Found <strong>{unpaidStudents.length}</strong> students with pending fees (Selected: {selectedStudentIds.size})
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Refresh />}
                        onClick={fetchUnpaid}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Student Table */}
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 240, mb: 2.5 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={unpaidStudents.length > 0 && selectedStudentIds.size === unpaidStudents.length}
                                        indeterminate={selectedStudentIds.size > 0 && selectedStudentIds.size < unpaidStudents.length}
                                        onChange={handleToggleSelectAll}
                                    />
                                </TableCell>
                                <TableCell><strong>Student</strong></TableCell>
                                <TableCell><strong>Grade</strong></TableCell>
                                <TableCell><strong>Mobile</strong></TableCell>
                                <TableCell><strong>Unpaid Subjects</strong></TableCell>
                                <TableCell align="right"><strong>Total Due</strong></TableCell>
                                <TableCell align="center"><strong>Direct</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {unpaidStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">
                                            {loading ? 'Searching...' : '🎉 No unpaid students found for this selection!'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                unpaidStudents.map((s) => {
                                    const isSelected = selectedStudentIds.has(s._id);
                                    return (
                                        <TableRow
                                            key={s._id}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleToggleStudent(s._id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleToggleStudent(s._id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="500">{s.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{s.indexNumber}</Typography>
                                            </TableCell>
                                            <TableCell>{s.grade}</TableCell>
                                            <TableCell>{s.mobile || 'No Mobile'}</TableCell>
                                            <TableCell>
                                                {s.unpaidSubjects.map(sub => (
                                                    <Chip
                                                        key={sub.subject}
                                                        label={`${sub.subject} (Rs.${sub.fee})`}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ mr: 0.5, mb: 0.5 }}
                                                    />
                                                ))}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="bold" color="error.main">
                                                    Rs. {s.totalDue.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                {s.mobile && (
                                                    <Tooltip title="Send via WhatsApp">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => {
                                                                const msg = encodeURIComponent(generateMessage(s));
                                                                const cleanMobile = s.mobile.replace(/[^\d]/g, '').replace(/^0/, '94');
                                                                window.open(`https://wa.me/${cleanMobile}?text=${msg}`, '_blank');
                                                            }}
                                                        >
                                                            <WhatsApp fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Message Customization */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            SMS Message Template
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                variant={language === 'si' ? 'contained' : 'outlined'}
                                onClick={() => setLanguage('si')}
                            >
                                සිංහල
                            </Button>
                            <Button
                                size="small"
                                variant={language === 'en' ? 'contained' : 'outlined'}
                                onClick={() => setLanguage('en')}
                            >
                                English
                            </Button>
                        </Stack>
                    </Box>

                    {language === 'si' ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            value={customTemplateSi}
                            onChange={(e) => setCustomTemplateSi(e.target.value)}
                            helperText="Tags: {studentName}, {monthName}, {subjects}, {totalDue}"
                        />
                    ) : (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            value={customTemplateEn}
                            onChange={(e) => setCustomTemplateEn(e.target.value)}
                            helperText="Tags: {studentName}, {monthName}, {subjects}, {totalDue}"
                        />
                    )}

                    {previewMessage && (
                        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Live Preview (for {firstSelected.name}):
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: '#166534' }}>
                                "{previewMessage}"
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button onClick={onClose} disabled={sending}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    disabled={sending || selectedStudentIds.size === 0}
                    onClick={handleSendReminders}
                >
                    {sending
                        ? `Sending (${selectedStudentIds.size})...`
                        : `Send SMS to Selected (${selectedStudentIds.size})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
