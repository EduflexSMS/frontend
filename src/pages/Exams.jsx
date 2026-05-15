import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config';

// Reuse design tokens from Layout for consistency
const T = {
  dark: { bg: '#0a0c1b', card: 'rgba(255,255,255,0.04)', text: '#eef0fc', sub: '#7880a8', border: 'rgba(255,255,255,0.07)', coral: '#ff5c7c' },
  light: { bg: '#f4f6ff', card: '#ffffff', text: '#0f1130', sub: '#7880a8', border: 'rgba(0,0,0,0.07)', coral: '#ff5c7c' }
};

export default function Exams() {
    const { mode } = useContext(ThemeContext);
    const theme = mode === 'dark' ? 'dark' : 'light';
    const colors = T[theme];

    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newExamTitle, setNewExamTitle] = useState('');
    
    const [selectedExam, setSelectedExam] = useState(null);
    const [examStudents, setExamStudents] = useState([]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedGrade && selectedSubject) {
            fetchExams();
        }
    }, [selectedGrade, selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
            const { data } = await axios.get(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } });
            setSubjects(data);
        } catch (error) {
            toast.error('Failed to load subjects');
        }
    };

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
            const { data } = await axios.get(`${API_BASE_URL}/api/exams?grade=${selectedGrade}&subject=${selectedSubject}`, { headers: { Authorization: `Bearer ${token}` } });
            setExams(data);
        } catch (error) {
            toast.error('Failed to load exams');
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
            await axios.post(`${API_BASE_URL}/api/exams`, {
                title: newExamTitle,
                grade: selectedGrade,
                subject: selectedSubject
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Exam created successfully');
            setShowCreateModal(false);
            setNewExamTitle('');
            fetchExams();
        } catch (error) {
            toast.error('Failed to create exam');
        }
    };

    const handleSelectExam = async (exam) => {
        setSelectedExam(exam);
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
            // Fetch all students for this grade
            const { data: studentsData } = await axios.get(`${API_BASE_URL}/api/students?grade=${exam.grade}&limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
            
            // Filter students who are enrolled in this subject
            const studentsArray = studentsData.students || [];
            const enrolledStudents = studentsArray.filter(s => s.enrollments && s.enrollments.some(sub => sub.subject === exam.subject.name || sub.subject === exam.subject._id));

            // Merge with existing marks
            const mappedStudents = enrolledStudents.map(student => {
                const existingResult = exam.results.find(r => r.student._id === student._id);
                return {
                    ...student,
                    marks: existingResult ? existingResult.marks : '',
                    gradeResult: existingResult ? existingResult.grade : ''
                };
            });
            setExamStudents(mappedStudents);
        } catch (error) {
            toast.error('Failed to load exam details');
        }
    };

    const handleMarkChange = (studentId, val) => {
        setExamStudents(prev => prev.map(s => s._id === studentId ? { ...s, marks: val } : s));
    };

    const handleSaveMarks = async (studentId, marks) => {
        if(marks === '' || marks < 0 || marks > 100) return toast.error('Invalid marks');
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
            const { data } = await axios.put(`${API_BASE_URL}/api/exams/${selectedExam._id}/marks`, {
                studentId,
                marks: Number(marks)
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            // Update local state with returned grade
            const updatedResult = data.results.find(r => r.student._id === studentId);
            setExamStudents(prev => prev.map(s => s._id === studentId ? { ...s, marks: updatedResult.marks, gradeResult: updatedResult.grade } : s));
            toast.success('Marks saved');
            
            // Update selectedExam reference
            setSelectedExam(data);
        } catch (error) {
            toast.error('Failed to save marks');
        }
    };

    const handleGenerateReport = async () => {
        // Will implement report generation
        toast.info('Generating report...');
        // Here we'll map examStudents to a colorful HTML template and trigger print/PDF
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <html>
            <head>
                <title>${selectedExam.title} Report</title>
                <style>
                    body { font-family: 'Inter', sans-serif; background: #0a0c1b; color: #fff; padding: 40px; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .header h1 { color: #00cfff; font-size: 36px; margin: 0; }
                    .header h3 { color: #ff5c7c; font-size: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
                    th, td { padding: 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    th { background: rgba(0, 207, 255, 0.1); color: #00cfff; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
                    .grade-A { color: #00d4a0; font-weight: bold; }
                    .grade-B { color: #00cfff; font-weight: bold; }
                    .grade-C { color: #ffb84d; font-weight: bold; }
                    .grade-S { color: #ff5c7c; font-weight: bold; }
                    .grade-F { color: #ff3d6b; font-weight: bold; }
                    .grading-system { margin-top: 40px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
                    .grade-box { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; }
                    .gb-A { background: rgba(0, 212, 160, 0.1); color: #00d4a0; border: 1px solid #00d4a0; }
                    .gb-B { background: rgba(0, 207, 255, 0.1); color: #00cfff; border: 1px solid #00cfff; }
                    .gb-C { background: rgba(255, 184, 77, 0.1); color: #ffb84d; border: 1px solid #ffb84d; }
                    .gb-S { background: rgba(255, 92, 124, 0.1); color: #ff5c7c; border: 1px solid #ff5c7c; }
                    .gb-F { background: rgba(255, 61, 107, 0.1); color: #ff3d6b; border: 1px solid #ff3d6b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>EDUFLEX INSTITUTE</h1>
                    <h3>${selectedExam.title} - ${selectedExam.grade}</h3>
                    <p>Subject: ${selectedExam.subject.name}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Marks</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${examStudents.map(s => `
                            <tr>
                                <td>${s.uiid || s.rfid}</td>
                                <td>${s.name}</td>
                                <td>${s.marks !== '' ? s.marks : '-'}</td>
                                <td class="grade-${s.gradeResult}">${s.gradeResult || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="grading-system">
                    <div class="grade-box gb-A">A : 75 - 100 (Distinction)</div>
                    <div class="grade-box gb-B">B : 65 - 74 (Very Good)</div>
                    <div class="grade-box gb-C">C : 55 - 64 (Credit)</div>
                    <div class="grade-box gb-S">S : 40 - 54 (Ordinary)</div>
                    <div class="grade-box gb-F">F : 0 - 39 (Failure)</div>
                </div>
                <script>
                    setTimeout(() => window.print(), 1000);
                </script>
            </body>
            </html>
        `);
        reportWindow.document.close();
    };

    return (
        <div style={{ padding: 24, minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "'Outfit', sans-serif" }}>
            <ToastContainer theme={theme} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Manage Exams</h2>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, outline: 'none', flex: 1, minWidth: 200 }}
                >
                    <option value="">Select Grade</option>
                    {[...Array(8)].map((_, i) => (
                        <option key={i} value={`Grade ${(i + 6).toString().padStart(2, '0')}`}>Grade {(i + 6).toString().padStart(2, '0')}</option>
                    ))}
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, outline: 'none', flex: 1, minWidth: 200 }}
                >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
                
                {selectedGrade && selectedSubject && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${colors.coral}, #ff3d6b)`, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                        + Create Exam
                    </motion.button>
                )}
            </div>

            {selectedGrade && selectedSubject && exams.length > 0 && !selectedExam && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {exams.map(exam => (
                        <motion.div
                            key={exam._id}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSelectExam(exam)}
                            style={{ padding: 20, borderRadius: 12, background: colors.card, border: `1px solid ${colors.border}`, cursor: 'pointer' }}
                        >
                            <h3 style={{ margin: '0 0 10px', color: colors.text }}>{exam.title}</h3>
                            <p style={{ margin: 0, fontSize: 13, color: colors.sub }}>{new Date(exam.date).toLocaleDateString()}</p>
                            <div style={{ marginTop: 15, fontSize: 12, fontWeight: 600, color: colors.coral }}>{exam.results.length} Results Recorded</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {selectedExam && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 20, background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}` }}>
                        <div>
                            <button onClick={() => setSelectedExam(null)} style={{ background: 'none', border: 'none', color: colors.sub, cursor: 'pointer', marginBottom: 8, padding: 0 }}>← Back to Exams</button>
                            <h3 style={{ margin: 0, fontSize: 22 }}>{selectedExam.title}</h3>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateReport}
                            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#00cfff', color: '#000', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Generate Report
                        </motion.button>
                    </div>

                    <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${colors.border}` }}>
                                    <th style={{ padding: 16, fontSize: 13, color: colors.sub }}>Student Name</th>
                                    <th style={{ padding: 16, fontSize: 13, color: colors.sub }}>ID</th>
                                    <th style={{ padding: 16, fontSize: 13, color: colors.sub }}>Marks</th>
                                    <th style={{ padding: 16, fontSize: 13, color: colors.sub }}>Grade</th>
                                    <th style={{ padding: 16, fontSize: 13, color: colors.sub }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examStudents.map(student => (
                                    <tr key={student._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <td style={{ padding: 16, fontWeight: 500 }}>{student.name}</td>
                                        <td style={{ padding: 16, color: colors.sub, fontSize: 13 }}>{student.uiid || student.rfid}</td>
                                        <td style={{ padding: 16 }}>
                                            <input
                                                type="number"
                                                value={student.marks}
                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                style={{ width: 80, padding: '8px', borderRadius: 6, border: `1px solid ${colors.border}`, background: 'rgba(0,0,0,0.1)', color: colors.text, outline: 'none' }}
                                                min="0" max="100"
                                            />
                                        </td>
                                        <td style={{ padding: 16, fontWeight: 'bold', color: student.gradeResult === 'A' ? '#00d4a0' : student.gradeResult === 'F' ? '#ff3d6b' : colors.text }}>
                                            {student.gradeResult || '-'}
                                        </td>
                                        <td style={{ padding: 16 }}>
                                            <button
                                                onClick={() => handleSaveMarks(student._id, student.marks)}
                                                style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'rgba(0, 212, 160, 0.1)', color: '#00d4a0', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {examStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: 30, textAlign: 'center', color: colors.sub }}>No students enrolled in this subject for this grade.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: colors.bg, padding: 30, borderRadius: 16, width: 400, border: `1px solid ${colors.border}` }}>
                        <h3 style={{ marginTop: 0 }}>Create New Exam</h3>
                        <p style={{ color: colors.sub, fontSize: 13 }}>Grade: {selectedGrade} | Subject: {subjects.find(s=>s._id===selectedSubject)?.name}</p>
                        <input
                            type="text"
                            placeholder="Exam Title (e.g., 1st Term Test)"
                            value={newExamTitle}
                            onChange={(e) => setNewExamTitle(e.target.value)}
                            style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, outline: 'none', marginTop: 15, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleCreateExam} style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: colors.coral, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
