//// FacultyNoticeBoard.jsx

//import React, { useState, useEffect, useRef } from "react";
//import axios from "axios";
//import "./style/facultynoticeboard.css";
//import { FiCalendar, FiEye, FiMessageSquare, FiPlus } from "react-icons/fi";
//import BASE_URL from "../../config";
//import { FaThumbtack } from "react-icons/fa";
//import CommentSection from "../../components/CommentSection";
//import Skeleton from "react-loading-skeleton";
//import "react-loading-skeleton/dist/skeleton.css";

//const hasViewedToday = (noticeId) => {
//    const views = JSON.parse(localStorage.getItem("noticeViews") || "{}");
//    const today = new Date().toISOString().slice(0, 10);
//    return views[noticeId] === today;
//};

//const markAsViewedToday = (noticeId) => {
//    const views = JSON.parse(localStorage.getItem("noticeViews") || "{}");
//    const today = new Date().toISOString().slice(0, 10);
//    views[noticeId] = today;
//    localStorage.setItem("noticeViews", JSON.stringify(views));
//};

//const FacultyNoticeBoard = () => {
//    const [search, setSearch] = useState("");
//    const [selectedCategory, setSelectedCategory] = useState("All");
//    const [selectedDepartment, setSelectedDepartment] = useState("All");
//    const [showModal, setShowModal] = useState(false);
//    const [editingNoticeId, setEditingNoticeId] = useState(null);
//    const [openCommentsNoticeId, setOpenCommentsNoticeId] = useState(null);
//    const [toast, setToast] = useState("");
//    const [title, setTitle] = useState("");
//    const [category, setCategory] = useState("");
//    const [priority, setPriority] = useState("");
//    const [department, setDepartment] = useState("");
//    const [content, setContent] = useState("");
//    const [userRole, setUserRole] = useState("student");
//    const [userName, setUserName] = useState("");
//    const [notices, setNotices] = useState([]);
//    const [visibleCount, setVisibleCount] = useState(5);
//    const API_BASE = `${BASE_URL}/Notices`;
//    const loadMoreRef = useRef();

//    useEffect(() => {
//        const role = localStorage.getItem("userRole") || "student";
//        const name = localStorage.getItem("userName") || "";
//        setUserRole(role.toLowerCase());
//        setUserName(name.toLowerCase());
//        fetchNotices();
//    }, []);

//    const fetchNotices = async () => {
//        try {
//            const res = await axios.get(API_BASE);
//            setNotices(res.data);
//            triggerViewsOncePerNotice(res.data);
//        } catch (err) {
//            console.error("Error fetching notices:", err);
//        }
//    };

//    const triggerViewsOncePerNotice = async (noticesList) => {
//        const token = localStorage.getItem("token");
//        for (const notice of noticesList) {
//            if (!hasViewedToday(notice.id)) {
//                try {
//                    await axios.post(`${API_BASE}/increment-view/${notice.id}`, null, {
//                        headers: { Authorization: `Bearer ${token}` },
//                    });
//                    markAsViewedToday(notice.id);
//                } catch (err) {
//                    console.error(`Failed to increment view for notice ${notice.id}:`, err);
//                }
//            }
//        }
//    };

//    const showToast = (message) => {
//        setToast(message);
//        setTimeout(() => setToast(""), 3000);
//    };

//    const handleEdit = (notice) => {
//        setTitle(notice.title);
//        setCategory(notice.category);
//        setPriority(notice.priority);
//        setDepartment(notice.department);
//        setContent(notice.content);
//        setEditingNoticeId(notice.id);
//        setShowModal(true);
//    };

//    const handleTogglePin = async (notice) => {
//        const token = localStorage.getItem("token");

//        // Faculty can't unpin if not their own
//        if (userRole === "faculty" && notice.pin && notice.author.toLowerCase() !== userName) {
//            return showToast("You can't unpin admin's notice.");
//        }

//        try {
//            const res = await axios.post(`${API_BASE}/toggle-pin/${notice.id}`, null, {
//                headers: { Authorization: `Bearer ${token}` },
//            });
//            showToast(`Notice ${res.data ? "pinned" : "unpinned"} successfully`);
//            fetchNotices();
//        } catch (error) {
//            console.error("Pin toggle error:", error);
//            showToast("Failed to toggle pin");
//        }
//    };

