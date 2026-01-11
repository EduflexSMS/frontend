import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import SubjectGrid from './SubjectGrid';

import { Edit } from '@mui/icons-material';
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

export default function StudentTable({ students, onUpdate, subjectColorMap }) {
    const [editingStudent, setEditingStudent] = useState(null);

    return (
        <>
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'var(--card-shadow)', overflowX: 'auto' }}>
                <Table aria-label="collapsible table" sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#1e88e5' }}>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Index Number</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>School</TableCell>
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
