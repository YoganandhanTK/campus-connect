import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/UserProfile.css";
import BASE_URL from "../../config";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const logoutAndRedirect = useCallback(() => {
        ["token", "role", "userId", "fullName"].forEach(localStorage.removeItem);
        navigate("/login", { replace: true });
    }, [navigate]);

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${BASE_URL}/Auth/profile`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(data);
        } catch (err) {
            if (err.response?.status === 401) logoutAndRedirect();
            else {
                console.error("Profile fetch error", err);
                setError("Unable to load profile.");
            }
        } finally {
            setLoading(false);
        }
    }, [token, logoutAndRedirect]);

    useEffect(() => {
        if (!token) logoutAndRedirect();
        else fetchProfile();
    }, [token, fetchProfile, logoutAndRedirect]);

    const handleEdit = () => {
        setEditedName(user.fullName);
        setEditedEmail(user.email);
        setEditMode(true);
    };

    const handleCancel = () => setEditMode(false);

    const handleSave = async () => {
        try {
            const updateUrl =
                user.role === "admin"
                    ? `${BASE_URL}/Admins/admins/${user.id}`
                    : user.role === "faculty"
                        ? `${BASE_URL}/Faculty/${user.id}`
                        : `${BASE_URL}/Students/students/profile/${user.id}`;

            const payload = {
                fullName: editedName,
                email: editedEmail,
                department: user.department,
                ...(user.role === "faculty" && { isApproved: user.isApproved }),
            };

            await axios.put(updateUrl, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser({ ...user, fullName: editedName, email: editedEmail });
            setEditMode(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert("Update failed. Try again.");
        }
    };

    if (loading) {
        return <div className="profile-container">Loading profile…</div>;
    }

    if (error || !user) {
        return (
            <div className="profile-container">
                <p>{error || "No profile data."}</p>
                <button className="logout-btn" onClick={logoutAndRedirect}>
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2> My Profile</h2>

                <div className="profile-details">
                    <div className="profile-row">
                        <span className="label">Full Name</span>
                        <span className="label">:</span>
                        <span className="value">
                            {editMode ? (
                                <input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                user.fullName
                            )}
                        </span>
                    </div>

                    <div className="profile-row">
                        <span className="label">College ID</span>
                        <span className="label">:</span>
                        <span className="value">{user.collegeId}</span>
                    </div>

                    <div className="profile-row">
                        <span className="label">Email</span>
                        <span className="label">:</span>
                        <span className="value">
                            {editMode ? (
                                <input
                                    value={editedEmail}
                                    onChange={(e) => setEditedEmail(e.target.value)}
                                    className="edit-input"
                                />
                            ) : (
                                user.email
                            )}
                        </span>
                    </div>

                    {user.department && (
                        <div className="profile-row">
                            <span className="label">Department</span>
                            <span className="label">:</span>
                            <span className="value">{user.department}</span>
                        </div>
                    )}

                    {user.batch && (
                        <div className="profile-row">
                            <span className="label">Batch</span>
                            <span className="label">:</span>
                            <span className="value">{user.batch}</span>
                        </div>
                    )}
                </div>

                {editMode ? (
                    <div className="button-row">
                        <button className="save-btn" onClick={handleSave}>
                             Save
                        </button>
                        <button className="cancel-btn" onClick={handleCancel}>
                             Cancel
                        </button>
                    </div>
                ) : (
                    <button className="edit-btn" onClick={handleEdit}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
}
