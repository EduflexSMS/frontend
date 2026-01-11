import React, { useState } from 'react';
import { Box, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

const AttendanceCell = ({ studentId, subject, monthIndex, weekIndex, initialStatus, onUpdate }) => {
    const [marked, setMarked] = useState(initialStatus);
    const [open, setOpen] = useState(false);

    // If already marked, show as disabled/completed
    if (marked) {
        return (
            <Tooltip title="Attended">
                <CheckCircle color="success" fontSize="small" />
            </Tooltip>
        );
    }

    const handleClick = () => {
        setOpen(true);
    };

    const handleConfirm = async () => {
        try {
            await axios.patch(`${API_BASE_URL}/api/attendance/${studentId}/${subject}/${monthIndex}/${weekIndex}`);
            setMarked(true);
            setOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to mark attendance", error);
            alert("Error marking attendance");
        }
    };

    return (
        <>
            <Tooltip title="Mark Attendance">
                <RadioButtonUnchecked
                    fontSize="small"
                    sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    onClick={handleClick}
                />
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Attendance</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to mark attendance for Week {weekIndex + 1}?
                        <br />
                        <strong>This action cannot be undone.</strong>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AttendanceCell;
