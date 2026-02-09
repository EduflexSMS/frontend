
import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Box, Avatar, InputAdornment, TextField, Chip
} from '@mui/material';
import { Search, CheckCircle, Cancel, RadioButtonUnchecked } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
// Given the requirement "Show Attendance", let's use a read-only or interactive version of StatusCell if possible.
// For now, I'll implement a clean table view.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentListDialog = ({ open, onClose, classData }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    if (!classData) return null;

    const { name, studentList } = classData;
    const students = studentList || [];

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.indexNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAttendanceStatus = (attendanceArray, index) => {
        if (!attendanceArray || !attendanceArray[index]) return 'pending';
        return attendanceArray[index];
    };

    const StatusIcon = ({ status }) => {
        if (status === 'present' || status === true) return <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />;
        if (status === 'absent') return <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />;
        return <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 20 }} />;
    };

    const handleExportPNG = async () => {
        const element = document.getElementById('student-list-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('student-list-content');
                    const header = clonedElement.querySelector('.export-header');
                    if (header) header.style.display = 'block';

                    const tableContainer = clonedElement.querySelector('.MuiTableContainer-root');
                    if (tableContainer) {
                        tableContainer.style.maxHeight = 'none';
                        tableContainer.style.overflow = 'visible';
                    }
                }
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${name}-StudentList.png`;
            link.click();
        } catch (err) {
            console.error("PNG Export Error", err);
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('student-list-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('student-list-content');
                    const header = clonedElement.querySelector('.export-header');
                    if (header) header.style.display = 'block';

                    const tableContainer = clonedElement.querySelector('.MuiTableContainer-root');
                    if (tableContainer) {
                        tableContainer.style.maxHeight = 'none';
                        tableContainer.style.overflow = 'visible';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${name}-StudentList.pdf`);
        } catch (err) {
            console.error("PDF Export Error", err);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4 }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5">{name}</Typography>
                    <Chip label={`${students.length} Students`} color="primary" size="small" />
                </Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or index..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                    }}
                />
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box id="student-list-content" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    {/* Hidden Header for Export */}
                    <Box className="export-header" sx={{ display: 'none', mb: 2, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">{name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{students.length} Students | Month: {new Date().toLocaleString('default', { month: 'long' })}</Typography>
                    </Box>

                    {filteredStudents.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No students found.</Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student</TableCell>
                                        <TableCell align="center">Fee Status</TableCell>
                                        <TableCell align="center">Attendance (This Month)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: 14 }}>
                                                        {student.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="600">
                                                            {student.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {student.indexNumber}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={student.feePaid ? "Paid" : "Not Paid"}
                                                    color={student.feePaid ? "success" : "error"}
                                                    size="small"
                                                    variant={student.feePaid ? "filled" : "outlined"}
                                                    sx={{ minWidth: 80, fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    {[0, 1, 2, 3].map(weekRef => (
                                                        <Box key={weekRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>W{weekRef + 1}</Typography>
                                                            <StatusIcon status={getAttendanceStatus(student.attendance, weekRef)} />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleExportPNG} variant="outlined" color="secondary">
                    Download PNG
                </Button>
                <Button onClick={handleExportPDF} variant="outlined" color="primary">
                    Download PDF
                </Button>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentListDialog;
