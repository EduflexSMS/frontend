import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Typography, Box, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StudentListDialog from './StudentListDialog';
import { useTranslation } from 'react-i18next';
import { setupPdfFont, getTranslatedMonth, formatDate } from '../utils/pdfUtils';

export default function SubjectDetailsDialog({ open, onClose, subjectName }) {
    const { t, i18n } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subjectFee, setSubjectFee] = useState(0);
    const [editingFee, setEditingFee] = useState(false);
    const [newFee, setNewFee] = useState(0);
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
            const { data } = await axios.get(`${API_BASE_URL}/api/subjects`);
            const sub = data.find(s => s.name === subjectName);
            if (sub) {
                setSubjectFee(sub.fee || 0);
                setNewFee(sub.fee || 0);
            }
        } catch (err) {
            console.error("Error fetching subject info", err);
        }
    }

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
            await axios.put(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`, { fee: newFee });
            setSubjectFee(newFee);
            setEditingFee(false);
        } catch (err) {
            console.error("Error updating fee", err);
            alert(t('failed_to_update'));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {subjectName} - {t('grade_breakdown')}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">{t('fee')}: <strong>{editingFee ? '' : `LKR ${subjectFee.toLocaleString()}`}</strong></Typography>
                        {editingFee ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(e.target.value)}
                                    style={{ width: '80px', padding: '5px' }}
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
                {loading ? (
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
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDownloadPDF} variant="contained" color="primary" disabled={details.length === 0}>
                    {t('download_pdf')}
                </Button>
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
