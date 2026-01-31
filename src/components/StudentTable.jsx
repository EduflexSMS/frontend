import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Grid, Chip, Avatar
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, Delete } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import API_BASE_URL from '../config';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';
import { motion, AnimatePresence } from 'framer-motion';

function Row({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow
                component={motion.tr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                sx={{
                    '& > *': { borderBottom: 'unset' },
                    bgcolor: open ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    transition: 'background-color 0.3s',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' }
                }}
            >
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        sx={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            color: 'text.secondary'
                        }}
                    >
                        <KeyboardArrowDown />
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                            {row.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="500" sx={{ color: 'text.primary' }}>{row.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>
                    <Chip label={row.indexNumber} size="small" variant="outlined" sx={{ borderRadius: 1, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.2)' }} />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{row.grade}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{row.mobile}</TableCell>
                <TableCell>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {row.enrollments.slice(0, 2).map(e => (
                                <Chip key={e.subject} label={e.subject} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(6, 182, 212, 0.1)', color: 'text.primary', border: '1px solid rgba(6, 182, 212, 0.3)' }} />
                            ))}
                            {row.enrollments.length > 2 && <Chip label={`+${row.enrollments.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }} />}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => onEdit(row)}
                        sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => onDelete(row)}
                        sx={{ ml: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2, ml: 8, p: 2, bgcolor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Progress & Attendance Details
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <SubjectGrid
                                    studentId={row._id}
                                    studentGrade={row.grade}
                                    enrollments={row.enrollments}
                                    onUpdate={onUpdate}
                                    subjectColorMap={subjectColorMap}
                                />
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function StudentCard({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            sx={{
                mb: 2,
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)'
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>{row.name.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>{row.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip label={`#${row.indexNumber}`} size="small" sx={{ borderRadius: 1.5, height: 24, bgcolor: 'rgba(255,255,255,0.1)', color: 'text.secondary', border: '1px solid rgba(255,255,255,0.05)' }} />
                                <Typography variant="caption" color="text.secondary">{row.grade}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <IconButton onClick={() => onEdit(row)} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main' }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(row)} size="small" sx={{ ml: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>

                <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 2 }}>
                            <Phone fontSize="small" />
                            <Typography variant="body2">{row.mobile}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 1 }}>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.enrollments.map(e => (
                                <Chip key={e.subject} label={e.subject} size="small" variant="outlined" sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: 'text.primary', borderColor: 'rgba(6, 182, 212, 0.3)' }} />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary">No enrollments</Typography>
                    )}
                </Box>
            </CardContent>

            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button
                    fullWidth
                    variant="text"
                    endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{ textTransform: 'none', color: 'text.secondary', py: 1.5 }}
                >
                    {expanded ? 'Hide Details' : 'View Participation'}
                </Button>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.2)' }}>
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
                onUpdate(); // Refresh the list
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
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        bgcolor: 'rgba(0, 0, 0, 0.6)', // Deep Void Glass
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden'
                    }}
                >
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)' }}>
                                <TableCell />
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Index Number</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Grade</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Mobile</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Subjects</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
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
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
