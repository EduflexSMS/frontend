```javascript
import React, { useState, useEffect } from 'react';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Grow, Zoom, Box, alpha, useTheme } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, MonetizationOn, Book, Cancel, HourglassEmpty } from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const StatusCell = ({ studentId, subject, monthIndex, weekIndex, type, initialStatus, onUpdate }) => {
    const theme = useTheme();

    const getNormalizedStatus = (status) => {
        if (typeof status === 'string' && status.toLowerCase() === 'absent') return 'absent';
        if (status === true || status === 'true' || status === 'present' || (typeof status === 'string' && status.toLowerCase() === 'present')) return 'present';
        return 'pending';
    };

    const [status, setStatus] = useState(getNormalizedStatus(initialStatus));
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setStatus(getNormalizedStatus(initialStatus));
    }, [initialStatus, type, weekIndex]);

    const getIcon = (currentStatus) => {
        const commonSx = { transition: 'all 0.3s ease', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.3))' };

        if (type === 'attendance') {
            if (currentStatus === 'present') return <CheckCircle sx={{ color: '#00ff66', ...commonSx, filter: 'drop-shadow(0 0 8px #00ff66)' }} />;
            if (currentStatus === 'absent') return <Cancel sx={{ color: '#ff2a2a', ...commonSx, filter: 'drop-shadow(0 0 8px #ff2a2a)' }} />;
            return <RadioButtonUnchecked sx={{ color: alpha(theme.palette.text.secondary, 0.3), ...commonSx, '&:hover': { color: theme.palette.primary.main, transform: 'scale(1.2)' } }} />;
        } else if (type === 'fee') {
            const isDone = currentStatus === 'present';
            return isDone
                ? <MonetizationOn sx={{ color: '#ffd700', ...commonSx, filter: 'drop-shadow(0 0 8px #ffd700)' }} />
                : <MonetizationOn sx={{ color: alpha(theme.palette.text.secondary, 0.2), ...commonSx, '&:hover': { color: '#ffd700', transform: 'scale(1.1)' } }} />;
        } else if (type === 'tute') {
            const isDone = currentStatus === 'present';
            return isDone
                ? <Book sx={{ color: '#00f7ff', ...commonSx, filter: 'drop-shadow(0 0 8px #00f7ff)' }} />
                : <Book sx={{ color: alpha(theme.palette.text.secondary, 0.2), ...commonSx, '&:hover': { color: '#00f7ff', transform: 'scale(1.1)' } }} />;
        }
    };

    const getLabel = () => {
        if (type === 'attendance') return `Attendance(Week ${ weekIndex + 1})`;
        if (type === 'fee') return "Monthly Fee";
        if (type === 'tute') return "Tutes Issued";
    };

    const handleClick = () => {
        setOpen(true);
    };

    const handleUpdate = async (newStatus) => {
        try {
            setLoading(true);
            let url = '';
            let body = {};

            // Optimistic update
            const prevStatus = status;
            setStatus(getNormalizedStatus(newStatus));
            setOpen(false);

            if (type === 'attendance') {
                url = `${ API_BASE_URL } /api/attendance / ${ studentId } /${subject}/${ monthIndex }/${weekIndex}`;
body = { status: newStatus };
await axios.patch(url, body);
            } else {
    url = `${API_BASE_URL}/api/records/${studentId}/${subject}/${monthIndex}/${type}`;
    // Fee/Tute toggles in backend, but we can force it if needed. 
    // Currently generic controller toggles. 
    // For direct 'present'/'pending' setting, backend needs to support it or we just call toggle.
    // Assuming toggle for fee/tute based on current click.
    await axios.patch(url);
}

if (onUpdate) onUpdate();
        } catch (error) {
    console.error("Failed to update status", error);
    setStatus(getNormalizedStatus(initialStatus)); // Revert
    alert("Failed to update status. Please try again.");
} finally {
    setLoading(false);
}
    };

const renderDialogContent = () => {
    if (type === 'attendance') {
        return (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                    variant={status === 'present' ? "contained" : "outlined"}
                    onClick={() => handleUpdate('present')}
                    startIcon={<CheckCircle />}
                    sx={{
                        borderRadius: '12px', textTransform: 'none', px: 3,
                        bgcolor: status === 'present' ? '#00ff66' : 'transparent',
                        color: status === 'present' ? '#000' : '#00ff66',
                        borderColor: '#00ff66',
                        '&:hover': { bgcolor: status === 'present' ? '#00cc52' : alpha('#00ff66', 0.1), borderColor: '#00ff66' }
                    }}
                >
                    Present
                </Button>
                <Button
                    variant={status === 'absent' ? "contained" : "outlined"}
                    onClick={() => handleUpdate('absent')}
                    startIcon={<Cancel />}
                    sx={{
                        borderRadius: '12px', textTransform: 'none', px: 3,
                        bgcolor: status === 'absent' ? '#ff2a2a' : 'transparent',
                        color: status === 'absent' ? '#fff' : '#ff2a2a',
                        borderColor: '#ff2a2a',
                        '&:hover': { bgcolor: status === 'absent' ? '#d92020' : alpha('#ff2a2a', 0.1), borderColor: '#ff2a2a' }
                    }}
                >
                    Absent
                </Button>
                <Button
                    variant="text"
                    onClick={() => handleUpdate('pending')}
                    startIcon={<HourglassEmpty />}
                    sx={{ borderRadius: '12px', textTransform: 'none', color: 'text.secondary' }}
                >
                    Clear
                </Button>
            </Box>
        );
    } else {
        const isFee = type === 'fee';
        const isDone = status === 'present';
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 1 }}>
                <Typography color="text.secondary">
                    Current Status: <strong style={{ color: isDone ? '#00ff66' : '#ff2a2a' }}>{isDone ? 'Paid / Issued' : 'Pending'}</strong>
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => handleUpdate(isDone ? 'pending' : 'present')}
                    sx={{
                        borderRadius: '12px',
                        background: isDone
                            ? 'linear-gradient(135deg, #ff2a2a 0%, #aa0000 100%)'
                            : `linear-gradient(135deg, ${isFee ? '#f59e0b' : '#00f7ff'} 0%, ${isFee ? '#d97706' : '#0099ff'} 100%)`,
                        boxShadow: isDone
                            ? '0 4px 15px rgba(255, 42, 42, 0.4)'
                            : `0 4px 15px ${isFee ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0, 247, 255, 0.4)'}`,
                        fontWeight: 700,
                        minWidth: 150
                    }}
                >
                    {isDone ? `Mark as Unpaid/Returned` : `Mark as ${isFee ? 'Paid' : 'Issued'}`}
                </Button>
            </Box>
        );
    }
};

return (
    <>
        <Tooltip title={getLabel()} arrow TransitionComponent={Zoom}>
            <IconButton
                onClick={handleClick}
                size="small"
                component={motion.button}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                sx={{ p: 0.5 }}
            >
                cursor: 'pointer',
                color: status === 'present' ? 'white' : 'inherit'
                        }}>{label}</div>
                    ) : getIcon(status)}
        </IconButton>
    </Tooltip >

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
