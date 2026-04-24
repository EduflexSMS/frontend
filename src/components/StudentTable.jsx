import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Grid, Chip, Avatar, Tooltip, alpha
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, Delete, OpenInNew, FileDownload, WhatsApp } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import API_BASE_URL from '../config';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFeeReport } from '../utils/generateFeeReport';
import { useTranslation } from 'react-i18next';

const WHATSAPP_GROUP_LINKS = {
    'Grade 03': 'https://chat.whatsapp.com/JDa517chrKQ9459MfzRSZC',
    'Grade 04': 'https://chat.whatsapp.com/Il7vUb6trXOBViX4U46dfm',
    'Grade 05': 'https://chat.whatsapp.com/K0df52vVfPoDjFuLtYrneG',
    'Grade 06': 'https://chat.whatsapp.com/Ebz4zJgdDhDEn1p2Z6HzbX',
    'Grade 07': 'https://chat.whatsapp.com/Ko87JpVAHdMJ3UCIDHh22a',
    'Grade 08': 'https://chat.whatsapp.com/LfrLuuB0NmE37Bul1cSwog',
    'Grade 09': 'https://chat.whatsapp.com/KEoJ2cotqWUA92EZA5R4W7',
    'Grade 10': 'https://chat.whatsapp.com/KOJD2PNrd936IHgWxLGotB',
    'Grade 11': 'https://chat.whatsapp.com/IuCquSU1EPHB9TcORCUdrz',
};

export const sendWhatsAppGroupLink = (student) => {
    try {
        if (!student.mobile) {
            alert('No mobile number provided for this student.');
            return;
        }
        let formattedNumber = student.mobile.trim().replace(/[\s-]/g, '');
        if (formattedNumber.startsWith('0')) formattedNumber = '94' + formattedNumber.substring(1);
        else if (formattedNumber.startsWith('+94')) formattedNumber = formattedNumber.substring(1);
        else if (formattedNumber.length === 9 && !formattedNumber.startsWith('94')) formattedNumber = '94' + formattedNumber;
        
        const groupLink = WHATSAPP_GROUP_LINKS[student.grade];
        if (!groupLink) {
            alert(`No WhatsApp group link configured for ${student.grade}`);
            return;
        }
        const message = `Welcome to Eduflex!\nHere is your ${student.grade} WhatsApp Group Link: ${groupLink}`;
        const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error("Error opening WhatsApp link:", error);
    }
};

