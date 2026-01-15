import React, { useState, useEffect } from 'react';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Grow, Zoom } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, MonetizationOn, Book, Cancel } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { motion } from 'framer-motion';

const StatusCell = ({ studentId, subject, monthIndex, weekIndex, type, initialStatus, onUpdate, label }) => {

    const getNormalizedStatus = (status) => {
        if (typeof status === 'string' && status.toLowerCase() === 'absent') return 'absent';
        if (status === true || status === 'true' || status === 'present' || (typeof status === 'string' && status.toLowerCase() === 'present')) return 'present';
        return 'pending';
    };

    const [status, setStatus] = useState(getNormalizedStatus(initialStatus));
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setStatus(getNormalizedStatus(initialStatus));
    }, [initialStatus, type, weekIndex]);

    const getIcon = (currentStatus) => {
        if (type === 'attendance') {
            if (currentStatus === 'present') return <CheckCircle sx={{ color: '#10b981' }} />;
            if (currentStatus === 'absent') return <Cancel sx={{ color: '#ef4444' }} />;
            return <RadioButtonUnchecked sx={{ color: '#cbd5e1' }} />;
        } else if (type === 'fee') {
            const isDone = currentStatus === 'present';
            return isDone ? <MonetizationOn sx={{ color: '#f59e0b' }} /> : <MonetizationOn sx={{ color: '#e2e8f0' }} />;
        } else if (type === 'tute') {
            const isDone = currentStatus === 'present';
            return isDone ? <Book sx={{ color: '#3b82f6' }} /> : <Book sx={{ color: '#e2e8f0' }} />;
        }
    };

    const getLabel = () => {
        if (type === 'attendance') return `Attendance (Week ${weekIndex + 1})`;
        if (type === 'fee') return "Month Fee";
        if (type === 'tute') return "Tutes Issued";
    };

    const handleClick = () => {
        setOpen(true);
    };

    const handleUpdate = async (newStatus) => {
        try {
            let url = '';
            let body = {};

            setStatus(getNormalizedStatus(newStatus));
            setOpen(false);

            if (type === 'attendance') {
                url = `${API_BASE_URL}/api/attendance/${studentId}/${subject}/${monthIndex}/${weekIndex}`;
                body = { status: newStatus };
                await axios.patch(url, body);
            } else {
                url = `${API_BASE_URL}/api/records/${studentId}/${subject}/${monthIndex}/${type}`;
                await axios.patch(url);
            }

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status", error);
            setStatus(getNormalizedStatus(initialStatus));
            alert("Failed to update status. Please try again.");
        }
    };

    const renderDialogContent = () => {
        if (type === 'attendance') {
            return (
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px' }}>
                    <Button
                        variant={status === 'present' ? "contained" : "outlined"}
                        color="success"
                        onClick={() => handleUpdate('present')}
                        startIcon={<CheckCircle />}
                        sx={{ borderRadius: 4, textTransform: 'none', px: 3 }}
                    >
                        Present
                    </Button>
                    <Button
                        variant={status === 'absent' ? "contained" : "outlined"}
                        color="error"
                        onClick={() => handleUpdate('absent')}
                        startIcon={<Cancel />}
                        sx={{ borderRadius: 4, textTransform: 'none', px: 3 }}
                    >
                        Absent
                    </Button>
                    <Button
                        variant="text"
                        color="inherit"
                        onClick={() => handleUpdate('pending')}
                        sx={{ borderRadius: 4, textTransform: 'none' }}
                    >
                        Clear
                    </Button>
                </div>
            );
        } else {
            const isDone = status === 'present';
            return (
                <Typography align="center">
                    Mark <strong>{getLabel()}</strong> as {isDone ? 'Unpaid/Not Given' : 'Paid/Given'}?
                    <br /><br />
                    <Button
                        variant="contained"
                        color={isDone ? "warning" : "primary"}
                        onClick={() => handleUpdate(isDone ? 'pending' : 'present')}
                        fullWidth
                        sx={{ borderRadius: 2 }}
                    >
                        {isDone ? "Mark as Pending" : "Confirm"}
                    </Button>
                </Typography>
            );
        }
    };

    return (
        <>
            <Tooltip title={status.charAt(0).toUpperCase() + status.slice(1)} arrow TransitionComponent={Zoom}>
                <IconButton
                    component={motion.button}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    size="small"
                    onClick={handleClick}
                    sx={{
                        p: 0.5,
                        opacity: (status === 'pending' && !label) ? 0.6 : 1,
                    }}
                >
                    {label ? (
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: status === 'present' ? '#10b981' : 'transparent',
                            border: '1px solid #94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: status === 'present' ? 'white' : 'inherit'
                        }}>{label}</div>
                    ) : getIcon(status)}
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
                TransitionComponent={Grow}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Update Status</DialogTitle>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
                    <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StatusCell;
