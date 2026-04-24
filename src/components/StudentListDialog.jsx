
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
import autoTable from 'jspdf-autotable';
import { setupPdfFont, getTranslatedMonth, formatDate } from '../utils/pdfUtils';

const StudentListDialog = ({ open, onClose, classData }) => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    if (!classData) return null;

    const { name, studentList } = classData;
    const students = studentList || [];
    const currentLang = i18n.language;

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
            link.download = `${name}-${t('student_list')}.png`;
            link.click();
        } catch (err) {
            console.error("PNG Export Error", err);
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            setupPdfFont(doc, currentLang);
            
            const dateStr = formatDate(new Date(), currentLang);
            const monthStr = getTranslatedMonth(new Date().getMonth(), t);

            // Branding / Header
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text(name, 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`${students.length} ${t('students')} | ${t('month')}: ${monthStr}`, 14, 26);
            doc.text(`${t('generated_on')}: ${dateStr}`, 14, 32);

            // Table Data Preparation
            const tableRows = filteredStudents.map(student => {
                return [
                    student.name,
                    student.indexNumber,
                    student.feePaid ? t('paid') : t('not_paid'),
                    '' // Placeholder for graphical attendance
                ];
            });

            autoTable(doc, {
                startY: 40,
                head: [[t('student_name'), t('index_number'), t('fee_status'), t('attendance_w')]],
                body: tableRows,
                theme: 'striped',
                headStyles: {
                    fillColor: [59, 130, 246], // Blue color matching theme
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold',
                    font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                },
                bodyStyles: {
                    font: currentLang === 'si' ? 'NotoSansSinhala' : 'helvetica'
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 50, halign: 'center' } // Fixed width for alignment of shapes
                },
                didParseCell: function (data) {
                    // Color code Fee Status
                    if (data.section === 'body' && data.column.index === 2) {
                        const text = data.cell.raw;
                        if (text === t('paid')) {
                            data.cell.styles.textColor = [16, 185, 129]; // Green
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [239, 68, 68]; // Red
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                },
                didDrawCell: function (data) {
                    // Draw Graphical Attendance
                    if (data.section === 'body' && data.column.index === 3) {
                        const student = filteredStudents[data.row.index];
                        if (!student) return;

                        const radius = 2.5;
                        const spacing = 10;
                        const totalWidth = 3 * spacing;
                        const startX = data.cell.x + (data.cell.width - totalWidth) / 2;
                        const startY = data.cell.y + data.cell.height / 2;

                        for (let i = 0; i < 4; i++) {
                            const status = getAttendanceStatus(student.attendance, i);
                            const x = startX + (i * spacing);

                            if (status === 'present' || status === true) {
                                doc.setFillColor(16, 185, 129); // Green background
                                doc.circle(x, startY, radius, 'F');
                                
                                // Tick mark
                                doc.setDrawColor(255, 255, 255);
                                doc.setLineWidth(0.5);
                                doc.line(x - 1, startY + 0.2, x - 0.2, startY + 1.2);
                                doc.line(x - 0.2, startY + 1.2, x + 1.2, startY - 0.8);
                            } else if (status === 'absent') {
                                doc.setFillColor(239, 68, 68); // Red background
                                doc.circle(x, startY, radius, 'F');
                                
                                // Cross mark
                                doc.setDrawColor(255, 255, 255);
                                doc.setLineWidth(0.5);
                                doc.line(x - 0.8, startY - 0.8, x + 0.8, startY + 0.8);
                                doc.line(x + 0.8, startY - 0.8, x - 0.8, startY + 0.8);
                            } else {
                                // Default/Pending: Empty gray circle
                                doc.setDrawColor(203, 213, 225); // Slate 300
                                doc.setLineWidth(0.5);
                                doc.circle(x, startY, radius, 'S');
                            }
                        }
                    }
                }
            });

            doc.save(`${name}-${t('student_list')}.pdf`);
        } catch (err) {
            console.error("PDF Generation Error", err);
            alert("Failed to generate PDF. Please try again.");
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
                    <Chip label={`${students.length} ${t('students')}`} color="primary" size="small" />
                </Box>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t('search_placeholder')}
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
                        <Typography variant="subtitle1" color="text.secondary">
                            {students.length} {t('students')} | {t('month')}: {getTranslatedMonth(new Date().getMonth(), t)}
                        </Typography>
                    </Box>

                    {filteredStudents.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">{t('no_students')}</Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('student_name')}</TableCell>
                                        <TableCell align="center">{t('fee_status')}</TableCell>
                                        <TableCell align="center">{t('attendance_month')}</TableCell>
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
                                                    label={student.feePaid ? t('paid') : t('not_paid')}
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
                    {t('download_png')}
                </Button>
                <Button onClick={handleExportPDF} variant="outlined" color="primary">
                    {t('download_pdf')}
                </Button>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentListDialog;
