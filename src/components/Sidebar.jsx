import React, { useEffect, useState } from 'react';
import {  NavLink } from 'react-router-dom';
//import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import './styles/sidebar.css';

const Sidebar = () => {
    //const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    //const [showGroupChatMenu, setShowGroupChatMenu] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem('userName');
        const role = localStorage.getItem('userRole');
        const dept = localStorage.getItem('department') || '';
        if (name && role) {
            setUser({ name, role: role.toLowerCase(), department: dept });
        }
        setLoading(false);
    }, []);

    //const handleLogout = () => {
    //    localStorage.clear();
    //    navigate('/login');
    //};

    const SidebarItem = ({ to, icon, label }) => (
        <li className="menu-item">
            <NavLink
                to={to}
                className={({ isActive }) => isActive ? "active-link" : ""}
                onClick={() => setSidebarOpen(false)}
            >
                <span className="icon">{icon}</span>
                <span>{label}</span>
            </NavLink>
        </li>
    );

    //const GroupChatDropdown = ({ prefix }) => (
    //    <li className="menu-item dropdown">
    //        <div className="dropdown-header" onClick={() => setShowGroupChatMenu(p => !p)}>
    //            <div className="dropdown-header-group">
    //                <span className="icon">💬</span>
    //                <span>Group Chat</span>
    //            </div>
    //            <span className="arrow">{showGroupChatMenu ? '▲' : '▼'}</span>
    //        </div>
    //        {showGroupChatMenu && (
    //            <ul className="dropdown-list">
    //                <li>
    //                    <Link to={`/${prefix}/group-chat`} onClick={() => setSidebarOpen(false)}>
    //                        🌐 Common Chat
    //                    </Link>
    //                </li>
    //                <li>
    //                    <Link to={`/chat/department/${user.department.toLowerCase()}`} onClick={() => setSidebarOpen(false)}>
    //                        🏫 {user.department} Chat
    //                    </Link>
    //                </li>
    //            </ul>
    //        )}
    //    </li>
    //);

    const renderSidebarLinks = () => {
        if (!user) return null;
        switch (user.role) {
            case 'admin':
                return (
                    <>
                        <SidebarItem to="/admin/dashboard" icon="🏠" label="Dashboard" />
                        <SidebarItem to="/admin/noticeboard" icon="📢" label="Notice Board" />
                        
                        <SidebarItem to="/admin/managefaculty" icon="👩‍🏫" label="Manage Faculty" />
                        <SidebarItem to="/admin/managestudents" icon="🎓" label="Manage Students" />
                        <SidebarItem to="/admin/profile" icon="👤" label="Profile" />
                    </>
                );
            case 'faculty':
                return (
                    <>
                        <SidebarItem to="/faculty/dashboard" icon="🏠" label="Dashboard" />
                        <SidebarItem to="/faculty/noticeboard" icon="📢" label="Notice Board" />
                        
                        <SidebarItem to="/faculty/student-approvals" icon="✅" label="Student Approvals" />
                        <SidebarItem to="/faculty/managestudents" icon="🎓" label="Manage Students" />
                        <SidebarItem to="/faculty/profile" icon="👤" label="Profile" />
                    </>
                );
            case 'student':
                return (
                    <>
                        <SidebarItem to="/student" icon="🏠" label="Dashboard" />
                        <SidebarItem to="/student/notices" icon="📢" label="Notice Board" />
                       
                        <SidebarItem to="/student/profile" icon="👤" label="Profile" />
                    </>
                );
            default:
                return null;
        }
    };

    if (loading) return null;

    return (
        <div className="sidebar-body">
            <div className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
                <FaBars />
            </div>

            <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
                {/*<div className="close-btn" onClick={() => setSidebarOpen(false)}>*/}
                {/*    <FaTimes />*/}
                {/*</div>*/}
                <ul className="menu">{renderSidebarLinks()}</ul>
                {/*<button className="logout-btn-sidebar" onClick={handleLogout}>*/}
                {/*    <FaSignOutAlt className="logout-icon" />*/}
                {/*    Logout*/}
                {/*</button>*/}
            </aside>

            
        </div>
    );
};

export default Sidebar;
