import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';

export default function ReportDialog({ open, onClose }) {
    const { t } = useTranslation();
    const [subjects, setSubjects] = useState([]);
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [month, setMonth] = useState(new Date().getMonth());

    const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    useEffect(() => {
        if (open) {
            fetchSubjects();
        }
    }, [open]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/subjects`);
            setSubjects(response.data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleGenerate = async () => {
        try {
            // Trigger download
            const response = await axios.get(`${API_BASE_URL}/api/reports/monthly`, {
                params: { grade, subject, month },
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Report_${subject}_${grade}_${t(monthKeys[month])}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            onClose();
        } catch (error) {
            console.error("Error generating report", error);
            alert("Failed to generate report. Ensure data exists.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{t('generate_report')}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <FormControl fullWidth>
                        <InputLabel>{t('add_subject').replace(' එක් කරන්න', '').replace('Add ', '')}</InputLabel>
                        <Select
                            value={subject}
                            label={t('add_subject').replace(' එක් කරන්න', '').replace('Add ', '')}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            {subjects.map((sub) => (
                                <MenuItem key={sub._id} value={sub.name}>{sub.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="report-grade-label">{t('grade')}</InputLabel>
                        <Select
                            labelId="report-grade-label"
                            value={grade}
                            label={t('grade')}
                            onChange={(e) => setGrade(e.target.value)}
                        >
                            {[...Array(13)].map((_, i) => {
                                const gradeNum = (i + 1).toString().padStart(2, '0');
                                return <MenuItem key={gradeNum} value={`Grade ${gradeNum}`}>{t('grade')} {gradeNum}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>{t('month')}</InputLabel>
                        <Select
                            value={month}
                            label={t('month')}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {monthKeys.map((m, index) => (
                                <MenuItem key={index} value={index}>{t(m)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={!subject || !grade}
                >
                    {t('download_excel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
