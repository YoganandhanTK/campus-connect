import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaUserGraduate, FaComments, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../../config';
import './style/StudentDashboard.css';

function StudentDashboard() {
    const [userName, setUserName] = useState('');
    const [totalNotices, setTotalNotices] = useState(0);
    // const [totalGroupChats, setTotalGroupChats] = useState(0); // Commented out based on your provided code
    // const [totalEvents, setTotalEvents] = useState(0); // Commented out based on your provided code

    // Loading states for each section
    const [loadingNotices, setLoadingNotices] = useState(true);
    // const [loadingGroupChats, setLoadingGroupChats] = useState(true); // Commented out
    // const [loadingEvents, setLoadingEvents] = useState(true); // Commented out

    const token = localStorage.getItem('token'); // Get token for authorized calls
    const navigate = useNavigate(); // Initialize useNavigate hook here ✅

    // Helper for animated counts
    const animateWithDelay = useCallback((target, setter, setLoading) => {
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
    }, []);

    // Fetch total notices count
    const fetchTotalNotices = useCallback(async () => {
        setLoadingNotices(true);
        try {
            const res = await axios.get(`${BASE_URL}/Notices`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const notices = res.data || [];
            animateWithDelay(notices.length, setTotalNotices, setLoadingNotices);
        } catch (err) {
            console.error('Error fetching total notices:', err);
            setTotalNotices(0);
            setLoadingNotices(false);
        }
    }, [token, animateWithDelay]);

    // Your commented out fetchTotalGroupChats and fetchTotalEvents are fine,
    // uncomment them and their respective states/loading states if you need them.

    useEffect(() => {
        const name = localStorage.getItem('userName') || 'Student';
        setUserName(name);

        fetchTotalNotices();
        // If you uncomment fetchTotalGroupChats and fetchTotalEvents, remember to add them here:
        // fetchTotalGroupChats();
        // fetchTotalEvents();
    }, [fetchTotalNotices]); // Update dependencies if you uncomment other fetch functions

    // Define the stats array
    const stats = [
        // Example if you re-enable: { label: 'Total Events', value: totalEvents, loading: loadingEvents, path: '/student/events' },
        // Example if you re-enable: { label: 'Group Chats', value: totalGroupChats, loading: loadingGroupChats, path: '/student/group-chats' },
        { label: 'Notices', value: totalNotices, loading: loadingNotices, path: '/student/viewnotice' },
    ];

    return (
        <div className="main-center">
            <section className="greeting">
                <h2>Good afternoon, {userName}!</h2>
                <p>Welcome to your student dashboard. Here's what's happening in your academic life.</p>
            </section>

            <section className="stats-grid">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className={`stat-card ${['green'][index % 1]}`} // This will always apply 'green'
                        onClick={() => item.path && navigate(item.path)} 
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Render icon based on item.label */}
                        {item.label === 'Notices' && <FaChartLine size={24} />}
                        {/* If you re-enable other stats, add their icons here: */}
                        {/* {item.label === 'Total Events' && <FaUserGraduate size={24} />} */}
                        {/* {item.label === 'Group Chats' && <FaComments size={24} />} */}
                        <div className="stat-card-notice">
                            <p>{item.label}</p>
                            <span className="stat-value">
                                {item.loading ? <div className="loader" /> : item.value}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

           
           <section className="recent-activity">
                <h3>Recent Activity</h3>
                <ul>
                    <li> New assignment posted in Maths</li>
                    <li> Notice about upcoming exams</li>
                    <li> New chat message from AI Group</li>
                    <li> You scored 18/20 in OOPS quiz</li>
                </ul>
            </section>
        </div>
    );
}

export default StudentDashboard;