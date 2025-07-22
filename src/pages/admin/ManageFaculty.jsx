import React, { useState, useEffect, useCallback } from 'react'; // Make sure useCallback is imported
import { FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../../config.js';
import './style/usermanage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUserPlus} from '@fortawesome/free-solid-svg-icons';



const ManageFaculty = () => {
    const [search, setSearch] = useState('');
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingFacultyId, setEditingFacultyId] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
    const [toast, setToast] = useState('');
    const [deletedFacultyId, setDeletedFacultyId] = useState(null);
    const [confirmBox, setConfirmBox] = useState({ visible: false, onConfirm: null, message: '' });

    const [facultyData, setFacultyData] = useState({
        fullName: '',
        collegeId: '',
        email: '',
        department: '',
        password: ''
    });

    // 1. Make showSimpleToast stable
    const showSimpleToast = useCallback((message) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    }, [setToast]); // setToast is a stable setter

    // 2. Make resetForm stable
    const resetForm = useCallback(() => {
        setFacultyData({
            fullName: '',
            collegeId: '',
            email: '',
            department: '',
            password: ''
        });
        setIsEditMode(false);
        setEditingFacultyId(null);
    }, [setFacultyData, setIsEditMode, setEditingFacultyId]); // State setters are stable

    // 3. Make fetchFaculty stable, as it's used in useEffect and other functions
    const fetchFaculty = useCallback(async () => {
        setLoading(true);
        setShowLoadingIndicator(true);

        try {
            const res = await axios.get(`${BASE_URL}/Faculties/faculties`);
            setFaculty(res.data);

            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) { // Catch the error object for better debugging
            console.error("Error fetching faculty:", error);
            showSimpleToast('Error fetching faculty');
            setLoading(false);
        }
    }, [setLoading, setShowLoadingIndicator, setFaculty, showSimpleToast]); // Dependencies for fetchFaculty

    // 4. Make handleUndoDelete stable, as it's used in showUndoToast and calls fetchFaculty
    const handleUndoDelete = useCallback(async () => {
        try {
            await axios.put(`${BASE_URL}/Faculties/${deletedFacultyId}/restore`);
            showSimpleToast('Faculty restored!');
            fetchFaculty(); // fetchFaculty is a dependency here
        } catch (error) {
            console.error("Error restoring faculty:", error);
            showSimpleToast('Failed to restore faculty');
        }
    }, [deletedFacultyId, showSimpleToast, fetchFaculty]); // Dependencies for handleUndoDelete

    // 5. Make showUndoToast stable, as it uses handleUndoDelete
    const showUndoToast = useCallback((message, id) => {
        setDeletedFacultyId(id);
        setToast(
            <div>
                {message}
                <button
                    onClick={handleUndoDelete} // handleUndoDelete is a dependency here
                    style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
                >
                    Undo
                </button>
            </div>
        );
        setTimeout(() => {
            setToast('');
            setDeletedFacultyId(null);
        }, 4000);
    }, [handleUndoDelete, setDeletedFacultyId, setToast]); // Dependencies for showUndoToast

    // 6. Make handleCreateOrUpdateFaculty stable, as it uses many state setters and other functions
    const handleCreateOrUpdateFaculty = useCallback(async () => {
        setCreating(true);
        const token = localStorage.getItem('token');

        try {
            if (isEditMode) {
                const updatedData = {
                    fullName: facultyData.fullName,
                    email: facultyData.email,
                    department: facultyData.department,
                    isApproved: true
                };

                await axios.put(`${BASE_URL}/Faculties/${editingFacultyId}`, updatedData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showSimpleToast('Faculty updated successfully!');
            } else {
                await axios.post(`${BASE_URL}/Faculties/register-faculty`, {
                    ...facultyData,
                    role: 'Faculty'
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                showSimpleToast('Faculty created successfully!');
            }

            await fetchFaculty(); // fetchFaculty is a dependency here
            setShowModal(false);
            resetForm(); // resetForm is a dependency here
        } catch (error) {
            console.error("Error saving faculty:", error);
            showSimpleToast('Failed to save faculty');
        } finally {
            setCreating(false);
        }
    }, [isEditMode, facultyData, editingFacultyId, showSimpleToast, fetchFaculty, setShowModal, resetForm, setCreating]); // All dependencies

    // 7. Make handleEdit stable
    const handleEdit = useCallback((facultyItem) => { // Renamed param to avoid conflict with state 'faculty'
        setIsEditMode(true);
        setEditingFacultyId(facultyItem.id);
        setFacultyData({
            fullName: facultyItem.fullName,
            collegeId: facultyItem.collegeId,
            email: facultyItem.email,
            department: facultyItem.department,
            password: '' // Password should not be pre-filled for security
        });
        setShowModal(true);
    }, [setIsEditMode, setEditingFacultyId, setFacultyData, setShowModal]); // Dependencies are state setters

    // 8. Make handleDeleteFaculty stable, as it uses setConfirmBox, showUndoToast, and showSimpleToast
    const handleDeleteFaculty = useCallback((id) => {
        setConfirmBox({
            visible: true,
            message: 'Are you sure you want to delete this faculty?',
            onConfirm: async () => {
                try {
                    await axios.delete(`${BASE_URL}/Faculties/faculties/${id}`);
                    setFaculty(prev => prev.filter(f => f.id !== id));
                    setConfirmBox({ visible: false, message: '', onConfirm: null });
                    showUndoToast('Faculty deleted.', id); // showUndoToast is a dependency here
                } catch (error) {
                    console.error("Error deleting faculty:", error);
                    showSimpleToast('Failed to delete faculty'); // showSimpleToast is a dependency here
                }
            }
        });
    }, [setConfirmBox, setFaculty, showUndoToast, showSimpleToast]); // All dependencies


    // The useEffect that was causing the warning:
    useEffect(() => {
        const delay = setTimeout(() => {
            setShowLoadingIndicator(true);
        }, 400);

        fetchFaculty(); // Now fetchFaculty is a stable function reference

        return () => clearTimeout(delay);
    }, [fetchFaculty, setShowLoadingIndicator]); // Add fetchFaculty to dependencies. setShowLoadingIndicator is a setter, so it's stable.


    const filteredFaculty = faculty.filter(user => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            user.collegeId?.toLowerCase().includes(search.toLowerCase());

        const matchesDepartment =
            selectedDepartment === 'All Departments' || user.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="manage-faculty-content">
            <div className="manage-faculty-header">
                <div>
                    <h2>Manage Faculty</h2>
                    <p>View and manage all faculty users</p>
                </div>
                <button className="btn-create-faculty" onClick={() => {
                    resetForm(); // resetForm is a stable function
                    setShowModal(true);
                }}>
                   <FontAwesomeIcon icon={faUserPlus} />
                    <span className="btn-text"> Create Notice</span>
                </button>
            </div>

            <div className="faculty-filters">
                <div className="faculty-search-filter">
                    <input
                        type="text"
                        placeholder="🔍 Search by name or ID"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option>All Departments</option>
                        <option>Computer Science</option>
                        <option>Maths</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                    </select>
                </div>
            </div>
            <div className="faculty-table">

                <div className="faculty-table-header">
                    <span>Faculty</span>
                    <span>Faculty ID</span>
                    <span>Department</span>
                    <span>Actions</span>
                </div>

                {loading && showLoadingIndicator ? (
                    <div className="faculty-loading">Loading faculty...</div>
                ) : !loading && filteredFaculty.length === 0 ? (
                    <div className="faculty-no-data">No faculty found.</div>
                ) : (
                    filteredFaculty.map((user, idx) => (
                        <div className="faculty-row" key={idx}>
                            <div className="faculty-user-cell">
                                <div className="faculty-avatar">
                                    {user.fullName?.slice(0, 2).toUpperCase() || 'NA'}
                                </div>
                                <div>
                                    <strong>{user.fullName}</strong>
                                    <div className="faculty-email">{user.email}</div>
                                </div>
                            </div>
                            <span>{user.collegeId}</span>
                            <span>{user.department}</span>
                            <span className="faculty-actions">
                                <FaEdit
                                    title="Edit"
                                    onClick={() => handleEdit(user)} // handleEdit is a stable function
                                    style={{ marginRight: '10px', color: 'green', cursor: 'pointer' }}
                                />
                                <FaTrash
                                    title="Delete"
                                    onClick={() => handleDeleteFaculty(user.id)} // handleDeleteFaculty is a stable function
                                    style={{ color: 'red', cursor: 'pointer' }}
                                />
                            </span>
                        </div>
                    ))
                )}
            </div>


            {showModal && (
                <div className="faculty-modal-overlay">
                    <div className="faculty-modal">
                        <h3>{isEditMode ? 'Edit Faculty' : 'Create Faculty'}</h3>

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={facultyData.fullName}
                            onChange={(e) => setFacultyData({ ...facultyData, fullName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="College ID"
                            value={facultyData.collegeId}
                            onChange={(e) => setFacultyData({ ...facultyData, collegeId: e.target.value })}
                            readOnly={isEditMode}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={facultyData.email}
                            onChange={(e) => setFacultyData({ ...facultyData, email: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Department"
                            value={facultyData.department}
                            onChange={(e) => setFacultyData({ ...facultyData, department: e.target.value })}
                        />

                        {/* show password in create mode */}
                        {!isEditMode && (
                            <input
                                type="password"
                                placeholder="Password"
                                value={facultyData.password}
                                onChange={(e) => setFacultyData({ ...facultyData, password: e.target.value })}
                            />
                        )}

                        <div className="faculty-modal-actions">
                            <button onClick={handleCreateOrUpdateFaculty} disabled={creating}>
                                {creating ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                            </button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


            {toast && <div className="faculty-popup-message">{toast}</div>}

            {confirmBox.visible && (
                <div className="faculty-confirm-overlay">
                    <div className="faculty-confirm-box">
                        <p>{confirmBox.message}</p>
                        <div className="confirm-actions">
                            <button onClick={confirmBox.onConfirm}>Yes</button>
                            <button onClick={() => setConfirmBox({ visible: false, onConfirm: null, message: '' })}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFaculty;