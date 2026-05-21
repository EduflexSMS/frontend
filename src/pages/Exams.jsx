import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config';

const GRADE_COLORS = {
  A: { bg: 'rgba(0,212,160,0.12)', color: '#00c896', label: 'Distinction' },
  B: { bg: 'rgba(99,179,237,0.12)', color: '#63b3ed', label: 'Very Good' },
  C: { bg: 'rgba(246,173,85,0.12)', color: '#f6ad55', label: 'Credit' },
  S: { bg: 'rgba(252,129,74,0.12)', color: '#fc814a', label: 'Ordinary' },
  F: { bg: 'rgba(252,75,108,0.12)', color: '#fc4b6c', label: 'Failure' },
  AB: { bg: 'rgba(255,255,255,0.08)', color: '#a0a5c0', label: 'Absent' },
};

const GRADE_RANGES = [
  { grade: 'A', range: '75–100', label: 'Distinction', color: '#00c896' },
  { grade: 'B', range: '65–74', label: 'Very Good', color: '#63b3ed' },
  { grade: 'C', range: '55–64', label: 'Credit', color: '#f6ad55' },
  { grade: 'S', range: '40–54', label: 'Ordinary', color: '#fc814a' },
  { grade: 'F', range: '0–39', label: 'Failure', color: '#fc4b6c' },
];

export default function Exams() {
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const C = {
    bg: isDark ? '#0d0f1e' : '#f7f8fc',
    surface: isDark ? '#161827' : '#ffffff',
    surfaceAlt: isDark ? '#1c1f32' : '#f0f2fa',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    text: isDark ? '#e8eaf6' : '#1a1d35',
    muted: isDark ? '#6b7094' : '#8e93b5',
    accent: '#ff5c7c',
    accentHover: '#ff3d6b',
    cyan: '#00cfff',
  };

  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStudents, setExamStudents] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'marks', 'id'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => {
    if (selectedGrade && selectedSubject) fetchExams();
  }, [selectedGrade, selectedSubject]);

  const getToken = () => {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info).token : '';
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSubjects(data);
    } catch (err) {
      console.error('fetchSubjects error:', err?.response?.status, err?.response?.data, err?.message);
      toast.error('Failed to load subjects');
    }
  };

  const fetchExams = async () => {
    try {
      console.log('fetchExams → token:', getToken()?.slice(0,20), 'grade:', selectedGrade, 'subject:', selectedSubject);
      const { data } = await axios.get(
        `${API_BASE_URL}/api/exams?grade=${selectedGrade}&subject=${selectedSubject}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setExams(data);
    } catch (err) {
      console.error('fetchExams error:', err?.response?.status, err?.response?.data, err?.message);
      toast.error('Failed to load exams');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      console.log('createExam → payload:', { title: newExamTitle, grade: selectedGrade, subject: selectedSubject });
      await axios.post(`${API_BASE_URL}/api/exams`,
        { title: newExamTitle, grade: selectedGrade, subject: selectedSubject },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Exam created');
      setShowCreateModal(false);
      setNewExamTitle('');
      fetchExams();
    } catch (err) {
      console.error('createExam error:', err?.response?.status, err?.response?.data, err?.message);
      toast.error(`Failed to create exam: ${err?.response?.data?.error || err?.response?.data?.message || err?.message}`);
    }
  };

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    try {
      const { data: studentsData } = await axios.get(
        `${API_BASE_URL}/api/students?grade=${exam.grade}&limit=1000`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const studentsArray = studentsData.students || [];
      const enrolled = studentsArray.filter(s =>
        s.enrollments?.some(sub => sub.subject === exam.subject.name || sub.subject === exam.subject._id)
      );
      const mapped = enrolled.map(student => {
        const existing = exam.results.find(r => (r.student?._id || r.student) === student._id);
        return { ...student, marks: existing ? existing.marks : '', gradeResult: existing ? existing.grade : '' };
      });
      setExamStudents(mapped);
    } catch { toast.error('Failed to load exam details'); }
  };

  const handleMarkChange = (studentId, val) => {
    setExamStudents(prev => prev.map(s => s._id === studentId ? { ...s, marks: val } : s));
  };

  const handleSaveMarks = async (studentId, marks) => {
    if (marks !== 'AB' && (marks === '' || isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > 100)) {
      return toast.error('Enter a valid mark (0–100) or AB');
    }
    setSavingId(studentId);
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/exams/${selectedExam._id}/marks`,
        { studentId, marks: Number(marks) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const updated = data.results.find(r => r.student._id === studentId);
      setExamStudents(prev => prev.map(s =>
        s._id === studentId ? { ...s, marks: updated.marks, gradeResult: updated.grade } : s
      ));
      setSelectedExam(data);
      toast.success('Marks saved');
    } catch { toast.error('Failed to save marks'); }
    finally { setSavingId(null); }
  };

  const handleDeleteExam = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selectedExam.title}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/exams/${selectedExam._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Exam deleted');
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('pdf-report-content');
      
      // Calculate exact A4 aspect ratio to avoid white space at bottom
      const a4Ratio = 297 / 210;
      const elementWidth = element.offsetWidth;
      const a4HeightInPx = elementWidth * a4Ratio;
      
      const originalHeight = element.style.minHeight;
      const currentHeight = element.scrollHeight;
      const neededPages = Math.ceil(currentHeight / a4HeightInPx);
      const perfectHeight = neededPages * a4HeightInPx;
      
      // Force element to be a perfect multiple of A4 page height
      element.style.minHeight = `${perfectHeight}px`;

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0d0f1e' });
      
      // Restore original height
      element.style.minHeight = originalHeight;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Fill background to avoid white flash
      pdf.setFillColor(13, 15, 30);
      pdf.rect(0, 0, pdfWidth, pageHeight, 'F');
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 1) { // >1 to handle floating point rounding
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.setFillColor(13, 15, 30);
        pdf.rect(0, 0, pdfWidth, pageHeight, 'F');
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${selectedExam.title} - Report.pdf`);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Computed stats ────────────────────────────────────────────────────────
  const gradedStudents = examStudents.filter(s => s.gradeResult && s.gradeResult !== 'AB');
  const classAvg = gradedStudents.length
    ? Math.round(gradedStudents.reduce((a, s) => a + Number(s.marks), 0) / gradedStudents.length)
    : null;
  const passCount = gradedStudents.filter(s => Number(s.marks) >= 40).length;

  // ─── Sorting logic ─────────────────────────────────────────────────────────
  const handleHeaderClick = (column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection(column === 'marks' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return <span style={{ marginLeft: 6, opacity: 0.35, fontSize: 11 }}>↕</span>;
    return <span style={{ marginLeft: 6, color: C.cyan, fontSize: 11 }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  const getSortedStudents = () => {
    return [...examStudents].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortBy === 'marks') {
        const hasA = a.marks !== '' && a.marks !== undefined && a.marks !== null;
        const hasB = b.marks !== '' && b.marks !== undefined && b.marks !== null;
        if (!hasA && !hasB) return 0;
        if (!hasA) return 1;
        if (!hasB) return -1;

        // Check for 'AB' (Absent)
        if (a.marks === 'AB' && b.marks === 'AB') return 0;
        if (a.marks === 'AB') return 1; // AB goes below numbers
        if (b.marks === 'AB') return -1; // AB goes below numbers

        const marksA = Number(a.marks);
        const marksB = Number(b.marks);
        if (marksA === marksB) {
          return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
        }
        return sortDirection === 'asc' ? marksA - marksB : marksB - marksA;
      }
      if (sortBy === 'id') {
        const idA = (a.indexNumber || '').toLowerCase();
        const idB = (b.indexNumber || '').toLowerCase();
        return sortDirection === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA);
      }
      return 0;
    });
  };

  // ─── Shared input style ────────────────────────────────────────────────────
  const selectStyle = {
    padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.surface, color: C.text, fontSize: 14, outline: 'none',
    cursor: 'pointer', flex: 1, minWidth: 180, appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7094' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: 36,
  };

  return (
    <div style={{ padding: '28px 24px', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <ToastContainer theme={isDark ? 'dark' : 'light'} position="top-right" />

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>Manage exams</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
            {selectedGrade && selectedSubject
              ? `Showing exams for ${selectedGrade} — ${subjects.find(s => s._id === selectedSubject)?.name || ''}`
              : 'Select a grade and subject to get started'}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedExam(null); }} style={selectStyle}>
          <option value="">Select grade</option>
          {[...Array(8)].map((_, i) => {
            const g = `Grade ${String(i + 6).padStart(2, '0')}`;
            return <option key={i} value={g}>{g}</option>;
          })}
        </select>

        <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedExam(null); }} style={selectStyle}>
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        {selectedGrade && selectedSubject && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: C.accent, color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create exam
          </motion.button>
        )}
      </div>

      {/* ── Exam list ── */}
      <AnimatePresence mode="wait">
        {!selectedExam && selectedGrade && selectedSubject && (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {exams.length === 0 ? (
              <div style={{
                border: `1.5px dashed ${C.border}`, borderRadius: 16, padding: '60px 24px',
                textAlign: 'center', color: C.muted,
              }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>📋</div>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: C.text }}>No exams yet</p>
                <p style={{ fontSize: 13 }}>Click "Create exam" to add the first one.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {exams.map(exam => (
                  <motion.div
                    key={exam._id}
                    whileHover={{ y: -4, boxShadow: `0 8px 32px rgba(0,0,0,${isDark ? 0.4 : 0.1})` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectExam(exam)}
                    style={{
                      padding: 20, borderRadius: 14, background: C.surface,
                      border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'box-shadow .2s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: `rgba(255,92,124,0.12)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                      fontSize: 18,
                    }}>📝</div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>{exam.title}</h3>
                    <p style={{ margin: '0 0 14px', fontSize: 12, color: C.muted }}>
                      {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 600, color: C.accent,
                      background: 'rgba(255,92,124,0.1)', padding: '4px 10px', borderRadius: 20,
                    }}>
                      {exam.results.length} result{exam.results.length !== 1 ? 's' : ''} recorded
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Empty state ── */}
        {!selectedGrade || !selectedSubject ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{
              borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`,
              padding: '64px 24px', textAlign: 'center', color: C.muted,
            }}>
              <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.35 }}>🎓</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 6 }}>Select grade & subject</p>
              <p style={{ fontSize: 13 }}>Choose from the dropdowns above to view or manage exams.</p>
            </div>
          </motion.div>
        ) : null}

        {/* ── Exam detail ── */}
        {selectedExam && (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Detail header */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: '16px 20px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <button
                  onClick={() => setSelectedExam(null)}
                  style={{
                    background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 6,
                  }}
                >
                  ← Back to exams
                </button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selectedExam.title}</h3>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>
                  {selectedExam.grade} · {selectedExam.subject?.name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleDeleteExam}
                  style={{
                    padding: '9px 18px', borderRadius: 10, border: `1px solid ${C.accent}`,
                    background: 'transparent', color: C.accent, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  🗑 Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setShowReport(true)}
                  style={{
                    padding: '9px 18px', borderRadius: 10, border: 'none',
                    background: C.cyan, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  🖨 View Report
                </motion.button>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Students', val: examStudents.length },
                { label: 'Graded', val: gradedStudents.length },
                { label: 'Average', val: classAvg !== null ? `${classAvg}%` : '—' },
                { label: 'Pass rate', val: gradedStudents.length ? `${Math.round(passCount / gradedStudents.length * 100)}%` : '—' },
              ].map(s => (
                <div key={s.label} style={{
                  background: C.surfaceAlt, borderRadius: 12, padding: '14px 16px',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Controls Row (Legend & Sorting) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              {/* Grade legend */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GRADE_RANGES.map(g => (
                  <span key={g.grade} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
                    background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30`,
                  }}>
                    {g.grade}: {g.range}
                  </span>
                ))}
              </div>

              {/* Sorting Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surfaceAlt, padding: '4px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted, padding: '0 8px', fontWeight: 600 }}>Sort:</span>
                {[
                  { id: 'name', label: 'Name A-Z', dir: 'asc' },
                  { id: 'marks', label: 'Highest Marks', dir: 'desc' },
                  { id: 'id', label: 'Student ID', dir: 'asc' }
                ].map(opt => {
                  const isActive = sortBy === opt.id && sortDirection === opt.dir;
                  return (
                    <button
                      key={opt.id + opt.dir}
                      onClick={() => { setSortBy(opt.id); setSortDirection(opt.dir); }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none',
                        background: isActive ? C.cyan : 'transparent',
                        color: isActive ? '#000' : C.text,
                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.surfaceAlt }}>
                      <th
                        onClick={() => handleHeaderClick('name')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: sortBy === 'name' ? C.text : C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`, cursor: 'pointer', userSelect: 'none'
                        }}
                      >
                        Student {renderSortIcon('name')}
                      </th>
                      <th
                        onClick={() => handleHeaderClick('id')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: sortBy === 'id' ? C.text : C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`, cursor: 'pointer', userSelect: 'none'
                        }}
                      >
                        ID {renderSortIcon('id')}
                      </th>
                      <th
                        onClick={() => handleHeaderClick('marks')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: sortBy === 'marks' ? C.text : C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`, cursor: 'pointer', userSelect: 'none'
                        }}
                      >
                        Marks /100 {renderSortIcon('marks')}
                      </th>
                      <th
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        Grade
                      </th>
                      <th
                        style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedStudents().map(student => {
                      const g = GRADE_COLORS[student.gradeResult];
                      return (
                        <tr key={student._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '13px 16px', fontWeight: 500 }}>{student.name}</td>
                          <td style={{ padding: '13px 16px', color: C.muted, fontSize: 13 }}>{student.indexNumber || '—'}</td>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="text"
                                placeholder="—"
                                value={student.marks}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*$/.test(val) || /^ab$/i.test(val) || /^a$/i.test(val)) {
                                    handleMarkChange(student._id, val.toUpperCase());
                                  }
                                }}
                                style={{
                                  width: 60, padding: '7px 10px', borderRadius: 8,
                                  border: `1px solid ${C.border}`, background: C.surfaceAlt,
                                  color: C.text, fontSize: 14, outline: 'none', textAlign: 'center'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = student.marks === 'AB' ? '' : 'AB';
                                  handleMarkChange(student._id, newVal);
                                }}
                                style={{
                                  padding: '7px 10px', borderRadius: 8,
                                  border: `1px solid ${student.marks === 'AB' ? 'rgba(252,75,108,0.4)' : C.border}`,
                                  background: student.marks === 'AB' ? 'rgba(252,75,108,0.15)' : 'transparent',
                                  color: student.marks === 'AB' ? '#fc4b6c' : C.muted,
                                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                              >
                                AB
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            {student.gradeResult ? (
                              <span style={{
                                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                                fontSize: 12, fontWeight: 700,
                                background: g?.bg, color: g?.color,
                              }}>
                                {student.gradeResult}
                              </span>
                            ) : (
                              <span style={{ color: C.muted, fontSize: 13 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <motion.button
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                              onClick={() => handleSaveMarks(student._id, student.marks)}
                              disabled={savingId === student._id}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: 'rgba(0,200,150,0.12)', color: '#00c896',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                opacity: savingId === student._id ? 0.6 : 1,
                              }}
                            >
                              {savingId === student._id ? 'Saving…' : 'Save'}
                            </motion.button>
                          </td>
                        </tr>
                      );
                    })}
                    {examStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>
                          No students enrolled in this subject for this grade.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 1000, padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 28, width: 400, maxWidth: '100%',
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Create new exam</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: C.muted }}>
                {selectedGrade} · {subjects.find(s => s._id === selectedSubject)?.name}
              </p>
              <input
                type="text"
                placeholder="Exam title (e.g. 1st Term Test)"
                value={newExamTitle}
                onChange={e => setNewExamTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateExam(e)}
                autoFocus
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surfaceAlt,
                  color: C.text, fontSize: 14, outline: 'none', marginBottom: 18, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.text, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCreateExam}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                    background: C.accent, color: '#fff', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Report modal ── */}
      <AnimatePresence>
        {showReport && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 2000, padding: 20, flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '210mm', marginBottom: 15 }}>
                <button
                  onClick={() => setShowReport(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  style={{ background: C.cyan, border: 'none', color: '#000', padding: '8px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {isGenerating ? 'Generating...' : '📥 Download PDF'}
                </button>
            </div>

            {/* Report Preview Wrapper */}
            <div style={{ width: '100%', maxWidth: '210mm', height: '80vh', overflowY: 'auto', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div id="pdf-report-content" style={{
                  backgroundColor: '#0d0f1e',
                  color: '#ffffff', padding: '40px 50px', minHeight: '297mm',
                  fontFamily: "'Outfit', 'Inter', sans-serif", margin: '0 auto', boxSizing: 'border-box',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Decorative elements */}
                  <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,207,255,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,92,124,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 30, position: 'relative', zIndex: 2 }}>
                      <div>
                          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff' }}>
                              {selectedExam.title}
                          </h1>
                          <p style={{ margin: '8px 0 0', fontSize: 16, color: '#a0a5c0', letterSpacing: 1 }}>
                              Grade {selectedExam.grade} • {selectedExam.subject?.name}
                          </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: 15, color: '#00cfff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Eduflex</p>
                          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7094' }}>
                              {new Date(selectedExam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                      </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 15, marginBottom: 35, position: 'relative', zIndex: 2 }}>
                      {[
                          { label: 'Total Students', value: examStudents.length, color: '#63b3ed' },
                          { label: 'Graded', value: gradedStudents.length, color: '#f6ad55' },
                          { label: 'Average', value: classAvg !== null ? `${classAvg}%` : '—', color: '#00c896' },
                          { label: 'Pass Rate', value: gradedStudents.length ? `${Math.round(passCount / gradedStudents.length * 100)}%` : '—', color: '#fc814a' },
                      ].map(stat => (
                          <div key={stat.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(10px)' }}>
                              <p style={{ margin: 0, fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</p>
                              <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                          </div>
                      ))}
                  </div>

                  {/* Table */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                              <tr>
                                  {['#', 'Student Name', 'ID', 'Marks', 'Grade'].map((h, i) => (
                                      <th key={h} style={{ padding: '16px 12px', fontSize: 12, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: i === 3 || i === 4 ? 'center' : 'left' }}>{h}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody>
                              {getSortedStudents().map((s, i) => {
                                  const g = GRADE_COLORS[s.gradeResult];
                                  return (
                                      <tr key={s._id}>
                                          <td style={{ padding: '14px 12px', fontSize: 13, color: '#6b7094', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{String(i + 1).padStart(2, '0')}</td>
                                          <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 600, color: '#e8eaf6', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{s.name}</td>
                                          <td style={{ padding: '14px 12px', fontSize: 13, color: '#a0a5c0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{s.indexNumber || '—'}</td>
                                          <td style={{ padding: '14px 12px', fontSize: 15, fontWeight: 700, color: '#ffffff', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                              {s.marks !== '' ? s.marks : '—'}
                                          </td>
                                          <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                              {s.gradeResult ? (
                                                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: g?.bg, color: g?.color }}>
                                                      {s.gradeResult}
                                                  </span>
                                              ) : (
                                                  <span style={{ color: '#6b7094' }}>—</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>

                  {/* Legend */}
                  <div style={{ marginTop: 35, display: 'flex', flexWrap: 'wrap', gap: 15, justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                      {GRADE_RANGES.map(g => (
                          <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: g.color }} />
                              <span style={{ fontSize: 12, color: '#a0a5c0', fontWeight: 500 }}>{g.grade}: {g.range} ({g.label})</span>
                          </div>
                      ))}
                  </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}