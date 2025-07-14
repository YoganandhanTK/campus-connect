import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../config.js';
import './styles/managestudent.css';

const ManagedStudents = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('All Departments');
    const [loading, setLoading] = useState(true);
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');
    const [confirmBox, setConfirmBox] = useState({ visible: false, onConfirm: null, message: '' });
    const [deletedStudentId, setDeletedStudentId] = useState(null);

    // Make showToast stable
    const showToast = useCallback((msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }, []);

    // Define fetchStudents using useCallback
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setShowLoadingIndicator(true);

        const role = localStorage.getItem("role");
        const department = localStorage.getItem("department");
        const token = localStorage.getItem("token");

        try {
            let url = `${BASE_URL}/Students/students/approved`;

            if (role === "faculty") {
                url += `?department=${encodeURIComponent(department)}`;
            }

            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setStudents(res.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            showToast('❌ Failed to fetch students');
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, [showToast, setStudents, setLoading, setShowLoadingIndicator]);

    // This useEffect is now correct, relying on the stable fetchStudents
    useEffect(() => {
        const delay = setTimeout(() => {
            setShowLoadingIndicator(true);
        }, 400);

        fetchStudents();

        return () => clearTimeout(delay);
    }, [fetchStudents, setShowLoadingIndicator]); // setShowLoadingIndicator is a setter, so stable

    // Define handleUndoDelete using useCallback as it's used in showUndoToast and calls fetchStudents
    const handleUndoDelete = useCallback(async () => {
        try {
            await axios.put(`${BASE_URL}/Students/${deletedStudentId}/restore`);
            showToast('✅ Student restored!');
            fetchStudents(); // Calls fetchStudents, so fetchStudents must be a dependency
        } catch {
            showToast('❌ Failed to restore student');
        }
    }, [deletedStudentId, showToast, fetchStudents]);

    // Make showUndoToast stable, as it uses showToast and handleUndoDelete
    const showUndoToast = useCallback((message, id) => {
        setDeletedStudentId(id);
        setToast(
            <div>
                {message}
                <button
                    onClick={handleUndoDelete}
                    style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
                >
                    Undo
                </button>
            </div>
        );
        setTimeout(() => {
            setToast('');
            setDeletedStudentId(null);
        }, 4000);
    }, [handleUndoDelete, setDeletedStudentId, setToast]);

    // RE-ADDED: handleEdit function
    const handleEdit = useCallback((student) => { // Wrapped in useCallback for consistency, good practice
        setEditingStudent({
            id: student.id,
            fullName: student.fullName || '',
            email: student.email || '',
            department: student.department || '',
            batch: student.batch || '',
            avatar: student.avatar || ''
        });
        setShowModal(true);
    }, [setEditingStudent, setShowModal]); // Dependencies are state setters, which are stable

    // Define handleUpdate using useCallback as it calls showToast and fetchStudents
    const handleUpdate = useCallback(async () => {
        try {
            const { id, fullName, email, department, batch, avatar } = editingStudent;
            const payload = { fullName, email, department, batch, avatar };
            await axios.put(`${BASE_URL}/Students/students/${id}`, payload);
            showToast('✅ Student updated successfully!');
            setShowModal(false);
            fetchStudents(); // Calls fetchStudents, so fetchStudents must be a dependency
        } catch {
            showToast('❌ Update failed!');
        }
    }, [editingStudent, showToast, setShowModal, fetchStudents]); // Add all dependencies

    // Define handleDelete using useCallback as it calls setConfirmBox, showUndoToast
    const handleDelete = useCallback((id) => {
        setConfirmBox({
            visible: true,
            message: 'Are you sure you want to delete this student?',
            onConfirm: async () => {
                try {
                    await axios.delete(`${BASE_URL}/Students/students/${id}`);
                    setStudents(prev => prev.filter(s => s.id !== id));
                    setConfirmBox({ visible: false, message: '', onConfirm: null });
                    showUndoToast('🗑️ Student deleted.', id);
                } catch {
                    showToast('❌ Delete failed!');
                }
            }
        });
    }, [setConfirmBox, setStudents, showUndoToast, showToast]);


    const getInitials = (name) => {
        if (!name) return 'NA';
        const parts = name.split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name[0].toUpperCase();
    };

    const filtered = students.filter(s =>
        (s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            s.collegeId?.toLowerCase().includes(search.toLowerCase())) &&
        (department === 'All Departments' || s.department === department)
    );

    return (
        <div className="manage-students-content">
            <div className="manage-students-header">
                <div>
                    <h2>Manage Students</h2>
                    <p>View and manage all students</p>
                </div>
            </div>

            <div className="student-filters">
                <div className="student-search-filter">
                    <input
                        type="text"
                        placeholder="🔍 Search by name or ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option>All Departments</option>
                        <option>Computer Science</option>
                        <option>Maths</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                    </select>
                </div>
            </div>

            <div className="student-table">
                <div className="student-table-header">
                    <span>Student</span>
                    <span>Student ID</span>
                    <span>Department</span>
                    <span>Actions</span>
                </div>

                {loading && showLoadingIndicator ? (
                    <div className="student-loading">Loading students...</div>
                ) : !loading && filtered.length === 0 ? (
                    <div className="student-no-data">No students found.</div>
                ) : (
                    filtered.map((user, idx) => (
                        <div className="student-row" key={idx}>
                            <div className="student-user-cell">
                                <div className="student-avatar">
                                    {getInitials(user.fullName)}
                                </div>
                                <div>
                                    <strong>{user.fullName}</strong>
                                    <div className="student-email">{user.email}</div>
                                </div>
                            </div>
                            <span>{user.collegeId}</span>
                            <span>{user.department}</span>
                            <span className="student-actions">
                                <FaEdit
                                    title="Edit"
                                    onClick={() => handleEdit(user)}
                                    style={{ marginRight: '10px', color: 'green', cursor: 'pointer' }}
                                />
                                <FaTrash
                                    title="Delete"
                                    onClick={() => handleDelete(user.id)}
                                    style={{ color: 'red', cursor: 'pointer' }}
                                />
                            </span>
                        </div>
                    ))
                )}
            </div>

            {showModal && editingStudent && (
                <div className="student-modal-overlay">
                    <div className="student-modal">
                        <h3>Edit Student</h3>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={editingStudent.fullName}
                            onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={editingStudent.email}
                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Department"
                            value={editingStudent.department}
                            onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Batch"
                            value={editingStudent.batch}
                            onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                        />
                        <div className="student-modal-actions">
                            <button onClick={handleUpdate}>Update</button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="student-popup-message">{toast}</div>}

            {confirmBox.visible && (
                <div className="student-confirm-overlay">
                    <div className="student-confirm-box">
                        <p>{confirmBox.message}</p>
                        <div className="confirm-actions">
                            <button onClick={confirmBox.onConfirm}>Yes</button>
                            <button onClick={() => setConfirmBox({ visible: false, onConfirm: null, message: '' })}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagedStudents;