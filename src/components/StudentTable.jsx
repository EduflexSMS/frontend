import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Grid, Chip, Avatar, Tooltip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, Delete, OpenInNew } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import API_BASE_URL from '../config';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';
import { motion, AnimatePresence } from 'framer-motion';

function Row({ row, onUpdate, onEdit, onDelete, subjectColorMap, index }) {
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
                        bgcolor: 'rgba(255, 255, 255, 0.02)',
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
                            {row.enrollments.length > 2 && <Chip label={`+${row.enrollments.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }} />}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>None</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                        <Tooltip title="Edit Student">
                            <IconButton
                                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                sx={{ mr: 1, '&:hover': { color: '#00f7ff' } }}
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
                            background: 'rgba(10, 10, 20, 0.4)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
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
                borderRadius: '20px',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(18, 18, 30, 0.6)',
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
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{row.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip label={`#${row.indexNumber}`} size="small" sx={{
                                    borderRadius: '6px', height: 20, fontSize: '0.7rem',
                                    bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', border: '1px solid rgba(255,255,255,0.05)'
                                }} />
                                <Typography variant="caption" color="text.secondary">{row.grade}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
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
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        bgcolor: 'rgba(12, 12, 24, 0.6)',
                        backdropFilter: 'blur(30px)',
                        overflow: 'hidden'
                    }}
                >
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{
                                bgcolor: 'rgba(0, 0, 0, 0.3)',
                                '& th': {
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    py: 2.5
                                }
                            }}>
                                <TableCell />
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Student Name</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Index No.</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Grade</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Mobile</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Enrolled</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</TableCell>
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
