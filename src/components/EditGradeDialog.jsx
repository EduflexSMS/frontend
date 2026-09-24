import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function EditGradeDialog({
  open,
  onClose,
  grade, // null if creating a new grade, or { name, shortCode, whatsappLink, studentCount }
  onSaved,
  onDeleted
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEditing = Boolean(grade && grade.name);

  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    whatsappLink: ''
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setConfirmDelete(false);
      if (grade) {
        setFormData({
          name: grade.name || '',
          shortCode: grade.shortCode || '',
          whatsappLink: grade.whatsappLink || ''
        });
      } else {
        setFormData({
          name: '',
          shortCode: '',
          whatsappLink: ''
        });
      }
    }
  }, [open, grade]);

  // Compute live preview badge
  const previewBadge = () => {
    if (formData.shortCode && formData.shortCode.trim()) {
      return formData.shortCode.trim().toUpperCase().slice(0, 3);
    }
    const name = formData.name.trim();
    if (!name) return '??';
    if (name.toLowerCase() === 'rapid revision') return 'RR';
    const numMatch = name.match(/\d+/);
    if (numMatch) return numMatch[0].padStart(2, '0');
    const words = name.split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Grade name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let res;
      if (isEditing) {
        res = await axios.put(
          `${API_BASE_URL}/api/students/grades/${encodeURIComponent(grade.name)}`,
          {
            name: formData.name.trim(),
            shortCode: formData.shortCode.trim(),
            whatsappLink: formData.whatsappLink.trim()
          }
        );
      } else {
        res = await axios.post(`${API_BASE_URL}/api/students/grades`, {
          name: formData.name.trim(),
          shortCode: formData.shortCode.trim(),
          whatsappLink: formData.whatsappLink.trim()
        });
      }

      if (onSaved) {
        onSaved(res.data?.grade || { name: formData.name.trim() });
      }
      onClose();
    } catch (err) {
      console.error('Error saving grade:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/students/grades/${encodeURIComponent(grade.name)}?force=false`
      );

      if (onDeleted) {
        onDeleted(grade.name);
      }
      onClose();
    } catch (err) {
      console.error('Error deleting grade:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete grade');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving || deleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.12)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.15)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          color: isDark ? '#f8fafc' : '#0f172a',
          overflow: 'hidden'
        }
      }}
    >
      <form onSubmit={handleSave}>
        {/* ── Dialog Header ── */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            pt: 2.2,
            px: 2.5,
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: 'rgba(34, 211, 238, 0.12)',
                border: '1.5px solid rgba(34, 211, 238, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#22d3ee',
                letterSpacing: '-0.5px'
              }}
            >
              {previewBadge()}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>
                {isEditing ? 'Edit Grade / Class' : 'Add New Grade / Class'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text3, #94a3b8)', display: 'block', mt: 0.2 }}>
                {isEditing ? `Customizing "${grade.name}"` : 'Create a new grade or batch card'}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving || deleting}
            size="small"
            sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
              '&:hover': {
                color: isDark ? '#ffffff' : '#0f172a',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'
              }
            }}
          >
            ✕
          </IconButton>
        </DialogTitle>

        {/* ── Dialog Content ── */}
        <DialogContent sx={{ pt: 2.5, pb: 2, px: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#f43f5e',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </Box>
          )}

          {isEditing && grade.studentCount !== undefined && (
            <Box
              sx={{
                px: 1.8,
                py: 1.2,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text2, #94a3b8)', fontSize: '0.82rem' }}>
                Enrolled Students
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#818cf8', fontSize: '0.9rem' }}>
                👥 {grade.studentCount} student{grade.studentCount === 1 ? '' : 's'}
              </Typography>
            </Box>
          )}

          {/* ── Grade Name ── */}
          <TextField
            label="Grade / Class Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            size="small"
            placeholder="e.g. Grade 06, 2026 Revision, Advanced Level"
            helperText="The label displayed on the student card and reports"
            sx={{
              '& .MuiInputBase-root': { color: 'inherit' },
              '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
              '& .MuiFormHelperText-root': { color: 'var(--text3, #64748b)', fontSize: '0.72rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent, #6366f1)' }
            }}
          />

          {/* ── Badge / Short Code ── */}
          <TextField
            label="Card Badge / Short Code (Optional)"
            name="shortCode"
            value={formData.shortCode}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="e.g. 06, RR, 26, AL"
            helperText="Text shown inside the circle (leave blank to auto-detect)"
            inputProps={{ maxLength: 4 }}
            sx={{
              '& .MuiInputBase-root': { color: 'inherit' },
              '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
              '& .MuiFormHelperText-root': { color: 'var(--text3, #64748b)', fontSize: '0.72rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent, #6366f1)' }
            }}
          />

          {/* ── WhatsApp Group Link ── */}
          <TextField
            label="WhatsApp Group Link (Optional)"
            name="whatsappLink"
            value={formData.whatsappLink}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="https://chat.whatsapp.com/..."
            helperText="Link sent when clicking 'Send WhatsApp Link' for this class"
            sx={{
              '& .MuiInputBase-root': { color: 'inherit' },
              '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
              '& .MuiFormHelperText-root': { color: 'var(--text3, #64748b)', fontSize: '0.72rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent, #6366f1)' }
            }}
          />

          {isEditing && (
            <Typography variant="caption" sx={{ color: 'var(--text3, #64748b)', fontSize: '0.73rem', lineHeight: 1.4 }}>
              ⚡ <strong>Notice:</strong> Renaming this grade will automatically update all enrolled student profiles, subject schedules, exams, and attendance records.
            </Typography>
          )}

          {confirmDelete && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                fontSize: '0.82rem'
              }}
            >
              <strong>Are you sure?</strong>
              {grade?.studentCount > 0 ? (
                <div style={{ marginTop: '4px' }}>
                  There are {grade.studentCount} student(s) enrolled in this grade. Deletion will be blocked until students are reassigned.
                </div>
              ) : (
                <div style={{ marginTop: '4px' }}>
                  This will remove the grade card and its schedules permanently.
                </div>
              )}
            </Box>
          )}
        </DialogContent>

        {/* ── Dialog Actions ── */}
        <DialogActions
          sx={{
            px: 2.5,
            py: 2,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          {isEditing ? (
            <Button
              type="button"
              color="error"
              onClick={handleDelete}
              disabled={saving || deleting}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                fontSize: '0.82rem',
                color: confirmDelete ? '#fff' : '#f43f5e',
                bgcolor: confirmDelete ? '#ef4444' : 'transparent',
                '&:hover': {
                  bgcolor: confirmDelete ? '#dc2626' : 'rgba(244, 63, 94, 0.1)'
                }
              }}
            >
              {deleting ? <CircularProgress size={16} color="inherit" /> : confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
          ) : (
            <div />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || deleting}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                bgcolor: 'var(--accent, #6366f1)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                '&:hover': {
                  bgcolor: '#4f46e5'
                }
              }}
            >
              {saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Grade'
              )}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
