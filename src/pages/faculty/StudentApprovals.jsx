import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config";
import "./style/StudentApprovals.css";
import { FaCheckCircle, FaTimesCircle, FaUserGraduate } from "react-icons/fa";

const StudentApprovals = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

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

    const approveStudent = async (studentId) => {
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

    const rejectStudent = async (studentId) => {
        const confirm = window.confirm("Are you sure you want to reject and delete this student?");
        if (!confirm) return;

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
        <div className="main-content">
            <div className="header">
                <h2><FaUserGraduate /> Pending Student Approvals</h2>
                <p>Approve or reject students from your department</p>
            </div>

            <div className="student-table">
                <div className="table-header">
                    <span>Name</span>
                    <span>Email</span>
                    <span>College ID</span>
                    <span>Department</span>
                    <span>Batch</span>
                    <span>Actions</span>
                </div>

                {loading ? (
                    <div className="loading-row">
                        <span>Loading students...</span>
                    </div>
                ) : students.length === 0 ? (
                    <div className="no-data-row">
                        <span>No pending students to approve.</span>
                    </div>
                ) : (
                    students.map((student) => (
                        <div className="table-row" key={student.id}>
                            <span>{student.fullName}</span>
                            <span>{student.email}</span>
                            <span>{student.collegeId}</span>
                            <span>{student.department}</span>
                            <span>{student.batch}</span>
                            <span className="actions">
                                <button
                                    className="action-button approve"
                                    title="Approve"
                                    onClick={() => approveStudent(student.id)}
                                >
                                    <FaCheckCircle className="icon" />
                                </button>
                                <button
                                    className="action-button reject"
                                    title="Reject"
                                    onClick={() => rejectStudent(student.id)}
                                >
                                    <FaTimesCircle className="icon" />
                                </button>
                            </span>

                        </div>
                    ))
                )}
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    );

};

export default StudentApprovals;