//    const handleDelete = async (id) => {
//        if (window.confirm("Are you sure you want to delete this notice?")) {
//            try {
//                await axios.delete(`${API_BASE}/${id}`);
//                setNotices(notices.filter((n) => n.id !== id));
//                showToast("Notice deleted successfully!");
//            } catch (err) {
//                console.error("Delete error:", err);
//                showToast("Failed to delete notice");
//            }
//        }
//    };

//    const handleSubmit = async () => {
//        if (!title || !category || !priority || !department || !content)
//            return showToast("All fields are required.");
//        if (title.trim().length > 100) return showToast("Title must be under 100 characters.");
//        if (content.trim().length > 255) return showToast("Content must be under 255 characters.");

//        const noticeData = {
//            title: title.trim(),
//            category,
//            priority,
//            department,
//            content: content.trim(),
//            author: localStorage.getItem("userName"),
//            date: new Date().toISOString(),
//            views: 0,
//            comments: 0,
//            pin: false,
//        };

//        try {
//            if (editingNoticeId) {
//                await axios.put(`${API_BASE}/${editingNoticeId}`, {
//                    ...noticeData,
//                    id: editingNoticeId,
//                });
//                showToast("Notice updated successfully!");
//            } else {
//                await axios.post(API_BASE, noticeData);
//                showToast("Notice posted successfully!");
//            }

//            clearForm();
//            fetchNotices();
//        } catch (error) {
//            console.error("Save error:", error);
//            showToast("Failed to save notice");
//        }
//    };

//    const clearForm = () => {
//        setTitle("");
//        setCategory("");
//        setPriority("");
//        setDepartment("");
//        setContent("");
//        setEditingNoticeId(null);
//        setShowModal(false);
//    };

//    useEffect(() => {
//        const observer = new IntersectionObserver(
//            (entries) => {
//                if (entries[0].isIntersecting) {
//                    setVisibleCount((prev) => prev + 5);
//                }
//            },
//            { threshold: 1.0 }
//        );
//        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
//        return () => {
//            if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
//        };
//    }, [notices]);

//    const filteredNotices = notices
//        .filter((notice) => {
//            const matchSearch = notice.title.toLowerCase().includes(search.toLowerCase()) || notice.content.toLowerCase().includes(search.toLowerCase());
//            const matchCategory = selectedCategory === "All" || notice.category === selectedCategory;
//            const matchDepartment = selectedDepartment === "All" || notice.department === selectedDepartment;
//            return matchSearch && matchCategory && matchDepartment;
//        })
//        .sort((a, b) => {
//            if (a.pin && !b.pin) return -1;
//            if (!a.pin && b.pin) return 1;
//            return new Date(b.date) - new Date(a.date);
//        });

//    const visibleNotices = filteredNotices.slice(0, visibleCount);

//    return (
//        <div className="notice-content">
//            <div className="noticeboard-header">
//                <h2>Notice Board</h2>
//                {(userRole === "admin" || userRole === "faculty") && (
//                    <button className="create-btn" onClick={() => setShowModal(true)}>
//                        <FiPlus /> Create Notice
//                    </button>
//                )}
//            </div>

//            <div className="notice-filters">
//                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
//                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
//                    <option value="All">All Categories</option>
//                    <option value="Announcement">Announcement</option>
//                    <option value="Exam">Exam</option>
//                    <option value="Event">Event</option>
//                    <option value="General">General</option>
//                </select>
//                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
//                    <option value="All">All Departments</option>
//                    <option value="Computer Science">Computer Science</option>
//                    <option value="Chemistry">Chemistry</option>
//                    <option value="Physics">Physics</option>
//                    <option value="Maths">Mathematics</option>
//                </select>
//            </div>

