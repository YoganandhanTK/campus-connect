import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import './style/FacultyDashboard.css';

const FacultyDashboard = () => {
    const [userName, setUserName] = useState('Faculty');
    const [department, setDepartment] = useState('');
    const [noticeCount, setNoticeCount] = useState(0);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [departmentStudentCount, setDepartmentStudentCount] = useState(0);

    const [loadingNotices, setLoadingNotices] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingCount, setLoadingCount] = useState(true);

    const token = localStorage.getItem('token');

    const decodeToken = (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (err) {
            console.error('Invalid token', err);
            return {};
        }
    };

    useEffect(() => {
        const name = localStorage.getItem('userName');
        if (name) setUserName(name);

        if (token) {
            const decoded = decodeToken(token);
            if (decoded?.Department) setDepartment(decoded.Department);
        }

        fetchMyNotices();
        fetchPendingStudents();
    }, []);

    useEffect(() => {
        if (department) {
            fetchDepartmentStudentCount();
        }
    }, [department]);

    const fetchMyNotices = async () => {
        try {
            setLoadingNotices(true);
            const res = await axios.get(`${BASE_URL}/Notices`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const lowerName = (userName || '').toLowerCase();
            const myNotices = res.data.filter(
                (n) => (n.author || '').toLowerCase() === lowerName
            );

            setNoticeCount(myNotices.length);
        } catch (err) {
            console.error('Error fetching notices:', err);
        } finally {
            setLoadingNotices(false);
        }
    };

    const fetchPendingStudents = async () => {
        try {
            setLoadingStudents(true);
            const res = await axios.get(`${BASE_URL}/Faculties/pending-students`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPendingStudents(res.data || []);
        } catch (err) {
            console.error('Error fetching pending students:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchDepartmentStudentCount = async () => {
        try {
            setLoadingCount(true);
            const res = await axios.get(`${BASE_URL}/Students/students/approved`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const filtered = res.data.filter(s => s.department === department);
            setDepartmentStudentCount(filtered.length);
        } catch (err) {
            console.error('Error fetching department student count:', err);
        } finally {
            setLoadingCount(false);
        }
    };

    return (
        <div className="faculty-dashboard-container">
            <div className="faculty-banner">
                <h2>Welcome, {userName}!</h2>
                <p>Here's your dashboard overview.</p>
            </div>

            <div className="faculty-stats">
                <div className="faculty-card">
                    <h4>Total Notices</h4>
                    {loadingNotices ? <div className="loader" /> : <span>{noticeCount}</span>}
                </div>

                <div className="faculty-card">
                    <h4>Pending Students</h4>
                    {loadingStudents ? <div className="loader" /> : <span>{pendingStudents.length}</span>}
                </div>

                <div className="faculty-card">
                    <h4>Total Students in {department || "your department"}</h4>
                    {loadingCount ? <div className="loader" /> : <span>{departmentStudentCount}</span>}
                </div>
            </div>

            <div className="faculty-students-section">
                <h3>Pending Students in Your Department</h3>
                {loadingStudents ? (
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
                                    <td>{s.fullName}</td>
                                    <td>{s.collegeId}</td>
                                    <td>{s.email}</td>
                                    <td>{s.batch}</td>
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
