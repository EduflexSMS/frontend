import React, { useState, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Grid, Chip, Avatar, Tooltip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, Delete, OpenInNew, Print } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import API_BASE_URL from '../config';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import StudentIdCard from './StudentIdCard';

function Row({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const idCardRef = useRef(null);

    const handlePrintId = async () => {
        if (!idCardRef.current) return;

        try {
            // Temporarily make it visible but absolute positioned off-screen to capture
            idCardRef.current.style.display = 'flex';

            const canvas = await html2canvas(idCardRef.current, {
                scale: 3, // High quality 300dpi equivalent
                useCORS: true,
                backgroundColor: null,
            });

            // Hide it again
            idCardRef.current.style.display = 'none';

            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `ID_Card_${row.indexNumber}_${row.name.replace(/\s+/g, '_')}.png`;
            link.href = image;
            link.click();
        } catch (error) {
            console.error("Error generating ID Card:", error);
            alert("Could not generate ID card. Please try again.");
            if (idCardRef.current) idCardRef.current.style.display = 'none';
        }
    };

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
                    background: open ? (theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.02)',
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
                            bgcolor: open ? (theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)') : 'transparent'
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
                            color: theme.palette.mode === 'light' ? '#2563eb' : '#60a5fa',
                            bgcolor: theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
                            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}`,
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
                            {row.enrollments.length > 2 && <Chip label={`+${row.enrollments.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>None</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.7, '&:hover': { opacity: 1 }, gap: 1 }}>
                        <Tooltip title="Download ID Card">
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); handlePrintId(); }}
                                sx={{ '&:hover': { color: theme.palette.primary.main } }}
                            >
                                <Print fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Student">
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                sx={{ '&:hover': { color: '#00f7ff' } }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Student">
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
                            background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 15, 15, 0.4)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.05)'}`,
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
                                <OpenInNew sx={{ fontSize: 16 }} /> Progress & Attendance
                            </Typography>
                            <SubjectGrid
                                studentId={row._id}
                                studentGrade={row.grade}
                                enrollments={row.enrollments}
                                onUpdate={onUpdate}
                                subjectColorMap={subjectColorMap}
                            />
                        </Box>
                    </Collapse>

                    {/* Hidden high-res ID Card for capturing rendering */}
                    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                        <div ref={idCardRef} style={{ display: 'none' }}>
                            <StudentIdCard student={row} />
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function StudentCard({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const idCardRef = useRef(null);

    const handlePrintId = async () => {
        if (!idCardRef.current) return;

        try {
            idCardRef.current.style.display = 'flex';

            const canvas = await html2canvas(idCardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
            });

            idCardRef.current.style.display = 'none';

            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `ID_Card_${row.indexNumber}_${row.name.replace(/\s+/g, '_')}.png`;
            link.href = image;
            link.click();
        } catch (error) {
            console.error("Error generating ID Card:", error);
            alert("Could not generate ID card. Please try again.");
            if (idCardRef.current) idCardRef.current.style.display = 'none';
        }
    };

    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            sx={{
                mb: 2,
                borderRadius: '32px',
                border: theme.palette.mode === 'light' ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.08)',
                background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 15, 15, 0.4)',
                backdropFilter: 'blur(40px)',
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
                                    bgcolor: theme.palette.mode === 'light' ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.05)', color: 'text.secondary', border: `1px solid ${theme.palette.divider}`
                                }} />
                                <Typography variant="caption" color="text.secondary">{row.grade}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        {/* Mobile ID Card Print Tool */}
                        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                            <div ref={idCardRef} style={{ display: 'none' }}>
                                <StudentIdCard student={row} />
                            </div>
                        </div>

                        <IconButton onClick={handlePrintId} size="small" sx={{ color: 'text.secondary', '&:hover': { color: theme.palette.primary.main } }}>
                            <Print fontSize="small" />
                        </IconButton>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: '12px' }}>
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
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">No enrollments</Typography>
                    )}
                </Box>
            </CardContent>

            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button
                    fullWidth
                    variant="text"
                    endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{
                        textTransform: 'none',
                        color: 'text.secondary',
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', color: '#00f7ff' }
                    }}
                >
                    {expanded ? 'Hide Details' : 'View Participation'}
                </Button>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 1, pb: 3, bgcolor: 'rgba(0,0,0,0.1)' }}>
                    <SubjectGrid
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
                alert("Failed to delete student");
            }
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Error deleting student");
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
                        borderRadius: '32px',
                        boxShadow: theme.palette.mode === 'light' ? '0 20px 50px -10px rgba(0, 0, 0, 0.05)' : '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
                        border: theme.palette.mode === 'light' ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255, 255, 255, 0.05)',
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(12, 12, 24, 0.3)',
                        backdropFilter: 'blur(40px)',
                        overflow: 'hidden'
                    }}
                >
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Student Name</TableCell>
                                <TableCell>Index No.</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Mobile</TableCell>
                                <TableCell>Enrolled</TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>Actions</TableCell>
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
                        background: 'rgba(15, 15, 30, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Are you sure you want to delete <strong style={{ color: '#fff' }}>{studentToDelete?.name}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 3, pr: 3 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