//            <div className="notices-list">
//                {notices.length === 0 ? (
//                    [...Array(3)].map((_, i) => (
//                        <div className="notice-card" key={i}>
//                            <Skeleton height={30} width="60%" style={{ marginBottom: 10 }} />
//                            <Skeleton height={20} count={3} />
//                        </div>
//                    ))
//                ) : (
//                    visibleNotices.map((notice) => (
//                        <div key={notice.id} className="notice-card">
//                            <div className="notice-tags">
//                                <span className={`tag ${notice.priority.toLowerCase()}`}>For {notice.priority}</span>
//                                <span className="tag category">{notice.category}</span>
//                                {(userRole === "admin" || notice.author?.toLowerCase() === userName) && (
//                                    <button className="pin-notice" onClick={() => handleTogglePin(notice)}>
//                                        <FaThumbtack color={notice.pin ? "red" : "#3b8d3b"} />
//                                        <span>{notice.pin ? "Pinned" : "Pin"}</span>
//                                    </button>
//                                )}
//                            </div>

//                            <h3>{notice.title}</h3>
//                            <div className="notice-meta">
//                                <span><FiCalendar /> {new Date(notice.date).toLocaleString()}</span>
//                                <span>🏫 {notice.department}</span>
//                            </div>
//                            <p className="notice-content">{notice.content}</p>

//                            <div className="notice-footer">
//                                <div className="notice-actions">
//                                    <div className="notice-views">
//                                    <span><FiEye /> {notice.views || 0}</span>
//                                    <span
//                                        style={{ cursor: "pointer", color: "#007bff" }}
//                                        onClick={() =>
//                                            setOpenCommentsNoticeId(
//                                                openCommentsNoticeId === notice.id ? null : notice.id
//                                            )
//                                        }
//                                    >
//                                        <FiMessageSquare /> {notice.comments || 0} Comment
//                                        </span>
//                                    </div>
//                                </div>
//                                {(userRole === "admin" || notice.author?.toLowerCase() === userName) && (
//                                    <div className="edit-delete-buttons">
//                                        <button className="edit-btn" onClick={() => handleEdit(notice)}>✏️ Edit</button>
//                                        {userRole === "admin" && (
//                                            <button className="delete-btn" onClick={() => handleDelete(notice.id)}>🗑️ Delete</button>
//                                        )}
//                                    </div>
//                                )}
//                            </div>

//                            {openCommentsNoticeId === notice.id && (
//                                <div className="comment-modal-overlay">
//                                    <div className="comment-modal">
//                                        <button className="close-btn" onClick={() => setOpenCommentsNoticeId(null)}>✖</button>
//                                        <CommentSection noticeId={notice.id} />
//                                    </div>
//                                </div>
//                            )}
//                        </div>
//                    ))
//                )}
//                <div ref={loadMoreRef}></div>
//            </div>

//            {visibleCount < filteredNotices.length && (
//                <div className="load-more">
//                    <button onClick={() => setVisibleCount((prev) => prev + 5)}>Load More</button>
//                </div>
//            )}

//            {showModal && (
//                <div className="modal">
//                    <div className="modal-content">
//                        <h3>{editingNoticeId ? "Edit Notice" : "Create Notice"}</h3>
//                        <input type="text" placeholder="Title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
//                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
//                            <option value="">Select Category</option>
//                            <option value="Announcement">Announcement</option>
//                            <option value="Exam">Exam</option>
//                            <option value="Event">Event</option>
//                            <option value="General">General</option>
//                        </select>
//                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
//                            <option value="">Select Priority</option>
//                            <option value="Faculties & Students">All</option>
//                            <option value="Faculty">Faculty</option>
//                            <option value="Students">Students</option>
//                        </select>
//                        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
//                            <option value="">Select Department</option>
//                            <option value="All Department">All Department</option>
//                            <option value="Computer Science">Computer Science</option>
//                            <option value="Chemistry">Chemistry</option>
//                            <option value="Physics">Physics</option>
//                            <option value="Maths">Mathematics</option>
//                        </select>
//                        <textarea placeholder="Content" value={content} maxLength={255} onChange={(e) => setContent(e.target.value)}></textarea>
//                        <div className="modal-actions">
//                            <button className={editingNoticeId ? "btn-update" : "btn-post"} onClick={handleSubmit}>
//                                {editingNoticeId ? "Update" : "Post"}
//                            </button>
//                            <button onClick={clearForm}>Cancel</button>
//                        </div>
//                    </div>
//                </div>
//            )}

//            {toast && <div className="toast">{toast}</div>}
//        </div>
//    );
//};

//export default FacultyNoticeBoard;
