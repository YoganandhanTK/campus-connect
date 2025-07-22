import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./style/FacultyNotice.css";
import { FiCalendar, FiEye, FiMessageSquare } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";
import {faUserPlus} from '@fortawesome/free-solid-svg-icons';
import BASE_URL from "../../config";
import CommentSection from "../../components/CommentSection";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const FacultyNotice = () => {
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

    // Wrap triggerViewsOncePerNotice in useCallback first, as fetchNotices depends on it
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
    }, [API_BASE]); // Dependencies for useCallback: API_BASE

    // Wrap fetchNotices in useCallback, including triggerViewsOncePerNotice as a dependency
    const fetchNotices = useCallback(async () => {
        try {
            const res = await axios.get(API_BASE);
            setNotices(res.data);
            triggerViewsOncePerNotice(res.data);
        } catch (err) {
            console.error("Error fetching notices:", err);
        }
    }, [API_BASE, triggerViewsOncePerNotice]); // Add triggerViewsOncePerNotice here!

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "student";
        setUserRole(role.toLowerCase());
        fetchNotices();
    }, [fetchNotices]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const handleEdit = (notice) => {
        setTitle(notice.title);
        setCategory(notice.category);
        setPriority(notice.priority);
        setDepartment(notice.department);
        setContent(notice.content);
        setEditingNoticeId(notice.id);
        setShowModal(true);
    };

    const handleTogglePin = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${API_BASE}/toggle-pin/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast(`Notice ${res.data ? "pinned" : "unpinned"} successfully`);
            fetchNotices();
        } catch (error) {
            console.error("Pin toggle error:", error);
            showToast("Failed to toggle pin");
        }
    };

    const handleDelete = (id) => {
        setConfirmBox({
            visible: true,
            message: "Are you sure you want to delete this notice?",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(`${API_BASE}/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setNotices(notices.filter((n) => n.id !== id));
                    showToast("Notice deleted successfully.");
                } catch (err) {
                    console.error("Delete failed", err);
                    showToast("Failed to delete notice");
                } finally {
                    setConfirmBox({ visible: false, onConfirm: null, message: "" });
                }
            },
        });
    };

    const handleSubmit = async () => {
        if (title.trim().length > 100) return showToast("Title must be under 100 characters.");
        if (content.trim().length > 255) return showToast("Content must be under 255 characters.");
        if (!title || !category || !priority || !department || !content)
            return showToast("All fields are required.");

        const noticeData = {
            title: title.trim(),
            category,
            priority,
            department,
            content: content.trim(),
            author: localStorage.getItem("userName"),
            date: new Date().toISOString(),
            views: 0,
            comments: 0,
            pin: false,
        };

        try {
            if (editingNoticeId) {
                await axios.put(`${API_BASE}/${editingNoticeId}`, {
                    ...noticeData,
                    id: editingNoticeId,
                });
                showToast("Notice updated successfully!");
            } else {
                await axios.post(API_BASE, noticeData);
                showToast("Notice posted successfully!");
            }
            clearForm();
            fetchNotices();
        } catch (error) {
            console.error("Save error:", error);
            showToast("Failed to save notice");
        }
    };

    const clearForm = () => {
        setTitle("");
        setCategory("");
        setPriority("");
        setDepartment("");
        setContent("");
        setEditingNoticeId(null);
        setShowModal(false);
    };

   

    const loadMoreRef = useRef();
    useEffect(() => {
        // Capture the current value of the ref
        const currentRef = loadMoreRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + 5);
                }
            },
            { threshold: 1.0 }
        );

        // Use the captured ref for observing
        if (currentRef) observer.observe(currentRef);

        // Use the captured ref for unobserving in the cleanup
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [notices]); // notices is a dependency for this useEffect because `visibleCount` updates based on `filteredNotices.length` which in turn depends on `notices`.


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
                                <button className="pin-notice" onClick={() => handleTogglePin(notice.id)}>
                                    <FaThumbtack color={notice.pin ? "red" : "#3b8d3b"} />
                                    <span style={{ marginLeft: "5px", color: notice.pin ? "red" : "#3b8d3b" }}>
                                        {notice.pin ? "Pinned" : "Pin"}
                                    </span>
                                </button>
                            </div>

                            <h3>{notice.title}</h3>
                            <div className="notice-meta">
                                <span><FiCalendar /> {new Date(notice.date).toLocaleString()}</span>
                                <span  className={`tag ${notice.department.toLowerCase()}`}>{notice.department}</span>
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
                                    {(userRole === "admin" || userRole === "faculty") && (
                                        <div className="edit-delete-buttons">
                                            <button className="edit-btn" onClick={() => handleEdit(notice)}> Edit</button>
                                            {userRole === "admin" && (
                                                <button className="delete-btn" onClick={() => handleDelete(notice.id)}> Delete</button>
                                            )}
                                        </div>
                                    )}
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

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editingNoticeId ? "Edit Notice" : "Create Notice"}</h3>
                        <input type="text" placeholder="Title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
                        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            <option value="Announcement">Announcement</option>
                            <option value="Exam">Exam</option>
                            <option value="Event">Event</option>
                            <option value="General">General</option>
                        </select>
                        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="">Select Priority</option>
                            <option value="Faculties & Students">All</option>
                            <option value="Faculties">Faculty</option>
                            <option value="Students">Students</option>
                        </select>
                        <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                            <option value="">Select Department</option>
                            <option value="All Department">All Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="Maths">Mathematics</option>
                        </select>
                        <textarea placeholder="Content" maxLength={255} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                        <div className="modal-actions">
                            <button className={editingNoticeId ? "btn-update" : "btn-post"} onClick={handleSubmit}>
                                {editingNoticeId ? "Update" : "Post"}
                            </button>
                            <button onClick={clearForm}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyNotice;