import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function Exams({ isTeacherView = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getUserInfo = () => {
    try {
      const raw = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const userInfo = getUserInfo();
  const isTeacher = isTeacherView || userInfo?.role === 'teacher';
  const teacherSubject = userInfo?.assignedSubject || '';

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
  const [newExamTotalMarks, setNewExamTotalMarks] = useState('100');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editExamTotalMarks, setEditExamTotalMarks] = useState('100');
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStudents, setExamStudents] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [previewFitWidth, setPreviewFitWidth] = useState(typeof window !== 'undefined' ? window.innerWidth < 850 : true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'marks', 'id'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => {
    if (selectedGrade && selectedSubject) fetchExams();
  }, [selectedGrade, selectedSubject]);

  const getToken = () => {
    const info = getUserInfo();
    return info ? info.token : '';
  };

  useEffect(() => {
    if (location.state?.grade) {
      setSelectedGrade(location.state.grade);
    }
  }, [location.state]);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSubjects(data);
      if (isTeacher && teacherSubject) {
        const found = data.find(s => s.name?.toLowerCase() === teacherSubject.toLowerCase());
        if (found) {
          setSelectedSubject(found._id);
        }
      }
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

      // If examId was passed from TeacherDashboard, automatically select and open it
      if (location.state?.examId && Array.isArray(data)) {
        const target = data.find(e => (e._id || e.id) === location.state.examId);
        if (target) {
          handleSelectExam(target);
        }
      }
    } catch (err) {
      console.error('fetchExams error:', err?.response?.status, err?.response?.data, err?.message);
      toast.error('Failed to load exams');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return toast.error('Exam title is required');
    try {
      const totalMarksVal = Number(newExamTotalMarks) > 0 ? Number(newExamTotalMarks) : 100;
      await axios.post(`${API_BASE_URL}/api/exams`,
        { title: newExamTitle, grade: selectedGrade, subject: selectedSubject, totalMarks: totalMarksVal },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Exam created');
      setShowCreateModal(false);
      setNewExamTitle('');
      setNewExamTotalMarks('100');
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
        return {
          ...student,
          marks: existing ? existing.marks : '',
          gradeResult: existing ? existing.grade : '',
          rank: existing ? existing.rank : '—'
        };
      });
      setExamStudents(mapped);
    } catch { toast.error('Failed to load exam details'); }
  };

  const handleMarkChange = (studentId, val) => {
    setExamStudents(prev => prev.map(s => s._id === studentId ? { ...s, marks: val } : s));
  };

  const handleSaveMarks = async (studentId, marks) => {
    const maxMarks = selectedExam?.totalMarks || 100;
    if (marks !== 'AB' && (marks === '' || isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > maxMarks)) {
      return toast.error(`Enter a valid mark (0–${maxMarks}) or AB`);
    }
    setSavingId(studentId);
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/exams/${selectedExam._id}/marks`,
        { studentId, marks: marks === 'AB' ? 'AB' : Number(marks) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setExamStudents(prev => prev.map(s => {
        const updated = data.results.find(r => (r.student?._id || r.student) === s._id);
        return updated ? { ...s, marks: updated.marks, gradeResult: updated.grade, rank: updated.rank || '—' } : s;
      }));
      setSelectedExam(data);
      toast.success('Marks saved');
    } catch { toast.error('Failed to save marks'); }
    finally { setSavingId(null); }
  };

  const handleSendResultsSMS = async () => {
    if (!selectedExam) return;
    const graded = examStudents.filter(s => s.marks !== '' && s.marks !== undefined);
    if (graded.length === 0) {
      return toast.warn('No graded students to send results for!');
    }
    if (!window.confirm(`Send exam results SMS to parents of ${graded.length} graded students via Hutch SIM Gateway?`)) return;

    setSendingSMS(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/exams/${selectedExam._id}/send-sms`,
        { language: 'si' },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success(`Dispatched ${data.sent} result SMS successfully!`);
      if (data.failed > 0) {
        toast.warn(`${data.failed} SMS failed to send.`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send SMS results');
    } finally {
      setSendingSMS(false);
    }
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

  const handleOpenEdit = () => {
    setEditExamTitle(selectedExam.title);
    setEditExamDate(selectedExam.date ? new Date(selectedExam.date).toISOString().split('T')[0] : '');
    setEditExamTotalMarks(String(selectedExam.totalMarks || 100));
    setShowEditModal(true);
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    if (!editExamTitle.trim()) return toast.error('Exam title is required');
    const totalMarksVal = Number(editExamTotalMarks) > 0 ? Number(editExamTotalMarks) : 100;
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/exams/${selectedExam._id}`,
        { title: editExamTitle, date: editExamDate, totalMarks: totalMarksVal },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSelectedExam(data);
      // Immediately reflect newly recalculated grades in student table
      setExamStudents(prev => prev.map(s => {
        const updated = (data.results || []).find(r => (r.student?._id || r.student) === s._id);
        return updated ? { ...s, marks: updated.marks, gradeResult: updated.grade, rank: updated.rank || '—' } : s;
      }));
      toast.success('Exam details and student grades updated successfully');
      setShowEditModal(false);
      fetchExams();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update exam');
    }
  };

  // ─── Paginate students into clean, balanced A4 pages ──────────────────────────
  const paginateReportStudents = (students) => {
    if (!students || students.length === 0) {
      return [{ pageNumber: 1, isFirst: true, isLast: true, students: [], hasLegend: true }];
    }
    // If 16 or fewer students, all fit easily on 1 single page with stats and legend!
    if (students.length <= 16) {
      return [{ pageNumber: 1, isFirst: true, isLast: true, students, hasLegend: true }];
    }
    const pages = [];
    // Page 1: Has Header + Stats Cards + Table Header + up to 19 students
    const page1Students = students.slice(0, 19);
    pages.push({ pageNumber: 1, isFirst: true, isLast: false, students: page1Students, hasLegend: false });

    let remaining = students.slice(19);
    let pageNum = 2;
    while (remaining.length > 0) {
      // If remaining count <= 21, it fits on the final page along with the Grade Legend!
      if (remaining.length <= 21) {
        pages.push({ pageNumber: pageNum, isFirst: false, isLast: true, students: remaining, hasLegend: true });
        break;
      } else {
        // Intermediate page: holds up to 24 students
        const chunk = remaining.slice(0, 24);
        remaining = remaining.slice(24);
        const isLastPage = remaining.length === 0;
        pages.push({ pageNumber: pageNum, isFirst: false, isLast: isLastPage, students: chunk, hasLegend: isLastPage });
        pageNum++;
      }
    }
    return pages;
  };

  // ─── High-DPI, Standard A4 Multi-Page PDF Exporter ────────────────────────────
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pageElements = document.querySelectorAll('.exam-pdf-sheet');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('Report pages not found in DOM');
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        if (i > 0) {
          pdf.addPage();
        }

        // Fixed render capture window width ensures mobile devices produce desktop-standard A4 rendering!
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0d0f1e',
          logging: false,
          windowWidth: 1000
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${selectedExam.title} - Exam Report.pdf`);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF: ' + (err.message || 'Error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Computed stats ────────────────────────────────────────────────────────
  const currentTotalMarks = selectedExam?.totalMarks || 100;
  const gradedStudents = examStudents.filter(s => s.gradeResult && s.gradeResult !== 'AB');
  const classAvg = gradedStudents.length
    ? Math.round(gradedStudents.reduce((a, s) => {
        const m = Number(s.marks);
        return a + (isNaN(m) ? 0 : m);
      }, 0) / gradedStudents.length)
    : null;
  const passCount = gradedStudents.filter(s => (Number(s.marks) / currentTotalMarks) >= 0.4).length;
  const gradeCounts = examStudents.reduce((acc, s) => {
    const g = s.gradeResult;
    if (g && ['A', 'B', 'C', 'S', 'F', 'AB'].includes(g)) {
      acc[g] = (acc[g] || 0) + 1;
    }
    return acc;
  }, { A: 0, B: 0, C: 0, S: 0, F: 0, AB: 0 });

  const getDynamicGradeRanges = (total = 100) => [
    { grade: 'A', range: `${Math.ceil(total * 0.75)}–${total}`, pct: '75–100%', label: 'Distinction', color: '#00c896' },
    { grade: 'B', range: `${Math.ceil(total * 0.65)}–${Math.max(Math.ceil(total * 0.65), Math.ceil(total * 0.75) - 1)}`, pct: '65–74%', label: 'Very Good', color: '#63b3ed' },
    { grade: 'C', range: `${Math.ceil(total * 0.55)}–${Math.max(Math.ceil(total * 0.55), Math.ceil(total * 0.65) - 1)}`, pct: '55–64%', label: 'Credit', color: '#f6ad55' },
    { grade: 'S', range: `${Math.ceil(total * 0.40)}–${Math.max(Math.ceil(total * 0.40), Math.ceil(total * 0.55) - 1)}`, pct: '40–54%', label: 'Ordinary', color: '#fc814a' },
    { grade: 'F', range: `0–${Math.max(0, Math.ceil(total * 0.40) - 1)}`, pct: '0–39%', label: 'Failure', color: '#fc4b6c' },
  ];

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
    let list = [...examStudents];
    if (studentSearch.trim()) {
      const q = studentSearch.trim().toLowerCase();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.indexNumber || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
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
      if (sortBy === 'rank') {
        const numRankA = isNaN(Number(a.rank)) ? 9999 : Number(a.rank);
        const numRankB = isNaN(Number(b.rank)) ? 9999 : Number(b.rank);
        return sortDirection === 'asc' ? numRankA - numRankB : numRankB - numRankA;
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

      {/* ── Teacher Top Navigation (Only shown when teacher opens exam center) ── */}
      {isTeacher && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderRadius: 16,
          background: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <motion.button
            whileHover={{ scale: 1.04, x: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/teacher-dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
            }}
          >
            <span>←</span>
            <span>Back to Teacher Dashboard</span>
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: C.muted }}>Faculty Portal:</span>
            <span style={{ fontWeight: 800, color: C.text }}>{userInfo?.name || userInfo?.username || 'Teacher'}</span>
            <span style={{
              padding: '4px 12px',
              borderRadius: 8,
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#6366f1',
              fontSize: 12,
              fontWeight: 800
            }}>
              {teacherSubject ? `${teacherSubject} Teacher` : 'Subject Teacher'}
            </span>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>
            {isTeacher && teacherSubject ? `${teacherSubject} Exams & Results` : 'Manage exams'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
            {selectedGrade && selectedSubject
              ? `Showing exams for ${selectedGrade} — ${subjects.find(s => s._id === selectedSubject)?.name || teacherSubject}`
              : isTeacher && teacherSubject
                ? `Select a grade to view or schedule ${teacherSubject} exams`
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

        <select
          value={selectedSubject}
          onChange={e => { setSelectedSubject(e.target.value); setSelectedExam(null); }}
          disabled={isTeacher && Boolean(teacherSubject)}
          style={{
            ...selectStyle,
            opacity: isTeacher && Boolean(teacherSubject) ? 0.8 : 1,
            cursor: isTeacher && Boolean(teacherSubject) ? 'not-allowed' : 'pointer'
          }}
        >
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: C.muted }}>
                    {selectedExam.grade} · {selectedExam.subject?.name}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(0, 207, 255, 0.12)',
                    color: C.cyan,
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1px solid rgba(0, 207, 255, 0.25)'
                  }}>
                    🎯 Max: {selectedExam.totalMarks || 100} Marks
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleOpenEdit}
                  style={{
                    padding: '9px 18px', borderRadius: 10, border: `1px solid ${C.cyan}`,
                    background: 'transparent', color: C.cyan, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  ✏️ Edit Details
                </motion.button>
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
                  onClick={handleSendResultsSMS}
                  disabled={sendingSMS}
                  style={{
                    padding: '9px 18px', borderRadius: 10, border: 'none',
                    background: '#f59e0b', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: sendingSMS ? 0.7 : 1
                  }}
                >
                  {sendingSMS ? '⏳ Sending SMS...' : '📱 SMS Results'}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: C.surfaceAlt, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Students</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{examStudents.length}</p>
              </div>
              <div style={{ background: C.surfaceAlt, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Graded</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{gradedStudents.length}</p>
              </div>
              <div style={{ background: C.surfaceAlt, borderRadius: 12, padding: '14px 16px', minWidth: 260, gridColumn: 'span 2' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grade Distribution</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {Object.entries(GRADE_COLORS).map(([grade, info]) => {
                    const count = gradeCounts[grade] || 0;
                    return (
                      <div key={grade} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: info.bg,
                        color: info.color,
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: `1px solid ${info.color}20`
                      }}>
                        <span style={{ fontSize: '13px' }}>{grade}</span>
                        <span style={{ height: '12px', width: '1px', background: `${info.color}40` }}></span>
                        <span style={{ fontSize: '13px', color: C.text }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: C.surfaceAlt, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pass Rate</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{gradedStudents.length ? `${Math.round(passCount / gradedStudents.length * 100)}%` : '—'}</p>
              </div>
            </div>

            {/* Controls Row (Search, Legend & Sorting) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  flex: '1 1 240px',
                  maxWidth: '380px',
                  minWidth: '220px',
                }}>
                  <span style={{ position: 'absolute', left: 12, color: C.muted, fontSize: 14 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search student or index..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 36px',
                      borderRadius: 10,
                      border: `1px solid ${C.border}`,
                      background: C.surfaceAlt,
                      color: C.text,
                      fontSize: 16,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        background: 'none',
                        border: 'none',
                        color: C.muted,
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 4
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sorting Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surfaceAlt, padding: '4px', borderRadius: 10, border: `1px solid ${C.border}`, overflowX: 'auto', maxWidth: '100%' }}>
                  <span style={{ fontSize: 12, color: C.muted, padding: '0 8px', fontWeight: 600 }}>Sort:</span>
                  {[
                    { id: 'name', label: 'Name A-Z', dir: 'asc' },
                    { id: 'marks', label: 'Highest Marks', dir: 'desc' },
                    { id: 'rank', label: 'Rank 1-N', dir: 'asc' },
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
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grade legend */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {getDynamicGradeRanges(selectedExam.totalMarks || 100).map(g => (
                  <span key={g.grade} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
                    background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30`,
                  }}>
                    {g.grade}: {g.range} ({g.pct})
                  </span>
                ))}
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
                        Marks /{selectedExam.totalMarks || 100} {renderSortIcon('marks')}
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
                        onClick={() => handleHeaderClick('rank')}
                        style={{
                          padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600,
                          color: sortBy === 'rank' ? C.text : C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`, cursor: 'pointer', userSelect: 'none'
                        }}
                      >
                        Rank {renderSortIcon('rank')}
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
                    {getSortedStudents().length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
                          {studentSearch ? `No students found matching "${studentSearch}"` : 'No students enrolled'}
                        </td>
                      </tr>
                    ) : (
                      getSortedStudents().map(student => {
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
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            {student.rank && student.rank !== 'AB' && student.rank !== '—' && student.rank !== 'N/A' ? (
                              <span style={{
                                display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                                fontSize: 12, fontWeight: 800,
                                background: Number(student.rank) <= 3 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                                color: Number(student.rank) <= 3 ? '#fbbf24' : C.text,
                                border: Number(student.rank) <= 3 ? '1px solid rgba(251,191,36,0.4)' : 'none'
                              }}>
                                #{student.rank}
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
                    }))}
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
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center',
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
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>Exam Title</label>
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
                    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>
                  Total / Max Marks (ලකුණු ප්‍රමාණය)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="100"
                  value={newExamTotalMarks}
                  onChange={e => setNewExamTotalMarks(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateExam(e)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surfaceAlt,
                    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: 'block' }}>
                  Default is 100. Set 40, 50, 75, etc. Grades will calculate based on this total.
                </span>
              </div>

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

      {/* ── Edit modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center',
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
                borderRadius: 16, padding: 28, width: 420, maxWidth: '100%',
              }}
            >
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Edit Exam Details</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: C.muted }}>
                {selectedExam?.grade} · {selectedExam?.subject?.name}
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>Exam Title</label>
                <input
                  type="text"
                  placeholder="Exam title"
                  value={editExamTitle}
                  onChange={e => setEditExamTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surfaceAlt,
                    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>Exam Date</label>
                <input
                  type="date"
                  value={editExamDate}
                  onChange={e => setEditExamDate(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surfaceAlt,
                    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>
                  Total / Max Marks (ලකුණු ප්‍රමාණය)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={editExamTotalMarks}
                  onChange={e => setEditExamTotalMarks(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surfaceAlt,
                    color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: 11, color: C.cyan, marginTop: 4, display: 'block' }}>
                  ⚡ Changing total marks will automatically recalculate grades for all recorded students.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.text, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleUpdateExam}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                    background: C.cyan, color: '#000', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Report modal ── */}
      <AnimatePresence>
        {showReport && selectedExam && (() => {
          const sortedStudentsList = getSortedStudents();
          const reportPages = paginateReportStudents(sortedStudentsList);
          const totalReportPages = reportPages.length;
          const currentRanges = getDynamicGradeRanges(selectedExam.totalMarks || 100);

          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(5, 7, 15, 0.92)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 2000, padding: '16px 12px', flexDirection: 'column'
              }}
            >
              {/* Modal Header Bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', maxWidth: '850px', marginBottom: 12, flexWrap: 'wrap', gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setShowReport(false)}
                    style={{
                      background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.border}`,
                      color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      fontWeight: 600, fontSize: 13
                    }}
                  >
                    ← Close
                  </button>
                  <span style={{ fontSize: 13, color: '#a0a5c0', fontWeight: 600 }}>
                    📄 {totalReportPages} {totalReportPages === 1 ? 'Page' : 'Pages'} (A4 Sheet{totalReportPages === 1 ? '' : 's'})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Zoom/Fit Toggle (crucial for clean mobile preview) */}
                  <button
                    onClick={() => setPreviewFitWidth(prev => !prev)}
                    style={{
                      background: previewFitWidth ? 'rgba(0, 207, 255, 0.15)' : 'rgba(255,255,255,0.08)',
                      border: previewFitWidth ? `1px solid ${C.cyan}` : `1px solid ${C.border}`,
                      color: previewFitWidth ? C.cyan : '#fff',
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                      fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5
                    }}
                  >
                    {previewFitWidth ? '🔍 100% Size' : '📱 Fit Screen'}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    style={{
                      background: C.cyan, border: 'none', color: '#000',
                      padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                      fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(0, 207, 255, 0.3)',
                      opacity: isGenerating ? 0.7 : 1
                    }}
                  >
                    {isGenerating ? '⏳ Generating...' : '📥 Download PDF'}
                  </button>
                </div>
              </div>

              {/* Report Preview Wrapper */}
              <div style={{
                width: '100%', maxWidth: '850px', height: '82vh', overflowY: 'auto',
                overflowX: previewFitWidth ? 'hidden' : 'auto',
                borderRadius: 14, background: 'rgba(0,0,0,0.3)',
                padding: previewFitWidth ? '10px 4px' : '16px',
                boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20
              }}>
                <div id="pdf-report-content" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
                  transform: previewFitWidth && (typeof window !== 'undefined' && window.innerWidth < 820)
                    ? `scale(${Math.min(1, (window.innerWidth - 32) / 800)})`
                    : 'none',
                  transformOrigin: 'top center',
                  marginBottom: previewFitWidth && (typeof window !== 'undefined' && window.innerWidth < 820)
                    ? `-${(1 - Math.min(1, (window.innerWidth - 32) / 800)) * (1140 * totalReportPages)}px`
                    : 0
                }}>
                  {reportPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="exam-pdf-sheet"
                      style={{
                        width: '794px',
                        height: '1123px',
                        minHeight: '1123px',
                        maxHeight: '1123px',
                        backgroundColor: '#0d0f1e',
                        color: '#ffffff',
                        padding: '36px 44px',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        boxSizing: 'border-box',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 10,
                        boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      {/* Decorative ambient background glows */}
                      <div style={{ position: 'absolute', top: -100, right: -100, width: 320, height: 320, background: 'radial-gradient(circle, rgba(0,207,255,0.12) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(255,92,124,0.12) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                      {/* Top content area */}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        {page.isFirst ? (
                          <>
                            {/* Page 1: Full Brand Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 16, marginBottom: 20 }}>
                              <div>
                                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                                  {selectedExam.title}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                                  <p style={{ margin: 0, fontSize: 14, color: '#a0a5c0' }}>
                                    Grade {selectedExam.grade} • {selectedExam.subject?.name}
                                  </p>
                                  <span style={{
                                    padding: '2px 8px', borderRadius: 6,
                                    background: 'rgba(0, 207, 255, 0.15)', color: '#00cfff',
                                    fontSize: 11, fontWeight: 700, border: '1px solid rgba(0,207,255,0.3)'
                                  }}>
                                    Max: {selectedExam.totalMarks || 100} Marks
                                  </span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: 16, color: '#00cfff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>EDUFLEX</p>
                                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6b7094' }}>
                                  {new Date(selectedExam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            {/* Page 1: Stats Row */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                <p style={{ margin: 0, fontSize: 10, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1 }}>Total Students</p>
                                <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#63b3ed' }}>{examStudents.length}</p>
                              </div>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                <p style={{ margin: 0, fontSize: 10, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1 }}>Graded</p>
                                <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#f6ad55' }}>{gradedStudents.length}</p>
                              </div>
                              <div style={{ flex: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                <p style={{ margin: 0, fontSize: 10, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1 }}>Grade Breakdown</p>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                  {Object.entries(GRADE_COLORS).map(([grade, info]) => {
                                    const count = gradeCounts[grade] || 0;
                                    return (
                                      <div key={grade} style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '2px 7px', borderRadius: '5px',
                                        background: info.bg, color: info.color,
                                        fontSize: '11px', fontWeight: 'bold', border: `1px solid ${info.color}25`
                                      }}>
                                        <span>{grade}</span>
                                        <span style={{ height: '9px', width: '1px', background: `${info.color}35` }}></span>
                                        <span style={{ color: '#fff' }}>{count}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                <p style={{ margin: 0, fontSize: 10, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1 }}>Pass Rate</p>
                                <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#fc814a' }}>
                                  {gradedStudents.length ? `${Math.round(passCount / gradedStudents.length * 100)}%` : '—'}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Page 2+: Compact Running Header */
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 18 }}>
                            <div>
                              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                                {selectedExam.title} <span style={{ fontSize: 13, color: '#8e93b5', fontWeight: 400 }}>(Continued)</span>
                              </h2>
                              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8e93b5' }}>
                                Grade {selectedExam.grade} • {selectedExam.subject?.name} • Max Marks: {selectedExam.totalMarks || 100}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ margin: 0, fontSize: 13, color: '#00cfff', fontWeight: 700, letterSpacing: 1 }}>EDUFLEX REPORT</p>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7094' }}>
                                Page {page.pageNumber} of {totalReportPages}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Student Results Table */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden'
                        }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <th style={{ padding: '10px 12px', fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', width: 45 }}>#</th>
                                <th style={{ padding: '10px 12px', fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Student Name</th>
                                <th style={{ padding: '10px 12px', fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', width: 120 }}>ID</th>
                                <th style={{ padding: '10px 12px', fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', width: 100 }}>
                                  Marks /{selectedExam.totalMarks || 100}
                                </th>
                                <th style={{ padding: '10px 12px', fontSize: 11, color: '#8e93b5', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', width: 85 }}>Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {page.students.map((s) => {
                                const globalIndex = sortedStudentsList.findIndex(st => st._id === s._id) + 1;
                                const g = GRADE_COLORS[s.gradeResult];
                                return (
                                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '8px 12px', fontSize: 12, color: '#6b7094' }}>
                                      {String(globalIndex).padStart(2, '0')}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#e8eaf6' }}>
                                      {s.name}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontSize: 12, color: '#a0a5c0' }}>
                                      {s.indexNumber || '—'}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontSize: 14, fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
                                      {s.marks !== '' && s.marks !== undefined ? s.marks : '—'}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                      {s.gradeResult ? (
                                        <span style={{
                                          display: 'inline-block', padding: '3px 10px', borderRadius: 16,
                                          fontSize: 12, fontWeight: 700, background: g?.bg, color: g?.color
                                        }}>
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
                      </div>

                      {/* Bottom Footer Area */}
                      <div style={{ position: 'relative', zIndex: 2, marginTop: 16 }}>
                        {page.hasLegend && (
                          <div style={{
                            padding: '12px 16px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 14
                          }}>
                            {currentRanges.map(g => (
                              <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color }} />
                                <span style={{ fontSize: 11, color: '#a0a5c0', fontWeight: 500 }}>
                                  <strong style={{ color: g.color }}>{g.grade}:</strong> {g.range} ({g.label})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sheet footer bar */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, fontSize: 11, color: '#6b7094'
                        }}>
                          <span>Eduflex Institute Management System • Official Exam Record</span>
                          <span>Page {page.pageNumber} of {totalReportPages}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}