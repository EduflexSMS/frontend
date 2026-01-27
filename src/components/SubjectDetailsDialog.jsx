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

export default function SubjectDetailsDialog({ open, onClose, subjectName }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subjectFee, setSubjectFee] = useState(0);
    const [editingFee, setEditingFee] = useState(false);
    const [newFee, setNewFee] = useState(0);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`${subjectName} - Grade Breakdown`, 14, 20);
            doc.setFontSize(12);
            doc.text(`Month: ${months[selectedMonth]}`, 14, 28);
            doc.text(`Fee: ${subjectFee}`, 14, 34);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

            autoTable(doc, {
                startY: 50,
                head: [['Grade', 'Total Students', `Paid Count (${months[selectedMonth]})`, 'Collected Amount']],
                body: details.map(row => [
                    row.grade,
                    row.totalStudents,
                    row.paidStudents,
                    `LKR ${(row.paidStudents * subjectFee).toLocaleString()}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [66, 133, 244] },
                columnStyles: { 3: { halign: 'right' } }
            });
            doc.save(`${subjectName}_Report.pdf`);
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
            setError("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectInfo = async () => {
        try {
            // Need a way to get subject info specifically (fee). 
            // The existing getAllSubjects returns all, maybe we can filter or use a new endpoint.
            // For now, let's fetch all and find ours. Not efficient but works for now.
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

    const handleSaveFee = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subjectName)}`, { fee: newFee });
            setSubjectFee(newFee);
            setEditingFee(false);
        } catch (err) {
            console.error("Error updating fee", err);
            alert("Failed to update fee");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {subjectName} - Grade Breakdown
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1">Fee: <strong>{editingFee ? '' : `LKR ${subjectFee.toLocaleString()}`}</strong></Typography>
                        {editingFee ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(e.target.value)}
                                    style={{ width: '80px', padding: '5px' }}
                                />
                                <Button size="small" variant="contained" onClick={handleSaveFee}>Save</Button>
                                <Button size="small" onClick={() => setEditingFee(false)}>Cancel</Button>
                            </Box>
                        ) : (
                            <Button size="small" onClick={() => setEditingFee(true)}>Edit Fee</Button>
                        )}
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={selectedMonth}
                            label="Month"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((month, index) => (
                                <MenuItem key={index} value={index}>{month}</MenuItem>
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
                    <Typography align="center" color="text.secondary">No students enrolled yet.</Typography>
                ) : (
                    <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Students</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Paid Count ({months[selectedMonth]})</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Collected Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.map((row) => (
                                    <TableRow key={row.grade}>
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
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDownloadPDF} variant="contained" color="primary" disabled={details.length === 0}>
                    Download PDF
                </Button>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
