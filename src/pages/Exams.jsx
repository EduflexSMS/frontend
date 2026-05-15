import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
        const existing = exam.results.find(r => r.student._id === student._id);
        return { ...student, marks: existing ? existing.marks : '', gradeResult: existing ? existing.grade : '' };
      });
      setExamStudents(mapped);
    } catch { toast.error('Failed to load exam details'); }
  };

  const handleMarkChange = (studentId, val) => {
    setExamStudents(prev => prev.map(s => s._id === studentId ? { ...s, marks: val } : s));
  };

  const handleSaveMarks = async (studentId, marks) => {
    if (marks === '' || marks < 0 || marks > 100) return toast.error('Enter a valid mark (0–100)');
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

  const handleGenerateReport = () => {
    const win = window.open('', '_blank');
    const totalStudents = examStudents.length;
    const graded = examStudents.filter(s => s.gradeResult);
    const avg = graded.length
      ? Math.round(graded.reduce((a, s) => a + s.marks, 0) / graded.length)
      : 0;
    win.document.write(`
      <html><head><title>${selectedExam.title} — Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0d0f1e; color: #e8eaf6; padding: 48px; }
        .logo { font-size: 11px; letter-spacing: 3px; color: #6b7094; text-transform: uppercase; margin-bottom: 6px; }
        h1 { font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
        .sub { font-size: 14px; color: #6b7094; margin-bottom: 40px; }
        .stats { display: flex; gap: 16px; margin-bottom: 36px; }
        .stat { background: #161827; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 24px; flex: 1; }
        .stat .label { font-size: 11px; color: #6b7094; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat .val { font-size: 24px; font-weight: 700; color: #fff; }
        table { width: 100%; border-collapse: collapse; }
        thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7094; padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
        tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); }
        tbody tr:hover { background: rgba(255,255,255,0.02); }
        td { padding: 14px 16px; font-size: 14px; }
        .grade-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .A { background: rgba(0,200,150,0.15); color: #00c896; }
        .B { background: rgba(99,179,237,0.15); color: #63b3ed; }
        .C { background: rgba(246,173,85,0.15); color: #f6ad55; }
        .S { background: rgba(252,129,74,0.15); color: #fc814a; }
        .F { background: rgba(252,75,108,0.15); color: #fc4b6c; }
        .legend { display: flex; gap: 12px; margin-top: 36px; flex-wrap: wrap; }
        .legend-item { font-size: 12px; padding: 6px 14px; border-radius: 20px; font-weight: 500; }
      </style></head><body>
      <p class="logo">EduFlex Institute</p>
      <h1>${selectedExam.title}</h1>
      <p class="sub">Grade ${selectedExam.grade} &nbsp;·&nbsp; ${selectedExam.subject.name} &nbsp;·&nbsp; ${new Date(selectedExam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div class="stats">
        <div class="stat"><div class="label">Total students</div><div class="val">${totalStudents}</div></div>
        <div class="stat"><div class="label">Graded</div><div class="val">${graded.length}</div></div>
        <div class="stat"><div class="label">Class average</div><div class="val">${avg}%</div></div>
        <div class="stat"><div class="label">Pass rate</div><div class="val">${graded.length ? Math.round(graded.filter(s => s.marks >= 40).length / graded.length * 100) : 0}%</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Student</th><th>ID</th><th>Marks</th><th>Grade</th></tr></thead>
      <tbody>${examStudents.map((s, i) => `
        <tr>
          <td style="color:#6b7094">${i + 1}</td>
          <td>${s.name}</td>
          <td style="color:#6b7094;font-size:13px">${s.uiid || s.rfid}</td>
          <td style="font-weight:600">${s.marks !== '' ? s.marks + '/100' : '—'}</td>
          <td><span class="grade-pill ${s.gradeResult}">${s.gradeResult || '—'}</span></td>
        </tr>`).join('')}
      </tbody></table>
      <div class="legend">
        ${GRADE_RANGES.map(g => `<span class="legend-item" style="background:rgba(255,255,255,0.05);color:${g.color}">${g.grade}: ${g.range} (${g.label})</span>`).join('')}
      </div>
      <script>setTimeout(()=>window.print(),800);<\/script>
      </body></html>
    `);
    win.document.close();
  };

  // ─── Computed stats ────────────────────────────────────────────────────────
  const gradedStudents = examStudents.filter(s => s.gradeResult);
  const classAvg = gradedStudents.length
    ? Math.round(gradedStudents.reduce((a, s) => a + s.marks, 0) / gradedStudents.length)
    : null;
  const passCount = gradedStudents.filter(s => s.marks >= 40).length;

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
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleGenerateReport}
                style={{
                  padding: '9px 18px', borderRadius: 10, border: 'none',
                  background: C.cyan, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                🖨 Generate report
              </motion.button>
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

            {/* Grade legend */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {GRADE_RANGES.map(g => (
                <span key={g.grade} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
                  background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30`,
                }}>
                  {g.grade}: {g.range}
                </span>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.surfaceAlt }}>
                      {['Student', 'ID', 'Marks /100', 'Grade', 'Action'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                          color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: `1px solid ${C.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {examStudents.map(student => {
                      const g = GRADE_COLORS[student.gradeResult];
                      return (
                        <tr key={student._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '13px 16px', fontWeight: 500 }}>{student.name}</td>
                          <td style={{ padding: '13px 16px', color: C.muted, fontSize: 13 }}>{student.uiid || student.rfid}</td>
                          <td style={{ padding: '13px 16px' }}>
                            <input
                              type="number" min="0" max="100"
                              value={student.marks}
                              onChange={e => handleMarkChange(student._id, e.target.value)}
                              style={{
                                width: 80, padding: '7px 10px', borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.surfaceAlt,
                                color: C.text, fontSize: 14, outline: 'none',
                              }}
                            />
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
    </div>
  );
}