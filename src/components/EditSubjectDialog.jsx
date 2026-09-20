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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../config';

const COLOR_PRESETS = [
  { color: '#6366f1', label: 'Indigo' },
  { color: '#22d3ee', label: 'Cyan' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#f43f5e', label: 'Rose' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#14b8a6', label: 'Teal' },
  { color: '#fb923c', label: 'Orange' }
];

const ALL_GRADES = [
  'Grade 03', 'Grade 04', 'Grade 05', 'Grade 06',
  'Grade 07', 'Grade 08', 'Grade 09', 'Grade 10',
  'Grade 11', 'Rapid Revision'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function EditSubjectDialog({
  open,
  onClose,
  subject, // null if creating a new subject
  defaultGrade,
  onSaved,
  onDeleted
}) {
  const isEditing = Boolean(subject && subject.name);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fee: 0,
    feeType: 'monthly',
    classDaysCount: 5,
    color: '#6366f1',
    teacherName: ''
  });

  // Array of { grade: string, day: string }
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form when opened or subject changes
  useEffect(() => {
    if (open) {
      setError(null);
      fetchTeachers();

      if (subject) {
        setFormData({
          name: subject.name || '',
          description: subject.description || '',
          fee: subject.fee !== undefined ? subject.fee : 0,
          feeType: subject.feeType || 'monthly',
          classDaysCount: subject.classDaysCount || 5,
          color: subject.color || '#6366f1',
          teacherName: ''
        });

        // Initialize grade schedules
        if (subject.gradeSchedules && subject.gradeSchedules.length > 0) {
          setSelectedGrades(
            subject.gradeSchedules.map(s => ({
              grade: s.grade,
              day: s.day || 'Monday'
            }))
          );
        } else if (defaultGrade) {
          setSelectedGrades([{ grade: defaultGrade, day: 'Monday' }]);
        } else {
          setSelectedGrades([]);
        }
      } else {
        // Create mode
        setFormData({
          name: '',
          description: '',
          fee: 0,
          feeType: 'monthly',
          classDaysCount: 5,
          color: '#6366f1',
          teacherName: ''
        });
        setSelectedGrades(defaultGrade ? [{ grade: defaultGrade, day: 'Monday' }] : []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subject, defaultGrade]);

  // Fetch teachers and preselect if assigned
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/teachers`);
      const teacherList = res.data || [];
      setTeachers(teacherList);

      if (subject && subject.name) {
        const assigned = teacherList.find(t => t.assignedSubject === subject.name);
        if (assigned) {
          setFormData(prev => ({ ...prev, teacherName: assigned.username }));
        }
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'classDaysCount' ? Number(value) : value
    }));
  };

  const handleToggleGrade = (grade) => {
    setSelectedGrades(prev => {
      const exists = prev.find(g => g.grade === grade);
      if (exists) {
        return prev.filter(g => g.grade !== grade);
      } else {
        return [...prev, { grade, day: 'Monday' }];
      }
    });
  };

  const handleGradeDayChange = (grade, newDay) => {
    setSelectedGrades(prev =>
      prev.map(g => (g.grade === grade ? { ...g, day: newDay } : g))
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError('Subject name is required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description,
      fee: Number(formData.fee) || 0,
      feeType: formData.feeType,
      classDaysCount: Number(formData.classDaysCount) || 5,
      color: formData.color,
      teacherName: formData.teacherName,
      gradeSchedules: selectedGrades
    };

    try {
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/subjects/${encodeURIComponent(subject.name)}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE_URL}/api/subjects`, payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving subject:', err);
      setError(err.response?.data?.message || 'Failed to save subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subject || !subject.name) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${subject.name}"?\n\nThis will remove student enrollments and unassign any linked teacher.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/api/subjects/${encodeURIComponent(subject.name)}`);
      if (onDeleted) onDeleted(subject.name);
      onClose();
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!saving && !deleting ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 20,
          background: 'var(--bg2, #1e293b)',
          color: 'var(--text, #f8fafc)',
          border: '1px solid var(--border2, rgba(255,255,255,0.12))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              bgcolor: formData.color ? `${formData.color}22` : 'rgba(99,102,241,0.15)',
              border: `1.5px solid ${formData.color || '#6366f1'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: formData.color || '#6366f1'
            }}
          >
            📚
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'inherit' }}>
              {isEditing ? 'Edit Subject' : 'Add New Subject'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text3, #94a3b8)', display: 'block' }}>
              {isEditing ? `Configure "${subject.name}" details and grades` : 'Create a new subject record'}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          disabled={saving || deleting}
          size="small"
          sx={{
            color: 'var(--text2, #94a3b8)',
            '&:hover': { color: 'var(--text, #fff)', bgcolor: 'rgba(255,255,255,0.08)' }
          }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
        {error && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#f43f5e',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            ⚠️ {error}
          </Box>
        )}

        {/* ── Subject Name ── */}
        <TextField
          label="Subject Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          size="small"
          placeholder="e.g. Mathematics, Science, English"
          sx={{
            '& .MuiInputBase-root': { color: 'inherit' },
            '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent, #6366f1)' }
          }}
        />

        {/* ── Fee & Class Days ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr' }, gap: 1.5 }}>
          <TextField
            label="Fee Amount (LKR)"
            name="fee"
            type="number"
            value={formData.fee}
            onChange={handleChange}
            size="small"
            InputProps={{ inputProps: { min: 0 } }}
            sx={{
              '& .MuiInputBase-root': { color: 'inherit' },
              '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' }
            }}
          />

          <FormControl size="small">
            <InputLabel sx={{ color: 'var(--text2, #94a3b8)' }}>Fee Type</InputLabel>
            <Select
              name="feeType"
              value={formData.feeType}
              label="Fee Type"
              onChange={handleChange}
              sx={{
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' }
              }}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="daily">Per Day</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Monthly Sessions"
            name="classDaysCount"
            type="number"
            value={formData.classDaysCount}
            onChange={handleChange}
            size="small"
            placeholder="e.g. 4 or 5"
            InputProps={{ inputProps: { min: 1, max: 31 } }}
            sx={{
              '& .MuiInputBase-root': { color: 'inherit' },
              '& .MuiInputLabel-root': { color: 'var(--text2, #94a3b8)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' }
            }}
          />
        </Box>

        {/* ── Assigned Teacher ── */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'var(--text2, #94a3b8)' }}>Assigned Teacher</InputLabel>
          <Select
            name="teacherName"
            value={formData.teacherName}
            label="Assigned Teacher"
            onChange={handleChange}
            sx={{
              color: 'inherit',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border2, rgba(255,255,255,0.15))' }
            }}
          >
            <MenuItem value="">
              <em>None / Unassigned</em>
            </MenuItem>
            {teachers.map(t => (
              <MenuItem key={t._id} value={t.username}>
                👤 {t.username} {t.assignedSubject && t.assignedSubject !== subject?.name ? `(${t.assignedSubject})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ── Theme Color ── */}
        <Box>
          <Typography variant="caption" sx={{ color: 'var(--text2, #94a3b8)', fontWeight: 700, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Theme Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
            {COLOR_PRESETS.map(p => (
              <Tooltip key={p.color} title={p.label}>
                <Box
                  onClick={() => setFormData(prev => ({ ...prev, color: p.color }))}
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: p.color,
                    cursor: 'pointer',
                    border: formData.color === p.color ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: formData.color === p.color ? `0 0 12px ${p.color}` : 'none',
                    transform: formData.color === p.color ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    '&:hover': { transform: 'scale(1.2)' }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* ── Applicable Grades & Schedule ── */}
        <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: 'var(--surface, rgba(255,255,255,0.03))', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
            <Typography variant="caption" sx={{ color: 'var(--text2, #94a3b8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Applicable Grades & Schedule
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--accent, #6366f1)', fontWeight: 600 }}>
              {selectedGrades.length} Grades selected
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ color: 'var(--text3, #64748b)', display: 'block', mb: 1.5, lineHeight: 1.3 }}>
            Select which grades offer this subject. Uncheck to remove this subject from other grades (e.g. Rapid Revision).
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ALL_GRADES.map(grade => {
              const gradeItem = selectedGrades.find(g => g.grade === grade);
              const isSelected = Boolean(gradeItem);

              return (
                <Chip
                  key={grade}
                  label={grade}
                  clickable
                  onClick={() => handleToggleGrade(grade)}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8rem',
                    bgcolor: isSelected ? 'var(--accent, #6366f1)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#fff' : 'var(--text2, #94a3b8)',
                    border: isSelected ? '1px solid var(--accent, #6366f1)' : '1px solid var(--border2, rgba(255,255,255,0.1))',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isSelected ? 'var(--accent, #6366f1)' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                />
              );
            })}
          </Box>

          {/* Day selection for selected grades */}
          {selectedGrades.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--text3, #64748b)', fontWeight: 600 }}>
                Class Days:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                {selectedGrades.map(sg => (
                  <Box
                    key={sg.grade}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: '6px 10px',
                      borderRadius: 1.5,
                      bgcolor: 'var(--surface2, rgba(255,255,255,0.05))',
                      border: '1px solid var(--border, rgba(255,255,255,0.06))'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text, #fff)' }}>
                      {sg.grade}
                    </Typography>
                    <Select
                      size="small"
                      value={sg.day}
                      onChange={(e) => handleGradeDayChange(sg.grade, e.target.value)}
                      sx={{
                        fontSize: '0.75rem',
                        height: 28,
                        color: 'inherit',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        bgcolor: 'rgba(0,0,0,0.15)',
                        borderRadius: 1
                      }}
                    >
                      {DAYS_OF_WEEK.map(d => (
                        <MenuItem key={d} value={d} sx={{ fontSize: '0.75rem' }}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.2,
          borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {isEditing ? (
          <Button
            onClick={handleDelete}
            disabled={saving || deleting}
            color="error"
            size="small"
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              px: 1.5,
              color: '#f43f5e',
              '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.12)' }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Subject'}
          </Button>
        ) : (
          <div />
        )}

        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button
            onClick={onClose}
            disabled={saving || deleting}
            size="small"
            sx={{
              color: 'var(--text2, #94a3b8)',
              fontWeight: 600,
              textTransform: 'none',
              px: 2
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || deleting}
            sx={{
              bgcolor: 'var(--accent, #6366f1)',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {saving ? (
              <CircularProgress size={18} sx={{ color: '#fff', mr: 1 }} />
            ) : null}
            {isEditing ? 'Save Changes' : 'Create Subject'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
