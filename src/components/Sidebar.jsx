import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTimes, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faBullhorn, faChalkboardTeacher, faUserGraduate,
  faUser, faCheck, faPuzzlePiece
} from '@fortawesome/free-solid-svg-icons';

import './styles/sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    const dept = localStorage.getItem('department') || '';
    if (name && role) {
      setUser({ name, role: role.toLowerCase(), department: dept });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    navigate('/');
  };

  const SidebarItem = ({ to, icon, label }) => (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
        onClick={() => setSidebarOpen(false)}
      >
        <FontAwesomeIcon icon={icon} className="nav-icon" />
        <span className="nav-link-text">{label}</span>
      </NavLink>
    </li>
  );

  const NavGroup = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (!sidebarOpen) setIsOpen(false); // Close group if sidebar closes
    }, [sidebarOpen]);

    return (
      <li className={`nav-group ${isOpen ? 'open' : ''}`}>
        <div className="nav-group-toggler" onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon icon={icon} className="nav-icon" />
          <span className="nav-link-text">{title}</span>
          <FaChevronDown className={`nav-group-arrow ${isOpen ? 'rotate' : ''}`} />
        </div>
        {isOpen && <ul className="nav-group-items">{children}</ul>}
      </li>
    );
  };

  const renderSidebarLinks = () => {
    if (!user) return null;

    const role = user.role;
    switch (role) {
      case 'admin':
        return (
          <>
            <SidebarItem to="/admin/dashboard" icon={faHome} label="Dashboard" />
            <SidebarItem to="/admin/noticeboard" icon={faBullhorn} label="Notice Board" />
            <SidebarItem to="/admin/managefaculty" icon={faChalkboardTeacher} label="Manage Faculty" />
            <SidebarItem to="/admin/managestudents" icon={faUserGraduate} label="Manage Students" />
            <SidebarItem to="/admin/profile" icon={faUser} label="Profile" />
          </>
        );
      case 'faculty':
        return (
          <>
            <SidebarItem to="/faculty/dashboard" icon={faHome} label="Dashboard" />
            <SidebarItem to="/faculty/notice" icon={faBullhorn} label="Notice Board" />
            <SidebarItem to="/faculty/student-approvals" icon={faCheck} label="Student Approvals" />
            <SidebarItem to="/faculty/managestudents" icon={faUserGraduate} label="Manage Students" />
            <SidebarItem to="/faculty/profile" icon={faUser} label="Profile" />
          </>
        );
      case 'student':
        return (
          <>
            <SidebarItem to="/student/dashboard" icon={faHome} label="Dashboard" />
            <SidebarItem to="/student/viewnotice" icon={faBullhorn} label="Notice Board" />
            <SidebarItem to="/student/profile" icon={faUser} label="Profile" />
          </>
        );
      default:
        return null;
    }
  };

  if (loading) return null;

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
       
        <div className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </div>
      </div>

      <ul className="nav-list">
        
        {renderSidebarLinks()}

        {user && (
          <NavGroup title="Group Chat" icon={faPuzzlePiece}>
            <li className="nav-item">
              <NavLink
                to={`/${user.role}/group-chat/common`}
                className="nav-link sub-nav-link"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon-bullet"></span> Common Chat
              </NavLink>
            </li>
            {user.department && (
              <li className="nav-item">
                <NavLink
                  to={`/${user.role}/group-chat/${user.department.toLowerCase()}`}
                  className="nav-link sub-nav-link"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon-bullet"></span> {user.department} Chat
                </NavLink>
              </li>
            )}
          </NavGroup>
        )}
      </ul>

      <button className="logout-btn-sidebar" onClick={handleLogout}>
        <FaSignOutAlt className="logout-icon" /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;