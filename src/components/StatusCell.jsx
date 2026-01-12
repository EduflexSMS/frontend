import React, { useState } from 'react';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, MonetizationOn, Book, Cancel } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

const StatusCell = ({ studentId, subject, monthIndex, weekIndex, type, initialStatus, onUpdate, label }) => {
    // initialStatus can be boolean (legacy) or string ('present', 'absent', 'pending')
    // Normalize to string
    const getNormalizedStatus = (status) => {
        if (status === true || status === 'true' || status === 'present') return 'present';
        if (status === 'absent') return 'absent';
        return 'pending'; // Default for false, null, undefined, 'pending'
    };

    const [status, setStatus] = useState(getNormalizedStatus(initialStatus));
    const [open, setOpen] = useState(false);

    // Sync state with props when data updates
    React.useEffect(() => {
        setStatus(getNormalizedStatus(initialStatus));
    }, [initialStatus]);

    // Icons based on type
    const getIcon = (currentStatus) => {
        if (type === 'attendance') {
            if (currentStatus === 'present') return <CheckCircle color="success" fontSize="small" />;
            if (currentStatus === 'absent') return <Cancel color="error" fontSize="small" />;
            return <RadioButtonUnchecked color="action" fontSize="small" sx={{ opacity: 0.3 }} />;
        } else if (type === 'fee') {
            // Fee and Tute remain boolean-like for now, but better to check input
            const isDone = currentStatus === true || currentStatus === 'true' || currentStatus === 'present'; // Fee doesn't have absent usually
            return isDone ? <MonetizationOn color="success" fontSize="small" /> : <MonetizationOn color="disabled" fontSize="small" />;
        } else if (type === 'tute') {
            const isDone = currentStatus === true || currentStatus === 'true' || currentStatus === 'present';
            return isDone ? <Book color="success" fontSize="small" /> : <Book color="disabled" fontSize="small" />;
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

            if (type === 'attendance') {
                url = `${API_BASE_URL}/api/attendance/${studentId}/${subject}/${monthIndex}/${weekIndex}`;
                body = { status: newStatus };
                await axios.patch(url, body);
            } else {
                // Legacy support for Fee/Tute which are valid/toggle endpoints
                // Assuming we haven't changed Fee/Tute endpoints to accept body status yet, 
                // but we should just trigger the toggle if it's legacy or pass status if supported.
                // The current backend for records is a toggle endpoint: /records/:studentId/:subject/:month/:type
                // It does NOT accept body. So we stick to toggle for Fee/Tute.
                url = `${API_BASE_URL}/api/records/${studentId}/${subject}/${monthIndex}/${type}`;
                await axios.patch(url);
                // For local state update, just toggle
                newStatus = (status === true || status === 'true') ? false : true;
            }

            setStatus(getNormalizedStatus(newStatus)); // Re-normalize to be safe
            setOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status", error);
            const errMsg = error.response?.data?.message || error.message || "Error updating status";
            alert(`Failed: ${errMsg}`);
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
                    >
                        Present
                    </Button>
                    <Button
                        variant={status === 'absent' ? "contained" : "outlined"}
                        color="error"
                        onClick={() => handleUpdate('absent')}
                        startIcon={<Cancel />}
                    >
                        Absent
                    </Button>
                    <Button
                        variant={status === 'pending' ? "contained" : "outlined"}
                        color="inherit"
                        onClick={() => handleUpdate('pending')}
                        startIcon={<RadioButtonUnchecked />}
                    >
                        Clear
                    </Button>
                </div>
            );
        } else {
            // Fee and Tute - Simple Toggle Confirmation
            const isDone = status === true || status === 'true' || status === 'present';
            return (
                <Typography>
                    Are you sure you want to <strong>{isDone ? 'unmark' : 'mark'}</strong> <strong>{getLabel()}</strong>?
                    <br /><br />
                    <Button
                        variant="contained"
                        color={isDone ? "warning" : "primary"}
                        onClick={() => handleUpdate(null)} // Argument ignored for toggle logic in handleUpdate
                        fullWidth
                    >
                        {isDone ? "Unmark" : "Confirm"}
                    </Button>
                </Typography>
            );
        }
    };

    return (
        <>
            <Tooltip title={status} arrow>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{
                        p: 0.5,
                        opacity: (status === 'pending' && !label) ? 0.6 : 1,
                        '&:hover': { opacity: 1, color: 'primary.main', transform: 'scale(1.1)' }
                    }}
                >
                    {label ? (
                        <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: status === 'present' ? '#2e7d32' : 'transparent', // Only highlight present dates? Or fee paid?
                            // Wait, Label is usually for Month Name block or something? 
                            // Ah, checking StatusCell usage... seemingly not used with Label for attendance.
                            // The Label logic was specific to previous implementation. Let's keep it simple.
                            border: '1px solid #757575',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem'
                        }}>{label}</div>
                    ) : getIcon(status)}
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Update {getLabel()}</DialogTitle>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StatusCell;
