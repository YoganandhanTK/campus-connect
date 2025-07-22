import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";
import "./style/StudentApprovals.css"; // Ensure this path is correct
import { FaCheckCircle, FaTimesCircle, FaUserGraduate } from "react-icons/fa";

const StudentApprovals = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [confirmBox, setConfirmBox] = useState({
        visible: false,
        message: '',
        onConfirm: null,
        studentId: null,
        type: '' // Add a 'type' property: 'approve' or 'reject'
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/faculties/pending-students`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Artificial delay to show loader
            setTimeout(() => {
                setStudents(res.data);
                setLoading(false);
            }, 1000); // 1 second delay
        } catch (error) {
            console.error("Error fetching students:", error);
            showToast("Failed to load students.");
            setLoading(false);
        }
    };

    const handleApproveClick = (studentId) => {
        setConfirmBox({
            visible: true,
            message: "Are you sure you want to approve this student?",
            onConfirm: () => confirmApproveStudent(studentId),
            studentId: studentId,
            type: 'approve' // Set type to 'approve'
        });
    };

    const confirmApproveStudent = async (studentId) => {
        setConfirmBox({ visible: false, onConfirm: null, message: '', studentId: null, type: '' }); // Close confirm box
        try {
            await axios.put(`${BASE_URL}/faculties/approve-student/${studentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudents(prev => prev.filter(s => s.id !== studentId));
            showToast("Student approved!");
        } catch (error) {
            console.error("Approval failed:", error);
            showToast("Failed to approve student.");
        }
    };

    const handleRejectClick = (studentId) => {
        setConfirmBox({
            visible: true,
            message: "Are you sure you want to reject and delete this student? This action cannot be undone.",
            onConfirm: () => confirmRejectStudent(studentId),
            studentId: studentId,
            type: 'reject' // Set type to 'reject'
        });
    };

    const confirmRejectStudent = async (studentId) => {
        setConfirmBox({ visible: false, onConfirm: null, message: '', studentId: null, type: '' }); // Close confirm box
        try {
            await axios.delete(`${BASE_URL}/students/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStudents(prev => prev.filter(s => s.id !== studentId));
            showToast("Student rejected and deleted.");
        } catch (error) {
            console.error("Rejection failed:", error);
            showToast("Failed to reject student.");
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    return (
        <div className="student-approvals-container"> {/* Renamed from student-approvals__container */}
            <div className="student-approvals-header"> {/* Renamed from student-approvals__header */}
                <h2><FaUserGraduate />Student Approvals</h2>
                <p>Approve or reject students from your department</p>
            </div>

            <div className="student-approvals-table"> {/* Renamed from student-approvals__table */}
                <div className="student-approvals-table-header"> {/* Renamed from student-approvals__table-header */}
                    <span>Name</span>
                    <span>Email</span>
                    <span>College ID</span>
                    <span>Department</span>
                    <span>Batch</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="student-approvals-loading-row"> {/* Renamed from student-approvals__loading-row */}
                        <span>Loading students...</span>
                    </div>
                ) : students.length === 0 ? (
                    <div className="student-approvals-no-data-row"> {/* Renamed from student-approvals__no-data-row */}
                        <span>No pending students to approve.</span>
                    </div>
                ) : (
                    students.map((student) => (
                        <div className="student-approvals-table-row" key={student.id}> {/* Renamed from student-approvals__table-row */}
                            <span data-label="Name">{student.fullName}</span>
                            <span data-label="Email">{student.email}</span>
                            <span data-label="CollegeId">{student.collegeId}</span>
                            <span data-label="Department">{student.department}</span>
                            <span data-label="Batch">{student.batch}</span>
                            <span className="student-approvals-actions"> {/* Renamed from student-approvals__actions */}
                                <button
                                    className="student-approvals-action-button student-approvals-action-button-approve" 
                                    title="Approve"
                                    onClick={() => handleApproveClick(student.id)}
                                >
                                    <FaCheckCircle className="student-approvals-icon" /> {/* Renamed icon class */}
                                </button>
                                <button
                                    className="student-approvals-action-button student-approvals-action-button-reject" 
                                    title="Reject"
                                    onClick={() => handleRejectClick(student.id)}
                                >
                                    <FaTimesCircle className="student-approvals-icon" /> {/* Renamed icon class */}
                                </button>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Confirmation Box */}
            {confirmBox.visible && (
                <div className="student-approvals-confirm-overlay"> {/* Renamed from student-approvals__confirm-overlay */}
                    <div className="student-approvals-confirm-box"> {/* Renamed from student-approvals__confirm-box */}
                        <p>{confirmBox.message}</p>
                        <div className="student-approvals-confirm-actions"> {/* Renamed from student-approvals__confirm-actions */}
                            <button
                                className={`student-approvals-confirm-yes ${confirmBox.type === 'reject' ? 'student-approvals-confirm-yes-reject' : ''}`} 
                                onClick={confirmBox.onConfirm}
                            >
                                Yes
                            </button>
                            <button className="student-approvals-confirm-cancel" onClick={() => setConfirmBox({ visible: false, onConfirm: null, message: '', studentId: null, type: '' })}>Cancel</button> {/* Renamed class */}
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="student-approvals-toast">{toast}</div>} {/* Renamed from student-approvals__toast */}
        </div>
    );
};

export default StudentApprovals;