import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/navbar.css';
import BASE_URL from '../config'; // Assuming this path is correct

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignInAlt,
  faUserPlus,
  faUser
} from '@fortawesome/free-solid-svg-icons';

import { FaBars } from 'react-icons/fa'; // Import FaBars for the menu icon

import logo from '../assets/head.png'; // Assuming this path is correct

// Navbar now accepts setSidebarOpen as a prop
function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/Auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      const lowerRole = role.toLowerCase();
      if (lowerRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (lowerRole === 'student') {
        navigate('/student/dashboard');
      } else if (lowerRole === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/'); // Fallback if role is not recognized
      }
    } else {
      navigate('/'); // Navigate to landing page if not logged in
    }
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={handleLogoClick}>
        <img src={logo} alt="Campus Connect Logo" className="logo-img" />
        <span className="logo-text">Campus Connect</span>
      </div>

      <div className="nav-buttons">
        {loading ? (
          <span className="loading-msg">Checking...</span>
        ) : user ? (
          <>
            {/* User Info (always visible when logged in) */}
            <div className="user-info" onClick={() => navigate(`/${user.role?.toLowerCase()}/profile`)}>
              <FontAwesomeIcon icon={faUser} className="profile-icon" />
              <div className="user-details">
                <span className="user-name">
                  {user.fullName || user.collegeId}
                </span>
                <span className={`badge role-${user.role?.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Menu toggle button - its visibility is handled by CSS */}
            <button className="btn menu-toggle" onClick={() => setSidebarOpen(true)}>
              <span className="menu-text">Menu</span> <FaBars />
            </button>
          </>
        ) : (
          <>
            {/* Login/Register buttons (visible when logged out) */}
            <button className="btn login-btn" onClick={() => navigate('/login')}>
              <FontAwesomeIcon icon={faSignInAlt} />
              <span className="btn-text">Login</span>
            </button>
            <button className="btn register-btn" onClick={() => navigate('/register')}>
              <FontAwesomeIcon icon={faUserPlus} />
              <span className="btn-text">Register</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;