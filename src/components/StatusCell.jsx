import React, { useState } from 'react';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, MonetizationOn, Book } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';

const StatusCell = ({ studentId, subject, monthIndex, weekIndex, type, initialStatus, onUpdate, label }) => {
    const [marked, setMarked] = useState(initialStatus);
    const [open, setOpen] = useState(false);

    // Icons based on type
    const getIcon = (filled) => {
        if (type === 'attendance') {
            return filled ? <CheckCircle color="success" fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />;
        } else if (type === 'fee') {
            return filled ? <MonetizationOn color="success" fontSize="small" /> : <MonetizationOn color="disabled" fontSize="small" />;
        } else if (type === 'tute') {
            return filled ? <Book color="success" fontSize="small" /> : <Book color="disabled" fontSize="small" />;
        }
    };

    const getLabel = () => {
        if (type === 'attendance') return `Attendance (Week ${weekIndex + 1})`;
        if (type === 'fee') return "Month Fee";
        if (type === 'tute') return "Tutes Issued";
    };

    const handleClick = () => {
        // Always open dialog to confirm toggle
        setOpen(true);
    };

    const handleConfirm = async () => {
        try {
            let url = '';
            if (type === 'attendance') {
                url = `${API_BASE_URL}/api/attendance/${studentId}/${subject}/${monthIndex}/${weekIndex}`;
            } else {
                url = `${API_BASE_URL}/api/records/${studentId}/${subject}/${monthIndex}/${type}`;
            }

            await axios.patch(url);
            setMarked(!marked);
            setOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status", error);
            const errMsg = error.response?.data?.message || error.message || "Error updating status";
            alert(`Failed: ${errMsg}`);
        }
    };

    // Add import for Box if not present, but better to just use what we have or add to imports
    const content = label ? (
        <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: marked ? '#2e7d32' : 'transparent',
            border: marked ? 'none' : '1px solid #757575',
            color: marked ? 'white' : '#757575',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease-in-out'
        }}>
            {label}
        </div>
    ) : getIcon(marked);

    return (
        <>
            <Tooltip title={marked ? `${getLabel()} - Completed` : `Mark ${getLabel()}`}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    // disabled={marked} // Allow clicking even if marked
                    sx={{
                        p: 0.5,
                        opacity: (marked && !label) ? 1 : (label ? 1 : 0.6), // Adjust opacity rule for dates
                        '&:hover': { opacity: 1, color: 'primary.main', transform: label ? 'scale(1.1)' : 'none' }
                    }}
                >
                    {content}
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to <strong>{marked ? 'unmark' : 'mark'}</strong> <strong>{getLabel()}</strong>?
                        <br />
                        <br />
                        {marked ?
                            <span style={{ color: 'orange' }}>This will revert the status to pending/absent.</span> :
                            <span style={{ color: 'green' }}>This will mark it as completed/present.</span>
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" color={marked ? "warning" : "primary"}>
                        {marked ? "Unmark" : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StatusCell;
