import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Divider, Grid, Chip, Avatar
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, School, Person, Numbers, Class } from '@mui/icons-material';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';
import { motion, AnimatePresence } from 'framer-motion';

function Row({ row, onUpdate, onEdit, subjectColorMap, index }) {
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
                    bgcolor: open ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    transition: 'background-color 0.3s'
                }}
            >
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        sx={{
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    >
                        <KeyboardArrowDown />
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--secondary-color)', fontSize: '0.85rem' }}>
                            {row.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="500">{row.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>
                    <Chip label={row.indexNumber} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                </TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.mobile}</TableCell>
                <TableCell>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {row.enrollments.slice(0, 2).map(e => (
                                <Chip key={e.subject} label={e.subject} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            ))}
                            {row.enrollments.length > 2 && <Chip label={`+${row.enrollments.length - 2}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <IconButton
                        onClick={() => onEdit(row)}
                        color="primary"
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.2)' } }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2, ml: 8, p: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
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

function StudentCard({ row, onUpdate, onEdit, subjectColorMap, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            sx={{ mb: 2, borderRadius: 4, boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'var(--primary-color)' }}>{row.name.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip label={`#${row.indexNumber}`} size="small" sx={{ borderRadius: 1.5, height: 24 }} />
                                <Typography variant="caption" color="text.secondary">{row.grade}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <IconButton onClick={() => onEdit(row)} size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}>
                        <Edit fontSize="small" />
                    </IconButton>
                </Box>

                <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', bgcolor: '#f8fafc', p: 1, borderRadius: 2 }}>
                            <Phone fontSize="small" />
                            <Typography variant="body2">{row.mobile}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 1 }}>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.enrollments.map(e => (
                                <Chip key={e.subject} label={e.subject} size="small" variant="outlined" sx={{ bgcolor: 'white' }} />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary">No enrollments</Typography>
                    )}
                </Box>
            </CardContent>

            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
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
                <Box sx={{ p: 1, bgcolor: '#f8fafc' }}>
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                        boxShadow: 'var(--card-shadow)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(37, 99, 235, 0.05)' }}>
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
        </>
    );
}
