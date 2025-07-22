import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../config';
import './style/FacultyDashboard.css';

const FacultyDashboard = () => {
    const [userName, setUserName] = useState('Faculty');
    const [department, setDepartment] = useState('');
    const [noticeCount, setNoticeCount] = useState(0);
    const [myNoticeCount, setMyNoticeCount] = useState(0);
    const [departmentStudentCount, setDepartmentStudentCount] = useState(0);
    const [pendingStudents, setPendingStudents] = useState([]);

    const [loadingNotices, setLoadingNotices] = useState(true);
    const [loadingMyNotices, setLoadingMyNotices] = useState(true);
    const [loadingDeptStudents, setLoadingDeptStudents] = useState(true);
    const [loadingPendingStudents, setLoadingPendingStudents] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const decodeToken = (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return {};
        }
    };

    const animateWithDelay = (target, setter, setLoading) => {
        setTimeout(() => {
            let current = 0;
            const step = Math.ceil(target / 30);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    setter(target);
                    clearInterval(interval);
                    setLoading(false);
                } else {
                    setter(current);
                }
            }, 30);
        }, 100);
    };

    useEffect(() => {
        const name = localStorage.getItem('userName');
        if (name) setUserName(name);

        if (token) {
            const decoded = decodeToken(token);
            if (decoded?.Department) setDepartment(decoded.Department);
        }

        fetchAllData();
    }, []);

    useEffect(() => {
        if (department) {
            fetchDepartmentStudentCount();
        }
    }, [department]);

    const fetchAllData = () => {
        fetchNoticesCount();
        fetchMyNotices();
        fetchPendingStudents();
    };

    const fetchNoticesCount = async () => {
        setLoadingNotices(true);
        try {
            const res = await axios.get(`${BASE_URL}/Notices`);
            const notices = res.data || [];
            animateWithDelay(notices.length, setNoticeCount, setLoadingNotices);
        } catch (err) {
            console.error('Error fetching notices:', err);
            setNoticeCount(0);
            setLoadingNotices(false);
        }
    };

    const fetchMyNotices = async () => {
        setLoadingMyNotices(true);
        try {
            const res = await axios.get(`${BASE_URL}/Notices`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const lowerName = (userName || '').toLowerCase();
            const myNotices = res.data.filter(
                (n) => (n.author || '').toLowerCase() === lowerName
            );
            animateWithDelay(myNotices.length, setMyNoticeCount, setLoadingMyNotices);
        } catch (err) {
            console.error('Error fetching my notices:', err);
            setMyNoticeCount(0);
            setLoadingMyNotices(false);
        }
    };

    const fetchPendingStudents = async () => {
        setLoadingPendingStudents(true);
        try {
            const res = await axios.get(`${BASE_URL}/Faculties/pending-students`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingStudents(res.data || []);
        } catch (err) {
            console.error('Error fetching pending students:', err);
        } finally {
            setLoadingPendingStudents(false);
        }
    };

    const fetchDepartmentStudentCount = async () => {
        setLoadingDeptStudents(true);
        try {
            const res = await axios.get(`${BASE_URL}/Students/students/approved`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filtered = res.data.filter(
                (s) => s.department?.toLowerCase() === department.toLowerCase()
            );
            animateWithDelay(filtered.length, setDepartmentStudentCount, setLoadingDeptStudents);
        } catch (err) {
            console.error('Error fetching department student count:', err);
            setDepartmentStudentCount(0);
            setLoadingDeptStudents(false);
        }
    };

    const stats = [
        { label: 'Total Notices', value: noticeCount, loading: loadingNotices, path: '/faculty/notice' },
        { label: 'My Notices', value: myNoticeCount, loading: loadingMyNotices, path: '/faculty/notice' },
        { label: `Pending Students`, value: pendingStudents.length, loading: loadingPendingStudents, path: '/faculty/student-approvals' },
        { label: `Students in ${department || 'Department'}`, value: departmentStudentCount, loading: loadingDeptStudents, path: '/faculty/managestudents' },
    ];

    return (
        <div className="faculty-dashboard-container">
            <div className="faculty-banner">
                <h2>Welcome, {userName}!</h2>
                <p>Here's your dashboard overview.</p>
            </div>

            <div className="faculty-stats-grid">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className="faculty-stat-card"
                        onClick={() => navigate(item.path)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="faculty-stat-label">{item.label}</div>
                        <div className="faculty-stat-value">
                            {item.loading ? <div className="loader" /> : item.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="faculty-students-section">
                <h3>Pending Students in Your Department</h3>
                {loadingPendingStudents ? (
                    <p>Loading...</p>
                ) : pendingStudents.length === 0 ? (
                    <p>No students pending approval.</p>
                ) : (
                    <table className="faculty-student-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>College ID</th>
                                <th>Email</th>
                                <th>Batch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingStudents.map((s) => (
                                <tr key={s.id}>
                                    <td data-label="Name">{s.fullName}</td>
                                    <td data-label="CollegeId">{s.collegeId}</td>
                                    <td data-label="Email">{s.email}</td>
                                    <td data-label="Batch">{s.batch}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
