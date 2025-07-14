import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('userRole');
        setToken(storedToken);
        setRole(storedRole);
        setLoading(false);
    }, []);

    if (loading) return null; // or a loader/spinner

    if (!token || !role) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role.toLowerCase())) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;