function Row({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    return (
        <React.Fragment>
            <TableRow
                component={motion.tr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                sx={{
                    '& > *': { borderBottom: 'unset !important' },
                    cursor: 'pointer',
                    background: open ? 'linear-gradient(90deg, rgba(0,247,255,0.05) 0%, rgba(0,0,0,0) 100%)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.2)'
                    }
                }}
                onClick={() => setOpen(!open)}
            >
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                        sx={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            color: open ? theme.palette.primary.main : 'text.secondary',
                            bgcolor: open ? 'rgba(0,247,255,0.1)' : 'transparent'
                        }}
                    >
                        <KeyboardArrowDown />
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            width: 36, height: 36,
                            bgcolor: 'transparent',
                            color: theme.palette.primary.main,
                            border: `1px solid ${theme.palette.primary.main}`,
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            {row.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight="600" sx={{ color: 'text.primary' }}>{row.name}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>
                    <Chip
                        label={row.indexNumber}
                        size="small"
                        sx={{
                            borderRadius: '8px',
                            color: '#00f7ff',
                            bgcolor: 'rgba(0, 247, 255, 0.05)',
                            border: '1px solid rgba(0, 247, 255, 0.2)',
                            fontWeight: 600,
                            fontFamily: 'monospace'
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{row.grade}</Typography>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{row.mobile}</TableCell>
                <TableCell>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {row.enrollments.slice(0, 2).map((e) => {
                                const color = subjectColorMap[e.subject]?.color || '#ffffff';
                                return (
                                    <Chip
                                        key={e.subject}
                                        label={e.subject}
                                        size="small"
                                        sx={{
                                            height: 20, fontSize: '0.65rem',
                                            bgcolor: `${color}15`,
                                            color: color,
                                            border: `1px solid ${color}40`,
                                            borderRadius: '6px'
                                        }}
                                    />
                                );
                            })}
                            {row.enrollments.length > 2 && <Chip label={`+${row.enrollments.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.text.primary, 0.05), color: 'text.secondary' }} />}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>{t('no_students')}</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                        <Tooltip title={t('send_wa_group')}>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); sendWhatsAppGroupLink(row); }}
                                sx={{ mr: 1, '&:hover': { color: '#25D366' } }}
                            >
                                <WhatsApp fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('download_pdf')}>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); generateFeeReport(row, subjectColorMap, null, t, i18n.language); }}
                                sx={{ mr: 1, '&:hover': { color: '#00ccff' } }}
                            >
                                <FileDownload fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit_student')}>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                sx={{ mr: 1, '&:hover': { color: '#00f7ff' } }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete_student')}>
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                sx={{ '&:hover': { color: '#ff2a2a' } }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{
                            m: 2, ml: 4, mr: 4, p: 3,
                            background: alpha(theme.palette.background.paper, 0.6),
                            borderRadius: '16px',
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem'
                            }}>
                                <OpenInNew sx={{ fontSize: 16 }} /> {t('participation')}
                            </Typography>
                            <SubjectGrid
                                student={row}
                                studentId={row._id}
                                studentGrade={row.grade}
                                enrollments={row.enrollments}
                                onUpdate={onUpdate}
                                subjectColorMap={subjectColorMap}
                            />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function StudentCard({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const { t, i18n } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            sx={{
                mb: 2,
                borderRadius: '20px',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${theme.palette.divider}`,
                background: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(16px)',
                overflow: 'visible'
            }}
        >
            <CardContent sx={{ pb: 1, position: 'relative' }}>
                {/* Glow effect */}
                <Box sx={{
                    position: 'absolute', top: 10, right: 10, width: 60, height: 60,
                    background: 'radial-gradient(circle, rgba(0,247,255,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none'
                }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{
                            width: 48, height: 48,
                            bgcolor: 'transparent',
                            color: '#00f7ff',
                            border: '1px solid rgba(0,247,255,0.5)',
                            fontWeight: 800
                        }}>
                            {row.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem' }}>{row.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip label={`#${row.indexNumber}`} size="small" sx={{
                                    borderRadius: '6px', height: 20, fontSize: '0.7rem',
                                    bgcolor: alpha(theme.palette.text.primary, 0.05), color: 'text.secondary', border: `1px solid ${theme.palette.divider}`
                                }} />
                                <Typography variant="caption" color="text.secondary">{row.grade}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Tooltip title={t('send_wa_group')}>
                            <IconButton onClick={(e) => { e.stopPropagation(); sendWhatsAppGroupLink(row); }} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#25D366' } }}>
                                <WhatsApp fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('download_pdf')}>
                            <IconButton onClick={(e) => { e.stopPropagation(); generateFeeReport(row, subjectColorMap, null, t, i18n.language); }} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#00ccff' } }}>
                                <FileDownload fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={() => onEdit(row)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#00f7ff' } }}>
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => onDelete(row)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#ff2a2a' } }}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: alpha(theme.palette.text.primary, 0.05), p: 1.5, borderRadius: '12px' }}>
                            <Phone fontSize="small" sx={{ opacity: 0.7 }} />
                            <Typography variant="caption" fontFamily="monospace" fontSize="0.85rem">{row.mobile}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 1 }}>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                            {row.enrollments.map(e => {
                                const color = subjectColorMap[e.subject]?.color || '#ffffff';
                                return (
                                    <Chip
                                        key={e.subject}
                                        label={e.subject}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            fontSize: '0.7rem',
                                            bgcolor: `${color}10`,
                                            color: color,
                                            borderColor: `${color}30`
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">{t('no_students')}</Typography>
                    )}
                </Box>
            </CardContent>

            <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                    fullWidth
                    variant="text"
                    endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{
                        textTransform: 'none',
                        color: 'text.secondary',
                        py: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.02), color: '#00f7ff' }
                    }}
                >
                    {expanded ? t('close') : t('participation')}
                </Button>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 1, pb: 3, bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
                    <SubjectGrid
                        student={row}
                        studentId={row._id}
                        studentGrade={row.grade}
                        enrollments={row.enrollments}
                        onUpdate={onUpdate}
                        subjectColorMap={subjectColorMap}
                        isMobile={true}
                    />
                </Box>
            </Collapse>
        </Card>
    );
}

export default function StudentTable({ students, onUpdate, subjectColorMap }) {
    const { t } = useTranslation();
    const [editingStudent, setEditingStudent] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/students/${studentToDelete._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onUpdate();
                setDeleteConfirmOpen(false);
                setStudentToDelete(null);
            } else {
                console.error("Failed to delete student");
                alert(t('failed_to_delete'));
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            alert(t('failed_to_delete'));
        }
    };

    return (
        <>
            {isMobile ? (
                <Box>
                    <AnimatePresence>
                        {students.map((student, index) => (
                            <StudentCard
                                key={student._id}
                                row={student}
                                onUpdate={onUpdate}
                                onEdit={setEditingStudent}
                                onDelete={handleDeleteClick}
                                subjectColorMap={subjectColorMap}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(30px)',
                        overflow: 'hidden'
                    }}
                >
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{
                                bgcolor: alpha(theme.palette.text.primary, 0.04),
                                '& th': {
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    py: 2.5
                                }
                            }}>
                                <TableCell />
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{t('student_name')}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{t('index_number')}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{t('grade')}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Mobile</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{t('enrolled')}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', textAlign: 'right' }}>{t('actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student, index) => (
                                <Row
                                    key={student._id}
                                    row={student}
                                    onUpdate={onUpdate}
                                    onEdit={setEditingStudent}
                                    onDelete={handleDeleteClick}
                                    subjectColorMap={subjectColorMap}
                                    index={index}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {editingStudent && (
                <EditStudentDialog
                    open={!!editingStudent}
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                    onUpdate={onUpdate}
                />
            )}

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                    style: {
                        borderRadius: 24,
                        background: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.palette.divider}`
                    }
                }}
            >
                <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>{t('confirm_delete')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.secondary' }}>
                        {t('confirm_delete_msg', { name: studentToDelete?.name })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 3, pr: 3 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'text.secondary' }}>{t('cancel')}</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                        {t('delete_permanently')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
