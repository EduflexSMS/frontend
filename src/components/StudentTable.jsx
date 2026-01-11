import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography,
    useTheme, useMediaQuery, Card, CardContent, Button, Divider, Grid, Chip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Phone, School, Person, Numbers, Class } from '@mui/icons-material';
import SubjectGrid from './SubjectGrid';
import EditStudentDialog from '../components/EditStudentDialog';

function Row({ row, onUpdate, onEdit, subjectColorMap }) {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell>{row.indexNumber}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{row.mobile}</TableCell>
                <TableCell>{row.enrollments.map(e => e.subject).join(', ')}</TableCell>
                <TableCell>
                    <IconButton onClick={() => onEdit(row)} color="primary">
                        <Edit />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Subjects & Attendance
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

function StudentCard({ row, onUpdate, onEdit, subjectColorMap }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Numbers fontSize="small" /> {row.indexNumber}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => onEdit(row)} size="small" sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'primary.main' }}>
                        <Edit fontSize="small" />
                    </IconButton>
                </Box>

                <Grid container spacing={1} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <School fontSize="small" />
                            <Typography variant="body2">{row.grade}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <Phone fontSize="small" />
                            <Typography variant="body2">{row.mobile}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, mb: 1 }}>
                    {row.enrollments.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.enrollments.map(e => (
                                <Chip key={e.subject} label={e.subject} size="small" variant="outlined" />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.secondary">No enrollments</Typography>
                    )}
                </Box>
            </CardContent>

            <Box sx={{ px: 2, pb: 2 }}>
                <Button
                    fullWidth
                    variant="text"
                    endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.85rem' }}
                >
                    {expanded ? 'Hide Details' : 'View Attendance'}
                </Button>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
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
                    {students.map((student) => (
                        <StudentCard
                            key={student._id}
                            row={student}
                            onUpdate={onUpdate}
                            onEdit={setEditingStudent}
                            subjectColorMap={subjectColorMap}
                        />
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'var(--card-shadow)', overflowX: 'auto' }}>
                    <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: '#1e88e5' }}>
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Index Number</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subjects</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <Row
                                    key={student._id}
                                    row={student}
                                    onUpdate={onUpdate}
                                    onEdit={setEditingStudent}
                                    subjectColorMap={subjectColorMap}
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
