import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./style/StudentNotice.css";
import { FiCalendar, FiEye, FiMessageSquare } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BASE_URL from "../../config";
import CommentSection from "../../components/CommentSection";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const hasViewedToday = (noticeId) => {
    const views = JSON.parse(localStorage.getItem("noticeViews") || "{}");
    const today = new Date().toISOString().slice(0, 10);
    return views[noticeId] === today;
};

const markAsViewedToday = (noticeId) => {
    const views = JSON.parse(localStorage.getItem("noticeViews") || "{}");
    const today = new Date().toISOString().slice(0, 10);
    views[noticeId] = today;
    localStorage.setItem("noticeViews", JSON.stringify(views));
};

const StudentNotice = () => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [editingNoticeId, setEditingNoticeId] = useState(null);
    const [openCommentsNoticeId, setOpenCommentsNoticeId] = useState(null);
    const [toast, setToast] = useState("");
    const [confirmBox, setConfirmBox] = useState({ visible: false, onConfirm: null, message: "" });

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [department, setDepartment] = useState("");
    const [content, setContent] = useState("");

    const [userRole, setUserRole] = useState("student");
    const [notices, setNotices] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);

    const API_BASE = `${BASE_URL}/Notices`;

    const triggerViewsOncePerNotice = useCallback(async (noticesList) => {
        const token = localStorage.getItem("token");
        for (const notice of noticesList) {
            if (!hasViewedToday(notice.id)) {
                try {
                    await axios.post(`${API_BASE}/increment-view/${notice.id}`, null, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    markAsViewedToday(notice.id);
                } catch (err) {
                    console.error(`Failed to increment view for notice ${notice.id}:`, err);
                }
            }
        }
    }, [API_BASE]);

    const fetchNotices = useCallback(async () => {
        try {
            const res = await axios.get(API_BASE);
            setNotices(res.data);
            triggerViewsOncePerNotice(res.data);
        } catch (err) {
            console.error("Error fetching notices:", err);
        }
    }, [API_BASE, triggerViewsOncePerNotice]);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role?.toLowerCase() || "student");
        fetchNotices();
    }, [fetchNotices]);

    const loadMoreRef = useRef();
    useEffect(() => {
        const currentRef = loadMoreRef.current;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount((prev) => prev + 5);
            }
        }, { threshold: 1.0 });

        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [notices]);

    const filteredNotices = notices
        .filter((notice) => {
            const matchSearch =
                notice.title.toLowerCase().includes(search.toLowerCase()) ||
                notice.content.toLowerCase().includes(search.toLowerCase());
            const matchCategory = selectedCategory === "All" || notice.category === selectedCategory;
            const matchDepartment = selectedDepartment === "All" || notice.department === selectedDepartment;
            return matchSearch && matchCategory && matchDepartment;
        })
        .sort((a, b) => {
            if (a.pin && !b.pin) return -1;
            if (!a.pin && b.pin) return 1;
            return new Date(b.date) - new Date(a.date);
        });

    const visibleNotices = filteredNotices.slice(0, visibleCount);

    return (
        <div className="notice-content">
            <div className="noticeboard-header">
                <h2>Notice Board</h2>
                {(userRole === "admin" || userRole === "faculty") && (
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faUserPlus} />
                        <span className="btn-text"> Create Notice</span>
                    </button>
                )}
            </div>

            <p className="notice">Stay updated with campus announcements and events</p>

            <div className="notice-filters">
                <input
                    type="text"
                    placeholder="Search notices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="filter-selects">
                    <select className="select-categor" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Academic">Academic</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="General">General</option>
                    </select>
                    <select className="select-dept" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option value="All">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Maths">Mathematics</option>
                    </select>
                </div>
            </div>

            <div className="notices-list">
                {notices.length === 0 ? (
                    [...Array(3)].map((_, i) => (
                        <div className="notice-card" key={i}>
                            <Skeleton height={30} width={`60%`} style={{ marginBottom: 10 }} />
                            <Skeleton height={20} count={3} />
                        </div>
                    ))
                ) : (
                    visibleNotices.map((notice) => (
                        <div key={notice.id} className="notice-card">
                            <div className="notice-tags">
                                <div className="notice-topings">
                                    <span className={`tag ${notice.priority.toLowerCase()}`}>For {notice.priority}</span>
                                </div>
                               {notice.pin && (
                                    <div className="pinned-notice">
                                        <FaThumbtack color="red" />
                                        <span style={{ marginLeft: "5px", color: "red" }}>Pinned</span>
                                    </div>
                                )}

                            </div>

                            <h3>{notice.title}</h3>
                            <div className="notice-meta">
                                <span><FiCalendar /> {new Date(notice.date).toLocaleString()}</span>
                                <span className={`tag ${notice.department.toLowerCase()}`}>{notice.department}</span>
                                <span className={`tag ${notice.category.toLowerCase()}`}>{notice.category}</span>
                            </div>

                            <p className="notice-content">{notice.content}</p>

                            <div className="notice-footer">
                                <div className="notice-actions">
                                    <div className="notice-views">
                                        <span><FiEye /> {notice.views || 0}</span>
                                        <span
                                            style={{ cursor: "pointer", color: "#007bff" }}
                                            onClick={() =>
                                                setOpenCommentsNoticeId(
                                                    openCommentsNoticeId === notice.id ? null : notice.id
                                                )
                                            }
                                        >
                                            <FiMessageSquare /> {notice.comments || 0} Comment
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {openCommentsNoticeId === notice.id && (
                                <div className="comment-modal-overlay">
                                    <div className="comment-modal">
                                        <button className="close-btn" onClick={() => setOpenCommentsNoticeId(null)}>✖</button>
                                        <CommentSection noticeId={notice.id} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={loadMoreRef}></div>

                {confirmBox.visible && (
                    <div className="notice-confirm-overlay">
                        <div className="notice-confirm-box">
                            <p>{confirmBox.message}</p>
                            <div className="confirm-actions">
                                <button className="btn-confirm" onClick={confirmBox.onConfirm}>Yes</button>
                                <button className="btn-cancel" onClick={() => setConfirmBox({ visible: false, onConfirm: null, message: "" })}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && <div className="toast">{toast}</div>}
            </div>

            {visibleCount < filteredNotices.length && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button className="load-more-btn" onClick={() => setVisibleCount((prev) => prev + 5)}>
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentNotice;
