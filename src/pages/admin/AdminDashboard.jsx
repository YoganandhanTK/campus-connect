import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/admindashboard.css';
import BASE_URL from '../../config.js';

const AdminDashboard = () => {
    const [userName, setUserName] = useState("User");
    const [noticeCount, setNoticeCount] = useState(0);
    const [facultyCount, setFacultyCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    const [loadingNotices, setLoadingNotices] = useState(true);
    const [loadingFaculty, setLoadingFaculty] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const NOTICE_API = `${BASE_URL}/Notices`;
    const FACULTY_API = `${BASE_URL}/Faculties/faculties`;
    const STUDENT_API = `${BASE_URL}/Students/students/approved`;

    useEffect(() => {
        const name = localStorage.getItem('userName');
        if (name) setUserName(name);

        fetchNoticesCount();
        fetchFacultyCount();
        fetchStudentCount();
    }, []);

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

    const fetchNoticesCount = async () => {
        setLoadingNotices(true);
        try {
            const res = await axios.get(NOTICE_API);
            const notices = res.data || [];
            const role = localStorage.getItem("userRole") || "admin";

            const count = role === "admin"
                ? notices.length
                : notices.filter(n => (n.author || "").toLowerCase() === (userName || "").toLowerCase()).length;

            animateWithDelay(count, setNoticeCount, setLoadingNotices);
        } catch (err) {
            console.error("Error fetching notices:", err);
            setNoticeCount(0);
            setLoadingNotices(false);
        }
    };

    const fetchFacultyCount = async () => {
        setLoadingFaculty(true);
        try {
            const res = await axios.get(FACULTY_API);
            animateWithDelay(res.data.length || 0, setFacultyCount, setLoadingFaculty);
        } catch (err) {
            console.error("Error fetching faculty count:", err);
            setFacultyCount(0);
            setLoadingFaculty(false);
        }
    };

    const fetchStudentCount = async () => {
        setLoadingStudents(true);
        try {
            const res = await axios.get(STUDENT_API);
            const approved = res.data.filter(s => s.role?.toLowerCase() === "student");
            animateWithDelay(approved.length, setStudentCount, setLoadingStudents);
        } catch (err) {
            console.error("Error fetching student count:", err);
            setStudentCount(0);
            setLoadingStudents(false);
        }
    };

    const stats = [
        { label: "Total Notices", value: noticeCount, loading: loadingNotices },
        { label: "Total Faculty", value: facultyCount, loading: loadingFaculty },
        { label: "Total Students", value: studentCount, loading: loadingStudents },
    ];

    return (
        <div className="admin-page-container">
            <div className="admin-welcome-banner">
                <h2>Welcome, {userName}!</h2>
                <p>Here's what's happening in your campus community.</p>
            </div>

            <div className="admin-stats-grid">
                {stats.map((item, index) => (
                    <div key={index} className="admin-stat-card">
                        <div className="admin-stat-label">{item.label}</div>
                        <div className="admin-stat-value">
                            {item.loading ? <div className="admin-loader"></div> : item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
