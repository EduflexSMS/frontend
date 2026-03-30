// ✅ Improved ViewStudents.jsx (Optimized + Cleaner + Better UX)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

// ─── Utils ─────────────────────────────────────────
const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const getAttendanceColor = (pct) => {
  if (pct >= 75) return '#4ade80';
  if (pct >= 50) return '#38bdf8';
  return '#fb923c';
};

// ─── Student Row ───────────────────────────────────
function StudentRow({ student }) {
  const [open, setOpen] = useState(false);

  const attendance = React.useMemo(() => {
    let total = 0, attended = 0;

    student.enrollments?.forEach(e => {
      e.monthlyRecords?.forEach(r => {
        r.attendance?.forEach(a => {
          if (a !== 'pending') total++;
          if (a === 'present') attended++;
        });
      });
    });

    return total === 0 ? 0 : Math.round((attended / total) * 100);
  }, [student]);

  return (
    <div style={{ borderBottom: '1px solid #1f2a3a' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          cursor: 'pointer'
        }}
      >
        <div>
          <strong>{student.name}</strong>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>{student.indexNumber}</div>
        </div>

        <div style={{ color: getAttendanceColor(attendance) }}>
          {attendance}%
        </div>
      </div>

      {open && (
        <div style={{ padding: '10px 15px', background: '#0f172a' }}>
          <p><b>Grade:</b> {student.grade}</p>
          <p><b>Subjects:</b></p>
          <ul>
            {student.enrollments?.map(e => (
              <li key={e._id}>{e.subject}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────
export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('name');

  // ✅ Fetch students
  const fetchStudents = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`, {
        params: { page, search: query, sort }
      });

      setStudents(res.data.students);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, sort]);

  // ✅ Debounced search
  const debouncedSearch = useCallback(debounce(fetchStudents), [fetchStudents]);

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  useEffect(() => {
    fetchStudents(search);
  }, [page, sort]);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>Students</h2>

      {/* 🔍 Search */}
      <input
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '8px',
          width: '100%',
          marginBottom: '10px',
          borderRadius: '6px'
        }}
      />

      {/* 🔽 Sorting */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        style={{ marginBottom: '15px', padding: '6px' }}
      >
        <option value="name">Sort by Name</option>
        <option value="attendance">Sort by Attendance</option>
      </select>

      {/* 📦 List */}
      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No students found</p>
      ) : (
        students.map(s => <StudentRow key={s._id} student={s} />)
      )}

      {/* 📄 Pagination */}
      <div style={{ marginTop: '15px' }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span style={{ margin: '0 10px' }}>{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
