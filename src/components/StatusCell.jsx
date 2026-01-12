import React, { useState, useEffect } from 'react';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Grow } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, MonetizationOn, Book, Cancel } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

const StatusCell = ({ studentId, subject, monthIndex, weekIndex, type, initialStatus, onUpdate, label }) => {

    // Robust cleanup of status
    const getNormalizedStatus = (status) => {
        if (typeof status === 'string' && status.toLowerCase() === 'absent') return 'absent';
        if (status === true || status === 'true' || status === 'present' || (typeof status === 'string' && status.toLowerCase() === 'present')) return 'present';
        return 'pending'; // Everything else is pending
    };

    const [status, setStatus] = useState(getNormalizedStatus(initialStatus));
    const [open, setOpen] = useState(false);

    // Sync state with props when data updates
    useEffect(() => {
        setStatus(getNormalizedStatus(initialStatus));
    }, [initialStatus, type, weekIndex]);

    // Icons based on type with animation classes
    const getIcon = (currentStatus) => {
        const iconStyle = { transition: 'transform 0.2s', transform: 'scale(1)' };

        if (type === 'attendance') {
            if (currentStatus === 'present') return <CheckCircle color="success" sx={iconStyle} />;
            if (currentStatus === 'absent') return <Cancel color="error" sx={iconStyle} />;
            return <RadioButtonUnchecked color="action" sx={{ ...iconStyle, opacity: 0.3 }} />;
        } else if (type === 'fee') {
            const isDone = currentStatus === 'present';
            // Fees don't have absent, just Done or Not
            return isDone ? <MonetizationOn color="success" sx={iconStyle} /> : <MonetizationOn color="disabled" sx={iconStyle} />;
        } else if (type === 'tute') {
            const isDone = currentStatus === 'present';
            return isDone ? <Book color="success" sx={iconStyle} /> : <Book color="disabled" sx={iconStyle} />;
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

            // Optimistic Update
            setStatus(getNormalizedStatus(newStatus));
            setOpen(false);

            if (type === 'attendance') {
                url = `${API_BASE_URL}/api/attendance/${studentId}/${subject}/${monthIndex}/${weekIndex}`;
                body = { status: newStatus };
                await axios.patch(url, body);
            } else {
                // Legacy support for Fee/Tute
                url = `${API_BASE_URL}/api/records/${studentId}/${subject}/${monthIndex}/${type}`;
                await axios.patch(url);
                // For fee/tute, newStatus passed in might be ignored by backend toggle, but we set local state logic
            }

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure (simplified)
            setStatus(getNormalizedStatus(initialStatus));
            alert("Failed to update status. Please try again.");
        }
    };

    // Render Logic for Dialog Content
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
            // Fee and Tute
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
            <Tooltip title={status.charAt(0).toUpperCase() + status.slice(1)} arrow TransitionComponent={Grow}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{
                        p: 0.5,
                        opacity: (status === 'pending' && !label) ? 0.6 : 1,
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy
                        '&:hover': {
                            opacity: 1,
                            color: 'primary.main',
                            transform: 'scale(1.2)',
                            backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                    }}
                >
                    {label ? (
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: status === 'present' ? '#2e7d32' : 'transparent',
                            border: '1px solid #757575',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                        }}>{label}</div>
                    ) : getIcon(status)}
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
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
